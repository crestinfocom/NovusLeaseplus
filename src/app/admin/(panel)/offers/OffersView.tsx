"use client";

import { useCallback, useEffect, useState } from "react";
import AdminModal from "../AdminModal";
import { useAdminSearch } from "../useAdminSearch";
import { promoPill, toDateInput } from "@/lib/admin-format";
import { pushToast } from "@/lib/toast-bus";
import type { OfferRow } from "../admin-types";

type FormState = {
  code: string;
  title: string;
  description: string;
  discountPct: string;
  minDays: string;
  endsAt: string;
  isActive: boolean;
};

function emptyForm(): FormState {
  return {
    code: "",
    title: "",
    description: "",
    discountPct: "10",
    minDays: "1",
    endsAt: "",
    isActive: true,
  };
}

export default function OffersView() {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const q = useAdminSearch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OfferRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/promotions")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setOffers(d.offers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = offers.filter((c) => {
    const haystack = [c.code, c.title, c.discount, c.description ?? ""]
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

  function openEdit(c: OfferRow) {
    setEditing(c);
    setForm({
      code: c.code,
      title: c.title,
      description: c.description ?? "",
      discountPct: String(parseInt(c.discount, 10) || 10),
      minDays: "1",
      endsAt: toDateInput(c.till),
      isActive: c.isActive,
    });
    setError("");
    setModalOpen(true);
  }

  async function save() {
    setError("");
    if (!form.code.trim()) {
      setError("Please enter a promo code.");
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      discountPct: Number(form.discountPct) || 0,
      minDays: Number(form.minDays) || 1,
      endsAt: form.endsAt || null,
      isActive: form.isActive,
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/promotions/${editing.id}` : "/api/admin/promotions",
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
      pushToast(editing ? "Code updated" : "Code created", "success");
      setModalOpen(false);
      load();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: OfferRow) {
    if (!window.confirm(`Promo code ${c.code} will be permanently deleted. Continue?`)) {
      return;
    }
    const res = await fetch(`/api/admin/promotions/${c.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      pushToast(data.error ?? "Delete failed", "danger");
      return;
    }
    pushToast("Code deleted", "danger");
    load();
  }

  return (
    <div className="adm-inner">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Promo codes &amp; offers</h3>
            <div className="sub" data-testid="offer-count">
              {rows.length} code{rows.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="right">
            <button className="btn btn-gold btn-sm" onClick={openCreate}>
              ＋ New code
            </button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table data-testid="offer-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Redemptions</th>
                <th>Valid till</th>
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
                      {loading ? "Loading codes…" : "No promo codes"}
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="cell-main adm-chip">{o.code}</span>
                  </td>
                  <td>
                    <div className="cell-main">{o.title}</div>
                    {o.description && (
                      <div className="cell-sub">{o.description}</div>
                    )}
                  </td>
                  <td className="cell-main">{o.discount}</td>
                  <td className="cell-main">{o.redeemed}</td>
                  <td>{o.till ? toDateInput(o.till) : "—"}</td>
                  <td>
                    <span className={`pill ${promoPill(o.isActive, o.till)}`}>
                      {promoPill(o.isActive, o.till) === "retired" ? "expired" : "active"}
                    </span>
                  </td>
                  <td>
                    <div className="rowactions">
                      <button
                        className="btn-icon"
                        title="Edit"
                        aria-label={`Edit promo code ${o.code}`}
                        onClick={() => openEdit(o)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        aria-label={`Delete promo code ${o.code}`}
                        onClick={() => remove(o)}
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
        title={editing ? `Edit code ${editing.code}` : "New promo code"}
        error={error}
        saving={saving}
        onSave={save}
        onCancel={() => setModalOpen(false)}
        saveLabel={editing ? "Save changes" : "Create code"}
      >
        <div className="form-grid">
          <div>
            <label htmlFor="of-code">Code</label>
            <input
              id="of-code"
              placeholder="NOVUS10"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="of-discount">Discount (%)</label>
            <input
              id="of-discount"
              type="number"
              min={0}
              max={100}
              value={form.discountPct}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountPct: e.target.value }))
              }
            />
          </div>
          <div className="full">
            <label htmlFor="of-title">Description</label>
            <input
              id="of-title"
              placeholder="10% off weekend escapes"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="of-min">Min days</label>
            <input
              id="of-min"
              type="number"
              min={1}
              value={form.minDays}
              onChange={(e) =>
                setForm((f) => ({ ...f, minDays: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="of-till">Valid till</label>
            <input
              id="of-till"
              type="date"
              value={form.endsAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, endsAt: e.target.value }))
              }
            />
          </div>
          <div className="full">
            <label htmlFor="of-desc">Detailed description</label>
            <input
              id="of-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="full">
            <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none" }}>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, accentColor: "var(--gold-deep)" }}
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Active
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}