# Galmee Rentals

Stop chasing rent: tenants are reminded automatically and you see who is late.

Part of **Galmee**, business systems for Ethiopian businesses, by Alpha. Mobile-first PWA in Amharic, Afaan Oromo and English.

## What it does

- **Doors:** every property as a row of doors, one per unit: rented, late or vacant at a glance.
- **Tenant page:** rent schedule by Ethiopian month, take rent (cash, Telebirr, CBE Birr, bank), prepaid rent, deposit, end the rental.
- **Late list:** who owes, how much and since when, with one tap to call.
- **Rent schedule:** what was billed and collected per Ethiopian month.
- **Broker mode:** listings and client requests, with listings matched to each client.
- Works in Amharic, Afaan Oromo and English, with Ethiopian calendar dates throughout.

## Stack

Next.js (App Router) + TypeScript + Tailwind, installable PWA. Supabase (Postgres with row level security per business, Auth). Money changes only through database functions (`rn_record_payment`, `rn_start_lease`, `rn_end_lease`).

## Setup

```sh
cp .env.example .env.local   # Supabase URL and publishable key
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm test
npm run build
```

`supabase/tests/rn_rls_test.sql` is the cross-tenant and workflow test; run it in the Supabase SQL editor and compare each result with its "expect".

## Deploy

Push to `main`; the Vercel project is linked to this repo.

See `ROADMAP.md` for progress.
