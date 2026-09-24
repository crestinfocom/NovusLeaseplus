"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sign in failed. Please try again.");
        setBusy(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="login" data-testid="admin-login">
      <div className="login-card">
        <Link className="login-logo" href="/" aria-label="Back to NovusLease+ homepage">
          <Image
            src="/images/logo.png"
            alt="NovusLease+"
            width={0}
            height={40}
            sizes="auto"
            style={{ width: "auto", height: 40, margin: "0 auto" }}
            priority
          />
        </Link>
        <div className="sub">Admin Console</div>
        <h2>Welcome back</h2>
        <div className="sub login-sub">Sign in to manage your fleet &amp; bookings</div>

        <form onSubmit={onSubmit} noValidate>
          <div className="fld">
            <label htmlFor="adm-email">Email address</label>
            <input
              id="adm-email"
              type="email"
              placeholder="admin@novuslease.in"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="fld">
            <label htmlFor="adm-password">Password</label>
            <input
              id="adm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="login-btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in →"}
          </button>
          <div className="login-err" data-testid="admin-login-error">
            {error}
          </div>
        </form>

        <div className="login-hint">
          Demo credentials — <b>admin@novuslease.in</b> / <b>Nova@admin1</b>
        </div>
        <Link
          className="login-back"
          href="/"
          data-testid="admin-back-to-site"
        >
          ← Back to customer site
        </Link>
      </div>
    </main>
  );
}