"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CARS,
  CITIES,
  PLANS,
  type Car,
  type PlanId,
  inr,
  calcPlan,
  quoteRef,
} from "@/lib/catalog";
import { useStore, CarIconActions } from "@/lib/site-store";

const R_MIN = 500000;
const R_MAX = 5000000;

type Tab = "popular" | "new" | "all" | "wish";
type ModalState = null | "quote" | "approve" | "ok";
type ByMode = "brand" | "body";

interface Opt {
  v: string;
  n: number;
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: Opt[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const opts = options.filter(
    (o) =>
      !q.trim().toLowerCase() || o.v.toLowerCase().includes(q.trim().toLowerCase())
  );
  const arr = [...selected];

  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) {
      next.delete(v);
    } else {
      next.add(v);
    }
    onChange(next);
  };

  return (
    <div className={`ms${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="ms-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          setQ("");
        }}
      >
        {!arr.length ? (
          <span className="ms-ph">{placeholder}</span>
        ) : (
          arr
            .slice(0, 2)
            .map((v) => <span className="ms-tag" key={v}>{v}</span>)
            .concat(
              arr.length > 2
                ? [<span className="ms-more" key="m">+{arr.length - 2}</span>]
                : []
            )
        )}
      </button>
      {open && (
        <div className="ms-pop" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            className="ms-search"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <div className="ms-list">
            {opts.length ? (
              opts.map((o) => (
                <label className="ms-opt" key={o.v}>
                  <input
                    type="checkbox"
                    checked={selected.has(o.v)}
                    onChange={() => toggle(o.v)}
                  />
                  <span>{o.v}</span>
                  <span className="cnt">{o.n}</span>
                </label>
              ))
            ) : (
              <div className="ms-empty">No matches</div>
            )}
          </div>
          <div className="ms-actions">
            <button
              type="button"
              onClick={() => onChange(new Set(options.map((o) => o.v)))}
            >
              Select all
            </button>
            <button type="button" onClick={() => onChange(new Set())}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteBuilder() {
  const { wish, toast } = useStore();
  const searchParams = useSearchParams();

  const [byMode, setByMode] = useState<ByMode>("brand");
  const [selMake, setSelMake] = useState<Set<string>>(new Set());
  const [selModel, setSelModel] = useState<Set<string>>(new Set());
  const [lo, setLo] = useState(R_MIN);
  const [hi, setHi] = useState(R_MAX);
  const [fuel, setFuel] = useState<Set<string>>(new Set(["Petrol", "Diesel"]));
  const [gear, setGear] = useState<Set<string>>(new Set(["Manual", "Automatic"]));
  const [tab, setTab] = useState<Tab>("popular");
  const [selected, setSelected] = useState<Car | null>(null);
  const [plan, setPlan] = useState<PlanId>("lease");
  const [tenure, setTenure] = useState(36);
  const [downPct, setDownPct] = useState(0);
  const [ratePct, setRatePct] = useState(9.5);
  const [km, setKm] = useState<1500 | 2500 | 3600>(1500);
  const [addons, setAddons] = useState({
    insurance: true,
    maintenance: true,
    rsa: false,
    chauffeur: false,
    tyre: false,
  });
  const [modal, setModal] = useState<ModalState>(null);
  const [okBody, setOkBody] = useState<ReactNode>(null);
  const [okTitle, setOkTitle] = useState("");

  const [qn, setQn] = useState("");
  const [qc, setQc] = useState("");
  const [qe, setQe] = useState("");
  const [qp, setQp] = useState("");
  const [qscope, setQscope] = useState<string>("one");
  const [qnote, setQnote] = useState("");
  const [an, setAn] = useState("");
  const [ae, setAe] = useState("");
  const [acc, setAcc] = useState("");
  const [ap, setAp] = useState("Normal");
  const [am, setAm] = useState("");

  const fillRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const qbRef = useRef<HTMLDivElement>(null);
  const rpanelRef = useRef<HTMLDivElement>(null);

  const controls = useMemo(
    () => ({ tenure, downPct, ratePct, km, addons }),
    [tenure, downPct, ratePct, km, addons]
  );

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    const mn = R_MIN;
    const mx = R_MAX;
    el.style.left = ((lo - mn) / (mx - mn)) * 100 + "%";
    el.style.width = ((hi - lo) / (mx - mn)) * 100 + "%";
  }, [lo, hi]);

  const makeKey = byMode === "brand" ? "make" : "body";

  const makeOptions = useMemo(() => {
    const m: Record<string, number> = {};
    CARS.forEach((c) => {
      m[c[makeKey]] = (m[c[makeKey]] || 0) + 1;
    });
    return Object.keys(m)
      .sort()
      .map((v) => ({ v, n: m[v] } as Opt));
  }, [makeKey]);

  const modelOptions = useMemo(() => {
    const pool = selMake.size
      ? CARS.filter((c) => selMake.has(c[makeKey]))
      : CARS;
    const m: Record<string, number> = {};
    pool.forEach((c) => (m[c.name] = (m[c.name] || 0) + 1));
    return Object.keys(m)
      .sort()
      .map((v) => ({ v, n: m[v] } as Opt));
  }, [selMake, makeKey]);

  const matches = (c: Car) =>
    (!selMake.size || selMake.has(c[makeKey])) &&
    (!selModel.size || selModel.has(c.name)) &&
    c.onroad >= lo &&
    c.onroad <= hi &&
    fuel.has(c.fuel) &&
    gear.has(c.trans);

  const list = useMemo(() => {
    if (tab === "wish") return CARS.filter((c) => wish.some((w) => w.name === c.name));
    let out = CARS.filter(matches);
    if (tab !== "all") out = out.filter((c) => c.tag === tab);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, wish, selMake, selModel, lo, hi, fuel, gear, makeKey]);

  const R = useMemo(
    () =>
      selected
        ? {
            loan: calcPlan(selected, "loan", controls),
            lease: calcPlan(selected, "lease", controls),
            sub: calcPlan(selected, "sub", controls),
          }
        : null,
    [selected, controls]
  );

  const maxTotal = R ? Math.max(R.loan.total, R.lease.total, R.sub.total) || 1 : 1;
  const bundled = plan === "sub";

  const setCheck = (k: keyof typeof addons, v: boolean) => {
    if (bundled && (k === "insurance" || k === "maintenance")) return;
    setAddons((prev) => ({ ...prev, [k]: v }));
  };

  const scrollToQb = () => {
    setTimeout(
      () => qbRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      350
    );
  };

  /* init from ?car= */
  useEffect(() => {
    const t = window.setTimeout(() => {
      const uc = searchParams.get("car");
      if (uc) {
        const hit = CARS.find((c) => c.name.toLowerCase() === uc.toLowerCase());
        if (hit) {
          setSelected(hit);
          setTab("all");
          scrollToQb();
        }
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  const setPlanAndSync = (p: PlanId) => {
    setPlan(p);
  };

  const needCar = () => {
    if (!selected) {
      toast("Please select a car first", "warn");
      rpanelRef.current?.scrollIntoView({ behavior: "smooth" });
      return true;
    }
    return false;
  };

  const openQuoteModal = () => {
    if (needCar()) return;
    setQn("");
    setQc("");
    setQe("");
    setQp("");
    setQscope("one");
    setQnote("");
    setModal("quote");
  };

  const submitQuote = () => {
    const n = qn.trim();
    const e = qe.trim();
    const p = qp.trim();
    if (!n || !e || !p) {
      toast("Please fill all required fields", "warn");
      return;
    }
    const Rnow = {
      loan: calcPlan(selected!, "loan", controls),
      lease: calcPlan(selected!, "lease", controls),
      sub: calcPlan(selected!, "sub", controls),
    };
    const ref = quoteRef("NLQ");
    const body =
      qscope === "all" ? (
        <>
          <p style={{ margin: "10px 0 4px" }}>
            <b>{selected!.name}</b> · {tenure} months
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "grid",
              gap: 8,
              margin: "12px 0",
            }}
          >
            {(["loan", "lease", "sub"] as PlanId[]).map((k) => (
              <li
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "9px 13px",
                  background: "var(--cream)",
                  borderRadius: 9,
                }}
              >
                <span>
                  {PLANS[k].icon} {PLANS[k].name}
                </span>
                <b>{inr(Rnow[k].total)}/mo</b>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p>
            <b>{selected!.name}</b> · {PLANS[plan].name}
          </p>
          <p
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: "1.6rem",
              color: "var(--gold-deep)",
              fontWeight: 700,
              margin: "10px 0",
            }}
          >
            {inr(Rnow[plan].total)}/mo
          </p>
        </>
      );
    setOkTitle("Quote generated");
    setOkBody(
      <div className="okbox">
        <div className="ic">✓</div>
        <h3>Your quote is ready</h3>
        {body}
        <p>
          Emailed to <b>{e}</b>.
        </p>
        <div className="refno">Ref: {ref}</div>
      </div>
    );
    setModal("ok");
    toast("Quote " + ref + " created");
  };

  const openApproveModal = () => {
    if (needCar()) return;
    setAn("");
    setAe("");
    setAcc("");
    setAp("Normal");
    setAm("");
    setModal("approve");
  };

  const submitApprove = () => {
    const n = an.trim();
    const e = ae.trim();
    if (!n || !e) {
      toast("Approver name and email are required", "warn");
      return;
    }
    const ref = quoteRef("NLA");
    setOkTitle("Sent for approval");
    setOkBody(
      <div className="okbox">
        <div className="ic">✉</div>
        <h3>Approval request sent</h3>
        <p>
          Your <b>{PLANS[plan].name}</b> quote for <b>{selected!.name}</b> (
          {inr(R![plan].total)}/mo) was sent to <b>{n}</b>.
        </p>
        <div className="refno">Ref: {ref}</div>
      </div>
    );
    setModal("ok");
    toast("Approval request sent");
  };

  const crumb = (
    <div className="crumb">
      <Link href="/">Home</Link> &nbsp;/&nbsp; Get a Quote
    </div>
  );

  return (
    <>
      <section className="qhead">
        <div className="wrap-wide">
          {crumb}
          <h1>Build your personalised quote</h1>
          <p>
            Filter the fleet, compare up to 3 cars, save favourites — then toggle
            between a <b>car loan</b>, <b>retail lease</b> and{" "}
            <b>monthly subscription</b>.
          </p>
        </div>
      </section>

      <div className="wrap-wide">
        <div className="qlayout">
          <aside className="panel">
            <div className="panel-h">
              <h3>Start your dream car search here</h3>
              <div className="sub">Filter the fleet to match your needs</div>
            </div>
            <div className="panel-b">
              <div className="fgrp">
                <div className="flabel">
                  Pick your plan<span className="req">*</span>
                </div>
                <div className="sel">
                  <select
                    value={plan}
                    onChange={(e) => setPlanAndSync(e.target.value as PlanId)}
                  >
                    <option value="loan">Car Loan</option>
                    <option value="lease">Retail Car Lease</option>
                    <option value="sub">Monthly Subscription</option>
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <div className="flabel">
                  Registration city<span className="req">*</span>
                  <span className="tip" title="City of registration">?</span>
                </div>
                <div className="sel">
                  <select>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <div className="seg">
                  <button
                    className={byMode === "brand" ? "on" : ""}
                    onClick={() => {
                      setByMode("brand");
                      setSelMake(new Set());
                      setSelModel(new Set());
                    }}
                  >
                    By brand
                  </button>
                  <button
                    className={byMode === "body" ? "on" : ""}
                    onClick={() => {
                      setByMode("body");
                      setSelMake(new Set());
                      setSelModel(new Set());
                    }}
                  >
                    By body type
                  </button>
                </div>
              </div>
              <div className="fgrp duo">
                <div>
                  <div className="flabel">
                    {byMode === "brand" ? "Make" : "Body type"}
                    <span className="req">*</span>
                  </div>
                  <MultiSelect
                    options={makeOptions}
                    selected={selMake}
                    onChange={(s) => {
                      setSelMake(s);
                      const pool = s.size
                        ? CARS.filter((c) => s.has(c[makeKey]))
                        : CARS;
                      const ok = new Set(pool.map((c) => c.name));
                      setSelModel(
                        (prev) => new Set([...prev].filter((v) => ok.has(v)))
                      );
                    }}
                    placeholder={byMode === "brand" ? "All makes" : "All body types"}
                  />
                </div>
                <div>
                  <div className="flabel">
                    Model<span className="req">*</span>
                  </div>
                  <MultiSelect
                    options={modelOptions}
                    selected={selModel}
                    onChange={setSelModel}
                    placeholder="All models"
                  />
                </div>
              </div>
              <div className="fgrp">
                <div className="flabel">
                  Ex-showroom price<span className="req">*</span>
                </div>
                <div className="range-wrap">
                  <div className="range-track"></div>
                  <div className="range-fill" ref={fillRef}></div>
                  <input
                    type="range"
                    min={R_MIN}
                    max={R_MAX}
                    step={10000}
                    value={lo}
                    onChange={(e) => {
                      let v = +e.target.value;
                      if (v > hi - 100000) v = hi - 100000;
                      setLo(v);
                    }}
                  />
                  <input
                    type="range"
                    min={R_MIN}
                    max={R_MAX}
                    step={10000}
                    value={hi}
                    onChange={(e) => {
                      let v = +e.target.value;
                      if (v < lo + 100000) v = lo + 100000;
                      setHi(v);
                    }}
                  />
                </div>
                <div className="range-vals">
                  <div className="rv">
                    <label>From</label>
                    <div>{inr(lo)}</div>
                  </div>
                  <div className="rv">
                    <label>To</label>
                    <div>{inr(hi)}</div>
                  </div>
                </div>
              </div>
              <div className="fgrp">
                <div className="flabel">
                  Fuel type<span className="req">*</span>
                </div>
                <div className="opts">
                  {(["Electric", "Petrol", "Diesel", "CNG"] as const).map((f) => (
                    <button
                      key={f}
                      className={`opt${fuel.has(f) ? " on" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setFuel((prev) => {
                          const next = new Set(prev);
                          if (next.has(f)) {
                            next.delete(f);
                          } else {
                            next.add(f);
                          }
                          if (!next.size) next.add(f);
                          return next;
                        });
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="fgrp">
                <div className="flabel">
                  Gear type<span className="req">*</span>
                </div>
                <div className="opts">
                  {(["Manual", "Automatic"] as const).map((g) => (
                    <button
                      key={g}
                      className={`opt${gear.has(g) ? " on" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setGear((prev) => {
                          const next = new Set(prev);
                          if (next.has(g)) {
                            next.delete(g);
                          } else {
                            next.add(g);
                          }
                          if (!next.size) next.add(g);
                          return next;
                        });
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="searchbtn"
                onClick={() => {
                  setTab("all");
                  toast("Filters applied");
                  rpanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                🔍 Search cars
              </button>
              <button
                className="resetbtn"
                onClick={() => {
                  setByMode("brand");
                  setSelMake(new Set());
                  setSelModel(new Set());
                  setLo(R_MIN);
                  setHi(R_MAX);
                  setFuel(new Set(["Petrol", "Diesel"]));
                  setGear(new Set(["Manual", "Automatic"]));
                  toast("Filters reset");
                }}
              >
                Reset all filters
              </button>
            </div>
          </aside>

          <main>
            <div className="rpanel" ref={rpanelRef}>
              <div className="rhead">
                <h2>Ready for a gear change?</h2>
              </div>
              <div className="steps3">
                <div className="s3 a">
                  <span className="n">01</span>
                  <span className="t">Compare different cars</span>
                </div>
                <div className="s3 b">
                  <span className="n">02</span>
                  <span className="t">Create personalised quotes</span>
                </div>
                <div className="s3 c">
                  <span className="n">03</span>
                  <span className="t">Send for approval</span>
                </div>
              </div>
              <div className="tabs" data-testid="quote-tabs">
                {(
                  [
                    ["popular", "Popular cars"],
                    ["new", "New launches"],
                    ["all", "All results"],
                    ["wish", "♥ Wishlist"],
                  ] as [Tab, string][]
                ).map(([t, label]) => (
                  <button
                    key={t}
                    className={`tab${tab === t ? " on" : ""}`}
                    data-t={t}
                    onClick={() => setTab(t)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="carousel">
                <button
                  className="cbtn prev"
                  onClick={() => railRef.current?.scrollBy({ left: -520, behavior: "smooth" })}
                >
                  ‹
                </button>
                <button
                  className="cbtn next"
                  onClick={() => railRef.current?.scrollBy({ left: 520, behavior: "smooth" })}
                >
                  ›
                </button>
                <div className="crail" ref={railRef}>
                  {list.length ? (
                    list.map((c) => (
                      <div
                        key={c.name}
                        className={`qcard${selected && selected.name === c.name ? " sel" : ""}`}
                        data-car={c.name}
                        data-testid="qcard"
                        onClick={() => {
                          setSelected(c);
                          toast(c.name + " selected");
                        }}
                      >
                        <div className="p">
                          <span className="tag">
                            {c.tag === "new" ? "New launch" : "Popular"}
                          </span>
                          <CarIconActions car={c} />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.img} alt={c.name} loading="lazy" />
                        </div>
                        <div className="bd">
                          <h4>{c.name}</h4>
                          <div className="meta">
                            {c.fuel} · {c.trans} · {c.seats}-seat
                          </div>
                          <div className="pr">
                            {inr(calcPlan(c, plan, controls).total)}
                            <small>/mo</small>
                          </div>
                          <button
                            className="pick js-pick"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                              scrollToQb();
                              toast(c.name + " selected");
                            }}
                          >
                            {selected && selected.name === c.name
                              ? "✓ Selected"
                              : "Select car"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="cempty" data-testid="q-empty">
                      <div className="ic">{tab === "wish" ? "♡" : "🔍"}</div>
                      <h4>
                        {tab === "wish"
                          ? "Your wishlist is empty"
                          : "No cars match your filters"}
                      </h4>
                      <p>
                        {tab === "wish"
                          ? "Tap the heart on any car to save it."
                          : "Try widening the price range."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="qb" ref={qbRef} data-testid="quote-builder">
              <div className="qb-h">
                <div>
                  <h2>Your personalised quote</h2>
                  <div className="sub">Toggle a plan below — every figure updates instantly</div>
                </div>
                <span className="pillsel" data-testid="sel-car">
                  {selected ? "🚗 " + selected.name : "No car selected"}
                </span>
              </div>
              <div className="plantabs" data-testid="plan-tabs">
                {(["loan", "lease", "sub"] as PlanId[]).map((p) => (
                  <button
                    key={p}
                    className={`ptab${plan === p ? " on" : ""}`}
                    data-p={p}
                    onClick={() => setPlanAndSync(p)}
                  >
                    {p === "sub" && <span className="best">FLEXIBLE</span>}
                    <span className="pi">{PLANS[p].icon}</span>
                    <div className="pn">{PLANS[p].name}</div>
                    <div className="pd">
                      {p === "loan"
                        ? "Buy it — you own the asset"
                        : p === "lease"
                        ? "Fixed term, buy-out option"
                        : "All-inclusive, cancel anytime"}
                    </div>
                    <div className="pm">
                      {R ? inr(R[p].total) : "—"}
                      <small>/mo</small>
                    </div>
                  </button>
                ))}
              </div>
              <div className="qb-grid">
                <div className="qb-left">
                  <div className="ctrl">
                    <div className="lbl">
                      <span>{plan === "loan" ? "Loan tenure" : plan === "sub" ? "Commitment" : "Lease tenure"}</span>
                      <b>{tenure} months</b>
                    </div>
                    <input
                      type="range"
                      className="single"
                      min={12}
                      max={60}
                      step={12}
                      value={tenure}
                      onChange={(e) => setTenure(+e.target.value)}
                    />
                  </div>
                  <div className="ctrl" id="ctrlDown" style={{ display: plan === "sub" ? "none" : "" }}>
                    <div className="lbl">
                      <span>Down payment</span>
                      <b>{downPct ? `${inr((selected?.onroad || 0) * downPct / 100)} (${downPct}%)` : "₹0"}</b>
                    </div>
                    <input
                      type="range"
                      className="single"
                      min={0}
                      max={40}
                      step={1}
                      value={downPct}
                      onChange={(e) => setDownPct(+e.target.value)}
                    />
                  </div>
                  <div className={`ctrl hideable${plan !== "loan" ? " off" : ""}`} id="ctrlRate">
                    <div className="lbl">
                      <span>Interest rate</span>
                      <b>{ratePct.toFixed(1)}%</b>
                    </div>
                    <input
                      type="range"
                      className="single"
                      min={6}
                      max={16}
                      step={0.1}
                      value={ratePct}
                      onChange={(e) => setRatePct(+e.target.value)}
                    />
                  </div>
                  <div className={`ctrl hideable${plan === "loan" ? " off" : ""}`} id="ctrlKm">
                    <div className="lbl">
                      <span>Monthly kilometres</span>
                      <b>{km.toLocaleString("en-IN")} km</b>
                    </div>
                    <div className="kmopts">
                      {([1500, 2500, 3600] as const).map((k) => (
                        <button
                          key={k}
                          className={`opt${km === k ? " on" : ""}`}
                          onClick={() => setKm(k)}
                        >
                          {k.toLocaleString("en-IN")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ctrl">
                    <div className="lbl" style={{ marginBottom: 12 }}>
                      <span>Add-ons</span>
                      <b style={{ fontFamily: "Inter", fontSize: ".74rem", fontWeight: 600, color: "var(--muted)" }}>
                        {bundled ? "· insurance & servicing always bundled" : ""}
                      </b>
                    </div>
                    <div className="addons">
                      {(
                        [
                          ["insurance", "Comprehensive insurance", "Zero-dep cover, renewals handled"],
                          ["maintenance", "Maintenance & servicing", "Scheduled service + wear items"],
                        ] as const
                      ).map(([k, t, s]) => (
                        <label className={`addon${bundled ? " locked" : ""}`} key={k}>
                          <input
                            type="checkbox"
                            checked={addons[k]}
                            disabled={bundled}
                            onChange={(e) => setCheck(k, e.target.checked)}
                          />
                          <span className="txt">
                            <span className="t">{t}</span>
                            <span className="s">{s}</span>
                          </span>
                          <span className="amt">{plan === "loan" ? "You pay" : "Included"}</span>
                        </label>
                      ))}
                      {(
                        [
                          ["rsa", "24×7 roadside assistance", "Pan-India breakdown cover", "+₹499"],
                          ["chauffeur", "Chauffeur service", "Trained driver, 26 days/month", "+₹18,000"],
                          ["tyre", "Tyre & battery cover", "Replacement included in term", "+₹899"],
                        ] as const
                      ).map(([k, t, s, amt]) => (
                        <label className="addon" key={k}>
                          <input
                            type="checkbox"
                            checked={addons[k]}
                            onChange={(e) => setCheck(k, e.target.checked)}
                          />
                          <span className="txt">
                            <span className="t">{t}</span>
                            <span className="s">{s}</span>
                          </span>
                          <span className="amt">{amt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="qb-right">
                  <div className="qtotal">
                    <div className="l">{selected ? PLANS[plan].label : "Estimated monthly outflow"}</div>
                    <div className="v">
                      {R ? inr(R[plan].total) : "₹0"}
                      <small>/mo</small>
                    </div>
                    <div className="s">
                      {selected
                        ? `${PLANS[plan].icon} ${PLANS[plan].name} · ${selected.name} · ${tenure} months${plan !== "loan" ? ` · ${km.toLocaleString("en-IN")} km/mo` : ""}`
                        : "Select a car to generate your quote"}
                    </div>
                  </div>
                  <div className="cmpbox">
                    <div className="ct">All three plans compared</div>
                    {(
                      [
                        ["loan", "🏦 Car Loan"],
                        ["lease", "🔑 Retail Lease"],
                        ["sub", "♾️ Subscription"],
                      ] as [PlanId, string][]
                    ).map(([p, nm]) => (
                      <div className="crow" key={p}>
                        <span className="nm">{nm}</span>
                        <span className="tr">
                          <span
                            className="fl"
                            style={{ width: R ? (R[p].total / maxTotal) * 100 + "%" : "0%" }}
                          ></span>
                        </span>
                        <span className="vv">{R ? inr(R[p].total) : "—"}</span>
                      </div>
                    ))}
                  </div>
                  <ul className="brk" data-testid="breakdown">
                    {selected && R
                      ? R[plan].rows.map((r) => (
                          <li key={r[0]}>
                            <span>{r[0]}</span>
                            <b>{r[1] ? inr(r[1] as number) : "Included"}</b>
                          </li>
                        ))
                      : null}
                    {selected && R ? (
                      <li className="tot">
                        <span>Total monthly</span>
                        <b>{inr(R[plan].total)}</b>
                      </li>
                    ) : null}
                    {selected && R && R[plan].down ? (
                      <li>
                        <span>One-time down payment</span>
                        <b>{inr(R[plan].down)}</b>
                      </li>
                    ) : null}
                    {selected && R && plan === "loan" && R.loan.own ? (
                      <li className="own">
                        <span>Car value you keep at end</span>
                        <b>{inr(R.loan.own)}</b>
                      </li>
                    ) : null}
                    {selected && plan === "lease" ? (
                      <li>
                        <span>Buy-out at term end (50%)</span>
                        <b>{inr(selected.onroad * 0.5)}</b>
                      </li>
                    ) : null}
                    {selected && plan === "sub" ? (
                      <li className="own">
                        <span>Cancel anytime</span>
                        <b>30 days notice</b>
                      </li>
                    ) : null}
                  </ul>
                  <div className="qactions">
                    <button className="btn btn-gold btn-lg" onClick={openQuoteModal}>
                      📄 Create personalised quote
                    </button>
                    <button className="btn btn-ghost" onClick={openApproveModal}>
                      ✉️ Send for approval
                    </button>
                  </div>
                  <div className="qnote">
                    {selected ? PLANS[plan].note : "Indicative quote inclusive of GST. Final pricing confirmed after KYC and credit assessment."}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* modal */}
      <div className={`mback2${modal ? " show" : ""}`} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
        <div className="modal2">
          <div className="mh">
            <h3>
              {modal === "quote"
                ? "Create your quote"
                : modal === "approve"
                ? "Send for approval"
                : okTitle}
            </h3>
            <button className="x" onClick={() => setModal(null)}>
              ✕
            </button>
          </div>

          {modal === "quote" && (
            <>
              <div className="mb">
                <div className="fform">
                  <div>
                    <label>Full name *</label>
                    <input data-testid="q-name" placeholder="Deepak Kumar" value={qn} onChange={(e) => setQn(e.target.value)} />
                  </div>
                  <div>
                    <label>Company</label>
                    <input data-testid="q-company" placeholder="LTIMindtree" value={qc} onChange={(e) => setQc(e.target.value)} />
                  </div>
                  <div>
                    <label>Work email *</label>
                    <input data-testid="q-email" type="email" placeholder="you@company.com" value={qe} onChange={(e) => setQe(e.target.value)} />
                  </div>
                  <div>
                    <label>Mobile *</label>
                    <input data-testid="q-phone" placeholder="+91 98450 00000" value={qp} onChange={(e) => setQp(e.target.value)} />
                  </div>
                  <div className="full">
                    <label>Include in quote</label>
                    <select value={qscope} onChange={(e) => setQscope(e.target.value)}>
                      <option value="one">{PLANS[plan].name} only</option>
                      <option value="all">All three plans (comparison)</option>
                    </select>
                  </div>
                  <div className="full">
                    <label>Notes</label>
                    <textarea rows={2} value={qnote} onChange={(e) => setQnote(e.target.value)}></textarea>
                  </div>
                </div>
              </div>
              <div className="mf">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button className="btn btn-gold" data-testid="q-submit" onClick={submitQuote}>
                  Generate quote
                </button>
              </div>
            </>
          )}

          {modal === "approve" && (
            <>
              <div className="mb">
                <div className="fform">
                  <div className="full">
                    <label>Approver name *</label>
                    <input data-testid="a-name" placeholder="Reporting manager" value={an} onChange={(e) => setAn(e.target.value)} />
                  </div>
                  <div className="full">
                    <label>Approver email *</label>
                    <input data-testid="a-email" type="email" placeholder="manager@company.com" value={ae} onChange={(e) => setAe(e.target.value)} />
                  </div>
                  <div>
                    <label>Cost centre</label>
                    <input value={acc} onChange={(e) => setAcc(e.target.value)} />
                  </div>
                  <div>
                    <label>Priority</label>
                    <select value={ap} onChange={(e) => setAp(e.target.value)}>
                      <option>Normal</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div className="full">
                    <label>Message</label>
                    <textarea rows={2} value={am} onChange={(e) => setAm(e.target.value)}></textarea>
                  </div>
                </div>
              </div>
              <div className="mf">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button className="btn btn-gold" data-testid="a-submit" onClick={submitApprove}>
                  Send request
                </button>
              </div>
            </>
          )}

          {modal === "ok" && (
            <>
              <div className="mb">{okBody}</div>
              <div className="mf" style={{ justifyContent: "center" }}>
                <button className="btn btn-gold" data-testid="ok-close" onClick={() => setModal(null)}>
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}