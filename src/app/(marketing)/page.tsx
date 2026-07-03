import Link from "next/link";

export const metadata = { title: "RS Autoworks — Splendora, TX" };

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-[#0f172a] px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <span className="inline-block rounded-full bg-[#1e293b] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#93c5fd]">
            By appointment only
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Honest, careful auto repair in Splendora, Texas
          </h1>
          <p className="mt-5 text-lg text-[#cbd5e1]">
            From routine maintenance to custom builds, we treat every vehicle
            like it's our own. Reach out to schedule your appointment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-md bg-[#2563eb] px-6 py-3 text-sm font-bold text-white"
            >
              Schedule an Appointment
            </Link>
            <a
              href="tel:+12818016752"
              className="rounded-md border border-[#334155] px-6 py-3 text-sm font-bold text-white"
            >
              Call (281) 801-6752
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-[#0f172a]">
          What we do
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Repair & Maintenance",
              desc: "From routine service to unexpected repairs, we keep your vehicle running right.",
            },
            {
              title: "Diagnostics",
              desc: "Thorough diagnostic work to find the real issue before any repair begins.",
            },
            {
              title: "Custom Builds",
              desc: "Custom project work for owners who want something built their way.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-[#e2e8f0] p-6"
            >
              <h3 className="font-bold text-[#0f172a]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748b]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="text-sm font-semibold text-[#2563eb] underline"
          >
            See all services →
          </Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[#f8fafc] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#0f172a]">
            Know exactly what's happening with your vehicle
          </h2>
          <p className="mt-4 text-[#64748b]">
            When you bring your vehicle in, we can text you updates as we work
            — when a part arrives, when it's installed, and when your vehicle
            is ready. No guessing, no unanswered calls.
          </p>
        </div>
      </section>

      {/* LOCATION / CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#0f172a]">
          Serving Splendora, Texas and the surrounding area
        </h2>
        <p className="mt-3 text-[#64748b]">
          By appointment only — contact us to find a time that works for you.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-md bg-[#2563eb] px-6 py-3 text-sm font-bold text-white"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
}
