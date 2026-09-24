"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ToastHost } from "@/lib/toast-bus";
import { emitAdminSearch } from "@/lib/search-bus";

export type AdminShellUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const TITLES: Record<string, [string, string]> = {
  dashboard: ["Dashboard", "Home / Dashboard"],
  bookings: ["Bookings", "Home / Bookings"],
  fleet: ["Fleet", "Home / Fleet"],
  customers: ["Customers", "Home / Customers"],
  offers: ["Offers & Codes", "Home / Offers"],
  settings: ["Settings", "Home / Settings"],
};

const NAV: {
  section: string;
  items: { view: string; ic: string; label: string }[];
}[] = [
  {
    section: "Overview",
    items: [
      { view: "dashboard", ic: "▦", label: "Dashboard" },
      { view: "bookings", ic: "▤", label: "Bookings" },
    ],
  },
  {
    section: "Management",
    items: [
      { view: "fleet", ic: "▣", label: "Fleet" },
      { view: "customers", ic: "◕", label: "Customers" },
      { view: "offers", ic: "◈", label: "Offers & Codes" },
    ],
  },
  {
    section: "System",
    items: [{ view: "settings", ic: "⚙", label: "Settings" }],
  },
];

function titleFor(path: string): [string, string] {
  const seg = path.split("/").filter(Boolean).pop() ?? "dashboard";
  return TITLES[seg] ?? TITLES.dashboard;
}

export default function AdminShell({
  session,
  children,
}: {
  session: AdminShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState<number | null>(null);

  const view = (pathname.split("/")[2] ?? "dashboard") as string;
  const [title, crumb] = titleFor(pathname);
  const activeSeg = TITLES[view] ? view : "dashboard";
  const initials = session.name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLabel = session.role === "ADMIN" ? "Super Admin" : "Operations Staff";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/bookings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.ok) return;
        const open = (data.bookings as { status: string }[]).filter(
          (b) => b.status === "CONFIRMED" || b.status === "PICKED_UP"
        ).length;
        setOpenCount(open);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="admin">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sb-logo">
          <Link href="/admin/dashboard" aria-label="Admin dashboard">
            <Image
              src="/images/logo-footer.png"
              alt="NovusLease+"
              width={0}
              height={34}
              sizes="auto"
              style={{ width: "auto", height: 34 }}
            />
          </Link>
        </div>
        <nav className="sb-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="sb-sec">{group.section}</div>
              {group.items.map((item) => (
                <Link
                  key={item.view}
                  href={`/admin/${item.view}`}
                  className={`sb-link${activeSeg === item.view ? " active" : ""}`}
                  aria-current={activeSeg === item.view ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="ic" aria-hidden="true">
                    {item.ic}
                  </span>
                  {item.label}
                  {item.view === "bookings" && openCount !== null && openCount > 0 && (
                    <span className="badge" data-testid="nav-open-count">
                      {openCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="av">{initials}</div>
            <div>
              <div className="nm">{session.name}</div>
              <div className="rl">{roleLabel}</div>
            </div>
            <button
              className="sb-logout"
              title="Sign out"
              aria-label="Sign out"
              onClick={logout}
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      <div className="adm-main">
        <div className="adm-top">
          <button
            className="burger"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <div>
            <h1>{title}</h1>
            <div className="crumb">{crumb}</div>
          </div>
          <div className="adm-search">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search bookings, cars, customers…"
              aria-label="Global search"
              onChange={(e) => emitAdminSearch(e.target.value)}
            />
          </div>
          <button className="tb-icon" title="Notifications" type="button">
            <span className="dot" />
            🔔
          </button>
          <button className="tb-icon" title="Help" type="button">
            ?
          </button>
          <Link
            className="tb-link"
            href="/"
            data-testid="admin-view-site"
          >
            View public site ↗
          </Link>
        </div>

        <div className="adm-content">
          <div className="adm-inner">{children}</div>
        </div>
      </div>

      <ToastHost />
    </div>
  );
}