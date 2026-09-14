import Reveal from "./Reveal";

const items = [
  {
    icon: "🚪",
    title: "Anywhere delivery",
    text: "Doorstep, airport, hub or nearest SPOC — your call.",
  },
  {
    icon: "🛣️",
    title: "Flexible kilometres",
    text: "Pick 120, 300 or unlimited kms to match your trip.",
  },
  {
    icon: "✨",
    title: "Brand-new fleet",
    text: "Latest models, immaculately kept — avg. age 20 months.",
  },
  {
    icon: "📞",
    title: "24×7 assistance",
    text: "A dedicated call centre for every mile you drive.",
  },
];

export default function Usp() {
  return (
    <div className="usp-bg">
      <div className="wrap">
        <div className="usp-grid">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              className="usp-item"
              delay={i > 0 ? (`d${i}` as "d1") : undefined}
            >
              <div className="ic">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}