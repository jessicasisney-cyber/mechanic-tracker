import Link from "next/link";

export const metadata = { title: "Services — RS Autoworks" };

const SERVICES = [
  {
    title: "Repair",
    desc: "General repair work to get your vehicle back on the road — from small fixes to major issues.",
  },
  {
    title: "Maintenance",
    desc: "Routine service to keep your vehicle running well and catch problems early.",
  },
  {
    title: "Diagnostic",
    desc: "Careful diagnostic work to identify the real cause of an issue before recommending a repair.",
  },
  {
    title: "Custom Build",
    desc: "Custom project work for owners with a specific vision for their vehicle.",
  },
  {
    title: "Inspection",
    desc: "Thorough vehicle inspections, whether you're buying, selling, or just want peace of mind.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[#0f172a]">Services</h1>
      <p className="mt-3 max-w-2xl text-[#64748b]">
        By appointment only in Splendora, Texas. Get in touch to talk through
        what your vehicle needs.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <div key={s.title} className="rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-lg font-bold text-[#0f172a]">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-[#f8fafc] p-8 text-center">
        <h2 className="text-xl font-bold text-[#0f172a]">
          Not sure what you need?
        </h2>
        <p className="mt-2 text-[#64748b]">
          Reach out and describe the issue — we'll help figure out next steps.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-block rounded-md bg-[#2563eb] px-6 py-3 text-sm font-bold text-white"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
