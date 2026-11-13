-- Seeker auto-match: open "rent" client requests are matched against the landlord's own vacant doors.
-- When a rental ends, every matching seeker with a phone number gets one SMS row in notifications.
-- rn_vacancy_alerts makes it once per (door, seeker), so repeating the call never double-texts.

create table public.rn_vacancy_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.rn_units(id) on delete cascade,
  request_id uuid not null references public.rn_client_requests(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (unit_id, request_id)
);
create index rn_vacancy_alerts_tenant_idx on public.rn_vacancy_alerts (tenant_id);
create index rn_vacancy_alerts_request_idx on public.rn_vacancy_alerts (request_id);
create index rn_vacancy_alerts_notification_idx on public.rn_vacancy_alerts (notification_id);
alter table public.rn_vacancy_alerts enable row level security;
-- Read-only for the business; rows are written only by private.rn_alert_seekers.
create policy rn_vacancy_alerts_sel on public.rn_vacancy_alerts for select to authenticated
  using (tenant_id = (select private.current_tenant()));
revoke insert, update, delete on public.rn_vacancy_alerts from anon, authenticated;

-- Vacant door x open rent request. Doors carry no bedroom count, so a request asking for 2+ bedrooms
-- only matches apartments and houses. Area is matched against the property name and address.
create view public.rn_vacancy_matches with (security_invoker = true) as
select u.id as unit_id, u.tenant_id, u.label as unit_label, u.kind as unit_kind, u.monthly_rent,
       p.id as property_id, p.name as property_name,
       r.id as request_id, r.client_name, r.client_phone, r.max_price,
       exists (select 1 from rn_vacancy_alerts a where a.unit_id = u.id and a.request_id = r.id) as alerted
from rn_units u
join rn_properties p on p.id = u.property_id and p.tenant_id = u.tenant_id and p.active
join rn_client_requests r on r.tenant_id = u.tenant_id and r.status = 'open' and r.deal = 'rent'
where u.active
  and not exists (select 1 from rn_leases l where l.unit_id = u.id and l.status = 'active')
  and (r.kind is null or r.kind = u.kind)
  and u.monthly_rent <= r.max_price
  and (r.min_bedrooms is null or r.min_bedrooms <= 1 or u.kind in ('apartment', 'house'))
  and (r.area is null or p.name ilike '%' || r.area || '%' or coalesce(p.address, '') ilike '%' || r.area || '%');
grant select on public.rn_vacancy_matches to authenticated;

-- Queues one SMS per matching seeker not yet told about this door. Returns how many were queued.
create function private.rn_alert_seekers_for(p_tenant uuid, p_unit uuid) returns integer
language plpgsql security definer set search_path = public, private as $$
declare
  v_business text;
  v_count integer := 0;
  v_note uuid;
  m record;
begin
  select name into v_business from tenants where id = p_tenant;
  for m in
    select * from rn_vacancy_matches
    where tenant_id = p_tenant and unit_id = p_unit and not alerted
      and client_phone is not null and length(trim(client_phone)) > 0
  loop
    insert into notifications (tenant_id, channel, to_addr, body, status)
    values (p_tenant, 'sms', m.client_phone,
      left(format('%s: %s %s ክፍት ነው፣ %s ብር በወር። Free to rent: %s %s, %s birr/month.',
        v_business, m.property_name, m.unit_label, to_char(m.monthly_rent, 'FM999G999G990'),
        m.property_name, m.unit_label, to_char(m.monthly_rent, 'FM999G999G990')), 300),
      'queued')
    returning id into v_note;
    insert into rn_vacancy_alerts (tenant_id, unit_id, request_id, notification_id)
    values (p_tenant, p_unit, m.request_id, v_note)
    on conflict (unit_id, request_id) do nothing;
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;
revoke all on function private.rn_alert_seekers_for(uuid, uuid) from public, anon, authenticated;

-- Owner/manager: text matching seekers about a vacant door now.
create function private.rn_alert_seekers(p_unit uuid) returns integer
language plpgsql security definer set search_path = public, private as $$
declare
  v_tenant uuid := private.rn_require_tenant();
begin
  perform private.rn_require_manager();
  if not exists (select 1 from rn_units where id = p_unit and tenant_id = v_tenant and active) then
    raise exception 'unit_not_found';
  end if;
  if exists (select 1 from rn_leases where unit_id = p_unit and status = 'active') then
    raise exception 'unit_occupied';
  end if;
  return private.rn_alert_seekers_for(v_tenant, p_unit);
end $$;
revoke all on function private.rn_alert_seekers(uuid) from public, anon;
grant execute on function private.rn_alert_seekers(uuid) to authenticated;

create function public.rn_alert_seekers(p_unit uuid) returns integer
language sql security invoker set search_path = public, private as $$ select private.rn_alert_seekers(p_unit) $$;
revoke all on function public.rn_alert_seekers(uuid) from public, anon;
grant execute on function public.rn_alert_seekers(uuid) to authenticated;

-- Automatic: the moment a rental ends, the door's matching seekers are queued.
create function private.rn_lease_ended_alert() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.rn_alert_seekers_for(new.tenant_id, new.unit_id);
  return null;
end $$;
revoke all on function private.rn_lease_ended_alert() from public, anon, authenticated;

create trigger rn_leases_ended_alert
  after update of status on public.rn_leases
  for each row when (old.status = 'active' and new.status = 'ended')
  execute function private.rn_lease_ended_alert();
