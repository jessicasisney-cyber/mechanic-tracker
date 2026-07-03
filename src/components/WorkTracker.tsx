"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { logout } from "@/app/actions";
import { vehicleTypes, projectTypes, partStatuses } from "@/lib/entry-schema";
import {
  blankEntry,
  blankPart,
  type EntryRow,
  type PartRow,
  type PhotoRow,
} from "@/lib/types";

type FormState = Omit<EntryRow, "id" | "photos">;

type SmsMessage = {
  id: string;
  body: string;
  status: "queued" | "sent" | "failed";
  errorMessage: string | null;
  createdAt: string;
};

async function compressImage(file: File): Promise<Blob> {
  const maxDim = 1600;
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
  );
  return blob ?? file;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Ordered: { bg: "#fef3c7", color: "#92400e" },
  "In Transit": { bg: "#dbeafe", color: "#1e40af" },
  Arrived: { bg: "#d1fae5", color: "#065f46" },
  Installed: { bg: "#bbf7d0", color: "#14532d" },
  Returned: { bg: "#fee2e2", color: "#991b1b" },
  "N/A": { bg: "#f1f5f9", color: "#475569" },
};

function dateDisplay(date: string) {
  if (!date) return "—";
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function entryPartsCost(entry: EntryRow) {
  return entry.parts.reduce((s, p) => s + (parseFloat(p.partCost) || 0), 0);
}

function escapeCsv(v: string | number | undefined) {
  return '"' + String(v ?? "").replace(/"/g, '""') + '"';
}

export function WorkTracker({
  initialEntries,
  currentUser,
}: {
  initialEntries: EntryRow[];
  currentUser: { name: string; role: string };
}) {
  const [entries, setEntries] = useState<EntryRow[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [filterVehicleType, setFilterVehicleType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showScopeSection, setShowScopeSection] = useState(false);
  const [form, setForm] = useState<FormState>(blankEntry());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [smsBody, setSmsBody] = useState("");
  const [smsHistory, setSmsHistory] = useState<SmsMessage[]>([]);
  const [smsSending, setSmsSending] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsSent, setSmsSent] = useState(false);

  const refreshEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/entries", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries as EntryRow[]);
    } catch {
      // silent — next poll will retry
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshEntries, 25000);
    const onFocus = () => refreshEntries();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshEntries]);

  function openNew() {
    setForm(blankEntry());
    setEditId(null);
    setShowScopeSection(false);
    setFormError(null);
    setPhotos([]);
    setPhotoError(null);
    setSmsBody("");
    setSmsHistory([]);
    setSmsError(null);
    setSmsSent(false);
    setShowForm(true);
  }

  function openEdit(entry: EntryRow) {
    setForm({
      date: entry.date,
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      customerOptIn: entry.customerOptIn,
      vehicleType: entry.vehicleType,
      makeModel: entry.makeModel,
      projectType: entry.projectType,
      projectDescription: entry.projectDescription,
      timeSpent: entry.timeSpent,
      workNotes: entry.workNotes,
      customerNotes: entry.customerNotes,
      scopeChangeDate: entry.scopeChangeDate,
      scopeChangeNotes: entry.scopeChangeNotes,
      parts: entry.parts.length > 0 ? entry.parts : [blankPart()],
    });
    setEditId(entry.id);
    setShowScopeSection(!!(entry.scopeChangeDate || entry.scopeChangeNotes));
    setFormError(null);
    setPhotos(entry.photos);
    setPhotoError(null);
    setSmsBody(
      `Hi ${entry.customerName.split(" ")[0] || "there"}, this is an update on your ${
        entry.makeModel || "vehicle"
      }: `
    );
    setSmsError(null);
    setSmsSent(false);
    fetch(`/api/entries/${entry.id}/sms`)
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data) => setSmsHistory(data.messages ?? []))
      .catch(() => setSmsHistory([]));
    setShowForm(true);
  }

  function attachPhotoToText(photo: PhotoRow) {
    setSmsBody((prev) =>
      prev.includes(photo.url) ? prev : `${prev.trim()}\n${photo.url}`.trim()
    );
  }

  async function sendSms() {
    if (!editId || !smsBody.trim()) return;
    setSmsSending(true);
    setSmsError(null);
    setSmsSent(false);
    try {
      const res = await fetch(`/api/entries/${editId}/sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: smsBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSmsError(data.error || "Couldn't send that text.");
        return;
      }
      setSmsSent(true);
      const historyRes = await fetch(`/api/entries/${editId}/sms`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setSmsHistory(historyData.messages ?? []);
      }
    } catch {
      setSmsError("Couldn't send that text. Check your connection.");
    } finally {
      setSmsSending(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (!editId) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.append("file", compressed, "photo.jpg");
      const res = await fetch(`/api/entries/${editId}/photos`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setPhotoError(data.error || "Couldn't upload that photo.");
        return;
      }
      const photo = data.photo as PhotoRow;
      setPhotos((prev) => [...prev, photo]);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editId ? { ...e, photos: [...e.photos, photo] } : e
        )
      );
    } catch {
      setPhotoError("Couldn't upload that photo. Check your connection.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function deletePhoto(photoId: string) {
    const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    if (!res.ok) return;
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setEntries((prev) =>
      prev.map((e) =>
        e.id === editId
          ? { ...e, photos: e.photos.filter((p) => p.id !== photoId) }
          : e
      )
    );
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setPartField<K extends keyof PartRow>(
    index: number,
    key: K,
    value: PartRow[K]
  ) {
    setForm((f) => ({
      ...f,
      parts: f.parts.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));
  }

  function addPart() {
    setForm((f) => ({ ...f, parts: [...f.parts, blankPart()] }));
  }

  function removePart(index: number) {
    setForm((f) => ({ ...f, parts: f.parts.filter((_, i) => i !== index) }));
  }

  async function submit() {
    if (!form.date || !form.customerName.trim()) {
      setFormError("Date and Customer Name are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(
        editId ? `/api/entries/${editId}` : "/api/entries",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        setFormError("Couldn't save that entry. Please try again.");
        return;
      }
      await refreshEntries();
      closeForm();
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  const filtered = useMemo(() => {
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => {
        const partText = e.parts
          .map((p) => `${p.partName} ${p.vendor}`)
          .join(" ");
        return (
          e.customerName.toLowerCase().includes(q) ||
          e.makeModel.toLowerCase().includes(q) ||
          e.workNotes.toLowerCase().includes(q) ||
          e.projectDescription.toLowerCase().includes(q) ||
          e.projectType.toLowerCase().includes(q) ||
          partText.toLowerCase().includes(q)
        );
      });
    }
    if (filterVehicleType) {
      result = result.filter((e) => e.vehicleType === filterVehicleType);
    }
    if (filterProject) {
      result = result.filter((e) => e.projectType === filterProject);
    }
    if (filterStatus) {
      result = result.filter((e) =>
        e.parts.some((p) => p.partStatus === filterStatus)
      );
    }
    return result;
  }, [entries, search, filterVehicleType, filterProject, filterStatus]);

  const totalHours = entries.reduce(
    (s, e) => s + (parseFloat(e.timeSpent) || 0),
    0
  );
  const totalCost = entries.reduce((s, e) => s + entryPartsCost(e), 0);
  const customerCount = new Set(
    entries.map((e) => e.customerName).filter(Boolean)
  ).size;
  const scopeCount = entries.filter(
    (e) => e.scopeChangeDate || e.scopeChangeNotes
  ).length;

  function exportCSV() {
    const headers = [
      "Date",
      "Vehicle Type",
      "Make/Model",
      "Customer Name",
      "Customer Phone",
      "Project Type",
      "Project Description",
      "Time Spent (hrs)",
      "Part Names",
      "Vendors",
      "Part Costs",
      "Part Statuses",
      "Receipt Refs",
      "Work Notes",
      "Customer Notes",
      "Scope Change Date",
      "Scope Change Notes",
    ];
    const joinParts = (parts: PartRow[], key: keyof PartRow) =>
      parts.map((p) => p[key] || "").join(" | ");
    const rows = [headers.join(",")];
    entries.forEach((e) => {
      rows.push(
        [
          e.date,
          e.vehicleType,
          e.makeModel,
          e.customerName,
          e.customerPhone,
          e.projectType,
          e.projectDescription,
          e.timeSpent,
          joinParts(e.parts, "partName"),
          joinParts(e.parts, "vendor"),
          joinParts(e.parts, "partCost"),
          joinParts(e.parts, "partStatus"),
          joinParts(e.parts, "receiptRef"),
          e.workNotes,
          e.customerNotes,
          e.scopeChangeDate,
          e.scopeChangeNotes,
        ]
          .map(escapeCsv)
          .join(",")
      );
    });
    const a = document.createElement("a");
    a.href =
      "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    a.download = "work-log-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
  }

  const isBlank = entries.length === 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f1f5f9]">
      {/* HEADER */}
      <div className="flex h-[54px] flex-shrink-0 items-center gap-3.5 bg-[#0f172a] px-5 text-white">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="text-[15px] font-bold tracking-tight text-[#f8fafc]">
          Mechanic Work Tracker
        </span>
        <div className="flex-1" />
        <span className="text-[12px] text-[#94a3b8]">
          {currentUser.name}
        </span>
        <button
          onClick={exportCSV}
          className="rounded-md border border-[#334155] px-3 py-1.5 text-[12px] font-medium text-[#94a3b8]"
        >
          Export CSV
        </button>
        <button
          onClick={openNew}
          className="ml-1 rounded-md bg-[#2563eb] px-4 py-1.5 text-[13px] font-bold text-white"
        >
          + New Entry
        </button>
        <form action={logout}>
          <button className="ml-1 rounded-md border border-[#334155] px-3 py-1.5 text-[12px] font-medium text-[#94a3b8]">
            Sign Out
          </button>
        </form>
      </div>

      {/* STATS BAR */}
      <div className="flex h-14 flex-shrink-0 items-center gap-0 border-b border-[#334155] bg-[#1e293b] px-6">
        <div className="mr-7 flex flex-col gap-px border-r border-[#334155] pr-7">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
            Entries
          </span>
          <span className="text-[20px] font-bold leading-tight text-[#f1f5f9] tabular-nums">
            {entries.length}
          </span>
        </div>
        <div className="mr-7 flex flex-col gap-px border-r border-[#334155] pr-7">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
            Total Hours
          </span>
          <span className="text-[20px] font-bold leading-tight text-[#f1f5f9] tabular-nums">
            {totalHours.toFixed(1)}
          </span>
        </div>
        <div className="mr-7 flex flex-col gap-px border-r border-[#334155] pr-7">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
            Parts Cost
          </span>
          <span className="text-[20px] font-bold leading-tight text-[#f1f5f9] tabular-nums">
            ${totalCost.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-px">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
            Customers
          </span>
          <span className="text-[20px] font-bold leading-tight text-[#f1f5f9] tabular-nums">
            {customerCount}
          </span>
        </div>
        {scopeCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#78350f] bg-[#451a03] px-2.5 py-1.5">
            <span className="text-[13px]">⚠️</span>
            <span className="text-[12px] font-semibold text-[#fcd34d]">
              {scopeCount} scope change(s)
            </span>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#e2e8f0] bg-white px-5 py-2.5">
        <div className="relative max-w-[300px] flex-1">
          <svg
            className="pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search customer, vehicle, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-[#e2e8f0] py-1.5 pl-[30px] pr-2.5 text-[13px] text-[#0f172a] outline-none"
          />
        </div>
        <select
          value={filterVehicleType}
          onChange={(e) => setFilterVehicleType(e.target.value)}
          className="cursor-pointer rounded-md border border-[#e2e8f0] bg-white px-2 py-1.5 text-[13px] text-[#374151] outline-none"
        >
          <option value="">All Vehicles</option>
          {vehicleTypes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="cursor-pointer rounded-md border border-[#e2e8f0] bg-white px-2 py-1.5 text-[13px] text-[#374151] outline-none"
        >
          <option value="">All Part Statuses</option>
          {partStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="cursor-pointer rounded-md border border-[#e2e8f0] bg-white px-2 py-1.5 text-[13px] text-[#374151] outline-none"
        >
          <option value="">All Projects</option>
          {projectTypes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className="ml-auto whitespace-nowrap text-[12px] text-[#94a3b8]">
          {filtered.length} result(s)
        </span>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3.5 px-5 py-16 text-[#94a3b8]">
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <div className="text-[16px] font-semibold text-[#64748b]">
              {isBlank ? "No entries yet" : "No matching entries"}
            </div>
            <div className="max-w-[280px] text-center text-[13px] leading-relaxed text-[#94a3b8]">
              {isBlank
                ? "Log your first work session to start tracking jobs, parts, and hours."
                : "Try adjusting your search or filters."}
            </div>
            {isBlank && (
              <button
                onClick={openNew}
                className="mt-1 rounded-lg bg-[#2563eb] px-5 py-2.5 text-[13px] font-bold text-white"
              >
                + Log First Entry
              </button>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#f8fafc]">
                {[
                  ["Date", "left"],
                  ["Customer", "left"],
                  ["Vehicle", "left"],
                  ["Project", "left"],
                  ["Hrs", "right"],
                  ["Parts / Status", "left"],
                  ["Cost", "right"],
                  ["Notes", "left"],
                  ["", "left"],
                ].map(([label, align], i) => (
                  <th
                    key={i}
                    className={`whitespace-nowrap border-b-2 border-[#e2e8f0] px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#64748b] ${
                      align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const visibleParts = entry.parts.slice(0, 3);
                const extraParts = Math.max(0, entry.parts.length - 3);
                const cost = entryPartsCost(entry);
                const hasScope = !!(
                  entry.scopeChangeDate || entry.scopeChangeNotes
                );
                return (
                  <tr key={entry.id} className="border-b border-[#f1f5f9] hover:bg-[#f0f7ff]">
                    <td className="px-4 py-2.5 align-top text-[12.5px] tabular-nums text-[#475569] whitespace-nowrap">
                      {dateDisplay(entry.date)}
                    </td>
                    <td className="max-w-[140px] px-4 py-2.5 align-top">
                      <div className="truncate font-semibold text-[#0f172a]">
                        {entry.customerName}
                      </div>
                    </td>
                    <td className="max-w-[160px] px-4 py-2.5 align-top">
                      <div className="truncate text-[#374151]">
                        {entry.makeModel}
                      </div>
                      {entry.vehicleType && (
                        <div className="mt-px text-[11px] text-[#94a3b8]">
                          {entry.vehicleType}
                        </div>
                      )}
                    </td>
                    <td className="max-w-[180px] px-4 py-2.5 align-top">
                      <div className="truncate font-medium text-[#1e293b]">
                        {entry.projectType}
                      </div>
                      {entry.projectDescription && (
                        <div className="mt-px truncate text-[11px] text-[#94a3b8]">
                          {entry.projectDescription}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right align-top font-medium tabular-nums text-[#374151]">
                      {entry.timeSpent ? `${entry.timeSpent}h` : "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-2.5 align-top">
                      {visibleParts.map((p, i) => {
                        const style = STATUS_STYLE[p.partStatus];
                        return (
                          <div
                            key={p.id || i}
                            className="mb-1.5 border-b border-[#f1f5f9] pb-1.5"
                          >
                            {p.partName && (
                              <div className="truncate text-[12.5px] text-[#374151]">
                                {p.partName}
                              </div>
                            )}
                            {style && p.partStatus && (
                              <span
                                className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                style={{ background: style.bg, color: style.color }}
                              >
                                {p.partStatus}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {extraParts > 0 && (
                        <div className="mt-0.5 text-[11px] text-[#94a3b8]">
                          +{extraParts} more part(s)
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right align-top font-semibold tabular-nums text-[#0f172a]">
                      {cost > 0 ? `$${cost.toFixed(2)}` : "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-2.5 align-top">
                      {hasScope && (
                        <span className="mb-1 inline-block rounded bg-[#fef3c7] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#92400e]">
                          ⚠ SCOPE CHANGE
                        </span>
                      )}
                      {entry.workNotes && (
                        <div className="block truncate text-[12px] text-[#64748b]">
                          {entry.workNotes}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right align-top">
                      <button
                        onClick={() => openEdit(entry)}
                        className="mr-1 rounded-md border border-[#e2e8f0] px-2.5 py-1 text-[12px] font-medium text-[#374151]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="rounded-md border border-[#fecaca] px-2.5 py-1 text-[12px] font-medium text-[#dc2626]"
                      >
                        Del
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* FORM OVERLAY */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[rgba(15,23,42,0.5)]"
          onClick={closeForm}
        >
          <div
            className="flex h-full w-[510px] flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex flex-shrink-0 items-center border-b border-[#e2e8f0] bg-[#f8fafc] px-[22px] py-[18px]">
              <div className="text-[16px] font-bold tracking-tight text-[#0f172a]">
                {editId ? "Edit Entry" : "New Entry"}
              </div>
              <div className="flex-1" />
              <button
                onClick={closeForm}
                className="rounded px-1.5 py-0.5 text-[22px] leading-none text-[#94a3b8]"
              >
                ×
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex flex-1 flex-col gap-[15px] overflow-y-auto px-[22px] py-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                Job Info
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date" required>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Vehicle Type">
                  <select
                    value={form.vehicleType}
                    onChange={(e) => setField("vehicleType", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {vehicleTypes.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Customer Name" required>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setField("customerName", e.target.value)}
                    placeholder="e.g. John Smith"
                    className={inputClass}
                  />
                </Field>
                <Field label="Customer Phone">
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setField("customerPhone", e.target.value)}
                    placeholder="e.g. (555) 123-4567"
                    className={inputClass}
                  />
                </Field>
              </div>

              {form.customerPhone && (
                <label className="-mt-2 flex items-center gap-2 text-[12px] text-[#374151]">
                  <input
                    type="checkbox"
                    checked={form.customerOptIn}
                    onChange={(e) =>
                      setField("customerOptIn", e.target.checked)
                    }
                  />
                  Customer has agreed to receive text updates about their
                  vehicle
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Make / Model">
                  <input
                    type="text"
                    value={form.makeModel}
                    onChange={(e) => setField("makeModel", e.target.value)}
                    placeholder="e.g. 2018 Ford F-150"
                    className={inputClass}
                  />
                </Field>
                <Field label="Project Type">
                  <select
                    value={form.projectType}
                    onChange={(e) => setField("projectType", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {projectTypes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Time Spent (hrs)">
                <input
                  type="number"
                  value={form.timeSpent}
                  onChange={(e) => setField("timeSpent", e.target.value)}
                  placeholder="0.0"
                  step="0.25"
                  min="0"
                  className={inputClass}
                />
              </Field>

              <Field label="Project Description / Scope">
                <textarea
                  value={form.projectDescription}
                  onChange={(e) =>
                    setField("projectDescription", e.target.value)
                  }
                  placeholder="Describe the agreed-upon scope of work…"
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </Field>

              {/* PARTS SECTION */}
              <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  Parts
                </div>
                <button
                  onClick={addPart}
                  className="rounded-md border border-[#e2e8f0] px-2.5 py-1 text-[12px] font-semibold text-[#2563eb]"
                >
                  + Add Part
                </button>
              </div>

              {form.parts.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2.5 rounded-lg border border-[#e2e8f0] bg-[#fafafa] p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
                      {form.parts.length > 1 ? `Part ${i + 1}` : "Part"}
                    </span>
                    {form.parts.length > 1 && (
                      <button
                        onClick={() => removePart(i)}
                        title="Remove part"
                        className="px-0.5 text-[18px] leading-none text-[#94a3b8]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Part Name" small>
                      <input
                        type="text"
                        value={item.partName}
                        onChange={(e) =>
                          setPartField(i, "partName", e.target.value)
                        }
                        placeholder="e.g. Alternator"
                        className={partInputClass}
                      />
                    </Field>
                    <Field label="Vendor" small>
                      <input
                        type="text"
                        value={item.vendor}
                        onChange={(e) =>
                          setPartField(i, "vendor", e.target.value)
                        }
                        placeholder="e.g. AutoZone"
                        className={partInputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <Field label="Cost ($)" small>
                      <input
                        type="number"
                        value={item.partCost}
                        onChange={(e) =>
                          setPartField(i, "partCost", e.target.value)
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={partInputClass}
                      />
                    </Field>
                    <Field label="Status" small>
                      <select
                        value={item.partStatus}
                        onChange={(e) =>
                          setPartField(i, "partStatus", e.target.value)
                        }
                        className={partInputClass}
                      >
                        <option value="">Select…</option>
                        {partStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Receipt #" small>
                      <input
                        type="text"
                        value={item.receiptRef}
                        onChange={(e) =>
                          setPartField(i, "receiptRef", e.target.value)
                        }
                        placeholder="INV-001"
                        className={partInputClass}
                      />
                    </Field>
                  </div>
                </div>
              ))}

              {/* PHOTOS SECTION */}
              <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  Photos
                </div>
                {editId && (
                  <label className="cursor-pointer rounded-md border border-[#e2e8f0] px-2.5 py-1 text-[12px] font-semibold text-[#2563eb]">
                    {uploadingPhoto ? "Uploading…" : "+ Add Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {!editId && (
                <div className="text-[12px] text-[#94a3b8]">
                  Save this entry first, then reopen it to add photos.
                </div>
              )}

              {photoError && (
                <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#dc2626]">
                  {photoError}
                </div>
              )}

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                  {photos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.caption || "Job photo"}
                        className="aspect-square w-full rounded-lg border border-[#e2e8f0] object-cover"
                      />
                      {form.customerPhone && form.customerOptIn && (
                        <button
                          onClick={() => attachPhotoToText(photo)}
                          title="Attach this photo's link to the text message below"
                          className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[12px] leading-none text-white"
                        >
                          📎
                        </button>
                      )}
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        title="Remove photo"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[14px] leading-none text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TEXT CUSTOMER */}
              {editId && (
                <div className="border-t border-[#f1f5f9] pt-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                    Text Customer
                  </div>
                  {!form.customerPhone ? (
                    <div className="text-[12px] text-[#94a3b8]">
                      Add a customer phone number to send text updates.
                    </div>
                  ) : !form.customerOptIn ? (
                    <div className="text-[12px] text-[#94a3b8]">
                      Check &quot;agreed to receive text updates&quot; above to
                      enable texting this customer.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {photos.length > 0 && (
                        <div className="text-[11px] text-[#94a3b8]">
                          Tip: click 📎 on a photo above to add its link here
                        </div>
                      )}
                      <textarea
                        value={smsBody}
                        onChange={(e) => setSmsBody(e.target.value)}
                        rows={2}
                        placeholder="Type an update to text the customer…"
                        className={`${inputClass} resize-y`}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={sendSms}
                          disabled={smsSending || !smsBody.trim()}
                          className="rounded-md bg-[#2563eb] px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-60"
                        >
                          {smsSending ? "Sending…" : "Send Text"}
                        </button>
                        {smsSent && (
                          <span className="text-[12px] font-medium text-[#059669]">
                            Sent!
                          </span>
                        )}
                      </div>
                      {smsError && (
                        <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#dc2626]">
                          {smsError}
                        </div>
                      )}
                      {smsHistory.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1.5">
                          {smsHistory.map((m) => (
                            <div
                              key={m.id}
                              className="rounded-md border border-[#f1f5f9] bg-[#fafafa] px-2.5 py-1.5 text-[12px]"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[#374151]">{m.body}</span>
                                <span
                                  className={`ml-2 shrink-0 text-[10px] font-bold uppercase ${
                                    m.status === "sent"
                                      ? "text-[#059669]"
                                      : m.status === "failed"
                                      ? "text-[#dc2626]"
                                      : "text-[#94a3b8]"
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              <div className="border-t border-[#f1f5f9] pt-3 text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                Notes
              </div>

              <Field label="Work Notes">
                <textarea
                  value={form.workNotes}
                  onChange={(e) => setField("workNotes", e.target.value)}
                  placeholder="What happened? Issues found, parts tried, outcomes…"
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </Field>

              <Field label="Customer Notes">
                <textarea
                  value={form.customerNotes}
                  onChange={(e) => setField("customerNotes", e.target.value)}
                  placeholder="What did the customer request or agree to?"
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </Field>

              {/* SCOPE CHANGE */}
              <div className="border-t border-[#f1f5f9] pt-3">
                <button
                  onClick={() => setShowScopeSection((v) => !v)}
                  className="flex w-full items-center gap-1.5 text-left"
                >
                  <span className="text-[13px]">⚠️</span>
                  <span className="text-[12px] font-bold text-[#b45309]">
                    {showScopeSection
                      ? "Hide Scope Change"
                      : "Log a Scope Change"}
                  </span>
                  <span className="ml-auto text-[13px] text-[#94a3b8]">
                    {showScopeSection ? "▲" : "▼"}
                  </span>
                </button>
                {showScopeSection && (
                  <div className="mt-3 flex flex-col gap-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3.5">
                    <div className="text-[11px] leading-relaxed text-[#92400e]">
                      Document customer-requested changes mid-project — your
                      protection if disputes arise later.
                    </div>
                    <Field label="Date of Change" scope>
                      <input
                        type="date"
                        value={form.scopeChangeDate}
                        onChange={(e) =>
                          setField("scopeChangeDate", e.target.value)
                        }
                        className={scopeInputClass}
                      />
                    </Field>
                    <Field label="What Changed" scope>
                      <textarea
                        value={form.scopeChangeNotes}
                        onChange={(e) =>
                          setField("scopeChangeNotes", e.target.value)
                        }
                        placeholder="Describe what the customer added or changed, and why…"
                        rows={3}
                        className={`${scopeInputClass} resize-y`}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {formError && (
                <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#dc2626]">
                  {formError}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="flex flex-shrink-0 gap-2.5 border-t border-[#e2e8f0] bg-[#f8fafc] px-[22px] py-3.5">
              <button
                onClick={closeForm}
                className="flex-1 rounded-md border border-[#e2e8f0] bg-white py-2.5 text-[13px] font-semibold text-[#374151]"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-[2] rounded-md bg-[#2563eb] py-2.5 text-[14px] font-bold tracking-tight text-white disabled:opacity-60"
              >
                {submitting
                  ? "Saving…"
                  : editId
                  ? "Save Changes"
                  : "Log Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[#e2e8f0] px-2.5 py-2 text-[13px] text-[#0f172a] outline-none bg-white";
const partInputClass =
  "w-full rounded-md border border-[#e2e8f0] px-2.5 py-1.5 text-[13px] text-[#0f172a] outline-none bg-white";
const scopeInputClass =
  "w-full rounded-md border border-[#fcd34d] px-2.5 py-2 text-[13px] text-[#0f172a] outline-none bg-white";

function Field({
  label,
  required,
  small,
  scope,
  children,
}: {
  label: string;
  required?: boolean;
  small?: boolean;
  scope?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className={`mb-1 block font-bold uppercase tracking-wide ${
          small ? "text-[10px]" : "text-[11px]"
        } ${scope ? "text-[#92400e]" : "text-[#374151]"}`}
      >
        {label} {required && <span className="text-[#dc2626]">*</span>}
      </label>
      {children}
    </div>
  );
}
