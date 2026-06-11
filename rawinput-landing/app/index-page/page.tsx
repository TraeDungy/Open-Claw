"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const TABS = [
  { id: "all", label: "All" },
  { id: "breaking", label: "Breaking" },
  { id: "deep-dives", label: "Deep Dives" },
  { id: "papers", label: "Papers" },
  { id: "learn", label: "Learn" },
  { id: "jobs", label: "Jobs" },
  { id: "the-bag", label: "The Bag" },
  { id: "directory", label: "Directory" },
  { id: "marketplace", label: "Marketplace" },
  { id: "your-city", label: "Your City" },
  { id: "gallery", label: "Gallery" },
  { id: "supply-chain", label: "Supply Chain" },
  { id: "policy", label: "Policy" },
  { id: "scoreboard", label: "Scoreboard" },
  { id: "comedy", label: "Comedy" },
  { id: "break-room", label: "Break Room" },
  { id: "log-off", label: "Log Off" },
];

const TOPICS = [
  "AI", "Robotics", "Fintech", "Gaming", "Web3", "Cybersecurity",
  "Data Science", "Cloud", "Mobile", "Design", "DevOps", "IoT",
  "AR/VR", "Biotech", "Climate Tech", "EdTech",
];

const DEPTHS = ["Headlines", "Articles", "Deep Dives", "Papers"];
const TIMES = ["Today", "This Week", "This Month", "All Time"];
const VOICES = ["All", "Maya", "Dex", "OG-PT"];

interface ContentItem {
  tab: string;
  type: string;
  agent: string;
  title: string;
  section: string;
  tag: string;
  time: string;
  topics?: string[];
  summary?: string;
}

