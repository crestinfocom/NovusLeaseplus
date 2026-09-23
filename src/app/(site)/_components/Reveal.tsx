"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
  className = "",
  delay = 0,
  style,
  children,
}: {
  className?: string;
  delay?: 0 | 1 | 2 | 3;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShow(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = `reveal${delay ? ` d${delay}` : ""}${show ? " in" : ""}${
    className ? ` ${className}` : ""
  }`;
  return (
    <div ref={ref} className={cls} style={style}>
      {children}
    </div>
  );
}