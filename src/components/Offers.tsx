import Reveal from "./Reveal";

const offers = [
  {
    discount: "10",
    unit: "% off",
    ribbon: null,
    title: "1–3 rental days",
    text: "Ideal for quick weekend escapes and city runs.",
    code: "🎟️ NOVUS10",
  },
  {
    discount: "15",
    unit: "% off",
    ribbon: "Popular",
    title: "3–5 rental days",
    text: "The sweet spot for road trips and long weekends.",
    code: "🎟️ NOVUS15",
  },
  {
    discount: "20",
    unit: "% off",
    ribbon: null,
    title: "5+ days & subscriptions",
    text: "Our best value on extended drives and monthly plans.",
    code: "🎟️ NOVUS20",
  },
];

export default function Offers() {
  return (
    <section className="sec offers-bg" id="offers">
      <div className="wrap">
        <Reveal className="sec-head center">
          <span className="eyebrow center">Limited-time deals</span>
          <h2>The longer you drive, the more you save</h2>
          <p>
            Transparent, stackable discounts on every self-drive rental and
            subscription.
          </p>
        </Reveal>
        <div className="offer-grid" style={{ marginTop: 44 }}>
          {offers.map((offer, i) => (
            <Reveal
              key={offer.code}
              className="offer"
              delay={i > 0 ? (`d${i}` as "d1") : undefined}
            >
              {offer.ribbon && <div className="ribbon">{offer.ribbon}</div>}
              <div className="off">
                {offer.discount}
                <small>{offer.unit}</small>
              </div>
              <h4>{offer.title}</h4>
              <p>{offer.text}</p>
              <span className="code">{offer.code}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}