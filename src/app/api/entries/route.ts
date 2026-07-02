import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { entryInputSchema } from "@/lib/entry-schema";
import { createEntry, listEntries } from "@/lib/entries";
import { serializeEntry } from "@/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listEntries();
  return NextResponse.json({ entries: rows.map(serializeEntry) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = entryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const id = await createEntry(parsed.data, session.user.id);
  return NextResponse.json({ id }, { status: 201 });
}
