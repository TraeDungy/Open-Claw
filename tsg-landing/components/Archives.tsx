"use client";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

type Tab = "studies" | "individuals" | "schools" | "timeline";

const studies = [
  {
    title: "The Rhine Experiments (1930s–1960s)",
    org: "Duke University, Parapsychology Lab",
    summary: "Dr. J.B. Rhine conducted thousands of Zener card trials measuring extrasensory perception and psychokinesis. Published in the Journal of Parapsychology, his statistical analysis showed deviations from chance at p < 0.001 across 90,000+ trials.",
    year: "1934–1965",
    tag: "Foundational",
  },
  {
    title: "The Princeton Engineering Anomalies Research (PEAR)",
    org: "Princeton University",
    summary: "Robert Jahn and Brenda Dunne ran 28 years of random event generator (REG) experiments. Operators attempted to mentally influence electronic noise. Across 2.5 million trials, results deviated from chance with odds against chance of 1 in 5,000.",
    year: "1979–2007",
    tag: "Landmark",
  },
  {
    title: "Global Consciousness Project",
    org: "Institute of Noetic Sciences / Princeton",
    summary: "Network of 70+ REG devices worldwide monitoring for coherence during major global events. Data from 9/11, tsunamis, and elections show statistically significant deviations (p = 0.001) correlated with collective human attention.",
    year: "1998–Present",
    tag: "Active",
  },
  {
    title: "Stargate Project — Remote Viewing",
    org: "Stanford Research Institute / U.S. Government (CIA, DIA)",
    summary: "20-year classified U.S. military program investigating remote viewing for intelligence gathering. Declassified in 1995. Statistician Jessica Utts concluded the phenomenon was statistically robust. Program spent $20M over two decades.",
    year: "1975–1995",
    tag: "Declassified",
  },
  {
    title: "The Ganzfeld Experiments",
    org: "Multiple Universities",
    summary: "Meta-analysis of ganzfeld telepathy experiments across 88 studies showed a hit rate of 32% vs. 25% expected by chance. Daryl Bem and Charles Honorton published results in Psychological Bulletin (APA journal), achieving p < 0.00000001.",
    year: "1974–2010",
    tag: "Meta-Analysis",
  },
  {
    title: "Helmut Schmidt's RNG Experiments",
    org: "Boeing Research / Mind Science Foundation",
    summary: "Physicist Helmut Schmidt used radioactive decay-based random number generators. Subjects attempted to influence binary outcomes. Published results showed consistent 1–2% deviation from chance across millions of trials.",
    year: "1970–1993",
    tag: "Physics-Based",
  },
];

const individuals = [
  {
    name: "Nina Kulagina",
    era: "1960s–1980s",
    origin: "Soviet Union",
    bio: "Russian woman extensively studied by Soviet scientists for apparent psychokinetic abilities. Filmed moving small objects, compass needles, and separating egg yolk from white inside a sealed container. Over 60 scientists witnessed her demonstrations. Electroencephalograms showed unusual brain wave patterns during events.",
    notable: "Filmed by Soviet Academy of Sciences; heart rate exceeded 240 BPM during demonstrations",
  },
  {
    name: "Uri Geller",
    era: "1970s–Present",
    origin: "Israel",
    bio: "Most publicly known psychic claimant. Tested at Stanford Research Institute by physicists Russell Targ and Hal Puthoff. Results published in Nature (1974). Demonstrated apparent metal bending and remote viewing under controlled conditions, though controversy surrounds replication.",
    notable: "Published in Nature; Tested at SRI; Subject of decades of scientific debate",
  },
  {
    name: "Ingo Swann",
    era: "1970s–2013",
    origin: "United States",
    bio: "Artist and psychic researcher who co-developed the remote viewing protocol used in the Stargate Project. Demonstrated measurable effects on a shielded magnetometer at Stanford. His protocols became the U.S. military's standard Coordinate Remote Viewing methodology.",
    notable: "Co-creator of Coordinate Remote Viewing; ASPR magnetometer experiments",
  },
  {
    name: "Ted Serios",
    era: "1960s",
    origin: "United States",
    bio: "Chicago bellhop studied by psychiatrist Dr. Jule Eisenbud for 'thoughtography' — apparently projecting mental images onto Polaroid film. Over 1,000 images produced under controlled conditions. Eisenbud published 'The World of Ted Serios' documenting the research.",
    notable: "Published case study in book form; hundreds of witnessed sessions",
  },
  {
    name: "Zhang Baosheng",
    era: "1980s–1990s",
    origin: "China",
    bio: "Chinese national studied by the Chinese Academy of Sciences as part of their Exceptional Human Functions research program. Demonstrated apparent ability to move small objects through sealed containers. Studied under controlled laboratory conditions for over a decade.",
    notable: "Subject of Chinese government research program; Academy of Sciences studies",
  },
  {
    name: "Eusapia Palladino",
    era: "1880s–1910s",
    origin: "Italy",
    bio: "Italian medium studied by Nobel laureates Pierre and Marie Curie, criminologist Cesare Lombroso, and astronomer Camille Flammarion. Despite some caught fraud, controlled séances at the Institut Général Psychologique in Paris over 3 years produced phenomena researchers could not explain.",
    notable: "Studied by multiple Nobel laureates; Institut Général Psychologique 43-session study",
  },
];

