import { eq } from "drizzle-orm";
import { db } from "@/db";
import { workEntries } from "@/db/schema";

export type PublicPart = {
  id: string;
  partName: string;
  partStatus: string;
};

export type PublicPhoto = {
  id: string;
  url: string;
  caption: string;
};

export type PublicEntry = {
  id: string;
  customerFirstName: string;
  date: string;
  vehicleType: string;
  makeModel: string;
  projectType: string;
  projectDescription: string;
  hasScopeChange: boolean;
  scopeChangeNotes: string;
  parts: PublicPart[];
  photos: PublicPhoto[];
};

export async function getPublicEntry(id: string): Promise<PublicEntry | null> {
  const entry = await db.query.workEntries.findFirst({
    where: eq(workEntries.id, id),
    with: {
      customer: { columns: { name: true } },
      parts: { columns: { id: true, partName: true, partStatus: true } },
      photos: {
        columns: { id: true, url: true, caption: true },
        where: (photos, { eq }) => eq(photos.visibleToCustomer, true),
      },
    },
  });

  if (!entry) return null;

  return {
    id: entry.id,
    customerFirstName: entry.customer.name.split(" ")[0] || "there",
    date: entry.date,
    vehicleType: entry.vehicleType ?? "",
    makeModel: entry.makeModel ?? "",
    projectType: entry.projectType ?? "",
    projectDescription: entry.projectDescription ?? "",
    hasScopeChange: !!(entry.scopeChangeDate || entry.scopeChangeNotes),
    scopeChangeNotes: entry.scopeChangeNotes ?? "",
    parts: entry.parts.map((p) => ({
      id: p.id,
      partName: p.partName ?? "Part",
      partStatus: p.partStatus ?? "",
    })),
    photos: entry.photos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption ?? "",
    })),
  };
}
