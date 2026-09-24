"use client";

import { useEffect, useState } from "react";

/**
 * Renders a dismissible banner when the browser loses its connection so users
 * understand why quote/booking requests may not land (UX gap: offline handling).
 */
export default function OfflineNotice() {
  const [online, setOnline] = useState(
    () =>
      typeof window === "undefined" || typeof navigator === "undefined" ||
      navigator.onLine
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => {
      setOnline(false);
      setDismissed(false);
    };
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online || dismissed) return null;

  return (
    <div
      className="offline-banner"
      data-testid="offline-banner"
      role="alert"
    >
      <span>📡 You&apos;re offline — quotes, bookings and lookups may not be sent until you reconnect.</span>
      <button
        type="button"
        className="offline-dismiss"
        aria-label="Dismiss offline notice"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </div>
  );
}