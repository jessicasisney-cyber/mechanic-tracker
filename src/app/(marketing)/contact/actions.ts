"use server";

import { sendShopEmail } from "@/lib/email";

export async function submitContactForm(
  _prevState: string | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !contact || !message) {
    return "Please fill in your name, a way to reach you, and a message.";
  }

  try {
    await sendShopEmail(
      `New website inquiry from ${name}`,
      `Name: ${name}\nContact info: ${contact}\n\nMessage:\n${message}`
    );
  } catch {
    return "Sorry, something went wrong sending your message. Please call or email us directly instead.";
  }

  return "sent";
}
