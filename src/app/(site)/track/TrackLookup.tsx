"use client";

import { useState } from "react";
import { inr } from "@/lib/catalog";
import type { StatusJourney } from "@/lib/terms";

interface LookupResult {
  ref: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  journey: StatusJourney;
  carName: string;
  city: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  discountAmount: number;
}

type LookupResponse = {
  ok?: boolean;
  error?: string;
  booking?: LookupResult;
};

const SERVER_ERROR =
  "We could not fetch the booking right now. Try again shortly.";

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
    const query = ref.trim().toUpperCase();
    if (!query) {
      setState("error");
      setError("Enter the booking reference from your confirmation e-mail.");
      setData(null);
      return;
    }
    setState("loading");
    setError("");
    setData(null);

    let response: Response;
    try {
      response = await fetch(
        `/api/bookings/lookup?ref=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );
    } catch {
      setState("error");
      setError("Looks like you are offline. Check your connection and try again.");
      return;
    }

    let json: LookupResponse | null = null;
    try {
      json = (await response.json()) as LookupResponse;
    } catch {
      setState("error");
      setError(
        response.ok
          ? "We could not read the booking response. Try again shortly."
          : SERVER_ERROR,
      );
      return;
    }

    if (!response.ok || !json?.ok || !json.booking) {
      setState("error");
      setError(json?.error ?? SERVER_ERROR);
      return;
    }

    setFinalRef(query);
    window.localStorage.setItem("nl_last_ref", query);
    setData(json.booking);
    setState("ok");
  }

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
                    data.status === "PENDING"
                      ? "pending"
                      : data.status === "CANCELLED"
                      ? "cancelled"
                      : data.status === "COMPLETED"
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

          <section
            className="tjourney"
            data-testid="track-timeline"
            aria-label={`Status: ${data.journey.label}`}
            aria-labelledby="track-timeline-heading"
          >
            <h3 id="track-timeline-heading" style={{ margin: "18px 0 10px" }}>
              {data.journey.label}
            </h3>
            <div role="list">
              {data.journey.milestones.map((milestone, index) => {
                const stateLabel =
                  milestone.state === "completed"
                    ? "Completed"
                    : milestone.state === "current"
                    ? "In progress"
                    : milestone.state === "cancelled"
                    ? "Cancelled"
                    : "Up next";
                const stateClass =
                  milestone.state === "completed"
                    ? "done"
                    : milestone.state === "current"
                    ? "now"
                    : "";
                return (
                  <div
                    className={`jstep ${stateClass}`}
                    data-state={milestone.state}
                    aria-current={milestone.state === "current" ? "step" : undefined}
                    key={milestone.id}
                    role="listitem"
                  >
                    <div className="jn" aria-hidden="true">
                      {index + 1}
                    </div>
                    <div className="jt">
                      <h4>{milestone.label}</h4>
                      <p>{stateLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {data.journey.nextActions.length > 0 && (
            <section
              className="tnext"
              data-testid="track-next"
              aria-labelledby="track-next-heading"
            >
              <h4 id="track-next-heading">Your next actions</h4>
              <ol>
                {data.journey.nextActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ol>
            </section>
          )}

          <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 14 }}>
            Need help? Write to{" "}
            <b style={{ color: "var(--gold-deep)" }}>help@novuslease.in</b> or
            call 24×7 support — booking reference <b>{data.ref}</b>.
          </p>
        </div>
      )}
    </div>
  );
}
