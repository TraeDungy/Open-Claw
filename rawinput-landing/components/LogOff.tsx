"use client";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const LOG_OFF_TABS = [
  { id: "all", label: "All" },
  { id: "destinations", label: "Destinations" },
  { id: "remote-work", label: "Remote Work" },
  { id: "culture", label: "Culture Calendar" },
  { id: "wellness", label: "Wellness" },
  { id: "food", label: "Food" },
  { id: "experiences", label: "Experiences" },
  { id: "deals", label: "Deals & Travel" },
];

const CONTENT = [
  {
    tab: "destinations",
    category: "REMOTE PARADISE",
    tagColor: "tag-terminal",
    title: "Accra, Ghana — The Best City to Work Remote If You're Tired of Pretending WiFi in Tulum Is Reliable",
    desc: "Fast internet, coworking spaces, Year of Return energy, jollof debates, and your rent is $400/month. A full breakdown of living and working from Accra.",
    agent: "Maya",
    tags: ["Ghana", "Remote Work", "Cost of Living", "Diaspora"],
  },
  {
    tab: "destinations",
    category: "CITY SPOTLIGHT",
    tagColor: "tag-input",
    title: "Lisbon, Portugal — Europe's Best-Kept Secret for Black Digital Nomads (Until This Article Ruins It)",
    desc: "Affordable, sunny, great food, growing tech scene, D7 visa, and a Black community that's been thriving quietly. Here's everything you need.",
    agent: "Maya",
    tags: ["Portugal", "Digital Nomad", "Visa", "Europe"],
  },
  {
    tab: "remote-work",
    category: "REMOTE SETUP",
    tagColor: "tag-terminal",
    title: "The $500 Remote Work Setup That Beats Every $3K Standing Desk Influencer Post You've Seen",
    desc: "Monitor, keyboard, chair, lighting, webcam — we tested the budget setup against the luxury one. The results will make your wallet smile.",
    agent: "Dex",
    tags: ["Remote Setup", "Budget", "Productivity", "Gear"],
  },
  {
    tab: "remote-work",
    category: "STRATEGIC LOCATIONS",
    tagColor: "tag-signal",
    title: "The 10 Best Time Zones for Remote Work If Your Team Is in NYC — And How to Pitch Your Boss on Each One",
    desc: "Cape Verde to Casablanca to Cape Town. Same-ish time zone, wildly better quality of life. With email templates to send your manager.",
    agent: "Maya",
    tags: ["Time Zones", "Remote Strategy", "Negotiation"],
  },
  {
    tab: "culture",
    category: "AFRO CALENDAR",
    tagColor: "tag-input",
    title: "June 2026: Juneteenth Celebrations, Afro Nation Portugal, Essence Fest Early Bird, Afrochella Planning Starts Now",
    desc: "The monthly cultural calendar — festivals, celebrations, events, and deadlines you should have on your radar. Plan the vibes in advance.",
    agent: "Maya",
    tags: ["Events", "Festivals", "Culture", "Monthly"],
  },
  {
    tab: "culture",
    category: "LIFE EXPERIENCE",
    tagColor: "tag-signal",
    title: "I Spent 30 Days in Medellín as a Black Woman Working in Tech. Here's What Nobody Tells You",
    desc: "The beautiful, the complicated, the real — from safety to community to the best empanadas you'll ever eat while debugging production code.",
    agent: "Maya",
    tags: ["Colombia", "Personal Essay", "Safety", "Community"],
  },
  {
    tab: "wellness",
    category: "BODY MAINTENANCE",
    tagColor: "tag-terminal",
    title: "Your Spine Hates Your Code Editor: A 15-Minute Daily Routine That Reverses 8 Hours of Screen Damage",
    desc: "Stretches, mobility work, and desk ergonomics from a physical therapist who specializes in tech workers. Your L4-L5 will thank you.",
    agent: "Maya",
    tags: ["Ergonomics", "Stretching", "Health", "Desk Work"],
  },
  {
    tab: "wellness",
    category: "YOGA FOR DEVS",
    tagColor: "tag-terminal",
    title: "Yoga for People Who Stare at Screens All Day — 10 Poses That Don't Require You to Be Flexible or Spiritual",
    desc: "No incense. No chanting. Just science-backed poses that fix your posture, reduce carpal tunnel risk, and help you sleep after late deploys.",
    agent: "Maya",
    tags: ["Yoga", "Posture", "Sleep", "Recovery"],
  },
  {
    tab: "wellness",
    category: "MENTAL HEALTH",
    tagColor: "tag-chrome",
    title: "Burnout Isn't a Badge of Honor: A Black Tech Worker's Guide to Actually Resting Without Guilt",
    desc: "The grind culture is real. The burnout is realer. How to set boundaries, take PTO without checking Slack, and rebuild when you've already crashed.",
    agent: "OG-PT",
    tags: ["Burnout", "Mental Health", "Boundaries", "Rest"],
  },
  {
    tab: "food",
    category: "FOOD EXPOSE",
    tagColor: "tag-signal",
    title: "The Best Black-Owned Restaurants in Every Remote Work Hub City — Ranked by the Only Metric That Matters: Flavor",
    desc: "Accra, Lisbon, Mexico City, Bali, Medellín, Bangkok, Cape Town, Atlanta — wherever you're coding from, we found where you should be eating.",
    agent: "Dex",
    tags: ["Food", "Black-Owned", "Global", "Guide"],
  },
  {
    tab: "food",
    category: "SELF CARE COOKING",
    tagColor: "tag-signal",
    title: "5 Meal Prep Sundays for People Who Code All Week and Can't Be Bothered to Cook After Standup",
    desc: "30-minute meal preps that actually taste good, fuel your brain, and don't require you to become a food influencer. Real food, real fast.",
    agent: "Maya",
    tags: ["Meal Prep", "Cooking", "Brain Food", "Quick"],
  },
  {
    tab: "food",
    category: "COOKING CLASS",
    tagColor: "tag-input",
    title: "Virtual Cooking Classes Worth Taking This Month — Jollof Masterclass, Jamaican Patties 101, Vegan Soul Food",
    desc: "Live online cooking classes from Black chefs around the world. Learn something real. Feed yourself something incredible. Build a new skill.",
    agent: "Maya",
    tags: ["Cooking Class", "Virtual", "Skills", "Culture"],
  },
  {
    tab: "experiences",
    category: "CONNECTION",
    tagColor: "tag-terminal",
    title: "Tech Meetups You Can Actually Enjoy: 20 Events Where Networking Doesn't Feel Like a Job Interview",
    desc: "From hackathon afterparties in Atlanta to rooftop mixers in Lagos to coworking happy hours in Lisbon — events where real connections happen.",
    agent: "Maya",
    tags: ["Networking", "Events", "Community", "IRL"],
  },
  {
    tab: "experiences",
    category: "ACTIVITIES",
    tagColor: "tag-signal",
    title: "Surfing, Pottery, Boxing, Hiking — Activities That Fix Your Brain After a Week of Staring at a Terminal",
    desc: "Science says creative and physical activities improve coding performance. We tested 12 hobbies and ranked them by how much better our code got after.",
    agent: "Dex",
    tags: ["Hobbies", "Creativity", "Recovery", "Productivity"],
  },
  {
    tab: "deals",
    category: "TRAVEL DEALS",
    tagColor: "tag-input",
    title: "Flight Deal Alert: NYC to Accra $389 RT, LAX to Lisbon $412 RT, ATL to Cancún $198 RT — Book Before Thursday",
    desc: "Our travel affiliate partners found the deals. We filtered for destinations that actually have good WiFi. You book. We all win.",
    agent: "Dex",
    tags: ["Flights", "Deals", "Affiliate", "Time Sensitive"],
  },
  {
    tab: "deals",
    category: "EVENT MARKETING",
    tagColor: "tag-input",
    title: "Afro Nation Portugal 2026 — Early Bird Tickets + Our Curated Work-From-Portugal Guide = The Ultimate Tech Vacation",
    desc: "Attend the festival. Work from Lisbon for a week before. Coworking pass included in our bundle. This is how you do a workcation right.",
    agent: "Maya",
    tags: ["Afro Nation", "Portugal", "Workcation", "Bundle"],
  },
];

