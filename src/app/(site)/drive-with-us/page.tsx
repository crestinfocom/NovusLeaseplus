import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../_components/Reveal";
import JsonLd from "../_components/JsonLd";
import DriveCalculator from "../_components/DriveCalculator";

export const metadata: Metadata = {
  title: "Drive With Us — Commercial Vehicle Lease Program | NovusLease+",
  description:
    "Partner with NovusLease+. Select an eligible commercial vehicle, pay an initial down payment (₹20,000–₹40,000), sign the lease, complete trips, earn commissions and contribute daily or weekly toward your repayment.",
  alternates: { canonical: "/drive-with-us" },
  openGraph: {
    title: "Drive With Us — Commercial Vehicle Lease Program",
    description:
      "Select an eligible commercial vehicle, pay a ₹20,000–₹40,000 initial down payment, sign a 36-month lease, complete trips and earn commissions.",
    type: "website",
    siteName: "NovusLease+",
    images: ["/images/hero.jpg"],
  },
};

const STEPS = [
  {
    n: "01",
    t: "Select an eligible vehicle",
    d: "Pick a commercial vehicle available in your category and city.",
  },
  {
    n: "02",
    t: "Pay your down payment",
    d: "Initial down payment in the ₹20,000–₹40,000 range, configurable by vehicle.",
  },
  {
    n: "03",
    t: "Sign the lease agreement",
    d: "Accept the 36-month lease and your configured repayment schedule.",
  },
  {
    n: "04",
    t: "Drive & complete trips",
    d: "Receive your vehicle and start completing trips right away.",
  },
  {
    n: "05",
    t: "Earn commissions",
    d: "Every trip feeds your configured commission — fixed or percentage.",
  },
  {
    n: "06",
    t: "Contribute & monitor",
    d: "Repay on the daily / weekly model and track your balance in one place.",
  },
];

const RULES = [
  {
    ic: "📅",
    t: "36-month lease",
    d: "Minimum lease term of 36 months, configurable for future products.",
  },
  {
    ic: "💰",
    t: "₹20,000–₹40,000 down",
    d: "Initial down payment target range, configurable by vehicle and category.",
  },
  {
    ic: "🔁",
    t: "Daily / weekly repayment",
    d: "Contribute toward the lease on a configured daily, weekly or monthly model.",
  },
  {
    ic: "📈",
    t: "Trip-linked commission",
    d: "Fixed-amount or percentage commission on every completed trip.",
  },
  {
    ic: "🎯",
    t: "Targets & incentives",
    d: "Daily / weekly trip targets with configurable bonuses and rewards.",
  },
  {
    ic: "🛡️",
    t: "Configurable eligibility",
    d: "Vehicle and partner eligibility rules set by category and program criteria.",
  },
];

const VEHICLE_CATS = [
  {
    ic: "🚗",
    name: "Hatchback",
    desc: "Compact city runs, last-mile delivery and small cargo.",
    price: "from ₹25 lakh",
    img: "/images/swift.jpg",
  },
  {
    ic: "🚙",
    name: "SUV",
    desc: "Standard ride-hailing, logistics and intercity trips.",
    price: "from ₹45 lakh",
    img: "/images/suv.jpg",
  },
  {
    ic: "🚐",
    name: "MUV",
    desc: "7-seater shared rides, taxis, school and crew runs.",
    price: "from ₹65 lakh",
    img: "/images/hero.jpg",
  },
  {
    ic: "⚡",
    name: "Electric",
    desc: "Low-running-cost commercial city trips.",
    price: "from ₹85 lakh",
    img: "/images/creta.jpg",
  },
];

const ELIG = [
  "Valid driving licence with the required commercial class",
  "Verifiable driving experience and a clean record",
  "Completed KYC — identity and address verification",
  "Bank account details for commission settlements",
  "Willingness to meet configured trip minimums / targets",
  "Consent to program terms, declarations and privacy policy",
];

const DOCS = [
  "Driving licence (front & back)",
  "Government-issued ID — NIN, national ID, passport or voter card",
  "Proof of address — utility bill or bank statement",
  "Bank account details for settlements",
  "Recent passport photograph",
  "Signed declaration & consent forms",
];

