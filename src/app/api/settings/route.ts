import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getShopSettings, updateShopSettings } from "@/lib/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getShopSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Parameters<typeof updateShopSettings>[0] = {};

  for (const key of [
    "standardLaborRate",
    "specialtyLaborRateMin",
    "specialtyLaborRateMax",
    "salesTaxRate",
  ] as const) {
    if (typeof body[key] === "number" && body[key] >= 0) {
      updates[key] = body[key];
    }
  }

  await updateShopSettings(updates);
  return NextResponse.json({ ok: true });
}
