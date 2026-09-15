import Image from "next/image";
import Link from "next/link";

const points = [
  "Doorstep delivery in 19+ cities",
  "Insurance, maintenance & roadside assist built in",
  "From ₹60/hr — cancel free up to 24 hrs before",
];

export default function AuthShell({
  title,
  subtitle,
  step,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  step?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth">
      <aside className="auth-brand">
        <Link className="brand" href="/" aria-label="Go to homepage">
          <Image
            src="/images/logo-footer.png"
            alt="NovusLease+"
            width={0}
            height={38}
            sizes="auto"
            style={{ width: "auto", height: 38 }}
            priority
          />
        </Link>

        <div className="auth-brand-body">
          <span className="eyebrow">NovusLease+ account</span>
          <h1>
            One account, <em>every journey.</em>
          </h1>
          <p>
            Rent, subscribe or drive for work — manage all of it from a single
            sign-in.
          </p>
          <div className="auth-points">
            {points.map((p) => (
              <span className="auth-point" key={p}>
                <span className="dot" aria-hidden="true" />
                {p}
              </span>
            ))}
          </div>
        </div>

        <p className="auth-brand-foot">
          <span>Insurance · Maintenance · 24×7 assistance</span>
          <span>CSR / B2B approved</span>
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-form">
          {step && <span className="auth-step">{step}</span>}
          <div className="auth-head">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <footer className="auth-foot">{footer}</footer>}
      </main>
    </div>
  );
}