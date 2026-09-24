"use client";

import { useMemo, useState } from "react";

const FREQ = ["daily", "weekly"] as const;
type Freq = (typeof FREQ)[number];
const TENURES = [36, 48, 60] as const;
type Tenure = (typeof TENURES)[number];

function ngn(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

function Ctrl({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
  hint,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="ctrl">
      <div className="lbl">
        <span>{label}</span>
        <b>{display}</b>
      </div>
      <input
        type="range"
        className="single"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(+e.target.value)}
      />
      {hint && <div className="vdd-xkm">{hint}</div>}
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="dwu-stat">
      <span className="l">{l}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export default function DriveCalculator() {
  const [price, setPrice] = useState(1500000);
  const [down, setDown] = useState(30000);
  const [tenure, setTenure] = useState<Tenure>(36);
  const [rate, setRate] = useState(14);
  const [freq, setFreq] = useState<Freq>("weekly");
  const [days, setDays] = useState(6);
  const [trips, setTrips] = useState(4);
  const [fare, setFare] = useState(5000);
  const [commPct, setCommPct] = useState(45);

  const est = useMemo(() => {
    const financed = Math.max(price - down, 0);
    const totalPayable = financed * (1 + (rate / 100) * (tenure / 12));
    const periodsPerMonth = (freq === "daily" ? days : 1) * 4.33;
    const periods = tenure * periodsPerMonth;
    const contribPerPeriod = totalPayable / periods;
    const contribPerMonth = contribPerPeriod * periodsPerMonth;

    const grossPerDay = trips * fare;
    const grossPerPeriod = freq === "daily" ? grossPerDay : grossPerDay * days;
    const grossPerMonth = grossPerDay * days * 4.33;
    const commPerPeriod = grossPerPeriod * (commPct / 100);
    const commPerMonth = grossPerMonth * (commPct / 100);
    const netPerPeriod = commPerPeriod - contribPerPeriod;
    const netPerMonth = commPerMonth - contribPerMonth;

    return {
      financed,
      totalPayable,
      contribPerPeriod,
      contribPerMonth,
      grossPerPeriod,
      grossPerMonth,
      commPerPeriod,
      commPerMonth,
      netPerPeriod,
      netPerMonth,
    };
  }, [price, down, tenure, rate, freq, days, trips, fare, commPct]);

  const periodLabel = freq === "daily" ? "day" : "week";

  return (
    <div
      className="dwu-calc"
      data-testid="drive-calculator"
      style={{ marginTop: 34 }}
    >
      <div className="dwu-calc-in">
        <div className="dwu-calc-inputs">
          <Ctrl
            label="Commercial vehicle price"
            min={500000}
            max={8000000}
            step={100000}
            value={price}
            display={ngn(price)}
            onChange={setPrice}
          />
          <Ctrl
            label="Initial down payment"
            min={20000}
            max={40000}
            step={1000}
            value={down}
            display={ngn(down)}
            onChange={setDown}
            hint="Target range ₦20,000–₦40,000, configurable by vehicle / category."
          />
          <div className="ctrl">
            <div className="lbl">
              <span>Lease tenure</span>
              <b>{tenure} months</b>
            </div>
            <div className="vdd-chips dwu-chips">
              {TENURES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`vdd-chip${tenure === t ? " on" : ""}`}
                  aria-pressed={tenure === t}
                  onClick={() => setTenure(t)}
                >
                  {t} mo
                </button>
              ))}
            </div>
            <div className="vdd-xkm" style={{ margin: "6px 0 0" }}>
              Minimum lease term is 36 months.
            </div>
          </div>
          <div className="ctrl">
            <div className="lbl">
              <span>Lease / finance charge (p.a.)</span>
              <b>{rate}%</b>
            </div>
            <input
              type="range"
              className="single"
              min={8}
              max={22}
              step={1}
              value={rate}
              aria-label="Lease / finance charge per annum"
              onChange={(e) => setRate(+e.target.value)}
            />
          </div>
          <div className="ctrl">
            <div className="lbl">
              <span>Repayment frequency</span>
              <b>{freq === "weekly" ? "Weekly" : "Daily"}</b>
            </div>
            <div className="seg">
              {FREQ.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={freq === f ? "on" : ""}
                  aria-pressed={freq === f}
                  onClick={() => setFreq(f)}
                >
                  {f === "weekly" ? "Weekly" : "Daily"}
                </button>
              ))}
            </div>
          </div>
          {freq === "daily" && (
            <Ctrl
              label="Working days per week (daily model)"
              min={3}
              max={7}
              step={1}
              value={days}
              display={`${days} days`}
              onChange={setDays}
            />
          )}
          <Ctrl
            label="Trips per active day"
            min={1}
            max={10}
            step={1}
            value={trips}
            display={`${trips} trips`}
            onChange={setTrips}
          />
          <Ctrl
            label="Average trip revenue"
            min={1000}
            max={15000}
            step={250}
            value={fare}
            display={ngn(fare)}
            onChange={setFare}
          />
          <Ctrl
            label="Driver commission"
            min={20}
            max={70}
            step={5}
            value={commPct}
            display={`${commPct}%`}
            onChange={setCommPct}
            hint="Fixed-amount or percentage commission, configured per trip."
          />
        </div>

        <div className="dwu-calc-results">
          <div className="dwu-results-head">
            <span className="eyebrow">Indicative estimate</span>
            <h3>How your model could look</h3>
            <p>
              Illustrative figures only — final amounts come from the approved
              finance / lease configuration and are never contractual.
            </p>
          </div>

          <div className="dwu-qtotal" data-testid="calc-contribution">
            <span className="l">Est. lease contribution</span>
            <span className="v">
              {ngn(est.contribPerPeriod)}
              <small> per {periodLabel}</small>
            </span>
            <span className="s">
              ≈ {ngn(est.contribPerMonth)} per month on a {tenure}-month schedule
            </span>
          </div>

          <div className="dwu-stat-grid">
            <Stat
              l={`Est. gross revenue / ${periodLabel}`}
              v={ngn(est.grossPerPeriod)}
            />
            <Stat
              l={`Est. driver commission / ${periodLabel}`}
              v={ngn(est.commPerPeriod)}
            />
            <Stat
              l={`Est. net take-home / ${periodLabel}`}
              v={ngn(est.netPerPeriod)}
            />
          </div>

          <ul className="brk">
            <li>
              <span>Amount financed</span>
              <b>{ngn(est.financed)}</b>
            </li>
            <li>
              <span>
                Est. total payable
                <small style={{ display: "block", color: "var(--muted)" }}>
                  incl. {rate}% p.a. finance charge
                </small>
              </span>
              <b>{ngn(est.totalPayable)}</b>
            </li>
            <li>
              <span>Est. repayment period</span>
              <b>{tenure} months</b>
            </li>
            <li>
              <span>Est. driver commission over {tenure} months</span>
              <b>{ngn(est.commPerMonth * tenure)}</b>
            </li>
            <li className="own">
              <span>Est. lease contribution over {tenure} months</span>
              <b>{ngn(est.contribPerMonth * tenure)}</b>
            </li>
          </ul>

          <p className="dwu-est-note">
            Estimates assume consistent trips at the configured frequency.
            NovusLease+ does not guarantee trip volumes or earnings. Final
            commission and contribution formulas are approved by the business
            before any agreement.
          </p>
        </div>
      </div>
    </div>
  );
}