"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as rentals from "@/server/dal/rentals";
import { getSession, getUserId } from "@/server/dal/session";
import { clientRequestSchema, closeSchema, endLeaseSchema, formToObject, listingSchema, paySchema, propertySchema, startLeaseSchema, unitSchema } from "@/server/validation";

/** `error` is a key in the `errors` message namespace. */
export type ActionState = { error?: string; done?: boolean } | undefined;

// Server Actions are public endpoints: every one checks the login and validates; RLS and the RPCs re-check tenant and role.
async function requireLogin() {
  if (!(await getUserId())) redirect("/login");
}

async function requireManager(): Promise<ActionState | null> {
  const { profile } = await getSession();
  return profile.role === "staff" ? { error: "not_allowed" } : null;
}

function refreshAll() {
  revalidatePath("/", "layout");
}

export async function addPropertyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const denied = await requireManager();
  if (denied) return denied;
  const parsed = propertySchema.safeParse(formToObject(formData, ["name", "address"]));
  if (!parsed.success) return { error: "form" };
  const result = await rentals.addProperty(parsed.data);
  if (!result.ok) return { error: result.error };
  refreshAll();
  return { done: true };
}

export async function addUnitAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const denied = await requireManager();
  if (denied) return denied;
  const parsed = unitSchema.safeParse(formToObject(formData, ["property", "label", "kind", "rent"]));
  if (!parsed.success) return { error: "form" };
  const result = await rentals.addUnit(parsed.data);
  if (!result.ok) return { error: result.error };
  refreshAll();
  return { done: true };
}

export async function startLeaseAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const denied = await requireManager();
  if (denied) return denied;
  const parsed = startLeaseSchema.safeParse(formToObject(formData, ["unit", "name", "phone", "start", "rent", "dueDay", "deposit", "clientRef"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.path[0] === "phone" ? "phone" : "form" };
  const result = await rentals.startLease(parsed.data);
  if (!result.ok) return { error: result.error };
  refreshAll();
  redirect(`/leases/${result.data}`);
}

export async function payAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const parsed = paySchema.safeParse(formToObject(formData, ["lease", "amount", "method", "reference", "clientRef"]));
  if (!parsed.success) return { error: "form" };
  const result = await rentals.pay(parsed.data);
  if (!result.ok) return { error: result.error };
  refreshAll();
  return { done: true };
}

export async function endLeaseAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const denied = await requireManager();
  if (denied) return denied;
  const parsed = endLeaseSchema.safeParse(formToObject(formData, ["lease", "end"]));
  if (!parsed.success) return { error: "form" };
  const result = await rentals.endLease(parsed.data);
  if (!result.ok) return { error: result.error };
  refreshAll();
  return { done: true };
}

export async function generateInvoicesAction(): Promise<ActionState> {
  await requireLogin();
  const result = await rentals.generateInvoices();
  if (!result.ok) return { error: result.error };
  refreshAll();
  return { done: true };
}

export async function addListingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const parsed = listingSchema.safeParse(formToObject(formData, ["title", "deal", "kind", "area", "bedrooms", "price", "ownerName", "ownerPhone"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.path[0] === "ownerPhone" ? "phone" : "form" };
  const result = await rentals.addListing(parsed.data);
  if (!result.ok) return { error: result.error };
  revalidatePath("/broker");
  return { done: true };
}

export async function addClientRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const parsed = clientRequestSchema.safeParse(formToObject(formData, ["name", "phone", "deal", "kind", "area", "minBedrooms", "maxPrice"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.path[0] === "phone" ? "phone" : "form" };
  const result = await rentals.addClientRequest(parsed.data);
  if (!result.ok) return { error: result.error };
  revalidatePath("/broker");
  return { done: true };
}

export async function closeListingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const parsed = closeSchema.safeParse(formToObject(formData, ["id"]));
  if (!parsed.success) return { error: "form" };
  const result = await rentals.closeListing(parsed.data.id);
  if (!result.ok) return { error: result.error };
  revalidatePath("/broker");
  return { done: true };
}

export async function closeRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireLogin();
  const parsed = closeSchema.safeParse(formToObject(formData, ["id"]));
  if (!parsed.success) return { error: "form" };
  const result = await rentals.closeClientRequest(parsed.data.id);
  if (!result.ok) return { error: result.error };
  revalidatePath("/broker");
  return { done: true };
}
