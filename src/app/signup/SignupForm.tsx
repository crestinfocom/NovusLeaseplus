"use client";

import { useState } from "react";
import Link from "next/link";

export type AccountType =
  | "individual"
  | "corporate"
  | "personal-driver"
  | "commercial-driver";

type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "password" | "date" | "number";
  placeholder?: string;
  autoComplete?: string;
  half?: boolean;
  required?: boolean;
  validate?: (v: string) => string | undefined;
};

type TypeMeta = {
  id: AccountType;
  icon: string;
  label: string;
  blurb: string;
  fields: Field[];
};

const TYPES: TypeMeta[] = [
  {
    id: "individual",
    icon: "🙂",
    label: "Individual",
    blurb: "Self-drive rentals & subscriptions",
    fields: [
      {
        name: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Aarav Sharma",
        autoComplete: "name",
        validate: (v) => (v.trim().length < 2 ? "Enter your full name" : undefined),
      },
      {
        name: "email",
        label: "Email address",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        validate: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Enter a valid email address" : undefined),
      },
      {
        name: "phone",
        label: "Mobile number",
        type: "tel",
        placeholder: "+91 98XXXXXX00",
        autoComplete: "tel",
        half: true,
        validate: (v) => (v.replace(/\D/g, "").length < 10 ? "Enter a valid 10-digit number" : undefined),
      },
      {
        name: "password",
        label: "Create password",
        type: "password",
        autoComplete: "new-password",
        half: true,
        validate: (v) => (v.length < 6 ? "Password must be at least 6 characters" : undefined),
      },
    ],
  },
  {
    id: "corporate",
    icon: "🏢",
    label: "Corporate",
    blurb: "Company fleet & B2B billing",
    fields: [
      {
        name: "companyName",
        label: "Company name",
        type: "text",
        placeholder: "Acme Logistics Pvt. Ltd.",
        autoComplete: "organization",
        validate: (v) => (v.trim().length < 2 ? "Enter the company name" : undefined),
      },
      {
        name: "contactName",
        label: "Contact person",
        type: "text",
        placeholder: "Priya Nair",
        autoComplete: "name",
        half: true,
        validate: (v) => (v.trim().length < 2 ? "Enter the contact person's name" : undefined),
      },
      {
        name: "workEmail",
        label: "Work email",
        type: "email",
        placeholder: "priya@acme.in",
        autoComplete: "email",
        half: true,
        validate: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Enter a valid email address" : undefined),
      },
      {
        name: "phone",
        label: "Company phone",
        type: "tel",
        placeholder: "+91 98XXXXXX00",
        autoComplete: "tel",
        half: true,
        validate: (v) => (v.replace(/\D/g, "").length < 10 ? "Enter a valid phone number" : undefined),
      },
      {
        name: "gstin",
        label: "GSTIN (optional)",
        type: "text",
        placeholder: "27ABCDE1234F1Z5",
        half: true,
        required: false,
      },
      {
        name: "password",
        label: "Create password",
        type: "password",
        autoComplete: "new-password",
        validate: (v) => (v.length < 6 ? "Password must be at least 6 characters" : undefined),
      },
    ],
  },
  {
    id: "personal-driver",
    icon: "🚙",
    label: "Personal Driver",
    blurb: "Drive our cars for your own use",
    fields: [
      {
        name: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Rohan Verma",
        autoComplete: "name",
        validate: (v) => (v.trim().length < 2 ? "Enter your full name" : undefined),
      },
      {
        name: "email",
        label: "Email address",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        half: true,
        validate: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Enter a valid email address" : undefined),
      },
      {
        name: "phone",
        label: "Mobile number",
        type: "tel",
        placeholder: "+91 98XXXXXX00",
        autoComplete: "tel",
        half: true,
        validate: (v) => (v.replace(/\D/g, "").length < 10 ? "Enter a valid phone number" : undefined),
      },
      {
        name: "licenceNumber",
        label: "Driving licence number",
        type: "text",
        placeholder: "MH01 20210012345",
        half: true,
        validate: (v) => (v.trim().length < 9 ? "Enter a valid licence number" : undefined),
      },
      {
        name: "licenceExpiry",
        label: "Licence valid till",
        type: "date",
        half: true,
        required: false,
        validate: (v) =>
          v && new Date(v) <= new Date() ? "Licence must not be expired" : undefined,
      },
      {
        name: "password",
        label: "Create password",
        type: "password",
        autoComplete: "new-password",
        validate: (v) => (v.length < 6 ? "Password must be at least 6 characters" : undefined),
      },
    ],
  },
  {
    id: "commercial-driver",
    icon: "🚌",
    label: "Commercial Driver",
    blurb: "Rent for commercial / transport use",
    fields: [
      {
        name: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Suresh Kumar",
        autoComplete: "name",
        validate: (v) => (v.trim().length < 2 ? "Enter your full name" : undefined),
      },
      {
        name: "email",
        label: "Email address",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        half: true,
        validate: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Enter a valid email address" : undefined),
      },
      {
        name: "phone",
        label: "Mobile number",
        type: "tel",
        placeholder: "+91 98XXXXXX00",
        autoComplete: "tel",
        half: true,
        validate: (v) => (v.replace(/\D/g, "").length < 10 ? "Enter a valid phone number" : undefined),
      },
      {
        name: "licenceNumber",
        label: "Commercial licence no.",
        type: "text",
        placeholder: "DL-04 2022 0032187",
        half: true,
        validate: (v) => (v.trim().length < 9 ? "Enter a valid licence number" : undefined),
      },
      {
        name: "licenceClass",
        label: "Licence class",
        type: "text",
        placeholder: "LMV / Transport",
        half: true,
        validate: (v) => (v.trim().length < 2 ? "Enter the licence class" : undefined),
      },
      {
        name: "experience",
        label: "Years of experience",
        type: "number",
        placeholder: "5",
        half: true,
        validate: (v) => {
          const n = Number(v);
          return v !== "" && (Number.isNaN(n) || n < 0 || n > 50)
            ? "Enter years between 0 and 50"
            : undefined;
        },
      },
      {
        name: "city",
        label: "Operating city",
        type: "text",
        placeholder: "Bengaluru",
        half: true,
        validate: (v) => (v.trim().length < 2 ? "Enter your operating city" : undefined),
      },
      {
        name: "password",
        label: "Create password",
        type: "password",
        autoComplete: "new-password",
        validate: (v) => (v.length < 6 ? "Password must be at least 6 characters" : undefined),
      },
    ],
  },
];

