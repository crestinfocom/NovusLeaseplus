"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { type Car, MAX_COMPARE, inr, monthly, termTotal } from "@/lib/catalog";

type ToastType = "ok" | "warn" | "pink";
interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

interface Store {
  compare: Car[];
  wish: Car[];
  toasts: Toast[];
  drawerOpen: boolean;
  modalOpen: boolean;
  toggleCompare: (car: Car) => boolean;
  toggleWish: (car: Car) => void;
  removeCompare: (name: string) => void;
  removeWish: (name: string) => void;
  clearCompare: () => void;
  clearWish: () => void;
  setCompareNow: (cars: Car[]) => void;
  moveToWish: (name: string) => void;
  moveAllToWish: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  openCompare: () => void;
  closeCompare: () => void;
  toast: (msg: string, type?: ToastType) => void;
}

const StoreCtx = createContext<Store | null>(null);

const KC = "nl_compare";
const KW = "nl_wish";
const DIALOG_FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[contenteditable="true"],[tabindex]:not([tabindex="-1"])';

function dialogFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE)).filter(
    (element) => element.tabIndex >= 0 && element.getClientRects().length > 0
  );
}

function load(k: string): Car[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(k) || "[]");
  } catch {
    return [];
  }
}

let toastId = 1;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [compare, setCompare] = useState<Car[]>([]);
  const [wish, setWish] = useState<Car[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ready = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setCompare(load(KC));
      setWish(load(KW));
      ready.current = true;
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      window.localStorage.setItem(KC, JSON.stringify(compare));
    } catch {
      /* ignore */
    }
  }, [compare]);

  useEffect(() => {
    if (!ready.current) return;
    try {
      window.localStorage.setItem(KW, JSON.stringify(wish));
    } catch {
      /* ignore */
    }
  }, [wish]);

  const toast = useCallback((msg: string, type: ToastType = "ok") => {
    const id = toastId++;
    setToasts((t) => [...t, { id, msg, type }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2500);
  }, []);

  const toggleCompare = useCallback(
    (car: Car) => {
      let blocked = false;
      setCompare((cur) => {
        if (cur.some((c) => c.name === car.name)) {
          return cur.filter((c) => c.name !== car.name);
        }
        if (cur.length >= MAX_COMPARE) {
          blocked = true;
          return cur;
        }
        return [...cur, car];
      });
      if (blocked) {
        toast(`You can compare up to ${MAX_COMPARE} cars. Remove one first.`, "warn");
      }
      return !blocked;
    },
    [toast]
  );

  const toggleWish = useCallback(
    (car: Car) => {
      setWish((cur) => {
        if (cur.some((c) => c.name === car.name)) {
          toast(car.name + " removed from wishlist");
          return cur.filter((c) => c.name !== car.name);
        }
        toast(car.name + " saved to wishlist", "pink");
        return [...cur, car];
      });
    },
    [toast]
  );

  const removeCompare = useCallback((name: string) => {
    setCompare((cur) => cur.filter((c) => c.name !== name));
  }, []);

  const removeWish = useCallback((name: string) => {
    setWish((cur) => cur.filter((c) => c.name !== name));
  }, []);

  const clearCompare = useCallback(() => {
    setCompare([]);
  }, []);

  const clearWish = useCallback(() => {
    setWish([]);
  }, []);

  const setCompareNow = useCallback((cars: Car[]) => {
    setCompare(cars);
  }, []);

  const moveToWish = useCallback(
    (name: string) => {
      setCompare((cur) => {
        const car = cur.find((c) => c.name === name);
        if (car) {
          setWish((w) => (w.some((c) => c.name === car.name) ? w : [...w, car]));
          toast(name + " moved to wishlist", "pink");
        }
        return cur.filter((c) => c.name !== name);
      });
    },
    [toast]
  );

  const moveAllToWish = useCallback(() => {
    setCompare((cur) => {
      let n = 0;
      setWish((w) => {
        const merged = [...w];
        for (const c of cur) {
          if (!merged.some((x) => x.name === c.name)) {
            merged.push(c);
            n++;
          }
        }
        return merged;
      });
      toast(n + (n !== 1 ? " cars" : " car") + " moved to wishlist", "pink");
      return [];
    });
  }, [toast]);

  const openWishlist = useCallback(() => setDrawerOpen(true), []);
  const closeWishlist = useCallback(() => setDrawerOpen(false), []);
  const openCompare = useCallback(() => {
    setCompare((cur) => {
      if (!cur.length) {
        toast("Add cars to compare first", "warn");
      } else {
        setModalOpen(true);
      }
      return cur;
    });
  }, [toast]);
  const closeCompare = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = compare.length ? "96px" : "";
  }, [compare.length]);

  const value = useMemo<Store>(
    () => ({
      compare,
      wish,
      toasts,
      drawerOpen,
      modalOpen,
      toggleCompare,
      toggleWish,
      removeCompare,
      removeWish,
      clearCompare,
      clearWish,
      setCompareNow,
      moveToWish,
      moveAllToWish,
      openWishlist,
      closeWishlist,
      openCompare,
      closeCompare,
      toast,
    }),
    [
      compare,
      wish,
      toasts,
      drawerOpen,
      modalOpen,
      toggleCompare,
      toggleWish,
      removeCompare,
      removeWish,
      clearCompare,
      clearWish,
      setCompareNow,
      moveToWish,
      moveAllToWish,
      openWishlist,
      closeWishlist,
      openCompare,
      closeCompare,
      toast,
    ]
  );

  return (
    <StoreCtx.Provider value={value}>
      {children}
      <GlobalChrome />
    </StoreCtx.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
  return ctx;
}