const schools = [
  {
    name: "Qigong — External Qi Emission",
    origin: "China",
    era: "2,000+ years",
    desc: "Chinese energy cultivation practice. 'Wai Qi' (external qi) practitioners claim to project energy to heal or move objects. Beijing's Qigong Research Institute documented measurable infrared radiation changes. Thousands of clinical studies in Chinese medical journals.",
  },
  {
    name: "Siddhi Practices — Yoga Sutras",
    origin: "India",
    era: "~400 CE",
    desc: "Patanjali's Yoga Sutras describe 'siddhis' (supernatural powers) achievable through deep meditation: levitation (laghima), telekinesis, and clairvoyance. The Maharishi Effect studies at Maharishi International University tested group meditation effects on crime statistics.",
  },
  {
    name: "Tibetan Tummo Meditation",
    origin: "Tibet / Himalaya",
    era: "1,000+ years",
    desc: "Monks demonstrate measurable control over autonomic functions — raising skin temperature by 8°C, drying wet sheets in freezing conditions. Harvard's Herbert Benson documented this in Himalayan monasteries. Suggests mind-body influence beyond known mechanisms.",
  },
  {
    name: "The Society for Psychical Research (SPR)",
    origin: "United Kingdom",
    era: "1882–Present",
    desc: "Founded at Cambridge by Henry Sidgwick, Frederic Myers, and Edmund Gurney. Oldest organization dedicated to scientific study of psi phenomena. Published the Proceedings of the SPR continuously for 140+ years. Members included William James, Arthur Balfour, and Oliver Lodge.",
  },
  {
    name: "The Rhine Research Center",
    origin: "United States",
    era: "1935–Present",
    desc: "Continuation of J.B. Rhine's Duke University lab. Operates the oldest parapsychology laboratory in the world. Conducts ongoing research into psychokinesis, precognition, and remote viewing using modern methodologies including fMRI and EEG monitoring.",
  },
  {
    name: "Koestler Parapsychology Unit",
    origin: "University of Edinburgh, Scotland",
    era: "1985–Present",
    desc: "Academic parapsychology unit at a major research university. Founded with a bequest from Arthur Koestler. Conducts ganzfeld, precognition, and psychokinesis experiments. Publishes in peer-reviewed psychology journals.",
  },
  {
    name: "The Monroe Institute — Hemi-Sync",
    origin: "United States",
    era: "1974–Present",
    desc: "Founded by Robert Monroe. Uses binaural beat audio technology (Hemi-Sync) to induce altered states of consciousness. The U.S. Army's classified Gateway Process report investigated their techniques for remote viewing and out-of-body experiences.",
  },
  {
    name: "Institute of Noetic Sciences (IONS)",
    origin: "United States",
    era: "1973–Present",
    desc: "Founded by Apollo 14 astronaut Edgar Mitchell after his moon mission experience. Conducts research on consciousness, healing intention, and interconnectedness. Dean Radin's double-slit experiment variations there suggest consciousness may influence quantum events.",
  },
  {
    name: "The Silva Method (Silva Mind Control)",
    origin: "United States / Mexico",
    era: "1966–Present",
    desc: "Created by José Silva in Laredo, Texas. Teaches controlled alpha and theta brainwave states for enhanced intuition, healing visualization, and psychic functioning. Over 6 million graduates in 110 countries. The program's remote viewing and 'mental screen' techniques parallel military protocols. Research published in the Journal of the Silva Method.",
  },
  {
    name: "HeartMath Institute",
    origin: "United States",
    era: "1991–Present",
    desc: "Researches heart-brain coherence and its effects on intuition and non-local awareness. Published studies showing the heart responds to future events 4–7 seconds before they occur. Their Random Event Generator data shows heart coherence correlates with device output changes.",
  },
  {
    name: "University of Virginia — DOPS",
    origin: "United States",
    era: "1967–Present",
    desc: "Division of Perceptual Studies, founded by Dr. Ian Stevenson. Academic department at a top university researching reincarnation memories, near-death experiences, and psychokinesis. Maintains a database of 2,500+ investigated cases of children claiming past-life memories.",
  },
];

