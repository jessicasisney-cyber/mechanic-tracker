"use client";

import { useRef, useState } from "react";
import { vehicleTypes } from "@/lib/entry-schema";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function DiagnosisChat({
  showVehicleFields = true,
  vehicleType: initialVehicleType = "",
  makeModel: initialMakeModel = "",
  initialText = "",
  compact = false,
}: {
  showVehicleFields?: boolean;
  vehicleType?: string;
  makeModel?: string;
  initialText?: string;
  compact?: boolean;
}) {
  const [step, setStep] = useState<"form" | "chat">("form");
  const [vehicleType, setVehicleType] = useState(initialVehicleType);
  const [makeModel, setMakeModel] = useState(initialMakeModel);
  const [text, setText] = useState(initialText);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function sendToApi(history: ChatMessage[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnosis-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        );
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      scrollToBottom();
    } catch {
      setError("Couldn't reach the assistant. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function startChat() {
    if (!text.trim()) return;
    const vehicleLine =
      vehicleType || makeModel
        ? `Vehicle: ${[makeModel, vehicleType].filter(Boolean).join(" — ")}\n\n`
        : "";
    const composed = `${vehicleLine}What I was told: ${text.trim()}`;
    const firstMessage: ChatMessage = { role: "user", content: composed };
    setMessages([firstMessage]);
    setStep("chat");
    await sendToApi([firstMessage]);
  }

  async function sendFollowUp() {
    if (!followUp.trim()) return;
    const nextMessage: ChatMessage = { role: "user", content: followUp.trim() };
    const history = [...messages, nextMessage];
    setMessages(history);
    setFollowUp("");
    scrollToBottom();
    await sendToApi(history);
  }

  const wrapperClass = compact
    ? "rounded-xl border border-[#e2e8f0] bg-white p-5"
    : "mx-auto max-w-xl rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm";

  if (step === "form") {
    return (
      <div className={wrapperClass}>
        {!compact && (
          <>
            <h2 className="text-lg font-bold text-[#0f172a]">
              Ask About Your Diagnosis
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Tell us what a mechanic, dashboard light, or technician told
              you, and we&apos;ll explain it in plain English — no jargon.
            </p>
          </>
        )}
        {compact && (
          <h2 className="text-sm font-bold text-[#0f172a]">
            Not sure what this means?
          </h2>
        )}
        <div className="mt-4 flex flex-col gap-3">
          {showVehicleFields && (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full rounded-md border border-[#e2e8f0] px-3 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#2563eb]"
              >
                <option value="">Vehicle type (optional)</option>
                {vehicleTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                placeholder="Make / model (optional)"
                className="w-full rounded-md border border-[#e2e8f0] px-3 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#2563eb]"
              />
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="e.g. They said I need a strut mount replacement…"
            className="w-full resize-y rounded-md border border-[#e2e8f0] px-3 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#2563eb]"
          />
          <button
            onClick={startChat}
            disabled={!text.trim()}
            className="self-start rounded-md bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            Explain This To Me
          </button>
        </div>
        <p className="mt-4 text-xs text-[#94a3b8]">
          This gives general information, not a diagnosis of your specific
          vehicle. For an exact assessment, schedule an appointment.
        </p>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-[#2563eb] text-white"
                : "self-start bg-[#f1f5f9] text-[#0f172a]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start rounded-lg bg-[#f1f5f9] px-3 py-2 text-sm text-[#94a3b8]">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm font-medium text-[#dc2626]">
          {error}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) sendFollowUp();
          }}
          placeholder="Ask a follow-up question…"
          className="flex-1 rounded-md border border-[#e2e8f0] px-3 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#2563eb]"
        />
        <button
          onClick={sendFollowUp}
          disabled={loading || !followUp.trim()}
          className="rounded-md bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          Send
        </button>
      </div>

      <p className="mt-4 border-t border-[#f1f5f9] pt-3 text-xs text-[#94a3b8]">
        This is general information, not a diagnosis of your vehicle. For an
        exact assessment,{" "}
        <a href="tel:+12818016752" className="font-semibold text-[#2563eb]">
          call (281) 801-6752
        </a>{" "}
        to schedule an appointment.
      </p>
    </div>
  );
}
