"use client";

import { useEffect } from "react";

export default function AdminModal({
  open,
  title,
  children,
  error,
  saving,
  onSave,
  onCancel,
  saveLabel = "Save",
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  error?: string;
  saving?: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="adm-modal-back show"
      data-testid="admin-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <button
            className="close"
            aria-label="Close"
            onClick={onCancel}
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="adm-modal-body">
          {error && (
            <p className="adm-modal-error" data-testid="admin-modal-error">
              {error}
            </p>
          )}
          {children}
        </div>
        <div className="adm-modal-foot">
          <button className="btn btn-ghost" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn btn-gold" onClick={onSave} disabled={saving} type="button">
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}