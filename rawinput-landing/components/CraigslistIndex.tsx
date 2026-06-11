"use client";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const CATEGORIES = [
  {
    heading: "AI & TECH NEWS",
    color: "text-input",
    links: [
      { label: "breaking news", tab: "breaking" },
      { label: "AI releases", tab: "breaking" },
      { label: "product launches", tab: "breaking" },
      { label: "funding rounds", tab: "breaking" },
      { label: "acquisitions", tab: "breaking" },
      { label: "startup radar", tab: "breaking" },
      { label: "policy watch", tab: "policy" },
      { label: "AI regulation", tab: "policy" },
      { label: "executive orders", tab: "policy" },
      { label: "corporate decoder", tab: "breaking" },
      { label: "open source drops", tab: "breaking" },
      { label: "model releases", tab: "breaking" },
      { label: "chip & hardware", tab: "supply-chain" },
      { label: "cloud updates", tab: "breaking" },
    ],
  },
  {
    heading: "DEEP DIVES & INVESTIGATION",
    color: "text-chrome",
    links: [
      { label: "BLACKBOX investigations", tab: "deep-dives" },
      { label: "AI bias reports", tab: "deep-dives" },
      { label: "facial recognition", tab: "deep-dives" },
      { label: "surveillance tech", tab: "deep-dives" },
      { label: "data ownership", tab: "deep-dives" },
      { label: "algorithmic justice", tab: "deep-dives" },
      { label: "ethics deep dives", tab: "deep-dives" },
      { label: "corporate exposés", tab: "deep-dives" },
      { label: "historical patterns", tab: "deep-dives" },
      { label: "supply chain ripple", tab: "supply-chain" },
    ],
  },
  {
    heading: "CREATORS & PROFILES",
    color: "text-input",
    links: [
      { label: "Who Trained You? spotlights", tab: "all" },
      { label: "AI artists", tab: "gallery" },
      { label: "ML engineers", tab: "all" },
      { label: "founders", tab: "all" },
      { label: "open source contributors", tab: "all" },
      { label: "HBCU innovators", tab: "directory" },
      { label: "diaspora creators", tab: "all" },
      { label: "Caribbean tech builders", tab: "all" },
      { label: "women in AI", tab: "all" },
      { label: "studio tours", tab: "all" },
      { label: "tool kits", tab: "all" },
      { label: "creator interviews", tab: "all" },
    ],
  },
  {
    heading: "JOBS & OPPORTUNITIES",
    color: "text-terminal",
    links: [
      { label: "remote AI jobs", tab: "jobs" },
      { label: "ML engineer roles", tab: "jobs" },
      { label: "data science", tab: "jobs" },
      { label: "prompt engineer", tab: "jobs" },
      { label: "frontend / React", tab: "jobs" },
      { label: "backend / Python", tab: "jobs" },
      { label: "DevOps / cloud", tab: "jobs" },
      { label: "product manager", tab: "jobs" },
      { label: "AI ethics / policy", tab: "jobs" },
      { label: "freelance / contract", tab: "jobs" },
      { label: "government tech (USAJOBS)", tab: "jobs" },
      { label: "internships", tab: "jobs" },
      { label: "apprenticeships", tab: "jobs" },
      { label: "grants & fellowships", tab: "directory" },
      { label: "Black-founded companies hiring", tab: "jobs" },
      { label: "who's actually hiring", tab: "jobs" },
    ],
  },
  {
    heading: "MAKING MONEY",
    color: "text-signal",
    links: [
      { label: "AI side hustles", tab: "the-bag" },
      { label: "prompt selling", tab: "the-bag" },
      { label: "automation agencies", tab: "the-bag" },
      { label: "freelance AI work", tab: "the-bag" },
      { label: "SaaS building", tab: "the-bag" },
      { label: "Chrome extensions", tab: "the-bag" },
      { label: "digital products", tab: "marketplace" },
      { label: "the audit (real receipts)", tab: "the-bag" },
      { label: "bootstrap chronicles", tab: "the-bag" },
      { label: "DoorDash / Uber / gig apps", tab: "the-bag" },
      { label: "Upwork / Fiverr strategies", tab: "the-bag" },
      { label: "website flipping", tab: "marketplace" },
      { label: "crypto & web3 gigs", tab: "the-bag" },
      { label: "Polymarket roasts", tab: "the-bag" },
      { label: "stock market commentary", tab: "the-bag" },
    ],
  },
  {
    heading: "LEARNING & EDUCATION",
    color: "text-terminal",
    links: [
      { label: "AI 101 (beginners)", tab: "learn" },
      { label: "prompt engineering", tab: "learn" },
      { label: "Python fundamentals", tab: "learn" },
      { label: "machine learning", tab: "learn" },
      { label: "deep learning", tab: "learn" },
      { label: "NLP & transformers", tab: "learn" },
      { label: "computer vision", tab: "learn" },
      { label: "generative AI / LLMs", tab: "learn" },
      { label: "web development", tab: "learn" },
      { label: "data science", tab: "learn" },
      { label: "HillmanTok University", tab: "learn" },
      { label: "free certifications", tab: "learn" },
      { label: "career paths", tab: "learn" },
      { label: "interview prep", tab: "learn" },
      { label: "build-along tutorials", tab: "learn" },
      { label: "tool reviews", tab: "learn" },
      { label: "jargon buster", tab: "learn" },
    ],
  },
  {
    heading: "PAPERS & RESEARCH",
    color: "text-signal",
    links: [
      { label: "paper breakdowns", tab: "papers" },
      { label: "AI bias research", tab: "papers" },
      { label: "NLP papers", tab: "papers" },
      { label: "computer vision", tab: "papers" },
      { label: "AI safety & alignment", tab: "papers" },
      { label: "ethics & society", tab: "papers" },
      { label: "DAIR Institute", tab: "papers" },
      { label: "ArXiv highlights", tab: "papers" },
      { label: "NIST standards", tab: "papers" },
      { label: "white papers", tab: "papers" },
    ],
  },
  {
    heading: "COMEDY & VIBES",
    color: "text-signal",
    links: [
      { label: "Task Failed Successfully", tab: "comedy" },
      { label: "AI fails & cursed outputs", tab: "comedy" },
      { label: "tech jokes daily", tab: "break-room" },
      { label: "meme lab", tab: "break-room" },
      { label: "GIF wars", tab: "break-room" },
      { label: "Would You Rather (tech)", tab: "break-room" },
      { label: "Deprecated (obituaries)", tab: "comedy" },
      { label: "Who Cooked? battles", tab: "comedy" },
      { label: "The Panel debates", tab: "comedy" },
      { label: "Overheard in Slack", tab: "break-room" },
      { label: "tech zodiac", tab: "break-room" },
      { label: "AI Generated vs Real", tab: "break-room" },
    ],
  },
  {
    heading: "CITY MODE",
    color: "text-terminal",
    links: [
      { label: "Atlanta", tab: "your-city" },
      { label: "NYC", tab: "your-city" },
      { label: "LA", tab: "your-city" },
      { label: "DMV (DC/MD/VA)", tab: "your-city" },
      { label: "Houston", tab: "your-city" },
      { label: "Chicago", tab: "your-city" },
      { label: "Detroit", tab: "your-city" },
      { label: "Dallas", tab: "your-city" },
      { label: "London", tab: "your-city" },
      { label: "Lagos", tab: "your-city" },
      { label: "Accra", tab: "your-city" },
      { label: "Toronto", tab: "your-city" },
      { label: "Kingston", tab: "your-city" },
      { label: "Johannesburg", tab: "your-city" },
      { label: "remote republic", tab: "your-city" },
      { label: "local meetups", tab: "your-city" },
    ],
  },
  {
    heading: "SPORTS TECH",
    color: "text-input",
    links: [
      { label: "athletes x AI", tab: "scoreboard" },
      { label: "sports analytics", tab: "scoreboard" },
      { label: "wearable tech", tab: "scoreboard" },
      { label: "fantasy x ML", tab: "scoreboard" },
      { label: "stadium tech", tab: "scoreboard" },
      { label: "esports & gaming", tab: "scoreboard" },
      { label: "NIL + tech", tab: "scoreboard" },
    ],
  },
  {
    heading: "GALLERY & ART",
    color: "text-signal",
    links: [
      { label: "Afrofuturism", tab: "gallery" },
      { label: "AI portraits", tab: "gallery" },
      { label: "generative art", tab: "gallery" },
      { label: "robotic portraiture", tab: "gallery" },
      { label: "AI surrealism", tab: "gallery" },
      { label: "street x tech", tab: "gallery" },
      { label: "video art", tab: "gallery" },
      { label: "submit your work", tab: "gallery" },
    ],
  },
  {
    heading: "MARKETPLACE",
    color: "text-input",
    links: [
      { label: "prompt packs", tab: "marketplace" },
      { label: "Notion templates", tab: "marketplace" },
      { label: "Figma kits", tab: "marketplace" },
      { label: "website templates", tab: "marketplace" },
      { label: "AI workflows", tab: "marketplace" },
      { label: "datasets", tab: "marketplace" },
      { label: "SaaS showcase", tab: "marketplace" },
      { label: "app drops", tab: "marketplace" },
      { label: "domain graveyard", tab: "marketplace" },
      { label: "website flips", tab: "marketplace" },
    ],
  },
  {
    heading: "DIRECTORY & RESOURCES",
    color: "text-terminal",
    links: [
      { label: "Black-founded AI companies", tab: "directory" },
      { label: "HBCU tech programs", tab: "directory" },
      { label: "grants & fellowships", tab: "directory" },
      { label: "accelerators", tab: "directory" },
      { label: "hackathons", tab: "directory" },
      { label: "free software alternatives", href: "/resources" },
      { label: "GitHub trending repos", href: "/resources" },
      { label: "creators of color repos", href: "/resources" },
      { label: "orgs & communities", href: "/resources" },
      { label: "VC firms for diverse founders", tab: "directory" },
      { label: "coworking spaces by city", tab: "directory" },
    ],
  },
  {
    heading: "LOG OFF",
    color: "text-terminal",
    links: [
      { label: "remote work paradises", tab: "log-off" },
      { label: "digital nomad guides", tab: "log-off" },
      { label: "Afro cultural calendar", tab: "log-off" },
      { label: "wellness for devs", tab: "log-off" },
      { label: "yoga & stretching", tab: "log-off" },
      { label: "cooking classes", tab: "log-off" },
      { label: "food guides by city", tab: "log-off" },
      { label: "travel deals", tab: "log-off" },
      { label: "workcation bundles", tab: "log-off" },
      { label: "activities & hobbies", tab: "log-off" },
    ],
  },
  {
    heading: "EVENTS",
    color: "text-input",
    links: [
      { label: "The Cookout (flagship)", tab: "all" },
      { label: "Patch Notes Live (monthly)", tab: "all" },
      { label: "Fork It hackathons", tab: "all" },
      { label: "Who Trained You? LIVE", tab: "all" },
      { label: "Merge Conflict debates", tab: "all" },
      { label: "Break Room comedy nights", tab: "all" },
      { label: "Root Access workshops", tab: "all" },
      { label: "watch parties", tab: "all" },
      { label: "virtual events / X Spaces", tab: "all" },
      { label: "AfroTech", tab: "all" },
    ],
  },
];

export default function CraigslistIndex() {
  return (
    <section id="index" className="py-24">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-input">// the index</span>
          </div>
          <h2 className="text-headline text-raw mb-2">
            Everything. All of It.
          </h2>
          <p className="text-sub max-w-2xl mb-10">
            200+ categories. Updated daily. Click anything. Go anywhere.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8">
          {CATEGORIES.map((cat, ci) => (
            <ScrollReveal key={cat.heading} delay={ci * 40}>
              <div>
                <h3
                  className={`font-heading text-xs font-bold uppercase tracking-widest mb-3 ${cat.color}`}
                >
                  {cat.heading}
                </h3>
                <ul className="space-y-1">
                  {cat.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={
                          "href" in link && link.href
                            ? link.href
                            : `/index-page?tab=${link.tab}`
                        }
                        className="text-chrome text-sm hover:text-raw transition-colors block py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Full index CTA */}
        <ScrollReveal delay={300}>
          <div className="text-center mt-12 pt-8 border-t border-noise">
            <Link
              href="/index-page"
              className="bg-input text-void px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors inline-block"
            >
              Browse Full Index
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
