"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToastKind = "success" | "danger" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  text: string;
};

let nextId = 1;
const listeners = new Set<(toasts: ToastItem[]) => void>();

function notify() {
  const list = Array.from(listeners);
  for (const fn of list) fn(current);
}

let current: ToastItem[] = [];

export function pushToast(text: string, kind: ToastKind = "info"): void {
  const item: ToastItem = { id: nextId++, kind, text };
  current = [...current.slice(-3), item];
  notify();
  setTimeout(() => {
    current = current.filter((t) => t.id !== item.id);
    notify();
  }, 2600);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const sync = (list: ToastItem[]) => {
      if (mounted.current) setToasts(list);
    };
    sync(current);
    listeners.add(sync);
    return () => {
      mounted.current = false;
      listeners.delete(sync);
    };
  }, []);

  const iconFor = useCallback((kind: ToastKind) => {
    if (kind === "success") return "✓";
    if (kind === "danger") return "!";
    return "i";
  }, []);

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          <span className="ic">{iconFor(t.kind)}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}