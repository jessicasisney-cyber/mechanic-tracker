import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, parts, photos, workEntries } from "@/db/schema";
import type { EntryInput } from "./entry-schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function findOrCreateCustomer(
  tx: Tx,
  name: string,
  phone: string | undefined,
  optedIn: boolean
) {
  const trimmedName = name.trim();
  const existing = await tx.query.customers.findFirst({
    where: sql`lower(${customers.name}) = lower(${trimmedName})`,
  });

  if (existing) {
    const updates: Partial<typeof customers.$inferInsert> = {};
    if (phone && phone !== existing.phone) updates.phone = phone;
    if (optedIn && existing.smsOptIn !== "opted_in") {
      updates.smsOptIn = "opted_in";
    }
    if (Object.keys(updates).length > 0) {
      await tx.update(customers).set(updates).where(eq(customers.id, existing.id));
    }
    return existing.id;
  }

  const [created] = await tx
    .insert(customers)
    .values({
      name: trimmedName,
      phone: phone || null,
      smsOptIn: optedIn ? "opted_in" : "pending",
    })
    .returning({ id: customers.id });
  return created.id;
}

export async function listEntries() {
  const rows = await db.query.workEntries.findMany({
    with: {
      customer: true,
      parts: { orderBy: [asc(parts.sortOrder)] },
      photos: { orderBy: [asc(photos.createdAt)] },
    },
    orderBy: [desc(workEntries.date), desc(workEntries.createdAt)],
  });
  return rows;
}

export async function createEntry(input: EntryInput, userId: string) {
  return db.transaction(async (tx) => {
    const customerId = await findOrCreateCustomer(
      tx,
      input.customerName,
      input.customerPhone,
      input.customerOptIn
    );

    const [entry] = await tx
      .insert(workEntries)
      .values({
        customerId,
        createdBy: userId,
        date: input.date,
        vehicleType: input.vehicleType,
        makeModel: input.makeModel,
        projectType: input.projectType,
        projectDescription: input.projectDescription,
        timeSpent: input.timeSpent?.toString(),
        workNotes: input.workNotes,
        customerNotes: input.customerNotes,
        scopeChangeDate: input.scopeChangeDate,
        scopeChangeNotes: input.scopeChangeNotes,
      })
      .returning();

    if (input.parts.length > 0) {
      await tx.insert(parts).values(
        input.parts.map((p, i) => ({
          workEntryId: entry.id,
          partName: p.partName,
          vendor: p.vendor,
          partCost: p.partCost?.toString(),
          partStatus: p.partStatus,
          receiptRef: p.receiptRef,
          sortOrder: i,
        }))
      );
    }

    return entry.id;
  });
}

export async function updateEntry(id: string, input: EntryInput) {
  return db.transaction(async (tx) => {
    const customerId = await findOrCreateCustomer(
      tx,
      input.customerName,
      input.customerPhone,
      input.customerOptIn
    );

    await tx
      .update(workEntries)
      .set({
        customerId,
        date: input.date,
        vehicleType: input.vehicleType,
        makeModel: input.makeModel,
        projectType: input.projectType,
        projectDescription: input.projectDescription,
        timeSpent: input.timeSpent?.toString() ?? null,
        workNotes: input.workNotes,
        customerNotes: input.customerNotes,
        scopeChangeDate: input.scopeChangeDate,
        scopeChangeNotes: input.scopeChangeNotes,
        updatedAt: new Date(),
      })
      .where(eq(workEntries.id, id));

    await tx.delete(parts).where(eq(parts.workEntryId, id));

    if (input.parts.length > 0) {
      await tx.insert(parts).values(
        input.parts.map((p, i) => ({
          workEntryId: id,
          partName: p.partName,
          vendor: p.vendor,
          partCost: p.partCost?.toString(),
          partStatus: p.partStatus,
          receiptRef: p.receiptRef,
          sortOrder: i,
        }))
      );
    }
  });
}

export async function deleteEntry(id: string) {
  await db.delete(workEntries).where(eq(workEntries.id, id));
}
