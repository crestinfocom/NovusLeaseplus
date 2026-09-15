"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || status === "busy") return;
    setStatus("busy");
    window.setTimeout(() => setStatus("done"), 500);
  }

  if (status === "done") {
    return (
      <div className="auth-success">
        <span className="auth-success-ic" aria-hidden="true">
          ✓
        </span>
        <h3>You&apos;re signed in</h3>
        <p>
          Welcome back! This demo accepts any valid credentials. In production
          you&apos;d be redirected to your dashboard.
        </p>
        <Link className="btn btn-dark auth-submit" href="/">
          Continue to site
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
          className={`inp${errors.email ? " err" : ""}`}
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="f-error">{errors.email}</p>}
      </div>

      <div className="f-field">
        <div className="f-label-row">
          <label className="f-label" htmlFor="password">
            Password
          </label>
          <a className="f-link" href="#">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          className={`inp${errors.password ? " err" : ""}`}
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="f-error">{errors.password}</p>}
      </div>

      <label className="f-check">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Keep me signed in</span>
      </label>

      <button type="submit" className="btn btn-gold auth-submit" disabled={status === "busy"}>
        {status === "busy" ? "Signing in…" : "Sign in"}
      </button>

      <p className="auth-alt">
        Don&apos;t have an account? <Link href="/signup">Create one in 2 minutes</Link>
      </p>
    </form>
  );
}