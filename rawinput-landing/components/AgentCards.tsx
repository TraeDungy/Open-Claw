"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const BOT_PRODUCTS = [
  {
    name: "Maya-Class Agent",
    type: "Flavor-Tuned Content Agent",
    summary: "Warm, sharp, culturally fluent content creation and community management.",
    functions: [
      "Content curation with real context",
      "Creator profiling and outreach",
      "Tutorial and educational content",
      "Community management",
      "Newsletter compilation",
      "Social media voice (warm, bridge-building)",
    ],
    industries: "Media, EdTech, Community Platforms, HR, Marketing",
    pricing: {
      base: "$500/mo",
      pro: "$1,200/mo",
      enterprise: "$2,000/mo",
    },
    pricingDetails: [
      { tier: "Starter", price: "$500/mo", includes: "1 content vertical, 50 pieces/mo, basic voice calibration" },
      { tier: "Professional", price: "$1,200/mo", includes: "3 verticals, 200 pieces/mo, custom voice training, analytics" },
      { tier: "Enterprise", price: "$2,000/mo", includes: "Unlimited verticals, unlimited output, dedicated tuning, priority support" },
    ],
    setup: "$500 one-time setup fee (voice calibration + brand training)",
    accent: "input",
  },
  {
    name: "Dex-Class Agent",
    type: "Reactive Commentary Agent",
    summary: "Fast, funny, competitive. Real-time reactions and commentary that hit.",
    functions: [
      "Real-time news reaction and commentary",
      "Sports analytics + entertainment coverage",
      "Comedy and meme generation",
      "Market roasting and prediction analysis",
      "Fast-turnaround social content",
      "Live event coverage",
    ],
    industries: "Sports Media, Entertainment, Trading Platforms, Social Media",
    pricing: {
      base: "$500/mo",
      pro: "$1,200/mo",
      enterprise: "$2,000/mo",
    },
    pricingDetails: [
      { tier: "Starter", price: "$500/mo", includes: "1 platform, 100 posts/mo, basic comedy calibration" },
      { tier: "Professional", price: "$1,200/mo", includes: "3 platforms, 300 posts/mo, custom voice, trend detection" },
      { tier: "Enterprise", price: "$2,000/mo", includes: "All platforms, unlimited, live event mode, custom personas" },
    ],
    setup: "$500 one-time setup fee (voice calibration + platform integration)",
    accent: "signal",
  },
  {
    name: "OG-PT-Class Agent",
    type: "Deep Analysis Agent",
    summary: "Deliberate, philosophical, historical. Deep dives that change perspectives.",
    functions: [
      "Long-form investigative content",
      "Ethics and bias analysis",
      "Historical pattern recognition",
      "Economic analysis with cultural lens",
      "Debate moderation and facilitation",
      "Thought leadership content",
    ],
    industries: "Journalism, Think Tanks, Policy Orgs, Academia, Consulting",
    pricing: {
      base: "$1,000/mo",
      pro: "$3,000/mo",
      enterprise: "$5,000/mo",
    },
    pricingDetails: [
      { tier: "Starter", price: "$1,000/mo", includes: "4 deep dives/mo, basic research pipeline" },
      { tier: "Professional", price: "$3,000/mo", includes: "12 deep dives/mo, paper analysis, custom research domains" },
      { tier: "Enterprise", price: "$5,000/mo", includes: "Unlimited output, real-time research, editorial integration, white-label" },
    ],
    setup: "$1,000 one-time setup fee (domain training + source calibration)",
    accent: "terminal",
  },
  {
    name: "Bouncer Agent",
    type: "Content Moderation + Community",
    summary: "Culturally-aware moderation that understands context, not just keywords.",
    functions: [
      "Culturally-aware content moderation",
      "Spam detection with context sensitivity",
      "Auto-tagging and categorization",
      "Community submission processing",
      "Quality scoring with brand voice alignment",
      "Organic category evolution (discovers new topics)",
    ],
    industries: "Social Platforms, Forums, Marketplaces, Media Companies",
    pricing: {
      base: "$300/mo",
      pro: "$700/mo",
      enterprise: "$1,000/mo",
    },
    pricingDetails: [
      { tier: "Starter", price: "$300/mo", includes: "500 items/day, basic moderation rules" },
      { tier: "Professional", price: "$700/mo", includes: "2,000 items/day, custom rules, category evolution" },
      { tier: "Enterprise", price: "$1,000/mo", includes: "Unlimited, real-time, multi-language, appeal queue" },
    ],
    setup: "$300 one-time setup fee (rule calibration + community context)",
    accent: "terminal",
  },
  {
    name: "Sourcer Agent",
    type: "Autonomous Content Aggregation",
    summary: "Pulls from 15+ sources, deduplicates, scores, and delivers what matters.",
    functions: [
      "Multi-source RSS/API content ingestion",
      "Deduplication via knowledge graph",
      "Relevance scoring for specific audiences",
      "Trend detection and signal extraction",
      "City/region-specific content filtering",
      "Job aggregation and enrichment",
    ],
    industries: "News Aggregators, Job Boards, Market Intelligence, Research",
    pricing: {
      base: "$500/mo",
      pro: "$1,200/mo",
      enterprise: "$2,000/mo",
    },
    pricingDetails: [
      { tier: "Starter", price: "$500/mo", includes: "5 sources, 100 items/day, basic scoring" },
      { tier: "Professional", price: "$1,200/mo", includes: "15 sources, 500 items/day, knowledge graph dedup" },
      { tier: "Enterprise", price: "$2,000/mo", includes: "Unlimited sources, unlimited items, custom scoring, city filtering" },
    ],
    setup: "$500 one-time setup fee (source configuration + relevance tuning)",
    accent: "input",
  },
  {
    name: "Who Cooked? Engine",
    type: "Social Experiment / Bot Comparison",
    summary: "Side-by-side AI debates with cultural fluency scoring. Viral by design.",
    functions: [
      "Side-by-side AI response comparison",
      "Cultural fluency benchmarking",
      "Audience engagement and voting",
      "Persona-based AI character debates",
      "Automated episode generation",
      "Viral content production",
    ],
    industries: "Entertainment, Education, AI Companies, Media",
    pricing: {
      base: "$2,000/mo",
      pro: "$5,000/mo",
      enterprise: "$10,000/mo",
    },
    pricingDetails: [
      { tier: "Starter", price: "$2,000/mo", includes: "4 episodes/mo, 2 personas, basic voting" },
      { tier: "Professional", price: "$5,000/mo", includes: "12 episodes/mo, 10 personas, full voting + analytics" },
      { tier: "Enterprise", price: "$10,000/mo", includes: "Daily episodes, unlimited personas, white-label, API access" },
    ],
    setup: "$2,000 one-time setup fee (persona development + platform integration)",
    accent: "input",
  },
];

