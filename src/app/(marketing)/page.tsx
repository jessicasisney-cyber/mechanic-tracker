import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Repair in Splendora, TX",
  description:
    "By-appointment auto repair, maintenance, diagnostics, and custom builds in Splendora, Texas. Text updates keep you in the loop on your vehicle.",
};

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 16 8M12 3v2M21 12h-2M5 12H3M18.4 5.6l-1.4 1.4M7 17l-1.4 1.4" />
    </svg>
  );
}
function BuildIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

const SERVICES = [
  { icon: ShieldIcon, title: "Repair & Maintenance", desc: "From routine service to unexpected repairs, we keep your vehicle running right." },
  { icon: GaugeIcon, title: "Diagnostics", desc: "Thorough diagnostic work to find the real issue before any repair begins." },
  { icon: BuildIcon, title: "Custom Builds", desc: "Custom project work for owners who want something built their way." },
];

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0f172a] px-6 py-24 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px circle at 50% 0%, rgba(37,99,235,0.35), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-block rounded-full border border-[#334155] bg-[#1e293b]/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#93c5fd]">
            By Appointment Only
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Honest, careful auto repair in{" "}
            <span className="text-[#60a5fa]">Splendora, Texas</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#cbd5e1]">
            From routine maintenance to custom builds, we treat every vehicle
            like it's our own — and keep you in the loop the whole way
            through.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#2563eb] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-transform hover:scale-[1.03]"
            >
              Schedule an Appointment
            </Link>
            <a
              href="tel:+12818016752"
              className="rounded-lg border border-[#334155] bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Call (281) 801-6752
            </a>
          </div>

          <div className="mx-auto mt-12 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-sm text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <CalendarIcon /> By appointment only
            </div>
            <div className="flex items-center gap-2">
              <PinIcon /> Splendora, TX
            </div>
            <div className="flex items-center gap-2">
              <ChatIcon /> Text updates on your job
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">
            What we do
          </span>
          <h2 className="mt-2 text-3xl font-bold text-[#0f172a]">
            Service you can count on
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-[#e2e8f0] p-7 transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                <s.icon />
              </div>
              <h3 className="mt-5 font-bold text-[#0f172a]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748b]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="text-sm font-semibold text-[#2563eb] underline underline-offset-4"
          >
            See all services →
          </Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[#f8fafc] px-6 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">
              Stay in the loop
            </span>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-[#0f172a]">
              Know exactly what's happening with your vehicle
            </h2>
            <p className="mt-4 leading-relaxed text-[#64748b]">
              When you bring your vehicle in, we can text you updates as we
              work — when a part arrives, when it's installed, and when your
              vehicle is ready. No guessing, no unanswered calls.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              {[
                "Hi Jessica, your part just arrived!",
                "We're installing it now.",
                "Your vehicle is ready for pickup 🚗",
              ].map((msg, i) => (
                <div
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#2563eb] px-4 py-2.5 text-sm text-white"
                >
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION / CTA */}
      <section className="relative overflow-hidden bg-[#0f172a] px-6 py-20 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(500px circle at 50% 100%, rgba(37,99,235,0.3), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-3xl font-bold">
            Serving Splendora, Texas and the surrounding area
          </h2>
          <p className="mt-3 text-[#94a3b8]">
            By appointment only — contact us to find a time that works for
            you.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-block rounded-lg bg-[#2563eb] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-transform hover:scale-[1.03]"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
