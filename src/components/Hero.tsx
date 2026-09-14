import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          placeholder="blur"
          blurDataURL="/images/hero-bg.jpg"
          sizes="100vw"
        />
      </div>
      <div className="wrap" style={{ position: "relative", width: "100%" }}>
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="dot"></span>
            Rated 4.8/5 by 12,000+ drivers · Live in 16 cities
          </div>
          <h1>
            Premium self-drive,
            <br />
            <em>effortlessly</em> yours.
          </h1>
          <p className="lead">
            Rent a spotless, brand-new car by the hour, day, or month —
            insurance, maintenance and doorstep delivery included. From ₹60/hr.
          </p>
          <div className="hero-actions">
            <a className="btn btn-gold btn-lg" href="#book">
              Book your car →
            </a>
            <a
              className="btn btn-ghost btn-lg"
              href="#models"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
            >
              Explore the fleet
            </a>
          </div>
          <div className="hero-trust">
            <div>
              <div className="t-num">16</div>
              <div className="t-lbl">Cities live</div>
            </div>
            <div className="div"></div>
            <div>
              <div className="t-num">
                100<small>+</small>
              </div>
              <div className="t-lbl">Pickup locations</div>
            </div>
            <div className="div"></div>
            <div>
              <div className="t-num">
                20<small>mo</small>
              </div>
              <div className="t-lbl">Avg. fleet age</div>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="mouse"></div>
        Scroll
      </div>
    </section>
  );
}