const timeline = [
  { year: "~500 BCE", event: "Patanjali's Yoga Sutras codify siddhi powers including telekinesis as achievable through meditation" },
  { year: "~200 CE", event: "Tibetan Buddhist traditions document tummo heat generation and levitation practices" },
  { year: "1026", event: "Ibn al-Haytham (Alhazen) writes on perception and consciousness in the Book of Optics" },
  { year: "1882", event: "Society for Psychical Research founded at Cambridge University" },
  { year: "1895", event: "Eusapia Palladino studied in controlled séances across Europe" },
  { year: "1930", event: "J.B. Rhine begins Zener card experiments at Duke University" },
  { year: "1934", event: "Rhine publishes 'Extra-Sensory Perception' — field of parapsychology formally established" },
  { year: "1960s", event: "Nina Kulagina filmed by Soviet Academy of Sciences demonstrating PK" },
  { year: "1972", event: "SRI begins testing Ingo Swann and Uri Geller; CIA takes interest" },
  { year: "1974", event: "Targ & Puthoff publish remote viewing results in Nature" },
  { year: "1966", event: "José Silva publishes the Silva Mind Control Method — alpha/theta brainwave training for intuition and psychic functioning" },
  { year: "1975", event: "Stargate Project begins — U.S. military remote viewing program" },
  { year: "1979", event: "PEAR Lab opens at Princeton University under Robert Jahn" },
  { year: "1986", event: "Chinese Academy of Sciences studies Zhang Baosheng's PK abilities" },
  { year: "1995", event: "Stargate Project declassified; statistician Jessica Utts confirms statistical validity" },
  { year: "1998", event: "Global Consciousness Project begins — 70+ REG devices worldwide" },
  { year: "2003", event: "U.S. Army Gateway Process report declassified — Monroe Institute techniques documented" },
  { year: "2007", event: "PEAR Lab closes after 28 years; 2.5 million trials completed" },
  { year: "2011", event: "Daryl Bem publishes precognition results in Journal of Personality and Social Psychology" },
  { year: "2014", event: "Dean Radin publishes consciousness-influenced double-slit experiment results at IONS" },
  { year: "2023", event: "Renewed academic interest — University of Virginia DOPS continues consciousness research" },
];

