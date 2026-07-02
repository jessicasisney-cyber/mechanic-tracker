import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listSmsForEntry, sendSmsForEntry, SmsError } from "@/lib/sms/send";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const messages = await listSmsForEntry(id);
  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      status: m.status,
      errorMessage: m.errorMessage,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { message } = await request.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const result = await sendSmsForEntry(id, message.trim());
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof SmsError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Couldn't send that text." }, { status: 500 });
  }
}
