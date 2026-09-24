import { FEE_GUIDE, PRODUCT_GLOSSARY } from "@/lib/terms";
import Link from "next/link";

const ICONS: Record<string, string> = {
  deposit: "🔒",
  taxes: "🧾",
  insurance: "🛡️",
  maintenance: "🔧",
  mileage: "⛽",
  early: "✈️",
};

export default function FeesGuide({ id = "fees" }: { id?: string }) {
  return (
    <section className="fees-sec" id={id}>
      <div className="wrap">
        <div className="sec-head center">
          <span className="eyebrow center">No surprises</span>
          <h2>Fees &amp; charges, explained</h2>
          <p>
            Every rupee that can appear on your quote — what it is, when it
            applies, and when it doesn&apos;t.
          </p>
        </div>
        <div className="fees-grid">
          {FEE_GUIDE.map((f) => (
            <article className="fee-card" key={f.id} data-testid={`fee-${f.id}`}>
              <div className="fei" aria-hidden="true">
                {ICONS[f.id] ?? "•"}
              </div>
              <h4>{f.title}</h4>
              <p>{f.summary}</p>
              <ul>
                {f.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="terms-strip">
          <b>Always the same meaning:</b>
          {PRODUCT_GLOSSARY.map((g) => (
            <span key={g.term} title={g.detail}>
              <b>{g.term}</b> — {g.detail}
            </span>
          ))}
          <Link href="/compare" style={{ color: "var(--gold-deep)", fontWeight: 700 }}>
            Lease vs Buy →
          </Link>
        </div>
      </div>
    </section>
  );
}