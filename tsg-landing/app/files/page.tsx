"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "@/components/ParticleField";
import Footer from "@/components/Footer";

type Tab = "declassified" | "studies" | "individuals" | "schools" | "timeline" | "media";

/* ────────────────────────────────────────────────────────────
   DATA — Declassified Government Files
   ──────────────────────────────────────────────────────────── */
const declassified = [
  {
    title: "CIA Stargate Project — Full Collection",
    agency: "Central Intelligence Agency",
    year: "1975–1995 (Declassified 1995)",
    classification: "SECRET → DECLASSIFIED",
    summary: "Complete archive of the 20-year, $20 million U.S. government program investigating remote viewing for intelligence gathering. Contains 89,000+ pages including operational transcripts, training manuals, scientific evaluations, and mission reports. Subjects included Ingo Swann, Pat Price, Joseph McMoneagle, and others.",
    documents: [
      { label: "CIA Reading Room — Full Stargate Collection (12,000+ docs)", url: "https://www.cia.gov/readingroom/collection/stargate" },
      { label: "Final AIR Evaluation Report (1995)", url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00789R003100030001-4.pdf" },
      { label: "Jessica Utts Statistical Evaluation", url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00789R002200510001-2.pdf" },
    ],
    details: "Program operated under multiple codenames: SCANATE, GONDOLA WISH, GRILL FLAME, CENTER LANE, SUN STREAK, and finally STAR GATE. The American Institutes for Research evaluation in 1995 found a statistically significant effect with odds against chance of approximately 10^20 to 1. Dr. Jessica Utts (UC Davis) concluded: 'Using the standards applied to any other area of science, the case for psychic functioning has been scientifically proven.'",
  },
  {
    title: "U.S. Army Gateway Process Report",
    agency: "U.S. Army Intelligence and Security Command",
    year: "1983 (Declassified 2003)",
    classification: "CONFIDENTIAL → DECLASSIFIED",
    summary: "Lt. Col. Wayne McDonnell's comprehensive analysis of The Monroe Institute's Gateway Experience program for the U.S. Army. Describes techniques for achieving altered states of consciousness including out-of-body experiences, remote viewing, and interaction with non-physical reality.",
    documents: [
      { label: "Full Gateway Process Report (CIA Reading Room)", url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf" },
      { label: "Monroe Institute Gateway Voyage Description", url: "https://www.monroeinstitute.org/gateway-voyage" },
    ],
    details: "The report applies physics (holographic universe theory, quantum mechanics) to explain how consciousness can transcend space-time. It describes the brain as a 'holographic receptor' and consciousness as a vibratory pattern. The Army concluded the techniques were effective and recommended further research. Page 25 was famously missing from early releases — later recovered and released in 2021.",
  },
  {
    title: "MKUltra — Subproject Files on Psychic Research",
    agency: "Central Intelligence Agency",
    year: "1953–1973 (Partially Declassified 1977)",
    classification: "TOP SECRET → PARTIALLY DECLASSIFIED",
    summary: "CIA mind control program that included subprojects investigating psychic phenomena, ESP, and remote influence. Most files were ordered destroyed in 1973, but 20,000 pages survived in financial records discovered in 1977.",
    documents: [
      { label: "CIA MKUltra Collection", url: "https://www.cia.gov/readingroom/search/site/mkultra" },
      { label: "Senate Select Committee Report (1977)", url: "https://www.intelligence.senate.gov/sites/default/files/hearings/95mkultra.pdf" },
    ],
    details: "While primarily known for chemical experiments, several MKUltra subprojects explored psychic abilities. Subproject 136 studied ESP; Subproject 59 involved research at major universities. The full scope remains unknown due to the 1973 document destruction ordered by CIA Director Richard Helms.",
  },
  {
    title: "Project SCANATE — CIA Remote Viewing Origins",
    agency: "CIA / Stanford Research Institute",
    year: "1972 (Declassified 1995)",
    classification: "SECRET → DECLASSIFIED",
    summary: "The original CIA contract with Stanford Research Institute (SRI) to evaluate remote viewing. Physicist Hal Puthoff tested Ingo Swann's ability to describe distant locations using only geographic coordinates. Results convinced the CIA to fund the larger Stargate program.",
    documents: [
      { label: "SCANATE Initial Evaluation", url: "https://www.cia.gov/readingroom/document/cia-rdp96-00788r001900680001-7" },
    ],
    details: "In one notable test, Swann was given coordinates for a location he could not know — a secret NSA facility at Sugar Grove, West Virginia. His description of the site was so accurate that the NSA reportedly contacted the CIA demanding to know who had leaked classified information. No one had — Swann had 'viewed' it remotely.",
  },
  {
    title: "DIA Assessment — Soviet Psychotronic Research",
    agency: "Defense Intelligence Agency",
    year: "1972–1985 (Declassified 1998)",
    classification: "SECRET → DECLASSIFIED",
    summary: "DIA reports on Soviet Union research into psychokinesis, remote viewing, and psychotronic weapons. Documents that the USSR invested heavily in psi research during the Cold War, with dedicated institutes and military applications.",
    documents: [
      { label: "DIA Report: Soviet and Czechoslovakian Parapsychology Research", url: "https://www.dia.mil/FOIA/FOIA-Electronic-Reading-Room/" },
      { label: "Controlled Offensive Behavior — USSR (DIA Report)", url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00792R000400360003-0.pdf" },
    ],
    details: "The DIA reported that the Soviet Union maintained at least 20 research centers studying psychic phenomena, with annual funding estimated at $500 million (adjusted). Key programs included the Popov Group and research at the Institute for Problems of Information Transmission. Nina Kulagina's demonstrations were documented as part of this program.",
  },
  {
    title: "FBI — Psychic Research Files",
    agency: "Federal Bureau of Investigation",
    year: "Various (FOIA Released)",
    classification: "Various → RELEASED",
    summary: "FBI files on investigations involving psychic claims, including files on Uri Geller, psychic detectives used in investigations, and background checks on researchers.",
    documents: [
      { label: "FBI Vault — Extrasensory Perception", url: "https://vault.fbi.gov/extrasensory-perception" },
      { label: "FBI Vault — Uri Geller", url: "https://vault.fbi.gov/Uri%20Geller" },
    ],
    details: "The FBI's ESP file contains correspondence dating back to the 1950s regarding psychic claims. While the Bureau's official position remained skeptical, the files reveal serious internal discussions about potential applications.",
  },
  {
    title: "NSA — Parapsychology in Intelligence",
    agency: "National Security Agency",
    year: "1981 (Declassified)",
    classification: "SECRET → DECLASSIFIED",
    summary: "NSA report analyzing potential intelligence applications of parapsychology. Discusses remote viewing, telepathy, and precognition in the context of signals intelligence and national security.",
    documents: [
      { label: "NSA Parapsychology Report (via Black Vault)", url: "https://www.theblackvault.com/documentarchive/nsa-and-parapsychology/" },
    ],
    details: "The document reveals the NSA took psychic phenomena seriously enough to commission internal analysis of its potential impact on classified communications security.",
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Peer-Reviewed Studies
   ──────────────────────────────────────────────────────────── */
const studies = [
  {
    title: "The Rhine Experiments — Zener Card Trials",
    org: "Duke University Parapsychology Laboratory",
    year: "1934–1965",
    summary: "Over 90,000 trials of card guessing experiments. Published in the Journal of Parapsychology. Statistical deviations from chance at p < 0.001.",
    links: [
      { label: "Rhine Research Center — History", url: "https://www.rhine.org/what-we-do/research-history/" },
      { label: "Journal of Parapsychology (Duke)", url: "https://www.rhine.org/journal-of-parapsychology/" },
    ],
    details: "J.B. Rhine coined the term 'extrasensory perception' and created the first university-based parapsychology laboratory. His subject Hubert Pearce achieved a hit rate of 40% vs 20% expected by chance across 690 trials — odds against chance of approximately 22 billion to 1. Rhine's methods faced criticism but were progressively refined with increasingly rigorous controls.",
  },
  {
    title: "PEAR Lab — 28 Years of RNG Research",
    org: "Princeton University",
    year: "1979–2007",
    summary: "2.5 million trials across 28 years showed human operators could influence random event generators with odds against chance of 1 in 5,000. Founded by Robert Jahn, Dean of Engineering.",
    links: [
      { label: "PEAR Lab Final Report", url: "http://www.princeton.edu/~pear/" },
      { label: "ICRL — Successor Organization", url: "https://icrl.org/" },
    ],
    details: "The lab used electronic noise-based random event generators. Over 100 operators participated across 2.5 million trials. The combined deviation from chance, while small (approximately 1 part in 10,000), was statistically robust. Effect sizes were consistent across operators, time periods, and device types. Jahn noted: 'We don't understand the mechanism, but the data are incontrovertible.'",
  },
  {
    title: "Global Consciousness Project",
    org: "Institute of Noetic Sciences / Princeton",
    year: "1998–Present",
    summary: "Network of 70+ random event generators worldwide. Shows statistically significant coherence during major global events (9/11, tsunamis, elections). Cumulative p = 0.001.",
    links: [
      { label: "GCP Website — Live Data", url: "https://noosphere.princeton.edu/" },
      { label: "GCP Results — Event Database", url: "https://noosphere.princeton.edu/results.html" },
    ],
    details: "During the September 11, 2001 attacks, the network showed deviations beginning hours before the first plane struck, peaking during the events, and normalizing afterward. The cumulative deviation across 500+ tested events has odds against chance exceeding 1 in 1,000. Dr. Roger Nelson directed the project for over 20 years.",
  },
  {
    title: "Ganzfeld Meta-Analysis — Telepathy Under Controlled Conditions",
    org: "Multiple Universities",
    year: "1974–2010",
    summary: "88 studies across multiple labs showed 32% hit rate vs 25% expected. Published in Psychological Bulletin (APA). Combined odds against chance: p < 0.00000001.",
    links: [
      { label: "Bem & Honorton (1994) — Psychological Bulletin", url: "https://doi.org/10.1037/0033-2909.115.1.4" },
      { label: "Storm, Tressoldi & Di Risio (2010) — Meta-Analysis Update", url: "https://doi.org/10.1037/a0021524" },
    ],
    details: "The ganzfeld protocol places receivers in sensory deprivation (halved ping-pong balls over eyes, white noise) while a sender views a randomly selected target. Independent meta-analyses by both proponents and skeptics agreed on the hit rate; they disagreed on interpretation. Julie Milton and Richard Wiseman's critical review still found marginal significance.",
  },
  {
    title: "Bem's Precognition Experiments — 'Feeling the Future'",
    org: "Cornell University",
    year: "2011",
    summary: "Nine experiments with 1,000+ subjects published in Journal of Personality and Social Psychology. Eight of nine showed statistically significant evidence for precognition. Sparked massive replication debate.",
    links: [
      { label: "Original Paper — JPSP", url: "https://doi.org/10.1037/a0021524" },
    ],
    details: "Daryl Bem's paper reversed standard psychological protocols — instead of testing memory after exposure, subjects were tested before exposure. Results showed they responded to stimuli they hadn't yet seen. The paper's publication in a top APA journal created a crisis in psychology about statistical methods and replication, leading to the broader 'replication crisis' reforms.",
  },
  {
    title: "Dean Radin — Double-Slit Consciousness Experiments",
    org: "Institute of Noetic Sciences",
    year: "2012–2019",
    summary: "Variations on the famous double-slit experiment where human observation/intention appeared to collapse the wave function at a distance. Published in Physics Essays.",
    links: [
      { label: "Radin et al. (2012) — Physics Essays", url: "https://doi.org/10.4006/0836-1398-25.2.157" },
      { label: "IONS Research Overview", url: "https://noetic.org/research/" },
    ],
    details: "Subjects focused attention toward a double-slit optical apparatus in a shielded room. When attention was directed at the slits, the interference pattern shifted as if observation occurred — at a distance, through walls, with no physical interaction. Six experiments replicated the effect. Control conditions showed no deviation. If confirmed, this suggests consciousness interacts with quantum mechanics.",
  },
  {
    title: "Helmut Schmidt — Radioactive Decay RNG Experiments",
    org: "Boeing Research / Mind Science Foundation",
    year: "1970–1993",
    summary: "Physicist used quantum-based random number generators (radioactive decay). Consistent 1–2% deviation from chance across millions of trials. Published in multiple physics journals.",
    links: [
      { label: "Schmidt, H. (1970) — J. Applied Physics", url: "https://doi.org/10.1063/1.1659141" },
    ],
    details: "Schmidt's experiments were significant because the random source was truly quantum (strontium-90 decay), ruling out pseudo-random artifacts. His 'retroactive PK' experiments — where subjects attempted to influence pre-recorded random sequences — also showed positive results, suggesting influence backward in time.",
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Notable Individuals
   ──────────────────────────────────────────────────────────── */
const individuals = [
  {
    name: "Nina Kulagina",
    era: "1926–1990",
    origin: "Soviet Union (Leningrad)",
    bio: "Russian woman extensively studied by over 60 Soviet scientists for apparent psychokinetic abilities. Filmed moving matchboxes, compass needles, glass objects, and separating egg yolk from white inside sealed containers. Sessions were documented with EEG, ECG, and film cameras.",
    notable: "Soviet Academy of Sciences filmed demonstrations; heart rate exceeded 240 BPM; lost 4 pounds in 30 minutes during sessions",
    links: [
      { label: "Soviet PK Film Footage (YouTube)", url: "https://www.youtube.com/results?search_query=nina+kulagina+psychokinesis" },
      { label: "Kulagina Research Summary — SPR", url: "https://www.spr.ac.uk/" },
    ],
  },
  {
    name: "Uri Geller",
    era: "1946–Present",
    origin: "Tel Aviv, Israel",
    bio: "Most publicly known psychic claimant. Tested at Stanford Research Institute by physicists Russell Targ and Hal Puthoff. Results published in Nature (1974). Demonstrated apparent metal bending and remote viewing under controlled conditions at SRI, Lawrence Livermore Lab, and the U.S. Naval Surface Weapons Center.",
    notable: "Published in Nature (1974); CIA files confirm SRI testing; subject of decades of debate between Targ/Puthoff and James Randi",
    links: [
      { label: "Nature Paper — Targ & Puthoff (1974)", url: "https://doi.org/10.1038/251602a0" },
      { label: "CIA Files on Geller (declassified)", url: "https://www.cia.gov/readingroom/search/site/uri%20geller" },
      { label: "FBI Vault — Uri Geller", url: "https://vault.fbi.gov/Uri%20Geller" },
    ],
  },
  {
    name: "Ingo Swann",
    era: "1933–2013",
    origin: "Telluride, Colorado",
    bio: "Artist and psychic researcher who co-developed Coordinate Remote Viewing (CRV) — the protocol adopted by the U.S. military's Stargate program. Demonstrated measurable perturbation of a shielded magnetometer at Stanford. His Jupiter remote viewing in 1973 described planetary rings before Voyager confirmed them in 1979.",
    notable: "Co-creator of CRV methodology; Jupiter rings prediction; magnetometer experiments at ASPR",
    links: [
      { label: "Swann's Jupiter Session (1973) — CIA docs", url: "https://www.cia.gov/readingroom/search/site/ingo%20swann" },
      { label: "Library of Congress — Ingo Swann Papers", url: "https://www.loc.gov/search/?q=ingo+swann" },
    ],
  },
  {
    name: "Joseph McMoneagle",
    era: "1946–Present",
    origin: "United States (U.S. Army)",
    bio: "Remote viewer #001 in the U.S. Army's Stargate program. Served from 1978–1995. Awarded the Legion of Merit for providing intelligence information 'unavailable from any other source.' Author of 'Mind Trek' and 'Remote Viewing Secrets.' Continues active research at The Monroe Institute.",
    notable: "Legion of Merit for remote viewing intelligence; Star Gate Remote Viewer #001; 23 years of documented sessions",
    links: [
      { label: "McMoneagle Official Site", url: "http://www.mceagle.com/" },
      { label: "Legion of Merit Citation (redacted)", url: "https://www.cia.gov/readingroom/collection/stargate" },
    ],
  },
  {
    name: "José Silva",
    era: "1914–1999",
    origin: "Laredo, Texas / Mexican-American",
    bio: "Self-taught parapsychologist who developed the Silva Mind Control Method (now The Silva Method) in 1966. Discovered that alpha brainwave states (7–14 Hz) enhanced intuition and mental projection. Over 6 million graduates worldwide in 110+ countries. His controlled remote viewing techniques paralleled classified military protocols developed independently.",
    notable: "6 million graduates; 110 countries; alpha/theta brainwave training pioneer",
    links: [
      { label: "The Silva Method — Official", url: "https://www.silvamethodlife.com/" },
      { label: "Silva UltraMind ESP System", url: "https://www.silvamethod.com/" },
    ],
  },
  {
    name: "Ted Serios",
    era: "1918–2006",
    origin: "Kansas City, Missouri",
    bio: "Chicago bellhop studied by psychiatrist Dr. Jule Eisenbud at the University of Colorado for 'thoughtography' — projecting mental images onto Polaroid film. Over 1,000 images produced under controlled conditions with independent witnesses. Eisenbud published 'The World of Ted Serios' (1967).",
    notable: "1,000+ thoughtographic images; studied by University of Colorado psychiatrist",
    links: [
      { label: "The World of Ted Serios — Book", url: "https://www.google.com/books/edition/The_World_of_Ted_Serios/WKQAAQAAIAAJ" },
    ],
  },
  {
    name: "Zhang Baosheng",
    era: "1960–Present",
    origin: "Benxi, Liaoning, China",
    bio: "Chinese national studied by the Chinese Academy of Sciences as part of their Exceptional Human Functions (EHF) research program. Demonstrated apparent ability to move small objects through sealed containers (teleportation claims). Studied under controlled laboratory conditions for over a decade at the Institute of Space Medico-Engineering.",
    notable: "Chinese Academy of Sciences studies; Institute of Space Medico-Engineering research subject",
    links: [
      { label: "Chinese EHF Research Overview", url: "https://www.google.com/search?q=zhang+baosheng+chinese+academy+sciences" },
    ],
  },
  {
    name: "Eusapia Palladino",
    era: "1854–1918",
    origin: "Minervino Murge, Italy",
    bio: "Italian medium studied by Nobel laureates Pierre and Marie Curie, criminologist Cesare Lombroso, astronomer Camille Flammarion, and physicist Oliver Lodge. The Institut Général Psychologique in Paris conducted a 43-session study over 3 years. Despite some caught fraud, controlled sessions produced phenomena researchers could not explain.",
    notable: "Studied by 2 Nobel laureates; 43-session IGP study; investigated by SPR across Europe",
    links: [
      { label: "SPR — Palladino Investigations", url: "https://www.spr.ac.uk/" },
    ],
  },
  {
    name: "Robert Monroe",
    era: "1915–1995",
    origin: "Lexington, Kentucky",
    bio: "Radio broadcasting executive who began experiencing spontaneous out-of-body experiences in 1958. Founded The Monroe Institute in 1974. Developed Hemi-Sync binaural beat technology. His Gateway Voyage program was adopted by the U.S. Army for consciousness research (Gateway Process Report, 1983). Author of 'Journeys Out of the Body.'",
    notable: "Founded Monroe Institute; Hemi-Sync technology; U.S. Army adopted Gateway Process",
    links: [
      { label: "The Monroe Institute", url: "https://www.monroeinstitute.org/" },
      { label: "Gateway Process Report (CIA)", url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf" },
    ],
  },
  {
    name: "Edgar Mitchell",
    era: "1930–2016",
    origin: "Hereford, Texas",
    bio: "Apollo 14 astronaut — sixth person to walk on the moon. During his return flight, conducted unauthorized ESP experiments transmitting Zener card symbols to receivers on Earth. Results were statistically significant. Founded the Institute of Noetic Sciences (IONS) in 1973 to study consciousness scientifically.",
    notable: "Apollo 14 moonwalker; ESP experiments from space; founded IONS",
    links: [
      { label: "Institute of Noetic Sciences", url: "https://noetic.org/" },
      { label: "NASA Bio — Edgar Mitchell", url: "https://www.nasa.gov/astronaut-profiles/edgar-d-mitchell" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Schools & Institutes
   ──────────────────────────────────────────────────────────── */
const schools = [
  { name: "Qigong — External Qi Emission", origin: "China", era: "2,000+ years", desc: "Chinese energy cultivation. 'Wai Qi' practitioners claim to project energy. Beijing's Qigong Research Institute documented infrared radiation changes. Thousands of clinical studies in Chinese medical journals.", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3085832/" },
  { name: "Siddhi Practices — Yoga Sutras", origin: "India", era: "~400 CE", desc: "Patanjali describes siddhis achievable through samyama meditation: levitation, clairvoyance, telekinesis. The Maharishi Effect studies tested group meditation effects on crime statistics.", url: "https://en.wikipedia.org/wiki/Siddhi" },
  { name: "Tibetan Tummo Meditation", origin: "Tibet", era: "1,000+ years", desc: "Monks raise skin temperature by 8°C, dry wet sheets in freezing conditions. Harvard's Herbert Benson documented this. Suggests mind-body influence beyond known mechanisms.", url: "https://doi.org/10.1371/journal.pone.0058244" },
  { name: "Society for Psychical Research", origin: "Cambridge, UK", era: "1882–Present", desc: "Oldest psi research organization. Founded by Henry Sidgwick, Frederic Myers. Members: William James, Arthur Balfour, Oliver Lodge. 140+ years of published Proceedings.", url: "https://www.spr.ac.uk/" },
  { name: "Rhine Research Center", origin: "Durham, NC", era: "1935–Present", desc: "Oldest parapsychology lab in the world. Continuation of J.B. Rhine's Duke lab. Ongoing PK, precognition, and remote viewing research with EEG/fMRI.", url: "https://www.rhine.org/" },
  { name: "The Monroe Institute", origin: "Virginia, USA", era: "1974–Present", desc: "Founded by Robert Monroe. Hemi-Sync binaural beats for altered states. U.S. Army Gateway Process. Gateway Voyage program.", url: "https://www.monroeinstitute.org/" },
  { name: "The Silva Method", origin: "Laredo, TX", era: "1966–Present", desc: "José Silva's alpha/theta brainwave training. 6M+ graduates, 110 countries. Remote viewing and mental projection techniques.", url: "https://www.silvamethodlife.com/" },
  { name: "Institute of Noetic Sciences", origin: "Petaluma, CA", era: "1973–Present", desc: "Founded by Apollo 14 astronaut Edgar Mitchell. Dean Radin's double-slit consciousness experiments. Research on healing intention.", url: "https://noetic.org/" },
  { name: "Koestler Parapsychology Unit", origin: "Edinburgh, Scotland", era: "1985–Present", desc: "Academic unit at University of Edinburgh. Ganzfeld, precognition, PK experiments. Publishes in peer-reviewed journals.", url: "https://koestlerunit.wordpress.com/" },
  { name: "HeartMath Institute", origin: "Boulder Creek, CA", era: "1991–Present", desc: "Heart-brain coherence research. Heart responds to future events 4–7 seconds early. RNG coherence correlations.", url: "https://www.heartmath.org/" },
  { name: "University of Virginia — DOPS", origin: "Charlottesville, VA", era: "1967–Present", desc: "Division of Perceptual Studies. Founded by Ian Stevenson. 2,500+ investigated past-life memory cases. NDE research.", url: "https://med.virginia.edu/perceptual-studies/" },
  { name: "Parapsychological Association", origin: "International", era: "1957–Present", desc: "Professional organization affiliated with the AAAS since 1969. Holds annual conventions. International membership of researchers.", url: "https://www.parapsych.org/" },
];

/* ────────────────────────────────────────────────────────────
   DATA — Timeline
   ──────────────────────────────────────────────────────────── */
const timeline = [
  { year: "~500 BCE", event: "Patanjali's Yoga Sutras codify siddhi powers including telekinesis" },
  { year: "~200 CE", event: "Tibetan Buddhist traditions document tummo and levitation practices" },
  { year: "1026", event: "Ibn al-Haytham writes on perception and consciousness" },
  { year: "1848", event: "Fox Sisters spark the Spiritualist movement; scientific investigation begins" },
  { year: "1882", event: "Society for Psychical Research founded at Cambridge" },
  { year: "1895", event: "Eusapia Palladino studied in controlled séances across Europe" },
  { year: "1930", event: "J.B. Rhine begins Zener card experiments at Duke University" },
  { year: "1934", event: "Rhine publishes 'Extra-Sensory Perception'" },
  { year: "1957", event: "Parapsychological Association founded; joins AAAS in 1969" },
  { year: "1960s", event: "Nina Kulagina filmed by Soviet Academy of Sciences" },
  { year: "1966", event: "José Silva publishes the Silva Mind Control Method" },
  { year: "1970", event: "Helmut Schmidt begins quantum RNG experiments at Boeing" },
  { year: "1972", event: "SRI begins testing Ingo Swann and Uri Geller; CIA funds Project SCANATE" },
  { year: "1973", event: "Ingo Swann describes Jupiter's rings — confirmed by Voyager in 1979" },
  { year: "1974", event: "Targ & Puthoff publish remote viewing results in Nature" },
  { year: "1974", event: "Robert Monroe founds The Monroe Institute; develops Hemi-Sync" },
  { year: "1975", event: "Stargate Project begins — 20-year military remote viewing program" },
  { year: "1979", event: "PEAR Lab opens at Princeton under Robert Jahn, Dean of Engineering" },
  { year: "1983", event: "U.S. Army commissions Gateway Process Report on Monroe Institute" },
  { year: "1986", event: "Chinese Academy of Sciences studies Zhang Baosheng" },
  { year: "1991", event: "HeartMath Institute founded — heart-brain coherence research" },
  { year: "1995", event: "Stargate declassified; Jessica Utts confirms statistical validity" },
  { year: "1998", event: "Global Consciousness Project begins — 70+ REG devices worldwide" },
  { year: "2003", event: "Gateway Process Report fully declassified (except Page 25)" },
  { year: "2007", event: "PEAR Lab closes — 2.5 million trials completed over 28 years" },
  { year: "2011", event: "Daryl Bem publishes precognition results in JPSP; replication crisis begins" },
  { year: "2014", event: "Dean Radin publishes consciousness double-slit results at IONS" },
  { year: "2021", event: "Gateway Report Page 25 recovered and released" },
  { year: "2023", event: "UVA DOPS continues consciousness research; renewed academic interest" },
];

/* ────────────────────────────────────────────────────────────
   DATA — Media & Videos
   ──────────────────────────────────────────────────────────── */
const media = [
  { title: "Third Eye Spies (2019)", type: "Documentary", desc: "Feature documentary on the Stargate remote viewing program. Includes interviews with Russell Targ, Hal Puthoff, and program participants.", url: "https://www.youtube.com/results?search_query=third+eye+spies+documentary" },
  { title: "The Men Who Stare at Goats (2004)", type: "Book / Film", desc: "Jon Ronson's investigation of U.S. military psychic programs. George Clooney film adaptation (2009).", url: "https://www.google.com/books/edition/The_Men_Who_Stare_at_Goats/RiLKAgAAQBAJ" },
  { title: "Surviving Death (2021)", type: "Netflix Series", desc: "6-part Netflix series examining evidence for consciousness beyond death, including remote viewing and psychic phenomena.", url: "https://www.netflix.com/title/80998853" },
  { title: "Nina Kulagina — Soviet PK Footage", type: "Archive Film", desc: "Original Soviet-era footage of Kulagina demonstrations under laboratory conditions.", url: "https://www.youtube.com/results?search_query=nina+kulagina+psychokinesis+original+footage" },
  { title: "CIA Reading Room — Stargate Archive", type: "Document Archive", desc: "12,000+ declassified pages from the CIA's remote viewing program.", url: "https://www.cia.gov/readingroom/collection/stargate" },
  { title: "Library of Congress — Parapsychology Collection", type: "Library", desc: "LoC catalog of parapsychology research materials, books, and manuscripts.", url: "https://www.loc.gov/search/?q=parapsychology" },
  { title: "The Black Vault — Declassified Psychic Files", type: "FOIA Archive", desc: "John Greenewald's comprehensive FOIA archive containing thousands of declassified government documents on psychic research.", url: "https://www.theblackvault.com/documentarchive/the-remote-viewing-program/" },
  { title: "Dean Radin — Consciousness and Quantum Physics (Talks)", type: "Lectures", desc: "Chief Scientist at IONS discusses evidence for consciousness influencing physical systems.", url: "https://www.youtube.com/results?search_query=dean+radin+consciousness+quantum" },
  { title: "Smithsonian — Rhine ESP Cards Collection", type: "Museum Archive", desc: "Original Zener cards from Rhine's Duke University lab held in the Smithsonian collection.", url: "https://www.si.edu/search?edan_q=zener+cards" },
];

/* ────────────────────────────────────────────────────────────
   COMPONENT — Expandable Card
   ──────────────────────────────────────────────────────────── */
function ExpandableCard({ children, expanded, onClick, className = "" }: {
  children: React.ReactNode;
  expanded: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-black/30 p-5 transition ${expanded ? "border-signal/40 col-span-full" : "border-bone/10 hover:border-signal/20"} ${className}`}
    >
      {children}
      {!expanded && (
        <p className="mt-3 text-[10px] text-bone/20 tracking-wider">CLICK TO EXPAND</p>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */
export default function FilesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("declassified");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "declassified", label: "DECLASSIFIED", count: declassified.length },
    { id: "studies", label: "STUDIES", count: studies.length },
    { id: "individuals", label: "SUBJECTS", count: individuals.length },
    { id: "schools", label: "INSTITUTES", count: schools.length },
    { id: "timeline", label: "TIMELINE", count: timeline.length },
    { id: "media", label: "MEDIA", count: media.length },
  ];

  return (
    <main className="relative min-h-screen pt-16">
      <ParticleField />

      {/* Header */}
      <div className="relative border-b border-bone/10 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.4em] text-ember font-medium">THE ARCHIVES</p>
          <h1 className="mt-3 text-5xl font-bold uppercase md:text-6xl">FILES</h1>
          <p className="mt-4 max-w-2xl text-bone/50 leading-relaxed">
            Declassified government documents, peer-reviewed research, documented individuals,
            and 1,000+ years of institutional inquiry into the boundaries of human perception.
            All links point to official sources — CIA, FBI, NASA, academic journals, and libraries.
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs text-bone/30">
            <span>{declassified.length + studies.length + individuals.length + schools.length} entries</span>
            <span>·</span>
            <span>{timeline.length} timeline events</span>
            <span>·</span>
            <span>{media.length} media resources</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-40 border-b border-bone/10 bg-void/90 backdrop-blur-md px-6">
        <div className="mx-auto max-w-6xl flex gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpandedId(null); }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-[10px] font-semibold tracking-[0.15em] transition ${
                activeTab === tab.id
                  ? "bg-signal/10 text-signal"
                  : "text-bone/40 hover:text-bone/70 hover:bg-bone/5"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeTab === tab.id ? "bg-signal/20" : "bg-bone/5"}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 py-12 md:px-12">
        <div className="mx-auto max-w-6xl">

          {/* DECLASSIFIED */}
          {activeTab === "declassified" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {declassified.map((doc) => (
                  <ExpandableCard key={doc.title} expanded={expandedId === doc.title} onClick={() => toggle(doc.title)}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                        doc.classification.includes("TOP") ? "bg-hazard/15 text-hazard" : "bg-ember/15 text-ember"
                      }`}>{doc.classification}</span>
                      <span className="text-[10px] text-bone/30">{doc.year}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold">{doc.title}</h3>
                    <p className="mt-1 text-[11px] tracking-wider text-signal/60">{doc.agency}</p>
                    <p className="mt-3 text-sm text-bone/60 leading-relaxed">{doc.summary}</p>

                    <AnimatePresence>
                      {expandedId === doc.title && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 border-t border-bone/10 pt-4">
                            <p className="text-sm text-bone/70 leading-relaxed">{doc.details}</p>
                            <div className="mt-4 space-y-2">
                              <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">DOCUMENTS &amp; LINKS</p>
                              {doc.documents.map((link) => (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-2 rounded-lg border border-bone/10 bg-black/40 px-4 py-3 text-sm text-signal/80 transition hover:border-signal/30 hover:text-signal">
                                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ExpandableCard>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* STUDIES */}
          {activeTab === "studies" && (
            <div className="grid gap-4 md:grid-cols-2">
              {studies.map((study) => (
                <ExpandableCard key={study.title} expanded={expandedId === study.title} onClick={() => toggle(study.title)}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold">{study.title}</h3>
                    <span className="text-[10px] text-bone/30 whitespace-nowrap">{study.year}</span>
                  </div>
                  <p className="mt-1 text-[11px] tracking-wider text-ember/70">{study.org}</p>
                  <p className="mt-3 text-sm text-bone/60 leading-relaxed">{study.summary}</p>

                  <AnimatePresence>
                    {expandedId === study.title && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 border-t border-bone/10 pt-4">
                          <p className="text-sm text-bone/70 leading-relaxed">{study.details}</p>
                          <div className="mt-4 space-y-2">
                            <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">REFERENCES</p>
                            {study.links.map((link) => (
                              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                 className="flex items-center gap-2 rounded-lg border border-bone/10 bg-black/40 px-4 py-3 text-sm text-signal/80 transition hover:border-signal/30 hover:text-signal">
                                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ExpandableCard>
              ))}
            </div>
          )}

          {/* INDIVIDUALS */}
          {activeTab === "individuals" && (
            <div className="grid gap-4 md:grid-cols-2">
              {individuals.map((person) => (
                <ExpandableCard key={person.name} expanded={expandedId === person.name} onClick={() => toggle(person.name)}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold">{person.name}</h3>
                    <span className="text-[10px] text-bone/30 whitespace-nowrap">{person.era}</span>
                  </div>
                  <p className="text-[11px] tracking-wider text-ember/70">{person.origin}</p>
                  <p className="mt-3 text-sm text-bone/60 leading-relaxed">{person.bio}</p>

                  <AnimatePresence>
                    {expandedId === person.name && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 border-t border-bone/10 pt-4">
                          <p className="text-sm text-signal/60"><span className="text-signal/40">Notable:</span> {person.notable}</p>
                          <div className="mt-4 space-y-2">
                            <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">LINKS</p>
                            {person.links.map((link) => (
                              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                 className="flex items-center gap-2 rounded-lg border border-bone/10 bg-black/40 px-4 py-3 text-sm text-signal/80 transition hover:border-signal/30 hover:text-signal">
                                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ExpandableCard>
              ))}
            </div>
          )}

          {/* SCHOOLS */}
          {activeTab === "schools" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schools.map((school) => (
                <a key={school.name} href={school.url} target="_blank" rel="noopener noreferrer"
                   className="group rounded-xl border border-bone/10 bg-black/30 p-5 transition hover:border-signal/30">
                  <h3 className="text-base font-bold group-hover:text-signal transition">{school.name}</h3>
                  <div className="mt-1 flex gap-3 text-[11px]">
                    <span className="tracking-wider text-ember/70">{school.origin}</span>
                    <span className="text-bone/30">{school.era}</span>
                  </div>
                  <p className="mt-3 text-sm text-bone/60 leading-relaxed">{school.desc}</p>
                  <p className="mt-3 text-[10px] text-signal/40 tracking-wider group-hover:text-signal/70 transition">VISIT &rarr;</p>
                </a>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-signal/30 via-signal/15 to-transparent" />
              <div className="space-y-5">
                {timeline.map((entry, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-signal/50 bg-void" />
                    <div>
                      <p className="text-xs font-bold text-ember">{entry.year}</p>
                      <p className="mt-1 text-sm text-bone/70 leading-relaxed">{entry.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA */}
          {activeTab === "media" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer"
                   className="group rounded-xl border border-bone/10 bg-black/30 p-5 transition hover:border-signal/30">
                  <span className="inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider bg-signal/10 text-signal">{item.type}</span>
                  <h3 className="mt-2 text-base font-bold group-hover:text-signal transition">{item.title}</h3>
                  <p className="mt-2 text-sm text-bone/60 leading-relaxed">{item.desc}</p>
                  <p className="mt-3 text-[10px] text-signal/40 tracking-wider group-hover:text-signal/70 transition">OPEN &rarr;</p>
                </a>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-16">
        <div className="mx-auto max-w-6xl rounded-xl border border-bone/5 bg-black/20 p-6 text-center">
          <p className="text-xs text-bone/30 leading-relaxed max-w-2xl mx-auto">
            This archive presents documented research and historical records for educational purposes.
            All links point to official government, academic, and institutional sources.
            The Telekinesis Support Group does not make supernatural claims.
            <br /><span className="text-bone/50">No claims. No promises. Just show up and pay attention.</span>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