/* ───────────────────────── global chrome ───────────────────────── */

function GlobalChrome() {
  return (
    <>
      <CompareTray />
      <WishlistDrawer />
      <CompareModal />
      <Toasts />
    </>
  );
}

function Toasts() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toastw" id="toastw" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.type === "warn" ? " warn" : t.type === "pink" ? " pink" : ""}`}>
          <span className="ic">{t.type === "warn" ? "!" : t.type === "pink" ? "♥" : "✓"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function CompareTray() {
  const { compare, removeCompare, clearCompare, moveAllToWish, openCompare } =
    useStore();
  if (!compare.length) return null;
  const slots: (Car | null)[] = [...compare];
  while (slots.length < MAX_COMPARE) slots.push(null);
  return (
    <div className="cmptray show" id="cmptray" role="region" aria-label="Compare tray">
      <div className="wrap-wide">
        <div className="in">
          <span className="lbl">Compare</span>
          <div className="cmpslots" id="cmpslots">
            {slots.map((c, i) =>
              c ? (
                <div className="cslot" key={c.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt="" />
                  <span className="nm">{c.name}</span>
                  <button
                    className="x"
                    aria-label={`Remove ${c.name} from compare`}
                    onClick={() => removeCompare(c.name)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="cslot empty" key={i} aria-hidden="true">
                  + Add
                </div>
              )
            )}
          </div>
          <div className="acts">
            <button className="clr" onClick={clearCompare}>
              Clear all
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={moveAllToWish}
              style={{ background: "rgba(255,255,255,.1)", borderColor: "rgba(255,255,255,.25)", color: "#fff" }}
            >
              ♥ Move to wishlist
            </button>
            <button className="btn btn-gold btn-sm" onClick={openCompare}>
              ⇄ Compare ({compare.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WishlistDrawer() {
  const { wish, drawerOpen, closeWishlist, removeWish, toggleCompare, setCompareNow, clearWish, toast } =
    useStore();
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (drawerOpen) {
      drawerRef.current?.querySelector<HTMLElement>("#drClose")?.focus();
    }
  }, [drawerOpen]);

  if (!drawerOpen) return null;
  return (
    <>
      <div
        className="drawer-back show"
        id="drawerBack"
        onClick={closeWishlist}
      />
      <aside
        className="drawer show"
        id="drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your wishlist"
      >
        <div className="drawer-h">
          <div>
            <h3 id="drTitle">Your wishlist</h3>
            <div className="sub" id="drSub">
              {wish.length} car{wish.length !== 1 ? "s" : ""} saved
            </div>
          </div>
          <button className="x" id="drClose" onClick={closeWishlist} aria-label="Close wishlist">
            ✕
          </button>
        </div>
        <div className="drawer-b" id="drBody">
          {!wish.length ? (
            <div className="dempty">
              <div className="ic">♡</div>
              <h4>Your wishlist is empty</h4>
              <p>Tap the heart on any car to save it here.</p>
            </div>
          ) : (
            wish.map((c) => (
              <div className="witem" key={c.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" />
                <div className="t">
                  <h4>{c.name}</h4>
                  <div className="m">
                    {c.fuel} · {c.trans}
                  </div>
                  <div className="p">
                    {inr(monthly(c, "lease"))}
                    <span style={{ fontSize: ".7rem", color: "var(--muted)", fontWeight: 400 }}>
                      {" "}
                      /mo lease
                    </span>
                  </div>
                </div>
                <div className="acts">
                  <button title="Add to compare" onClick={() => toggleCompare(c)}>
                    ⇄
                  </button>
                  <Link title="Get a quote" href={`/quote?car=${encodeURIComponent(c.name)}`}>
                    📄
                  </Link>
                  <button
                    className="rm"
                    title="Remove"
                    onClick={() => {
                      removeWish(c.name);
                      toast("Removed from wishlist");
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-f" id="drFoot">
          {wish.length ? (
            <>
              <button
                className="btn btn-gold"
                style={{ justifyContent: "center" }}
                onClick={() => {
                  setCompareNow(wish.slice(0, MAX_COMPARE));
                  closeWishlist();
                  toast("Top picks added to compare");
                }}
              >
                ⇄ Compare top 3
              </button>
              <button
                className="btn btn-ghost"
                style={{ justifyContent: "center" }}
                onClick={() => {
                  clearWish();
                  toast("Wishlist cleared");
                }}
              >
                Clear wishlist
              </button>
            </>
          ) : (
            <Link className="btn btn-ghost" style={{ justifyContent: "center" }} href="/fleet">
              Browse the fleet →
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

/* ───────────────────── reusable card actions ───────────────────── */

function CompareModal() {
  const { compare, modalOpen, closeCompare, removeCompare, moveToWish, moveAllToWish } =
    useStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalOpen) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.querySelector<HTMLElement>("#cmpX")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCompare();
        return;
      }
      if (e.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = dialogFocusable(modal);
      if (!focusable.length) {
        e.preventDefault();
        modal.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !modal.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !modal.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [modalOpen, closeCompare]);

  useEffect(() => {
    if (!modalOpen) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousOverflowX = body.style.overflowX;
    const previousOverflowY = body.style.overflowY;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
      body.style.overflowX = previousOverflowX;
      body.style.overflowY = previousOverflowY;
    };
  }, [modalOpen]);

  if (!modalOpen) return null;

  const mins = { loan: Infinity, lease: Infinity, sub: Infinity } as Record<
    string,
    number
  >;
  for (const p of ["loan", "lease", "sub"] as const) {
    mins[p] = Math.min(...compare.map((c) => monthly(c, p)));
  }
  const minPrice = Math.min(...compare.map((c) => c.onroad));
  const maxSeats = Math.max(...compare.map((c) => c.seats || 0));

  const row = (label: string, fn: (c: Car) => string, cls?: (c: Car) => boolean) => (
    <tr key={label}>
      <td>{label}</td>
      {compare.map((c) => (
        <td key={c.name} className={`v${cls && cls(c) ? " best" : ""}`}>
          {fn(c)}
        </td>
      ))}
    </tr>
  );

  return (
    <div
      className="mback"
      id="cmpBack"
      onClick={(e) => e.target === e.currentTarget && closeCompare()}
    >
      <div
        className="modal cmp-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Compare cars"
        tabIndex={-1}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h3 style={{ fontSize: "1.2rem" }}>Compare cars</h3>
          <span id="cmpCount" style={{ fontSize: ".8rem", color: "var(--muted)" }}>
            {compare.length} of {MAX_COMPARE} selected
          </span>
          <button id="cmpX" aria-label="Close compare dialog" style={{ marginLeft: "auto", width: 34, height: 34, borderRadius: 10, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer" }} onClick={closeCompare}>
            ✕
          </button>
        </div>
        <div className="cmp-tbl-wrap" id="cmpBody" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <table className="cmp-tbl">
            <thead>
              <tr>
                <th>Specification</th>
                {compare.map((c) => (
                  <th key={c.name} className="chd">
                    <div className="cwrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.img} alt={c.name} />
                      <div className="n">{c.name}</div>
                      <div className="s">{c.cls || c.cat || ""}</div>
                      <button className="rmcol" onClick={() => removeCompare(c.name)}>
                        ✕ Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="grp">
                <td colSpan={compare.length + 1}>Vehicle</td>
              </tr>
              {row("On-road price", (c) => inr(c.onroad), (c) => c.onroad === minPrice)}
              {row("Fuel", (c) => c.fuel || "—")}
              {row("Transmission", (c) => c.trans || "—")}
              {row("Seating", (c) => (c.seats || "—") + " seater", (c) => c.seats === maxSeats)}
              {row("Body type", (c) => c.body || c.cat || "—")}
              <tr className="grp">
                <td colSpan={compare.length + 1}>Monthly cost by plan</td>
              </tr>
              {row("🏦 Car Loan", (c) => inr(monthly(c, "loan")), (c) => monthly(c, "loan") === mins.loan)}
              {row("🔑 Retail Lease", (c) => inr(monthly(c, "lease")), (c) => monthly(c, "lease") === mins.lease)}
              {row("♾️ Subscription", (c) => inr(monthly(c, "sub")), (c) => monthly(c, "sub") === mins.sub)}
              <tr className="grp">
                <td colSpan={compare.length + 1}>Total over 36 months (incl. GST)</td>
              </tr>
              {row(
                "🏦 Car Loan total",
                (c) => inr(termTotal(c, "loan")),
                (c) => termTotal(c, "loan") === Math.min(...compare.map((x) => termTotal(x, "loan")))
              )}
              {row(
                "🔑 Retail Lease total",
                (c) => inr(termTotal(c, "lease")),
                (c) => termTotal(c, "lease") === Math.min(...compare.map((x) => termTotal(x, "lease")))
              )}
              {row(
                "♾️ Subscription total",
                (c) => inr(termTotal(c, "sub")),
                (c) => termTotal(c, "sub") === Math.min(...compare.map((x) => termTotal(x, "sub")))
              )}
              <tr className="grp">
                <td colSpan={compare.length + 1}>Included</td>
              </tr>
              {row("Insurance", () => "Lease & Sub ✓")}
              {row("Maintenance", () => "Lease & Sub ✓")}
              {row("Down payment", () => "₹0 on Sub")}
              <tr>
                <td>Action</td>
                {compare.map((c) => (
                  <td key={c.name} className="v">
                    <div className="actcell">
                      <Link
                        className="btn btn-gold btn-sm"
                        style={{ fontSize: ".75rem", padding: "8px 14px" }}
                        href={`/quote?car=${encodeURIComponent(c.name)}`}
                      >
                        📄 Quote
                      </Link>
                      <button
                        className="rmcol"
                        style={{ color: "var(--pink)" }}
                        onClick={() => moveToWish(c.name)}
                      >
                        ♥ Move to wishlist
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button className="btn btn-ghost btn-sm" onClick={moveAllToWish}>
            ♥ Move all to wishlist
          </button>
          <Link className="btn btn-gold btn-sm" href="/quote">
            📄 Get a quote
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── reusable card actions ───────────────────── */

export function CarIconActions({ car }: { car: Car }) {
  const { compare, wish, toggleCompare, toggleWish } = useStore();
  const inC = compare.some((c) => c.name === car.name);
  const inW = wish.some((c) => c.name === car.name);
  return (
    <div className="card-acts">
      <button
        className={`icobtn wish js-wish${inW ? " on" : ""}`}
        title="Save to wishlist"
        aria-pressed={inW}
        onClick={() => toggleWish(car)}
      >
        {inW ? "♥" : "♡"}
      </button>
      <button
        className={`icobtn cmp js-cmp${inC ? " on" : ""}`}
        title="Add to compare"
        aria-pressed={inC}
        onClick={() => toggleCompare(car)}
      >
        ⇄
      </button>
    </div>
  );
}

export function CarRowActions({ car }: { car: Car }) {
  const { compare, wish, toggleCompare, toggleWish } = useStore();
  const inC = compare.some((c) => c.name === car.name);
  const inW = wish.some((c) => c.name === car.name);
  return (
    <div className="cmprow-btn">
      <button className={`js-cmp${inC ? " on" : ""}`} onClick={() => toggleCompare(car)}>
        ⇄ {inC ? "Added" : "Compare"}
      </button>
      <button className={`wish js-wish${inW ? " on" : ""}`} onClick={() => toggleWish(car)}>
        {inW ? "♥ Saved" : "♡ Wishlist"}
      </button>
    </div>
  );
}

export function carModelClass(car: Car, compare: Car[]): string {
  return compare.some((c) => c.name === car.name) ? "cmp-on" : "";
}