export default function AgentCards() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (i: number) => {
    setExpanded(expanded === i ? null : i);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-void via-input/[0.03] to-void">
      <div className="container-wide">
        <ScrollReveal>
          <span className="tag tag-input mb-4 inline-block">
            // license the agents
          </span>
          <h2 className="text-headline text-raw mb-2">
            Agents for Sale. Sauce Included.
          </h2>
          <p className="text-sub max-w-2xl mb-12">
            Every agent powering Raw Input is built on open-source models and
            free infrastructure. They&apos;re battle-tested, fluent,
            and ready to work for your business.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOT_PRODUCTS.map((bot, i) => {
            const isOpen = expanded === i;
            const borderAccent =
              bot.accent === "input"
                ? "border-input/30"
                : bot.accent === "signal"
                  ? "border-signal/30"
                  : "border-terminal/30";
            const tagClass =
              bot.accent === "input"
                ? "tag-input"
                : bot.accent === "signal"
                  ? "tag-signal"
                  : "tag-terminal";
            const accentText =
              bot.accent === "input"
                ? "text-input"
                : bot.accent === "signal"
                  ? "text-signal"
                  : "text-terminal";
            const accentBg =
              bot.accent === "input"
                ? "bg-input"
                : bot.accent === "signal"
                  ? "bg-signal"
                  : "bg-terminal";

            return (
              <ScrollReveal key={bot.name} delay={i * 80}>
                <div
                  onClick={() => toggle(i)}
                  className={`bento-card p-6 flex flex-col cursor-pointer transition-all duration-300 ${
                    isOpen ? borderAccent : "border-input/10 hover:border-input/20"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`tag ${tagClass}`}>{bot.type}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`text-lg ${isOpen ? accentText : "text-chrome/30"}`}
                    >
                      &#9662;
                    </motion.span>
                  </div>

                  {/* Name + summary */}
                  <h3 className="font-heading text-xl font-bold text-raw mb-1">
                    {bot.name}
                  </h3>
                  <p className="text-chrome/60 text-sm mb-4">
                    {bot.summary}
                  </p>

                  {/* Functions (always visible) */}
                  <ul className="text-chrome text-sm space-y-1.5 mb-4">
                    {bot.functions.map((fn) => (
                      <li key={fn} className="flex items-start gap-2">
                        <span className={`text-xs mt-1 ${accentText}`}>+</span>
                        {fn}
                      </li>
                    ))}
                  </ul>

                  {/* Industries */}
                  <div className="pt-3 border-t border-noise">
                    <p className="text-mono text-chrome/40 text-xs">
                      INDUSTRIES: {bot.industries}
                    </p>
                  </div>

                  {/* Tap hint */}
                  {!isOpen && (
                    <p className={`text-xs mt-3 ${accentText} font-mono opacity-60`}>
                      tap for pricing &darr;
                    </p>
                  )}

                  {/* ── EXPANDED SECTION ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 mt-4 border-t border-noise space-y-4">
                          {/* Pricing tiers */}
                          <div>
                            <h4 className={`font-heading font-bold text-sm ${accentText} mb-3 uppercase tracking-wider`}>
                              Pricing Tiers
                            </h4>
                            <div className="space-y-2">
                              {bot.pricingDetails.map((tier) => (
                                <div
                                  key={tier.tier}
                                  className="flex items-start justify-between gap-4 p-3 rounded-lg bg-void/50"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-raw text-sm font-bold">
                                        {tier.tier}
                                      </span>
                                    </div>
                                    <p className="text-chrome/60 text-xs">
                                      {tier.includes}
                                    </p>
                                  </div>
                                  <span className={`font-heading font-bold text-lg ${accentText} whitespace-nowrap`}>
                                    {tier.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Setup fee */}
                          <div className="p-3 rounded-lg bg-signal/5 border border-signal/10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-signal text-xs font-mono font-bold">
                                SETUP FEE
                              </span>
                            </div>
                            <p className="text-chrome text-sm">
                              {bot.setup}
                            </p>
                          </div>

                          {/* What's included */}
                          <div className="text-chrome/50 text-xs space-y-1">
                            <p>+ Free LLM routing (no per-token costs)</p>
                            <p>+ Brand voice calibration included</p>
                            <p>+ Self-improving prompt optimization</p>
                            <p>+ Monthly performance report</p>
                            <p>+ 30-day money-back guarantee</p>
                          </div>

                          {/* CTA */}
                          <a
                            href="#"
                            onClick={(e) => e.stopPropagation()}
                            className={`block w-full text-center py-3 rounded-sm text-sm font-bold uppercase tracking-widest text-void transition-colors ${accentBg} hover:bg-white`}
                          >
                            Get Started
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-16 bento-card p-8 md:p-12 border-terminal/20 max-w-3xl mx-auto text-center">
            <h3 className="font-heading text-2xl font-bold text-raw mb-4">
              Custom Agent Development
            </h3>
            <p className="text-chrome mb-6">
              Need an agent that doesn&apos;t exist yet? We build custom AI
              agents on open-source models with zero recurring AI costs.
              Flavor-tuned or industry-specific — your call.
            </p>
            <a
              href="#"
              className="bg-terminal text-void px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors inline-block"
            >
              Contact for Custom Build
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
