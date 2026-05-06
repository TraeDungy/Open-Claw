"use client";
import { useEffect, useRef } from "react";

export default function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "scale";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const base = variant === "scale" ? "scroll-reveal-scale" : "scroll-reveal";
  const stagger = delay > 0 ? `stagger-${delay}` : "";

  return (
    <div ref={ref} className={`${base} ${stagger} ${className}`}>
      {children}
    </div>
  );
}
