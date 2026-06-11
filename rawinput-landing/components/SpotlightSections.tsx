"use client";
import ScrollReveal from "./ScrollReveal";

const FEMALE_CREATORS = [
  {
    name: "Timnit Gebru",
    role: "AI Ethics Researcher",
    org: "DAIR Institute",
    desc: "Founded the Distributed AI Research Institute after leaving Google. Leading voice on AI bias and its impact on marginalized communities.",
  },
  {
    name: "Joy Buolamwini",
    role: "Algorithmic Justice Researcher",
    org: "MIT Media Lab / AJL",
    desc: "Founded the Algorithmic Justice League. Her research on facial recognition bias changed federal policy. Poet. Scientist. Problem solver.",
  },
  {
    name: "Rediet Abebe",
    role: "Computer Scientist",
    org: "UC Berkeley",
    desc: "Co-founded Mechanism Design for Social Good. Using algorithms and AI to address inequality in housing, healthcare, and education.",
  },
  {
    name: "Brandeis Marshall",
    role: "Data Scientist + Author",
    org: "DataedX Group",
    desc: "Author of 'Data Conscience.' Building frameworks for responsible data practices that center community impact over corporate profit.",
  },
];

const INTERNATIONAL = [
  {
    name: "Moustapha Cissé",
    location: "Accra, Ghana",
    flag: "GH",
    role: "AI Research Lead",
    desc: "Founded Google AI's first Africa lab. Building ML infrastructure for the continent's unique challenges — from agriculture to healthcare.",
  },
  {
    name: "Vukosi Marivate",
    location: "Pretoria, South Africa",
    flag: "ZA",
    role: "Data Science Chair",
    desc: "Leading NLP research for African languages at University of Pretoria. Because AI shouldn't only understand English.",
  },
  {
    name: "Adji Bousso Dieng",
    location: "New York / Dakar",
    flag: "SN",
    role: "Princeton Professor",
    desc: "Founded the Africa in AI community. Pioneering deep generative models. Senegalese-born, globally impactful.",
  },
  {
    name: "Shakir Mohamed",
    location: "London, UK",
    flag: "ZA",
    role: "DeepMind Research Director",
    desc: "South African leading AI research at DeepMind. Co-wrote the foundational paper on decolonizing AI. Theory meets practice.",
  },
];

const CARIBBEAN = [
  {
    name: "Shelly-Ann Daley",
    location: "Kingston, Jamaica",
    flag: "JM",
    role: "EdTech Founder",
    desc: "Building AI-powered learning tools designed for Caribbean students. Patois-aware NLP. Education that sounds like home.",
  },
  {
    name: "Keron Rose",
    location: "Port of Spain, Trinidad",
    flag: "TT",
    role: "Digital Marketing + AI",
    desc: "Training Caribbean entrepreneurs to use AI tools for business growth. Author, speaker, and the region's go-to AI strategist.",
  },
  {
    name: "Kavell Joseph",
    location: "Bridgetown, Barbados",
    flag: "BB",
    role: "Blockchain + AI Developer",
    desc: "Building decentralized AI systems for Caribbean financial inclusion. Smart contracts meet island innovation.",
  },
  {
    name: "Ayanna Howard",
    location: "Atlanta / Jamaica heritage",
    flag: "JM",
    role: "Roboticist + Dean",
    desc: "Dean of Engineering at Ohio State. Jamaican heritage. Her robots help children with disabilities. NASA veteran. The real deal.",
  },
];

function SpotlightCard({
  person,
  accent = "input",
}: {
  person: {
    name: string;
    role: string;
    desc: string;
    location?: string;
    flag?: string;
    org?: string;
  };
  accent?: string;
}) {
  const borderColor =
    accent === "input"
      ? "border-input/20 hover:border-input/50"
      : accent === "terminal"
        ? "border-terminal/20 hover:border-terminal/50"
        : "border-signal/20 hover:border-signal/50";

  const accentColor =
    accent === "input"
      ? "text-input"
      : accent === "terminal"
        ? "text-terminal"
        : "text-signal";

  return (
    <div
      className={`bento-card p-6 border ${borderColor} transition-all cursor-pointer group`}
    >
      {/* Avatar placeholder */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-noise flex items-center justify-center font-heading text-lg font-bold text-chrome">
          {person.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h4 className="font-heading font-bold text-raw text-lg group-hover:text-input transition-colors">
            {person.name}
          </h4>
          <p className={`text-mono text-xs ${accentColor}`}>{person.role}</p>
        </div>
      </div>
      {person.location && (
        <p className="text-chrome/60 text-xs mb-2 font-mono">
          {person.flag} {person.location}
        </p>
      )}
      {person.org && (
        <p className="text-chrome/60 text-xs mb-2 font-mono">{person.org}</p>
      )}
      <p className="text-chrome text-sm leading-relaxed">{person.desc}</p>
    </div>
  );
}

export default function SpotlightSections() {
  return (
    <>
      {/* ── FEMALE CREATORS ── */}
      <section className="py-24 bg-gradient-to-b from-void via-input/[0.03] to-void">
        <div className="container-wide">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <span className="tag tag-input">// her input</span>
            </div>
            <h2 className="text-headline text-raw mb-2">
              Women Leading the Algorithm
            </h2>
            <p className="text-sub max-w-2xl mb-12">
              The women building, breaking, and reshaping AI. Researchers.
              Founders. Engineers. The ones who see what the models miss.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEMALE_CREATORS.map((person, i) => (
              <ScrollReveal key={person.name} delay={i * 100}>
                <SpotlightCard person={person} accent="input" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERNATIONAL CREATORS ── */}
      <section className="py-24 bg-gradient-to-b from-void via-terminal/[0.03] to-void">
        <div className="container-wide">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <span className="tag tag-terminal">// the diaspora</span>
            </div>
            <h2 className="text-headline text-raw mb-2">
              Global Black Tech. No Borders.
            </h2>
            <p className="text-sub max-w-2xl mb-12">
              From Accra to London to Pretoria — the international creators and
              researchers pushing AI forward across the diaspora.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTERNATIONAL.map((person, i) => (
              <ScrollReveal key={person.name} delay={i * 100}>
                <SpotlightCard person={person} accent="terminal" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARIBBEAN CREATORS ── */}
      <section className="py-24 bg-gradient-to-b from-void via-signal/[0.03] to-void">
        <div className="container-wide">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <span className="tag tag-signal">// island input</span>
            </div>
            <h2 className="text-headline text-raw mb-2">
              Caribbean Innovation. Island Built.
            </h2>
            <p className="text-sub max-w-2xl mb-12">
              From Kingston to Port of Spain to Bridgetown — the Caribbean tech
              builders proving innovation doesn&apos;t need a Silicon Valley zip code.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CARIBBEAN.map((person, i) => (
              <ScrollReveal key={person.name} delay={i * 100}>
                <SpotlightCard person={person} accent="signal" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
