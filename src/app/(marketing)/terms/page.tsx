export const metadata = { title: "Terms & Text Messaging Program — RS Autoworks" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-[15px] leading-relaxed text-[#1e293b]">
      <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">
        Terms &amp; Text Messaging Program
      </h1>
      <p className="mb-6 text-sm text-[#64748b]">Last updated: 2026</p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        Program name
      </h2>
      <p className="mb-4">RS Autoworks Vehicle Service Updates</p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        Description
      </h2>
      <p className="mb-4">
        When you drop off a vehicle with RS Autoworks, our staff will ask
        whether you'd like to receive text message updates about your repair
        — for example, when a part arrives or your vehicle is ready for
        pickup. You are enrolled in this program only after verbally agreeing
        to it with our staff at the time of service.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        Message frequency
      </h2>
      <p className="mb-4">
        Message frequency varies based on your specific repair job — typically
        a small number of messages over the course of your service, not an
        ongoing subscription.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        Message and data rates
      </h2>
      <p className="mb-4">
        Message and data rates may apply, depending on your mobile carrier
        plan.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        How to get help
      </h2>
      <p className="mb-4">
        Reply <strong>HELP</strong> to any message for assistance, or contact
        us directly at{" "}
        <a
          className="text-[#2563eb] underline"
          href="mailto:jessicasisney@gmail.com"
        >
          jessicasisney@gmail.com
        </a>{" "}
        or (281) 801-6752.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-[#0f172a]">
        How to opt out
      </h2>
      <p className="mb-4">
        Reply <strong>STOP</strong> to any message to stop receiving text
        updates at any time, or simply tell our staff. Opting out of texts
        does not affect the service performed on your vehicle.
      </p>

      <p className="mt-8">
        See our{" "}
        <a className="text-[#2563eb] underline" href="/privacy">
          Privacy Policy
        </a>{" "}
        for how we handle your information.
      </p>
    </div>
  );
}
