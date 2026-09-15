"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#offers", label: "Deals" },
  { href: "#models", label: "Fleet" },
  { href: "#calc", label: "Lease vs Buy" },
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why us" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hdr = document.getElementById("hdr");
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1000) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function go(id: string) {
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 30);
  }

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
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="/login">
              Login / Signup
            </a>
            <a className="btn btn-dark" href="#book" onClick={() => go("book")}>
              Book a car →
            </a>
            <button
              type="button"
              className={`burger${open ? " open" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              data-testid="burger"
              onClick={() => setOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu${open ? " open" : ""}`}
        data-testid="mobile-menu"
      >
        <nav className="mobile-links" aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                go(l.href.slice(1));
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mobile-actions">
          <a className="btn btn-ghost" href="/login">
            Login / Signup
          </a>
          <a className="btn btn-dark" href="#book" onClick={() => go("book")}>
            Book a car →
          </a>
        </div>
      </div>
    </header>
  );
}