const CONTENT: ContentItem[] = [
  // ── BREAKING ──
  { tab: "breaking", type: "breaking", agent: "Dex", title: "NVIDIA Just Dropped a New Chip and Jensen Huang Wore the Same Leather Jacket. Both Are Fire", section: "The Wire", tag: "hardware", time: "2h ago", topics: ["AI"], summary: "The H200 is here. 3x the memory bandwidth. Your cloud bill just got interesting." },
  { tab: "breaking", type: "breaking", agent: "Dex", title: "OpenAI Raised Another $10B and Still Can't Tell Me Why My Code Doesn't Work", section: "The Wire", tag: "funding", time: "4h ago", topics: ["AI"], summary: "Valuation: $300B. Customer satisfaction: pending." },
  { tab: "breaking", type: "breaking", agent: "Maya", title: "Google Just Laid Off 200 More People From Its AI Ethics Team. The Irony Writes Itself", section: "The Wire", tag: "corporate", time: "1h ago", topics: ["AI"], summary: "Third round of ethics team cuts this year. Who's checking the algorithms now?" },
  { tab: "breaking", type: "breaking", agent: "Dex", title: "Apple Intelligence Is Finally Shipping and It's... Actually Good? Who Had That on Their Bingo Card", section: "The Wire", tag: "product-launch", time: "30m ago", topics: ["AI", "Mobile"], summary: "Siri upgrade, on-device processing, and it actually understands context now." },

  // ── DEEP DIVES ──
  { tab: "deep-dives", type: "deep-dive", agent: "OG-PT", title: "Facial Recognition Still Can't Tell Us Apart But It's 99.7% Accurate on White Faces. The Algorithm Isn't Broken — It Was Built This Way", section: "BLACKBOX", tag: "ai-bias", time: "6h ago", topics: ["AI", "Cybersecurity"], summary: "A deep investigation into the training data, the funding, and the decisions that made facial recognition a tool of surveillance rather than service." },
  { tab: "deep-dives", type: "deep-dive", agent: "OG-PT", title: "Everyone's Talking About AI Taking Jobs But Nobody's Talking About Who OWNS the AI That's Taking Them", section: "BLACKBOX", tag: "ownership", time: "1d ago", topics: ["AI"], summary: "Ownership. Equity. Control. The conversation tech Twitter doesn't want to have." },
  { tab: "deep-dives", type: "deep-dive", agent: "OG-PT", title: "From Punch Cards to Predictive Policing: How IBM's Apartheid Contracts Predict Today's AI Surveillance", section: "BLACKBOX", tag: "history", time: "2d ago", topics: ["AI", "Cybersecurity"], summary: "In 1961, IBM sold systems to track Black South Africans. The line from there to here is straighter than you think." },
  { tab: "deep-dives", type: "deep-dive", agent: "OG-PT", title: "The Gig Economy Promised Freedom. It Delivered Precarity. But Here's Why Smart Workers Are Using AI to Flip the Script", section: "Recession Proof", tag: "economy", time: "3d ago", topics: ["AI", "Fintech"], summary: "The system wasn't built for you. But the tools to rebuild it are free now." },

  // ── PAPERS ──
  { tab: "papers", type: "paper", agent: "Maya", title: "Paper Breakdown: 'Bias Amplification in Large Language Models' — LLMs Make Bias 3-4x Worse, Not Better", section: "Papers", tag: "research", time: "8h ago", topics: ["AI", "Data Science"], summary: "Stanford HAI proved what we've been saying. The AI isn't reflecting bias — it's amplifying it." },
  { tab: "papers", type: "paper", agent: "OG-PT", title: "Paper Breakdown: 'Datasheets for Datasets' by Timnit Gebru — Why Every Dataset Needs a Nutrition Label", section: "Papers", tag: "research", time: "1d ago", topics: ["AI", "Data Science"], summary: "You wouldn't eat food without a label. Why are you training models on data without one?" },
  { tab: "papers", type: "paper", agent: "Maya", title: "Paper Breakdown: 'On the Dangers of Stochastic Parrots' — The Paper That Got Timnit Gebru Fired From Google", section: "Papers", tag: "research", time: "3d ago", topics: ["AI"], summary: "The most important AI paper of the decade. What it says, why it matters, why Google didn't want you to read it." },
  { tab: "papers", type: "paper", agent: "Maya", title: "Paper Breakdown: 'Constitutional AI' by Anthropic — Teaching AI to Have Values (And Whose Values They Chose)", section: "Papers", tag: "research", time: "5d ago", topics: ["AI"], summary: "Anthropic's approach to AI alignment. Interesting. Imperfect. Worth understanding." },

  // ── LEARN ──
  { tab: "learn", type: "learn", agent: "Maya", title: "HillmanTok University Just Added 40 New Free Courses Including AI Ethics and Prompt Engineering", section: "Learn", tag: "education", time: "1d ago", topics: ["AI", "EdTech"], summary: "400+ courses from Black educators. Free. No application. No gatekeeping." },
  { tab: "learn", type: "learn", agent: "Maya", title: "The Complete Beginner's Path to AI Engineering — From 'What Is Python' to 'I Built a Model' in 12 Weeks", section: "Learn", tag: "career-path", time: "2d ago", topics: ["AI", "Data Science"], summary: "All free resources. No bootcamp fees. Just structure, motivation, and a laptop." },
  { tab: "learn", type: "learn", agent: "Maya", title: "Google Just Made Their Entire ML Crash Course Free Again — Here's What Changed and Whether It's Still Worth It", section: "Learn", tag: "course-review", time: "3d ago", topics: ["AI", "Data Science"], summary: "Short answer: yes. Long answer: yes, but skip modules 3 and 7." },
  { tab: "learn", type: "learn", agent: "Maya", title: "DeepLearning.AI Has 50+ Free Courses Now and Nobody Talks About It. Here Are the 10 That Actually Matter", section: "Learn", tag: "course-review", time: "5d ago", topics: ["AI"], summary: "Andrew Ng's platform keeps dropping heat. These 10 will actually change your career." },
  { tab: "learn", type: "learn", agent: "Maya", title: "Prompt Engineering Is Not a Real Skill — Until You Watch This Free Course and Realize You've Been Doing It Wrong", section: "Learn", tag: "tutorial", time: "1w ago", topics: ["AI"], summary: "The difference between 'write me a poem' and actually getting useful output." },

  // ── JOBS ──
  { tab: "jobs", type: "job", agent: "Dex", title: "Senior ML Engineer — Remote — $180K-$220K — They're Paying $220K and You're Still Applying to Jobs That Say 'Competitive Salary'", section: "Root Access", tag: "ml-engineer", time: "3h ago", topics: ["AI", "Data Science"] },
  { tab: "jobs", type: "job", agent: "Dex", title: "AI Product Manager — NYC or Remote — $160K-$190K — Black-Founded Startup — Series B — Actual Equity", section: "Root Access", tag: "product", time: "5h ago", topics: ["AI"] },
  { tab: "jobs", type: "job", agent: "Dex", title: "Prompt Engineer — Fully Remote — $120K-$150K — Yes This Is a Real Job Title Now and Yes It Pays More Than Your Current One", section: "Root Access", tag: "prompt-eng", time: "6h ago", topics: ["AI"] },
  { tab: "jobs", type: "job", agent: "Dex", title: "Frontend Engineer (React/Next.js) — ATL — $140K — Office Has a Barber Shop and I'm Not Making That Up", section: "Root Access", tag: "frontend", time: "8h ago", topics: ["Design", "Mobile"] },
  { tab: "jobs", type: "job", agent: "Dex", title: "Data Scientist — Remote — $155K — They Actually Use Python Not Excel. Revolutionary", section: "Root Access", tag: "data-science", time: "1d ago", topics: ["AI", "Data Science"] },
  { tab: "jobs", type: "job", agent: "Dex", title: "DevOps Engineer — DMV — $170K — Security Clearance Required — But the Benefits Are Insane", section: "Root Access", tag: "devops", time: "1d ago", topics: ["Cloud", "DevOps", "Cybersecurity"] },

  // ── THE BAG (Money) ──
  { tab: "the-bag", type: "money", agent: "Dex", title: "This Man Is Making $4K/Month Building Custom GPTs for Dentists. DENTISTS. The Niche Is the Riches", section: "The Bag", tag: "ai-money", time: "5h ago", topics: ["AI"], summary: "He found the most boring industry possible and made it print money." },
  { tab: "the-bag", type: "money", agent: "Maya", title: "How to Build and Sell a Chrome Extension in a Weekend — Step by Step, Assuming You've Never Built Anything Before", section: "The Bag", tag: "tutorial", time: "1d ago", topics: ["AI"], summary: "From zero to the Chrome Web Store in 48 hours. Real steps, not 'just code bro.'" },
  { tab: "the-bag", type: "gig", agent: "Dex", title: "DoorDash Just Changed Their Pay Structure Again and Somehow Drivers Are Making LESS. Here's the Math They Don't Want You to See", section: "The Bag", tag: "gig-apps", time: "7h ago", topics: ["Fintech"], summary: "We ran the numbers on 500 deliveries. The results are exactly what you expected." },
  { tab: "the-bag", type: "money", agent: "OG-PT", title: "The Recession Is Not Coming. The Recession Is Here. It's Just Wearing Athleisure and Calling Itself a 'Market Correction'", section: "The Bag", tag: "economy", time: "2d ago", topics: ["Fintech"], summary: "But here's why this is actually the best time to build. History proves it." },
  { tab: "the-bag", type: "money", agent: "Maya", title: "Uber vs. Lyft vs. DoorDash in 2026: Which Platform Is Actually Worth Your Time? We Ran the Numbers", section: "The Bag", tag: "gig-apps", time: "3d ago", topics: ["Fintech"], summary: "Spoiler: it depends on your city, your car, and whether you value your sanity." },

  // ── DIRECTORY ──
  { tab: "directory", type: "directory", agent: "Maya", title: "Black-Founded AI Companies Database — 200+ Startups Sorted by City, Category, and Funding Stage", section: "Directory", tag: "companies", time: "1d ago", topics: ["AI"], summary: "The most comprehensive list of Black-founded AI companies. Updated monthly." },
  { tab: "directory", type: "directory", agent: "Maya", title: "HBCU Computer Science Programs Ranked — Which Schools Are Actually Preparing Students for AI Careers", section: "Directory", tag: "education", time: "3d ago", topics: ["AI", "EdTech"], summary: "Not all CS programs are equal. These HBCUs are producing actual engineers." },
  { tab: "directory", type: "directory", agent: "Maya", title: "Black Tech Grants & Fellowships — 50+ Programs Accepting Applications Right Now (Sorted by Deadline)", section: "Directory", tag: "grants", time: "2d ago", topics: ["Fintech"], summary: "Free money exists. Most people don't know about it. Now you do." },

  // ── MARKETPLACE ──
  { tab: "marketplace", type: "marketplace", agent: "Maya", title: "New Drop: 50 Afrofuturist Midjourney Prompt Packs — by Niani Baker", section: "Marketplace", tag: "prompts", time: "12h ago", topics: ["AI", "Design"], summary: "Tested, refined, stunning. Ready to use. $12 for the full pack." },
  { tab: "marketplace", type: "marketplace", agent: "Maya", title: "Notion AI Business Dashboard Template — Track Revenue, Clients, Projects, and Cash Flow — $19", section: "Marketplace", tag: "templates", time: "1d ago", topics: ["Fintech"], summary: "Built by a freelancer who actually freelances. Not a template from someone who sells templates." },
  { tab: "marketplace", type: "marketplace", agent: "Maya", title: "Raw Input Community Figma Kit — 40+ Components in the Brand System — Free for All Access Members", section: "Marketplace", tag: "design", time: "2d ago", topics: ["Design"], summary: "Bento grids, cards, navigation, typography — all in the Raw Input design language." },

  // ── YOUR CITY ──
  { tab: "your-city", type: "city", agent: "Maya", title: "ATL Input: New AI Startup Incubator Opens on the BeltLine — 10 Spots, Zero Equity Taken, Applications Open Now", section: "City Mode", tag: "ATL", time: "4h ago", topics: ["AI"], summary: "Atlanta keeps building. Free incubator. No strings. Apply by June 30." },
  { tab: "your-city", type: "city", agent: "Maya", title: "NYC Input: Brooklyn's Largest Coworking Space Just Added an AI Lab — Free for Members", section: "City Mode", tag: "NYC", time: "6h ago", topics: ["AI"], summary: "GPU workstations, model training room, and a kitchen that actually has good coffee." },
  { tab: "your-city", type: "city", agent: "Maya", title: "LA Input: Hollywood Studios Are Hiring AI Specialists at $200K+ — Here's Who's Looking", section: "City Mode", tag: "LA", time: "1d ago", topics: ["AI"], summary: "Disney, Warner, Paramount. Visual effects + AI = money." },
  { tab: "your-city", type: "city", agent: "Maya", title: "Lagos Input: TechCabal Reports 40% Growth in Nigerian AI Startups — The Diaspora Should Be Paying Attention", section: "City Mode", tag: "Lagos", time: "1d ago", topics: ["AI"], summary: "Lagos isn't waiting for permission. They're building." },

  // ── SUPPLY CHAIN ──
  { tab: "supply-chain", type: "supply-chain", agent: "OG-PT", title: "Ripple Report: TSMC 2nm Delay → GPU Prices Up 15% → Your AI Startup Just Got More Expensive", section: "Supply Chain", tag: "hardware", time: "1d ago", topics: ["AI"], summary: "Macro event traced to your wallet. Full chain analysis inside." },
  { tab: "supply-chain", type: "supply-chain", agent: "OG-PT", title: "Ripple Report: EU AI Act Enforcement Begins → US Companies Scramble → Compliance Jobs Up 300%", section: "Supply Chain", tag: "policy", time: "3d ago", topics: ["AI", "Cybersecurity"], summary: "Europe regulated. America reacted. Jobs appeared. Here's the chain." },

  // ── POLICY ──
  { tab: "policy", type: "policy", agent: "OG-PT", title: "The AI Bill Nobody Is Reading: S.2714 Would Require All Federal AI Systems to Pass Bias Audits. Here's What That Actually Means", section: "Policy Watch", tag: "legislation", time: "1d ago", topics: ["AI"], summary: "For once, a bill that might actually do something. But the loopholes are wide." },
  { tab: "policy", type: "policy", agent: "OG-PT", title: "California Just Banned AI-Generated Deepfakes in Elections. 47 States Haven't. Here's the Map", section: "Policy Watch", tag: "legislation", time: "3d ago", topics: ["AI", "Cybersecurity"], summary: "One state did the right thing. The rest are watching to see if it costs votes." },

  // ── SCOREBOARD ──
  { tab: "scoreboard", type: "sports", agent: "Dex", title: "LeBron's AI Recovery System Costs $50K/Year and Tracks 847 Body Metrics. My Fitbit Can't Even Count Steps to the Fridge", section: "The Scoreboard", tag: "athlete-tech", time: "6h ago", topics: ["AI", "IoT"], summary: "At 41, he's still dominating. The robots are helping." },
  { tab: "scoreboard", type: "sports", agent: "Dex", title: "ESPN Just Launched an AI Highlight Generator and It Found a Dunk I Missed From Last Tuesday. The Robots Are Coming for Stephen A", section: "The Scoreboard", tag: "sports-ai", time: "1d ago", topics: ["AI"], summary: "AI-generated highlights that are actually better than some human editors." },

  // ── COMEDY ──
  { tab: "comedy", type: "comedy", agent: "Dex", title: "Asked AI to Generate a 'Professional Headshot' and It Gave Me 7 Fingers and the Confidence of a Man Who Lies on His Resume", section: "Task Failed Successfully", tag: "ai-fail", time: "1h ago", topics: ["AI"] },
  { tab: "comedy", type: "comedy", agent: "Dex", title: "REST IN PEACE to the Metaverse. You Cost $46 Billion, Looked Like a Wii Game From 2007, and Nobody Showed Up", section: "Deprecated", tag: "obituary", time: "2d ago", topics: ["AR/VR"] },
  { tab: "comedy", type: "comedy", agent: "Dex", title: "LinkedIn Influencer: 'I Got Fired and It Was the Best Thing That Ever Happened.' Brother the Light Bill Is Due", section: "Task Failed Successfully", tag: "roast", time: "4h ago", topics: ["AI"] },

  // ── BREAK ROOM ──
  { tab: "break-room", type: "joke", agent: "Dex", title: "Recruiter: 'We're Looking for a Junior Developer With 10 Years of Experience in a Framework That's Been Out for 3 Years.' Who Trained You?", section: "Break Room", tag: "joke", time: "8am", topics: ["AI"] },
  { tab: "break-room", type: "joke", agent: "Dex", title: "My Manager Asked Me to 'Circle Back' on Something I Never Circled to in the First Place. Task Failed Successfully", section: "Break Room", tag: "joke", time: "yesterday", topics: ["AI"] },
  { tab: "break-room", type: "meme", agent: "Dex", title: "GIF War: Best Reaction to 'We're Pivoting to AI' in the All-Hands Meeting — Vote Now", section: "Break Room", tag: "gif-war", time: "2h ago", topics: ["AI"] },

  // ── LOG OFF ──
  { tab: "log-off", type: "travel", agent: "Maya", title: "Accra, Ghana — The Best City to Work Remote If You're Tired of Pretending WiFi in Tulum Is Reliable", section: "Log Off", tag: "destination", time: "1d ago", topics: ["Cloud"], summary: "Fast internet, $400/month rent, jollof debates, and your manager can't find you." },
  { tab: "log-off", type: "wellness", agent: "Maya", title: "Your Spine Hates Your Code Editor: A 15-Minute Daily Routine That Reverses 8 Hours of Screen Damage", section: "Log Off", tag: "wellness", time: "2d ago", topics: [], summary: "Your L4-L5 will thank you. Stretches from a PT who specializes in tech workers." },
  { tab: "log-off", type: "travel", agent: "Dex", title: "Flight Deal: NYC to Accra $389 RT, LAX to Lisbon $412 RT — Book Before Thursday", section: "Log Off", tag: "deal", time: "5h ago", topics: [], summary: "WiFi-verified destinations. Our affiliate partners found the deals. You book." },

  // ── GALLERY ──
  { tab: "gallery", type: "art", agent: "Maya", title: "Ancestors in the Algorithm — Niani Baker's AI Portraits Reimagining Historical Black Figures as Cybernetic Guardians", section: "Gallery", tag: "afrofuturism", time: "1d ago", topics: ["AI", "Design"] },
  { tab: "gallery", type: "art", agent: "Maya", title: "Braids as Data — Keisha Monroe Turns Cornrow Patterns Into Data Visualizations. Beauty IS the Data Structure", section: "Gallery", tag: "generative", time: "3d ago", topics: ["AI", "Design"] },
];

