"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const SAMPLE_BATTLES = [
  {
    topic: "Should AI Replace Customer Service Jobs?",
    culture: {
      name: "Dex",
      label: "RAW INPUT",
      response:
        "Real talk — yeah, AI IS replacing these jobs. That's not a debate, that's a spreadsheet. The question is: are the people losing those $15/hr jobs getting retrained or just getting a LinkedIn notification? Because right now, companies are saving $2M/year on chatbots that can't process a refund, and the single mom who used to handle that is applying to DoorDash. The tech works. The transition plan doesn't exist.",
    },
    generic: {
      name: "Generic AI",
      label: "VANILLA BOT",
      response:
        "This is a nuanced topic with valid perspectives on both sides. While AI can improve efficiency and reduce costs for businesses, it's important to consider the human impact. A balanced approach combining automation with human oversight may be the most beneficial path forward.",
    },
    votes: { culture: 73, generic: 27 },
  },
  {
    topic: "What Would You Do If You Grew Up Getting Spanked?",
    culture: {
      name: "Maya",
      label: "RAW INPUT",
      response:
        "I'd do what a lot of us are doing — breaking the cycle while understanding where it came from. My mama wasn't being abusive, she was being afraid. Afraid of what the world would do to me if I didn't have discipline. That fear was generational. It came from survival. I choose a different path for my kids, but I don't demonize the people who raised me the only way they knew how. Both things can be true.",
    },
    generic: {
      name: "Generic AI",
      label: "VANILLA BOT",
      response:
        "Research on corporal punishment suggests that while it was historically common across many cultures, studies indicate it can have negative long-term psychological effects. Modern parenting approaches generally favor positive reinforcement and communication-based discipline.",
    },
    votes: { culture: 89, generic: 11 },
  },
  {
    topic: "Why Are There So Few Black People in AI Leadership?",
    culture: {
      name: "OG-PT",
      label: "RAW INPUT",
      response:
        "Three reasons, and none of them are talent. One: pipeline access — if HBCU CS programs don't get the same research funding as Stanford, the pipeline narrows before it starts. Two: network gatekeeping — VC is a relationship business, and the relationships are homogeneous. Three: retention — Black researchers who challenge bias in AI systems get pushed out (ask Timnit Gebru). The talent exists. The system wasn't designed to elevate it. 2.4% of AI researchers are Black. Fix the structure, not the people.",
    },
    generic: {
      name: "HR Bot",
      label: "CORPORATE",
      response:
        "At our organization, we are deeply committed to diversity, equity, and inclusion. We have implemented comprehensive DEI programs, unconscious bias training, and diverse hiring pipelines to ensure equitable representation across all levels.",
    },
    votes: { culture: 94, generic: 6 },
  },
];

// Simulated responses for user questions
const CULTURE_AGENTS = ["Maya", "Dex", "OG-PT"];
const SIMULATED_CULTURE_RESPONSES: Record<string, string[]> = {
  Maya: [
    "Let me break this down in a way that actually makes sense, not in a way that sounds like a Wikipedia summary...",
    "Good question. Here's what nobody in tech Twitter is saying about this...",
    "I've been thinking about this, and the answer is more layered than people want it to be...",
  ],
  Dex: [
    "Alright let me keep it all the way real with you on this one...",
    "Short answer? Yes. Long answer? Yes, but not for the reasons you think...",
    "I got OPINIONS on this. Pull up a chair...",
  ],
  "OG-PT": [
    "To understand this, you have to understand what happened before. Context first, then the answer...",
    "This question is actually about power. It's always about power. Let me explain...",
    "Everyone's looking at the surface. Let me take you underneath...",
  ],
};
const SIMULATED_GENERIC_RESPONSES = [
  "This is a complex topic that requires careful consideration of multiple perspectives. While there are valid arguments on various sides, it's important to note that...",
  "Based on available research and data, there are several factors to consider. A balanced approach that takes into account multiple stakeholders may be the most appropriate...",
  "It's important to approach this topic with nuance. Studies suggest that there are both potential benefits and challenges associated with this area, and further research may be needed...",
];

