"use client";

import { useCallback, useEffect, useState } from "react";
import AdminModal from "../AdminModal";
import { useAdminSearch } from "../useAdminSearch";
import {
  bookingPill,
  fmtDate,
  initials,
  inr,
  toDateInput,
} from "@/lib/admin-format";
import { pushToast } from "@/lib/toast-bus";
import type { BookingRow, MetaData } from "../admin-types";

type Filter = "all" | "active" | "pending" | "completed" | "cancelled";

const STATUS_GROUPS: Record<Exclude<Filter, "all">, string[]> = {
  active: ["CONFIRMED", "PICKED_UP"],
  pending: ["PENDING"],
  completed: ["COMPLETED", "RETURNED"],
  cancelled: ["CANCELLED"],
};

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

type FormState = {
  userId: string;
  carId: string;
  bookingType: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: string;
};

function emptyForm(): FormState {
  return {
    userId: "",
    carId: "",
    bookingType: "MONTHLY",
    status: "PENDING",
    startDate: "",
    endDate: "",
    amount: "",
  };
}

export default function BookingsView() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const q = useAdminSearch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookingRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/admin/bookings").then((r) => r.json()),
      fetch("/api/admin/meta").then((r) => r.json()),
    ])
      .then(([b, m]) => {
        if (b.ok) setBookings(b.bookings);
        if (m.ok) setMeta(m);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function groupMatches(status: string): boolean {
    if (filter === "all") return true;
    return STATUS_GROUPS[filter].includes(status);
  }

  const rows = bookings.filter((b) => {
    if (!groupMatches(b.status)) return false;
    const haystack = [
      b.bookingRef,
      b.user.name,
      b.user.email,
      b.car.name,
      b.city.name,
      b.status,
    ]
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

  function openEdit(b: BookingRow) {
    setEditing(b);
    setForm({
      userId: b.user.id,
      carId: b.car.id,
      bookingType: b.bookingType,
      status: STATUSES.includes(b.status as (typeof STATUSES)[number])
        ? b.status
        : "PENDING",
      startDate: toDateInput(b.startDate),
      endDate: toDateInput(b.endDate),
      amount: String(Number(b.totalAmount) || 0),
    });
    setError("");
    setModalOpen(true);
  }

  async function save() {
    setError("");
    if (!form.userId || !form.carId || !form.startDate || !form.endDate) {
      setError("Please pick a customer, car, start and end date.");
      return;
    }
    setSaving(true);
    const payload = {
      userId: form.userId,
      carId: form.carId,
      bookingType: form.bookingType,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      amount: Number(form.amount) || 0,
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/bookings/${editing.id}` : "/api/admin/bookings",
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
      pushToast(
        editing ? "Booking updated" : "Booking created",
        "success"
      );
      setModalOpen(false);
      load();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: BookingRow) {
    if (!window.confirm(`Booking ${b.bookingRef} will be permanently deleted. Continue?`)) {
      return;
    }
    const res = await fetch(`/api/admin/bookings/${b.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      pushToast(data.error ?? "Delete failed", "danger");
      return;
    }
    pushToast("Booking deleted", "danger");
    load();
  }

  return (
    <div className="adm-inner">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>All bookings</h3>
            <div className="sub" data-testid="booking-count">
              {rows.length} booking{rows.length !== 1 ? "s" : ""}
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn btn-gold btn-sm" onClick={openCreate}>
              ＋ New booking
            </button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table data-testid="bookings-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Dates</th>
                <th>Amount</th>
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
                        ? "Loading bookings…"
                        : "No bookings match this filter"}
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="cell-main">{b.bookingRef}</td>
                  <td>
                    <div className="car-cell">
                      <div className="cust-av">{initials(b.user.name)}</div>
                      <div>
                        <div className="cell-main">{b.user.name}</div>
                        <div className="cell-sub">{b.city.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-main">{b.car.name}</div>
                    <div className="cell-sub">{b.bookingType.toLowerCase()}</div>
                  </td>
                  <td>
                    <div className="cell-main">{fmtDate(b.startDate)}</div>
                    <div className="cell-sub">to {fmtDate(b.endDate)}</div>
                  </td>
                  <td className="cell-main">{inr(b.totalAmount)}</td>
                  <td>
                    <span className={`pill ${bookingPill(b.status)}`}>
                      {b.status.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <div className="rowactions">
                      <button
                        className="btn-icon"
                        title="Edit"
                        aria-label={`Edit booking ${b.bookingRef}`}
                        onClick={() => openEdit(b)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        aria-label={`Delete booking ${b.bookingRef}`}
                        onClick={() => remove(b)}
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
        title={editing ? `Edit booking ${editing.bookingRef}` : "New booking"}
        error={error}
        saving={saving}
        onSave={save}
        onCancel={() => setModalOpen(false)}
      >
        <div className="form-grid">
          <div className="full">
            <label htmlFor="bk-customer">Customer</label>
            <select
              id="bk-customer"
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            >
              <option value="">Select customer…</option>
              {meta?.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </div>
          <div className="full">
            <label htmlFor="bk-car">Car</label>
            <select
              id="bk-car"
              value={form.carId}
              onChange={(e) => setForm((f) => ({ ...f, carId: e.target.value }))}
            >
              <option value="">Select car…</option>
              {meta?.cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bk-type">Booking type</label>
            <select
              id="bk-type"
              value={form.bookingType}
              onChange={(e) => setForm((f) => ({ ...f, bookingType: e.target.value }))}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="SUBSCRIPTION">Subscription</option>
            </select>
          </div>
          <div>
            <label htmlFor="bk-status">Status</label>
            <select
              id="bk-status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bk-start">Start date</label>
            <input
              id="bk-start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="bk-end">End date</label>
            <input
              id="bk-end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="full">
            <label htmlFor="bk-amount">Amount (₹)</label>
            <input
              id="bk-amount"
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}