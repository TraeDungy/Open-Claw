"use client";
import ScrollReveal from "./ScrollReveal";

const pillars = [
  { icon: "◉", title: "AWARENESS", copy: "Notice what others miss." },
  { icon: "◎", title: "CONTROL", copy: "Hold attention. Direct it." },
  { icon: "≋", title: "EXPERIMENTATION", copy: "Test. Observe. Record." },
  { icon: "◌", title: "COMMUNITY", copy: "Train together. Grow together." },
];

export default function Pillars() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Pillars */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
          {pillars.map((p, i) => (
            <ScrollReveal key={p.title} delay={i + 1}>
              <div className="group rounded-xl border border-bone/10 bg-black/40 p-5 backdrop-blur-sm transition hover:border-signal/30 hover:bg-black/60">
                <p className="text-2xl text-signal transition group-hover:text-glow-signal">{p.icon}</p>
                <p className="mt-3 text-[10px] font-semibold tracking-[0.25em] text-bone/50">{p.title}</p>
                <p className="mt-2 text-sm text-bone/70">{p.copy}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Quote */}
        <ScrollReveal className="md:col-span-2 flex items-center">
          <div className="rounded-xl border border-bone/10 bg-black/30 p-8 backdrop-blur-sm">
            <p className="text-bone/30 text-4xl leading-none">&ldquo;</p>
            <p className="mt-2 text-2xl font-bold leading-snug md:text-3xl">
              THE MIND IS NOT A MYSTERY.<br />
              <span className="text-ember">IT IS AN UNDERUSED TOOL.</span>
            </p>
            <p className="mt-4 text-xs tracking-[0.2em] text-bone/40">&mdash; THE CONTROL SERIES&trade;</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
