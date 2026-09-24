"use client";

import { useState } from "react";
import { inr } from "@/lib/catalog";

interface LookupResult {
  ref: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  journey: { label: string; steps: string[]; isDone: boolean };
  carName: string;
  city: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  baseAmount: number;
  discountAmount: number;
  customerName: string;
  createdAt: string;
}

const ORDER = ["PENDING", "CONFIRMED", "PICKED_UP", "RETURNED", "COMPLETED"];

function progressFor(status: string): number {
  if (status === "CANCELLED") return 0;
  const i = ORDER.indexOf(status);
  return i < 0 ? 0 : i;
}

export default function TrackLookup() {
  const [ref, setRef] = useState<string>("");
  const [finalRef, setFinalRef] = useState<string>(
    () => (typeof window !== "undefined" ? window.localStorage.getItem("nl_last_ref") ?? "" : "")
  );
  const [state, setState] = useState<"idle" | "loading" | "error" | "ok">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<LookupResult | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const q = ref.trim();
    if (!q) {
      setState("error");
      setError("Enter the booking reference from your confirmation e-mail.");
      setData(null);
      return;
    }
    setState("loading");
    setError("");
    setData(null);
    try {
      const res = await fetch(
        `/api/bookings/lookup?ref=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setState("error");
        setError(json?.error ?? "We could not fetch the booking right now. Try again shortly.");
        return;
      }
      setFinalRef(q.toUpperCase());
      window.localStorage.setItem("nl_last_ref", q.toUpperCase());
      setData(json.booking);
      setState("ok");
    } catch {
      setState("error");
      setError("Looks like you are offline. Check your connection and try again.");
    }
  }

  const progress =
    state === "ok" && data ? progressFor(data.status) : 0;

  return (
    <div className="track-card" data-testid="track-card">
      <form className="track-form" onSubmit={lookup}>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="e.g. B1X4K2"
          aria-label="Booking reference"
        />
        <button className="btn btn-gold" type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Checking…" : "Track booking"}
        </button>
      </form>
      <p className="track-hint">
        Find the 6-character reference (like B1X4K2) on your confirmation
        e-mail, invoice or the WhatsApp handover link.
      </p>
      {finalRef && state === "idle" && (
        <p className="track-hint" data-testid="track-last-ref">
          Last checked: <b>{finalRef}</b> — re-enter it above to see the latest
          status.
        </p>
      )}

      {state === "loading" && (
        <div className="track-load" role="status">
          Fetching the latest status…
        </div>
      )}

      {state === "error" && (
        <div className="track-err" role="alert">
          {error}
        </div>
      )}

      {state === "ok" && data && (
        <div data-testid="track-result">
          <div className="tkdash">
            <div className="tkrow">
              <span>Booking reference</span>
              <b>{data.ref}</b>
            </div>
            <div className="tkrow">
              <span>Product</span>
              <b>{data.typeLabel}</b>
            </div>
            <div className="tkrow">
              <span>Car</span>
              <b>{data.carName}</b>
            </div>
            <div className="tkrow">
              <span>City</span>
              <b>{data.city}</b>
            </div>
            <div className="tkrow">
              <span>Dates</span>
              <b>
                {data.startDate} → {data.endDate}
              </b>
            </div>
            <div className="tkrow">
              <span>Total payable</span>
              <b>{inr(data.totalAmount)}</b>
            </div>
            <div className="tkrow">
              <span>Status</span>
              <b>
                <span
                  className={`tk-pill ${
                    data.status === "CANCELLED"
                      ? "cancelled"
                      : data.status === "COMPLETED" || data.status === "RETURNED"
                      ? "completed"
                      : "active"
                  }`}
                >
                  {data.statusLabel}
                </span>
              </b>
            </div>
            {data.discountAmount > 0 && (
              <div className="tkrow">
                <span>Discount applied</span>
                <b>− {inr(data.discountAmount)}</b>
              </div>
            )}
          </div>

          <div className="tjourney" aria-label={`Status: ${data.journey.label}`}>
            <h4 style={{ margin: "18px 0 10px" }}>{data.journey.label}</h4>
            {data.journey.steps.map((s, i) => {
              const cls =
                i < progress ? "done" : i === progress && !data.journey.isDone ? "now" : "";
              return (
                <div className={`jstep ${cls}`} key={i}>
                  <div className="jn">{i + 1}</div>
                  <div className="jt">
                    <h4>{cls === "done" ? "Completed" : cls === "now" ? "In progress" : "Up next"}</h4>
                    <p>{s}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tnext" data-testid="track-next">
            <h4>Your next steps</h4>
            <ol>
              {data.journey.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 14 }}>
            Need help? Write to{" "}
            <b style={{ color: "var(--gold-deep)" }}>help@novuslease.in</b> or
            call 24×7 support — quote reference <b>{data.ref}</b>.
          </p>
        </div>
      )}
    </div>
  );
}