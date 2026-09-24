"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import ModelCard from "./ModelCard";
import {
  CARS,
  PLANS,
  KM_MAX_YEAR,
  KM_MIN_YEAR,
  type Car,
  type PlanId,
  type PlanTenure,
  type QuoteControls,
  inr,
  lakh,
  monthly,
  termTotal,
  calcPlan,
  carSlug as carSlugFor,
  carFullName,
} from "@/lib/catalog";
import { PLAN_IDS } from "@/lib/terms";
import {
  carMileage,
  carPower,
  carFeatures,
  carColours,
} from "@/lib/specs";

type SubType = Extract<PlanId, "lease" | "sub">;

const TENURES: PlanTenure[] = [36, 48, 60];

const VIEWS = [
  { label: "Full view", pos: "50% 55%", scale: 1 },
  { label: "Front", pos: "24% 55%", scale: 1.55 },
  { label: "Side", pos: "50% 55%", scale: 1.2 },
  { label: "Rear", pos: "76% 55%", scale: 1.55 },
];

const SUB_TYPES: Record<SubType, { name: string; desc: string }> = {
  lease: {
    name: "Assured Buyback",
    desc: "Buyback value is fixed on day one. Steady, predictable monthly rental.",
  },
  sub: {
    name: "Flexi Advantage",
    desc: "Flexible market-rate exit. All-inclusive and cancel anytime.",
  },
};

const INC_CARDS = [
  ["🛠", "Servicing & Maintenance", "Scheduled and unscheduled servicing, including tyres, brakes, battery and engine repairs."],
  ["🛡", "Comprehensive Zero-Dep Insurance", "Zero-depreciation cover with zero deductible — consumables included for the whole term."],
  ["🆘", "24×7 Roadside Assistance", "Pan-India breakdown cover and towing support, every day of the year."],
  ["📄", "Road Tax & Registration", "White-plate registration in your name, RC and road tax handled end to end."],
  ["🤝", "Dedicated Support", "24×7 customer care and a dedicated relationship manager for your subscription."],
  ["🔁", "Extend, Return or Buy", "At term end, keep the car, upgrade or hand it back — the choice is yours."],
] as const;

function similarCars(car: Car): Car[] {
  const rest = CARS.filter((c) => c.name !== car.name);
  const sameCat = rest.filter((c) => c.cat === car.cat);
  const others = rest
    .filter((c) => c.cat !== car.cat)
    .sort(
      (a, b) =>
        Math.abs(a.onroad - car.onroad) - Math.abs(b.onroad - car.onroad)
    );
  return [...sameCat, ...others].slice(0, 6);
}

