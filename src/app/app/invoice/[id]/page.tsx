import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/entries";
import { getShopSettings } from "@/lib/settings";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function dateDisplay(date: string) {
  if (!date) return "";
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry, settings] = await Promise.all([
    getEntry(id),
    getShopSettings(),
  ]);

  if (!entry) notFound();

  const laborRate = Number(
    entry.laborRate ||
      (entry.laborRateType === "specialty"
        ? settings.specialtyLaborRateMin
        : settings.standardLaborRate)
  );
  const hours = Number(entry.timeSpent) || 0;
  const laborCost = hours * laborRate;

  const partsRows = entry.parts.filter((p) => p.partName || p.partCost);
  const partsSubtotal = partsRows.reduce(
    (sum, p) => sum + (Number(p.partCost) || 0),
    0
  );
  const taxRate = Number(settings.salesTaxRate);
  const partsTax = partsSubtotal * taxRate;
  const total = laborCost + partsSubtotal + partsTax;

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="flex items-center gap-4 border-b border-[#e2e8f0] bg-[#0f172a] px-5 py-3.5 print:hidden">
        <Link
          href="/app"
          className="text-[13px] font-medium text-[#94a3b8] hover:text-white"
        >
          ← Back to Tracker
        </Link>
        <span className="text-[15px] font-bold text-white">Invoice</span>
        <div className="flex-1" />
        <button className="rounded-md bg-[#2563eb] px-3 py-1.5 text-[12px] font-bold text-white print-button">
          Print / Save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-2xl bg-white px-10 py-10 print:max-w-none">
        <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-6">
          <div>
            <div className="text-xl font-bold text-[#0f172a]">
              RS Autoworks
            </div>
            <div className="mt-1 text-[13px] text-[#64748b]">
              Splendora, Texas
            </div>
            <div className="text-[13px] text-[#64748b]">
              (281) 801-6752 · rsautoworks8675@gmail.com
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Invoice Date
            </div>
            <div className="text-[14px] font-semibold text-[#0f172a]">
              {dateDisplay(entry.date)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Customer
            </div>
            <div className="text-[14px] font-semibold text-[#0f172a]">
              {entry.customer.name}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Vehicle
            </div>
            <div className="text-[14px] font-semibold text-[#0f172a]">
              {entry.makeModel || "—"}
              {entry.vehicleType ? ` (${entry.vehicleType})` : ""}
            </div>
          </div>
        </div>

        {entry.projectDescription && (
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              Work Performed
            </div>
            <p className="mt-1 text-[14px] leading-relaxed text-[#374151]">
              {entry.projectDescription}
            </p>
          </div>
        )}

        <table className="mt-8 w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-[#e2e8f0] text-left">
              <th className="pb-2 font-bold uppercase tracking-wide text-[10px] text-[#64748b]">
                Description
              </th>
              <th className="pb-2 text-right font-bold uppercase tracking-wide text-[10px] text-[#64748b]">
                Qty/Hrs
              </th>
              <th className="pb-2 text-right font-bold uppercase tracking-wide text-[10px] text-[#64748b]">
                Rate
              </th>
              <th className="pb-2 text-right font-bold uppercase tracking-wide text-[10px] text-[#64748b]">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f1f5f9]">
              <td className="py-2.5 text-[#0f172a]">
                Labor
                <span className="ml-1 text-[11px] text-[#94a3b8]">
                  (not taxable per Texas law)
                </span>
              </td>
              <td className="py-2.5 text-right tabular-nums text-[#374151]">
                {hours.toFixed(2)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-[#374151]">
                {money(laborRate)}/hr
              </td>
              <td className="py-2.5 text-right tabular-nums font-semibold text-[#0f172a]">
                {money(laborCost)}
              </td>
            </tr>
            {partsRows.map((p) => (
              <tr key={p.id} className="border-b border-[#f1f5f9]">
                <td className="py-2.5 text-[#0f172a]">
                  {p.partName || "Part"}
                  {p.vendor && (
                    <span className="ml-1 text-[11px] text-[#94a3b8]">
                      ({p.vendor})
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#374151]">
                  1
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#374151]">
                  {money(Number(p.partCost) || 0)}
                </td>
                <td className="py-2.5 text-right tabular-nums font-semibold text-[#0f172a]">
                  {money(Number(p.partCost) || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-56 text-[13px]">
            <div className="flex justify-between py-1">
              <span className="text-[#64748b]">Labor subtotal</span>
              <span className="tabular-nums text-[#0f172a]">
                {money(laborCost)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748b]">Parts subtotal</span>
              <span className="tabular-nums text-[#0f172a]">
                {money(partsSubtotal)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748b]">
                Sales tax ({(taxRate * 100).toFixed(2)}% on parts)
              </span>
              <span className="tabular-nums text-[#0f172a]">
                {money(partsTax)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#e2e8f0] pt-2 text-[15px] font-bold">
              <span className="text-[#0f172a]">Total</span>
              <span className="tabular-nums text-[#0f172a]">
                {money(total)}
              </span>
            </div>
          </div>
        </div>

        {taxRate === 0 && (
          <p className="mt-6 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[12px] text-[#92400e] print:hidden">
            Sales tax rate isn't set yet — this invoice shows $0.00 tax.
            Update it in Settings before sending real invoices.
          </p>
        )}

        <p className="mt-8 text-center text-[11px] text-[#94a3b8]">
          Thank you for your business.
        </p>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('.print-button')?.addEventListener('click', () => window.print());`,
        }}
      />
    </div>
  );
}
