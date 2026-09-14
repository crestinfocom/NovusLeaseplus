import Image from "next/image";
import Reveal from "./Reveal";

const features = [
  { icon: "🛣️", title: "Unlimited-km plans", text: "Go as far as the road takes you." },
  { icon: "🛡️", title: "Insurance & maintenance included", text: "Comprehensive cover and servicing on us." },
  { icon: "🔒", title: "Privacy & freedom", text: "No driver, no schedules — just you." },
  { icon: "🏷️", title: "Best-price guarantee", text: "The lowest self-drive rates in India." },
];

export default function Showcase() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal className="showcase">
          <div className="visual">
            <Image
              src="/images/showcase.jpg"
              alt="NovusLease+ fleet"
              fill
              sizes="(min-width:1000px) 55vw, 100vw"
            />
            <div className="glass">
              <div>
                <div className="g-num">63,000+</div>
                <div className="g-lbl">Cars of global heritage</div>
              </div>
              <div>
                <div className="g-num">4.8★</div>
                <div className="g-lbl">Average driver rating</div>
              </div>
              <div>
                <div className="g-num">₹0</div>
                <div className="g-lbl">Down payment</div>
              </div>
            </div>
          </div>
          <div className="content">
            <span className="eyebrow">Features &amp; benefits</span>
            <h2>Freedom, on your terms</h2>
            <p>
              Everything is bundled into one clean price — no hidden fees, no
              ownership headaches. Just get in and drive.
            </p>
            <div className="feat-list">
              {features.map((f) => (
                <div className="feat-row" key={f.title}>
                  <div className="ic">{f.icon}</div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              className="btn btn-gold"
              href="#book"
              style={{ alignSelf: "flex-start" }}
            >
              Reserve now →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}