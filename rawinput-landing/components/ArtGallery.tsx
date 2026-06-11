"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const GALLERY_ITEMS = [
  {
    title: "Ancestors in the Algorithm",
    artist: "Niani Baker",
    medium: "Midjourney + Photoshop",
    category: "Afrofuturism",
    desc: "Reimagining historical Black figures as cybernetic guardians. Each piece trained on archival photographs and West African mask geometry.",
    image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&q=80",
  },
  {
    title: "Melanin Machines",
    artist: "Tariq Osei",
    medium: "Stable Diffusion + ComfyUI",
    category: "Robotic Portraiture",
    desc: "Black bodies reimagined as biomechanical sculptures. Chrome skin, gold circuitry, obsidian cores.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
  },
  {
    title: "The Last Cookout",
    artist: "Dominique Frost",
    medium: "DALL-E 3 + After Effects",
    category: "AI Surrealism",
    desc: "What happens when AI tries to generate a family reunion? Uncanny valley meets the backyard.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  },
  {
    title: "Lagos 2099",
    artist: "Amara Okonkwo",
    medium: "Flux + Runway ML",
    category: "Afrofuturism",
    desc: "Nigeria's megacity reimagined through AI — floating markets, solar towers, digital masquerades.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  },
  {
    title: "Braids as Data",
    artist: "Keisha Monroe",
    medium: "Processing + Midjourney",
    category: "Generative / Cultural",
    desc: "Cornrow patterns as data visualization. Each braid encodes information — population data, migration routes.",
    image: "https://images.unsplash.com/photo-1633907284646-7abf4a195875?w=600&q=80",
  },
  {
    title: "Hoodie Algorithms",
    artist: "Marcus Chen-Williams",
    medium: "ComfyUI + ControlNet",
    category: "Street x Tech",
    desc: "AI-generated streetwear where the patterns are literal code. Python scripts woven into fabric.",
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&q=80",
  },
];

export default function ArtGallery() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-void via-[#080808] to-void">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-signal">// the gallery</span>
          </div>
          <h2 className="text-headline text-raw mb-2">
            Black AI Art. No Filter.
          </h2>
          <p className="text-sub max-w-2xl mb-12">
            Curated visual work from the sharpest AI artists in the culture.
            Afrofuturism. Surrealism. Generative. Street. All of it.
          </p>
        </ScrollReveal>

        {/* Uniform grid — all cards same aspect ratio */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY_ITEMS.map((item, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div
                className="group cursor-pointer rounded-xl overflow-hidden relative"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Hover overlay */}
                  <AnimatePresence>
                    {hovered === i && (
                      <motion.div
                        className="absolute inset-0 bg-void/85 backdrop-blur-sm p-5 flex flex-col justify-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="tag tag-input mb-2 self-start">
                          {item.category}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-raw mb-1">
                          {item.title}
                        </h3>
                        <p className="text-chrome text-xs leading-relaxed mb-2">
                          {item.desc}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-raw text-xs font-medium">
                            {item.artist}
                          </span>
                          <span className="text-chrome/30">|</span>
                          <span className="text-mono text-chrome/60 text-[10px]">
                            {item.medium}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Always-visible bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-void/95 via-void/60 to-transparent p-4 group-hover:opacity-0 transition-opacity">
                    <h3 className="font-heading text-sm md:text-base font-bold text-raw">
                      {item.title}
                    </h3>
                    <p className="text-chrome/80 text-xs">{item.artist}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center mt-12">
            <a
              href="#"
              className="border border-signal text-signal px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-signal hover:text-void transition-all inline-block"
            >
              View Full Gallery
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
