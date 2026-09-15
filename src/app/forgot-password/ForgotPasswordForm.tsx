"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (status === "busy") return;
    setStatus("busy");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error — please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="auth-success" data-testid="forgot-success">
        <span className="auth-success-ic" aria-hidden="true">
          ✓
        </span>
        <h3>Check your inbox</h3>
        <p>
          If an account exists for <b>{email}</b>, a password reset link is on
          its way. (Demo mode — no email is actually sent.)
        </p>
        <Link className="btn btn-dark auth-submit" href="/login">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={onSubmit} noValidate>
      <div className="f-field">
        <label className="f-label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`inp${error ? " err" : ""}`}
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="f-error">{error}</p>}
      </div>

      <button
        type="submit"
        className="btn btn-gold auth-submit"
        disabled={status === "busy"}
      >
        {status === "busy" ? "Sending…" : "Send reset link"}
      </button>

      <p className="auth-alt">
        <Link href="/login">← Back to login</Link>
      </p>
    </form>
  );
}