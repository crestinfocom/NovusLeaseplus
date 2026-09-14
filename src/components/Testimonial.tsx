import Reveal from "./Reveal";

export default function Testimonial() {
  return (
    <section className="sec quote-bg">
      <div className="wrap">
        <Reveal className="quote">
          <div className="stars">★★★★★</div>
          <blockquote>
            &quot;Booked a Creta for a weekend trip to Coorg —{" "}
            <span>delivered spotless to my door</span>, unlimited kms, zero
            paperwork drama. This is how renting a car should feel.&quot;
          </blockquote>
          <div className="who">
            <div className="av">AR</div>
            <div>
              <div className="nm">Ananya Rao</div>
              <div className="rl">Bengaluru · Verified driver</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}