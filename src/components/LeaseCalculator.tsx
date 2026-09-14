"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { onPrefill } from "@/lib/calc-bus";

const DEFAULT = {
  carPrice: 1500000,
  buyDown: 20,
  buyRate: 9.5,
  buyTenure: 5,
  depr: 15,
  leasePct: 1.67,
  leaseTenure: 3,
  leaseDown: 3.3,
  leaseSec: 5,
  leaseResidual: 50,
  insurance: 25000,
  maint: 3000,
  fuel: 8000,
};

type CalcInputs = typeof DEFAULT;

type Result = {
  buyNet: number;
  buyEmi: number;
  buyTotal: number;
  buyResale: number;
  leaseTotal: number;
  leaseMonthly: number;
  leaseThenBuy: number;
  leaseBuyout: number;
  leaseWins: boolean;
  diff: number;
  rows: [string, number | null, number | null][];
};

function compute(p: CalcInputs): Result {
  const P = p.carPrice;
  const dpP = p.buyDown,
    rate = p.buyRate,
    tenB = p.buyTenure;
  const dp = (P * dpP) / 100,
    loan = P - dp,
    r = rate / 100 / 12,
    n = tenB * 12;
  const emi = r > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  const totalPay = emi * n,
    interest = totalPay - loan;
  const insA = p.insurance,
    maintM = p.maint,
    fuelM = p.fuel,
    depr = p.depr;
  const insB = insA * tenB,
    maintB = maintM * 12 * tenB,
    fuelB = fuelM * 12 * tenB;
  const resale = P * Math.pow(1 - depr / 100, tenB);
  const totalBuy = dp + totalPay + insB + maintB + fuelB;
  const netBuy = totalBuy - resale;

  const leaseP = p.leasePct,
    tenL = p.leaseTenure,
    ldpP = p.leaseDown,
    secP = p.leaseSec,
    resP = p.leaseResidual;
  const monLease = (P * leaseP) / 100,
    ldp = (P * ldpP) / 100,
    sec = (P * secP) / 100,
    buyout = (P * resP) / 100;
  const leasePay = monLease * 12 * tenL;
  const insL = insA * tenL,
    maintL = maintM * 12 * tenL,
    fuelL = fuelM * 12 * tenL;
  const totalLease = ldp + leasePay + insL + maintL + fuelL;
  const leaseThenBuy = totalLease + buyout;

  const rows: [string, number | null, number | null][] = [
    ["Down payment", dp, ldp],
    ["Security deposit (refundable)", 0, sec],
    ["Loan / lease payments", totalPay, leasePay],
    ["Interest paid", interest, 0],
    [`Insurance (${tenB}y / ${tenL}y)`, insB, insL],
    ["Maintenance", maintB, maintL],
    ["Fuel", fuelB, fuelL],
    ["Resale value", -resale, 0],
    ["Buyout option", null, buyout],
  ];

  return {
    buyNet: netBuy,
    buyEmi: emi,
    buyTotal: totalBuy,
    buyResale: resale,
    leaseTotal: totalLease,
    leaseMonthly: monLease,
    leaseThenBuy,
    leaseBuyout: buyout,
    leaseWins: totalLease <= netBuy,
    diff: Math.abs(netBuy - totalLease),
    rows,
  };
}

