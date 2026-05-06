"use client";
import ScrollReveal from "./ScrollReveal";
import ZenerGame from "./ZenerGame";

const steps = [
  { num: "1", title: "FOCUS", desc: "Center yourself. Stay present.", icon: "◉" },
  { num: "2", title: "SELECT", desc: "Choose the shape you feel.", icon: "◎" },
  { num: "3", title: "REVEAL", desc: "See the result. Track your accuracy.", icon: "◇" },
  { num: "4", title: "IMPROVE", desc: "Patterns over perfection.", icon: "△" },
];

export default function ToolPreview() {
  return (
    <section id="tool" className="relative overflow-hidden px-6 py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-signal/3 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-4xl font-bold uppercase md:text-5xl">Signal Detection Tool</h2>
          <p className="mt-3 max-w-xl text-bone/60">
            Train your awareness. Sharpen your perception.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr]">
          {/* Left — Steps */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i + 1}>
                <div className="flex items-start gap-4 group">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-signal/30 text-signal/70 text-lg transition group-hover:border-signal group-hover:text-signal">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-ember">{step.num} &middot; {step.title}</p>
                    <p className="mt-1 text-sm text-bone/70">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Right — Interactive Zener Game */}
          <ScrollReveal variant="scale">
            <ZenerGame />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
