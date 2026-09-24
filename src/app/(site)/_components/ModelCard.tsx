"use client";

import Link from "next/link";
import { useStore, CarIconActions, CarRowActions } from "@/lib/site-store";
import { type Car, inr, lakh, monthly, termTotal, carSlug } from "@/lib/catalog";

export default function ModelCard({
  car,
  showDoorstep = false,
}: {
  car: Car;
  showDoorstep?: boolean;
}) {
  const { compare } = useStore();
  const cmpOn = compare.some((c) => c.name === car.name);
  const href = `/fleet/${carSlug(car.name)}`;
  return (
    <article className={`model${cmpOn ? " cmp-on" : ""}`} data-name={car.name} data-car={car.name}>
      <div className="pic">
        <Link href={href} className="pic-link" aria-label={`View ${car.name} details`}>
          <span className="badge">
            {cmpOn ? "★ Comparing" : car.tag === "new" ? "New launch" : "★ Popular"}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={car.img} alt={car.name} loading="lazy" />
        </Link>
        <CarIconActions car={car} />
        <span className="fuel">{car.fuel}</span>
      </div>
      <div className="mbody">
        <Link href={href} className="name-link">
          <h4 className="car-name">{car.name}</h4>
        </Link>
        <div className="cls">{car.cls}</div>
        <div className="seat">
          <span>👥 {car.seats || 5} Seater</span>
          <span>⚙️ {car.trans || "Manual"}</span>
          {showDoorstep && <span>📍 Doorstep</span>}
        </div>
        <div className="mrate">
          <div className="rate">
            {inr(monthly(car, "lease") as number)}
            <small>/mo lease</small>
          </div>
          <span className="onroad">{lakh(car.onroad)} on-road</span>
        </div>
        <div className="total-line" data-testid="card-total">
          {inr(termTotal(car, "lease"))} total over 36 months
        </div>
        <div className="mctas">
          <Link
            className="lease-btn"
            href={`/quote?car=${encodeURIComponent(car.name)}`}
          >
            📄 Get a quote →
          </Link>
          <Link className="view-btn" href={href}>
            View details
          </Link>
        </div>
        <CarRowActions car={car} />
      </div>
    </article>
  );
}