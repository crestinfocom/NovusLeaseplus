import Reveal from "./Reveal";

const steps = [
  { n: "01", title: "Select city & dates", text: "Choose your location and travel window." },
  { n: "02", title: "Choose car & delivery", text: "Pick a model and how you'd like it delivered." },
  { n: "03", title: "Verify yourself", text: "Quick online KYC with licence and ID." },
  { n: "04", title: "Make payment", text: "Pay securely via card, UPI or net banking." },
];

export default function HowItWorks() {
  return (
    <section className="sec how-bg" id="how">
      <div className="wrap">
        <Reveal className="sec-head center">
          <span className="eyebrow center" style={{ color: "var(--gold)" }}>
            Book online in India
          </span>
          <h2>Your car, in four simple steps</h2>
          <p style={{ color: "rgba(255,255,255,.66)" }}>
            From selection to your driveway — the whole journey takes minutes.
          </p>
        </Reveal>
        <div className="steps" style={{ marginTop: 48 }}>
          {steps.map((step, i) => (
            <Reveal
              key={step.n}
              className="step"
              delay={i > 0 ? (`d${i}` as "d1") : undefined}
            >
              <div className="n">{step.n}</div>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}