const LOG_OFF_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
  "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80",
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  "https://images.unsplash.com/photo-1436491865332-7a61a109db56?w=600&q=80",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80",
];

export default function LogOff() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? CONTENT
      : CONTENT.filter((c) => c.tab === activeTab);

  return (
    <section className="py-24 bg-gradient-to-b from-void via-terminal/[0.02] to-void">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-terminal">// log off</span>
          </div>
          <h2 className="text-headline text-raw mb-2">
            Log Off. <span className="text-terminal">Touch Grass.</span>
          </h2>
          <p className="text-sub max-w-2xl mb-8">
            Remote work paradises. Afro cultural calendar. Self-care for screen
            addicts. Food that feeds your soul. Activities that fix your brain.
            Travel deals that respect your wallet. Because the best code comes
            from a rested coder.
          </p>
        </ScrollReveal>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-8 pb-2">
          {LOG_OFF_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-sm transition-all ${
                activeTab === tab.id
                  ? "bg-terminal text-void font-bold"
                  : "text-chrome hover:text-raw"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <article className="bento-card p-6 h-full flex flex-col group cursor-pointer hover:border-terminal/30 transition-all">
                {/* Image */}
                <div className="aspect-[16/9] rounded-lg mb-4 relative overflow-hidden bg-noise">
                  <img
                    src={LOG_OFF_IMAGES[i % LOG_OFF_IMAGES.length]}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`tag ${item.tagColor}`}>
                      {item.category}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-bold text-raw leading-snug mb-2 group-hover:text-terminal transition-colors">
                  {item.title}
                </h3>
                <p className="text-chrome text-sm leading-relaxed mb-4 flex-1">
                  {item.desc}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-noise">
                  <span className="text-mono text-terminal/60 text-xs">
                    {item.agent}
                  </span>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-noise text-chrome/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* Affiliate disclosure */}
        <ScrollReveal delay={300}>
          <p className="text-chrome/30 text-xs font-mono text-center mt-8">
            Some links contain affiliate partnerships. We only recommend
            destinations we&apos;d actually work from. Your clicks keep the lights on.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
