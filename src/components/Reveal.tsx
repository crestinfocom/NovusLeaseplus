"use client";

import {
  useRef,
  useEffect,
  type ReactNode,
  type Ref,
} from "react";

type RevealProps = {
  children?: ReactNode;
  className?: string;
  delay?: "d1" | "d2" | "d3" | "d4";
  ref?: Ref<HTMLDivElement>;
};

function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]) {
  return (node: T | null) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r && typeof r === "object") (r as { current: T | null }).current = node;
    });
  };
}

export default function Reveal({ children, className = "", delay, ref: externalRef }: RevealProps) {
  const internalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    let revealed = false;
    const mark = () => {
      if (revealed) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 720;
      if (r.top < vh) {
        el.classList.add("in");
        revealed = true;
        io.disconnect();
        window.removeEventListener("scroll", mark);
      }
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) mark();
      });
    });
    io.observe(el);
    window.addEventListener("scroll", mark, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", mark);
    };
  }, []);

  return (
    <div
      ref={mergeRefs(internalRef, externalRef)}
      className={`reveal ${delay ? delay : ""} ${className}`}
    >
      {children}
    </div>
  );
}