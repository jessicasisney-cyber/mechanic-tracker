import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, smsMessages, workEntries } from "@/db/schema";
import { getSmsProvider, isSmsConfigured } from "./provider";

export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export class SmsError extends Error {}

export async function sendSmsForEntry(entryId: string, body: string) {
  const entry = await db.query.workEntries.findFirst({
    where: eq(workEntries.id, entryId),
    with: { customer: true },
  });
  if (!entry) throw new SmsError("Entry not found");

  const customer = entry.customer;
  if (customer.smsOptIn !== "opted_in") {
    throw new SmsError(
      "This customer hasn't been marked as opted in to text updates yet."
    );
  }
  if (!customer.phone) {
    throw new SmsError("This customer doesn't have a phone number on file.");
  }
  const to = normalizePhone(customer.phone);
  if (!to) {
    throw new SmsError(
      "That phone number doesn't look valid. Use a 10-digit US number."
    );
  }

  const [record] = await db
    .insert(smsMessages)
    .values({
      customerId: customer.id,
      workEntryId: entry.id,
      body,
      status: "queued",
    })
    .returning();

  if (!isSmsConfigured()) {
    await db
      .update(smsMessages)
      .set({
        status: "failed",
        errorMessage:
          "Texting isn't set up yet. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
      })
      .where(eq(smsMessages.id, record.id));
    throw new SmsError(
      "Texting isn't set up yet. Add your Twilio credentials to enable it."
    );
  }

  try {
    const provider = getSmsProvider();
    const result = await provider.send(to, body);
    await db
      .update(smsMessages)
      .set({ status: "sent", providerMessageId: result.providerMessageId })
      .where(eq(smsMessages.id, record.id));
    return { id: record.id, status: "sent" as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db
      .update(smsMessages)
      .set({ status: "failed", errorMessage: message })
      .where(eq(smsMessages.id, record.id));
    throw new SmsError(message);
  }
}

export async function listSmsForEntry(entryId: string) {
  const entry = await db.query.workEntries.findFirst({
    where: eq(workEntries.id, entryId),
    columns: { customerId: true },
  });
  if (!entry) return [];

  return db.query.smsMessages.findMany({
    where: eq(smsMessages.customerId, entry.customerId),
    orderBy: [desc(smsMessages.createdAt)],
    limit: 20,
  });
}

export async function setCustomerOptIn(customerId: string, optedIn: boolean) {
  await db
    .update(customers)
    .set({ smsOptIn: optedIn ? "opted_in" : "pending" })
    .where(eq(customers.id, customerId));
}
