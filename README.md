# RS Autoworks

A public website plus an internal job tracker for the shop: log jobs, parts,
and hours per customer, text customers automatically, and give customers a
private link to check their own job status — all synced across every device.

## Status

- [x] Public marketing site (Home, Services, About, Contact) at the root domain
- [x] Internal job tracker at `/app` (login required)
- [x] Postgres database (Drizzle ORM), photo uploads (Vercel Blob), auto-texting (Twilio)
- [x] Public customer tracking page (`/track/[job-id]`) — no login, shows job/part
      status and shared photos, and lets a customer report a self-sourced part's
      tracking info back to the shop
- [x] Contact form and customer-update notifications via email (Resend)
- [x] SEO basics: sitemap, robots.txt, structured data, meta descriptions
- [x] Deployed to Vercel
- [x] Auto-texts a customer when a part's status changes to In Transit,
      Arrived, or Installed (manual "Send Text" still works for anything else)
- [x] Testimonials (`/app/testimonials` to manage, public on `/testimonials`
      and the homepage) and a "What Sets Us Apart" homepage section
- [x] Invoicing: shop-wide labor rates and sales tax rate (`/app/settings`),
      per-job Standard/Classic-Specialty rate selection, and a printable
      invoice (`/app/invoice/[job-id]`) with labor and parts as separate line
      items - Texas doesn't tax labor on vehicle repairs, only parts, so this
      is a legal requirement, not just a formatting choice
- [x] Dated Job Log: each job has a running, timestamped log of updates
      (who wrote it and when) instead of one note that gets overwritten -
      any entry can be flagged "Shared with customer" to show up on that
      job's tracking page
- [x] "Explain My Diagnosis" AI assistant (Claude Haiku) - a plain-English
      explainer chat for anyone confused by something a mechanic or
      dashboard light told them. Public at `/ask`, and embedded on every
      job's tracking page pre-filled with that job's own details

## Site map

- `/` `/services` `/about` `/contact` `/privacy` `/terms` — public, no login,
  meant to be browsed and indexed by search engines
- `/track/[job-id]` — public, no login, but **not** browsable or indexed —
  only reachable via the exact link copied from a job in the tracker
- `/ask` — public, no login, indexed — the "Explain My Diagnosis" AI chat
- `/app` — the internal tracker, requires login
- `/login` — staff login

## Tech stack

- **Next.js** (App Router) — one project serves the public site, the tracker, and
  the API, and deploys as a single app to Vercel.
- **PostgreSQL** (via Drizzle ORM) — real hosted database so both of you see the
  same data from any device.
- **NextAuth** — login for the two of you (owner/mechanic roles).
- **Twilio** — sends texts to customers, behind an `SmsProvider` interface
  (`src/lib/sms/provider.ts`) so switching providers later is a contained change.
- **Vercel Blob** — stores job photos (compressed in the browser before upload).
- **Resend** — sends the contact-form and customer-update emails to the shop.
- **Claude (Anthropic API, Haiku model)** — powers the "Explain My Diagnosis"
  chat that translates mechanic-speak into plain English.

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

Visit http://localhost:3000 for the public site, http://localhost:3000/app to log in.

### Database scripts

- `npm run db:generate` — generate a new migration after changing `src/db/schema.ts`
- `npm run db:migrate` — apply migrations
- `npm run db:push` — push schema directly without a migration file (handy for quick local iteration)
- `npm run db:studio` — open Drizzle Studio, a GUI to browse/edit the database
- `npm run db:seed` — create the first owner account

## How the customer tracking page works

Each job has a unique, unguessable link (`/track/<job-id>`) that shows the
customer their job status, part statuses, and any photos you've explicitly
marked "Shared with customer" (photos are private by default). In the tracker,
open a job and click **Copy Customer Link** in the drawer header to get that
link, or use **"+ Add 'track your job' link"** in the Text Customer box to
include it directly in a text.

That page also lets a customer report a part they sourced themselves (with an
optional tracking number). It emails the shop and shows up as a blue
"💬 CUSTOMER UPDATE" badge on that job in the tracker.

## The Job Log

Every job has a "Job Log" in its drawer: a running list of dated, timestamped
updates instead of a single note field that gets overwritten. Add as many
entries as the job needs across however many visits it takes — each one
records who wrote it and when. Check "Share with customer" on any entry to
have it show up as a dated "Updates" timeline on that job's tracking page
(everything else stays internal-only by default).

## The "Explain My Diagnosis" AI assistant

A chat feature, powered by Claude, that explains car problems in plain
English for anyone confused by something a mechanic or dashboard light told
them — the way a doctor explains a diagnosis, not a technical readout.

- Public and free-standing at `/ask` (linked in the site nav) for anyone,
  customer or not.
- Also embedded on every job's tracking page, pre-filled with that job's
  vehicle and description so a customer can just hit "Explain This To Me."
- Deliberately limited: it never quotes a price and never says whether
  something is safe to drive on or how urgent it is - only a hands-on
  inspection can answer that, so it always points people toward scheduling
  an appointment instead of guessing.
- Uses Claude Haiku, Anthropic's smallest and cheapest model, since this is
  a low-volume, short-answer use case. Real-world cost is a fraction of a
  cent per conversation - even a few hundred conversations a month would
  stay under a few dollars.
- Fails gracefully like the other integrations here: until `ANTHROPIC_API_KEY`
  is set, the chat shows a friendly "not turned on yet" message with the
  shop's phone number instead of breaking.

### Turning on the AI assistant

Needs an [Anthropic API key](https://console.anthropic.com):

1. Sign up and create an API key.
2. Copy it into `ANTHROPIC_API_KEY` (both locally in `.env` and in Vercel's
   environment variables for production).

Until that's set, `/ask` and the tracking-page chat both work fine and show
a clear message instead of erroring.

## Turning on photo uploads

Already configured in production via Vercel Blob (Storage → Blob, connected
via OIDC — no static token needed). For local dev, create a Blob store and add
`BLOB_READ_WRITE_TOKEN` to `.env` if you want to test uploads locally.

## Turning on auto-texting

Already configured in production. Twilio requires **A2P 10DLC registration**
for any US business texting customers — already done for this shop. Key
things to remember:

- Check "Customer has agreed to receive text updates" in the job form before
  the "Text Customer" box appears — texting without consent is bad practice
  and can violate anti-spam law.
- Every text attempt (sent or failed) is logged in the `sms_messages` table.
- Twilio isn't the only option — Telnyx and Plivo are similar and sometimes
  cheaper. Swapping providers only means changing `src/lib/sms/provider.ts`.

**Automatic texts:** changing a part's status to **In Transit**, **Arrived**,
or **Installed** automatically texts the customer (if opted in) with that
part's new status — no button to click. This compares the part's name against
its previous status on save, so it only fires on an actual change, not every
save. Statuses like Ordered, Returned, or N/A don't trigger a text, since
they're less meaningful to a customer waiting on their vehicle.

## Turning on the contact form / customer-update emails

Needs a free [Resend](https://resend.com) account:

1. Sign up with the shop's business email.
2. Copy the API key into `RESEND_API_KEY`.
3. Set `SHOP_CONTACT_EMAIL` to where messages should land.

Until both are set, the contact form and customer-update notifications fail
gracefully with a clear message instead of losing anything.

## Deployment

Hosted on Vercel with Postgres (via Vercel's Neon-backed database) and Blob
storage, both connected in the Vercel dashboard's Storage tab. Every deploy
automatically runs database migrations and the (idempotent) seed script
before building — no manual steps needed for schema changes.
