"use client";
import ScrollReveal from "@/components/ScrollReveal";
import AgentCards from "@/components/AgentCards";
import { motion } from "framer-motion";

const TIMELINE = [
  {
    phase: "The Spark",
    desc: "One person. One VPS. A vision to build autonomous AI infrastructure that serves the community — not the other way around.",
  },
  {
    phase: "The Infrastructure",
    desc: "Built an AI agent network on a $15/month server. 129 autonomous agents. Free LLM routing. Self-healing systems. Zero VC.",
  },
  {
    phase: "The Voices",
    desc: "Created Maya, Dex, and OG-PT — three AI editorial agents with distinct personalities, comedy DNA, and real flavor. Not generic. Not corporate. Ours.",
  },
  {
    phase: "The Platform",
    desc: "Designed Raw Input: 14 content verticals, 70+ sub-categories, 9 autonomous content loops, a social experiment engine, and a community platform — all running on free infrastructure.",
  },
  {
    phase: "The Movement",
    desc: "City chapters. Events. A creator network. An art gallery. A job board. A comedy column. A newsletter. A prediction market commentary show. All autonomous. All community-first.",
  },
];

// Bot products moved to AgentCards component

export default function AboutPage() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-24">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="tag tag-input mb-6 inline-block">
              // about raw input
            </span>
            <h1 className="text-display text-raw mb-6 max-w-4xl">
              One Person. One Server.{" "}
              <span className="text-input">Zero Permission.</span>
            </h1>
            <p className="text-sub max-w-2xl">
              Raw Input is an autonomous cultural archival platform for Black AI
              and tech creators — built by a simple human with a vision and a
              $15/month server.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Bio */}
      <section className="py-16 bg-gradient-to-b from-void via-static to-void">
        <div className="container-wide">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Photo placeholder */}
              <div className="relative">
                <div className="aspect-square bg-noise rounded-2xl flex items-center justify-center">
                  <span className="text-[80px] font-heading font-bold text-white/[0.05]">
                    TX
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-void/80 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-raw font-heading font-bold">
                    Trial X Fire
                  </p>
                  <p className="text-mono text-input text-xs">
                    The Simple Human
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <h2 className="font-heading text-3xl font-bold text-raw mb-6">
                  The Human Behind the Algorithm
                </h2>
                <div className="space-y-4 text-chrome leading-relaxed">
                  <p>
                    I&apos;m not a venture-backed founder. I&apos;m not from
                    Stanford. I didn&apos;t raise a seed round. I&apos;m a
                    creative technologist who got tired of watching Black creativity
                    get scraped, processed, and monetized by platforms that
                    don&apos;t look like us, don&apos;t sound like us, and
                    definitely don&apos;t laugh at the same jokes.
                  </p>
                  <p>
                    So I built my own infrastructure. A single Hetzner VPS
                    running 129 AI agents, free LLM routing through NVIDIA and
                    open-source models, a self-healing agent management system,
                    and a content pipeline that sources, curates, tags, rewrites,
                    and publishes — autonomously — for $0/month in AI costs.
                  </p>
                  <p>
                    Raw Input is the front door to that infrastructure. A
                    platform where Black AI creators get featured, not scraped.
                    Where the commentary sounds like a cookout, not a corporate
                    memo. Where the jokes hit because they come from the cookout, not
                    a committee.
                  </p>
                  <p className="text-raw font-medium">
                    The goal is simple: build an autonomous living archive that
                    the community owns, the community shapes, and the community
                    benefits from. Not a startup. A movement.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How We Built It Timeline */}
      <section className="py-24">
        <div className="container-wide">
          <ScrollReveal>
            <span className="tag tag-terminal mb-4 inline-block">
              // git log --oneline
            </span>
            <h2 className="text-headline text-raw mb-12">How We Built This</h2>
          </ScrollReveal>

          <div className="space-y-0">
            {TIMELINE.map((step, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="flex gap-6 pb-12 relative">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-input shrink-0 mt-1.5" />
                    {i < TIMELINE.length - 1 && (
                      <div className="w-px flex-1 bg-noise" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-raw mb-2">
                      {step.phase}
                    </h3>
                    <p className="text-chrome text-sm leading-relaxed max-w-lg">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bot Licensing / Products — interactive expandable cards */}
      <AgentCards />

      {/* Tech Stack */}
      <section className="py-24">
        <div className="container-wide">
          <ScrollReveal>
            <span className="tag tag-chrome mb-4 inline-block">
              // cat infrastructure.yml
            </span>
            <h2 className="text-headline text-raw mb-12">
              The Stack. All Free.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "LLM Routing", value: "LiteLLM", cost: "$0" },
                { label: "AI Models", value: "NVIDIA NIM", cost: "$0" },
                { label: "Fallback Models", value: "OpenRouter :free", cost: "$0" },
                { label: "Agent System", value: "Paperclip", cost: "$0" },
                { label: "Knowledge Graph", value: "LightRAG", cost: "$0" },
                { label: "Storage", value: "Cloudflare R2", cost: "$0" },
                { label: "Database", value: "Supabase", cost: "$0" },
                { label: "Email", value: "Resend", cost: "$0" },
                { label: "Social", value: "Postiz", cost: "$0" },
                { label: "VPS", value: "Hetzner", cost: "$15/mo" },
                { label: "Frontend", value: "Next.js", cost: "$0" },
                { label: "Processes", value: "PM2", cost: "$0" },
              ].map((item) => (
                <div key={item.label} className="bento-card p-4 text-center">
                  <p className="text-mono text-chrome/40 text-xs mb-1">
                    {item.label}
                  </p>
                  <p className="font-heading font-bold text-raw">
                    {item.value}
                  </p>
                  <p className="text-terminal text-xs font-mono mt-1">
                    {item.cost}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
