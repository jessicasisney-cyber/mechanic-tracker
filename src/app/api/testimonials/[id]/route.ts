import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const updates: Partial<typeof testimonials.$inferInsert> = {};
  if (typeof body.published === "boolean") updates.published = body.published;
  if (typeof body.customerName === "string")
    updates.customerName = body.customerName.trim();
  if (typeof body.quote === "string") updates.quote = body.quote.trim();
  if (
    typeof body.rating === "number" &&
    body.rating >= 1 &&
    body.rating <= 5
  ) {
    updates.rating = Math.round(body.rating);
  }

  await db.update(testimonials).set(updates).where(eq(testimonials.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(testimonials).where(eq(testimonials.id, id));
  return NextResponse.json({ ok: true });
}
