import type { Metadata } from "next";
import Link from "next/link";
import FleetExplorer from "../_components/FleetExplorer";
import JsonLd from "../_components/JsonLd";
import { CARS, carSlug } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Our Fleet — NovusLease+",
  description:
    "Every car in our fleet. Compare up to 3 side by side, save your favourites, then get a quote on a loan, lease or subscription.",
  alternates: { canonical: "/fleet" },
  openGraph: {
    title: "Our Fleet — NovusLease+",
    description:
      "Every car in our fleet. Compare up to 3 side by side, save favourites, get a quote on a loan, lease or subscription.",
    type: "website",
    siteName: "NovusLease+",
    images: ["/images/hero.jpg"],
  },
};

export default function FleetPage() {
  const fleetLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "NovusLease+ fleet",
    numberOfItems: CARS.length,
    itemListElement: CARS.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `https://novuslease.in/fleet/${carSlug(c.name)}`,
    })),
  };
  return (
    <>
      <JsonLd data={fleetLd} />
      <section className="fhero">
        <div className="fhero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="Fleet" />
        </div>
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Fleet
          </div>
          <h1>
            Every car in our <em>fleet</em>.
          </h1>
          <p>
            Compare up to 3 side by side, save your favourites, then get a quote on
            a loan, lease or subscription.
          </p>
          <div className="fstats">
            <div>
              <div className="n">{CARS.length}</div>
              <div className="l">Cars available</div>
            </div>
            <div>
              <div className="n">₹15,600</div>
              <div className="l">Starting / month</div>
            </div>
            <div>
              <div className="n">3</div>
              <div className="l">Plans per car</div>
            </div>
            <div>
              <div className="n">48 hrs</div>
              <div className="l">Delivery time</div>
            </div>
          </div>
        </div>
      </section>

      <FleetExplorer />
    </>
  );
}