import { Resend } from "resend";

export function isEmailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.SHOP_CONTACT_EMAIL);
}

export async function sendShopEmail(subject: string, body: string) {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email isn't set up yet. Add RESEND_API_KEY and SHOP_CONTACT_EMAIL."
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    // Using Resend's shared sending address avoids needing a verified
    // custom domain. This only works because every email here goes to
    // the shop's own address (SHOP_CONTACT_EMAIL) - the free/no-domain
    // tier can only deliver to the Resend account's own verified email.
    from: "RS Autoworks Website <onboarding@resend.dev>",
    to: process.env.SHOP_CONTACT_EMAIL!,
    subject,
    text: body,
  });

  if (error) {
    throw new Error(error.message);
  }
}
