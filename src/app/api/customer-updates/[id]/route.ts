import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { customerUpdates } from "@/db/schema";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db
    .update(customerUpdates)
    .set({ resolved: true })
    .where(eq(customerUpdates.id, id));

  return NextResponse.json({ ok: true });
}
