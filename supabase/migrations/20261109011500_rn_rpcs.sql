-- Galmee Rentals server logic. Writes run as private SECURITY DEFINER functions with explicit
-- tenant and role checks; each is exposed through a SECURITY INVOKER wrapper.

create function private.rn_require_tenant() returns uuid
language plpgsql stable set search_path = public, private as $$
declare v uuid := private.current_tenant();
begin
  if v is null then raise exception 'not_a_member' using errcode = '42501'; end if;
  return v;
end $$;
revoke all on function private.rn_require_tenant() from public, anon;
grant execute on function private.rn_require_tenant() to authenticated;

create function private.rn_require_manager() returns void
language plpgsql stable set search_path = public, private as $$
begin
  if private.current_app_role() not in ('owner','manager') then raise exception 'not_allowed' using errcode = '42501'; end if;
end $$;
revoke all on function private.rn_require_manager() from public, anon;
grant execute on function private.rn_require_manager() to authenticated;

-- Ethiopian calendar, same arithmetic as src/lib/ethiopian-date.ts. Returns {year, month, day}.
create function private.rn_to_ethiopian(p_day date) returns int[]
language sql immutable set search_path = '' as $$
  with a as (select to_char(p_day, 'J')::int - 1723856 as k),
  b as (select k, ((k % 1461) + 1461) % 1461 as r from a),
  c as (select k, r, (r % 365) + 365 * (r / 1460) as n from b)
  select array[
    4 * floor(k / 1461.0)::int + (r / 365) - (r / 1460),
    (n / 30) + 1,
    (n % 30) + 1
  ] from c
$$;
revoke all on function private.rn_to_ethiopian(date) from public, anon;

create function private.rn_from_ethiopian(p_year int, p_month int, p_day int) returns date
language sql immutable set search_path = '' as $$
  select to_date((1723856 + 365 + 365 * (p_year - 1) + floor(p_year / 4.0)::int + 30 * p_month + p_day - 31)::text, 'J')
$$;
revoke all on function private.rn_from_ethiopian(int, int, int) from public, anon;

-- Creates the invoices a lease is missing, up to and including the Ethiopian month of p_today.
-- Pagume (month 13) is not billed: rent runs twelve months a year. Prepaid rent settles new invoices first.
create function private.rn_generate_for_lease(p_lease uuid, p_today date) returns int
language plpgsql set search_path = public, private as $$
declare
  v_lease rn_leases%rowtype;
  v_start int[]; v_now int[]; v_y int; v_m int;
  v_due date; v_id uuid; v_take numeric; v_count int := 0;
begin
  select * into v_lease from rn_leases where id = p_lease for update;
  if not found or v_lease.status <> 'active' then return 0; end if;
  v_start := private.rn_to_ethiopian(v_lease.start_on);
  v_now := private.rn_to_ethiopian(p_today);
  v_y := v_start[1]; v_m := least(v_start[2], 12);
  while (v_y, v_m) <= (v_now[1], least(v_now[2], 12)) loop
    v_due := greatest(private.rn_from_ethiopian(v_y, v_m, v_lease.due_day), v_lease.start_on);
    insert into rn_rent_invoices(tenant_id, lease_id, eth_year, eth_month, due_on, amount)
    values (v_lease.tenant_id, v_lease.id, v_y, v_m, v_due, v_lease.monthly_rent)
    on conflict (lease_id, eth_year, eth_month) do nothing
    returning id into v_id;
    if v_id is not null then
      insert into credit_ledger(tenant_id, customer_id, type, amount, due_date, ref_table, ref_id, user_id)
      values (v_lease.tenant_id, v_lease.customer_id, 'debt', v_lease.monthly_rent, v_due, 'rn_rent_invoices', v_id, auth.uid());
      v_take := least(v_lease.advance, v_lease.monthly_rent);
      if v_take > 0 then
        update rn_rent_invoices set paid = paid + v_take where id = v_id;
        insert into credit_ledger(tenant_id, customer_id, type, amount, ref_table, ref_id, user_id)
        values (v_lease.tenant_id, v_lease.customer_id, 'repayment', v_take, 'rn_rent_invoices', v_id, auth.uid());
        v_lease.advance := v_lease.advance - v_take;
      end if;
      v_count := v_count + 1;
    end if;
    v_id := null;
    if v_m >= 12 then v_y := v_y + 1; v_m := 1; else v_m := v_m + 1; end if;
  end loop;
  update rn_leases set advance = v_lease.advance where id = v_lease.id and advance <> v_lease.advance;
  return v_count;
