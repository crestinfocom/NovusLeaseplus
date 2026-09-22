"use client";

import { useEffect, useState } from "react";
import { pushToast } from "@/lib/toast-bus";

type SyncStatus = {
  enabled: boolean;
  lastSyncedAt: string | null;
  cooldownRemainingMs: number;
};

export default function SettingsView() {
  const [profile, setProfile] = useState({
    company: "NovusLease+ Mobility Pvt. Ltd.",
    email: "support@novuslease.com",
    phone: "+91 80 4567 8900",
    address: "Prestige Tower, MG Road, Bengaluru 560001",
  });
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sync-local")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setSync(d);
      })
      .catch(() => {});
  }, []);

  async function syncFromNeon() {
    if (syncing || !sync?.enabled) return;
    setSyncing(true);
    try {
      const r = await fetch("/api/admin/sync-local", { method: "POST" });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        pushToast(d.error || "Sync failed", "danger");
        return;
      }
      pushToast(
        `Synced ${d.rows} rows from Neon in ${(d.durationMs / 1000).toFixed(1)}s`,
        "success"
      );
      setSync({ enabled: true, lastSyncedAt: d.syncedAt, cooldownRemainingMs: d.cooldownRemainingMs });
    } catch {
      pushToast("Sync failed", "danger");
    } finally {
      setSyncing(false);
    }
  }

  async function exportData() {
    try {
      const [b, c, cu, o] = await Promise.all([
        fetch("/api/admin/bookings").then((r) => r.json()),
        fetch("/api/admin/cars").then((r) => r.json()),
        fetch("/api/admin/customers").then((r) => r.json()),
        fetch("/api/admin/promotions").then((r) => r.json()),
      ]);
      const dump = {
        exportedAt: new Date().toISOString(),
        bookings: b.ok ? b.bookings : [],
        cars: c.ok ? c.cars : [],
        customers: cu.ok ? cu.customers : [],
        offers: o.ok ? o.offers : [],
      };
      const blob = new Blob([JSON.stringify(dump, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "novuslease-data.json";
      a.click();
      URL.revokeObjectURL(a.href);
      pushToast("Data exported", "success");
    } catch {
      pushToast("Export failed", "danger");
    }
  }

  function resetData() {
    if (!window.confirm("Reset all demo data to defaults? Your changes will be lost.")) {
      return;
    }
    pushToast("Demo data reset", "info");
  }

  return (
    <div className="adm-inner grid-2">
      <div className="panel">
        <div className="panel-head">
          <h3>Business profile</h3>
        </div>
        <div className="panel-body">
          <div className="form-grid">
            <div className="full">
              <label htmlFor="st-company">Company name</label>
              <input
                id="st-company"
                value={profile.company}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, company: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="st-email">Support email</label>
              <input
                id="st-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="st-phone">Phone</label>
              <input
                id="st-phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="full">
              <label htmlFor="st-address">Registered address</label>
              <input
                id="st-address"
                value={profile.address}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="st-currency">Base currency</label>
              <select id="st-currency" defaultValue="INR (₹)">
                <option>INR (₹)</option>
                <option>USD ($)</option>
              </select>
            </div>
            <div>
              <label htmlFor="st-gst">GST rate</label>
              <select id="st-gst" defaultValue="18%">
                <option>18%</option>
                <option>12%</option>
                <option>28%</option>
              </select>
            </div>
          </div>
        </div>
        <div className="settings-foot">
          <button
            className="btn btn-gold"
            onClick={() => pushToast("Settings saved", "success")}
          >
            Save changes
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Data &amp; preferences</h3>
        </div>
        <div className="panel-body">
          <div className="list-item">
            <div className="txt">
              <div className="t">Email notifications</div>
              <div className="s">New bookings &amp; cancellations</div>
            </div>
            <label className="pref-row" style={{ cursor: "pointer" }}>
              <input type="checkbox" defaultChecked aria-label="Email notifications" />
            </label>
          </div>
          <div className="list-item">
            <div className="txt">
              <div className="t">Auto-approve subscriptions</div>
              <div className="s">Skip manual review under ₹50k/mo</div>
            </div>
            <label className="pref-row" style={{ cursor: "pointer" }}>
              <input type="checkbox" aria-label="Auto-approve subscriptions" />
            </label>
          </div>
          <div className="list-item">
            <div className="txt">
              <div className="t">Maintenance reminders</div>
              <div className="s">Alert when a car crosses service km</div>
            </div>
            <label className="pref-row" style={{ cursor: "pointer" }}>
              <input type="checkbox" defaultChecked aria-label="Maintenance reminders" />
            </label>
          </div>
          <div className="pref-actions">
            <button className="btn btn-ghost btn-sm" onClick={exportData}>
              ⬇ Export data (JSON)
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--red)" }}
              onClick={resetData}
            >
              ↺ Reset demo data
            </button>
          </div>
        </div>
      </div>

      {sync?.enabled && (
        <div className="panel" style={{ gridColumn: "1 / -1" }}>
          <div className="panel-head">
            <h3>Local database sync (Neon → Docker)</h3>
          </div>
          <div className="panel-body">
            <div className="list-item">
              <div className="txt">
                <div className="t">Pull the latest data from Neon</div>
                <div className="s">
                  {sync.lastSyncedAt
                    ? `Last synced ${new Date(sync.lastSyncedAt).toLocaleString()}`
                    : "Never synced yet"}{" "}
                  — replaces the local Docker DB contents with the full Neon
                  dataset. One-way and read-only on Neon; rate-limited to keep
                  Neon usage low.
                </div>
              </div>
              <div className="pref-row">
                <button
                  className="btn btn-gold btn-sm"
                  disabled={syncing || sync.cooldownRemainingMs > 0}
                  data-testid="sync-from-neon"
                  onClick={syncFromNeon}
                >
                  {syncing ? "Syncing…" : "Sync from Neon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}