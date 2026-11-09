-- Galmee Rentals schema: properties, units, leases, rent invoices, rent payments, broker listings and client requests.
-- Leases, invoices and payments are written only through RPCs (see rn_rpcs migration).

create table public.rn_properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  address text check (char_length(address) <= 200),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, name),
  unique (tenant_id, id)
);

create table public.rn_units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  property_id uuid not null,
  label text not null check (char_length(btrim(label)) between 1 and 40),
  kind text not null default 'room' check (kind in ('room','apartment','house','shop','office')),
  monthly_rent numeric(12,2) not null check (monthly_rent >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, property_id, label),
  unique (tenant_id, id),
  foreign key (tenant_id, property_id) references public.rn_properties(tenant_id, id)
);
create index rn_units_property_idx on public.rn_units (tenant_id, property_id);

create table public.rn_leases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  unit_id uuid not null,
  customer_id uuid not null references public.customers(id),
  start_on date not null,
  end_on date,
  monthly_rent numeric(12,2) not null check (monthly_rent > 0),
  due_day smallint not null check (due_day between 1 and 30),
  deposit numeric(12,2) not null default 0 check (deposit >= 0),
  advance numeric(12,2) not null default 0 check (advance >= 0),
  status text not null default 'active' check (status in ('active','ended')),
  client_ref uuid,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  check (end_on is null or end_on >= start_on),
  check (status = 'active' or end_on is not null),
  unique (tenant_id, client_ref),
  unique (tenant_id, id),
  foreign key (tenant_id, unit_id) references public.rn_units(tenant_id, id)
);
create index rn_leases_unit_idx on public.rn_leases (tenant_id, unit_id);
create index rn_leases_customer_idx on public.rn_leases (customer_id);
-- A unit has at most one tenant at a time.
create unique index rn_leases_one_active on public.rn_leases (unit_id) where status = 'active';

create table public.rn_rent_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  lease_id uuid not null,
  eth_year int not null,
  eth_month int not null check (eth_month between 1 and 12),
  due_on date not null,
  amount numeric(12,2) not null check (amount > 0),
  paid numeric(12,2) not null default 0 check (paid >= 0),
  balance numeric(12,2) generated always as (amount - paid) stored,
  voided boolean not null default false,
  created_at timestamptz not null default now(),
  check (paid <= amount),
  unique (lease_id, eth_year, eth_month),
  unique (tenant_id, id),
  foreign key (tenant_id, lease_id) references public.rn_leases(tenant_id, id)
);
create index rn_rent_invoices_tenant_lease_idx on public.rn_rent_invoices (tenant_id, lease_id);
create index rn_rent_invoices_due_idx on public.rn_rent_invoices (tenant_id, due_on);

create table public.rn_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  lease_id uuid not null,
  payment_id uuid not null references public.payments(id),
  amount numeric(12,2) not null check (amount > 0),
  method pay_method not null,
  reference text check (char_length(reference) <= 80),
  client_ref uuid,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (tenant_id, client_ref),
  foreign key (tenant_id, lease_id) references public.rn_leases(tenant_id, id)
);
create index rn_payments_lease_idx on public.rn_payments (tenant_id, lease_id);
create index rn_payments_payment_idx on public.rn_payments (payment_id);

create table public.rn_listings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 120),
  deal text not null default 'rent' check (deal in ('rent','sale')),
  kind text not null default 'house' check (kind in ('room','apartment','house','shop','office','land')),
  area text check (char_length(area) <= 80),
  bedrooms int check (bedrooms between 0 and 50),
  price numeric(14,2) not null check (price > 0),
  owner_name text check (char_length(owner_name) <= 120),
  owner_phone text check (char_length(owner_phone) <= 20),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  unique (tenant_id, id)
);
create index rn_listings_tenant_idx on public.rn_listings (tenant_id, status);

create table public.rn_client_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default private.current_tenant() references public.tenants(id) on delete cascade,
  client_name text not null check (char_length(btrim(client_name)) between 2 and 120),
  client_phone text check (char_length(client_phone) <= 20),
  deal text not null default 'rent' check (deal in ('rent','sale')),
  kind text check (kind in ('room','apartment','house','shop','office','land')),
  area text check (char_length(area) <= 80),
  min_bedrooms int check (min_bedrooms between 0 and 50),
  max_price numeric(14,2) not null check (max_price > 0),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
create index rn_client_requests_tenant_idx on public.rn_client_requests (tenant_id, status);

alter table public.rn_properties enable row level security;
alter table public.rn_units enable row level security;
alter table public.rn_leases enable row level security;
alter table public.rn_rent_invoices enable row level security;
alter table public.rn_payments enable row level security;
alter table public.rn_listings enable row level security;
alter table public.rn_client_requests enable row level security;

revoke all on public.rn_properties, public.rn_units, public.rn_leases, public.rn_rent_invoices, public.rn_payments, public.rn_listings, public.rn_client_requests from anon;
revoke insert, update, delete, truncate on public.rn_leases, public.rn_rent_invoices, public.rn_payments from authenticated;
revoke delete, truncate on public.rn_properties, public.rn_units, public.rn_listings, public.rn_client_requests from authenticated;

