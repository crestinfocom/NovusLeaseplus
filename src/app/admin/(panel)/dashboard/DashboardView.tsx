"use client";

import { useEffect, useState } from "react";
import {
  initials,
  inr,
  inrShort,
  bookingPill,
  titleCase,
} from "@/lib/admin-format";
import type { StatsData } from "../admin-types";

const STATUS_COLORS: [string, string][] = [
  ["available", "var(--green)"],
  ["leased", "var(--blue)"],
  ["maintenance", "var(--amber)"],
  ["retired", "var(--red)"],
];

export default function DashboardView() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("request failed"))))
      .then((d) => {
        if (cancelled) return;
        if (!d?.ok) {
          setError("Could not load dashboard data.");
          return;
        }
        setData(d);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load dashboard data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="panel">
        <div className="empty">
          <span className="ic">⚠</span>
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel">
        <div className="empty">
          <span className="ic">…</span>
          Loading dashboard…
        </div>
      </div>
    );
  }

  const { statCards, revenue, recentBookings, fleetStatus, topCars, totalCars } = data;
  const max = Math.max(...revenue.values, 1);
  const segTotal = Math.max(
    1,
    fleetStatus.available +
      fleetStatus.leased +
      fleetStatus.maintenance +
      fleetStatus.retired
  );

  return (
    <div className="adm-inner">
      <div className="stat-grid" data-testid="stat-grid">
        {statCards.map((s) => (
          <div className="stat" key={s.lbl}>
            <div className={`ic ${s.ic}`}>{s.emoji}</div>
            <div className="lbl">{s.lbl}</div>
            <div className="num">{s.num}</div>
            <div className={`chg ${s.up ? "up" : "down"}`}>{s.chg}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Revenue — last 7 months</h3>
              <div className="sub">Monthly gross booking value (₹ lakh)</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="chart" data-testid="revenue-chart" aria-label="Monthly revenue chart">
              {revenue.values.map((v, i) => (
                <div className="col" key={revenue.labels[i]}>
                  <div
                    className={`bar${v === 0 ? " empty" : ""}`}
                    style={{ height: `${(v / max) * 100}%` }}
                    title={`${revenue.labels[i]}: ${inrShort(v)}`}
                  />
                  <div className="cl">{revenue.labels[i]}</div>
                </div>
              ))}
            </div>
            <div className="legend">
              <span>
                <i style={{ background: "var(--gold)" }} /> Monthly revenue
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Recent bookings</h3>
          </div>
          <div className="panel-body" data-testid="recent-bookings">
            {recentBookings.length === 0 && (
              <div className="empty">
                <span className="ic">🗂</span>No bookings yet
              </div>
            )}
            {recentBookings.map((b) => (
              <div className="list-item" key={b.id}>
                <div className="cust-av">{initials(b.customer)}</div>
                <div className="txt">
                  <div className="t">{b.customer}</div>
                  <div className="s">
                    {b.car} · {b.id}
                  </div>
                </div>
                <div>
                  <div className="amt">{inrShort(b.amount)}</div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`pill ${bookingPill(b.status)}`}>
                      {bookingPill(b.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Fleet status</h3>
            <div className="right">
              <a className="btn btn-ghost btn-sm" href="/admin/fleet">
                Manage fleet →
              </a>
            </div>
          </div>
          <div className="panel-body" data-testid="fleet-status">
            <div className="fleet-seg">
              {STATUS_COLORS.map(([k, color]) =>
                fleetStatus[k as keyof typeof fleetStatus] > 0 ? (
                  <div
                    key={k}
                    style={{
                      width: `${(fleetStatus[k as keyof typeof fleetStatus] / segTotal) * 100}%`,
                      background: color,
                    }}
                    title={`${k}: ${fleetStatus[k as keyof typeof fleetStatus]}`}
                  />
                ) : null
              )}
            </div>
            {STATUS_COLORS.map(([k, color]) => (
              <div className="list-item" key={k}>
                <i
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <div className="txt">
                  <div className="t" style={{ textTransform: "capitalize" }}>
                    {k}
                  </div>
                </div>
                <div className="amt">
                  {fleetStatus[k as keyof typeof fleetStatus]}
                </div>
              </div>
            ))}
            {totalCars === 0 && (
              <div className="empty">
                <span className="ic">🚗</span>No vehicles in the fleet yet
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Top-performing cars</h3>
          </div>
          <div className="panel-body" data-testid="top-cars">
            {topCars.length === 0 && (
              <div className="empty">
                <span className="ic">🚗</span>No cars to rank yet
              </div>
            )}
            {topCars.map((c) => (
              <div className="list-item" key={c.id}>
                <div className="car-thumb">🚗</div>
                <div className="txt">
                  <div className="t">{c.name}</div>
                  <div className="s">
                    {titleCase(c.category)} · {inr(c.lease)}
                    /mo
                  </div>
                </div>
                <div className="util">
                  <div className="track">
                    <div className="fill" style={{ width: `${c.util}%` }} />
                  </div>
                  <span className="pct">{c.util}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}