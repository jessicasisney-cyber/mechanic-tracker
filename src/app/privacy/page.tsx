export const metadata = { title: "Privacy Policy — RS Autoworks" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-[15px] leading-relaxed text-[#1e293b]">
      <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">Privacy Policy</h1>
      <p className="mb-6 text-sm text-[#64748b]">Last updated: 2026</p>

      <p className="mb-4">
        RS Autoworks ("we," "us") uses this internal work-tracking application to
        manage repair jobs for our customers. This page explains what
        information we collect and how we use it.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        What we collect
      </h2>
      <p className="mb-4">
        When you bring a vehicle to us for service, we record your name, phone
        number, vehicle details, a description of the work performed, parts
        used, and photos related to the job.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        How we use it
      </h2>
      <p className="mb-4">
        This information is used solely to track and manage your repair job,
        and to contact you with updates about your vehicle (for example, when
        parts arrive or the job is complete) if you've agreed to receive text
        updates. We do not sell, rent, or share your information with third
        parties for marketing purposes.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        Text messages
      </h2>
      <p className="mb-4">
        If you agree to receive text updates about your vehicle, we send those
        messages using Twilio, a third-party messaging provider, solely to
        deliver the update — not for marketing. Message and data rates may
        apply. You can stop receiving texts at any time by replying STOP or
        telling us directly.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        Photos and job data
      </h2>
      <p className="mb-4">
        Photos and job records are stored securely and are only accessible to
        RS Autoworks staff. We retain this information as part of our normal
        business records.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">Contact</h2>
      <p>
        Questions about this policy? Contact us at{" "}
        <a
          className="text-[#2563eb] underline"
          href="mailto:jessicasisney@gmail.com"
        >
          jessicasisney@gmail.com
        </a>{" "}
        or (281) 801-6752.
      </p>
    </div>
  );
}
