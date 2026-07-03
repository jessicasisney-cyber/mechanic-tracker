"use client";

import { useActionState } from "react";
import { submitContactForm } from "./actions";

const inputClass =
  "w-full rounded-md border border-[#e2e8f0] px-3 py-2.5 text-[14px] text-[#0f172a] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]";

export function ContactForm() {
  const [result, formAction, isPending] = useActionState(
    submitContactForm,
    undefined
  );

  if (result === "sent") {
    return (
      <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-6 text-center">
        <p className="font-semibold text-[#14532d]">Message sent!</p>
        <p className="mt-1 text-sm text-[#166534]">
          We'll get back to you soon. For anything urgent, call us at (281)
          801-6752.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
          Your Name
        </label>
        <input name="name" type="text" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
          Phone or Email
        </label>
        <input name="contact" type="text" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
          Message
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Tell us about your vehicle and what's going on..."
          className={`${inputClass} resize-y`}
        />
      </div>

      {result && (
        <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#dc2626]">
          {result}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[#2563eb] py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
