"use client";

import { useMemo, useState } from "react";
import ModelCard from "./ModelCard";
import { useStore } from "@/lib/site-store";
import {
  CARS,
  CAT_FILTERS,
  type Cat,
  type Fuel,
  type Trans,
} from "@/lib/catalog";

type Sort = "lowhigh" | "highlow" | "name";

export default function FleetExplorer() {
  const { openWishlist } = useStore();
  const [cat, setCat] = useState<Cat | "all">("all");
  const [search, setSearch] = useState("");
  const [fuel, setFuel] = useState<Fuel | "all">("all");
  const [trans, setTrans] = useState<Trans | "all">("all");
  const [sort, setSort] = useState<Sort>("lowhigh");

  const list = useMemo(() => {
    let out = CARS.filter((c) => {
      if (cat !== "all" && c.cat !== cat) return false;
      if (fuel !== "all" && c.fuel !== fuel) return false;
      if (trans !== "all" && c.trans !== trans) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${c.name} ${c.fuel} ${c.trans} ${c.seats || ""} ${c.body || ""} ${c.cat || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "lowhigh") out = [...out].sort((a, b) => a.onroad - b.onroad);
    else if (sort === "highlow") out = [...out].sort((a, b) => b.onroad - a.onroad);
    else out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [cat, search, fuel, trans, sort]);

  const clearFilters = () => {
    setCat("all");
    setSearch("");
    setFuel("all");
    setTrans("all");
    setSort("lowhigh");
  };

  return (
    <>
      <div className="wrap">
        <div className="toolbar">
          <div className="chips" id="chipRow">
            <button
              className={`chip${cat === "all" ? " active" : ""}`}
              aria-pressed={cat === "all"}
              onClick={() => setCat("all")}
            >
              All cars
            </button>
            {CAT_FILTERS.map((c) => (
              <button
                key={c}
                className={`chip${cat === c ? " active" : ""}`}
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
              >
                {c === "MUV" ? "SUV / MUV" : c}
              </button>
            ))}
          </div>
          <div className="tools-row">
            <div className="searchbox">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search e.g. creta, diesel, 7 seater"
                aria-label="Search cars"
              />
            </div>
            <div className="selwrap">
              <select
                value={fuel}
                aria-label="Filter by fuel"
                onChange={(e) => setFuel(e.target.value as Fuel | "all")}
              >
                <option value="all">All fuels</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>CNG</option>
              </select>
            </div>
            <div className="selwrap">
              <select
                value={trans}
                aria-label="Filter by transmission"
                onChange={(e) => setTrans(e.target.value as Trans | "all")}
              >
                <option value="all">All transmissions</option>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </div>
            <div className="selwrap">
              <select
                value={sort}
                aria-label="Sort cars"
                onChange={(e) => setSort(e.target.value as Sort)}
              >
                <option value="lowhigh">Price: low → high</option>
                <option value="highlow">Price: high → low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          </div>
        </div>
        <div className="resultbar">
          <div className="count" aria-live="polite">
            <b>{list.length}</b> car{list.length !== 1 ? "s" : ""} found
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button
              className="clearbtn"
              onClick={openWishlist}
              style={{ color: "var(--pink)" }}
              data-testid="fleet-view-wishlist"
            >
              ♥ View wishlist
            </button>
            <button className="clearbtn" onClick={clearFilters} data-testid="fleet-clear">
              ✕ Clear filters
            </button>
          </div>
        </div>
        <div className="fgrid" id="fleetGrid" data-testid="fleet-grid">
          {list.length ? (
            list.map((car) => <ModelCard key={car.name} car={car} showDoorstep />)
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px 0",
                color: "var(--muted)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔍</div>
              <h4 style={{ color: "var(--ink)", marginBottom: 4 }}>
                No cars match your filters
              </h4>
              <p style={{ fontSize: ".85rem" }}>
                Try widening the price range or clearing filters.
              </p>
            </div>
          )}
        </div>
      </div>

      <section className="wrap" style={{ paddingBottom: 90 }}>
        <div className="cta-strip">
          <div>
            <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              Not sure which plan?
            </span>
            <h2>Compare loan, lease &amp; subscription.</h2>
            <p>
              Pick any car and toggle between all three plans to see exactly what
              each costs per month.
            </p>
          </div>
          <a className="btn btn-gold btn-lg" href="/quote">
            Get a quote →
          </a>
        </div>
      </section>
    </>
  );
}