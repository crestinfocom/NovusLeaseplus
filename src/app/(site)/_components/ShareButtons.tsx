"use client";

import { useState } from "react";

export default function ShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/fleet/${slug}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${title} — compare loan, lease & subscription`
  )}&url=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="vshare" aria-label="Share this offer">
      <span style={{ fontSize: ".8rem", color: "var(--muted)", fontWeight: 700 }}>
        Share this offer
      </span>
      <button className="share-btn" onClick={copy} aria-live="polite">
        {copied ? "✓ Link copied" : "🔗 Copy link"}
      </button>
      <a className="share-btn" href={whatsapp} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className="share-btn" href={x} target="_blank" rel="noopener noreferrer">
        Post on X
      </a>
    </div>
  );
}