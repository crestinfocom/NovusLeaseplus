import Reveal from "./Reveal";

const reasons = [
  {
    icon: "💳",
    title: "Multiple payment options",
    text: "Credit card, debit card, net banking or UPI — pay the way you prefer.",
  },
  {
    icon: "🔄",
    title: "Easy cancellation",
    text: "Plans changed? Cancel your reservation in just a few clicks.",
  },
  {
    icon: "🚚",
    title: "Doorstep convenience",
    text: "We deliver a cleaned, fuelled car right to your address.",
  },
];

export default function WhyUs() {
  return (
    <section className="sec offers-bg" id="why">
      <div className="wrap">
        <Reveal className="sec-head center">
          <span className="eyebrow center">Why NovusLease+</span>
          <h2>Little things, big difference</h2>
        </Reveal>
        <div className="why-grid" style={{ marginTop: 44 }}>
          {reasons.map((r, i) => (
            <Reveal
              key={r.title}
              className="why"
              delay={i > 0 ? (`d${i}` as "d1") : undefined}
            >
              <div className="ic">{r.icon}</div>
              <h4>{r.title}</h4>
              <p>{r.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}