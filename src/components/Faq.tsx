import Reveal from "./Reveal";

const faqs = [
  {
    q: "What is NovusLease+ car rental service?",
    a: "NovusLease+ is a premium self-drive brand offering clean, well-maintained cars on short-term rental — daily, weekly, fortnightly — or monthly subscription. Enjoy unbeatable rates, quick online booking, unlimited kilometres, limited liability, and anywhere delivery.",
  },
  {
    q: "Is NovusLease+ available in my city?",
    a: "We operate across 16 cities and 100+ locations in India, including Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Kochi and Ahmedabad. Enter your city in the booking widget to check live availability.",
  },
  {
    q: "What documents do I need to rent a car?",
    a: "A valid driving licence, a government-issued ID (Aadhaar/passport), and a quick online KYC verification are all you need to hit the road.",
  },
  {
    q: "How does the kilometre limit work?",
    a: "Choose from 120 kms, 300 kms, or unlimited-km packages based on your travel needs. Extra kilometres beyond your package are billed at a transparent per-km rate shown upfront at booking.",
  },
  {
    q: "Can I get the car delivered to me?",
    a: "Yes — select doorstep, airport, hub, or nearest SPOC location delivery at checkout, whichever is most convenient for you.",
  },
];

export default function Faq() {
  return (
    <section className="sec" id="faq">
      <div className="wrap">
        <Reveal className="sec-head center">
          <span className="eyebrow center">Good to know</span>
          <h2>Frequently asked questions</h2>
        </Reveal>
        <div className="faq-wrap" style={{ marginTop: 44 }}>
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i > 0 ? (`d${Math.min(i, 4)}` as "d1") : undefined}>
              <details className="faq" open={i === 0}>
                <summary>
                  {faq.q} <span className="plus">+</span>
                </summary>
                <div className="ans">{faq.a}</div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}