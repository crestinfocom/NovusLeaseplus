"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AccountType, UserRole } from "@prisma/client";
import { accountTypeLabel } from "@/lib/account-type";
import { getAdminLoginPath } from "@/lib/auth-redirect";

type LoginResult = {
  ok: true;
  name: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  redirectTo: string;
};

type LoginFormProps = {
  next?: string;
};

export default function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [account, setAccount] = useState<LoginResult | null>(null);

  function validate() {
    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate() || status === "busy") return;
    setStatus("busy");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          remember,
          next,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setApiError(data?.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      if (data.role === "ADMIN") {
        router.replace(getAdminLoginPath(data.redirectTo));
        router.refresh();
        return;
      }
      setAccount(data as LoginResult);
      setStatus("done");
    } catch {
      setApiError("Network error — please try again.");
      setStatus("idle");
    }
  }

  if (status === "done" && account) {
    return (
      <div className="auth-success">
        <span className="auth-success-ic" aria-hidden="true">
          ✓
        </span>
        <h3>Welcome back, {account.name.split(" ")[0]}!</h3>
        <p>
          You&apos;re signed in as a{" "}
          <b>{accountTypeLabel(account.accountType)}</b> account
          <br />
          <small className="auth-success-email">{account.email}</small>
        </p>
        <Link className="btn btn-dark auth-submit" href="/">
          Continue to site
        </Link>
      </div>
    );
  }

  return (
    <>
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
            <Link className="f-link" href="/forgot-password">
              Forgot password?
            </Link>
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

        {apiError && <p className="f-error f-error-block">{apiError}</p>}

        <button
          type="submit"
          className="btn btn-gold auth-submit"
          disabled={status === "busy"}
        >
          {status === "busy" ? "Signing in…" : "Sign in"}
        </button>

        <p className="auth-alt">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Create one in 2 minutes</Link>
        </p>
      </form>

      <details className="auth-demo" data-testid="demo-accounts">
        <summary>
          <span className="dot" aria-hidden="true" />
          Demo accounts — unique password per role
        </summary>
        <div className="auth-demo-group">Customers</div>
        <ul>
          <li>
            <span>Individual</span>
            <code>individual@novuslease.in — Nova@user1</code>
          </li>
          <li>
            <span>Corporate</span>
            <code>corporate@novuslease.in — Nova@corp1</code>
          </li>
          <li>
            <span>Personal driver</span>
            <code>personaldriver@novuslease.in — Nova@pdrive1</code>
          </li>
          <li>
            <span>Commercial driver</span>
            <code>commercialdriver@novuslease.in — Nova@cdrive1</code>
          </li>
        </ul>
        <div className="auth-demo-group">Business &amp; operations</div>
        <ul>
          <li>
            <span>Admin</span>
            <code>admin@novuslease.in — Nova@admin1</code>
          </li>
          <li>
            <span>Operations</span>
            <code>operations@novuslease.in — Nova@ops2024</code>
          </li>
        </ul>
      </details>
    </>
  );
}
