import type { Metadata } from "next";
import Link from "next/link";
import TrackLookup from "./TrackLookup";

export const metadata: Metadata = {
  title: "Track Your Booking — NovusLease+",
  description:
    "Check the live status of your NovusLease+ booking with your 6-character reference — see completed milestones and your next actions.",
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
            Track your <em>booking</em>
          </h1>
          <p>
            Enter your booking reference to see its live status, completed
            milestones, and next actions.
          </p>
        </div>
      </section>

      <section className="wrap">
        <TrackLookup />
      </section>
    </>
  );
}