export default function SignupForm() {
  const [type, setType] = useState<AccountType>("individual");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [created, setCreated] = useState<{ name: string; email: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");

  const meta = TYPES.find((t) => t.id === type)!;

  function pick(next: AccountType) {
    setType(next);
    setErrors({});
    if (status === "done") setStatus("idle");
  }

  function validate() {
    const next: Record<string, string> = {};
    for (const f of meta.fields) {
      if (f.required !== false && !values[f.name]?.trim())
        next[f.name] = `${f.label} is required`;
      else if (f.validate) {
        const err = f.validate(values[f.name] ?? "");
        if (err) next[f.name] = err;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate() || status === "busy") return;
    setStatus("busy");

    void signup();
  }

  async function signup() {
    const payload = {
      accountType: type,
      name: (values.fullName || values.contactName || "").trim(),
      email: (values.email || values.workEmail || "").trim(),
      phone: (values.phone ?? "").trim(),
      password: values.password ?? "",
      companyName: (values.companyName ?? "").trim(),
      gstin: (values.gstin ?? "").trim(),
      licenceNumber: (values.licenceNumber ?? "").trim(),
      licenceExpiry: values.licenceExpiry || "",
      licenceClass: (values.licenceClass ?? "").trim(),
      experience: (values.experience ?? "").trim(),
      city: (values.city ?? "").trim(),
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setCreated({ name: data.name, email: data.email });
      setStatus("done");
    } catch {
      setApiError("Network error — please try again.");
      setStatus("idle");
    }
  }

  if (status === "done" && created) {
    return (
      <div className="auth-success" data-testid="signup-success">
        <span className="auth-success-ic" aria-hidden="true">
          ✓
        </span>
        <h3>
          {meta.id === "corporate"
            ? "Corporate account ready"
            : "Account created"}
        </h3>
        <p>
          Welcome, <b>{created.name.split(" ")[0]}</b> — your{" "}
          <b>{meta.label.toLowerCase()}</b> account is ready.
          <br />
          <small className="auth-success-email">{created.email}</small>
        </p>
        <Link className="btn btn-dark auth-submit" href="/login">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={onSubmit} noValidate>
      <div className="type-grid" role="radiogroup" aria-label="Account type">
        {TYPES.map((t) => (
          <label
            key={t.id}
            className={`type-card${t.id === type ? " active" : ""}`}
            data-testid={`type-${t.id}`}
          >
            <input
              type="radio"
              name="accountType"
              value={t.id}
              checked={t.id === type}
              onChange={() => pick(t.id)}
            />
            <span className="t-ic" aria-hidden="true">
              {t.icon}
            </span>
            <span className="t-nm">{t.label}</span>
          </label>
        ))}
      </div>

      <p className="type-blurb" aria-live="polite">
        {meta.blurb}
      </p>

      <div className="f-grid">
        {meta.fields.map((f) => (
          <div className={`f-field${f.half ? "" : " full"}`} key={f.name}>
            <label className="f-label" htmlFor={f.name}>
              {f.label}
              {f.required === false ? " (optional)" : ""}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              className={`inp${errors[f.name] ? " err" : ""}`}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              min={f.type === "number" ? 0 : undefined}
              max={f.type === "number" ? 50 : undefined}
              value={values[f.name] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
              }
            />
            {errors[f.name] && <p className="f-error">{errors[f.name]}</p>}
          </div>
        ))}
      </div>

      {apiError && <p className="f-error f-error-block">{apiError}</p>}

      <button
        type="submit"
        className="btn btn-gold auth-submit"
        disabled={status === "busy"}
      >
        {status === "busy"
          ? "Creating account…"
          : type === "corporate"
            ? "Create corporate account"
            : "Create account"}
      </button>

      <p className="auth-alt">
        By continuing you agree to the <a href="#">Terms</a> &{" "}
        <a href="#">Privacy Policy</a>.
      </p>
    </form>
  );
}