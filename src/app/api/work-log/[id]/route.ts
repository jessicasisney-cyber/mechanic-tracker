import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteWorkLogEntry, setWorkLogVisibility } from "@/lib/entries";

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

  await setWorkLogVisibility(id, visibleToCustomer);
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
  await deleteWorkLogEntry(id);
  return NextResponse.json({ ok: true });
}
