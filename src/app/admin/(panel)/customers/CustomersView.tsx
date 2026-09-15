"use client";

import { useCallback, useEffect, useState } from "react";
import AdminModal from "../AdminModal";
import { useAdminSearch } from "../useAdminSearch";
import { initials, inr, kycPill } from "@/lib/admin-format";
import { pushToast } from "@/lib/toast-bus";
import type { CustomerRow } from "../admin-types";

const STATUSES = ["VERIFIED", "PENDING", "REJECTED"];

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
};

function emptyForm(): FormState {
  return { name: "", email: "", phone: "", city: "", status: "VERIFIED" };
}

export default function CustomersView() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const q = useAdminSearch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setCustomers(d.customers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = customers.filter((c) => {
    const haystack = [c.name, c.email, c.city ?? "", c.accountType, c.kycStatus]
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

  function openEdit(c: CustomerRow) {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      city: c.city ?? "",
      status: c.kycStatus,
    });
    setError("");
    setModalOpen(true);
  }

  async function save() {
    setError("");
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a name and a valid email.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      ...(editing ? { kycStatus: form.status } : {}),
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/customers/${editing.id}` : "/api/admin/customers",
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
      pushToast(editing ? "Customer updated" : "Customer added", "success");
      setModalOpen(false);
      load();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: CustomerRow) {
    if (!window.confirm(`Customer ${c.name} will be permanently deleted. Continue?`)) {
      return;
    }
    const res = await fetch(`/api/admin/customers/${c.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      pushToast(data.error ?? "Delete failed", "danger");
      return;
    }
    pushToast("Customer deleted", "danger");
    load();
  }

  return (
    <div className="adm-inner">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Customers</h3>
            <div className="sub" data-testid="cust-count">
              {rows.length} customer{rows.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="right">
            <button className="btn btn-gold btn-sm" onClick={openCreate}>
              ＋ Add customer
            </button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table data-testid="cust-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>City</th>
                <th>Bookings</th>
                <th>Lifetime value</th>
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
                      {loading ? "Loading customers…" : "No customers yet"}
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="car-cell">
                      <div className="cust-av">{initials(c.name)}</div>
                      <div className="cell-main">{c.name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-main">{c.email}</div>
                    <div className="cell-sub">{c.phone ?? "—"}</div>
                  </td>
                  <td>{c.city ?? "—"}</td>
                  <td className="cell-main">{c.bookings}</td>
                  <td className="cell-main">{inr(c.ltv)}</td>
                  <td>
                    <span className={`pill ${kycPill(c.kycStatus)}`}>
                      {c.kycStatus.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <div className="rowactions">
                      <button
                        className="btn-icon"
                        title="Edit"
                        aria-label={`Edit customer ${c.name}`}
                        onClick={() => openEdit(c)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        aria-label={`Delete customer ${c.name}`}
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
        title={editing ? `Edit customer ${editing.name}` : "Add customer"}
        error={error}
        saving={saving}
        onSave={save}
        onCancel={() => setModalOpen(false)}
        saveLabel={editing ? "Save changes" : "Add customer"}
      >
        <div className="form-grid">
          <div className="full">
            <label htmlFor="cu-name">Full name</label>
            <input
              id="cu-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="cu-email">Email</label>
            <input
              id="cu-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="cu-phone">Phone</label>
            <input
              id="cu-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="full">
            <label htmlFor="cu-city">City</label>
            <input
              id="cu-city"
              placeholder="e.g. Bengaluru"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          {editing && (
            <div className="full">
              <label htmlFor="cu-status">Status</label>
              <select
                id="cu-status"
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
          )}
        </div>
      </AdminModal>
    </div>
  );
}