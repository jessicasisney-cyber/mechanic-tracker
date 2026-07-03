"use client";

import { useActionState } from "react";
import { submitCustomerUpdate } from "./actions";

const inputClass =
  "w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-[14px] text-[#0f172a] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]";

export function UpdateForm({ entryId }: { entryId: string }) {
  const submitWithId = submitCustomerUpdate.bind(null, entryId);
  const [result, formAction, isPending] = useActionState(
    submitWithId,
    undefined
  );

  if (result === "sent") {
    return (
      <p className="mt-3 text-sm font-medium text-[#166534]">
        Thanks, we got your update!
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <textarea
        name="message"
        rows={2}
        required
        placeholder="e.g. I ordered the part, tracking number below"
        className={`${inputClass} resize-y`}
      />
      <input
        name="trackingNumber"
        type="text"
        placeholder="Tracking number (optional)"
        className={inputClass}
      />
      {result && (
        <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#dc2626]">
          {result}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-[#2563eb] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send Update"}
      </button>
    </form>
  );
}
