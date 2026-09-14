import Image from "next/image";
import Reveal from "./Reveal";

export default function CtaFinal() {
  return (
    <section className="wrap" style={{ paddingBottom: 70 }}>
      <Reveal className="cta-final">
        <Image
          src="/images/cta-final.jpg"
          alt=""
          fill
          sizes="100vw"
        />
        <span className="eyebrow center" style={{ color: "var(--gold-soft)" }}>
          On the go
        </span>
        <h2>Book faster with the NovusLease+ app.</h2>
        <p>
          Exclusive in-app offers, one-tap rebooking, and live trip assistance — on
          Android and iOS.
        </p>
        <div className="store-btns">
          <a className="store" href="#">
            <span style={{ fontSize: "1.3rem" }}>▶</span>
            <div>
              <div className="s1">GET IT ON</div>
              <div className="s2">Google Play</div>
            </div>
          </a>
          <a className="store" href="#">
            <span style={{ fontSize: "1.3rem" }} />
            <div>
              <div className="s1">Download on the</div>
              <div className="s2">App Store</div>
            </div>
          </a>
        </div>
      </Reveal>
    </section>
  );
}