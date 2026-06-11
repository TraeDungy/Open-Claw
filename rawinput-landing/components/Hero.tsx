"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-input/20 to-transparent"
          style={{ animation: "scan-line 8s linear infinite" }}
        />
      </div>

      {/* Oversized background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-heading font-bold text-white/[0.02] uppercase tracking-tighter whitespace-nowrap">
          RAW INPUT
        </span>
      </div>

      <div className="container-wide relative z-10">
        <div className="max-w-5xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="tag tag-input mb-6 inline-block">
              // now streaming
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-display text-raw mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="block">Unfiltered.</span>
            <span className="block text-input text-glow-input">
              Uncompressed.
            </span>
            <span className="block">Unsupervised.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="text-sub max-w-xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            The home of Black AI and tech culture. Creators, code, commentary,
            and community. No filter. No permission. Just raw input.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <a
              href="#signup"
              className="bg-input text-void px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              Get the Newsletter
            </a>
            <a
              href="#index"
              className="border border-noise text-raw px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:border-raw transition-colors"
            >
              Browse the Index
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-noise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {[
              { value: "100+", label: "Black AI Creators" },
              { value: "14", label: "Content Verticals" },
              { value: "Daily", label: "Fresh Content" },
              { value: "$0", label: "To Join" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl font-bold text-input">
                  {stat.value}
                </div>
                <div className="text-mono text-chrome text-xs mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-mono text-chrome text-xs">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-chrome to-transparent" />
      </motion.div>
    </section>
  );
}
