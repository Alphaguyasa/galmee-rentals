-- rn_receipts test. Run with Supabase `execute_sql`; it RAISES so everything rolls back.
do $$
declare ua uuid := gen_random_uuid(); uc uuid := gen_random_uuid(); ub uuid := gen_random_uuid();
  ta uuid; tb uuid; pa uuid; pb uuid; ua1 uuid; ub1 uuid; la uuid; lb uuid; p1 uuid; p2 uuid; p3 uuid; pbx uuid;
  r text := ''; n int; t text; j jsonb; msg text;
  today date := (now() at time zone 'Africa/Addis_Ababa')::date;
begin
  insert into auth.users(id, aud, role, email) values
    (ua,'authenticated','authenticated','rn-rc-a@test.invalid'), (uc,'authenticated','authenticated','rn-rc-c@test.invalid'),
    (ub,'authenticated','authenticated','rn-rc-b@test.invalid');
  insert into public.tenants(name, vertical) values ('RC A','rentals') returning id into ta;
  insert into public.tenants(name, vertical) values ('RC B','rentals') returning id into tb;
  insert into public.profiles(user_id, tenant_id, full_name, role) values (ua, ta, 'A owner','owner'), (uc, ta, 'A desk','staff'), (ub, tb, 'B owner','owner');
  perform set_config('role','authenticated', true);

  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  insert into public.rn_properties(name) values ('B house') returning id into pb;
  insert into public.rn_units(property_id, label, monthly_rent) values (pb, '1', 500) returning id into ub1;
  lb := public.rn_start_lease(ub1, 'Renter B', '0911000002', today, 500, 1);

  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  insert into public.rn_properties(name) values ('A house') returning id into pa;
  insert into public.rn_units(property_id, label, monthly_rent) values (pa, '1', 3000) returning id into ua1;
  la := public.rn_start_lease(ua1, 'Renter A', '0911000001', today - 75, 3000, 5);

  -- Staff takes rent: numbers start at RENT-000001 for a new landlord, the snapshot lists the months paid.
  perform set_config('request.jwt.claims', json_build_object('sub', uc, 'role','authenticated')::text, true);
  p1 := public.rn_record_payment(la, 4000, 'cash', null, '77777777-7777-7777-7777-777777777777');
  select receipt_no, receipt into t, j from public.rn_payments where id = p1;
  r := r || 'first=' || t || ' (expect RENT-000001); ';
  r := r || 'months in snapshot=' || jsonb_array_length(j->'months') || ' (expect 2); ';
  r := r || 'first month amount=' || (j->'months'->0->>'amount') || ' (expect 3000.00); ';
  -- Replaying the same payment returns it and draws no number.
  p3 := public.rn_record_payment(la, 4000, 'cash', null, '77777777-7777-7777-7777-777777777777');
  r := r || 'replay same payment=' || (p3 = p1) || ' (expect true); ';
  p2 := public.rn_record_payment(la, 100, 'telebirr', 'TX9');
  select receipt_no into t from public.rn_payments where id = p2; r := r || 'second=' || t || ' (expect RENT-000002); ';
  -- A refused payment gives its number back.
  begin perform public.rn_record_payment(la, 0); msg := 'ran'; exception when others then msg := sqlerrm; end;
  r := r || 'zero amount=' || msg || ' (expect bad_amount); ';
  p3 := public.rn_record_payment(la, 50, 'cash');
  select receipt_no into t from public.rn_payments where id = p3; r := r || 'after refusal=' || t || ' (expect RENT-000003); ';
  -- Clients cannot change a number, read the counter as staff, or draw a number.
  begin update public.rn_payments set receipt_no = 'RENT-999999' where id = p1; exception when others then null; end;
  select receipt_no into t from public.rn_payments where id = p1; r := r || 'staff edits number=' || t || ' (expect RENT-000001); ';
  select count(*) into n from public.rn_receipt_counters; r := r || 'staff sees counter=' || n || ' (expect 0); ';
  begin perform private.rn_next_receipt_no('rent'); msg := 'ran'; exception when others then msg := left(sqlerrm, 17); end;
  r := r || 'client draws number=' || msg || ' (expect permission denied); ';
  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role','authenticated')::text, true);
  select next_no::int into n from public.rn_receipt_counters where series = 'rent'; r := r || 'owner counter next=' || n || ' (expect 4); ';

  -- The other landlord has its own series and sees none of A's payments.
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role','authenticated')::text, true);
  select count(*) into n from public.rn_payments where tenant_id = ta; r := r || 'B sees A payments=' || n || ' (expect 0); ';
  pbx := public.rn_record_payment(lb, 500, 'cash');
  select receipt_no into t from public.rn_payments where id = pbx; r := r || 'B first=' || t || ' (expect RENT-000001); ';

  perform set_config('role','anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin select count(*) into n from public.rn_receipt_counters; msg := n::text; exception when others then msg := left(sqlerrm, 17); end;
  r := r || 'anon read counter=' || msg || ' (expect 0 or permission denied); ';
  raise exception 'RN_RECEIPTS_TEST_RESULTS: %', r;
end $$;
