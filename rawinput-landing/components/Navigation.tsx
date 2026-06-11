"use client";
import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Index", href: "/index-page" },
  { label: "Jobs", href: "/index-page?tab=jobs" },
  { label: "Creators", href: "#creators" },
  { label: "Gallery", href: "#gallery" },
  { label: "Who Cooked?", href: "#who-cooked" },
  { label: "About", href: "/about" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-md border-b border-noise">
      <div className="container-wide flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-input rounded-sm flex items-center justify-center font-mono text-void text-xs font-bold group-hover:glow-input transition-shadow">
            RI
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-raw">
            RAW INPUT
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-chrome text-sm font-medium hover:text-raw transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#signup"
            className="bg-input text-void px-5 py-2 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-void transition-all"
          >
            Subscribe
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-raw p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`block h-0.5 bg-raw transition-transform ${open ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block h-0.5 bg-raw transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 bg-raw transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-void border-t border-noise">
          <div className="container-wide py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-chrome text-lg font-medium hover:text-raw transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#signup"
              className="bg-input text-void px-5 py-3 rounded-sm text-sm font-bold uppercase tracking-wider text-center mt-2"
              onClick={() => setOpen(false)}
            >
              Subscribe
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
