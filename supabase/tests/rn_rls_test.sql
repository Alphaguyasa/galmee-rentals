-- Cross-tenant RLS and workflow test for Galmee Rentals. Run with Supabase `execute_sql`.
-- Everything rolls back: the final RAISE carries the result line. Compare each value with its "expect".
do $$
declare ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid(); uc uuid := gen_random_uuid();
  ta uuid; tb uuid; pa uuid; pb uuid; ua1 uuid; ua2 uuid; ub1 uuid; la uuid; lb uuid; l2 uuid; n int; r text := ''; ok boolean; err text; v numeric; d date; a int[];
  today date := (now() at time zone 'Africa/Addis_Ababa')::date;
  ref uuid := '55555555-5555-5555-5555-555555555555';
begin
  a := private.rn_to_ethiopian('2026-11-09'); r := r || 'eth=' || a::text || ' (expect {2019,2,30}); ';
  r := r || 'greg=' || private.rn_from_ethiopian(2019,2,30) || ' (expect 2026-11-09); ';
  a := private.rn_to_ethiopian('2023-09-11'); r := r || 'eth newyear=' || a::text || ' (expect {2015,13,6}); ';
  a := private.rn_to_ethiopian('2023-09-12'); r := r || 'eth after leap=' || a::text || ' (expect {2016,1,1}); ';

  insert into auth.users(id, aud, role, email) values
    (ua,'authenticated','authenticated','rn-a@test.invalid'),(ub,'authenticated','authenticated','rn-b@test.invalid'),(uc,'authenticated','authenticated','rn-c@test.invalid');
  insert into public.tenants(name, vertical) values ('RN A','rentals') returning id into ta;
  insert into public.tenants(name, vertical) values ('RN B','rentals') returning id into tb;
  insert into public.profiles(user_id, tenant_id, full_name, role) values (ua, ta, 'A owner','owner'), (ub, tb, 'B owner','owner'), (uc, ta, 'A desk','staff');

  perform set_config('role','authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  insert into public.rn_properties(name) values ('B house') returning id into pb;
  insert into public.rn_units(property_id, label, monthly_rent) values (pb, '1', 500) returning id into ub1;
  lb := public.rn_start_lease(ub1, 'Renter B', '0911000002', today, 500, 1);

  perform set_config('request.jwt.claims', json_build_object('sub', uc, 'role','authenticated')::text, true);
  begin insert into public.rn_properties(name) values ('Staff house'); ok := true; exception when others then ok := false; end;
  r := r || 'staff add property=' || ok || ' (expect false); ';

  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  insert into public.rn_properties(name) values ('A house') returning id into pa;
  insert into public.rn_units(property_id, label, monthly_rent) values (pa, '1', 3000) returning id into ua1;
  insert into public.rn_units(property_id, label, monthly_rent) values (pa, '2', 2000) returning id into ua2;
  begin insert into public.rn_units(property_id, label, monthly_rent) values (pb, 'x', 1); ok := true; exception when others then ok := false; end;
  r := r || 'A unit on B property=' || ok || ' (expect false); ';

  perform set_config('request.jwt.claims', json_build_object('sub', uc, 'role','authenticated')::text, true);
  begin perform public.rn_start_lease(ua1, 'Staff lease', null, today, 3000, 1); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'staff start lease=' || ok || ' err=' || err || ' (expect false, not_allowed); ';

  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  -- Starts on Meskerem 5 of last Ethiopian year's month 12-ish: three months back from today.
  la := public.rn_start_lease(ua1, 'Renter A', '0911000001', today - 75, 3000, 5, 6000, ref);
  r := r || 'lease idempotent=' || (public.rn_start_lease(ua1, 'Renter A', '0911000001', today - 75, 3000, 5, 6000, ref) = la) || ' (expect true); ';
  select count(*) into n from public.rn_rent_invoices where lease_id = la;
  r := r || 'backfilled invoices=' || n || ' (expect 3 or 4); ';
  r := r || 'regenerate adds=' || public.rn_generate_invoices() || ' (expect 0); ';
  begin perform public.rn_start_lease(ua1, 'Second', null, today, 3000, 1); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'unit occupied=' || ok || ' err=' || err || ' (expect false, unit_occupied); ';
  begin perform public.rn_start_lease(ub1, 'Foreign', null, today, 3000, 1); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'A leases B unit=' || ok || ' err=' || err || ' (expect false, unit_not_found); ';

  select sum(amount), count(*) into v, n from public.rn_rent_invoices where lease_id = la;
  r := r || 'billed=' || v || ' rows=' || n || ' (3000 per row); ';
  select count(*) into n from public.rn_lease_board where id = la and overdue > 0; r := r || 'board overdue row=' || n || ' (expect 1); ';

  perform set_config('request.jwt.claims', json_build_object('sub', uc, 'role','authenticated')::text, true);
  perform public.rn_record_payment(la, 3500, 'telebirr', 'TX1', '66666666-6666-6666-6666-666666666666');
  perform public.rn_record_payment(la, 3500, 'telebirr', 'TX1', '66666666-6666-6666-6666-666666666666');
  select sum(paid) into v from public.rn_rent_invoices where lease_id = la; r := r || 'paid idempotent=' || v || ' (expect 3500.00); ';
  select paid into v from public.rn_rent_invoices where lease_id = la order by due_on limit 1; r := r || 'oldest paid=' || v || ' (expect 3000.00); ';
  select paid into v from public.rn_rent_invoices where lease_id = la order by due_on offset 1 limit 1; r := r || 'second paid=' || v || ' (expect 500.00); ';
  select balance into v from public.customer_balances where customer_id = (select customer_id from public.rn_leases where id = la);
  select sum(balance) - v into v from public.rn_rent_invoices where lease_id = la; r := r || 'ledger matches invoices diff=' || v || ' (expect 0.00); ';

  -- Prepaid rent is held and spent on the next invoice.
  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  l2 := public.rn_start_lease(ua2, 'Renter C', null, today, 2000, 1);
  perform public.rn_record_payment(l2, 5000, 'cash');
  select advance into v from public.rn_leases where id = l2; r := r || 'advance=' || v || ' (expect 3000.00); ';
  select sum(balance) into v from public.rn_rent_invoices where lease_id = l2; r := r || 'l2 open=' || v || ' (expect 0.00); ';

  -- Writes that must go through RPCs.
  begin update public.rn_rent_invoices set paid = amount where lease_id = la; ok := true; exception when others then ok := false; end;
  r := r || 'direct invoice write=' || ok || ' (expect false); ';
  begin update public.rn_leases set advance = 99999 where id = la; ok := true; exception when others then ok := false; end;
  r := r || 'direct lease write=' || ok || ' (expect false); ';
  begin insert into public.rn_payments(lease_id, payment_id, amount, method) values (la, gen_random_uuid(), 1, 'cash'); ok := true; exception when others then ok := false; end;
  r := r || 'direct payment write=' || ok || ' (expect false); ';

  -- Ending a lease frees the unit; the debt stays.
  perform public.rn_end_lease(l2, today);
  select count(*) into n from public.rn_unit_board where id = ua2 and lease_id is null; r := r || 'unit vacant after end=' || n || ' (expect 1); ';
  begin perform public.rn_record_payment(l2, 1); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'overpay ended lease=' || ok || ' err=' || err || ' (expect false, overpayment); ';

  -- Broker matching.
  insert into public.rn_listings(title, deal, kind, area, bedrooms, price) values ('Fit', 'rent', 'house', 'Awasho', 3, 8000), ('Too dear', 'rent', 'house', 'Awasho', 3, 20000), ('Wrong kind', 'rent', 'shop', 'Awasho', 0, 5000);
  insert into public.rn_client_requests(client_name, deal, kind, area, min_bedrooms, max_price) values ('Client', 'rent', 'house', 'awasho', 2, 10000);
  select count(*) into n from public.rn_listing_matches; r := r || 'matches=' || n || ' (expect 1); ';

  -- Other tenant sees nothing and can change nothing.
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  select count(*) into n from public.rn_lease_board where tenant_id = ta; r := r || 'B reads A leases=' || n || ' (expect 0); ';
  select count(*) into n from public.rn_unit_board where tenant_id = ta; r := r || 'B reads A units=' || n || ' (expect 0); ';
  select count(*) into n from public.rn_rent_invoices where tenant_id = ta; r := r || 'B reads A invoices=' || n || ' (expect 0); ';
  select count(*) into n from public.rn_payments where tenant_id = ta; r := r || 'B reads A payments=' || n || ' (expect 0); ';
  select count(*) into n from public.rn_listings where tenant_id = ta; r := r || 'B reads A listings=' || n || ' (expect 0); ';
  select count(*) into n from public.rn_listing_matches where tenant_id = ta; r := r || 'B reads A matches=' || n || ' (expect 0); ';
  update public.rn_units set monthly_rent = 1 where id = ua1; get diagnostics n = row_count; r := r || 'B updates A unit=' || n || ' (expect 0); ';
  begin perform public.rn_record_payment(la, 1); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'B pays A=' || ok || ' err=' || err || ' (expect false, lease_not_found); ';
  begin perform public.rn_end_lease(la, today); ok := true; exception when others then ok := false; err := sqlerrm; end;
  r := r || 'B ends A lease=' || ok || ' err=' || err || ' (expect false, lease_not_found); ';

  -- Anon.
  perform set_config('role','anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin select count(*) into n from public.rn_lease_board; ok := true; exception when others then ok := false; end;
  r := r || 'anon board=' || ok || ' (expect false); ';
  begin perform public.rn_record_payment(la, 1); ok := true; exception when others then ok := false; end;
  r := r || 'anon pay=' || ok || ' (expect false); ';
  begin perform private.rn_generate_all(); ok := true; exception when others then ok := false; end;
  r := r || 'anon generate all=' || ok || ' (expect false); ';

  raise exception 'RESULT: %', r;
end $$;
