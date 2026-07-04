import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shopSettings } from "@/db/schema";

export async function getShopSettings() {
  const existing = await db.query.shopSettings.findFirst({
    where: eq(shopSettings.id, "default"),
  });
  if (existing) return existing;

  const [created] = await db.insert(shopSettings).values({}).returning();
  return created;
}

export async function updateShopSettings(updates: {
  standardLaborRate?: number;
  specialtyLaborRateMin?: number;
  specialtyLaborRateMax?: number;
  salesTaxRate?: number;
}) {
  await getShopSettings(); // ensure the row exists first
  await db
    .update(shopSettings)
    .set({
      ...(updates.standardLaborRate !== undefined && {
        standardLaborRate: updates.standardLaborRate.toString(),
      }),
      ...(updates.specialtyLaborRateMin !== undefined && {
        specialtyLaborRateMin: updates.specialtyLaborRateMin.toString(),
      }),
      ...(updates.specialtyLaborRateMax !== undefined && {
        specialtyLaborRateMax: updates.specialtyLaborRateMax.toString(),
      }),
      ...(updates.salesTaxRate !== undefined && {
        salesTaxRate: updates.salesTaxRate.toString(),
      }),
      updatedAt: new Date(),
    })
    .where(eq(shopSettings.id, "default"));
}
