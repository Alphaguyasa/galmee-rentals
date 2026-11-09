-- Rent schedule: one line per invoice with who and where, for the month view.
create view public.rn_invoice_board with (security_invoker = true) as
select
  i.id, i.tenant_id, i.lease_id, i.eth_year, i.eth_month, i.due_on, i.amount, i.paid, i.balance,
  c.name as tenant_name, u.label as unit_label, p.name as property_name
from public.rn_rent_invoices i
join public.rn_leases l on l.id = i.lease_id
join public.customers c on c.id = l.customer_id
join public.rn_units u on u.id = l.unit_id
join public.rn_properties p on p.id = u.property_id
where not i.voided;
revoke all on public.rn_invoice_board from anon;
grant select on public.rn_invoice_board to authenticated;
