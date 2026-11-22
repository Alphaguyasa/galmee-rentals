-- Rent reminders: one SMS row in notifications 3 days before a month's rent is due and one on the due date,
-- for every unpaid rent month of an active rental whose tenant has a phone number.
-- rn_reminders makes it once per (rent month, kind), so the generator is safe to run any number of times.
-- The 3-days-before reminder also goes out 1 or 2 days before when a day was missed.

create table public.rn_reminders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  invoice_id uuid not null references public.rn_rent_invoices(id) on delete cascade,
  kind text not null check (kind in ('before', 'due')),
  notification_id uuid references public.notifications(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (invoice_id, kind)
);
create index rn_reminders_tenant_idx on public.rn_reminders (tenant_id);
create index rn_reminders_notification_idx on public.rn_reminders (notification_id);
alter table public.rn_reminders enable row level security;
-- Read-only for the business; rows are written only by private.rn_queue_reminders_for.
create policy rn_reminders_sel on public.rn_reminders for select to authenticated
  using (tenant_id = (select private.current_tenant()));
revoke insert, update, delete on public.rn_reminders from anon, authenticated;

create function private.rn_queue_reminders_for(p_tenant uuid, p_today date) returns integer
language plpgsql security definer set search_path = public, private as $$
declare
  v_business text;
  v_count integer := 0;
  v_note uuid;
  v_kind text;
  i record;
begin
  select name into v_business from tenants where id = p_tenant;
  for i in
    select ri.id, ri.due_on, ri.balance, c.phone, u.label as unit_label, p.name as property_name
    from rn_rent_invoices ri
    join rn_leases l on l.id = ri.lease_id and l.tenant_id = ri.tenant_id and l.status = 'active'
    join customers c on c.id = l.customer_id
    join rn_units u on u.id = l.unit_id
    join rn_properties p on p.id = u.property_id
    where ri.tenant_id = p_tenant and not ri.voided and ri.balance > 0
      and ri.due_on between p_today and p_today + 3
      and c.phone is not null and length(trim(c.phone)) > 0
    order by ri.due_on
  loop
    v_kind := case when i.due_on = p_today then 'due' else 'before' end;
    continue when exists (select 1 from rn_reminders where invoice_id = i.id and kind = v_kind);
    insert into notifications (tenant_id, channel, to_addr, body, status)
    values (p_tenant, 'sms', i.phone,
      left(case v_kind
        when 'due' then format('%s: የ%s %s ኪራይ %s ብር ዛሬ ይከፈላል። Rent for %s %s, %s birr, is due today.',
          v_business, i.property_name, i.unit_label, to_char(i.balance, 'FM999G999G990'),
          i.property_name, i.unit_label, to_char(i.balance, 'FM999G999G990'))
        else format('%s: የ%s %s ኪራይ %s ብር በ%s ቀን ይከፈላል። Rent for %s %s, %s birr, is due in %s days.',
          v_business, i.property_name, i.unit_label, to_char(i.balance, 'FM999G999G990'), i.due_on - p_today,
          i.property_name, i.unit_label, to_char(i.balance, 'FM999G999G990'), i.due_on - p_today)
        end, 300),
      'queued')
    returning id into v_note;
    insert into rn_reminders (tenant_id, invoice_id, kind, notification_id) values (p_tenant, i.id, v_kind, v_note);
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;
revoke all on function private.rn_queue_reminders_for(uuid, date) from public, anon, authenticated;

-- Every rentals business. Meant for the same daily schedule as private.rn_generate_all().
create function private.rn_queue_reminders_all() returns integer
language plpgsql security definer set search_path = public, private as $$
declare t record; v_total integer := 0;
begin
  for t in select distinct tenant_id from rn_leases where status = 'active' loop
    v_total := v_total + private.rn_queue_reminders_for(t.tenant_id, private.rn_today());
  end loop;
  return v_total;
end $$;
revoke all on function private.rn_queue_reminders_all() from public, anon, authenticated;

-- Owner/manager: queue today's reminders now. Returns how many were queued.
create function private.rn_queue_reminders() returns integer
language plpgsql security definer set search_path = public, private as $$
declare v_tenant uuid := private.rn_require_tenant();
begin
  perform private.rn_require_manager();
  return private.rn_queue_reminders_for(v_tenant, private.rn_today());
end $$;
revoke all on function private.rn_queue_reminders() from public, anon;
grant execute on function private.rn_queue_reminders() to authenticated;

create function public.rn_queue_reminders() returns integer
language sql security invoker set search_path = public, private as $$ select private.rn_queue_reminders() $$;
revoke all on function public.rn_queue_reminders() from public, anon;
grant execute on function public.rn_queue_reminders() to authenticated;