export default function VehicleDetail({ car }: { car: Car }) {
  const [subType, setSubType] = useState<SubType>("lease");
  const [tenure, setTenure] = useState<number>(48);
  const [yearKm, setYearKm] = useState<number>(KM_MIN_YEAR);
  const [view, setView] = useState(0);
  const [colour, setColour] = useState(0);

  const mileage = carMileage(car);
  const power = carPower(car);
  const features = carFeatures(car);
  const colours = carColours(car);
  const others = useMemo(() => similarCars(car), [car]);
  const quoteUrl = `/quote?car=${encodeURIComponent(car.name)}`;
  const slug = carSlugFor(car.name);
  const delivery = car.tag === "new" ? "10–12 weeks" : "4–6 weeks";

  const controls = useMemo<QuoteControls>(
    () => ({
      tenure,
      downPct: 0,
      ratePct: 9.5,
      km: yearKm,
      addons: { insurance: true, maintenance: true, rsa: false, chauffeur: false, tyre: false },
    }),
    [tenure, yearKm]
  );

  const rental = useMemo(() => calcPlan(car, subType, controls), [
    car,
    subType,
    controls,
  ]);

  const loanPlan = useMemo(() => calcPlan(car, "loan", controls), [
    car,
    controls,
  ]);

  const vs = useMemo(() => {
    const sub = rental.total;
    const loan = loanPlan.total;
    const diff = Math.round(((loan - sub) / sub) * 100);
    return {
      sub,
      loan,
      cheaperLoan: loan < sub,
      pct: Math.abs(diff),
    };
  }, [rental.total, loanPlan.total]);

  return (
    <>
      {/* ===== hero: name + starting price band ===== */}
      <section className="vd-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
            <Link href="/fleet">Fleet</Link> &nbsp;/&nbsp; {car.name}
          </div>
          <div className="vd-hero-grid">
            <div className="vd-hero-txt">
              <h1>{carFullName(car)}</h1>
              <div className="vd-tags">
                <span>{car.cls}</span>
                <span>{car.body}</span>
                <span>{car.seats}-seater</span>
                <span>{car.trans}</span>
                <span>{car.fuel}</span>
              </div>
            </div>
            <div className="vd-hero-price">
              <div className="vd-hp-main">
                {inr(monthly(car, "sub"))}
                <small>/month</small>
              </div>
              <div className="vd-hp-zero">₹0 down payment</div>
              <div className="vd-hp-dlv">🚚 Delivery in {delivery}</div>
              <Link className="vd-hp-cmp" href="/compare">
                Compare this car ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="vd-sec">
        <div className="wrap">
          <div className="vd-grid">
            {/* ===== left: gallery + colours + share ===== */}
            <div className="vd-left">
              <div className="vdgallery">
                <div
                  className="vdg-main"
                  style={{ transform: `scale(${VIEWS[view].scale})`, transformOrigin: VIEWS[view].pos }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={car.img} alt={carFullName(car)} />
                  <span className="vdg-badge">
                    {car.cls} · {car.fuel}
                  </span>
                </div>
                <div className="vdg-thumbs" aria-label="Gallery views">
                  {VIEWS.map((v, i) => (
                    <button
                      type="button"
                      key={v.label}
                      className={`vdg-thumb${view === i ? " on" : ""}`}
                      aria-pressed={view === i}
                      onClick={() => setView(i)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={car.img}
                        alt={v.label}
                        style={{ objectPosition: v.pos }}
                      />
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="vdcolours">
                <span className="vdc-lbl">Colours</span>
                <div className="vdc-swatches">
                  {colours.map((c, i) => (
                    <button
                      type="button"
                      key={c.name}
                      className={`vdc-swatch${colour === i ? " on" : ""}`}
                      style={{ background: c.hex }}
                      aria-label={c.name}
                      aria-pressed={colour === i}
                      title={c.name}
                      onClick={() => setColour(i)}
                    />
                  ))}
                </div>
                <span className="vdc-name">{colours[colour].name}</span>
              </div>

              <div className="vdg-note">
                Accessories, features and colours shown may vary from the
                vehicles available. Lease rental may vary with prices and taxes
                prevailing at the time of delivery.
              </div>

              <ShareButtons title={carFullName(car)} slug={slug} />
            </div>

            {/* ===== right: subscription model builder ===== */}
            <div className="vd-right">
              <aside className="vdd-card">
                <div className="vdd-h">
                  <h2>Subscription Models</h2>
                  <p>
                    Zero down payment. Pick a term and yearly kilometres — your
                    monthly rental updates instantly.
                  </p>
                </div>

                <div className="vdd-field">
                  <div className="vdd-lbl">Select subscription type</div>
                  <div className="vdd-seg">
                    {(Object.keys(SUB_TYPES) as SubType[]).map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`vdd-seg-btn${subType === t ? " on" : ""}`}
                        aria-pressed={subType === t}
                        onClick={() => setSubType(t)}
                      >
                        <span className="vdd-st">{SUB_TYPES[t].name}</span>
                        <small>{SUB_TYPES[t].desc}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="vdd-row">
                  <div className="vdd-field">
                    <div className="vdd-lbl">Select tenure (months)</div>
                    <div className="vdd-chips">
                      {TENURES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          className={`vdd-chip${tenure === t ? " on" : ""}`}
                          aria-pressed={tenure === t}
                          onClick={() => setTenure(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="vdd-field">
                    <div className="vdd-lbl">Select kilometres (per year)</div>
                    <div className="vdd-slider">
                      <input
                        type="range"
                        className="single"
                        min={KM_MIN_YEAR}
                        max={KM_MAX_YEAR}
                        step={5000}
                        value={yearKm}
                        aria-label="Kilometres per year"
                        onChange={(e) => setYearKm(+e.target.value)}
                      />
                      <div className="vdd-sl-row">
                        <span>{KM_MIN_YEAR.toLocaleString("en-IN")} km</span>
                        <b>{yearKm.toLocaleString("en-IN")} km/year</b>
                        <span>{KM_MAX_YEAR.toLocaleString("en-IN")} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="vdd-xkm">Excess KM rate: ₹5/km + GST</div>

                <div className="vdd-result">
                  <div className="vdd-rmain">
                    <span className="vdd-rl">Monthly rental</span>
                    <div className="vdd-rm" data-testid="vdd-rental">
                      {inr(rental.total)}
                      <small>/month</small>
                    </div>
                    <div className="vdd-rs">
                      inclusive of GST · ₹0 down payment
                    </div>
                  </div>
                  {subType === "lease" && (
                    <div className="vdd-buy">
                      <span>Buyback value at term end</span>
                      <b>{inr(car.onroad * 0.5)}</b>
                      <small>assured at term start</small>
                    </div>
                  )}
                </div>

                <Link className="btn btn-gold btn-lg vdd-cta" href={quoteUrl}>
                  Subscribe → select car & proceed
                </Link>

                <div className="vdd-trust">
                  <span>✓ No down payment</span>
                  <span>✓ GST included</span>
                  <span>✓ 24×7 RSA</span>
                </div>
              </aside>

              <div className="vdd-plan-note" data-testid="vdd-plan-note">
                {SUB_TYPES[subType].name} · {tenure} months ·{" "}
                {yearKm.toLocaleString("en-IN")} km/year —{" "}
                {inr(rental.total * tenure)} total over the term, GST included.
              </div>
            </div>
          </div>

          {/* ===== all three plans (default 36-month term totals) ===== */}
          <div className="vplans vplans-new">
            <div className="vp-head">
              <h2>All three ways to drive</h2>
              <p>
                Compare a car loan, retail lease and monthly subscription for{" "}
                {car.name}.
              </p>
            </div>
            {PLAN_IDS.map((p) => (
              <div className="vplan" key={p} data-plan={p}>
                <div className="nm">
                  {PLANS[p].icon} {PLANS[p].name}
                </div>
                <div className="m">
                  {inr(monthly(car, p))}
                  <small>/month</small>
                </div>
                <div className="total" data-testid={`vplan-total-${p}`}>
                  {inr(termTotal(car, p))} total over 36 months
                </div>
                <div className="vp-sub">
                  {p === "loan" && "You own the car at the end"}
                  {p === "lease" && "Fixed term, buy-out option"}
                  {p === "sub" && "All-inclusive, cancel anytime"}
                </div>
                <Link className="btn btn-gold" href={quoteUrl}>
                  {p === "loan"
                    ? "Get loan EMI →"
                    : p === "lease"
                    ? "Lease this car →"
                    : "Subscribe →"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== specifications ===== */}
      <section className="vd-spec-sec">
        <div className="wrap">
          <h2 className="vd-h2">Specifications</h2>
          <div className="vspecs vd-specs4">
            <div className="vspec">
              <div className="k">Fuel type</div>
              <div className="val">{car.fuel}</div>
            </div>
            <div className="vspec">
              <div className="k">Transmission</div>
              <div className="val">{car.trans}</div>
            </div>
            <div className="vspec">
              <div className="k">Seating capacity</div>
              <div className="val">{car.seats}</div>
            </div>
            <div className="vspec">
              <div className="k">{mileage.unit === "km/charge" ? "Range (ARAI)" : "Mileage (ARAI)"}</div>
              <div className="val">
                {mileage.value} {mileage.unit}
              </div>
            </div>
            <div className="vspec">
              <div className="k">Power</div>
              <div className="val">
                {power.value} {power.unit}
              </div>
            </div>
            <div className="vspec">
              <div className="k">On-road price</div>
              <div className="val">{lakh(car.onroad)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== features ===== */}
      <section className="vd-feat-sec">
        <div className="wrap">
          <h2 className="vd-h2">Features</h2>
          <div className="vd-feat-grid">
            {features.map((f) => (
              <div className="vd-feat" key={f}>
                <span className="vd-feat-ic">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== what is included ===== */}
      <section className="vd-included">
        <div className="wrap">
          <h2>What Is Included?</h2>
          <p className="vd-inc-lead">
            When you subscribe a car with NovusLease+, you never make a down
            payment to make it yours. You only pay a monthly fee that covers
            the following costs &amp; benefits.
          </p>
          <div className="vd-inc-grid">
            {INC_CARDS.map(([ic, t, d]) => (
              <div className="vd-inc" key={t}>
                <div className="vd-inc-ic">{ic}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== other cars ===== */}
      <section className="sec vd-other">
        <div className="wrap">
          <div className="sec-flex">
            <div className="sec-head">
              <h2>Other cars you might like</h2>
            </div>
            <Link className="btn btn-ghost" href="/fleet">
              Explore all cars →
            </Link>
          </div>
          <div className="rail">
            {others.map((c) => (
              <ModelCard car={c} key={c.name} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== subscription vs loan ===== */}
      <section className="sec vd-vs">
        <div className="wrap">
          <div className="vd-vs-head">
            <h2>Subscribe to a car or take a loan?</h2>
            <p>
See how the monthly outflow for {carFullName(car)} adds up
                over {tenure} months.
            </p>
          </div>
          <div className="vd-vs-grid">
            <div className="vd-vs-card sub">
              <div className="vd-vs-l">Subscription</div>
              <div className="vd-vs-m">
                {inr(vs.sub)}
                <small>/month</small>
              </div>
              <div className="vd-vs-t">
                {inr(vs.sub * tenure)} total outflow over {tenure} months
              </div>
            </div>
            <div className="vd-vs-badge">
              {vs.cheaperLoan
                ? `A loan saves you ${vs.pct}%`
                : `Subscription is ${vs.pct}% cheaper`}
            </div>
            <div className="vd-vs-card loan">
              <div className="vd-vs-l">Car Loan</div>
              <div className="vd-vs-m">
                {inr(vs.loan)}
                <small>/month</small>
              </div>
              <div className="vd-vs-t">
                {inr(vs.loan * tenure)} total outflow over {tenure} months
              </div>
            </div>
          </div>
          <div className="vd-vs-note">
            Calculated on the selections above. The loan EMI uses 9.5% p.a.
            with insurance &amp; servicing included; you own the car at the end
            of a loan. Subscription bundles insurance, servicing and 24×7
            roadside support from day one.
          </div>
          <div className="vd-vs-cta">
            <Link className="btn btn-dark btn-lg" href="/compare">
              View detailed comparison →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}