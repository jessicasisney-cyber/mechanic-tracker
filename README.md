# Mechanic Work Tracker

A work tracker for the shop: log jobs, parts, and hours per customer, with
auto-texting and photo uploads, synced across every device.

## Status

This is being built in phases. Done so far:

- [x] Next.js + TypeScript + Tailwind project scaffolded
- [x] Postgres database schema (customers, work entries, parts, photos, SMS log, users)
- [x] Migrations set up with Drizzle ORM
- [x] First owner login seeded
- [ ] Login screen + auth
- [ ] Work entry list/filter/search UI (from the design prototype)
- [ ] New/edit job form with parts sub-form and scope-change tracking
- [ ] Photo uploads per job
- [ ] Auto-text customers (e.g. "your part arrived", "job's done")
- [ ] CSV export
- [ ] Deployed to the web

The original design mockup is saved at `docs/design-prototype.html` for reference
while building the real UI.

## Tech stack

- **Next.js** (App Router) — one project serves both the UI and the API, and deploys
  as a single app to Vercel.
- **PostgreSQL** — a real hosted database so both of you see the same data from any
  device, instead of data trapped in one browser's local storage (which is how the
  prototype worked).
- **Drizzle ORM** — type-safe database queries and migrations.
- **NextAuth** — login for the two of you (owner/mechanic roles).
- **Twilio** (planned) — sends the auto-texts to customers.
- **Vercel Blob** (planned) — stores job photos.

## Local development

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or hosted)

### Setup

```bash
npm install
cp .env.example .env
# edit .env and set DATABASE_URL to your Postgres connection string
npm run db:migrate
npm run db:seed   # creates a starter owner login (see console output for credentials)
npm run dev
```

Visit http://localhost:3000

### Database scripts

- `npm run db:generate` — generate a new migration after changing `src/db/schema.ts`
- `npm run db:migrate` — apply migrations
- `npm run db:push` — push schema directly without a migration file (handy for quick local iteration)
- `npm run db:studio` — open Drizzle Studio, a GUI to browse/edit the database
- `npm run db:seed` — create the first owner account

## Deployment (planned)

The plan is to deploy to Vercel with a hosted Postgres database (Neon or Vercel
Postgres both have a free tier that's plenty for a single shop). That gives you a
URL you can open from any phone, tablet, or computer — no installs, and everyone
sees the same live data.
