import type { Metadata } from "next";
import Link from "next/link";
import TrackLookup from "./TrackLookup";

export const metadata: Metadata = {
  title: "Track Your Application or Booking — NovusLease+",
  description:
    "Check the live status of your NovusLease+ application or booking with your 6-character reference — what has happened and exactly what to do next.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <>
      <section className="trackhero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> &nbsp;/&nbsp; Track booking
          </div>
          <h1>
            Track your <em>application or booking</em>
          </h1>
          <p>
            Enter your reference to see the live status, what has been completed,
            and your exact next steps.
          </p>
        </div>
      </section>

      <section className="wrap">
        <TrackLookup />
      </section>
    </>
  );
}