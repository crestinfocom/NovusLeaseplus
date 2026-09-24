import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "./_components/Reveal";
import ModelCard from "./_components/ModelCard";
import JsonLd from "./_components/JsonLd";
import { CARS, PICKED_MODELS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "NovusLease+ — Car Loan, Lease & Subscription in India",
  description:
    "Buy on loan, take a retail lease, or subscribe monthly. Compare up to 3 cars side by side and get an instant quote.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NovusLease+ — Car Loan, Lease & Subscription in India",
    description:
      "Buy on loan, take a retail lease, or subscribe monthly. Compare up to 3 cars side by side.",
    type: "website",
    siteName: "NovusLease+",
    images: ["/images/hero.jpg"],
  },
};

const PICKED = PICKED_MODELS.map((n) => CARS.find((c) => c.name === n)).filter(
  (c): c is (typeof CARS)[number] => Boolean(c)
);

const HOME_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "NovusLease+",
      url: "https://novuslease.in",
      logo: "https://novuslease.in/images/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-1800-XXX-XXXX",
        contactType: "customer service",
        availableLanguage: ["en", "hi"],
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Should I lease or buy a car in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Leasing is cheaper per month (30–40% below a loan EMI) but you keep no ownership. Buying with a loan costs more monthly but keeps the resale value. Employer salary-sacrifice leases offer up to ~31% tax saving.",
          },
        },
        {
          "@type": "Question",
          name: "What plans does NovusLease+ offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Three ways to drive: a Car Loan to own, a Retail Car Lease with insurance and servicing bundled, and an all-inclusive Monthly Subscription with no down payment that you can cancel with 30 days notice.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={HOME_LD} />
      <section className="hero">
        <div className="hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="Premium SUV" />
        </div>
        <div className="wrap">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="dot"></span>Rated 4.8/5 by 12,000+ drivers · Live in
              16 cities
            </div>
            <h1>
              Premium self-drive,
              <br />
              <em>effortlessly</em> yours.
            </h1>
            <p className="lead">
              Buy on loan, take a retail lease, or subscribe monthly — compare up to
              3 cars side by side and get an instant quote.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold btn-lg" href="/quote">
                Get a quote →
              </Link>
              <Link
                className="btn btn-ghost btn-lg"
                href="/fleet"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
              >
                Explore the fleet
              </Link>
            </div>
            <div className="hero-trust">
              <div>
                <div className="t-num">16</div>
                <div className="t-lbl">Cities live</div>
              </div>
              <div className="div"></div>
              <div>
                <div className="t-num">
                  100<small>+</small>
                </div>
                <div className="t-lbl">Pickup locations</div>
              </div>
              <div className="div"></div>
              <div>
                <div className="t-num">3</div>
                <div className="t-lbl">Plans per car</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="usp-bg">
        <div className="wrap">
          <div className="usp-grid">
            <Reveal className="usp-item">
              <div className="ic">⇄</div>
              <h4>Compare up to 3</h4>
              <p>Line up three cars and see specs and prices side by side.</p>
            </Reveal>
            <Reveal className="usp-item" delay={1}>
              <div className="ic">♥</div>
              <h4>Save a wishlist</h4>
              <p>Shortlist favourites and come back to them any time.</p>
            </Reveal>
            <Reveal className="usp-item" delay={2}>
              <div className="ic">✨</div>
              <h4>Brand-new fleet</h4>
              <p>Latest models, immaculately kept — avg. age 20 months.</p>
            </Reveal>
            <Reveal className="usp-item" delay={3}>
              <div className="ic">📞</div>
              <h4>24×7 assistance</h4>
              <p>A dedicated call centre for every mile you drive.</p>
            </Reveal>
          </div>
        </div>
      </div>

      <section className="sec offers-bg" id="plans">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Three ways to drive</span>
            <h2>Loan, lease or subscription?</h2>
            <p>
              Pick the ownership model that fits your life — then compare exact
              monthly figures.
            </p>
          </Reveal>
          <div className="plan3" style={{ marginTop: 44 }}>
            <Reveal className="p3">
              <div className="ic">🏦</div>
              <h4>Car Loan</h4>
              <p>Finance the purchase and own the asset outright at the end.</p>
              <ul>
                <li>You own the car</li>
                <li>Keep the full resale value</li>
                <li>No mileage limits</li>
              </ul>
            </Reveal>
            <Reveal className="p3" delay={1}>
              <div className="ic">🔑</div>
              <h4>Retail Car Lease</h4>
              <p>Fixed-term lease with insurance and servicing bundled in.</p>
              <ul>
                <li>Low or zero down payment</li>
                <li>Insurance &amp; service included</li>
                <li>Buy-out option at term end</li>
              </ul>
            </Reveal>
            <Reveal className="p3" delay={2}>
              <div className="ic">♾️</div>
              <h4>Monthly Subscription</h4>
              <p>All-inclusive monthly plan with total flexibility.</p>
              <ul>
                <li>Zero down payment</li>
                <li>Everything bundled</li>
                <li>Cancel with 30 days notice</li>
              </ul>
            </Reveal>
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Reveal>
              <Link className="btn btn-gold btn-lg" href="/quote">
                Compare all three →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec" id="models">
        <div className="wrap">
          <div className="sec-flex">
            <Reveal className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Most loved</span>
              <h2>Best-selling models</h2>
              <p>Tap ⇄ to compare or ♡ to save for later.</p>
            </Reveal>
            <Reveal className="" delay={1}>
              <Link className="btn btn-ghost" href="/fleet">
                View all cars →
              </Link>
            </Reveal>
          </div>
          <div
            className="car-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: 26,
              marginTop: 44,
            }}
          >
            {PICKED.map((car) => (
              <ModelCard key={car.name} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec how-bg" id="how">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center" style={{ color: "var(--gold)" }}>
              Simple by design
            </span>
            <h2>Your car, in four simple steps</h2>
            <p style={{ color: "rgba(255,255,255,.66)" }}>
              From shortlist to driveway in minutes.
            </p>
          </Reveal>
          <div className="steps" style={{ marginTop: 48 }}>
            <Reveal className="step">
              <div className="n">01</div>
              <h4>Shortlist &amp; compare</h4>
              <p>Save favourites, compare up to 3 cars.</p>
            </Reveal>
            <Reveal className="step" delay={1}>
              <div className="n">02</div>
              <h4>Choose your plan</h4>
              <p>Loan, lease or subscription — side by side.</p>
            </Reveal>
            <Reveal className="step" delay={2}>
              <div className="n">03</div>
              <h4>Verify yourself</h4>
              <p>Quick online KYC with licence and ID.</p>
            </Reveal>
            <Reveal className="step" delay={3}>
              <div className="n">04</div>
              <h4>Send for approval</h4>
              <p>Share the quote and drive away.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec" id="faq">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Good to know</span>
            <h2>Frequently asked questions</h2>
          </Reveal>
          <div className="faq-wrap" style={{ marginTop: 44 }}>
            <details className="faq" open>
              <summary>
                How does compare work?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Tap the ⇄ button on any car to add it to your compare tray — up to 3
                at once. Open the tray to see specs and all three plan prices side
                by side, with the best value in each row highlighted.
              </div>
            </details>
            <details className="faq">
              <summary>
                What is the wishlist?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Tap ♡ on any car to save it. Your wishlist is stored in your
                browser, so it&apos;s still there when you return. Open it from the
                heart icon in the header.
              </div>
            </details>
            <details className="faq">
              <summary>
                How do I get a price quote?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Use{" "}
                <Link
                  href="/quote"
                  style={{ color: "var(--gold-deep)", fontWeight: 600 }}
                >
                  Get a Quote
                </Link>{" "}
                — filter the fleet, pick a car, then toggle between loan, lease and
                subscription.
              </div>
            </details>
            <details className="faq">
              <summary>
                Should I lease or buy?<span className="plus">+</span>
              </summary>
              <div className="ans">
                It depends on mileage, tax situation and how long you&apos;ll keep
                the car. Our{" "}
                <Link
                  href="/compare"
                  style={{ color: "var(--gold-deep)", fontWeight: 600 }}
                >
                  Lease vs Buy comparison
                </Link>{" "}
                breaks down every factor.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 70 }}>
        <Reveal className="cta-final">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sedan.jpg" alt="Drive with NovusLease+" />
          <span className="eyebrow center" style={{ color: "var(--gold-soft)" }}>
            Ready when you are
          </span>
          <h2>Your next car is one quote away.</h2>
          <p>
            Compare a loan, lease and subscription in under two minutes — no
            obligation.
          </p>
          <Link className="btn btn-gold btn-lg" href="/quote">
            Get a quote →
          </Link>
        </Reveal>
      </section>
    </>
  );
}