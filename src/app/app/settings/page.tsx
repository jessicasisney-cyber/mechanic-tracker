"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-[14px] outline-none";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [standardLaborRate, setStandardLaborRate] = useState("125");
  const [specialtyLaborRateMin, setSpecialtyLaborRateMin] = useState("100");
  const [specialtyLaborRateMax, setSpecialtyLaborRateMax] = useState("175");
  const [salesTaxRatePercent, setSalesTaxRatePercent] = useState("0");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings;
        if (!s) return;
        setStandardLaborRate(s.standardLaborRate);
        setSpecialtyLaborRateMin(s.specialtyLaborRateMin);
        setSpecialtyLaborRateMax(s.specialtyLaborRateMax);
        setSalesTaxRatePercent((Number(s.salesTaxRate) * 100).toString());
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        standardLaborRate: Number(standardLaborRate),
        specialtyLaborRateMin: Number(specialtyLaborRateMin),
        specialtyLaborRateMax: Number(specialtyLaborRateMax),
        salesTaxRate: Number(salesTaxRatePercent) / 100,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <div className="p-8 text-sm text-[#94a3b8]">Loading…</div>;
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
        <span className="text-[15px] font-bold text-white">
          Billing Settings
        </span>
      </div>

      <div className="mx-auto max-w-xl px-6 py-8">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
          <h2 className="text-sm font-bold text-[#0f172a]">Labor Rates</h2>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            Used to calculate labor cost on invoices. Texas law doesn't tax
            labor on vehicle repairs, so labor and parts are always shown as
            separate line items.
          </p>

          <div className="mt-4">
            <label className="mb-1 block text-[12px] font-semibold text-[#374151]">
              Standard Repair Rate ($/hr)
            </label>
            <input
              type="number"
              step="0.01"
              value={standardLaborRate}
              onChange={(e) => setStandardLaborRate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#374151]">
                Classic/Specialty Min ($/hr)
              </label>
              <input
                type="number"
                step="0.01"
                value={specialtyLaborRateMin}
                onChange={(e) => setSpecialtyLaborRateMin(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[#374151]">
                Classic/Specialty Max ($/hr)
              </label>
              <input
                type="number"
                step="0.01"
                value={specialtyLaborRateMax}
                onChange={(e) => setSpecialtyLaborRateMax(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <h2 className="mt-6 text-sm font-bold text-[#0f172a]">Sales Tax</h2>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            Your combined state + local rate. Applied to parts only, never
            labor.
          </p>
          <div className="mt-4">
            <label className="mb-1 block text-[12px] font-semibold text-[#374151]">
              Sales Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={salesTaxRatePercent}
              onChange={(e) => setSalesTaxRatePercent(e.target.value)}
              className={inputClass}
            />
          </div>

          {saved && (
            <p className="mt-4 text-[13px] font-medium text-[#166534]">
              Saved!
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="mt-5 rounded-md bg-[#2563eb] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
