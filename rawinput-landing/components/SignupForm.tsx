"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

type Status = "idle" | "loading" | "subscribed" | "choosing" | "done" | "error";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [tier, setTier] = useState<"free" | "all-access" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("choosing");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const selectTier = (selected: "free" | "all-access") => {
    setTier(selected);
    setStatus("done");
    // TODO: If "all-access", redirect to Stripe checkout
    // For now, just show confirmation
  };

  return (
    <section id="signup" className="py-24">
      <div className="container-wide">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Email entry ── */}
              {(status === "idle" || status === "loading" || status === "error") && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="tag tag-input mb-6 inline-block">
                    // join the community
                  </span>
                  <h2 className="text-headline text-raw mb-4">
                    Get the <span className="text-input">Raw Input</span>
                  </h2>
                  <p className="text-sub mb-10">
                    Weekly dispatch. Top stories, creator spotlights, one
                    guaranteed laugh, and a job you should probably apply to.
                    Free. No spam. Just raw input.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 bg-static border border-noise rounded-sm px-5 py-4 text-raw text-sm placeholder:text-chrome/40 focus:outline-none focus:border-input transition-colors font-mono"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="bg-input text-void px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {status === "loading" ? "..." : "Join Free"}
                    </button>
                  </form>

                  {status === "error" && (
                    <p className="text-red-400 text-sm mt-4">
                      Something broke. Try again or blame the algorithm.
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2: Choose your tier (animated reveal) ── */}
              {status === "choosing" && (
                <motion.div
                  key="tier-step"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-terminal font-heading text-2xl font-bold mb-2">
                      You&apos;re in.
                    </div>
                    <p className="text-chrome mb-8">
                      One more thing — choose your experience:
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    {/* FREE TIER */}
                    <motion.button
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, type: "spring", bounce: 0.25 }}
                      onClick={() => selectTier("free")}
                      className="bento-card p-6 text-left hover:border-terminal/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="tag tag-terminal">free</span>
                        <span className="font-heading text-2xl font-bold text-terminal">
                          $0
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-raw mb-1 group-hover:text-terminal transition-colors">
                        The Weekly Drop
                      </h3>
                      <p className="text-chrome/60 text-xs mb-4">
                        Everything you need. Nothing you don&apos;t.
                      </p>
                      <ul className="text-chrome text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-terminal text-xs mt-1">+</span>
                          Top 5 stories of the week
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-terminal text-xs mt-1">+</span>
                          1 creator spotlight
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-terminal text-xs mt-1">+</span>
                          1 tech joke (guaranteed funny)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-terminal text-xs mt-1">+</span>
                          1 job you should apply to
                        </li>
                      </ul>
                      <div className="mt-6 py-3 border-t border-noise text-center">
                        <span className="text-terminal text-sm font-bold uppercase tracking-wider group-hover:tracking-widest transition-all">
                          Start Free &rarr;
                        </span>
                      </div>
                    </motion.button>

                    {/* PAID TIER — ALL ACCESS */}
                    <motion.button
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, type: "spring", bounce: 0.25 }}
                      onClick={() => selectTier("all-access")}
                      className="bento-card p-6 text-left border-input/30 hover:border-input transition-all group cursor-pointer relative overflow-hidden"
                    >
                      {/* Glow accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-input" />

                      <div className="flex items-center justify-between mb-4">
                        <span className="tag tag-input">all access</span>
                        <span className="font-heading text-2xl font-bold text-input">
                          $9<span className="text-sm text-chrome/60">/mo</span>
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-raw mb-1 group-hover:text-input transition-colors">
                        All Access Pass
                      </h3>
                      <p className="text-chrome/60 text-xs mb-4">
                        The full experience. Premium content + AI chatbot.
                      </p>
                      <ul className="text-chrome text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-input text-xs mt-1">+</span>
                          Everything in free
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-input text-xs mt-1">+</span>
                          Deep dive articles + tutorials
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-input text-xs mt-1">+</span>
                          Full job board + salary data
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-input text-xs mt-1">+</span>
                          Polymarket roast of the week
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-input text-xs mt-1">+</span>
                          Prompt packs + exclusive tools
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-input text-xs mt-1 font-bold">*</span>
                          <span className="text-raw font-medium">
                            Raw Input AI Chatbot — personal assistant
                          </span>
                        </li>
                      </ul>
                      <div className="mt-6 py-3 border-t border-input/20 text-center">
                        <span className="text-input text-sm font-bold uppercase tracking-wider group-hover:tracking-widest transition-all">
                          Go All Access &rarr;
                        </span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Skip option */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-chrome/40 text-xs mt-6 cursor-pointer hover:text-chrome transition-colors"
                    onClick={() => selectTier("free")}
                  >
                    Just give me the free newsletter for now
                  </motion.p>
                </motion.div>
              )}

              {/* ── STEP 3: Confirmation ── */}
              {status === "done" && (
                <motion.div
                  key="done-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-terminal/20 flex items-center justify-center"
                  >
                    <span className="text-terminal text-3xl">&#10003;</span>
                  </motion.div>

                  <h2 className="font-heading text-3xl font-bold text-raw mb-2">
                    Welcome to the Cookout.
                  </h2>

                  {tier === "all-access" ? (
                    <div>
                      <p className="text-chrome mb-4">
                        All Access confirmed. Your first premium drop hits this
                        Sunday — plus your personal AI chatbot is ready.
                      </p>
                      <motion.a
                        href="#"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="inline-block bg-input text-void px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors mt-4"
                      >
                        Open Your Chatbot
                      </motion.a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-chrome mb-4">
                        First drop hits your inbox this Sunday. Top stories, one
                        laugh, one job. Straight to the point.
                      </p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-chrome/50 text-sm mt-6"
                      >
                        Want the full experience?{" "}
                        <button
                          onClick={() => setStatus("choosing")}
                          className="text-input underline hover:text-white transition-colors"
                        >
                          Upgrade to All Access
                        </button>
                      </motion.p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
