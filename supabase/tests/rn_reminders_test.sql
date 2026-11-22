-- Rent reminder test for Galmee Rentals. Run with Supabase `execute_sql`.
-- Everything rolls back: the final RAISE carries the result line. Compare each value with its "expect".
do $$
declare ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid(); uc uuid := gen_random_uuid();
  ta uuid; tb uuid; pa uuid; u1 uuid; u2 uuid; u3 uuid; l1 uuid; l2 uuid; l3 uuid; n int; r text := ''; ok boolean; err text;
  today date := private.rn_today();
begin
  insert into auth.users(id, aud, role, email) values
    (ua,'authenticated','authenticated','rm-a@test.invalid'),(ub,'authenticated','authenticated','rm-b@test.invalid'),(uc,'authenticated','authenticated','rm-c@test.invalid');
  insert into public.tenants(name, vertical) values ('RM A','rentals') returning id into ta;
  insert into public.tenants(name, vertical) values ('RM B','rentals') returning id into tb;
  insert into public.profiles(user_id, tenant_id, full_name, role) values (ua, ta, 'A owner','owner'), (ub, tb, 'B owner','owner'), (uc, ta, 'A desk','staff');
  perform set_config('role','authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  insert into public.rn_properties(name) values ('A compound') returning id into pa;
  insert into public.rn_units(property_id, label, monthly_rent) values (pa, '1', 2000) returning id into u1;
  insert into public.rn_units(property_id, label, monthly_rent) values (pa, '2', 3000) returning id into u2;
  insert into public.rn_units(property_id, label, monthly_rent) values (pa, '3', 4000) returning id into u3;
  l1 := public.rn_start_lease(u1, 'Due soon', '0911000001', today - 30, 2000, 1);
  l2 := public.rn_start_lease(u2, 'Due today', '0911000002', today - 30, 3000, 1);
  l3 := public.rn_start_lease(u3, 'No phone', null, today - 30, 4000, 1);
  -- Pin each lease's open rent months: one unpaid month due in 3 days, one due today, one due in 3 days without a phone.
  reset role;
  update public.rn_rent_invoices set voided = true where lease_id in (l1, l2, l3);
  insert into public.rn_rent_invoices(tenant_id, lease_id, eth_year, eth_month, due_on, amount) values
    (ta, l1, 2099, 1, today + 3, 2000), (ta, l1, 2099, 2, today + 20, 2000), (ta, l2, 2099, 1, today, 3000), (ta, l3, 2099, 1, today + 3, 4000);
  perform set_config('role','authenticated', true);

  r := r || 'queued=' || public.rn_queue_reminders() || ' (expect 2: due-soon before, due-today due); ';
  r := r || 'again=' || public.rn_queue_reminders() || ' (expect 0, idempotent); ';
  select string_agg(to_addr, ',' order by to_addr) into err from public.notifications where tenant_id = ta;
  r := r || 'texted=' || coalesce(err, '-') || ' (expect 0911000001,0911000002); ';
  select string_agg(kind, ',' order by kind) into err from public.rn_reminders; r := r || 'kinds=' || coalesce(err, '-') || ' (expect before,due); ';
  select body into err from public.notifications where tenant_id = ta and to_addr = '0911000001'; r := r || 'body=' || err || '; ';
  perform public.rn_record_payment(l1, 2000, 'cash', null, gen_random_uuid());
  reset role;
  r := r || 'all after paid=' || private.rn_queue_reminders_all() || ' (expect 0: paid month and sent ones skipped); ';
  perform set_config('role','authenticated', true);

  perform set_config('request.jwt.claims', json_build_object('sub', uc, 'role','authenticated')::text, true);
  begin perform public.rn_queue_reminders(); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'staff queues=' || ok || ' err=' || err || ' (expect false, not_allowed); ';
  begin insert into public.rn_reminders(invoice_id, kind) select id, 'due' from public.rn_rent_invoices where lease_id = l3 limit 1; ok := true; exception when others then ok := false; end;
  r := r || 'staff direct insert=' || ok || ' (expect false); ';

  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  select count(*) into n from public.rn_reminders; r := r || 'B sees A reminders=' || n || ' (expect 0); ';
  r := r || 'B queues=' || public.rn_queue_reminders() || ' (expect 0); ';
  perform set_config('role','anon', true);
  begin perform public.rn_queue_reminders(); ok := true; exception when others then ok := false; end;
  r := r || 'anon queues=' || ok || ' (expect false); ';

  raise exception 'RESULT %', r;
end $$;
