import { NextResponse } from "next/server";
import { z } from "zod";
import {
  askDiagnosisQuestion,
  isAiConfigured,
  MAX_MESSAGES,
  MAX_MESSAGE_LENGTH,
} from "@/lib/ai/diagnosis";
import { clientKeyFromHeaders, isRateLimited } from "@/lib/ai/rate-limit";

const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "This feature isn't turned on yet. Please call us at (281) 801-6752 in the meantime.",
      },
      { status: 503 }
    );
  }

  const clientKey = clientKeyFromHeaders(request.headers);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = chatInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages } = parsed.data;
  if (messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "The last message must be from the user." },
      { status: 400 }
    );
  }

  try {
    const reply = await askDiagnosisQuestion(messages);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      {
        error:
          "Something went wrong answering that. Please try again, or call us at (281) 801-6752.",
      },
      { status: 502 }
    );
  }
}
