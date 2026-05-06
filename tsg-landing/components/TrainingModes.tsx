"use client";
import ScrollReveal from "./ScrollReveal";

const modes = [
  { icon: "☆", title: "CLASSIC", desc: "Zener-style 5 symbol test" },
  { icon: "◎", title: "DELAYED", desc: "Result revealed after the hold" },
  { icon: "⚡", title: "STEADINESS", desc: "Build focus with timed rounds" },
];

const principles = [
  "Attention is direction",
  "Stillness is power",
  "Perception is trainable",
  "Control is freedom",
];

export default function TrainingModes() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
        {/* Modes */}
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-[0.2em] text-bone/40">3 TRAINING MODES</p>
          <div className="mt-4 space-y-3">
            {modes.map((mode) => (
              <div key={mode.title} className="flex items-center gap-3 rounded-lg border border-bone/10 bg-black/30 p-3 transition hover:border-signal/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-signal/20 text-lg text-signal">{mode.icon}</div>
                <div>
                  <p className="text-xs font-semibold tracking-wider">{mode.title}</p>
                  <p className="text-[11px] text-bone/50">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Principles */}
        <ScrollReveal delay={1}>
          <p className="text-xs font-semibold tracking-[0.2em] text-bone/40">BUILT ON PRINCIPLES</p>
          <ul className="mt-4 space-y-3">
            {principles.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-bone/70">
                <span className="text-ember">→</span> {p}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        {/* Community */}
        <ScrollReveal delay={2}>
          <p className="text-xs font-semibold tracking-[0.2em] text-bone/40">COMMUNITY ACCESS</p>
          <p className="mt-4 text-sm text-bone/60 leading-relaxed">
            Be the first to know about sessions, tools, and updates.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-bone/15 bg-black/50 px-3 py-2.5 text-sm placeholder:text-bone/30 focus:border-signal/40 focus:outline-none"
            />
            <button className="rounded-lg bg-ember px-4 py-2.5 text-xs font-bold text-black transition hover:shadow-[0_0_20px_rgba(255,144,46,0.3)]">
              JOIN
            </button>
          </div>
          <p className="mt-3 text-[10px] text-bone/30">Small group. Limited sessions. No spam.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
