"use client";
import { motion } from "framer-motion";
import EventCard from "./EventCard";
import FieldGuideCard from "./FieldGuideCard";
import CymaticField from "./CymaticField";

export default function Hero() {
  return (
    <section className="signal-bg relative overflow-hidden">
      {/* ── Featured Hero Image — flush to top, square image centered ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "min(75vh, 650px)" }}>
        <img
          src="/assets/hero-woman.png"
          alt="Telekinesis Support Group — The Control Series"
          className="h-full w-full object-cover"
          style={{ objectPosition: "center center" }}
        />
        {/* Cymatic particle overlay — interactive, originates from 3rd eye */}
        <CymaticField />
        {/* Gradient overlay — bottom fade only */}
        <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent pointer-events-none" />

        {/* Title overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:px-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-xs tracking-[0.4em] text-ember font-medium">THE CONTROL SERIES&trade;</p>
            <h1 className="mt-3 text-5xl font-bold uppercase leading-[1.05] md:text-7xl lg:text-8xl">
              <span className="text-bone text-glow-signal">TELEKINESIS</span>
              <br />
              <span className="text-ember text-glow-ember">SUPPORT GROUP</span>
            </h1>
            {/* Spectrum line */}
            <div className="mt-4 h-0.5 w-64 bg-gradient-to-r from-pulse via-signal via-ember to-hazard opacity-60" />
          </div>
        </div>
      </div>

      {/* ── Content below image ── */}
      <div className="relative px-6 py-16 md:px-12">
        {/* Atmospheric glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-ember/5 blur-[100px]" />

        <div className="relative mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr] items-start">
          {/* Left — copy */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <p className="text-lg text-bone/80 leading-relaxed">
              You don&apos;t have to believe anything.
            </p>
            <p className="mt-2 text-sm tracking-wide text-bone/50 uppercase">
              Experiment. Observe. Discover.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#sessions"
                className="group relative overflow-hidden rounded-full bg-ember px-7 py-3.5 font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,144,46,0.4)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  ENTER THE SESSION
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </a>
              <a href="#join" className="rounded-full border border-bone/30 px-7 py-3.5 transition hover:border-bone/60 hover:bg-bone/5">
                JOIN EVENT LIST
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-bone/40">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>No claims. No promises. Just show up and pay attention.</span>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="mt-12 hidden md:flex items-center gap-2 text-xs text-bone/30"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="tracking-widest">SCROLL</span>
              <div className="h-8 w-px bg-gradient-to-b from-bone/30 to-transparent" />
            </motion.div>
          </div>

          {/* Right — session + field guide */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            <EventCard title="Cycle 01: Awareness &gt; Control" date="May 28, 2026 &middot; 7:00 PM" location="Los Angeles, CA" />
            <FieldGuideCard />
          </div>
        </div>
      </div>
    </section>
  );
}
