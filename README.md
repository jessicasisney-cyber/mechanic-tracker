# Mechanic Work Tracker

A work tracker for the shop: log jobs, parts, and hours per customer, with
auto-texting and photo uploads, synced across every device.

## Status

- [x] Next.js + TypeScript + Tailwind project scaffolded
- [x] Postgres database schema (customers, work entries, parts, photos, SMS log, users)
- [x] Migrations set up with Drizzle ORM
- [x] Login (owner/mechanic roles), session-protected app
- [x] Work entry list/filter/search UI (from the design prototype)
- [x] New/edit job form with parts sub-form, scope-change tracking, and CSV export
- [x] Photo uploads per job (needs a Vercel Blob token — see below)
- [x] Auto-text customers (needs a Twilio account — see below)
- [ ] Deployed to the web

The original design mockup is saved at `docs/design-prototype.html` for reference.

## Tech stack

- **Next.js** (App Router) — one project serves both the UI and the API, and deploys
  as a single app to Vercel.
- **PostgreSQL** — a real hosted database so both of you see the same data from any
  device, instead of data trapped in one browser's local storage (which is how the
  prototype worked).
- **Drizzle ORM** — type-safe database queries and migrations.
- **NextAuth** — login for the two of you (owner/mechanic roles).
- **Twilio** — sends the auto-texts to customers. The code talks to an `SmsProvider`
  interface (`src/lib/sms/provider.ts`), so switching to another provider later
  (Telnyx, Plivo, etc.) is a small, contained change.
- **Vercel Blob** — stores job photos. Photos are compressed in the browser before
  upload to keep storage costs and upload time down.

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

## Turning on photo uploads

1. In the Vercel dashboard, create a Blob store (Storage → Create Database → Blob).
2. Copy the read/write token it gives you into `BLOB_READ_WRITE_TOKEN` in `.env`
   (or your Vercel project's environment variables, once deployed).
3. That's it — the "+ Add Photo" button in the job form will start working. Until
   this is set, uploads fail with a clear "photo storage isn't set up yet" message
   instead of breaking anything.

## Turning on auto-texting

1. Create a [Twilio](https://www.twilio.com) account and buy a phone number
   (a few dollars/month covers a small shop's texting volume).
2. From the Twilio console, copy your Account SID, Auth Token, and the phone
   number you bought into `.env`:
   ```
   TWILIO_ACCOUNT_SID="..."
   TWILIO_AUTH_TOKEN="..."
   TWILIO_FROM_NUMBER="+1..."
   ```
3. In the job form, check "Customer has agreed to receive text updates" once a
   customer has actually agreed to that (texting people without consent is both
   bad practice and can run afoul of anti-spam law) — the "Text Customer" box
   only appears once that's checked and a phone number is on file.
4. Every text attempt — sent or failed — is logged in the database (`sms_messages`
   table) so you always have a record of what was sent to whom.

Twilio isn't the only option — Telnyx and Plivo are similar and sometimes cheaper.
Swapping providers only means changing `src/lib/sms/provider.ts`.

## Deploying so you can use this from any device

This needs a few accounts only you can create (I don't have access to set these
up on your behalf). Once they exist, deploying is quick:

1. **Push this repo to GitHub** if it isn't already (it is, if you're reading this
   from the repo).
2. **Create a hosted Postgres database.** [Neon](https://neon.tech) has a free
   tier that's plenty for a single shop. Create a project, then copy its
   connection string.
3. **Create a Vercel account** at [vercel.com](https://vercel.com) and import
   this GitHub repo as a new project.
4. **Set environment variables** in the Vercel project settings (Settings →
   Environment Variables), using the same names as `.env.example`:
   - `DATABASE_URL` — the Neon connection string from step 2
   - `AUTH_SECRET` — generate one with `npx auth secret`
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — once you've
     set up Twilio (see above)
   - `BLOB_READ_WRITE_TOKEN` — create a Blob store in the same Vercel project
     (Storage → Create Database → Blob) and it'll offer to add this for you
     automatically
5. **Deploy.** Vercel builds and deploys automatically on push once connected.
6. **Run migrations against the production database** once, from your machine:
   ```bash
   DATABASE_URL="<your Neon connection string>" npm run db:migrate
   DATABASE_URL="<your Neon connection string>" npm run db:seed
   ```
7. Visit the URL Vercel gives you from any phone, tablet, or computer — you're
   both looking at the same live data.

Let me know when you've got the accounts set up and I can walk through any of
these steps with you, or double check the configuration once it's live.
