import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { photos, workEntries } from "@/db/schema";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  isBlobConfigured,
} from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Photo storage isn't set up yet. Add BLOB_READ_WRITE_TOKEN to enable uploads.",
      },
      { status: 503 }
    );
  }

  const { id } = await params;
  const entry = await db.query.workEntries.findFirst({
    where: eq(workEntries.id, id),
  });
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const caption = formData.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP photos are supported." },
      { status: 400 }
    );
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json(
      { error: "Photo is too large (max 8MB)." },
      { status: 400 }
    );
  }

  const blob = await put(`work-entries/${id}/${crypto.randomUUID()}`, file, {
    access: "public",
    contentType: file.type,
  });

  const [photo] = await db
    .insert(photos)
    .values({
      workEntryId: id,
      url: blob.url,
      caption: typeof caption === "string" && caption ? caption : null,
      uploadedBy: session.user.id,
    })
    .returning();

  return NextResponse.json(
    { photo: { id: photo.id, url: photo.url, caption: photo.caption ?? "" } },
    { status: 201 }
  );
}