end $$;
revoke all on function private.rn_generate_for_lease(uuid, date) from public, anon, authenticated;

create function private.rn_today() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'Africa/Addis_Ababa')::date $$;
revoke all on function private.rn_today() from public, anon;

-- Every active lease of every tenant. Safe to run repeatedly; meant for a daily schedule.
create function private.rn_generate_all() returns int
language plpgsql security definer set search_path = public, private as $$
declare r record; v_total int := 0;
begin
  for r in select id from rn_leases where status = 'active' loop
    v_total := v_total + private.rn_generate_for_lease(r.id, private.rn_today());
  end loop;
  return v_total;
end $$;
revoke all on function private.rn_generate_all() from public, anon, authenticated;

create function private.rn_generate_invoices() returns int
language plpgsql security definer set search_path = public, private as $$
declare v_tenant uuid := private.rn_require_tenant(); r record; v_total int := 0;
begin
  for r in select id from rn_leases where tenant_id = v_tenant and status = 'active' loop
    v_total := v_total + private.rn_generate_for_lease(r.id, private.rn_today());
  end loop;
  return v_total;
end $$;
revoke all on function private.rn_generate_invoices() from public, anon;
grant execute on function private.rn_generate_invoices() to authenticated;

create function public.rn_generate_invoices() returns int
language sql security invoker set search_path = public, private as $$ select private.rn_generate_invoices() $$;
revoke all on function public.rn_generate_invoices() from public, anon;
grant execute on function public.rn_generate_invoices() to authenticated;

-- Moves a tenant into a vacant unit and bills the rent since the start date.
create function private.rn_start_lease(
  p_unit uuid, p_name text, p_phone text, p_start date, p_rent numeric, p_due_day int, p_deposit numeric, p_client_ref uuid
) returns uuid language plpgsql security definer set search_path = public, private as $$
declare
  v_tenant uuid := private.rn_require_tenant();
  v_unit rn_units%rowtype;
  v_customer uuid;
  v_id uuid;
  v_phone text := nullif(btrim(p_phone), '');
  v_rent numeric := p_rent;
begin
  perform private.rn_require_manager();
  if p_client_ref is not null then
    select id into v_id from rn_leases where tenant_id = v_tenant and client_ref = p_client_ref;
    if found then return v_id; end if;
  end if;
  if char_length(coalesce(btrim(p_name), '')) < 2 then raise exception 'name_required'; end if;
  if p_start is null or p_start > private.rn_today() + 90 or p_start < private.rn_today() - 730 then raise exception 'bad_date'; end if;
  if p_due_day is null or p_due_day not between 1 and 30 then raise exception 'bad_due_day'; end if;
  if p_deposit is null or p_deposit < 0 then raise exception 'bad_amount'; end if;
  select * into v_unit from rn_units where id = p_unit and tenant_id = v_tenant for update;
  if not found or not v_unit.active then raise exception 'unit_not_found'; end if;
  v_rent := coalesce(p_rent, v_unit.monthly_rent);
  if v_rent is null or v_rent <= 0 then raise exception 'bad_amount'; end if;
  if exists (select 1 from rn_leases where unit_id = p_unit and status = 'active') then raise exception 'unit_occupied'; end if;
  if v_phone is not null then
    select id into v_customer from customers where tenant_id = v_tenant and phone = v_phone order by created_at limit 1;
  end if;
  if v_customer is null then
    insert into customers(tenant_id, name, phone) values (v_tenant, btrim(p_name), v_phone) returning id into v_customer;
  end if;
  insert into rn_leases(tenant_id, unit_id, customer_id, start_on, monthly_rent, due_day, deposit, client_ref)
  values (v_tenant, p_unit, v_customer, p_start, v_rent, p_due_day, p_deposit, p_client_ref) returning id into v_id;
  perform private.rn_generate_for_lease(v_id, private.rn_today());
  return v_id;
end $$;
revoke all on function private.rn_start_lease(uuid, text, text, date, numeric, int, numeric, uuid) from public, anon;
grant execute on function private.rn_start_lease(uuid, text, text, date, numeric, int, numeric, uuid) to authenticated;

create function public.rn_start_lease(
  p_unit uuid, p_name text, p_phone text, p_start date, p_rent numeric, p_due_day int, p_deposit numeric default 0, p_client_ref uuid default null
) returns uuid language sql security invoker set search_path = public, private as $$
  select private.rn_start_lease(p_unit, p_name, p_phone, p_start, p_rent, p_due_day, p_deposit, p_client_ref)
