import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

export async function getPublishedTestimonials(limit?: number) {
  return db.query.testimonials.findMany({
    where: eq(testimonials.published, true),
    orderBy: [desc(testimonials.createdAt)],
    limit,
  });
}
