"use client";
import { useState, useEffect } from "react";

const links = [
  { href: "/tsg", label: "HOME" },
  { href: "/tsg#sessions", label: "SESSIONS" },
  { href: "/tsg#tool", label: "TOOL" },
  { href: "/tsg/files", label: "FILES", className: "text-signal" },
  { href: "/tsg/frequencies", label: "FREQUENCIES", className: "text-pulse" },
  { href: "/tsg/files?tab=disclosure", label: "DISCLOSURE" },
  { href: "/tsg#field-guide", label: "FIELD GUIDE" },
  { href: "/tsg#about", label: "ABOUT" },
  { href: "/tsg/submit", label: "CONTACT" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  // Close mobile menu on resize past md breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-bone/10 bg-transparent backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <a href="/tsg" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-signal/40">
            <div className="h-2 w-2 rounded-full bg-signal animate-glow-breathe" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide">TELEKINESIS</p>
            <p className="text-[10px] tracking-[0.2em] text-ember">SUPPORT GROUP</p>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 text-xs tracking-[0.15em] text-bone/70 md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className={`transition hover:text-bone ${l.className || ""}`}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a href="#join" className="hidden md:inline-block rounded-full border border-ember bg-ember/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-ember transition hover:bg-ember hover:text-black">
          JOIN THE LIST
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`block h-px w-5 bg-bone transition-all duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`block h-px w-5 bg-bone transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-bone transition-all duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 top-0 z-40 bg-void/95 backdrop-blur-md md:hidden">
          <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-lg tracking-[0.25em] text-bone/80 transition hover:text-bone ${l.className || ""}`}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-4 h-px w-16 bg-signal/20" />
            <a
              href="#join"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full border border-ember bg-ember/10 px-8 py-3 text-sm font-semibold tracking-wider text-ember transition hover:bg-ember hover:text-black"
            >
              JOIN THE LIST
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
