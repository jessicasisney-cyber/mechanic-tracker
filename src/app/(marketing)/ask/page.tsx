import type { Metadata } from "next";
import { DiagnosisChat } from "@/components/DiagnosisChat";

export const metadata: Metadata = {
  title: "Ask About Your Diagnosis",
  description:
    "Confused about what a mechanic told you? Get a plain-English explanation from RS Autoworks in Splendora, Texas — no jargon, no pressure.",
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0f172a]">
          Ask About Your Diagnosis
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[#64748b]">
          Car talk can be confusing. Tell us what you were told — by us, by
          another shop, or by your dashboard — and we&apos;ll explain what it
          actually means, the way we&apos;d explain it in person.
        </p>
      </div>

      <div className="mt-10">
        <DiagnosisChat />
      </div>
    </div>
  );
}
