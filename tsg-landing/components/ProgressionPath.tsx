"use client";
import ScrollReveal from "./ScrollReveal";

const stages = [
  { label: "OBSERVER", desc: "Just starting.", icon: "○", active: false },
  { label: "PRACTITIONER", desc: "Building consistency.", icon: "◇", active: false },
  { label: "SIGNAL HOLDER", desc: "Above 60% accuracy.", icon: "◈", active: false },
  { label: "LEVEL 3 ACCESS", desc: "Join live advanced sessions.", icon: "★", active: true },
];

export default function ProgressionPath() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h2 className="text-4xl font-bold uppercase md:text-5xl">Your Progression</h2>
          <p className="mt-3 text-bone/60">Every session. Every rep. Builds real control.</p>
        </ScrollReveal>

        {/* Timeline */}
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {stages.map((stage, i) => (
            <ScrollReveal key={stage.label} delay={i + 1}>
              <div className="relative group">
                {/* Connector line */}
                {i < stages.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-[-24px] h-px bg-gradient-to-r from-signal/30 to-signal/10" />
                )}

                <div className={`rounded-xl border p-5 text-center transition ${
                  stage.active
                    ? "border-ember/50 bg-ember/5"
                    : "border-bone/10 bg-black/30 hover:border-signal/30"
                }`}>
                  {/* Icon circle */}
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border text-xl ${
                    stage.active
                      ? "border-ember text-ember animate-glow-breathe"
                      : "border-signal/30 text-signal/60"
                  }`}>
                    {stage.icon}
                  </div>

                  <p className={`mt-4 text-[10px] font-semibold tracking-[0.2em] ${
                    stage.active ? "text-ember" : "text-bone/50"
                  }`}>
                    {stage.label}
                  </p>
                  <p className="mt-2 text-xs text-bone/60">{stage.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats row */}
        <ScrollReveal className="mt-12">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["SESSIONS", "12"],
              ["BEST STREAK", "7"],
              ["AVG ACCURACY", "65%"],
              ["RANK", "PRACTITIONER"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-bone/10 bg-black/20 p-4 text-center">
                <p className="text-2xl font-bold text-signal">{value}</p>
                <p className="mt-1 text-[10px] tracking-[0.15em] text-bone/40">{label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
