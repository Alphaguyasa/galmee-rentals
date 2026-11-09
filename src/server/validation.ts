import { z } from "zod";

export const MIN_PASSWORD = 10;

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().max(128),
});

export const signupSchema = credentialsSchema.extend({
  password: z.string().min(MIN_PASSWORD).max(128),
});

// Ethiopian mobile/landline: 09xxxxxxxx, 07xxxxxxxx or +2519xxxxxxxx; spaces and dashes allowed.
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+251|0)[1-9]\d{8}$/));

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
});

export function formToObject(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(keys.map((k) => [k, formData.get(k) ?? ""]));
}

const uuid = z.string().uuid();
const money = z.coerce.number().positive().max(100_000_000);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || undefined);
export const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalPhone = z.union([z.literal(""), phoneSchema]).transform((v) => v || undefined);

export const uuidParam = uuid;
export const searchParam = z.string().trim().max(60);

export const PAY_METHODS = ["cash", "telebirr", "cbe_birr", "bank", "other"] as const;
export const UNIT_KINDS = ["room", "apartment", "house", "shop", "office"] as const;
export const LISTING_KINDS = ["room", "apartment", "house", "shop", "office", "land"] as const;
export const DEALS = ["rent", "sale"] as const;

export const propertySchema = z.object({ name: z.string().trim().min(2).max(120), address: optionalText(200) });

export const unitSchema = z.object({
  property: uuid,
  label: z.string().trim().min(1).max(40),
  kind: z.enum(UNIT_KINDS),
  rent: z.coerce.number().min(0).max(100_000_000),
});

export const startLeaseSchema = z.object({
  unit: uuid,
  name: z.string().trim().min(2).max(120),
  phone: optionalPhone,
  start: day,
  rent: money,
  dueDay: z.coerce.number().int().min(1).max(30),
  deposit: z.union([z.literal(""), z.coerce.number().min(0).max(100_000_000)]).transform((v) => (v === "" ? 0 : v)),
  clientRef: uuid,
});

export const paySchema = z.object({
  lease: uuid,
  amount: money,
  method: z.enum(PAY_METHODS),
  reference: optionalText(80),
  clientRef: uuid,
});

export const endLeaseSchema = z.object({ lease: uuid, end: day });

export const listingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  deal: z.enum(DEALS),
  kind: z.enum(LISTING_KINDS),
  area: optionalText(80),
  bedrooms: z.union([z.literal(""), z.coerce.number().int().min(0).max(50)]).transform((v) => (v === "" ? undefined : v)),
  price: money,
  ownerName: optionalText(120),
  ownerPhone: optionalPhone,
});

export const clientRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: optionalPhone,
  deal: z.enum(DEALS),
  kind: z.union([z.literal(""), z.enum(LISTING_KINDS)]).transform((v) => v || undefined),
  area: optionalText(80),
  minBedrooms: z.union([z.literal(""), z.coerce.number().int().min(0).max(50)]).transform((v) => (v === "" ? undefined : v)),
  maxPrice: money,
});

export const closeSchema = z.object({ id: uuid });