function short(n: number) {
  n = Math.round(n);
  const a = Math.abs(n);
  if (a >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (a >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
  if (a >= 1e3) return "₹" + (n / 1e3).toFixed(1) + " K";
  return "₹" + n;
}

function full(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const RANGES: Partial<Record<keyof CalcInputs, { min: number; max: number }>> = {
  carPrice: { min: 500000, max: 5000000 },
  buyDown: { min: 0, max: 60 },
  buyRate: { min: 6, max: 16 },
  buyTenure: { min: 1, max: 8 },
  depr: { min: 5, max: 25 },
  leasePct: { min: 1, max: 4 },
  leaseTenure: { min: 1, max: 6 },
  leaseDown: { min: 0, max: 20 },
  leaseSec: { min: 0, max: 15 },
  leaseResidual: { min: 0, max: 70 },
  insurance: { min: 5000, max: 80000 },
  maint: { min: 0, max: 15000 },
  fuel: { min: 0, max: 30000 },
};

export default function LeaseCalculator() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT);
  const [chip, setChip] = useState<{ name: string } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const result = compute(inputs);
  const mx = Math.max(result.buyNet, result.leaseTotal);

  useEffect(() => {
    return onPrefill((data) => {
      setInputs((cur) => {
        const next = { ...cur };
        const set = (k: keyof CalcInputs, v: string | undefined) => {
          const num = v === undefined ? NaN : parseFloat(v);
          if (isNaN(num)) return;
          const range = RANGES[k];
          if (range) next[k] = Math.max(range.min, Math.min(range.max, num));
        };
        set("carPrice", data.price);
        set("leasePct", data.leasepct);
        set("leaseTenure", data.tenure);
        set("leaseResidual", data.residual);
        set("depr", data.depr);
        set("insurance", data.insurance);
        set("maint", data.maint);
        set("fuel", data.fuel);
        return next;
      });
      setChip({ name: data.name });
      document.getElementById("calc")?.scrollIntoView({ behavior: "smooth" });
      const panel = panelRef.current;
      if (panel) {
        panel.classList.remove("calc-flash");
        void panel.offsetWidth;
        panel.classList.add("calc-flash");
      }
    });
  }, []);

  const set = (k: keyof CalcInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((cur) => ({ ...cur, [k]: parseFloat(e.target.value) }));

  const clearChip = () => {
    setChip(null);
    setInputs(DEFAULT);
  };

  const v = (k: keyof CalcInputs) => inputs[k];

  return (
    <section className="sec calc-bg" id="calc">
      <div className="wrap">
        <Reveal className="sec-head center">
          <span className="eyebrow center">Make the smart call</span>
          <h2>Lease vs Buy calculator</h2>
          <p>
            Compare the true total cost of leasing versus buying a car in India —
            EMI, resale, hidden charges and all. Adjust the sliders to match your
            situation.
          </p>
          <div className={`calc-chip ${chip ? "show" : ""}`} id="calcChip">
            🚗 Estimating for <b id="calcChipName">{chip ? chip.name : "\u00a0"}</b>
            {chip && (
              <button
                type="button"
                id="calcChipClear"
                title="Clear selection"
                onClick={clearChip}
              >
                ✕
              </button>
            )}
          </div>
        </Reveal>

        <div className="calc-grid">
          <Reveal className="calc-panel" ref={panelRef}>
              <div className="calc-group">
                <div className="gh">
                  🚗 Car price<span className="tag">Applies to both</span>
                </div>
                <div className="ctrl">
                  <div className="lbl">
                    On-road price <b id="v_carPrice">{short(v("carPrice"))}</b>
                  </div>
                  <input
                    type="range"
                    id="carPrice"
                    min={RANGES.carPrice!.min}
                    max={RANGES.carPrice!.max}
                    step={50000}
                    value={v("carPrice")}
                    onChange={set("carPrice")}
                  />
                </div>
              </div>

              <div className="calc-group buy">
                <div className="gh">
                  💙 Buy with loan<span className="tag">Ownership</span>
                </div>
                <div className="grid2">
                  <div className="ctrl">
                    <div className="lbl">
                      Down payment{" "}
                      <b id="v_buyDown">
                        {v("buyDown")}%{" "}
                        <small id="v_buyDownAmt">
                          · {short((v("carPrice") * v("buyDown")) / 100)}
                        </small>
                      </b>
                    </div>
                    <input
                      type="range"
                      id="buyDown"
                      min={0}
                      max={60}
                      step={1}
                      value={v("buyDown")}
                      onChange={set("buyDown")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Interest rate <b id="v_buyRate">{v("buyRate").toFixed(1)}%</b>
                    </div>
                    <input
                      type="range"
                      id="buyRate"
                      min={6}
                      max={16}
                      step={0.1}
                      value={v("buyRate")}
                      onChange={set("buyRate")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Loan tenure{" "}
                      <b id="v_buyTenure">
                        {v("buyTenure")} {v("buyTenure") > 1 ? "yrs" : "yr"}
                      </b>
                    </div>
                    <input
                      type="range"
                      id="buyTenure"
                      min={1}
                      max={8}
                      step={1}
                      value={v("buyTenure")}
                      onChange={set("buyTenure")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Depreciation p.a. <b id="v_depr">{v("depr")}%</b>
                    </div>
                    <input
                      type="range"
                      id="depr"
                      min={5}
                      max={25}
                      step={1}
                      value={v("depr")}
                      onChange={set("depr")}
                    />
                  </div>
                </div>
              </div>

              <div className="calc-group lease">
                <div className="gh">
                  💚 Lease<span className="tag">No ownership</span>
                </div>
                <div className="grid2">
                  <div className="ctrl">
                    <div className="lbl">
                      Monthly lease{" "}
                      <b id="v_leasePct">
                        {v("leasePct").toFixed(2)}%{" "}
                        <small id="v_leaseAmt">
                          · {short((v("carPrice") * v("leasePct")) / 100)}
                        </small>
                      </b>
                    </div>
                    <input
                      type="range"
                      id="leasePct"
                      min={1}
                      max={4}
                      step={0.01}
                      value={v("leasePct")}
                      onChange={set("leasePct")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Lease tenure{" "}
                      <b id="v_leaseTenure">
                        {v("leaseTenure")} {v("leaseTenure") > 1 ? "yrs" : "yr"}
                      </b>
                    </div>
                    <input
                      type="range"
                      id="leaseTenure"
                      min={1}
                      max={6}
                      step={1}
                      value={v("leaseTenure")}
                      onChange={set("leaseTenure")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Down payment{" "}
                      <b id="v_leaseDown">
                        {v("leaseDown").toFixed(1)}%{" "}
                        <small id="v_leaseDownAmt">
                          · {short((v("carPrice") * v("leaseDown")) / 100)}
                        </small>
                      </b>
                    </div>
                    <input
                      type="range"
                      id="leaseDown"
                      min={0}
                      max={20}
                      step={0.1}
                      value={v("leaseDown")}
                      onChange={set("leaseDown")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Security (refundable) <b id="v_leaseSec">{v("leaseSec")}%</b>
                    </div>
                    <input
                      type="range"
                      id="leaseSec"
                      min={0}
                      max={15}
                      step={1}
                      value={v("leaseSec")}
                      onChange={set("leaseSec")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Buyout / residual <b id="v_leaseResidual">{v("leaseResidual")}%</b>
                    </div>
                    <input
                      type="range"
                      id="leaseResidual"
                      min={0}
                      max={70}
                      step={1}
                      value={v("leaseResidual")}
                      onChange={set("leaseResidual")}
                    />
                  </div>
                </div>
              </div>

              <div className="calc-group">
                <div className="gh">🔧 Common running costs</div>
                <div className="grid2">
                  <div className="ctrl">
                    <div className="lbl">
                      Annual insurance <b id="v_insurance">{short(v("insurance"))}</b>
                    </div>
                    <input
                      type="range"
                      id="insurance"
                      min={5000}
                      max={80000}
                      step={1000}
                      value={v("insurance")}
                      onChange={set("insurance")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Monthly maintenance <b id="v_maint">{short(v("maint"))}</b>
                    </div>
                    <input
                      type="range"
                      id="maint"
                      min={0}
                      max={15000}
                      step={500}
                      value={v("maint")}
                      onChange={set("maint")}
                    />
                  </div>
                  <div className="ctrl">
                    <div className="lbl">
                      Monthly fuel <b id="v_fuel">{short(v("fuel"))}</b>
                    </div>
                    <input
                      type="range"
                      id="fuel"
                      min={0}
                      max={30000}
                      step={500}
                      value={v("fuel")}
                      onChange={set("fuel")}
                    />
                  </div>
                </div>
              </div>
          </Reveal>

          <div className="calc-results">
            <Reveal delay="d1">
              <div className={`reco ${result.leaseWins ? "lease" : "buy"}`} id="reco">
                <div className="rlabel" id="recoLabel">
                  Recommendation
                </div>
                <h3 id="recoTitle">
                  {result.leaseWins ? "Lease is cheaper" : "Buying is cheaper"}
                </h3>
                <div className="save">
                  You save <b id="recoSave">{short(result.diff)}</b> over the term
                </div>
              </div>
            </Reveal>
            <Reveal delay="d1">
              <div className="scen-row">
                <div className="scen b">
                  <h4>
                    <span className="d"></span>Buy car
                  </h4>
                  <div className="big" id="buyNet">
                    {short(result.buyNet)}
                  </div>
                  <div className="cap">Net cost after resale</div>
                  <ul>
                    <li>
                      Monthly EMI <b id="buyEmi">{short(result.buyEmi)}</b>
                    </li>
                    <li>
                      Total paid <b id="buyTotal">{short(result.buyTotal)}</b>
                    </li>
                    <li>
                      Resale value <b id="buyResale">{short(result.buyResale)}</b>
                    </li>
                  </ul>
                </div>
                <div className="scen l">
                  <h4>
                    <span className="d"></span>Lease car
                  </h4>
                  <div className="big" id="leaseTotal">
                    {short(result.leaseTotal)}
                  </div>
                  <div className="cap">Total lease cost</div>
                  <ul>
                    <li>
                      Monthly payment <b id="leaseMonthly">{short(result.leaseMonthly)}</b>
                    </li>
                    <li>
                      If you buy at end <b id="leaseThenBuy">{short(result.leaseThenBuy)}</b>
                    </li>
                    <li>
                      Buyout amount <b id="leaseBuyout">{short(result.leaseBuyout)}</b>
                    </li>
                  </ul>
                </div>
              </div>
            </Reveal>
            <Reveal delay="d1">
              <div className="bars">
                <div className="bt">Cost comparison</div>
                <div className="bar b">
                  <div className="bl">
                    <span>Buy (net cost)</span>
                    <b id="barBuyVal">{short(result.buyNet)}</b>
                  </div>
                  <div className="track">
                    <div
                      className="fill"
                      id="barBuy"
                      style={{ width: `${(result.buyNet / mx) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bar l">
                  <div className="bl">
                    <span>Lease (total)</span>
                    <b id="barLeaseVal">{short(result.leaseTotal)}</b>
                  </div>
                  <div className="track">
                    <div
                      className="fill"
                      id="barLease"
                      style={{ width: `${(result.leaseTotal / mx) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay="d1">
              <details className="calc-table">
                <summary>
                  Detailed comparison table <span className="plus">+</span>
                </summary>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Buy car</th>
                      <th>Lease car</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map(([label, b, l]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{b === null ? "—" : full(b)}</td>
                        <td>{l === null ? "—" : full(l)}</td>
                      </tr>
                    ))}
                    <tr className="total">
                      <td>Net cost (after resale)</td>
                      <td>
                        <b>{full(result.buyNet)}</b>
                      </td>
                      <td>
                        <b>{full(result.leaseTotal)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </details>
            </Reveal>
            <div className="calc-note">
              Indicative estimates for guidance only. Security deposit is refundable
              and excluded from lease totals. Actual figures vary by lender, city and
              vehicle.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}