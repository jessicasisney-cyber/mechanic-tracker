"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Testimonial = {
  id: string;
  customerName: string;
  quote: string;
  rating: number | null;
  published: boolean;
  createdAt: string;
};

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addTestimonial() {
    if (!customerName.trim() || !quote.trim()) {
      setError("Customer name and quote are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: customerName.trim(),
        quote: quote.trim(),
        rating: Number(rating),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Couldn't save that testimonial.");
      return;
    }
    setCustomerName("");
    setQuote("");
    setRating("5");
    load();
  }

  async function togglePublished(t: Testimonial) {
    setTestimonials((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, published: !x.published } : x))
    );
    await fetch(`/api/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !t.published }),
    });
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="flex items-center gap-4 border-b border-[#e2e8f0] bg-[#0f172a] px-5 py-3.5">
        <Link
          href="/app"
          className="text-[13px] font-medium text-[#94a3b8] hover:text-white"
        >
          ← Back to Tracker
        </Link>
        <span className="text-[15px] font-bold text-white">Testimonials</span>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <h2 className="text-sm font-bold text-[#0f172a]">
            Add a Testimonial
          </h2>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            Only add real quotes from real customers who agreed to be
            featured.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Customer name (e.g. John S.)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-md border border-[#e2e8f0] px-3 py-2 text-[14px] outline-none"
            />
            <textarea
              placeholder="What did they say?"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              className="resize-y rounded-md border border-[#e2e8f0] px-3 py-2 text-[14px] outline-none"
            />
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-40 rounded-md border border-[#e2e8f0] px-3 py-2 text-[14px] outline-none"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                  {"☆".repeat(5 - n)}
                </option>
              ))}
            </select>
            {error && (
              <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#dc2626]">
                {error}
              </div>
            )}
            <button
              onClick={addTestimonial}
              disabled={submitting}
              className="self-start rounded-md bg-[#2563eb] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add Testimonial"}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">
            All Testimonials
          </h2>
          {loading ? (
            <p className="mt-3 text-sm text-[#94a3b8]">Loading…</p>
          ) : testimonials.length === 0 ? (
            <p className="mt-3 text-sm text-[#94a3b8]">
              No testimonials yet — add your first one above.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-[#e2e8f0] bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[#0f172a]">
                        {t.customerName}
                      </div>
                      {t.rating && (
                        <div className="text-[13px] text-[#f59e0b]">
                          {"★".repeat(t.rating)}
                          {"☆".repeat(5 - t.rating)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        t.published
                          ? "bg-[#d1fae5] text-[#065f46]"
                          : "bg-[#f1f5f9] text-[#64748b]"
                      }`}
                    >
                      {t.published ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#374151]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => togglePublished(t)}
                      className="rounded-md border border-[#e2e8f0] px-2.5 py-1 text-[12px] font-medium text-[#374151]"
                    >
                      {t.published ? "Hide" : "Publish"}
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="rounded-md border border-[#fecaca] px-2.5 py-1 text-[12px] font-medium text-[#dc2626]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
