"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mainLinks = [
  { href: "/tsg", label: "HOME" },
  { href: "/tsg#sessions", label: "SESSIONS" },
  { href: "/tsg/tool", label: "TOOL" },
  { href: "/tsg/submit", label: "CONTACT" },
];

const archiveLinks = [
  { href: "/tsg/files", label: "FILES" },
  { href: "/tsg/frequencies", label: "FREQUENCIES" },
  { href: "/tsg/files?tab=disclosure", label: "DISCLOSURE" },
  { href: "/tsg/files?tab=studies", label: "STUDIES" },
  { href: "/tsg/files?tab=individuals", label: "SUBJECTS" },
  { href: "/tsg/files?tab=timeline", label: "TIMELINE" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [archivesOpen, setArchivesOpen] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) { setOpen(false); setArchivesOpen(false); } };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
          {mainLinks.slice(0, 3).map((l) => (
            <a key={l.label} href={l.href} className="transition hover:text-bone">
              {l.label}
            </a>
          ))}
          <div className="relative group">
            <button className="flex items-center gap-1 transition hover:text-bone text-signal">
              ARCHIVES
              <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="rounded-lg border border-bone/10 bg-void/95 backdrop-blur-md py-2 px-1 min-w-[160px]">
                {archiveLinks.map((l) => (
                  <a key={l.label} href={l.href} className="block px-4 py-2 text-[10px] tracking-[0.2em] text-bone/60 transition hover:text-bone hover:bg-bone/5 rounded">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <a href="/tsg/submit" className="transition hover:text-bone">CONTACT</a>
        </div>

        {/* Desktop CTA */}
        <a href="#join" className="hidden md:inline-block rounded-full border border-ember bg-ember/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-ember transition hover:bg-ember hover:text-black">
          JOIN THE LIST
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => { setOpen(!open); if (open) setArchivesOpen(false); }}
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`block h-px w-5 bg-bone transition-all duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`block h-px w-5 bg-bone transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-bone transition-all duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu — animated overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-0 z-40 md:hidden"
          >
            {/* Solid dark background — no bleed-through */}
            <div className="absolute inset-0 bg-[#030303]" />

            {/* Subtle ambient glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-[300px] w-[300px] rounded-full bg-ember/3 blur-[120px]" />

            {/* Menu content */}
            <div className="relative flex min-h-screen flex-col items-center justify-center gap-0 px-8">
              {/* Main links — staggered fade in */}
              {mainLinks.slice(0, 3).map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                  className="py-3 text-xl tracking-[0.3em] text-bone font-semibold transition hover:text-ember"
                >
                  {l.label}
                </motion.a>
              ))}

              {/* Archives accordion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.23, duration: 0.3 }}
                className="mt-1"
              >
                <button
                  onClick={() => setArchivesOpen(!archivesOpen)}
                  className="flex items-center gap-2 py-3 text-xl tracking-[0.3em] text-signal font-semibold transition"
                >
                  ARCHIVES
                  <motion.svg
                    animate={{ rotate: archivesOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {archivesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col items-center gap-2 pb-3 pt-1">
                        {archiveLinks.map((l, i) => (
                          <motion.a
                            key={l.label}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.2 }}
                            className="text-sm tracking-[0.25em] text-bone/50 transition hover:text-signal"
                          >
                            {l.label}
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Contact */}
              <motion.a
                href="/tsg/submit"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.29, duration: 0.3 }}
                className="py-3 text-xl tracking-[0.3em] text-bone font-semibold transition hover:text-ember"
              >
                CONTACT
              </motion.a>

              {/* Divider + CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-6 flex flex-col items-center"
              >
                <div className="h-px w-12 bg-signal/20 mb-5" />
                <a
                  href="#join"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-ember bg-ember/10 px-8 py-3 text-sm font-semibold tracking-wider text-ember transition hover:bg-ember hover:text-black"
                >
                  JOIN THE LIST
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