export default function Archives() {
  const [activeTab, setActiveTab] = useState<Tab>("studies");

  const tabs: { id: Tab; label: string }[] = [
    { id: "studies", label: "STUDIES" },
    { id: "individuals", label: "KNOWN SUBJECTS" },
    { id: "schools", label: "SCHOOLS & INSTITUTES" },
    { id: "timeline", label: "TIMELINE" },
  ];

  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-xs tracking-[0.3em] text-ember">THE ARCHIVES</p>
          <h2 className="mt-2 text-4xl font-bold uppercase md:text-5xl">Research &amp; Records</h2>
          <p className="mt-3 max-w-2xl text-bone/60">
            1,000 years of documented inquiry into the boundaries of human perception and influence.
            Peer-reviewed studies, declassified programs, and traditions spanning civilizations.
          </p>
        </ScrollReveal>

        {/* Tab bar */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-bone/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-lg px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] transition ${
                activeTab === tab.id
                  ? "bg-signal/10 text-signal border-b-2 border-signal"
                  : "text-bone/40 hover:text-bone/70 hover:bg-bone/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-8">
          {/* Studies */}
          {activeTab === "studies" && (
            <div className="grid gap-4 md:grid-cols-2">
              {studies.map((study) => (
                <ScrollReveal key={study.title}>
                  <div className="group rounded-xl border border-bone/10 bg-black/30 p-5 transition hover:border-signal/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${
                          study.tag === "Active" ? "bg-pulse/10 text-pulse" :
                          study.tag === "Declassified" ? "bg-hazard/10 text-hazard" :
                          study.tag === "Landmark" ? "bg-ember/10 text-ember" :
                          "bg-signal/10 text-signal"
                        }`}>{study.tag}</span>
                        <h3 className="mt-2 text-lg font-bold">{study.title}</h3>
                      </div>
                      <p className="text-xs text-bone/30 whitespace-nowrap">{study.year}</p>
                    </div>
                    <p className="mt-1 text-[11px] tracking-wider text-ember/70">{study.org}</p>
                    <p className="mt-3 text-sm leading-relaxed text-bone/60">{study.summary}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Individuals */}
          {activeTab === "individuals" && (
            <div className="grid gap-4 md:grid-cols-2">
              {individuals.map((person) => (
                <ScrollReveal key={person.name}>
                  <div className="group rounded-xl border border-bone/10 bg-black/30 p-5 transition hover:border-signal/30">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold">{person.name}</h3>
                      <p className="text-xs text-bone/30 whitespace-nowrap">{person.era}</p>
                    </div>
                    <p className="text-[11px] tracking-wider text-ember/70">{person.origin}</p>
                    <p className="mt-3 text-sm leading-relaxed text-bone/60">{person.bio}</p>
                    <p className="mt-3 text-[11px] text-signal/60">
                      <span className="text-signal/40">Notable:</span> {person.notable}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Schools */}
          {activeTab === "schools" && (
            <div className="grid gap-4 md:grid-cols-2">
              {schools.map((school) => (
                <ScrollReveal key={school.name}>
                  <div className="group rounded-xl border border-bone/10 bg-black/30 p-5 transition hover:border-signal/30">
                    <h3 className="text-lg font-bold">{school.name}</h3>
                    <div className="mt-1 flex gap-3 text-[11px]">
                      <span className="tracking-wider text-ember/70">{school.origin}</span>
                      <span className="text-bone/30">{school.era}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-bone/60">{school.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Timeline */}
          {activeTab === "timeline" && (
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-signal/30 via-signal/15 to-transparent" />

              <div className="space-y-6">
                {timeline.map((entry, i) => (
                  <ScrollReveal key={i} delay={Math.min(i % 4 + 1, 5) as 1|2|3|4|5}>
                    <div className="relative flex gap-4">
                      {/* Dot */}
                      <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-signal/50 bg-void" />

                      <div>
                        <p className="text-xs font-bold text-ember">{entry.year}</p>
                        <p className="mt-1 text-sm text-bone/70 leading-relaxed">{entry.event}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-16 rounded-xl border border-bone/5 bg-black/20 p-6 text-center">
          <p className="text-xs text-bone/30 leading-relaxed max-w-2xl mx-auto">
            This archive presents documented research and historical records for educational purposes.
            The Telekinesis Support Group does not make supernatural claims.
            We believe in rigorous experimentation, open inquiry, and the scientific method.
            <br /><span className="text-bone/50">No claims. No promises. Just show up and pay attention.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
