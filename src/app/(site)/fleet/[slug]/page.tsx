import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VehicleDetail from "../../_components/VehicleDetail";
import JsonLd from "../../_components/JsonLd";
import { CARS, carBySlug, carSlug, carFullName, monthly, termTotal, inr } from "@/lib/catalog";

const SITE = "https://novuslease.in";

export function generateStaticParams() {
  return CARS.map((c) => ({ slug: carSlug(c.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = carBySlug(slug);
  if (!car) return { title: "Car not found — NovusLease+" };
  const title = `${carFullName(car)} — Loans, Lease & Subscription | NovusLease+`;
  const description = `${carFullName(car)}: from ${inr(
    monthly(car, "sub")
  )}/month on a subscription, ${inr(monthly(car, "lease"))}/mo lease or ${inr(
    monthly(car, "loan")
  )}/mo loan. Fixed 36-month totals, GST included. Compare all three plans.`;
  return {
    title,
    description,
    alternates: { canonical: `/fleet/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/fleet/${slug}`,
      type: "website",
      images: [{ url: `${SITE}${car.img}`, alt: car.name }],
      siteName: "NovusLease+",
    },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = carBySlug(slug);
  if (!car) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: carFullName(car),
    description: `${carFullName(car)} — ${car.body} available on car loan, retail lease and monthly subscription in India.`,
    category: car.cls,
    image: `${SITE}${car.img}`,
    brand: { "@type": "Brand", name: car.make },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: monthly(car, "sub"),
      highPrice: termTotal(car, "loan"),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <VehicleDetail car={car} />
    </>
  );
}