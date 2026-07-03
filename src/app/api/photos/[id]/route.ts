import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { isBlobConfigured } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { visibleToCustomer } = await request.json();
  if (typeof visibleToCustomer !== "boolean") {
    return NextResponse.json(
      { error: "visibleToCustomer must be a boolean" },
      { status: 400 }
    );
  }

  await db
    .update(photos)
    .set({ visibleToCustomer })
    .where(eq(photos.id, id));

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
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, id),
  });
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await db.delete(photos).where(eq(photos.id, id));

  if (isBlobConfigured()) {
    try {
      await del(photo.url);
    } catch {
      // blob already gone or unreachable; DB row is the source of truth for the UI
    }
  }

  return NextResponse.json({ ok: true });
}
