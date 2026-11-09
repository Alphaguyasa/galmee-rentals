import "server-only";
import { rentalErrorKey } from "@/lib/rental-errors";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/database.types";

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

function fail(error: { message: string; code?: string } | null): { ok: false; error: string } {
  if (error?.code === "42501") return { ok: false, error: "not_allowed" };
  if (error?.code === "23505") return { ok: false, error: "name_taken" };
  return { ok: false, error: rentalErrorKey(error?.message) };
}

/** Commas and parentheses would break a PostgREST `or` filter; wildcards would widen it. */
function safeTerm(q: string) {
  return q.replace(/[,()%_*\\]/g, " ").trim();
}

const n = (v: number | null | undefined) => v ?? 0;

export type UnitFilter = "all" | "vacant" | "late";

export type UnitRow = {
  id: string;
  propertyId: string;
  propertyName: string;
  label: string;
  kind: string;
  monthlyRent: number;
  leaseId: string | null;
  tenantName: string | null;
  overdue: number;
  oldestOverdueOn: string | null;
};

export async function listUnits(q: string, filter: UnitFilter): Promise<UnitRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("rn_unit_board")
    .select("id, property_id, property_name, label, kind, monthly_rent, lease_id, tenant_name, overdue, oldest_overdue_on")
    .eq("active", true);
  const term = safeTerm(q);
  if (term) query = query.or(`tenant_name.ilike.%${term}%,tenant_phone.ilike.%${term}%,label.ilike.%${term}%,property_name.ilike.%${term}%`);
  if (filter === "vacant") query = query.is("lease_id", null);
  if (filter === "late") query = query.gt("overdue", 0);
  const { data, error } = await query.order("property_name").order("label").limit(500);
  if (error) throw error;
  return data.map((u) => ({
    id: u.id!,
    propertyId: u.property_id!,
    propertyName: u.property_name!,
    label: u.label!,
    kind: u.kind!,
    monthlyRent: n(u.monthly_rent),
    leaseId: u.lease_id,
    tenantName: u.tenant_name,
    overdue: n(u.overdue),
    oldestOverdueOn: u.oldest_overdue_on,
  }));
}

export type PropertyRow = { id: string; name: string; address: string | null };

export async function listProperties(): Promise<PropertyRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("rn_properties").select("id, name, address").eq("active", true).order("name");
  if (error) throw error;
  return data;
}

export async function getUnit(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("rn_unit_board").select("id, property_name, label, kind, monthly_rent, lease_id").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id!, propertyName: data.property_name!, label: data.label!, kind: data.kind!, monthlyRent: n(data.monthly_rent), leaseId: data.lease_id };
}

export type LateRow = {
  leaseId: string;
  tenantName: string;
  tenantPhone: string | null;
  propertyName: string;
  unitLabel: string;
  overdue: number;
  months: number;
  oldestOverdueOn: string;
};

export async function listLate(): Promise<LateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rn_lease_board")
    .select("id, tenant_name, tenant_phone, property_name, unit_label, overdue, overdue_count, oldest_overdue_on")
    .gt("overdue", 0)
    .order("oldest_overdue_on")
    .limit(300);
  if (error) throw error;
  return data.map((l) => ({
    leaseId: l.id!,
    tenantName: l.tenant_name!,
    tenantPhone: l.tenant_phone,
    propertyName: l.property_name!,
    unitLabel: l.unit_label!,
    overdue: n(l.overdue),
    months: n(l.overdue_count),
    oldestOverdueOn: l.oldest_overdue_on!,
  }));
}

export type InvoiceRow = { id: string; ethYear: number; ethMonth: number; dueOn: string; amount: number; paid: number; balance: number };

export type LeaseCard = {
  id: string;
  tenantName: string;
  tenantPhone: string | null;
  propertyName: string;
  unitLabel: string;
  status: string;
  startOn: string;
  endOn: string | null;
  monthlyRent: number;
  dueDay: number;
  deposit: number;
  advance: number;
  openBalance: number;
  overdue: number;
  nextDueOn: string | null;
  invoices: InvoiceRow[];
  payments: { id: string; amount: number; method: Enums<"pay_method">; reference: string | null; createdAt: string }[];
};

