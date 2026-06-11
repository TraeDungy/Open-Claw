"use client";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const SECTIONS = [
  {
    title: "Who Trained You?",
    desc: "Creator spotlights. Profiles. Studio tours. The builders.",
    tag: "creators",
    tabId: "all",
    tagColor: "tag-input",
    span: "md:col-span-2 md:row-span-2",
    size: "large",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
  },
  {
    title: "Task Failed Successfully",
    desc: "AI fails. Cursed outputs. Tech bloopers. Screenshot hall of fame.",
    tag: "comedy",
    tabId: "comedy",
    tagColor: "tag-signal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&q=80",
  },
  {
    title: "The Unsupervised",
    desc: "Hot takes. Predictions. Rants. Letters to the algorithm.",
    tag: "editorial",
    tabId: "deep-dives",
    tagColor: "tag-terminal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80",
  },
  {
    title: "BLACKBOX",
    desc: "Deep dives into AI ethics, bias, power, and who really owns the data.",
    tag: "investigation",
    tabId: "deep-dives",
    tagColor: "tag-chrome",
    span: "md:row-span-2",
    size: "tall",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80",
  },
  {
    title: "Root Access",
    desc: "Jobs. Contracts. Grants. Freelance. Who's actually hiring.",
    tag: "opportunities",
    tabId: "jobs",
    tagColor: "tag-terminal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80",
  },
  {
    title: "Fork It",
    desc: "Open source repos. Free tools. Diaspora dev spotlight. Starter kits.",
    tag: "resources",
    tabId: "directory",
    tagColor: "tag-signal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
  },
  {
    title: "The Ticker",
    desc: "Comedian commentary on Polymarket bets, crypto, and your cousin's portfolio.",
    tag: "markets",
    tabId: "the-bag",
    tagColor: "tag-input",
    span: "md:col-span-2",
    size: "wide",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  },
  {
    title: "The Scoreboard",
    desc: "Tech-related sports only. Athletes x AI. Wearables. Fantasy x ML.",
    tag: "sports-tech",
    tabId: "scoreboard",
    tagColor: "tag-terminal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1461896836934-ber8fca5eab0?w=400&q=80",
  },
  {
    title: "City Mode",
    desc: "ATL. NYC. LA. DMV. Houston. Detroit. London. Lagos. Your city's tech scene.",
    tag: "local",
    tabId: "your-city",
    tagColor: "tag-signal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80",
  },
  {
    title: "Recession Proof",
    desc: "Side hustles. Bootstrap chronicles. Free money. The audit — real receipts.",
    tag: "money",
    tabId: "the-bag",
    tagColor: "tag-input",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
  },
  {
    title: "The Break Room",
    desc: "Daily jokes. Meme lab. GIF wars. Would you rather. Water cooler energy.",
    tag: "daily",
    tabId: "break-room",
    tagColor: "tag-signal",
    span: "md:col-span-2",
    size: "wide",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80",
  },
  {
    title: "The Manual",
    desc: "AI 101. Prompt engineering. Tool reviews. Interview prep. No gatekeeping.",
    tag: "learn",
    tabId: "learn",
    tagColor: "tag-chrome",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
  },
  {
    title: "The Wire",
    desc: "AI news with no fluff. Policy watch. Corporate decoder. Startup radar.",
    tag: "news",
    tabId: "breaking",
    tagColor: "tag-input",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=400&q=80",
  },
  {
    title: "Plug & Play",
    desc: "Website flips. Template market. SaaS showcase. Domain graveyard. App drops.",
    tag: "marketplace",
    tabId: "marketplace",
    tagColor: "tag-terminal",
    span: "",
    size: "small",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
  },
];

export default function BentoGrid() {
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
          <p className="text-sub max-w-2xl mb-12">
            14 verticals. 70+ sub-categories. Updated daily by AI loops that
            never sleep. Browse the full index or let the algorithm surprise you.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
          {SECTIONS.map((section, i) => (
            <div key={section.title} className={section.span}>
              <ScrollReveal delay={i * 60} className="h-full">
                <Link
                  href={`/index-page?tab=${section.tabId}`}
                  className="bento-card block h-full p-0 overflow-hidden group cursor-pointer relative"
                >
                  {/* Background image */}
                  <img
                    src={section.image}
                    alt={section.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/40" />

                  {/* Content */}
                  <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
                    <div>
                      <span className={`tag ${section.tagColor} mb-4`}>
                        {section.tag}
                      </span>
                      <h3
                        className={`font-heading font-bold text-raw mb-2 group-hover:text-input transition-colors ${
                          section.size === "large"
                            ? "text-3xl md:text-5xl"
                            : section.size === "wide"
                              ? "text-2xl md:text-3xl"
                              : section.size === "tall"
                                ? "text-2xl md:text-4xl"
                                : "text-xl md:text-2xl"
                        }`}
                      >
                        {section.title}
                      </h3>
                    </div>
                    <p className="text-chrome text-sm leading-relaxed mt-auto pt-4">
                      {section.desc}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
