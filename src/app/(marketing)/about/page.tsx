export const metadata = { title: "About — RS Autoworks" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[#0f172a]">About RS Autoworks</h1>

      <div className="mt-6 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
        <strong>Note to Jessica:</strong> everything below is placeholder text
        — replace it with your and Richard's actual story, background, and
        what makes the shop different. Tell me what you'd like it to say and
        I'll drop it right in, or edit it yourself anytime.
      </div>

      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#1e293b]">
        <p>
          RS Autoworks is a small, appointment-only auto repair shop based in
          Splendora, Texas, run by Richard. We work on a wide range of
          vehicles, from routine maintenance to more involved repair and
          custom build projects.
        </p>
        <p>
          Because we work by appointment rather than as a walk-in shop, we're
          able to give each vehicle real attention instead of rushing between
          jobs. Every customer gets clear updates on what's being done to
          their vehicle and why.
        </p>
        <p>
          Our goal is simple: honest work, clear communication, and a vehicle
          you can trust when you drive away.
        </p>
      </div>
    </div>
  );
}
