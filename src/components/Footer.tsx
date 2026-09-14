import Image from "next/image";

const explore = ["Deals", "Fleet", "Lease vs Buy", "Subscription"];
const exploreHrefs = ["#offers", "#models", "#calc", "#book"];
const company = ["About us", "Contact us", "Become a partner", "Refer & earn"];
const companyHrefs = ["#why", "#footer", "#", "#"];
const support = ["FAQs", "Terms of service", "Privacy policy", "Help centre"];
const supportHrefs = ["#faq", "#", "#", "#"];

export default function Footer() {
  return (
    <footer id="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <a className="brand" href="#top">
              <Image
                src="/images/logo-footer.png"
                alt="NovusLease+"
                width={0}
                height={40}
                sizes="auto"
                style={{ width: "auto", height: 40 }}
              />
            </a>
            <p>
              Premium self-drive car rentals and subscriptions across India. Elegant
              service, transparent pricing, and freedom on every trip.
            </p>
            <div className="foot-social">
              <a href="#" aria-label="Facebook">
                f
              </a>
              <a href="#" aria-label="LinkedIn">
                in
              </a>
              <a href="#" aria-label="X">
                ✕
              </a>
              <a href="#" aria-label="Instagram">
                ◎
              </a>
            </div>
          </div>
          <div className="foot-col">
            <h5>Explore</h5>
            {explore.map((label, i) => (
              <a key={label} href={exploreHrefs[i]}>
                {label}
              </a>
            ))}
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            {company.map((label, i) => (
              <a key={label} href={companyHrefs[i]}>
                {label}
              </a>
            ))}
          </div>
          <div className="foot-col">
            <h5>Support</h5>
            {support.map((label, i) => (
              <a key={label} href={supportHrefs[i]}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 NovusLease+ Mobility Pvt. Ltd. · 16 cities across India</span>
          <span>Best-price guarantee · Prices inclusive of taxes</span>
        </div>
      </div>
    </footer>
  );
}