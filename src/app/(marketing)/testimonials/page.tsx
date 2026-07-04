import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedTestimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What customers say about RS Autoworks in Splendora, Texas.",
};

export const revalidate = 60;

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="text-[#f59e0b]">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </div>
  );
}

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[#0f172a]">
        What Our Customers Say
      </h1>

      {testimonials.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center">
          <p className="text-[#64748b]">
            We're just getting started — check back soon for reviews from our
            customers.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-[#2563eb] underline"
          >
            Schedule an appointment →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-[#e2e8f0] bg-white p-6"
            >
              <Stars rating={t.rating} />
              <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-3 text-sm font-semibold text-[#0f172a]">
                {t.customerName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