const FAQS = [
  {
    q: "What is the Drive With Us program?",
    a: "A commercial vehicle lease program for drivers and vehicle partners. You select an eligible commercial vehicle, pay a small initial down payment, sign a minimum 36-month lease, receive the vehicle, complete trips and repay the lease through configured daily or weekly contributions funded by your trip commissions.",
  },
  {
    q: "How much is the initial down payment?",
    a: "The target range is ₹20,000–₹40,000 and is configurable by vehicle and category. The exact figure for your vehicle is confirmed in your lease offer.",
  },
  {
    q: "How long is the lease?",
    a: "The minimum lease term is 36 months. Longer tenures and early-closure rules can be configured with approved settlement terms.",
  },
  {
    q: "How do commissions and repayment work?",
    a: "Every completed trip is recorded with its gross revenue. A configured commission (fixed or percentage) is applied, and a daily or weekly lease contribution is calculated. Contributions and any approved adjustments are posted to your partner and lease ledgers so you always know your balance.",
  },
  {
    q: "Are my earnings guaranteed?",
    a: "No. Trip volumes and earnings are never guaranteed. All calculator and program figures are illustrative estimates — final commission and contribution formulas are approved by the business and stated in your agreement.",
  },
  {
    q: "How do I apply?",
    a: "Create a commercial driver account, complete your profile and KYC, then verify documents. Once approved you can review eligible vehicles, accept a lease offer and pay your down payment.",
  },
];

const LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Drive With Us — Commercial Vehicle Lease Program",
      serviceType: "Commercial vehicle lease",
      url: "https://novuslease.in/drive-with-us",
      provider: {
        "@type": "Organization",
        name: "NovusLease+",
        url: "https://novuslease.in",
      },
      description:
        "Select an eligible commercial vehicle, pay an initial down payment of ₹20,000–₹40,000, sign a 36-month lease, complete trips, earn commissions and contribute daily or weekly toward your repayment.",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function DriveWithUsPage() {
  return (
    <>
      <JsonLd data={LD} />

      <section className="dwu-hero">
        <div className="dwu-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="Commercial vehicle ready for a partner" />
        </div>
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Drive With Us
          </div>
          <span className="dwu-eyebrow">Commercial Vehicle Lease Program</span>
          <h1>
            Drive with us. <em>Earn while you repay.</em>
          </h1>
          <p>
            Select an eligible commercial vehicle, pay an initial down payment of{" "}
            ₹20,000–₹40,000, sign your lease, receive the vehicle and start
            completing trips. Your commissions fund a configured daily / weekly
            lease contribution — with full transparency on every trip, earning
            and balance.
          </p>
          <div className="dwu-hero-actions">
            <Link className="btn btn-gold btn-lg" href="/signup">
              Apply to drive with us →
            </Link>
            <Link
              className="btn btn-ghost btn-lg"
              href="/drive-with-us#calculator"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
            >
              Estimate my earnings
            </Link>
          </div>
          <div className="jump">
            <a href="#how">🛞 How it works</a>
            <a href="#calculator">🧮 Estimate models</a>
            <a href="#vehicles">🚚 Eligible vehicles</a>
            <a href="#eligibility">✅ Eligibility</a>
            <a href="#faq">❓ FAQ</a>
          </div>
        </div>
      </section>

      <div className="usp-bg">
        <div className="wrap">
          <div className="dwu-stats">
            <Reveal className="usp-item">
              <div className="ic">💰</div>
              <h4>₹20,000–₹40,000</h4>
              <p>Initial down-payment range, configurable by vehicle.</p>
            </Reveal>
            <Reveal className="usp-item" delay={1}>
              <div className="ic">📅</div>
              <h4>36-month lease</h4>
              <p>Minimum term, with configurable, approved tenures.</p>
            </Reveal>
            <Reveal className="usp-item" delay={2}>
              <div className="ic">🔁</div>
              <h4>Daily / weekly model</h4>
              <p>Configured contributions from your trip earnings.</p>
            </Reveal>
            <Reveal className="usp-item" delay={3}>
              <div className="ic">📈</div>
              <h4>Trip-linked commission</h4>
              <p>Fixed or percentage commission on every trip.</p>
            </Reveal>
          </div>
        </div>
      </div>

      <section className="sec" id="model">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Program at a glance</span>
            <h2>One program, fully configurable rules</h2>
            <p>
              The financial and operational model is configurable, so different
              vehicle categories and partner profiles can be supported without
              software changes.
            </p>
          </Reveal>
          <div className="plan3" style={{ marginTop: 44 }}>
            {RULES.map((r, i) => (
              <Reveal className="p3" key={r.t} delay={(i % 3) as 0 | 1 | 2}>
                <div className="ic">{r.ic}</div>
                <h4>{r.t}</h4>
                <p>{r.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec how-bg" id="how">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center" style={{ color: "var(--gold)" }}>
              Your journey
            </span>
            <h2>From application to active lease</h2>
            <p style={{ color: "rgba(255,255,255,.66)" }}>
              A clear digital journey — no paperwork queues.
            </p>
          </Reveal>
          <div className="steps" style={{ marginTop: 48 }}>
            {STEPS.map((s, i) => (
              <Reveal className="step" key={s.n} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="n">{s.n}</div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dwu-calc-sec" id="calculator">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Lease &amp; finance estimator</span>
            <h2>See how trips fund your repayment</h2>
            <p>
              Illustrative only — model a vehicle, your down payment and trip
              assumptions, then see the configured daily / weekly contribution.
            </p>
          </Reveal>
          <DriveCalculator />
          <Reveal className="dwu-calc-disclaimer">
            Illustrative estimates, not a contractual quote. Final figures are
            generated from the approved finance / lease configuration.
          </Reveal>
        </div>
      </section>

      <section className="sec offers-bg" id="vehicles">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Eligible vehicles</span>
            <h2>Commercial vehicles you can lease</h2>
            <p>
              Available categories with indicative price bands. Live availability
              and per-vehicle earning assumptions are shown once you&apos;re
              verified.
            </p>
          </Reveal>
          <div className="dwu-veh-grid" style={{ marginTop: 44 }}>
            {VEHICLE_CATS.map((v, i) => (
              <Reveal className="dwu-veh" key={v.name} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="dwu-veh-pic">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.img} alt={`${v.name} commercial vehicle`} />
                  <span className="dwu-veh-tag">Eligible</span>
                </div>
                <div className="dwu-veh-bd">
                  <div className="dwu-veh-top">
                    <span className="dwu-veh-ic">{v.ic}</span>
                    <div>
                      <h4>{v.name}</h4>
                      <p>{v.desc}</p>
                    </div>
                  </div>
                  <div className="dwu-veh-row">
                    <span>{v.price}</span>
                    <em>indicative</em>
                  </div>
                  <Link className="btn btn-ghost btn-sm" href="/fleet">
                    Browse the fleet →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="dwu-note">
            Down payment, tenure and commission are configured per category and
            approved before any offer is issued.
          </p>
        </div>
      </section>

      <section className="sec" id="eligibility">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Who can apply</span>
            <h2>Eligibility &amp; required documents</h2>
            <p>
              Simple, transparent criteria to get you verified and behind the
              wheel.
            </p>
          </Reveal>
          <div className="who-grid" style={{ marginTop: 40 }}>
            <Reveal className="who-card lease">
              <h3>✅ Who can apply</h3>
              <div className="sub">Eligibility criteria</div>
              <ul>
                {ELIG.map((x) => (
                  <li key={x}>
                    <span className="tick">✓</span>
                    <div>{x}</div>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="who-card buy" delay={1}>
              <h3>📄 Documents you&apos;ll need</h3>
              <div className="sub">Upload during onboarding</div>
              <ul>
                {DOCS.map((x) => (
                  <li key={x}>
                    <span className="tick">✓</span>
                    <div>{x}</div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec offers-bg" id="faq">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Common questions</span>
            <h2>Drive With Us — FAQs</h2>
          </Reveal>
          <div className="faq-wrap" style={{ marginTop: 44 }}>
            {FAQS.map((f, i) => (
              <details className="faq" key={f.q} open={i === 0}>
                <summary>
                  {f.q}
                  <span className="plus">+</span>
                </summary>
                <div className="ans">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 70 }}>
        <Reveal className="cta-strip">
          <div>
            <h2>Ready to drive with us?</h2>
            <p>
              Create a commercial driver account, complete your KYC and review
              eligible vehicles in your city.
            </p>
          </div>
          <div className="dwu-cta-actions">
            <Link className="btn btn-lg" href="/signup">
              Apply / Drive With Us →
            </Link>
            <Link className="btn btn-lg" href="/login">
              Partner login
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}