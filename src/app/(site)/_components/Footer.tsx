"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-footer.png" alt="NovusLease+" />
            </Link>
            <p>
              Premium self-drive car rentals and subscriptions across India.
              Elegant service, transparent pricing, freedom on every trip.
            </p>
            <div className="foot-social">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="X">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M6.5 8.8v9.7M3 8.8v9.7M6.5 5.7a1.6 1.6 0 11-3.2 0 1.6 1.6 0 013.2 0zM12 18.5v-6a2.7 2.7 0 015.4 0v6M12 18.5V8.8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
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
          <div className="foot-col">
            <h5>Explore</h5>
            <Link href="/#plans">Plans</Link>
            <Link href="/fleet">Fleet</Link>
            <Link href="/compare">Lease vs Buy</Link>
            <Link href="/quote">Get a Quote</Link>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <Link href="/#plans">About us</Link>
            <Link href="/quote">Contact us</Link>
            <Link href="/fleet">Become a partner</Link>
            <Link href="/quote">Refer &amp; earn</Link>
          </div>
          <div className="foot-col">
            <h5>Support</h5>
            <Link href="/#faq">FAQs</Link>
            <Link href="/#plans">Terms of service</Link>
            <Link href="/#how">Privacy policy</Link>
            <Link href="/#faq">Help centre</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {new Date().getFullYear()} NovusLease+ Mobility Pvt. Ltd. · 16
            cities across India
          </span>
          <span>Best-price guarantee · Prices inclusive of taxes</span>
        </div>
      </div>
    </footer>
  );
}