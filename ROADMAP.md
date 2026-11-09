# ROADMAP: Galmee Rentals

## M0: Foundation (shared pattern for all Galmee products)

- [x] Next.js App Router + TS + Tailwind + shadcn/ui scaffold; `npm run build` passes
- [x] PWA manifest, icons, offline shell; installs from Android Chrome
- [x] Supabase client (`@supabase/ssr`) with `.env.example` values; middleware session refresh
- [x] Auth: sign up, log in, log out; after first signup call `create_tenant` (vertical `rentals`)
- [x] next-intl with `am`, `om`, `en`; language switcher; Ethiopic-friendly font (Noto Sans Ethiopic)
- [x] Ethiopian calendar date display helper + tests
- [x] App shell: bottom navigation on mobile, sidebar on desktop, tenant name and logo
- [ ] Staff management (owner only): invite staff, set role
- [x] Generated Supabase TypeScript types committed

## M1: Core screens

- [x] Customers: search by name/phone from the door board, detail with balance on the tenant page
- [x] Items and stock: not used by this product (rentals have no stock)
- [x] Payments and credit: record payment, credit statement
- [ ] Reports: today / this week / this Ethiopian month; export CSV
- [ ] Offline queue for the main money action with sync status indicator

## M2: Galmee Rentals features

- [x] Property and unit list (vacant/occupied)
- [x] Tenant profile
- [x] Rent schedule
- [x] Payment entry
- [x] Overdue list
- [x] Broker mode: listings and client matching
- [x] Migration: rn_properties
- [x] Migration: rn_units
- [x] Migration: rn_leases
- [x] Migration: rn_rent_invoices
- [x] Migration: rn_listings
- [ ] Auto-generate rent invoices at the start of each Ethiopian month (generator and a "Bill this month" button are in; a daily schedule still needs the database scheduler turned on)
- [x] Overdue calculation

## M3: Notifications

- [ ] SMS/Telegram rent reminder 3 days before due and on the due date
- [ ] Edge Function reads `notifications` queue and sends (needs AfroMessage/Telegram keys: ask in the decision log)

## M4: Demo ready

- [ ] Demo tenant "Galmee Rentals Demo" with data: 4 properties, 30 units, 25 leases, 3 months of rent history
- [ ] Demo login documented in the decision log for Alpha (password set by Alpha, never committed)
- [ ] 5-minute demo path works on a phone in airplane mode for the main action
- [ ] Amharic and Afaan Oromo text reviewed list in the decision log for Alpha (native speaker)

## M5: Client ready

- [ ] Receipt printing (58/80 mm thermal) and Telegram receipt
- [ ] Data import from Excel/CSV
- [ ] Export all tenant data to Excel
- [ ] Error monitoring hook (Sentry, DSN via env)
- [ ] README: setup, env vars, deploy steps

## Q: Quality and security baseline (do these inside M0 and M1, not after)

- [x] `docs/DESIGN.md` written per the frontend guidelines (palette, type with Ethiopic support, layout wireframes, reviewed against generic defaults)
- [x] Tailwind theme tokens and `next/font` fonts from DESIGN.md
- [x] `server-only` Data Access Layer in `src/server/dal/`; every Server Action validates with zod and re-checks auth + role
- [x] Security headers and CSP with nonce (the security guidelines section 5)
- [x] Cross-tenant RLS test extended to this product's tables and passing
- [x] Playwright screenshot script for 360 px and 1280 px
- [x] `npm audit` clean, Dependabot active
- [ ] Self-audit (the security guidelines section 9) recorded in the dev log
