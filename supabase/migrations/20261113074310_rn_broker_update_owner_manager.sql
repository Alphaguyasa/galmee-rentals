-- Broker stock-in-trade (listings and client requests): only owners and managers
-- may update. Staff keep insert, so they can still record new listings and requests.
drop policy if exists rn_listings_upd on public.rn_listings;
create policy rn_listings_upd on public.rn_listings for update to authenticated
  using (tenant_id = (select private.current_tenant()) and (select private.current_app_role()) = any (array['owner'::user_role, 'manager'::user_role]))
  with check (tenant_id = (select private.current_tenant()));
drop policy if exists rn_client_requests_upd on public.rn_client_requests;
create policy rn_client_requests_upd on public.rn_client_requests for update to authenticated
  using (tenant_id = (select private.current_tenant()) and (select private.current_app_role()) = any (array['owner'::user_role, 'manager'::user_role]))
  with check (tenant_id = (select private.current_tenant()));
