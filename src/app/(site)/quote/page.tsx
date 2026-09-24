import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteBuilder from "../_components/QuoteBuilder";
import FeesGuide from "../_components/FeesGuide";

export const metadata: Metadata = {
  title: "Get a Quote — NovusLease+",
  description:
    "Filter the fleet, compare up to 3 cars, save favourites — then toggle between a car loan, retail lease and monthly subscription.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <>
      <Suspense
        fallback={
          <div style={{ padding: "120px 30px", textAlign: "center", color: "var(--muted)" }}>
            Loading quote builder…
          </div>
        }
      >
        <QuoteBuilder />
      </Suspense>
      <FeesGuide />
    </>
  );
}