create policy rn_properties_sel on public.rn_properties for select to authenticated using (tenant_id = (select private.current_tenant()));
create policy rn_properties_ins on public.rn_properties for insert to authenticated
  with check (tenant_id = (select private.current_tenant()) and (select private.current_app_role()) in ('owner','manager'));
create policy rn_properties_upd on public.rn_properties for update to authenticated
  using (tenant_id = (select private.current_tenant()) and (select private.current_app_role()) in ('owner','manager'))
  with check (tenant_id = (select private.current_tenant()));

create policy rn_units_sel on public.rn_units for select to authenticated using (tenant_id = (select private.current_tenant()));
create policy rn_units_ins on public.rn_units for insert to authenticated
  with check (tenant_id = (select private.current_tenant()) and (select private.current_app_role()) in ('owner','manager'));
create policy rn_units_upd on public.rn_units for update to authenticated
  using (tenant_id = (select private.current_tenant()) and (select private.current_app_role()) in ('owner','manager'))
  with check (tenant_id = (select private.current_tenant()));

create policy rn_leases_sel on public.rn_leases for select to authenticated using (tenant_id = (select private.current_tenant()));
create policy rn_rent_invoices_sel on public.rn_rent_invoices for select to authenticated using (tenant_id = (select private.current_tenant()));
create policy rn_payments_sel on public.rn_payments for select to authenticated using (tenant_id = (select private.current_tenant()));

create policy rn_listings_sel on public.rn_listings for select to authenticated using (tenant_id = (select private.current_tenant()));
create policy rn_listings_ins on public.rn_listings for insert to authenticated with check (tenant_id = (select private.current_tenant()));
create policy rn_listings_upd on public.rn_listings for update to authenticated
  using (tenant_id = (select private.current_tenant())) with check (tenant_id = (select private.current_tenant()));

create policy rn_client_requests_sel on public.rn_client_requests for select to authenticated using (tenant_id = (select private.current_tenant()));
create policy rn_client_requests_ins on public.rn_client_requests for insert to authenticated with check (tenant_id = (select private.current_tenant()));
create policy rn_client_requests_upd on public.rn_client_requests for update to authenticated
  using (tenant_id = (select private.current_tenant())) with check (tenant_id = (select private.current_tenant()));

-- One line per lease: who, where, what they owe and how late they are.
create view public.rn_lease_board with (security_invoker = true) as
select
  l.id, l.tenant_id, l.unit_id, l.customer_id, c.name as tenant_name, c.phone as tenant_phone,
  u.label as unit_label, u.kind as unit_kind, u.property_id, p.name as property_name,
  l.start_on, l.end_on, l.status, l.monthly_rent, l.due_day, l.deposit, l.advance,
  coalesce(i.open_balance, 0) as open_balance,
  coalesce(i.overdue, 0) as overdue,
  i.oldest_overdue_on,
  coalesce(i.overdue_count, 0)::int as overdue_count,
  i.next_due_on
from public.rn_leases l
join public.customers c on c.id = l.customer_id
join public.rn_units u on u.id = l.unit_id
join public.rn_properties p on p.id = u.property_id
left join lateral (
  select
    sum(balance) as open_balance,
    sum(balance) filter (where due_on < (now() at time zone 'Africa/Addis_Ababa')::date) as overdue,
    min(due_on) filter (where due_on < (now() at time zone 'Africa/Addis_Ababa')::date) as oldest_overdue_on,
    count(*) filter (where due_on < (now() at time zone 'Africa/Addis_Ababa')::date) as overdue_count,
    min(due_on) filter (where due_on >= (now() at time zone 'Africa/Addis_Ababa')::date) as next_due_on
  from public.rn_rent_invoices where lease_id = l.id and balance > 0 and not voided
) i on true;
revoke all on public.rn_lease_board from anon;
grant select on public.rn_lease_board to authenticated;

-- One line per unit, vacant or occupied.
create view public.rn_unit_board with (security_invoker = true) as
select
  u.id, u.tenant_id, u.property_id, p.name as property_name, u.label, u.kind, u.monthly_rent, u.active,
  b.id as lease_id, b.tenant_name, b.tenant_phone, b.overdue, b.oldest_overdue_on, b.next_due_on
from public.rn_units u
join public.rn_properties p on p.id = u.property_id
left join public.rn_lease_board b on b.unit_id = u.id and b.status = 'active';
revoke all on public.rn_unit_board from anon;
grant select on public.rn_unit_board to authenticated;

-- Broker mode: every open request with the open listings that fit it.
create view public.rn_listing_matches with (security_invoker = true) as
select
  r.id as request_id, r.tenant_id, l.id as listing_id, l.title, l.deal, l.kind, l.area, l.bedrooms, l.price, l.owner_name, l.owner_phone
from public.rn_client_requests r
join public.rn_listings l on l.tenant_id = r.tenant_id and l.deal = r.deal and l.status = 'open'
where r.status = 'open'
  and (r.kind is null or r.kind = l.kind)
  and l.price <= r.max_price
  and (r.min_bedrooms is null or coalesce(l.bedrooms, 0) >= r.min_bedrooms)
  and (r.area is null or l.area ilike '%' || r.area || '%');
revoke all on public.rn_listing_matches from anon;
grant select on public.rn_listing_matches to authenticated;