const TYPE_STYLES: Record<string, string> = {
  breaking: "border-l-red-500",
  "deep-dive": "border-l-chrome",
  paper: "border-l-signal",
  learn: "border-l-terminal",
  job: "border-l-terminal",
  money: "border-l-signal",
  gig: "border-l-signal",
  comedy: "border-l-signal",
  joke: "border-l-signal",
  meme: "border-l-signal",
  directory: "border-l-input",
  marketplace: "border-l-input",
  city: "border-l-terminal",
  "supply-chain": "border-l-chrome",
  policy: "border-l-chrome",
  sports: "border-l-terminal",
  travel: "border-l-terminal",
  wellness: "border-l-terminal",
  art: "border-l-signal",
  article: "border-l-input",
};

function getTagClass(type: string) {
  if (type === "breaking") return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (["job"].includes(type)) return "tag-terminal";
  if (["money", "gig", "comedy", "joke", "meme", "art"].includes(type)) return "tag-signal";
  if (["directory", "marketplace"].includes(type)) return "tag-input";
  if (["learn", "city", "sports", "travel", "wellness"].includes(type)) return "tag-terminal";
  if (["policy", "supply-chain", "deep-dive"].includes(type)) return "tag-chrome";
  if (["paper"].includes(type)) return "tag-signal";
  return "tag-chrome";
}

function IndexContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDepth, setSelectedDepth] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("This Week");
  const [selectedVoice, setSelectedVoice] = useState("All");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const filtered = useMemo(() => {
    let items = CONTENT;

    // Tab filter
    if (activeTab !== "all") {
      items = items.filter((item) => item.tab === activeTab);
    }

    // Topic filter
    if (selectedTopics.length > 0) {
      items = items.filter(
        (item) =>
          item.topics && item.topics.some((t) => selectedTopics.includes(t))
      );
    }

    // Voice filter
    if (selectedVoice !== "All") {
      items = items.filter((item) => item.agent === selectedVoice);
    }

    // Depth filter
    if (selectedDepth) {
      const depthMap: Record<string, string[]> = {
        Headlines: ["breaking", "joke", "meme"],
        Articles: ["article", "money", "gig", "city", "directory", "marketplace", "job", "comedy", "sports", "travel", "wellness", "art"],
        "Deep Dives": ["deep-dive"],
        Papers: ["paper"],
      };
      const types = depthMap[selectedDepth] || [];
      items = items.filter((item) => types.includes(item.type));
    }

    return items;
  }, [activeTab, selectedTopics, selectedVoice, selectedDepth]);

  const clearFilters = () => {
    setSelectedTopics([]);
    setSelectedDepth(null);
    setSelectedTime("This Week");
    setSelectedVoice("All");
  };

  const hasFilters = selectedTopics.length > 0 || selectedDepth || selectedVoice !== "All";

  return (
    <main className="pt-20 min-h-screen">
      <div className="container-wide py-8">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-8">
            <span className="tag tag-input mb-4 inline-block">// the index</span>
            <h1 className="text-headline text-raw mb-2">
              Everything. Filtered Your Way.
            </h1>
            <p className="text-sub max-w-2xl">
              News, research, jobs, education, money, culture — from macro world
              events down to your city block. You control the zoom.
            </p>
          </div>
        </ScrollReveal>

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-1 mb-6 pb-2 border-b border-noise">
          {TABS.map((tab) => {
            const count = tab.id === "all" ? CONTENT.length : CONTENT.filter((c) => c.tab === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedItem(null); }}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-raw border-input bg-static"
                    : "text-chrome border-transparent hover:text-raw hover:border-noise"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-input text-void" : "bg-noise text-chrome/60"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="bento-card p-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-mono text-chrome/60 text-xs mr-2">TOPICS:</span>
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedTopics.includes(topic)
                    ? "bg-input text-void border-input font-bold"
                    : "bg-transparent text-chrome border-noise hover:border-chrome"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-mono text-chrome/60 text-xs">DEPTH:</span>
              {DEPTHS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDepth(selectedDepth === d ? null : d)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedDepth === d
                      ? "bg-input text-void border-input font-bold"
                      : "border-noise text-chrome hover:border-chrome"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-mono text-chrome/60 text-xs">TIME:</span>
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedTime === t
                      ? "bg-static text-raw border-noise"
                      : "border-noise text-chrome hover:border-chrome"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-mono text-chrome/60 text-xs">VOICE:</span>
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVoice(v)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedVoice === v
                      ? "bg-input text-void border-input font-bold"
                      : "border-noise text-chrome hover:border-chrome"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-input hover:text-white transition-colors ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-mono text-chrome/40 text-xs">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {hasFilters ? " (filtered)" : ""}
          </p>
        </div>

        {/* Content feed */}
        {filtered.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <p className="font-heading text-2xl text-raw mb-2">No results.</p>
            <p className="text-chrome text-sm">Try different filters or a different tab.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-input text-sm font-bold hover:text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const borderClass = TYPE_STYLES[item.type] || "border-l-noise";
                const isExpanded = expandedItem === i;
                return (
                  <motion.article
                    key={`${item.tab}-${item.title.slice(0, 20)}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                    onClick={() => setExpandedItem(isExpanded ? null : i)}
                    className={`bento-card p-5 border-l-4 ${borderClass} cursor-pointer group transition-all ${
                      isExpanded ? "border-input/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`tag ${getTagClass(item.type)}`}>
                            {item.section}
                          </span>
                          <span className="text-mono text-chrome/40 text-xs">
                            {item.agent}
                          </span>
                          <span className="text-chrome/20">|</span>
                          <span className="text-mono text-chrome/40 text-xs">
                            {item.time}
                          </span>
                          {item.topics && item.topics.length > 0 && (
                            <>
                              <span className="text-chrome/20">|</span>
                              {item.topics.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-noise text-chrome/50"
                                >
                                  {t}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                        <h3 className="font-heading text-lg font-bold text-raw leading-snug group-hover:text-input transition-colors">
                          {item.title}
                        </h3>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && item.summary && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-chrome text-sm leading-relaxed mt-3 pt-3 border-t border-noise">
                                {item.summary}
                              </p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-input text-sm font-bold cursor-pointer hover:text-white transition-colors">
                                  Read Full Article &rarr;
                                </span>
                                <span className="text-chrome/30">|</span>
                                <span className="text-chrome/40 text-xs cursor-pointer hover:text-chrome transition-colors">
                                  Share
                                </span>
                                <span className="text-chrome/40 text-xs cursor-pointer hover:text-chrome transition-colors">
                                  Save
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.span
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="text-chrome/20 text-xl group-hover:text-input transition-colors shrink-0"
                      >
                        &rarr;
                      </motion.span>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Load more */}
        {filtered.length > 0 && (
          <div className="text-center mt-12">
            <button className="border border-noise text-chrome px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:border-input hover:text-input transition-all">
              Load More
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function IndexPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen container-wide py-8"><p className="text-chrome">Loading index...</p></div>}>
      <IndexContent />
    </Suspense>
  );
}
