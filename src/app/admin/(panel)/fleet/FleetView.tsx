"use client";

import { useCallback, useEffect, useState } from "react";
import AdminModal from "../AdminModal";
import { useAdminSearch } from "../useAdminSearch";
import { inr, carPill, titleCase } from "@/lib/admin-format";
import { pushToast } from "@/lib/toast-bus";
import type { CarRow } from "../admin-types";

type Filter = "all" | "available" | "leased" | "maintenance" | "retired";

const CATEGORIES = ["HATCHBACK", "SEDAN", "SUV", "MUV", "LUXURY", "ELECTRIC"];
const FUELS = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC"];

type FormState = {
  name: string;
  brand: string;
  category: string;
  fuelType: string;
  transmission: string;
  seats: string;
  monthlySubscription: string;
  rentalRateHour: string;
  isAvailable: boolean;
  isFeatured: boolean;
};

function emptyForm(): FormState {
  return {
    name: "",
    brand: "Hyundai",
    category: "SUV",
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    seats: "5",
    monthlySubscription: "",
    rentalRateHour: "",
    isAvailable: true,
    isFeatured: false,
  };
}

export default function FleetView() {
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const q = useAdminSearch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CarRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/cars")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setCars(d.cars);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = cars.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    const haystack = [c.name, c.brand, c.category, c.fuelType, c.status]
      .join(" ")
      .toLowerCase();
    return q === "" || haystack.includes(q);
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  }

  function openEdit(c: CarRow) {
    setEditing(c);
    setForm({
      name: c.name,
      brand: c.brand,
      category: c.category,
      fuelType: c.fuelType,
      transmission: c.transmission,
      seats: String(c.seats),
      monthlySubscription: String(c.lease),
      rentalRateHour: String(c.hourly),
      isAvailable: c.status !== "maintenance",
      isFeatured: c.featured,
    });
    setError("");
    setModalOpen(true);
  }

  async function save() {
    setError("");
    if (!form.name.trim()) {
      setError("Model name is required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || "NovusLease Plus",
      category: form.category,
      fuelType: form.fuelType,
      transmission: form.transmission,
      seats: Number(form.seats) || 5,
      monthlySubscription: Number(form.monthlySubscription) || 0,
      rentalRateHour: Number(form.rentalRateHour) || 0,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/cars/${editing.id}` : "/api/admin/cars",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Save failed. Please try again.");
        return;
      }
      pushToast(editing ? "Vehicle updated" : "Vehicle added", "success");
      setModalOpen(false);
      load();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: CarRow) {
    if (!window.confirm(`Vehicle ${c.name} will be permanently deleted. Continue?`)) {
      return;
    }
    const res = await fetch(`/api/admin/cars/${c.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      pushToast(data.error ?? "Delete failed", "danger");
      return;
    }
    pushToast("Vehicle deleted", "danger");
    load();
  }

  return (
    <div className="adm-inner">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Fleet inventory</h3>
            <div className="sub" data-testid="fleet-count">
              {rows.length} vehicle{rows.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="right">
            <select
              aria-label="Filter by status"
              className="btn btn-ghost btn-sm"
              style={{ paddingRight: 8 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="leased">Leased</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <button className="btn btn-gold btn-sm" onClick={openCreate}>
              ＋ Add car
            </button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table data-testid="fleet-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Reg. no.</th>
                <th>Type</th>
                <th>Monthly lease</th>
                <th>Utilisation</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <span className="ic">🗂</span>
                      {loading
                        ? "Loading fleet…"
                        : "No vehicles match this filter"}
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="car-cell">
                      <div className="car-thumb">🚗</div>
                      <div>
                        <div className="cell-main">{c.name}</div>
                        <div className="cell-sub">{titleCase(c.fuelType)}</div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="cell-main"
                    style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
                  >
                    {c.regNo ?? "—"}
                  </td>
                  <td>{titleCase(c.category)}</td>
                  <td className="cell-main">
                    {inr(c.lease)}
                    <span className="cell-sub">/mo</span>
                  </td>
                  <td>
                    <div className="util">
                      <div className="track">
                        <div className="fill" style={{ width: `${c.util}%` }} />
                      </div>
                      <span className="pct">{c.util}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${carPill(c.status)}`}>{c.status}</span>
                  </td>
                  <td>
                    <div className="rowactions">
                      <button
                        className="btn-icon"
                        title="Edit"
                        aria-label={`Edit vehicle ${c.name}`}
                        onClick={() => openEdit(c)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        aria-label={`Delete vehicle ${c.name}`}
                        onClick={() => remove(c)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? `Edit vehicle ${editing.name}` : "Add vehicle"}
        error={error}
        saving={saving}
        onSave={save}
        onCancel={() => setModalOpen(false)}
      >
        <div className="form-grid">
          <div className="full">
            <label htmlFor="car-name">Model name</label>
            <input
              id="car-name"
              placeholder="e.g. Hyundai Creta"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="full">
            <label htmlFor="car-brand">Brand</label>
            <input
              id="car-brand"
              placeholder="e.g. Hyundai"
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="car-cat">Category</label>
            <select
              id="car-cat"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="car-fuel">Fuel</label>
            <select
              id="car-fuel"
              value={form.fuelType}
              onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))}
            >
              {FUELS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="car-trans">Transmission</label>
            <select
              id="car-trans"
              value={form.transmission}
              onChange={(e) =>
                setForm((f) => ({ ...f, transmission: e.target.value }))
              }
            >
              {TRANSMISSIONS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="car-seats">Seats</label>
            <input
              id="car-seats"
              type="number"
              min={2}
              max={12}
              value={form.seats}
              onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="car-lease">Monthly lease (₹)</label>
            <input
              id="car-lease"
              type="number"
              min={0}
              value={form.monthlySubscription}
              onChange={(e) =>
                setForm((f) => ({ ...f, monthlySubscription: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="car-hourly">Hourly rate (₹)</label>
            <input
              id="car-hourly"
              type="number"
              min={0}
              value={form.rentalRateHour}
              onChange={(e) =>
                setForm((f) => ({ ...f, rentalRateHour: e.target.value }))
              }
            />
          </div>
          <div className="full">
            <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none" }}>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, accentColor: "var(--gold-deep)" }}
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              />
              Available for lease
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none", marginTop: 8 }}>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, accentColor: "var(--gold-deep)" }}
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              />
              Featured on homepage
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}