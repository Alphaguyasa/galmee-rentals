-- Rent receipts: gapless receipt numbers per landlord (series 'rent' -> "RENT-000001") and a stored
-- snapshot of what each payment covered, so a reprint always shows the same lines and totals.

create table if not exists public.rn_receipt_counters (
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  series text not null check (series ~ '^[a-z]{1,4}$'),
  next_no bigint not null default 1 check (next_no >= 1),
  primary key (tenant_id, series)
);
alter table public.rn_receipt_counters enable row level security;
revoke insert, update, delete, truncate on public.rn_receipt_counters from anon, authenticated;
grant select on public.rn_receipt_counters to authenticated;
drop policy if exists rn_receipt_counters_read on public.rn_receipt_counters;
create policy rn_receipt_counters_read on public.rn_receipt_counters for select to authenticated
  using (tenant_id = (select private.current_tenant()) and (select private.current_app_role())::text in ('owner','manager'));

-- The counter row stays locked by the UPDATE until the payment's transaction ends, so concurrent payments
-- wait for each other and a rolled-back payment gives its number back.
create or replace function private.rn_next_receipt_no(p_series text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_tenant uuid := private.core_require_tenant(); v_no bigint;
begin
  if p_series is null or p_series !~ '^[a-z]{1,4}$' then raise exception 'bad_series' using errcode = '22023'; end if;
  insert into public.rn_receipt_counters(tenant_id, series) values (v_tenant, p_series) on conflict do nothing;
  update public.rn_receipt_counters set next_no = next_no + 1
    where tenant_id = v_tenant and series = p_series
    returning next_no - 1 into v_no;
  return upper(p_series) || '-' || lpad(v_no::text, 6, '0');
end $$;
revoke all on function private.rn_next_receipt_no(text) from public, anon, authenticated;

alter table public.rn_payments add column if not exists receipt_no text;
-- Snapshot: {"months":[{"y":2018,"m":3,"amount":2000}], "advance": 0, "balance_after": 0}
alter table public.rn_payments add column if not exists receipt jsonb;
create unique index if not exists rn_payments_receipt_no_key on public.rn_payments(tenant_id, receipt_no) where receipt_no is not null;

-- Existing payments get numbers in the order they were taken, per landlord.
with numbered as (
  select id, tenant_id, row_number() over (partition by tenant_id order by created_at, id) as n
  from public.rn_payments where receipt_no is null
)
update public.rn_payments p set receipt_no = 'RENT-' || lpad(numbered.n::text, 6, '0')
from numbered where p.id = numbered.id;
insert into public.rn_receipt_counters(tenant_id, series, next_no)
select tenant_id, 'rent', count(*) + 1 from public.rn_payments group by tenant_id
on conflict (tenant_id, series) do update set next_no = excluded.next_no;

create or replace function private.rn_record_payment(p_lease uuid, p_amount numeric, p_method pay_method, p_reference text, p_client_ref uuid)
returns uuid language plpgsql security definer set search_path = public, private as $$
declare
  v_tenant uuid := private.rn_require_tenant();
  v_lease rn_leases%rowtype;
  v_open numeric;
  v_left numeric := p_amount;
  v_take numeric;
  v_pay uuid;
  v_id uuid;
  v_no text;
  v_months jsonb := '[]'::jsonb;
  i record;
begin
  if p_client_ref is not null then
    select id into v_id from rn_payments where tenant_id = v_tenant and client_ref = p_client_ref;
    if found then return v_id; end if;
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 100000000 then raise exception 'bad_amount'; end if;
  select * into v_lease from rn_leases where id = p_lease and tenant_id = v_tenant for update;
  if not found then raise exception 'lease_not_found'; end if;
  select coalesce(sum(balance), 0) into v_open from rn_rent_invoices where lease_id = p_lease and not voided;
  if v_lease.status <> 'active' and p_amount > v_open then raise exception 'overpayment'; end if;

  v_no := private.rn_next_receipt_no('rent');
  insert into payments(tenant_id, customer_id, amount, method, reference, ref_table, ref_id, user_id)
  values (v_tenant, v_lease.customer_id, p_amount, p_method, nullif(btrim(p_reference), ''), 'rn_leases', p_lease, auth.uid())
  returning id into v_pay;
  insert into rn_payments(tenant_id, lease_id, payment_id, amount, method, reference, client_ref, receipt_no)
  values (v_tenant, p_lease, v_pay, p_amount, p_method, nullif(btrim(p_reference), ''), p_client_ref, v_no) returning id into v_id;

  for i in select id, eth_year, eth_month, balance from rn_rent_invoices where lease_id = p_lease and balance > 0 and not voided order by due_on for update loop
    exit when v_left <= 0;
    v_take := least(v_left, i.balance);
    update rn_rent_invoices set paid = paid + v_take where id = i.id;
    insert into credit_ledger(tenant_id, customer_id, type, amount, ref_table, ref_id, user_id)
    values (v_tenant, v_lease.customer_id, 'repayment', v_take, 'rn_rent_invoices', i.id, auth.uid());
    v_months := v_months || jsonb_build_object('y', i.eth_year, 'm', i.eth_month, 'amount', v_take);
    v_left := v_left - v_take;
  end loop;
  if v_left > 0 then update rn_leases set advance = advance + v_left where id = p_lease; end if;

  update rn_payments set receipt = jsonb_build_object(
    'months', v_months,
    'advance', greatest(v_left, 0),
    'balance_after', (select coalesce(sum(balance), 0) from rn_rent_invoices where lease_id = p_lease and not voided)
  ) where id = v_id;
  return v_id;
end $$;
