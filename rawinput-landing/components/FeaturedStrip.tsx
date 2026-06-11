"use client";
import ScrollReveal from "./ScrollReveal";

const FEATURED = [
  {
    agent: "Maya",
    section: "Who Trained You?",
    headline:
      "This Sister Built a Whole AI Startup While on Maternity Leave and I Can't Even Remember to Water My Plants",
    tag: "creators",
    tagColor: "tag-input",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
  },
  {
    agent: "Dex",
    section: "Task Failed Successfully",
    headline:
      "Asked AI to Generate a 'Professional Headshot' and It Gave Me 7 Fingers and the Confidence of a Man Who Lies on His Resume",
    tag: "comedy",
    tagColor: "tag-signal",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
  },
  {
    agent: "OG-PT",
    section: "BLACKBOX",
    headline:
      "Facial Recognition Still Can't Tell Us Apart But It's 99.7% Accurate on White Faces. The Algorithm Isn't Broken — It Was Built This Way",
    tag: "deep dive",
    tagColor: "tag-chrome",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  },
];

export default function FeaturedStrip() {
  return (
    <section className="py-20 bg-gradient-to-b from-void via-static to-void">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-terminal">// trending now</span>
          </div>
          <h2 className="text-headline text-raw mb-10">Fresh Off the Press</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED.map((item, i) => (
            <ScrollReveal key={i} delay={i * 120}>
              <article className="group cursor-pointer">
                <div className="aspect-[16/10] rounded-lg mb-4 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.headline}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`tag ${item.tagColor}`}>{item.tag}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-mono text-input text-xs">
                    {item.agent}
                  </span>
                  <span className="text-chrome/30">|</span>
                  <span className="text-mono text-chrome/60 text-xs">
                    {item.section}
                  </span>
                </div>

                <h3 className="font-heading text-lg md:text-xl font-bold text-raw leading-tight group-hover:text-input transition-colors">
                  {item.headline}
                </h3>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
