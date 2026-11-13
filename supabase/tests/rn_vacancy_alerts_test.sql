-- Seeker auto-match test for Galmee Rentals. Run with Supabase `execute_sql`.
-- Everything rolls back: the final RAISE carries the result line. Compare each value with its "expect".
do $$
declare ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid(); uc uuid := gen_random_uuid();
  ta uuid; tb uuid; pa uuid; pb uuid; u1 uuid; u2 uuid; ubu uuid; la uuid; rq uuid; n int; r text := ''; ok boolean; err text;
  today date := (now() at time zone 'Africa/Addis_Ababa')::date;
begin
  insert into auth.users(id, aud, role, email) values
    (ua,'authenticated','authenticated','va-a@test.invalid'),(ub,'authenticated','authenticated','va-b@test.invalid'),(uc,'authenticated','authenticated','va-c@test.invalid');
  insert into public.tenants(name, vertical) values ('VA A','rentals') returning id into ta;
  insert into public.tenants(name, vertical) values ('VA B','rentals') returning id into tb;
  insert into public.profiles(user_id, tenant_id, full_name, role) values (ua, ta, 'A owner','owner'), (ub, tb, 'B owner','owner'), (uc, ta, 'A desk','staff');
  perform set_config('role','authenticated', true);

  -- B: a vacant cheap door and a seeker of its own.
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  insert into public.rn_properties(name, address) values ('B yard', 'Kebele 05') returning id into pb;
  insert into public.rn_units(property_id, label, monthly_rent) values (pb, 'B1', 500) returning id into ubu;
  insert into public.rn_client_requests(client_name, client_phone, deal, max_price) values ('B seeker', '0911000009', 'rent', 9000);

  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  insert into public.rn_properties(name, address) values ('A compound', 'Kebele 05, Shashamane') returning id into pa;
  insert into public.rn_units(property_id, label, kind, monthly_rent) values (pa, '1', 'room', 2000) returning id into u1;
  insert into public.rn_units(property_id, label, kind, monthly_rent) values (pa, '2', 'shop', 2000) returning id into u2;
  la := public.rn_start_lease(u1, 'Renter A', '0911000001', today - 10, 2000, 1);
  insert into public.rn_client_requests(client_name, client_phone, deal, kind, area, max_price) values ('Room seeker', '0911000002', 'rent', 'room', 'kebele 05', 2500) returning id into rq;
  insert into public.rn_client_requests(client_name, client_phone, deal, kind, max_price) values ('Too cheap', '0911000003', 'rent', 'room', 1500);
  insert into public.rn_client_requests(client_name, client_phone, deal, kind, max_price) values ('Buyer', '0911000004', 'sale', 'room', 9000);
  insert into public.rn_client_requests(client_name, client_phone, deal, kind, area, max_price) values ('Wrong area', '0911000005', 'rent', 'room', 'Hawassa', 9000);
  insert into public.rn_client_requests(client_name, deal, kind, max_price) values ('No phone', 'rent', 'room', 9000);
  insert into public.rn_client_requests(client_name, client_phone, deal, kind, min_bedrooms, max_price) values ('Wants 2 bed', '0911000006', 'rent', 'room', 2, 9000);

  select count(*) into n from public.rn_vacancy_matches where unit_id = u1; r := r || 'occupied door matches=' || n || ' (expect 0); ';
  select count(*) into n from public.rn_vacancy_matches; r := r || 'A sees matches=' || n || ' (expect 0: shop has no seeker, room occupied); ';
  select count(*) into n from public.rn_vacancy_matches where tenant_id = tb; r := r || 'A sees B matches=' || n || ' (expect 0); ';

  select count(*) into n from public.notifications where tenant_id = ta; r := r || 'notes before=' || n || ' (expect 0); ';
  perform public.rn_end_lease(la, today);
  select count(*) into n from public.notifications where tenant_id = ta and channel = 'sms' and status = 'queued'; r := r || 'end lease queued sms=' || n || ' (expect 1: only the room seeker in the area within budget with a phone); ';
  select string_agg(to_addr, ',' order by to_addr) into err from public.notifications where tenant_id = ta; r := r || 'texted=' || coalesce(err, '-') || ' (expect 0911000002); ';
  select count(*) into n from public.rn_vacancy_alerts where unit_id = u1; r := r || 'alert rows=' || n || ' (expect 1); ';
  select count(*) into n from public.rn_vacancy_matches where unit_id = u1 and not alerted; r := r || 'unalerted left=' || n || ' (expect 1: no phone); ';
  r := r || 'manual again=' || public.rn_alert_seekers(u1) || ' (expect 0, idempotent); ';
  select body into err from public.notifications where tenant_id = ta limit 1; r := r || 'body=' || err || '; ';

  begin perform public.rn_alert_seekers(ubu); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'A alerts B door=' || ok || ' err=' || err || ' (expect false, unit_not_found); ';
  la := public.rn_start_lease(u1, 'Renter A2', null, today, 2000, 1);
  begin perform public.rn_alert_seekers(u1); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'alert occupied=' || ok || ' err=' || err || ' (expect false, unit_occupied); ';

  perform set_config('request.jwt.claims', json_build_object('sub', uc, 'role','authenticated')::text, true);
  begin perform public.rn_alert_seekers(u2); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'staff alert=' || ok || ' err=' || err || ' (expect false, not_allowed); ';
  begin insert into public.rn_vacancy_alerts(unit_id, request_id) values (u2, rq); ok := true; exception when others then ok := false; end;
  r := r || 'staff direct alert insert=' || ok || ' (expect false); ';
  update public.rn_client_requests set status = 'closed' where id = rq; get diagnostics n = row_count;
  r := r || 'staff close request rows=' || n || ' (expect 0 once the broker update policy is owner/manager only); ';

  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  select count(*) into n from public.rn_vacancy_alerts; r := r || 'B sees A alerts=' || n || ' (expect 0); ';
  perform set_config('role','anon', true);
  begin select count(*) into n from public.rn_vacancy_matches; ok := n > 0; exception when others then ok := false; end;
  r := r || 'anon reads matches=' || ok || ' (expect false); ';

  raise exception 'RESULT %', r;
end $$;
