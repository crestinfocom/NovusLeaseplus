"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/site-store";

const NAV_LINKS = [
  { href: "/", label: "Home", route: "home" },
  { href: "/fleet", label: "Fleet", route: "fleet" },
  { href: "/compare", label: "Lease vs Buy", route: "compare" },
  { href: "/quote", label: "Get a Quote", route: "quote" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { wish, compare, openWishlist, openCompare } = useStore();
  const pathname = usePathname();

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

  const current = (route: string) =>
    route === "home" ? pathname === "/" : pathname.startsWith(route);

  return (
    <header id="hdr">
      <div className="wrap-wide">
        <nav>
          <Link className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="NovusLease+" height={38} />
          </Link>
          <div className="navlinks" id="navlinks" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-r={l.route}
                className={current(l.route) ? "current" : ""}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="nav-cta">
            <button
              className="hbtn wish"
              data-testid="header-wishlist"
              title="Wishlist"
              aria-label={`Open wishlist (${wish.length})`}
              onClick={openWishlist}
            >
              <span>{wish.length ? "♥" : "♡"}</span>
              <span className={`cnt${wish.length ? " show" : ""}`}>{wish.length}</span>
            </button>
            <button
              className="hbtn cmp"
              data-testid="header-compare"
              title="Compare"
              aria-label={`Open compare (${compare.length})`}
              onClick={openCompare}
            >
              ⇄
              <span className={`cnt${compare.length ? " show" : ""}`}>{compare.length}</span>
            </button>
            <Link className="btn btn-ghost" href="/login">
              Login
            </Link>
            <Link className="btn btn-dark" href="/quote">
              Get a quote →
            </Link>
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
            <Link
              key={l.href}
              href={l.href}
              className={current(l.route) ? "current" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-actions">
          <Link className="btn btn-ghost" href="/login" onClick={() => setOpen(false)}>
            Login
          </Link>
          <Link className="btn btn-dark" href="/quote" onClick={() => setOpen(false)}>
            Get a quote →
          </Link>
        </div>
      </div>
    </header>
  );
}