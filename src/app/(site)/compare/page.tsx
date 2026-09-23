import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Lease vs Buy — NovusLease+",
  description:
    "Car loan or car lease — which actually costs less? A clear, India-specific comparison of EMI, down payment, tax benefit, mileage limits, resale value and true total cost.",
};

export default function ComparePage() {
  return (
    <>
      <section className="lhero">
        <div className="lhero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sedan.jpg" alt="Lease vs buy" />
        </div>
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Lease vs Buy
          </div>
          <h1>
            Car loan or car lease — <em>which actually costs less?</em>
          </h1>
          <p>
            A clear, India-specific comparison: EMI, down payment, tax benefit,
            mileage limits, resale value and true total cost.
          </p>
          <div className="jump">
            <a href="#compare">📊 Full comparison</a>
            <a href="#who">🎯 Which suits you</a>
            <a href="#tax">💸 Tax benefit</a>
            <Link href="/quote">🧮 Get a quote</Link>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="verdict">
          <div className="vcard">
            <div className="ic" style={{ background: "#eef1f6", color: "var(--ink-2)" }}>
              🏦
            </div>
            <h3>Car loan (buy)</h3>
            <div className="cost">₹11–13 L</div>
            <div className="costl">Typical 5-yr net cost · ₹10 L car</div>
            <ul>
              <li>You own the asset outright</li>
              <li>Keep the full resale value</li>
              <li>No mileage restrictions</li>
              <li className="no">Highest monthly outflow</li>
              <li className="no">10–25% down payment needed</li>
            </ul>
          </div>
          <div className="vcard">
            <div className="ic" style={{ background: "#eef6f3", color: "var(--green)" }}>
              🔑
            </div>
            <h3>Retail car lease</h3>
            <div className="cost">₹14–16 L</div>
            <div className="costl">Typical 5-yr net cost · ₹10 L car</div>
            <ul>
              <li>Zero or minimal down payment</li>
              <li>Insurance &amp; service bundled</li>
              <li>Swap to a new car every 3–4 yrs</li>
              <li className="no">No ownership at the end</li>
              <li className="no">Mileage caps &amp; exit penalties</li>
            </ul>
          </div>
          <div className="vcard best">
            <span className="tagtop">BEST VALUE</span>
            <div
              className="ic"
              style={{ background: "rgba(191,152,93,.14)", color: "var(--gold-deep)" }}
            >
              🏢
            </div>
            <h3>Employer lease</h3>
            <div className="cost">₹8–10 L</div>
            <div className="costl">Effective 5-yr cost after tax shield</div>
            <ul>
              <li>
                Paid from <b>pre-tax</b> salary
              </li>
              <li>Up to ~31% effective tax saving</li>
              <li>Fuel, service, insurance bundled</li>
              <li className="no">Tied to your employer</li>
              <li className="no">Buy-out needed to own it</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" id="compare">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Head to head</span>
            <h2>Loan vs Lease — the full comparison</h2>
            <p>
              Every factor that changes your monthly outflow and final position.
            </p>
          </Reveal>
          <Reveal className="matrix" style={{ marginTop: 40 }}>
            <div className="tbl-scroll">
              <table className="mtable">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>
                      🔑 Car Lease<span className="sm">Pay to use</span>
                    </th>
                    <th>
                      🏦 Car Loan<span className="sm">Pay to own</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monthly EMI</td>
                    <td>
                      Covers only usage cost — typically{" "}
                      <b>30–40% lower</b>
                      <span className="note">Depreciation + finance charge only</span>
                    </td>
                    <td>Covers the full vehicle cost + interest</td>
                  </tr>
                  <tr>
                    <td>Down payment</td>
                    <td className="yes">
                      Usually zero
                      <span className="note">Refundable security deposit may apply</span>
                    </td>
                    <td>
                      10–25% upfront
                      <span className="note">₹1.5–3 L on a ₹15 L car</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Ownership at end</td>
                    <td className="no">
                      No — return the car
                      <span className="note">Unless you pay the residual buy-out</span>
                    </td>
                    <td className="yes">Yes — fully yours</td>
                  </tr>
                  <tr>
                    <td>Resale value</td>
                    <td className="no">Goes to the lessor</td>
                    <td className="yes">
                      Entirely yours<span className="note">₹5–6 L typical after 5 yrs</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Mileage limit</td>
                    <td>
                      Capped — extra kms charged
                      <span className="note">₹7–13/km beyond the pack</span>
                    </td>
                    <td className="yes">No limit — drive freely</td>
                  </tr>
                  <tr>
                    <td>Tax benefit</td>
                    <td className="yes">Up to ~30% via employer scheme</td>
                    <td className="no">None for personal use</td>
                  </tr>
                  <tr>
                    <td>Insurance &amp; servicing</td>
                    <td className="yes">Usually bundled into the rental</td>
                    <td>You arrange and pay separately</td>
                  </tr>
                  <tr>
                    <td>Depreciation risk</td>
                    <td className="yes">Borne by the leasing company</td>
                    <td className="no">
                      Borne by you<span className="note">13–18% p.a.</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Flexibility to exit</td>
                    <td className="no">Difficult — early-exit penalties</td>
                    <td className="yes">Sell the car any time</td>
                  </tr>
                  <tr>
                    <td>Best suited to</td>
                    <td>
                      Employer-scheme staff, businesses, anyone wanting a new car
                      every 3–4 years
                    </td>
                    <td>
                      Long-term keepers, high-mileage drivers, asset builders
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
          <p
            style={{
              fontSize: ".78rem",
              color: "var(--muted)",
              textAlign: "center",
              marginTop: 18,
            }}
          >
            Indicative figures for a typical Indian mid-segment car.
          </p>
        </div>
      </section>

      <section className="wrap" id="tax" style={{ paddingBottom: 20 }}>
        <Reveal className="tax">
          <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
            The deciding factor
          </span>
          <h2>Why an employer lease usually beats both</h2>
          <p>
            In a salary-sacrifice scheme your lease rental is deducted from{" "}
            <b>gross salary before tax</b>. In the 30% slab plus cess that&apos;s
            roughly a 31% effective discount.
          </p>
          <div className="taxgrid">
            <div className="taxbox">
              <div className="n">~31%</div>
              <div className="l">Effective saving in the 30% tax slab</div>
            </div>
            <div className="taxbox">
              <div className="n">30–40%</div>
              <div className="l">Lower monthly payment than a loan EMI</div>
            </div>
            <div className="taxbox">
              <div className="n">₹0</div>
              <div className="l">Down payment on most corporate programmes</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="sec" id="who">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Decision guide</span>
            <h2>Which one suits you?</h2>
          </Reveal>
          <div className="who-grid" style={{ marginTop: 40 }}>
            <Reveal className="who-card lease">
              <h3>🔑 Lease if you…</h3>
              <div className="sub">Usage over ownership</div>
              <ul>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Have an <b>employer lease / FBP scheme</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Are a <b>business owner</b> who can expense the rent
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Want a <b>new car every 3–4 years</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Drive a <b>predictable 12–15k km/year</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>Prefer <b>one bundled bill</b></div>
                </li>
              </ul>
            </Reveal>
            <Reveal className="who-card buy" delay={1}>
              <h3>🏦 Buy with a loan if you…</h3>
              <div className="sub">Ownership and equity</div>
              <ul>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Plan to <b>keep the car 7–10 years</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Drive <b>20,000+ km a year</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Want the <b>resale value</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Have <b>no employer scheme</b>
                  </div>
                </li>
                <li>
                  <span className="tick">✓</span>
                  <div>
                    Can fund the <b>10–25% down payment</b>
                  </div>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec offers-bg">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow center">Common questions</span>
            <h2>Lease vs buy — FAQs</h2>
          </Reveal>
          <div className="faq-wrap" style={{ marginTop: 44 }}>
            <details className="faq" open>
              <summary>
                Is leasing cheaper than buying in India?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Per month, almost always yes — roughly 30–40% below an equivalent
                loan EMI. Over 5+ years a loan usually wins because you keep the
                resale value. The exception is an employer salary-sacrifice lease.
              </div>
            </details>
            <details className="faq">
              <summary>
                Do I get any tax benefit from leasing?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Individuals leasing privately get none. Through an employer scheme
                the rental comes from pre-tax salary — worth ~31% in the 30% slab.
                Business owners can expense the full rent.
              </div>
            </details>
            <details className="faq">
              <summary>
                What happens at the end of a lease?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Return the car, renew into a newer model, or pay the pre-agreed
                residual (typically 45–55%) to own it.
              </div>
            </details>
            <details className="faq">
              <summary>
                Can I compare exact numbers for a specific car?<span className="plus">+</span>
              </summary>
              <div className="ans">
                Yes — our{" "}
                <Link href="/quote" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  quote builder
                </Link>{" "}
                lets you pick any car and toggle between loan, lease and
                subscription. You can also compare up to 3 cars side by side.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="wrap">
        <Reveal className="cta-strip">
          <div>
            <h2>Found your answer? Get your quote.</h2>
            <p>Pick a car and compare all three plans in one view.</p>
          </div>
          <Link className="btn btn-lg" href="/quote">
            Get a quote →
          </Link>
        </Reveal>
      </section>
    </>
  );
}