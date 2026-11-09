const KNOWN = [
  "name_required", "bad_date", "bad_due_day", "bad_amount", "overpayment", "unit_not_found", "unit_occupied",
  "lease_not_found", "lease_not_active", "not_allowed", "not_demo_tenant", "already_loaded",
] as const;

export type RentalErrorKey = (typeof KNOWN)[number] | "generic" | "name_taken";

/** Turns a database error message into a translation key; anything unknown stays generic. */
export function rentalErrorKey(message: string | undefined): RentalErrorKey {
  return KNOWN.find((code) => message?.includes(code)) ?? "generic";
}
