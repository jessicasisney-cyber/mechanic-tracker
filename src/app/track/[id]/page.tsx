import type { Metadata } from "next";
import { getPublicEntry } from "@/lib/track";
import { UpdateForm } from "./UpdateForm";

export const metadata: Metadata = {
  title: "Job Status",
  robots: { index: false, follow: false },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Ordered: { bg: "#fef3c7", color: "#92400e" },
  "In Transit": { bg: "#dbeafe", color: "#1e40af" },
  Arrived: { bg: "#d1fae5", color: "#065f46" },
  Installed: { bg: "#bbf7d0", color: "#14532d" },
  Returned: { bg: "#fee2e2", color: "#991b1b" },
  "N/A": { bg: "#f1f5f9", color: "#475569" },
};

function dateDisplay(date: string) {
  if (!date) return "";
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getPublicEntry(id);

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]">
            We couldn't find that job
          </h1>
          <p className="mt-2 text-[#64748b]">
            Double check the link, or call us at (281) 801-6752.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-[#e2e8f0] bg-[#0f172a] px-6 py-5 text-center text-white">
        <span className="text-lg font-bold tracking-tight">RS Autoworks</span>
      </div>

      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          Hi {entry.customerFirstName}, here's your job status
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          {dateDisplay(entry.date)}
          {entry.makeModel ? ` — ${entry.makeModel}` : ""}
          {entry.vehicleType ? ` (${entry.vehicleType})` : ""}
        </p>

        {(entry.projectType || entry.projectDescription) && (
          <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-white p-5">
            {entry.projectType && (
              <div className="font-semibold text-[#0f172a]">
                {entry.projectType}
              </div>
            )}
            {entry.projectDescription && (
              <p className="mt-1 text-sm leading-relaxed text-[#64748b]">
                {entry.projectDescription}
              </p>
            )}
          </div>
        )}

        {entry.hasScopeChange && (
          <div className="mt-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-[#92400e]">
              ⚠ Scope Update
            </div>
            {entry.scopeChangeNotes && (
              <p className="mt-1 text-sm leading-relaxed text-[#92400e]">
                {entry.scopeChangeNotes}
              </p>
            )}
          </div>
        )}

        {entry.parts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">
              Parts
            </h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {entry.parts.map((p) => {
                const style = STATUS_STYLE[p.partStatus];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-4 py-3"
                  >
                    <span className="font-medium text-[#0f172a]">
                      {p.partName}
                    </span>
                    {style && p.partStatus && (
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {p.partStatus}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {entry.photos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">
              Photos
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {entry.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption || "Job photo"}
                  className="aspect-square w-full rounded-lg border border-[#e2e8f0] object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 rounded-xl border border-[#e2e8f0] bg-white p-5">
          <h2 className="text-sm font-bold text-[#0f172a]">
            Ordered a part yourself?
          </h2>
          <p className="mt-1 text-sm text-[#64748b]">
            If you're sourcing a part for this job, let us know here so we
            know when to expect it.
          </p>
          <UpdateForm entryId={entry.id} />
        </div>

        <p className="mt-8 text-center text-sm text-[#94a3b8]">
          Questions? Call us at{" "}
          <a href="tel:+12818016752" className="text-[#2563eb]">
            (281) 801-6752
          </a>
        </p>
      </div>
    </div>
  );
}
