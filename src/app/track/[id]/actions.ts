"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customerUpdates, workEntries } from "@/db/schema";
import { isEmailConfigured, sendShopEmail } from "@/lib/email";

export async function submitCustomerUpdate(
  entryId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const message = String(formData.get("message") || "").trim();
  const trackingNumber = String(formData.get("trackingNumber") || "").trim();

  if (!message) {
    return "Please enter a message.";
  }

  const entry = await db.query.workEntries.findFirst({
    where: eq(workEntries.id, entryId),
    with: { customer: { columns: { name: true } } },
  });
  if (!entry) {
    return "Sorry, we couldn't find that job.";
  }

  await db.insert(customerUpdates).values({
    workEntryId: entryId,
    message,
    trackingNumber: trackingNumber || null,
  });

  if (isEmailConfigured()) {
    try {
      await sendShopEmail(
        `Customer update from ${entry.customer.name}`,
        `Job: ${entry.makeModel || "vehicle"} (${entry.date})\n\n${message}${
          trackingNumber ? `\n\nTracking number: ${trackingNumber}` : ""
        }`
      );
    } catch {
      // The update is saved in the tracker either way - email is a bonus notification.
    }
  }

  return "sent";
}