export async function getLease(id: string): Promise<LeaseCard | null> {
  const supabase = await createClient();
  const [board, invoices, payments] = await Promise.all([
    supabase
      .from("rn_lease_board")
      .select("id, tenant_name, tenant_phone, property_name, unit_label, status, start_on, end_on, monthly_rent, due_day, deposit, advance, open_balance, overdue, next_due_on")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("rn_rent_invoices").select("id, eth_year, eth_month, due_on, amount, paid, balance").eq("lease_id", id).eq("voided", false).order("due_on", { ascending: false }).limit(60),
    supabase.from("rn_payments").select("id, amount, method, reference, created_at").eq("lease_id", id).order("created_at", { ascending: false }).limit(60),
  ]);
  if (board.error) throw board.error;
  if (invoices.error) throw invoices.error;
  if (payments.error) throw payments.error;
  const l = board.data;
  if (!l) return null;
  return {
    id: l.id!,
    tenantName: l.tenant_name!,
    tenantPhone: l.tenant_phone,
    propertyName: l.property_name!,
    unitLabel: l.unit_label!,
    status: l.status!,
    startOn: l.start_on!,
    endOn: l.end_on,
    monthlyRent: n(l.monthly_rent),
    dueDay: n(l.due_day),
    deposit: n(l.deposit),
    advance: n(l.advance),
    openBalance: n(l.open_balance),
    overdue: n(l.overdue),
    nextDueOn: l.next_due_on,
    invoices: invoices.data.map((i) => ({ id: i.id, ethYear: i.eth_year, ethMonth: i.eth_month, dueOn: i.due_on, amount: i.amount, paid: i.paid, balance: n(i.balance) })),
    payments: payments.data.map((p) => ({ id: p.id, amount: p.amount, method: p.method, reference: p.reference, createdAt: p.created_at })),
  };
}

export async function addProperty(input: { name: string; address?: string }): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("rn_properties").insert({ name: input.name, address: input.address ?? null });
  return error ? fail(error) : { ok: true, data: undefined };
}

export async function addUnit(input: { property: string; label: string; kind: string; rent: number }): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("rn_units").insert({ property_id: input.property, label: input.label, kind: input.kind, monthly_rent: input.rent });
  return error ? fail(error) : { ok: true, data: undefined };
}

export async function startLease(input: { unit: string; name: string; phone?: string; start: string; rent: number; dueDay: number; deposit: number; clientRef: string }): Promise<Result<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rn_start_lease", {
    p_unit: input.unit,
    p_name: input.name,
    p_phone: input.phone ?? "",
    p_start: input.start,
    p_rent: input.rent,
    p_due_day: input.dueDay,
    p_deposit: input.deposit,
    p_client_ref: input.clientRef,
  });
  return error ? fail(error) : { ok: true, data };
}

export async function pay(input: { lease: string; amount: number; method: Enums<"pay_method">; reference?: string; clientRef: string }): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rn_record_payment", {
    p_lease: input.lease,
    p_amount: input.amount,
    p_method: input.method,
    p_reference: input.reference ?? "",
    p_client_ref: input.clientRef,
  });
  return error ? fail(error) : { ok: true, data: undefined };
}

export async function endLease(input: { lease: string; end: string }): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rn_end_lease", { p_lease: input.lease, p_end: input.end });
  return error ? fail(error) : { ok: true, data: undefined };
}

export async function generateInvoices(): Promise<Result<number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rn_generate_invoices");
  return error ? fail(error) : { ok: true, data };
}

export type MonthRow = { id: string; leaseId: string; dueOn: string; amount: number; paid: number; balance: number; tenantName: string; unitLabel: string; propertyName: string };

export async function listMonth(year: number, month: number): Promise<MonthRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rn_invoice_board")
    .select("id, lease_id, due_on, amount, paid, balance, tenant_name, unit_label, property_name")
    .eq("eth_year", year)
    .eq("eth_month", month)
    .order("due_on")
    .order("property_name")
    .limit(500);
  if (error) throw error;
  return data.map((i) => ({
    id: i.id!,
    leaseId: i.lease_id!,
    dueOn: i.due_on!,
    amount: n(i.amount),
    paid: n(i.paid),
    balance: n(i.balance),
    tenantName: i.tenant_name!,
    unitLabel: i.unit_label!,
    propertyName: i.property_name!,
  }));
}