$$;
revoke all on function public.rn_start_lease(uuid, text, text, date, numeric, int, numeric, uuid) from public, anon;
grant execute on function public.rn_start_lease(uuid, text, text, date, numeric, int, numeric, uuid) to authenticated;

-- Ends a lease. Unpaid rent due after the end date is cancelled; what is already due stays owed.
create function private.rn_end_lease(p_lease uuid, p_end date) returns void
language plpgsql security definer set search_path = public, private as $$
declare
  v_tenant uuid := private.rn_require_tenant();
  v_lease rn_leases%rowtype;
  i record;
begin
  perform private.rn_require_manager();
  select * into v_lease from rn_leases where id = p_lease and tenant_id = v_tenant for update;
  if not found then raise exception 'lease_not_found'; end if;
  if v_lease.status <> 'active' then raise exception 'lease_not_active'; end if;
  if p_end is null or p_end < v_lease.start_on or p_end > private.rn_today() + 90 then raise exception 'bad_date'; end if;
  for i in select id, amount from rn_rent_invoices where lease_id = p_lease and due_on > p_end and paid = 0 and not voided for update loop
    update rn_rent_invoices set voided = true where id = i.id;
    insert into credit_ledger(tenant_id, customer_id, type, amount, note, ref_table, ref_id, user_id)
    values (v_tenant, v_lease.customer_id, 'repayment', i.amount, 'cancelled rent after lease end', 'rn_rent_invoices', i.id, auth.uid());
  end loop;
  update rn_leases set status = 'ended', end_on = p_end where id = p_lease;
end $$;
revoke all on function private.rn_end_lease(uuid, date) from public, anon;
grant execute on function private.rn_end_lease(uuid, date) to authenticated;

create function public.rn_end_lease(p_lease uuid, p_end date) returns void
language sql security invoker set search_path = public, private as $$ select private.rn_end_lease(p_lease, p_end) $$;
revoke all on function public.rn_end_lease(uuid, date) from public, anon;
grant execute on function public.rn_end_lease(uuid, date) to authenticated;

-- Takes rent: oldest open invoice first, anything over that is held as prepaid rent. Idempotent on client_ref.
create function private.rn_record_payment(p_lease uuid, p_amount numeric, p_method pay_method, p_reference text, p_client_ref uuid) returns uuid
language plpgsql security definer set search_path = public, private as $$
declare
  v_tenant uuid := private.rn_require_tenant();
  v_lease rn_leases%rowtype;
  v_open numeric;
  v_left numeric := p_amount;
  v_take numeric;
  v_pay uuid;
  v_id uuid;
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

  insert into payments(tenant_id, customer_id, amount, method, reference, ref_table, ref_id, user_id)
  values (v_tenant, v_lease.customer_id, p_amount, p_method, nullif(btrim(p_reference), ''), 'rn_leases', p_lease, auth.uid())
  returning id into v_pay;
  insert into rn_payments(tenant_id, lease_id, payment_id, amount, method, reference, client_ref)
  values (v_tenant, p_lease, v_pay, p_amount, p_method, nullif(btrim(p_reference), ''), p_client_ref) returning id into v_id;

  for i in select id, balance from rn_rent_invoices where lease_id = p_lease and balance > 0 and not voided order by due_on for update loop
    exit when v_left <= 0;
    v_take := least(v_left, i.balance);
    update rn_rent_invoices set paid = paid + v_take where id = i.id;
    insert into credit_ledger(tenant_id, customer_id, type, amount, ref_table, ref_id, user_id)
    values (v_tenant, v_lease.customer_id, 'repayment', v_take, 'rn_rent_invoices', i.id, auth.uid());
    v_left := v_left - v_take;
  end loop;
  if v_left > 0 then update rn_leases set advance = advance + v_left where id = p_lease; end if;
  return v_id;
end $$;
revoke all on function private.rn_record_payment(uuid, numeric, pay_method, text, uuid) from public, anon;
grant execute on function private.rn_record_payment(uuid, numeric, pay_method, text, uuid) to authenticated;

create function public.rn_record_payment(p_lease uuid, p_amount numeric, p_method pay_method default 'cash', p_reference text default null, p_client_ref uuid default null) returns uuid
language sql security invoker set search_path = public, private as $$ select private.rn_record_payment(p_lease, p_amount, p_method, p_reference, p_client_ref) $$;
revoke all on function public.rn_record_payment(uuid, numeric, pay_method, text, uuid) from public, anon;
grant execute on function public.rn_record_payment(uuid, numeric, pay_method, text, uuid) to authenticated;