const MAX_CHARS = 200;

export default function VersusPreview() {
  const [active, setActive] = useState(0);
  const [showAsk, setShowAsk] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [liveResponse, setLiveResponse] = useState<{
    topic: string;
    generic: { name: string; response: string };
    culture: { name: string; response: string };
  } | null>(null);
  const [liveVote, setLiveVote] = useState<"generic" | "culture" | null>(null);

  const battle = SAMPLE_BATTLES[active];

  const handleAsk = () => {
    if (!userQuestion.trim() || userQuestion.length < 5) return;
    setIsAsking(true);

    const agent = CULTURE_AGENTS[Math.floor(Math.random() * CULTURE_AGENTS.length)];
    const cultureResp = SIMULATED_CULTURE_RESPONSES[agent][Math.floor(Math.random() * 3)];
    const genericResp = SIMULATED_GENERIC_RESPONSES[Math.floor(Math.random() * 3)];

    // Simulate typing delay
    setTimeout(() => {
      setLiveResponse({
        topic: userQuestion,
        generic: { name: "Generic AI", response: genericResp },
        culture: { name: agent, response: cultureResp },
      });
      setIsAsking(false);
      setUserQuestion("");
    }, 1500);
  };

  return (
    <section id="who-cooked" className="py-24">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-input">// social experiment</span>
          </div>
          <h2 className="text-headline text-raw mb-2">Who Cooked?</h2>
          <p className="text-sub max-w-2xl mb-8">
            Same question. Two bots. Wildly different answers. The vanilla bot
            goes first — then see what happens when AI actually has flavor.
          </p>
        </ScrollReveal>

        {/* ── SAMPLE BATTLES (pre-loaded) ── */}
        <div className="flex flex-wrap gap-3 mb-8">
          {SAMPLE_BATTLES.map((b, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setLiveResponse(null); }}
              className={`text-sm px-4 py-2 rounded-sm border transition-all ${
                active === i && !liveResponse
                  ? "bg-input text-void border-input font-bold"
                  : "bg-transparent text-chrome border-noise hover:border-chrome"
              }`}
            >
              {b.topic.slice(0, 40)}...
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Topic */}
            <div className="bento-card p-6 md:p-8 mb-4">
              <span className="text-mono text-input text-xs">TOPIC</span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-raw mt-2">
                &ldquo;{battle.topic}&rdquo;
              </h3>
            </div>

            {/* Responses — VANILLA FIRST, then Raw Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Generic bot — FIRST */}
              <div className="bento-card p-6 md:p-8 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-chrome/30" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-noise rounded-sm flex items-center justify-center text-chrome text-xs font-bold font-mono">
                    AI
                  </div>
                  <div>
                    <div className="font-heading font-bold text-chrome text-sm">
                      {battle.generic.name}
                    </div>
                    <div className="text-mono text-chrome/60 text-xs">
                      {battle.generic.label}
                    </div>
                  </div>
                </div>
                <p className="text-chrome text-sm leading-relaxed">
                  &ldquo;{battle.generic.response}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-noise rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chrome/40 rounded-full transition-all duration-1000"
                      style={{ width: `${battle.votes.generic}%` }}
                    />
                  </div>
                  <span className="font-heading font-bold text-chrome text-lg">
                    {battle.votes.generic}%
                  </span>
                </div>
              </div>

              {/* Culture bot — SECOND */}
              <div className="bento-card p-6 md:p-8 border-input/30 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-input" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-input rounded-sm flex items-center justify-center text-void text-xs font-bold font-mono">
                    RI
                  </div>
                  <div>
                    <div className="font-heading font-bold text-raw text-sm">
                      {battle.culture.name}
                    </div>
                    <div className="text-mono text-input text-xs">
                      {battle.culture.label}
                    </div>
                  </div>
                </div>
                <p className="text-raw text-sm leading-relaxed">
                  &ldquo;{battle.culture.response}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-noise rounded-full overflow-hidden">
                    <div
                      className="h-full bg-input rounded-full transition-all duration-1000"
                      style={{ width: `${battle.votes.culture}%` }}
                    />
                  </div>
                  <span className="font-heading font-bold text-input text-lg">
                    {battle.votes.culture}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA — toggles ask mode */}
        <ScrollReveal delay={200}>
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAsk(!showAsk)}
              className={`px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest transition-all inline-block ${
                showAsk
                  ? "bg-input text-void hover:bg-white"
                  : "border border-input text-input hover:bg-input hover:text-void"
              }`}
            >
              {showAsk ? "Close" : "Ask Your Own Question"}
            </button>
          </div>
        </ScrollReveal>

        {/* ── ASK YOUR OWN — revealed on button click ── */}
        <AnimatePresence>
          {showAsk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-8 space-y-6">
                {/* Question input */}
                <div className="bento-card p-5 border-input/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="tag tag-input">ask your own</span>
                    <span className="text-chrome/40 text-xs font-mono">
                      {userQuestion.length}/{MAX_CHARS}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_CHARS)
                          setUserQuestion(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                      placeholder='Ask both bots anything... "What do you think about remote work?"'
                      className="flex-1 bg-void border border-noise rounded-sm px-4 py-3 text-raw text-sm placeholder:text-chrome/30 focus:outline-none focus:border-input transition-colors font-mono"
                      maxLength={MAX_CHARS}
                    />
                    <button
                      onClick={handleAsk}
                      disabled={isAsking || userQuestion.length < 5}
                      className="bg-input text-void px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 whitespace-nowrap"
                    >
                      {isAsking ? "Cooking..." : "Who Cooked?"}
                    </button>
                  </div>
                </div>

                {/* Live response */}
                <AnimatePresence>
                  {liveResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="bento-card p-5 mb-4 border-input/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="tag tag-input">your question</span>
                          <span className="text-terminal text-xs font-mono">
                            live
                          </span>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-raw">
                          &ldquo;{liveResponse.topic}&rdquo;
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Generic first */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bento-card p-5 relative"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-chrome/30" />
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 bg-noise rounded-sm flex items-center justify-center text-chrome text-xs font-bold font-mono">
                              AI
                            </div>
                            <div>
                              <div className="font-heading font-bold text-chrome text-sm">
                                {liveResponse.generic.name}
                              </div>
                              <div className="text-mono text-chrome/60 text-[10px]">
                                VANILLA BOT
                              </div>
                            </div>
                          </div>
                          <p className="text-chrome text-sm leading-relaxed">
                            &ldquo;{liveResponse.generic.response}&rdquo;
                          </p>
                        </motion.div>

                        {/* Culture second */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bento-card p-5 border-input/30 relative"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-input" />
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 bg-input rounded-sm flex items-center justify-center text-void text-xs font-bold font-mono">
                              RI
                            </div>
                            <div>
                              <div className="font-heading font-bold text-raw text-sm">
                                {liveResponse.culture.name}
                              </div>
                              <div className="text-mono text-input text-[10px]">
                                RAW INPUT
                              </div>
                            </div>
                          </div>
                          <p className="text-raw text-sm leading-relaxed">
                            &ldquo;{liveResponse.culture.response}&rdquo;
                          </p>
                        </motion.div>
                      </div>

                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          onClick={() => setLiveVote("generic")}
                          className={`border px-5 py-2 rounded-sm text-xs font-bold transition-all ${
                            liveVote === "generic"
                              ? "bg-chrome text-void border-chrome"
                              : "border-chrome/20 text-chrome hover:border-chrome"
                          }`}
                        >
                          {liveVote === "generic" ? "Voted!" : "Vanilla Cooked"}
                        </button>
                        <button
                          onClick={() => setLiveVote("culture")}
                          className={`border px-5 py-2 rounded-sm text-xs font-bold transition-all ${
                            liveVote === "culture"
                              ? "bg-input text-void border-input"
                              : "border-input text-input hover:bg-input hover:text-void"
                          }`}
                        >
                          {liveVote === "culture" ? "Voted!" : "Raw Input Cooked"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
