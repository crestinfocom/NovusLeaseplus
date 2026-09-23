"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="f-grid">
          <div className="f-brand">
            <Link href="/" className="f-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-footer.png" alt="NovusLease+" height={34} />
            </Link>
            <p>
              Subscriptions, leases and launch-day cars. Premium self-drive,
              minus the showroom markup.
            </p>
            <div className="social">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="X">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="12" rx="4" />
                  <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
          <div className="f-col">
            <h4>Company</h4>
            <Link href="/#plans">Our plans</Link>
            <Link href="/fleet">The fleet</Link>
            <Link href="/compare">Lease vs buy</Link>
            <Link href="/#how">How it works</Link>
          </div>
          <div className="f-col">
            <h4>Quick links</h4>
            <Link href="/fleet">Browse fleet</Link>
            <Link href="/compare">Lease vs Buy</Link>
            <Link href="/quote">Get a quote</Link>
            <Link href="/#plans">Plans &amp; pricing</Link>
          </div>
          <div className="f-col">
            <h4>Support</h4>
            <Link href="/#faq">Help centre</Link>
            <Link href="/quote">Build a quote</Link>
            <Link href="/compare">Compare plans</Link>
            <Link href="/fleet">Explore cars</Link>
          </div>
          <div className="f-col">
            <h4>Newsletter</h4>
            <p>Drop-in deals, no spam.</p>
            <form
              className="f-news"
              onSubmit={(e) => {
                e.preventDefault();
                e.currentTarget.reset();
              }}
            >
              <input type="email" placeholder="you@email.com" required />
              <button type="submit">→</button>
            </form>
          </div>
        </div>
        <div className="f-bottom">
          <div className="badges">
            <span>🔒 Secure checkout</span>
            <span>⚡ 15-min approval*</span>
            <span>⚙️ 24/7 Roadside Assist</span>
          </div>
          <div className="copy">
            © {new Date().getFullYear()} NovusLease+ · Self-drive car
            subscriptions made smart.
          </div>
        </div>
      </div>
    </footer>
  );
}