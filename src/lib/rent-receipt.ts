import type { Locale } from "@/i18n/config";
import { ETHIOPIAN_MONTHS, formatEthiopianDate } from "@/lib/ethiopian-date";
import type { ReceiptData } from "@/lib/galmee/receipt";

/** A rent payment as stored, with the snapshot written when it was taken (null for older payments). */
export type StoredRentPayment = {
  receiptNo: string | null;
  createdAt: string;
  amount: number;
  method: string;
  reference: string | null;
  tenantName: string;
  tenantPhone: string | null;
  door: string;
  snapshot: { months: { y: number; m: number; amount: number }[]; advance: number; balanceAfter: number } | null;
};

export type RentReceiptLabels = {
  /** "Rent {month}" with the month name already in place, e.g. "Rent: Tikimt 2018". */
  rentFor: (month: string) => string;
  prepaid: string;
  /** Single line for payments taken before snapshots existed. */
  payment: string;
  door: (door: string) => string;
};

/** Reads the `receipt` jsonb column defensively; anything malformed counts as no snapshot. */
export function parseSnapshot(raw: unknown): StoredRentPayment["snapshot"] {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { months?: unknown; advance?: unknown; balance_after?: unknown };
  if (!Array.isArray(r.months)) return null;
  const months = r.months
    .map((m) => m as { y?: unknown; m?: unknown; amount?: unknown })
    .filter((m) => Number.isInteger(m.y) && Number.isInteger(m.m) && Number(m.m) >= 1 && Number(m.m) <= 13)
    .map((m) => ({ y: Number(m.y), m: Number(m.m), amount: Number(m.amount) || 0 }));
  return { months, advance: Number(r.advance) || 0, balanceAfter: Number(r.balance_after) || 0 };
}

/** Builds the rent receipt from the payment as stored, in the reader's language. */
export function rentReceiptData(
  p: StoredRentPayment,
  tenant: { name: string; phone?: string | null },
  locale: Locale,
  labels: RentReceiptLabels,
): ReceiptData {
  const when = new Date(p.createdAt);
  const lines: ReceiptData["lines"] = [];
  if (p.snapshot) {
    for (const m of p.snapshot.months) {
      lines.push({ name: labels.rentFor(`${ETHIOPIAN_MONTHS[locale][m.m - 1]} ${m.y}`), total: m.amount });
    }
    if (p.snapshot.advance > 0) lines.push({ name: labels.prepaid, total: p.snapshot.advance });
  }
  if (lines.length === 0) lines.push({ name: labels.payment, total: p.amount });
  return {
    tenant: { name: tenant.name, phone: tenant.phone ?? undefined, townLine: labels.door(p.door) },
    no: p.receiptNo ?? "",
    kind: "fee",
    lines,
    totals: { paid: p.amount, method: p.method, balanceAfter: p.snapshot ? p.snapshot.balanceAfter : undefined },
    customer: { name: p.tenantName, phone: p.tenantPhone ?? undefined },
    ethDate: formatEthiopianDate(when, locale),
    // Gregorian day in Addis Ababa (UTC+3), matching the Ethiopian date above.
    gregDate: new Date(when.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10),
    lang: locale,
    footer: p.reference ?? undefined,
  };
}
