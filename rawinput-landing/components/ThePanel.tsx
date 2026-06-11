"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const CHARACTERS = [
  {
    name: "MLK",
    title: "The Moral Compass",
    tier: "philosopher",
    images: ["/rawinput/assets/panel/mlk-1.png"],
    quote:
      "I have a dream that one day, algorithms will judge a man not by the color of his skin but by the content of his character. But today, I look at these facial recognition systems and I see Birmingham all over again — just with better cameras.",
    topic: "AI Bias in Policing",
  },
  {
    name: "Pimp C",
    title: "UGK Business Strategy",
    tier: "hustler",
    images: ["/rawinput/assets/panel/pimp-c-1.png"],
    quote:
      "I don't need AI to tell me how to get money. I BEEN getting money. But I'll use AI to get money FASTER. The game don't change — the tools change. But don't let the tool use YOU. That's how you go from pimp to simp real quick.",
    topic: "AI in Business",
  },
  {
    name: "Your Auntie",
    title: "The Family Skeptic",
    tier: "wildcard",
    images: ["/rawinput/assets/panel/auntie-1.png"],
    quote:
      "I don't trust that AI mess. Last time I asked Alexa to play Anita Baker it played some white girl named Anita something. And now you want me to let a computer drive my car? Baby, I don't even let your uncle drive my car and I MARRIED him.",
    topic: "Self-Driving Cars",
  },
  {
    name: "Malcolm X",
    title: "The Radical Truth",
    tier: "philosopher",
    images: ["/rawinput/assets/panel/malcolm-x-1.png"],
    quote:
      "You've been bamboozled. They told you AI is a tool for liberation. But who owns the tool? Who controls the data? Who profits? If you don't own the means of computation, you don't own the future. By any means necessary includes by any CODEBASE necessary.",
    topic: "AI Ownership",
  },
  {
    name: "Tupac",
    title: "The Passionate Visionary",
    tier: "hustler",
    images: ["/rawinput/assets/panel/tupac-1.png"],
    quote:
      "They got machines that can paint now. Machines that can write songs. But can they FEEL? Can they grow up hungry? The art isn't the output — the art is the PAIN. And you can't program pain. You can only survive it.",
    topic: "AI-Generated Art",
  },
  {
    name: "An Alien",
    title: "The Outside Observer",
    tier: "wildcard",
    images: ["/rawinput/assets/panel/alien-1.png"],
    quote:
      "We've been watching you develop AI for 70 of your Earth years. We have notes. First: why did you teach it to write poetry before you taught it to fix your climate? We've had AI for 400,000 years and the first thing WE did was solve hunger. You made it generate pictures of cats.",
    topic: "AI Priorities",
  },
];

const TIER_COLORS: Record<string, string> = {
  philosopher: "tag-chrome",
  hustler: "tag-signal",
  wildcard: "tag-input",
};

export default function ThePanel() {
  const [active, setActive] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const char = CHARACTERS[active];

  // Rotate images if character has multiple
  useEffect(() => {
    if (char.images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % char.images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [active, char.images.length]);

  // Reset image index on character switch
  useEffect(() => { setImgIndex(0); }, [active]);

  return (
    <section id="panel" className="py-24 bg-static/50">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-signal">// the panel</span>
          </div>
          <h2 className="text-headline text-raw mb-2">
            What Would They Say?
          </h2>
          <p className="text-sub max-w-2xl mb-12">
            AI personas of historical icons weigh in on modern tech.
            Thought experiments. Social commentary. Occasionally unhinged.
          </p>
        </ScrollReveal>

        {/* Character selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CHARACTERS.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all border ${
                active === i
                  ? "bg-raw text-void border-raw font-bold"
                  : "bg-transparent text-chrome border-noise hover:border-chrome"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Full-width layout — card left, figure right outside card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative flex flex-col md:flex-row items-stretch min-h-[500px]"
          >
            {/* Left: quote card */}
            <div className="flex-1 bento-card p-8 md:p-12 flex flex-col justify-center z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className={`tag ${TIER_COLORS[char.tier]}`}>
                  {char.tier}
                </span>
                <span className="text-mono text-chrome/60 text-xs">
                  on: {char.topic}
                </span>
              </div>

              <h3 className="font-heading text-3xl md:text-4xl font-bold text-raw mb-1">
                {char.name}
              </h3>
              <p className="text-mono text-chrome text-xs mb-6">
                {char.title}
              </p>

              <blockquote className="text-raw text-lg md:text-xl leading-relaxed border-l-2 border-input pl-6 max-w-xl">
                &ldquo;{char.quote}&rdquo;
              </blockquote>

              <p className="text-chrome/40 text-xs mt-8 font-mono">
                AI-generated interpretation for entertainment purposes. Does not
                represent actual views.
              </p>
            </div>

            {/* Right: figure — outside the card, full section height */}
            <div className="relative w-full md:w-[380px] lg:w-[460px] flex-shrink-0 min-h-[350px] md:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active}-${imgIndex}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={char.images[imgIndex % char.images.length]}
                    alt={char.name}
                    fill
                    className="object-contain object-right-bottom md:object-right"
                    sizes="(max-width: 768px) 100vw, 460px"
                    priority
                  />
                  {/* Fade into background on left edge */}
                  <div className="absolute inset-0 bg-gradient-to-r from-static/90 via-transparent to-transparent hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-static/80 via-transparent to-transparent md:hidden" />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
