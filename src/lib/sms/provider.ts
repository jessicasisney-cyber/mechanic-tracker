export type SmsSendResult = {
  providerMessageId: string;
};

export interface SmsProvider {
  send(to: string, body: string): Promise<SmsSendResult>;
}

export function isSmsConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

class TwilioProvider implements SmsProvider {
  async send(to: string, body: string): Promise<SmsSendResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_FROM_NUMBER!;

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Twilio error (${res.status})`);
    }
    return { providerMessageId: data.sid };
  }
}

// Swap this out for a different SmsProvider implementation (Telnyx, Plivo, etc.)
// if you switch providers later — nothing else in the app needs to change.
export function getSmsProvider(): SmsProvider {
  return new TwilioProvider();
}
