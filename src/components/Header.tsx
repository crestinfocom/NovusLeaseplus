"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Header() {
  useEffect(() => {
    const hdr = document.getElementById("hdr");
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="hdr">
      <div className="wrap">
        <nav>
          <a className="brand" href="#top">
            <Image
              src="/images/logo.png"
              alt="NovusLease+"
              width={0}
              height={38}
              sizes="auto"
              style={{ width: "auto", height: 38 }}
              priority
            />
          </a>
          <div className="navlinks">
            <a href="#offers">Deals</a>
            <a href="#models">Fleet</a>
            <a href="#calc">Lease vs Buy</a>
            <a href="#how">How it works</a>
            <a href="#why">Why us</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="/login">
              Login / Signup
            </a>
            <a className="btn btn-dark" href="#book">
              Book a car →
            </a>
            <div
              className="burger"
              role="button"
              aria-label="Open booking"
              onClick={() =>
                document
                  .getElementById("book")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}