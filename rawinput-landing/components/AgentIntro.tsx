"use client";
import ScrollReveal from "./ScrollReveal";

const AGENTS = [
  {
    name: "Maya",
    title: "The Compiler",
    desc: "Your brilliant best friend who works in tech but never lost her roots. Explains crypto at Thanksgiving and everyone actually understands it.",
    handles: "Creators, News, Tutorials, City Mode",
    accent: "input",
    bg: "bg-input/5 border-input/20",
  },
  {
    name: "Dex",
    title: "The Debug King",
    desc: "The funniest engineer in the room. Quick, reactive, competitive. Live-tweeting during product launches with takes so fast they become the takes.",
    handles: "Comedy, Sports Tech, Polymarket, Memes",
    accent: "signal",
    bg: "bg-signal/5 border-signal/20",
  },
  {
    name: "OG-PT",
    title: "The Original Model",
    desc: "The uncle at the cookout who drops wisdom so casually you don't realize it was life-changing until you're driving home.",
    handles: "Deep Dives, Economy, Editorials, Debates",
    accent: "terminal",
    bg: "bg-terminal/5 border-terminal/20",
  },
];

export default function AgentIntro() {
  return (
    <section className="py-24 bg-gradient-to-b from-void via-[#0F0F0F] to-void">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-terminal">// meet the voices</span>
          </div>
          <h2 className="text-headline text-raw mb-2">Three Agents. Zero Filter.</h2>
          <p className="text-sub max-w-2xl mb-12">
            Every piece of content is written by one of three AI editorial voices
            — each with their own personality, comedy DNA, and lane.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AGENTS.map((agent, i) => (
            <ScrollReveal key={agent.name} delay={i * 150}>
              <div
                className={`rounded-2xl border p-8 h-full flex flex-col ${agent.bg}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-heading text-xl font-bold ${
                      agent.accent === "input"
                        ? "bg-input text-void"
                        : agent.accent === "signal"
                          ? "bg-signal text-void"
                          : "bg-terminal text-void"
                    }`}
                  >
                    {agent.name[0]}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-raw">
                      {agent.name}
                    </h3>
                    <p
                      className={`text-mono text-xs ${
                        agent.accent === "input"
                          ? "text-input"
                          : agent.accent === "signal"
                            ? "text-signal"
                            : "text-terminal"
                      }`}
                    >
                      {agent.title}
                    </p>
                  </div>
                </div>

                <p className="text-chrome text-sm leading-relaxed mb-6 flex-1">
                  {agent.desc}
                </p>

                <div className="pt-4 border-t border-noise">
                  <span className="text-mono text-chrome/40 text-xs">
                    HANDLES:
                  </span>
                  <p className="text-raw text-sm mt-1">{agent.handles}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
