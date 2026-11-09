-- Demo data for the demo tenant only: 4 properties, 30 units, 25 tenants, 3 months of rent history with a few late payers.
create or replace function private.rn_load_demo() returns void
language plpgsql security definer set search_path = public, private as $$
declare
  v_tenant uuid := private.rn_require_tenant();
  v_names text[] := array['Hawi Tufa','Boru Dida','Saba Kedir','Jiru Bekele','Lensa Abdi','Tolosa Gemechu','Meron Ayele','Chala Hordofa','Bontu Regassa','Dawit Lemma','Sifan Jemal','Abebe Tola','Kebebush Wolde','Gadisa Fikadu','Marta Sisay','Obsa Teshome','Rahel Mulu','Fayisa Ibsa','Tigist Kassa','Lemi Gutema','Hana Negash','Ifa Bedasa','Samuel Worku','Ayantu Debela','Nardos Getu'];
  v_props text[] := array['Bole Compound','Awasho Shops','Kebele 04 Rooms','Arada Apartments'];
  v_counts int[] := array[10, 6, 8, 6];
  v_prop uuid; v_unit uuid; v_lease uuid; v_rent numeric; v_months int; v_billed int; v_kind text; n int := 0; i int; j int;
  v_today date := private.rn_today();
begin
  perform private.rn_require_manager();
  if (select name from tenants where id = v_tenant) <> 'Galmee Rentals Demo' then raise exception 'not_demo_tenant'; end if;
  if exists (select 1 from rn_properties where tenant_id = v_tenant) then raise exception 'already_loaded'; end if;
  for i in 1..4 loop
    insert into rn_properties(tenant_id, name, address) values (v_tenant, v_props[i], 'Shashamane') returning id into v_prop;
    v_kind := case when i = 2 then 'shop' when i = 4 then 'apartment' else 'room' end;
    for j in 1..v_counts[i] loop
      n := n + 1;
      v_rent := case when i = 2 then 6000 else 2500 end + (n % 5) * 500;
      insert into rn_units(tenant_id, property_id, label, kind, monthly_rent) values (v_tenant, v_prop, j::text, v_kind, v_rent) returning id into v_unit;
      continue when n > 25;
      v_lease := private.rn_start_lease(v_unit, v_names[n], '09' || lpad((11200000 + n * 137)::text, 8, '0'), v_today - 100, v_rent, 5, v_rent * 2, null);
      select count(*) into v_billed from rn_rent_invoices where lease_id = v_lease;
      -- Most tenants are paid up, a few are one or two months behind, one has paid ahead.
      v_months := case when n % 7 = 0 then v_billed - 2 when n % 11 = 0 then v_billed - 1 when n = 3 then v_billed + 2 else v_billed end;
      if v_months > 0 then
        perform private.rn_record_payment(v_lease, v_rent * v_months, (case when n % 3 = 0 then 'telebirr' else 'cash' end)::pay_method, null, null);
      end if;
    end loop;
  end loop;
end $$;
revoke all on function private.rn_load_demo() from public, anon;
grant execute on function private.rn_load_demo() to authenticated;

create or replace function public.rn_load_demo() returns void
language sql security invoker set search_path = public, private as $$ select private.rn_load_demo() $$;
revoke all on function public.rn_load_demo() from public, anon;
grant execute on function public.rn_load_demo() to authenticated;
