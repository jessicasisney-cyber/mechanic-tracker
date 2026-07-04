import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { addWorkLogEntry } from "@/lib/entries";

const logInputSchema = z.object({
  note: z.string().trim().min(1, "Note is required").max(4000),
  visibleToCustomer: z.boolean().optional().default(false),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = logInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const log = await addWorkLogEntry(
    id,
    session.user.id,
    parsed.data.note,
    parsed.data.visibleToCustomer
  );

  return NextResponse.json(
    {
      log: {
        id: log.id,
        note: log.note,
        visibleToCustomer: log.visibleToCustomer,
        authorName: session.user.name ?? "",
        createdAt: log.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
