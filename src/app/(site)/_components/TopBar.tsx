"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <div className="topbar" data-testid="topbar">
      ✨ Festive offer live — <b>Flat 20% off</b> on 5+ day rentals &amp;
      first-month subscriptions.{" "}
      <Link href="/#plans" data-testid="topbar-offer-link">
        Grab the code →
      </Link>
    </div>
  );
}