import { ContactForm } from "./ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Schedule an appointment with RS Autoworks in Splendora, Texas. By appointment only.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[#0f172a]">Contact Us</h1>
      <p className="mt-3 max-w-xl text-[#64748b]">
        By appointment only in Splendora, Texas. Send a message or reach out
        directly.
      </p>

      <div className="mt-10 grid gap-10 sm:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Phone
            </div>
            <a
              href="tel:+12818016752"
              className="text-lg font-semibold text-[#0f172a]"
            >
              (281) 801-6752
            </a>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Email
            </div>
            <a
              href="mailto:rsautoworks8675@gmail.com"
              className="text-lg font-semibold text-[#0f172a]"
            >
              rsautoworks8675@gmail.com
            </a>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Location
            </div>
            <p className="text-[#374151]">Splendora, Texas</p>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Hours
            </div>
            <p className="text-[#374151]">By appointment only</p>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
