import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, workEntries, workLogEntries } from "./schema";
import { and, eq, isNotNull, ne } from "drizzle-orm";

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL || "owner@example.com";
  const password = process.env.SEED_OWNER_PASSWORD || "changeme123";

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    name: "Shop Owner",
    email,
    passwordHash,
    role: "owner",
  });

  console.log(`Created owner account: ${email} / ${password}`);
  console.log("Change this password after first login.");
}

// One-time backfill: entries created before the dated Job Log feature had
// their notes in a single overwritable `work_notes` column. Turn each into
// the first entry of that job's log so the history isn't lost. Safe to
// re-run: skips any entry that already has log rows.
async function backfillWorkLogFromLegacyNotes() {
  const legacyEntries = await db
    .select({
      id: workEntries.id,
      workNotes: workEntries.workNotes,
      createdBy: workEntries.createdBy,
      createdAt: workEntries.createdAt,
    })
    .from(workEntries)
    .where(
      and(isNotNull(workEntries.workNotes), ne(workEntries.workNotes, ""))
    );

  let backfilled = 0;
  for (const entry of legacyEntries) {
    const hasLog = await db.query.workLogEntries.findFirst({
      where: eq(workLogEntries.workEntryId, entry.id),
    });
    if (hasLog) continue;

    await db.insert(workLogEntries).values({
      workEntryId: entry.id,
      authorId: entry.createdBy,
      note: entry.workNotes!,
      visibleToCustomer: false,
      createdAt: entry.createdAt,
    });
    backfilled++;
  }

  if (backfilled > 0) {
    console.log(`Backfilled ${backfilled} legacy work note(s) into the job log.`);
  }
}

async function main() {
  await seedOwner();
  await backfillWorkLogFromLegacyNotes();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
