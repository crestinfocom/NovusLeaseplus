import Link from "next/link";
import ShareButtons from "./ShareButtons";
import {
  type Car,
  inr,
  lakh,
  termTotal,
  monthly,
  PLANS,
  carSlug as carSlugFor,
} from "@/lib/catalog";
import { PLAN_IDS } from "@/lib/terms";

export default function VehicleDetail({ car }: { car: Car }) {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="vgrid">
          <div className="vgallery">
            <span className="vbadge">
              {car.cls} · {car.fuel}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={car.img} alt={car.name} />
          </div>
          <div className="vinfo">
            <div className="crumb">
              <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
              <Link href="/fleet">Fleet</Link> &nbsp;/&nbsp; {car.name}
            </div>
            <h1>
              {car.make} {car.name}
            </h1>
            <div className="vmore">
              {car.body} · {car.seats} seats · {car.trans}
            </div>

            <div className="vspecs">
              <div className="vspec">
                <div className="k">On-road price</div>
                <div className="val">{lakh(car.onroad)}</div>
              </div>
              <div className="vspec">
                <div className="k">Seats</div>
                <div className="val">{car.seats}</div>
              </div>
              <div className="vspec">
                <div className="k">Fuel</div>
                <div className="val">{car.fuel}</div>
              </div>
              <div className="vspec">
                <div className="k">Transmission</div>
                <div className="val">{car.trans}</div>
              </div>
            </div>

            <div className="vofer">
              <b>Starting at {inr(monthly(car, "sub"))}/month</b> on a Monthly
              Subscription — no down payment, everything included.
              <ul>
                <li>Lease from {inr(monthly(car, "lease"))}/mo, loan from {inr(monthly(car, "loan"))}/mo</li>
                <li>Insurance &amp; servicing bundled on lease and subscription</li>
                <li>Term totals below — all figures include GST</li>
              </ul>
            </div>

            <ShareButtons title={`${car.make} ${car.name}`} slug={carSlugFor(car.name)} />

            <div className="vplans">
              {PLAN_IDS.map((p) => (
                <div className="vplan" key={p} data-plan={p}>
                  <div className="nm">
                    {PLANS[p].icon} {PLANS[p].name}
                  </div>
                  <div className="m">
                    {inr(monthly(car, p))}
                    <small>/month</small>
                  </div>
                  <div className="total" data-testid={`vplan-total-${p}`}>
                    {inr(termTotal(car, p))} total over 36 months
                  </div>
                  <Link className="btn btn-gold" href={`/quote?car=${encodeURIComponent(car.name)}`}>
                    Get this plan →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}