"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CREATORS = [
  {
    name: "Niani Baker",
    handle: "@nianibaker",
    specialty: "AI Art + Afrofuturism",
    headline: "Turning Midjourney Into a Time Machine for Black Futures",
    desc: "Her series 'Ancestors in the Algorithm' reimagines historical Black figures through AI-generated Afrofuturist portraits. 2M+ views across platforms.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    accent: "input",
  },
  {
    name: "Marcus Chen-Williams",
    handle: "@marcuscw_dev",
    specialty: "Open Source + ML Engineering",
    headline: "Built the Most-Forked AI Doc Tool on GitHub and It Started With His Mama's Church Bulletin",
    desc: "4,000 developers use his open-source document automation daily. Started as a side project to help his mom format the weekly church program.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    accent: "terminal",
  },
  {
    name: "Aja Sterling",
    handle: "@aja_builds",
    specialty: "AI Music + Sound Design",
    headline: "She's Using AI to Recreate Lost Recordings of Black Musicians From the 1920s",
    desc: "Audio preservationist using spectral AI models to restore and reimagine degraded recordings. Grammy nomination pending for 'Echoes Before Tape'.",
    image: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=800&q=80",
    accent: "signal",
  },
  {
    name: "Kwame Asante",
    handle: "@kwamecodes",
    specialty: "Robotics + Computer Vision",
    headline: "His Robot Can Sort Recycling Better Than Any Human and It Runs on a Raspberry Pi",
    desc: "Detroit-based roboticist building affordable computer vision systems for community recycling programs. $0 in VC funding. 12 cities deployed.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
    accent: "input",
  },
  {
    name: "Dominique Frost",
    handle: "@domfrost_ai",
    specialty: "NLP + Dialect Preservation",
    headline: "Building AI Models That Actually Understand AAVE Instead of Flagging It as 'Incorrect'",
    desc: "Linguist and ML researcher creating NLP models trained on African American Vernacular English. Because 'finna' is valid syntax.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80",
    accent: "terminal",
  },
];

export default function CreatorShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % CREATORS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const creator = CREATORS[active];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient that shifts with each creator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="absolute inset-0 bg-gradient-to-br from-input/20 via-void to-terminal/10 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      <div className="container-wide relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <span className="tag tag-input">// who trained you?</span>
          <span className="text-mono text-chrome/40 text-xs">
            featured creators
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
          {/* Left — Creator art placeholder / visual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/20 to-transparent" />
                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-void/70 backdrop-blur-sm p-4 flex items-center justify-between">
                  <div>
                    <span className="text-raw font-heading font-bold text-sm">
                      {creator.name}
                    </span>
                    <span className="text-chrome/60 text-xs ml-2">
                      {creator.handle}
                    </span>
                  </div>
                  <span
                    className={`tag ${
                      creator.accent === "input"
                        ? "tag-input"
                        : creator.accent === "terminal"
                          ? "tag-terminal"
                          : "tag-signal"
                    }`}
                  >
                    {creator.specialty.split("+")[0].trim()}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right — Headline + details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-mono text-chrome/60 text-xs mb-3 uppercase tracking-widest">
                {creator.specialty}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-raw leading-[1.05] mb-6">
                {creator.headline}
              </h2>
              <p className="text-chrome text-base leading-relaxed mb-8">
                {creator.desc}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-input text-sm font-bold uppercase tracking-wider hover:text-raw transition-colors"
              >
                Read Full Profile
                <span className="text-lg">&rarr;</span>
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center gap-3 mt-10">
          {CREATORS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${
                active === i
                  ? "w-8 h-2 bg-input"
                  : "w-2 h-2 bg-noise hover:bg-chrome"
              }`}
              aria-label={`Show creator ${i + 1}`}
            />
          ))}
          <span className="text-mono text-chrome/30 text-xs ml-4">
            {active + 1} / {CREATORS.length}
          </span>
        </div>
      </div>
    </section>
  );
}
