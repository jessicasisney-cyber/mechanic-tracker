import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.query.testimonials.findMany({
    orderBy: [desc(testimonials.createdAt)],
  });
  return NextResponse.json({ testimonials: rows });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const customerName = String(body.customerName || "").trim();
  const quote = String(body.quote || "").trim();
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : null;

  if (!customerName || !quote) {
    return NextResponse.json(
      { error: "Customer name and quote are required" },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(testimonials)
    .values({ customerName, quote, rating })
    .returning();

  return NextResponse.json({ testimonial: row }, { status: 201 });
}
