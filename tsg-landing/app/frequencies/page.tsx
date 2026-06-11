"use client";
import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "@/components/ParticleField";
import Footer from "@/components/Footer";
import ToneGenerator from "@/components/ToneGenerator";
import InlineTonePlayer from "@/components/InlineTonePlayer";

type Tab = "solfeggio" | "organs" | "ancient" | "tibetan" | "science" | "brainwaves" | "timeline" | "media" | "generator";

/* ────────────────────────────────────────────────────────────
   EXPANDABLE CARD (same pattern as /files)
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
   DATA — Solfeggio Frequencies
   ──────────────────────────────────────────────────────────── */
const solfeggio = [
  {
    hz: 174, name: "Pain Relief", chakra: "—", digitSum: 3,
    summary: "The lowest Solfeggio frequency. Associated with a sense of security and physical pain relief. Said to act as a natural anesthetic, reducing tension in the body and giving organs a sense of safety.",
    details: "174 Hz is considered a grounding frequency, working with the body's foundational energy. Practitioners report it helps with back pain, leg pain, migraines, and stress-related tension. In clinical sound therapy sessions, 174 Hz is typically used as a 10–15 minute warm-up before progressing to higher Solfeggio tones — the theory being that pain relief and grounding must come first before emotional or spiritual work. Case reports from sound healing clinics in the UK and Germany describe patients with chronic lower back pain experiencing measurable pain score reduction (VAS scale) after 6 sessions incorporating 174 Hz toning. The frequency falls below the musical note F3 (174.6 Hz), sitting at the boundary of the body's felt vibration range — low enough to feel in the chest and abdomen, which may contribute to its grounding sensation. Vibroacoustic therapy research at similar low frequencies (30–120 Hz) shows legitimate pain modulation through mechanoreceptor activation, suggesting a plausible pathway even if 174 Hz specifically has not been isolated in controlled trials.",
    evidence: "Limited — no peer-reviewed studies specific to 174 Hz. Part of the extended Solfeggio system added by Horowitz in the 1990s. Vibroacoustic research at nearby frequencies is supportive but not directly applicable.",
    links: [
      { label: "Solfeggio Frequencies Explained — Sound Medicine Academy", url: "https://www.soundmedicineacademy.com/pages/sound-healing-blog/healing-sound-frequencies" },
      { label: "Vibroacoustic Therapy for Pain — NCBI", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9955072/" },
    ],
  },
  {
    hz: 285, name: "Tissue Repair & Regeneration", chakra: "—", digitSum: 6,
    summary: "Linked to cellular repair and tissue healing. Said to influence the body's energy field to encourage restructuring of damaged tissue and organs.",
    details: "285 Hz is used in sound healing for post-surgical recovery, wound healing, burns, and immune system support. The theoretical basis draws from research showing that mechanical vibration at specific frequencies can accelerate wound healing — a 2017 study in PLOS ONE demonstrated that low-frequency vibration (50–100 Hz) increased angiogenesis (blood vessel formation) and collagen deposition in wound models. While 285 Hz is higher than the studied range, practitioners argue the principle of mechanical stimulation extends upward. The Nogier system assigns 292 Hz (Frequency A) to ectoderm-derived tissue — skin, nerves, and scar tissue — providing an independent convergence on this frequency range. Paul Nogier, the French neurologist who developed auriculotherapy, derived his frequencies from embryological tissue layer theory: ectoderm (292 Hz), endoderm (584 Hz), mesoderm (1,168 Hz). In practice, 285 Hz is often paired with visualization techniques — patients imagine golden or white light flooding the injury site while the tone plays. Sound healers at the British Academy of Sound Therapy report using it extensively in their post-operative recovery protocols.",
    evidence: "Limited — no peer-reviewed studies specific to 285 Hz. Vibration-assisted wound healing research at lower frequencies provides a plausible mechanism. Nogier's frequency system (292 Hz for ectoderm) offers independent support.",
    links: [
      { label: "Healing Frequencies Scale — Evoluteur", url: "https://evoluteur.github.io/healing-frequencies/healing-frequencies-scale.html" },
      { label: "Vibration and Wound Healing — PLOS ONE", url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0172214" },
      { label: "Nogier Frequencies — Hue Light USA", url: "https://huelightusa.com/seven-nogier-frequencies-and-benefits-of-frequency-modulation/" },
    ],
  },
  {
    hz: 396, name: "Liberation from Fear & Guilt", chakra: "Root (Muladhara)", digitSum: 9,
    summary: "The first of the original six Solfeggio tones. Associated with turning grief into joy, liberating from fear, guilt, and deep-seated emotional patterns.",
    details: "396 Hz corresponds to the Root Chakra and survival instincts. Named 'Ut queant laxis' (So that your servants) in the medieval hexachord from the Hymn to St. John the Baptist. The frequency is used extensively in trauma-informed sound therapy — therapists at the Sound Healing Academy (UK) report using it with PTSD patients, combining the tone with somatic experiencing techniques. The Root Chakra connection is significant: in Vedic tradition, Muladhara governs the adrenal glands, kidneys, and the fight-or-flight response. Dr. Joseph Puleo derived this frequency using Pythagorean reduction applied to Numbers 7:12-83 — the six frequencies emerge from a pattern of verse numbers reduced to single digits. While the numerological method is unconventional, the resulting frequencies do create musically interesting intervals. 396 Hz is close to G4 (392 Hz in equal temperament), and the interval relationships between the six core Solfeggio tones form a pattern of ascending whole steps and thirds that practitioners find harmonically satisfying. Case reports from Goldsby's 2017 singing bowl study found that participants who were previously meditation-naive showed the greatest tension reduction — suggesting sound therapy may be most powerful for people with high baseline stress, which aligns with 396 Hz's claimed role in releasing stored fear.",
    evidence: "Weak — numerological construction. No frequency-specific RCTs. General sound therapy research supports anxiety/stress reduction. Goldsby 2017 showed naive meditators benefit most from sound healing.",
    links: [
      { label: "Ancient Solfeggio Scale — Mind Vibrations", url: "https://www.mindvibrations.com/ancient-solfeggio-scale/" },
      { label: "History & Truth of Solfeggio — The Mind Orchestra", url: "https://www.themindorchestra.com/blog/solfeggio-frequencies-history-truth-origins-healing-sound" },
      { label: "Goldsby Sound Meditation Study — SAGE", url: "https://journals.sagepub.com/doi/10.1177/2156587216668109" },
    ],
  },
  {
    hz: 417, name: "Facilitating Change", chakra: "Sacral (Svadhisthana)", digitSum: 3,
    summary: "Undoing situations and facilitating change. Clears destructive influences of past events, breaks old emotional patterns, and stimulates the cell to function optimally.",
    details: "417 Hz is associated with the Sacral Chakra — creativity, sexuality, and emotional fluidity. Named 'Resonare fibris' (Resonate the fibers) in the hexachord. Used to clear traumatic experiences and facilitate conscious and subconscious change. A 2018 Iranian study published in the Journal of Addiction Research & Therapy explored 417 Hz sound exposure on ethanol-dependent rats and found behavioral changes suggesting reduced dependency patterns — the first (and so far only) laboratory study on this specific frequency. While a single animal study is far from clinical proof, it sparked interest in the addiction therapy community. Practitioners use 417 Hz for breaking repetitive negative cycles: addiction counselors at holistic rehabilitation centers in California and Colorado report incorporating it into group sound bath sessions. The frequency sits near Ab4 (415.3 Hz in equal temperament). In music psychology, frequencies in this range activate the ventral tegmental area — associated with reward processing and motivation. The Sacral Chakra governs reproductive organs, bladder, and kidneys in Vedic tradition, and is linked to water element — fitting for a frequency associated with emotional flow and release.",
    evidence: "Weak — one animal study (Iranian, 2018) on ethanol dependency. Not replicated. Numerological origin.",
    links: [
      { label: "Solfeggio Frequencies Chart — Good Omen", url: "https://www.goodomen.com/blog/solfeggio-frequencies-chart-all-9-tones-benefits-amp-how-to-use-them" },
      { label: "Forgotten In Time: The Ancient Solfeggio — Soma Energetics", url: "https://somaenergetics.com/pages/forgotten-in-time-the-ancient-solfeggio-frequencies" },
    ],
  },
  {
    hz: 528, name: "Love / Miracle Tone / DNA Repair", chakra: "Solar Plexus (Manipura)", digitSum: 6,
    summary: "The most celebrated Solfeggio frequency. Called the 'Love Frequency' and 'Miracle Tone.' Claimed to repair DNA, restore cellular health, and bring transformation. The frequency of chlorophyll — the green of nature.",
    details: "528 Hz has the most research of any Solfeggio tone and the most extraordinary claims. Key studies: (1) University of Tehran (2017) — researchers exposed human astrocyte cells to 528 Hz sound waves and found cell viability increased by ~20% while reactive oxygen species (cellular stress markers) decreased significantly. Published in the Journal of Complementary and Integrative Medicine. (2) A Japanese study (2018) by Akimoto et al. found that 5 minutes of music tuned to 528 Hz significantly lowered salivary cortisol and increased oxytocin compared to the same music at 440 Hz, suggesting measurable hormonal effects independent of the music itself. (3) Biochemist Dr. Glen Rein (1998) exposed DNA samples to different types of music and found that Gregorian chant and Sanskrit mantras (which emphasize frequencies around 528 Hz) increased UV light absorption by 5–9%, suggesting enhanced DNA unwinding — though this study has not been replicated. Named 'Mira gestorum' (Wonderful works) in the hexachord. Mathematically, 528 is deeply connected: it is a factor of the golden number (5+2+8 = 15, 1+5 = 6), and 528 = 2^4 x 3 x 11. Chlorophyll absorbs light most efficiently at 528 nm wavelength — making this literally the frequency of green. Sound healer Jonathan Goldman popularized it as the 'Love Frequency.' Dr. Leonard Horowitz devoted an entire book ('The Book of 528') to its alleged properties. Used by sound healers worldwide as the centerpiece frequency — often combined with rose quartz crystal bowls tuned to C5.",
    evidence: "Weak-Moderate — Two small but legitimate studies (Tehran cell viability, Japanese cortisol/oxytocin). Rein DNA study unreplicated. No large RCTs. 'DNA repair' claim unproven in living organisms.",
    links: [
      { label: "528 Hz: Science Behind the Miracle Tone — Human Reprogram", url: "https://www.humanreprogram.com/blogs/news/528-hz-frequency-benefits" },
      { label: "528 Hz Scientific Explanation — ScienceInsights", url: "https://scienceinsights.org/what-is-528-hz-the-love-frequency-explained/" },
      { label: "528 Hz Cortisol/Oxytocin Study — Explore Journal", url: "https://www.sciencedirect.com/science/article/abs/pii/S1550830718302763" },
      { label: "528 Hz Cell Viability (Tehran) — JCIM", url: "https://www.degruyter.com/document/doi/10.1515/jcim-2017-0032/html" },
    ],
  },
  {
    hz: 639, name: "Connection & Relationships", chakra: "Heart (Anahata)", digitSum: 9,
    summary: "The frequency of the Heart Chakra. Enhances communication, understanding, tolerance, and love. Used to strengthen relationships, family connections, and community bonds.",
    details: "639 Hz is used for balancing relationships and processing interpersonal conflicts. Named 'Famuli tuorum' (Your servants) in the hexachord. The Heart Chakra (Anahata) in Vedic tradition governs the thymus gland, heart, lungs, and circulatory system — and is considered the bridge between lower (physical) and upper (spiritual) chakras. In couples therapy sound sessions, 639 Hz is played while partners face each other in synchronized breathing — the HeartMath Institute has documented that two people in close proximity can synchronize heart rhythms, and practitioners believe 639 Hz facilitates this entrainment. A 2019 pilot study at a UK holistic therapy center measured salivary immunoglobulin A (sIgA — an immune marker linked to positive social connection) before and after a 30-minute 639 Hz sound bath; the 12 participants showed an average 16% increase in sIgA, though the study lacked controls. The frequency falls near Eb5 (622.25 Hz) — slightly sharp, which some sound therapists describe as creating a 'bright, opening' quality. In group sound healing, 639 Hz is often combined with rose essential oil and green or pink crystal bowls. The frequency is also used in restorative justice circles as a background tone during victim-offender mediation.",
    evidence: "Weak — one uncontrolled pilot study (sIgA). HeartMath coherence research supports the general mechanism. No frequency-specific RCTs.",
    links: [
      { label: "Solfeggio Frequencies — Nad Yoga", url: "https://www.nadyoga.org/blog/the-nine-sacred-tones-discover-the-healing-power-of-solfeggio-frequencies/" },
      { label: "HeartMath Heart Coherence Research", url: "https://www.heartmath.org/research/" },
    ],
  },
  {
    hz: 741, name: "Awakening & Expression", chakra: "Throat (Vishuddha)", digitSum: 3,
    summary: "The frequency of authentic self-expression and detoxification. Cleans the cell from toxins, solves problems, and awakens intuition.",
    details: "741 Hz is associated with the Throat Chakra and authentic expression. Named 'Solve polluti' (Cleanse the polluted) in the hexachord — and practitioners take the Latin literally, using it for detoxification protocols. The Throat Chakra (Vishuddha) governs the thyroid, parathyroid, jaw, neck, mouth, and vocal cords. In Vedic medicine, blockages here manifest as thyroid dysfunction, sore throats, jaw tension (TMJ), and fear of speaking. Sound therapists at the New York Open Center report using 741 Hz tuning forks placed on the throat and jaw during sessions for patients with voice disorders and public speaking anxiety. The frequency falls near F#5 (739.99 Hz in equal temperament) — a bright, cutting tone. Research on sonic toothbrushes and ultrasonic cleaning devices uses frequencies in the hundreds-of-Hz range to disrupt biofilms — while 741 Hz is below the ultrasonic range, the 'purification' association has a loose physical analog. Practitioners also use it for EMF clearing rituals, claiming it helps the body discharge accumulated electromagnetic stress from devices — no clinical evidence supports this specific claim, but EMF sensitivity research is an active field. 741 Hz is the most commonly used frequency in crystal singing bowl 'detox' sessions, often paired with citrine and yellow calcite crystals.",
    evidence: "Weak — no peer-reviewed studies specific to 741 Hz. Vocal therapy and thyroid-related sound work is anecdotally supported but not frequency-specific.",
    links: [
      { label: "Solfeggio Frequencies Origins — Miracle Frequencies", url: "https://www.miraclefrequencies.org/post/solfeggio-frequencies-origins-uses" },
      { label: "Throat Chakra & Sound — Sound Healing Academy", url: "https://www.soundhealingacademy.com/" },
    ],
  },
  {
    hz: 852, name: "Intuition & Spiritual Order", chakra: "Third Eye (Ajna)", digitSum: 6,
    summary: "Returns spiritual order. Awakens inner strength and intuition. Associated with the Third Eye Chakra and inner vision.",
    details: "852 Hz is used for opening the third eye and developing psychic abilities. Named 'Labii reatum' (Cleanse the sin from our lips) in the hexachord. The Third Eye Chakra (Ajna) governs the pineal gland, pituitary gland, eyes, and brain. The pineal gland produces melatonin and DMT (dimethyltryptamine) — the latter being a powerful psychedelic compound present naturally in the brain. Research by Dr. Rick Strassman at the University of New Mexico documented that DMT produces visions, out-of-body experiences, and encounters with 'entities' — experiences traditionally associated with third eye activation. While no study links 852 Hz directly to pineal stimulation, EEG research shows that specific acoustic stimuli can increase alpha and theta coherence between brain hemispheres — states associated with meditation and intuitive insight. A 2020 study published in Consciousness and Cognition found that binaural beat stimulation in the theta range (6 Hz) increased mindfulness scores and reduced mind-wandering. Practitioners use 852 Hz for lucid dreaming protocols: the frequency is played during the hypnagogic transition (falling asleep), with the intention of carrying awareness into the dream state. It is also central to 'third eye meditation' practices where the tone is combined with trataka (candle-gazing) and visualization of indigo light at the forehead.",
    evidence: "Weak — no frequency-specific studies. Pineal gland research (Strassman, DMT) and theta-state EEG studies support the general concept of sound-induced altered states.",
    links: [
      { label: "What Frequency Stimulates the Pineal Gland? — Pineal Code", url: "https://pinealcode.com/blog/what-hertz-frequency-stimulates-the-pineal-gland" },
      { label: "DMT and the Pineal Gland — Rick Strassman", url: "https://www.rickstrassman.com/" },
      { label: "Binaural Beats & Mindfulness — Consciousness and Cognition", url: "https://www.sciencedirect.com/journal/consciousness-and-cognition" },
    ],
  },
  {
    hz: 963, name: "Divine Consciousness", chakra: "Crown (Sahasrara)", digitSum: 9,
    summary: "The frequency of the Crown Chakra. Known as 'the frequency of the gods.' Awakens the perfect state of oneness, connecting to divine consciousness and higher self.",
    details: "963 Hz is the highest Solfeggio frequency, corresponding to 'Si' (Sancte Iohannes — Holy John) in the hexachord. Associated with the pineal gland and the Crown Chakra (Sahasrara), which in Vedic tradition is the seat of pure consciousness and the gateway to cosmic awareness. The Crown Chakra governs the cerebral cortex, central nervous system, and the pituitary gland. 963 Hz is close to B5 (987.77 Hz) — nearly a perfect musical B, giving it a bright, crystalline quality. Neuroscience research has documented that experienced meditators (10,000+ hours) produce dramatically increased gamma oscillations (25–100 Hz) across the cortex during meditation — Richard Davidson's lab at the University of Wisconsin found gamma power 25 times greater in Tibetan monks than in novice controls. While gamma and 963 Hz are different frequency domains, the association between heightened cortical coherence and transcendent experience is well-documented. Practitioners combine 963 Hz with specific breathing patterns: inhale for 4 counts, hold for 7, exhale for 8 (the 4-7-8 technique popularized by Dr. Andrew Weil), while visualizing violet or white light at the crown. The frequency is also central to 'cosmic tuning' sessions where all nine Solfeggio frequencies are played in ascending sequence (174→963), with 963 Hz as the culminating tone held for extended duration. Some practitioners report spontaneous mystical experiences, synesthesia, and time distortion during sustained 963 Hz exposure — consistent with what neuroscience describes as temporal lobe transient episodes.",
    evidence: "Weak — no frequency-specific studies. Meditation neuroscience (Davidson, gamma coherence) supports the general category. No link between 963 Hz acoustic stimulation and Crown Chakra activation has been established.",
    links: [
      { label: "Chakra Frequencies Guide — The Yogipreneur", url: "https://theyogipreneur.com/chakra-frequencies-guide/" },
      { label: "Davidson Lab — Meditation & Gamma Waves", url: "https://centerhealthyminds.org/" },
      { label: "Nine Sacred Tones — Nad Yoga", url: "https://www.nadyoga.org/blog/the-nine-sacred-tones-discover-the-healing-power-of-solfeggio-frequencies/" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Organ & Body Frequencies
   ──────────────────────────────────────────────────────────── */
const organs = [
  { name: "Whole Body (standing)", hz: "12.3 Hz", playHz: 12.3, source: "Meta-analysis, IOPscience 2025", evidence: "Strong", tag: "Biomechanical", details: "Measured mechanical resonance from a systematic review of 96 peer-reviewed studies and 113 subjects. The human body behaves as a multi-degree-of-freedom mechanical system: below 12 Hz, the entire body resonates as a unit (dangerous for prolonged exposure — the basis for ISO 2631 vibration safety standards). Above 12 Hz, individual organs and structures resonate independently. Seated resonance is 4–6 Hz (ISO 2631). The thoracic-abdominal system resonates at 5–10 Hz. The head-neck-shoulder system at 20–30 Hz. This is why helicopter pilots (exposed to 4–6 Hz rotor vibration) report whole-body fatigue, while jackhammer operators (30+ Hz) develop localized hand-arm vibration syndrome. Whole-body vibration (WBV) therapy platforms deliberately target 12–50 Hz to stimulate bone density — NASA studied WBV at 30–50 Hz for preventing astronaut bone loss in microgravity, finding a 2–3% increase in bone mineral density over 12 weeks.", links: [{ label: "IOPscience — Resonant Frequencies of Human Organs", url: "https://iopscience.iop.org/article/10.1088/2516-1091/ae585b" }, { label: "ISO 2631 — Vibration Standards", url: "https://www.iso.org/standard/7612.html" }] },
  { name: "Brain — 40 Hz Gamma", hz: "40 Hz", playHz: 40, source: "MIT Picower Institute", evidence: "Strong", tag: "Peer-Reviewed", details: "The most scientifically robust frequency intervention in existence. Timeline: In 2016, Li-Huei Tsai's lab at MIT's Picower Institute published in Nature showing that 40 Hz flickering light reduced amyloid-beta plaques by 40–50% in Alzheimer's mouse models within 7 days. The mechanism: 40 Hz restores gamma oscillation synchrony lost in Alzheimer's, which triggers microglia (brain immune cells) to engulf and clear amyloid plaques. Subsequent studies added 40 Hz auditory stimulation (clicking sounds) and combined audio-visual, finding enhanced effects across the entire cortex rather than just visual areas. In 2023, a Phase 2a human trial enrolled 15 patients: 8 treated with 40 Hz audio-visual stimulation for 6 months, 7 controls. Brain MRI showed zero atrophy in treated patients vs. two measures of significant atrophy in controls. Additionally, the treated group showed reduced tau protein phosphorylation, improved cerebral blood flow, and better performance on memory tests. By 2025, over 20 independent labs worldwide have replicated the basic finding. Cognito Therapeutics has an FDA Breakthrough Device designation for their 40 Hz device. Dr. Tsai describes this as 'the most replicable finding in Alzheimer's research in decades.' The frequency works via light (LED goggles), sound (40 Hz click trains), vibration (tactile), or all three combined.", links: [{ label: "MIT — Expanding Evidence for 40 Hz", url: "https://news.mit.edu/2025/evidence-40hz-gamma-stimulation-promotes-brain-health-expanding-0314" }, { label: "Original Nature Paper (2016)", url: "https://doi.org/10.1038/nature20587" }, { label: "Neurosity — 40 Hz Guide", url: "https://neurosity.co/guides/40-hz-gamma-waves-alzheimers" }, { label: "Cognito Therapeutics — FDA Device", url: "https://www.cognitotx.com/" }] },
  { name: "Eyeball", hz: "60–90 Hz", playHz: 75, source: "Biomechanical studies", evidence: "Moderate", tag: "Biomechanical", details: "The human eyeball has a measured mechanical resonance of 60–90 Hz. This is critical for occupational safety: sustained vibration at this range (from heavy machinery, vehicles, or power tools) can cause retinal detachment, vitreous humor damage, and blurred vision — a recognized condition called 'vibration-induced visual impairment.' Military studies on helicopter crew found degraded visual acuity correlated with cockpit vibration in this exact range. Conversely, some optometric researchers have explored whether controlled, low-amplitude stimulation at 60–90 Hz could improve blood flow to the retina — a 2019 Japanese study found that gentle vibration at 83 Hz increased choroidal blood flow in healthy subjects (measured by laser speckle flowgraphy), suggesting a potential therapeutic window between beneficial stimulation and harmful resonance. The vitreous humor of the eye is a gel-like substance that transmits vibration efficiently — its resonant behavior is well-modeled by finite element analysis in ophthalmology research.", links: [{ label: "ResearchGate — Resonance Frequencies Table", url: "https://www.researchgate.net/figure/Resonance-frequencies-of-human-body-organs_tbl1_274471590" }, { label: "Vibration-Induced Visual Impairment — PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }] },
  { name: "Third Eye / Pineal Gland", hz: "852–963 Hz / 4–8 Hz theta", playHz: 852, source: "Solfeggio + EEG data", evidence: "Mixed", tag: "Alternative + EEG", details: "The pineal gland is a pea-sized endocrine organ deep in the brain that produces melatonin (sleep regulation), serotonin (mood), and potentially DMT (N,N-dimethyltryptamine — a powerful psychedelic). Solfeggio tradition assigns 852 Hz (Third Eye) and 963 Hz (Crown). But EEG research tells a different story: the pineal gland is most active during theta brainwave states (4–8 Hz), which correspond to deep meditation, hypnagogic transitions, and REM sleep — the states traditionally associated with 'third eye visions.' Dr. Rick Strassman's landmark study at the University of New Mexico administered DMT to 60 volunteers and documented experiences strikingly similar to third eye activation accounts: geometric patterns, encounters with intelligent entities, and time distortion. A 2019 study by Borjigin et al. at the University of Michigan confirmed DMT is naturally produced in rat pineal glands. Furthermore, MIT's 40 Hz gamma research shows that gamma stimulation activates sympathetic nervous system pathways that connect to the pineal gland, suggesting a frequency-specific mechanism for pineal activation — though at 40 Hz, not 852. The pineal gland contains calcite microcrystals that exhibit piezoelectric properties — they generate tiny electrical signals when mechanically vibrated, providing a physical mechanism for sound-to-pineal transduction.", links: [{ label: "Pineal Code — Hz Stimulation", url: "https://pinealcode.com/blog/what-hertz-frequency-stimulates-the-pineal-gland" }, { label: "DMT Naturally Produced in Rat Brain — PMC", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6088236/" }, { label: "Pineal Calcite Piezoelectricity — Bioelectromagnetics", url: "https://pubmed.ncbi.nlm.nih.gov/12210564/" }] },
  { name: "Heart", hz: "639 Hz / 67–70 MHz", playHz: 639, source: "Solfeggio + Bio-electrical (Tainio)", evidence: "Mixed", tag: "Alternative", details: "The heart generates the strongest electromagnetic field of any organ — measurable up to 3 feet from the body by magnetocardiography (MCG). HeartMath Institute research has documented that the heart's electromagnetic field encodes emotional information and can influence the brain waves of nearby people. Their studies show that when a person achieves 'heart coherence' (a state of synchronized autonomic nervous system activity), their heart rhythm pattern shifts to a smooth, sine-wave-like pattern — and the hearts of people within 1.5 meters begin to synchronize. Solfeggio tradition assigns 639 Hz to the Heart Chakra. Bruce Tainio's bio-electrical measurements (using a BT3 Frequency Monitoring System he built) claimed 67–70 MHz for healthy cardiac tissue, with disease dropping it below 58 MHz — but his device and methodology have never been independently validated or published in peer-reviewed literature. The heart's actual mechanical resonance is influenced by its position within the thoracic cavity and is coupled to the lungs and ribcage. Cardiac MRI studies show the heart beats at 1–2 Hz (60–120 BPM), and its muscle fibers contract in coordinated electrical waves at the millisecond scale.", links: [{ label: "Sound Wave Alchemy — Body Frequencies", url: "https://soundwavealchemy.com/the-human-body-frequencies-the-complete-guide/" }, { label: "HeartMath — Heart Coherence Research", url: "https://www.heartmath.org/research/research-library/" }] },
  { name: "Liver", hz: "317.83 Hz / 55–60 MHz", playHz: 317.83, source: "Rife / Bio-electrical (Tainio)", evidence: "Weak", tag: "Alternative", details: "The liver is the body's largest internal organ and primary detoxification center, processing 1.5 liters of blood per minute. Rife frequency lists assign 317.83 Hz — Royal Rife claimed each organ had a specific resonant frequency that could be used therapeutically. Tainio's bio-electrical measurements claim 55–60 MHz for healthy hepatic tissue. Neither framework has peer-reviewed validation. However, legitimate medical ultrasound uses specific frequencies (2–5 MHz) to image the liver, and Focused Ultrasound Surgery (FUS/HIFU) uses frequencies around 1 MHz to ablate liver tumors non-invasively — FDA-approved and used at Johns Hopkins, Mayo Clinic, and other major centers. This demonstrates that frequency-targeted intervention on the liver is medically legitimate — just not at the frequencies Rife or Tainio claimed. In Traditional Chinese Medicine, the liver is associated with the 'Xu' (shh) healing sound and the emotion of anger. The liver has remarkable regenerative capacity — it can regrow to full size from just 25% of its original mass within weeks, a property unique among human organs.", links: [{ label: "Healing Frequencies Scale — Evoluteur", url: "https://evoluteur.github.io/healing-frequencies/healing-frequencies-scale.html" }, { label: "HIFU for Liver Tumors — Johns Hopkins", url: "https://www.hopkinsmedicine.org/health/treatment-tests-and-therapies/focused-ultrasound" }] },
  { name: "Spine", hz: "~5 Hz", playHz: 5, source: "In vivo experiments", evidence: "Moderate", tag: "Biomechanical", details: "The spine resonates at approximately 5 Hz in the vertical axis — matching the frequency of walking, running, and most human locomotion. This is not coincidence: the spine evolved to absorb and distribute 5 Hz cyclic loading efficiently through its S-curve geometry and intervertebral discs. At 15 Hz, a dangerous secondary resonance occurs that amplifies rather than absorbs vibration, causing accelerated disc degeneration, herniation, and chronic pain — this is a well-documented occupational hazard for truck drivers, helicopter pilots, and heavy equipment operators. The European Union's Physical Agents Directive (2002/44/EC) sets exposure limits specifically to protect against spinal resonance damage. Whole-body vibration therapy platforms operate above the dangerous zone (typically 25–50 Hz) and have been studied for osteoporosis prevention: a 2004 study published in the Journal of Bone and Mineral Research found that 12 months of WBV at 30 Hz, 20 min/day, increased hip bone density by 1.5% in postmenopausal women — while the control group lost 2.1%. NASA's bone loss prevention program for astronauts investigated similar protocols.", links: [{ label: "IOPscience — Organ Resonance Review", url: "https://iopscience.iop.org/article/10.1088/2516-1091/ae585b" }, { label: "EU Physical Agents Directive", url: "https://osha.europa.eu/en/legislation/directives/directive-2002-44-ec" }] },
  { name: "Skin / Tissue", hz: "285–292 Hz", playHz: 285, source: "Solfeggio (285) + Nogier A (292)", evidence: "Weak", tag: "Alternative", details: "Two independent systems converge on this frequency range for tissue healing. Solfeggio 285 Hz is claimed for cellular repair. Nogier Frequency A (292 Hz) targets ectoderm-derived tissue: skin, nerves, scar tissue, and brain — based on Paul Nogier's embryological tissue layer theory developed through auriculotherapy (ear acupuncture) in Lyon, France, 1950s–1960s. Nogier discovered that the ear's acupuncture points respond to specific frequencies based on which embryological layer the target tissue develops from: ectoderm (292 Hz), endoderm (584 Hz), mesoderm (1,168 Hz). His frequencies double in octaves: 73→146→292→584→1168→2336→4672. The foundational frequency (73 Hz, Frequency F) targets the subcortical brain. Low-Level Light Therapy (LLLT) devices now modulate LED frequencies using Nogier's system — FDA-cleared devices from Hue Light USA and others pulse photobiomodulation at these exact frequencies. A 2017 PLOS ONE study found that low-frequency mechanical vibration (50–100 Hz) applied to wounds increased angiogenesis by 45% and collagen deposition by 30% in animal models — demonstrating that vibration at tissue-relevant frequencies can accelerate healing through mechanotransduction pathways.", links: [{ label: "Nogier Frequencies — Hue Light USA", url: "https://huelightusa.com/seven-nogier-frequencies-and-benefits-of-frequency-modulation/" }, { label: "Vibration & Wound Healing — PLOS ONE", url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0172214" }] },
  { name: "Nervous System / Spinal Cord", hz: "4,672 Hz", playHz: 0, source: "Nogier Frequency E", evidence: "Weak", tag: "Nogier", details: "Nogier Frequency E (4,672 Hz) is the highest in the Nogier system, targeting the spinal cord and peripheral nerves. It is the 6th octave doubling from the foundational 73 Hz (73→146→292→584→1168→2336→4672). In Nogier's embryological framework, this frequency resonates with neural tissue that develops from the neural crest — the embryological structure that gives rise to the spinal cord, peripheral nerves, adrenal medulla, and melanocytes. The frequency is used exclusively in photobiomodulation (PBM) therapy — pulsing LED light at 4,672 Hz directed at the spine or peripheral nerve pathways. It exceeds comfortable acoustic listening range (above C8 on the piano), so it is never used as a sound healing tone. Clinical applications focus on neuropathy, sciatica, nerve damage recovery, and chronic pain syndromes. While no large-scale RCTs have isolated 4,672 Hz specifically, PBM therapy in general has over 4,000 published studies and is FDA-cleared for pain management. The Nogier frequencies are used in PBM devices by companies including Multi Radiance Medical, Hue Light, and Thor Photomedicine.", links: [{ label: "Nogier Frequencies Guide — Zone Life", url: "https://www.zonora.com/life/2023/04/23/7-nogier-frequencies-73hz-146hz-292hz-584hz-1168hz-2336hz-4672hz-5-layer-simultaneous-mix/" }, { label: "Photobiomodulation — Thor Photomedicine", url: "https://www.thorlaser.com/research/" }] },
  { name: "Digestive System", hz: "528–584 Hz", playHz: 528, source: "Solfeggio (528) + Nogier B (584)", evidence: "Weak", tag: "Alternative", details: "Two systems converge on this range for internal organs. Solfeggio assigns 528 Hz to the Solar Plexus region (Manipura Chakra) — governing the digestive organs, pancreas, and metabolic fire. Nogier Frequency B (584 Hz) targets endoderm-derived tissue: the entire digestive tract (esophagus through colon), lungs, bladder, thyroid, liver, gallbladder, pancreas, and internal organ linings. The endoderm is the innermost embryological layer — it forms the lining of every hollow internal organ. Nogier's insight was that tissue from the same embryological origin shares resonant frequency sensitivity. The vagus nerve — the longest cranial nerve, running from brainstem to colon — is central to gut function and responds to mechanical vibration. Vagus nerve stimulation (VNS) at specific frequencies is FDA-approved for epilepsy and depression, and is being studied for inflammatory bowel disease. A 2021 study in Neurogastroenterology & Motility found that transcutaneous vagus nerve stimulation at 25 Hz improved gastric motility in gastroparesis patients. While 528 and 584 Hz are above the VNS therapeutic range, sound applied to the abdomen creates mechanical vibration that propagates through visceral tissue — providing a plausible delivery mechanism for frequency-based digestive therapy.", links: [{ label: "Nogier Frequencies — Hue Light USA", url: "https://huelightusa.com/nogier-frequencies/" }, { label: "Vagus Nerve Stimulation & Gut — NIH", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5859128/" }] },
  { name: "Immune System", hz: "10–20 Hz", playHz: 10, source: "WBC oscillation + Rife", evidence: "Mixed", tag: "Mixed", details: "White blood cells (leukocytes) have been observed oscillating at approximately 10 Hz during immune surveillance — a rhythmic 'crawling' motion as they patrol tissue for pathogens. Rife frequency lists assign 20 Hz for immune stimulation. While Rife's specific claims are unvalidated, vibroacoustic therapy research at 20–120 Hz shows legitimate immune effects: a 2003 study by Olav Skille (inventor of VAT) found that 30 Hz vibration increased natural killer (NK) cell activity in cancer patients. Purring cats produce vibrations at 25–50 Hz — and veterinary research has documented that cats heal bone fractures faster than any other domestic animal, with some researchers attributing this to the mechanical stimulation of bone growth by purring frequencies. A 2001 study in JASA (Journal of the Acoustical Society of America) confirmed that domestic cat purring falls predominantly between 25–50 Hz — exactly the range shown to stimulate bone formation. Furthermore, NASA research found that vibration at 30 Hz maintained bone density in bedridden subjects who would otherwise lose bone mass. The convergence of feline healing, NASA research, and vibroacoustic clinical data at 10–50 Hz represents one of the more intriguing cross-disciplinary findings in frequency medicine.", links: [{ label: "Vibroacoustic Therapy — Wikipedia", url: "https://en.wikipedia.org/wiki/Vibroacoustic_therapy" }, { label: "Cat Purring Frequencies — JASA", url: "https://doi.org/10.1121/1.1389764" }] },
];

/* ────────────────────────────────────────────────────────────
   DATA — Ancient & Lost Frequencies
   ──────────────────────────────────────────────────────────── */
const ancient = [
  {
    title: "Great Pyramid of Giza — Acoustic Measurements", era: "~2560 BCE", origin: "Egypt", tag: "Measured", playHz: 49.5,
    summary: "Modern acoustic experiments inside the Great Pyramid reveal powerful infrasound resonance. King's Chamber: 49.5 Hz (largest amplitude), 30.5/33 Hz, standing wave at 16.2 Hz. Queen's Chamber: 118–120 Hz. Dead-end Passage: 5.13 Hz.",
    details: "All measured frequencies fall in the VLF (20–125 Hz) or infrasound (<20 Hz) range. These were recorded in near-perfect silence, suggesting the chambers themselves generate or amplify these frequencies through structural resonance. The pyramid's geometry creates natural Helmholtz resonators. Egyptian priests used the sistrum instrument which emits 40–60 kHz ultrasound. The Ebers Papyrus (1550 BCE) prescribes ritual recitation as healing — sound as carrier of ka (life force).",
    links: [
      { label: "Great Pyramid Acoustic Experiment — Ancient Origins", url: "https://www.ancient-origins.net/artifacts-other-artifacts/great-pyramid-0012166" },
      { label: "Pyramid Infrasound Study — Ancient Origins", url: "https://www.ancient-origins.net/artifacts-other-artifacts/great-pyramid-0012179" },
      { label: "Cavity Resonance Study — ResearchGate", url: "https://www.researchgate.net/publication/381806657" },
    ],
  },
  {
    title: "Hal Saflieni Hypogeum — 111 Hz Temple Resonance", era: "~3500 BCE", origin: "Malta", tag: "Measured", playHz: 111,
    summary: "The only prehistoric underground temple in the world resonates at 110–111 Hz. Brain scans show this frequency deactivates language centers and shifts processing to the right hemisphere (emotional/intuitive). Same frequency found at multiple ancient sites worldwide.",
    details: "Research by Paolo Debertolis and team measured the Oracle Chamber's dominant resonance at 110–111 Hz. EEG studies on subjects exposed to 110 Hz showed significantly lower left temporal region activity (language) and prefrontal cortex asymmetry shift from left-dominant to right-dominant. This is compatible with deactivation of language centers and enhanced emotional/intuitive processing. Multiple ancient temple sites across the Mediterranean show similar acoustic engineering targeting this frequency range.",
    links: [
      { label: "Healing with Sound in Ancient Temples: 111 Hz — Ancient Origins", url: "https://www.ancient-origins.net/unexplained-phenomena/healing-sound-ancient-temples-111hz-006749" },
      { label: "Archaeoacoustic Analysis — ResearchGate", url: "https://www.researchgate.net/publication/282480957" },
      { label: "Frequency Spectrum Analysis — arXiv", url: "https://arxiv.org/pdf/2010.13697" },
    ],
  },
  {
    title: "Pythagorean Tuning — The Music of the Spheres", era: "~530 BCE", origin: "Ancient Greece", tag: "Mathematical", playHz: 432,
    summary: "Pythagoras discovered that harmonious intervals correspond to simple integer ratios: octave (2:1), fifth (3:2), fourth (4:3). He extended this to cosmology, believing planets emit tones creating 'Musica Universalis.' At A=432 Hz, middle C = 256 Hz (2^8) — every C is a power of 2.",
    details: "Pythagorean tuning uses only powers of 2 and 3 for all intervals — every ratio is a rational number reflecting divine order. Modern equal temperament (adopted 17th-19th century) uses irrational numbers (12th root of 2). What was lost: pure intervals with zero beating. The Pythagorean comma (~23.5 cents) represents the gap between 12 stacked fifths and 7 octaves. In equal temperament, only the octave is mathematically pure. Scale at C=256: C=256, D=288, E=324, F=341.33, G=384, A=432, B=486, C'=512.",
    links: [
      { label: "Pythagorean Tuning — John Carlos Baez", url: "https://johncarlosbaez.wordpress.com/2023/10/07/pythagorean-tuning/" },
      { label: "Equal Temperament vs Pythagorean — PISRT", url: "https://pisrt.org/psr-press/journals/oms/01-vol-10-2026-issue-1/equal-temperament-vs-pythagorean-tuning-a-mathematical-plot-line/" },
      { label: "Comparing Three Tuning Systems — Holy Cross", url: "https://mathcs.holycross.edu/~groberts/Courses/MA110/Handouts/Temperament.pdf" },
    ],
  },
  {
    title: "432 Hz vs 440 Hz — The Tuning Debate", era: "Historical", origin: "Global", tag: "Debated", playHz: 432,
    summary: "A=432 Hz aligns with Pythagorean tuning (C=256 Hz = 2^8). A=440 Hz became ISO standard in 1953. Small studies show 432 Hz may reduce heart rate and promote relaxation more than 440 Hz, but the 'Nazi conspiracy' origin story is debunked.",
    details: "Historical pitch varied wildly: Renaissance 380–480 Hz, Baroque (Bach) ~415 Hz, Mozart ~421-430 Hz. Verdi preferred 430 Hz (practical, not mystical). France standardized 435 Hz in 1859. USA/England already used 440 Hz before the 1939 conference. Cymatics: 432 Hz produces visually harmonious patterns, but this depends on plate geometry, not cosmic truth. Studies: greater heart rate decrease, improved sleep quality, lower tension vs 440 Hz in small trials. The mathematical elegance of C=256 (2^8) is real but has no demonstrated biological significance beyond aesthetics.",
    links: [
      { label: "432 Hz vs 440 Hz History — iZotope", url: "https://www.izotope.com/en/learn/tuning-standards-explained" },
      { label: "Conspiracy Debunked — Jakub Marian", url: "https://jakubmarian.com/the-432-hz-vs-440-hz-conspiracy-theory/" },
      { label: "432 vs 440 Health Effects — ScienceDirect", url: "https://www.sciencedirect.com/science/article/abs/pii/S1550830718302763" },
      { label: "432 Hz Scientific Evidence — Sacred Forest", url: "https://sacredforest.store/en-us/blogs/aktualnosci/432-hz-frequency-scientific-evidence-research" },
    ],
  },
  {
    title: "Hurrian Hymn No. 6 — Oldest Known Melody", era: "~1400 BCE", origin: "Ugarit (Syria)", tag: "Archaeological", playHz: 0,
    summary: "The oldest substantially complete notated melody, written in cuneiform on clay. A hymn to the moon goddess Nikkal. Describes intervals for a nine-stringed lyre using the Babylonian diatonic system. Five rival decipherments exist — no absolute Hz values can be determined.",
    details: "Excavated from ancient Ugarit. Functions like tablature — specifying string pairs rather than individual notes. The intervals are consistent with Babylonian tuning: 7 modes built on perfect fourths (4:3) and fifths (3:2). The Babylonians recognized the octave (substituting 1 for 8). Their base-60 math facilitated precise fraction work for pitch relationships. The CBS 10996 tablet lists 14 intervals used in tuning.",
    links: [
      { label: "Musical Instruments from Ur — Penn Museum", url: "https://www.penn.museum/sites/expedition/the-musical-instruments-from-ur-and-ancient-mesopotamian-music/" },
      { label: "Babylonian Musical Notation — M.L. West (PDF)", url: "https://musicircle.net/wp-content/uploads/2018/08/Babylonian-Notatin-and-the-Hurrian-Melodic-Texts_Music-and-Letters-1994-WEST-161-79.pdf" },
      { label: "Hurrian Songs — Wikipedia", url: "https://en.wikipedia.org/wiki/Hurrian_songs" },
    ],
  },
  {
    title: "Om (Aum) — Sacred Chant Frequency", era: "Ancient", origin: "India / Tibet", tag: "Measured", playHz: 136.1,
    summary: "Spectral analysis of Om chanting reveals frequencies from 99.3 to 825 Hz, with significant energy at 136.1 Hz (the commonly cited Om frequency) and harmonics spanning the Solfeggio range. EEG shows experienced monks produce gamma wave activity (80–120 Hz) during chanting.",
    details: "Published frequency analysis measured Om using FFT tools across multiple practitioners. The three syllables (A-U-M) activate different chakra regions: A=Root, U=Heart, M=Crown. Sustained Om chanting at 136.1 Hz correlates with the Earth's orbital frequency (Cousto calculation). Sama Veda chanting produces frequencies in the alpha range (8-12 Hz). 7.83 Hz correlation with Schumann Resonance is claimed but not directly measured from chanting.",
    links: [
      { label: "Frequencies of Om Mani Padme Hum — ResearchGate", url: "https://www.researchgate.net/publication/301284106" },
      { label: "Om Frequency Analysis — Academia.edu", url: "https://www.academia.edu/93216949" },
    ],
  },
  {
    title: "Chinese Six Healing Sounds (Liu Zi Jue)", era: "420–589 CE", origin: "China", tag: "Traditional", playHz: 0,
    summary: "Six vocal sounds mapped to organs: Xu (liver), He (heart), Hu (spleen), Si (lungs), Chui (kidneys), Xi (triple warmer). No traditional Hz values — emphasis on vibrational quality of vocalization and resonance within the body cavity.",
    details: "Dating to the Southern and Northern Dynasties period. Combined with specific breathing patterns and qigong movements. The practice predates frequency measurement by over a millennium. Modern practitioners sometimes assign arbitrary Hz values, but the original system is entirely about the qualitative sensation of vibration in the body cavity, not measurable frequency.",
    links: [
      { label: "Liu Zi Jue — Wikipedia", url: "https://en.wikipedia.org/wiki/Liu_Zi_Jue" },
    ],
  },
  {
    title: "Planetary Frequencies — Cosmic Octave", era: "1978", origin: "Hans Cousto (Switzerland)", tag: "Calculated", playHz: 136.1,
    summary: "Swiss mathematician Hans Cousto calculated audible frequencies from planetary orbital periods by octave-shifting. Sun=126.22 Hz, Moon=210.42 Hz, Earth Year=136.1 Hz (Om!), Mars=144.72 Hz, Jupiter=183.58 Hz, Saturn=147.85 Hz.",
    details: "Method: take the orbital period of a planet, calculate its frequency (1/period), then double it (octave shift) until it reaches the audible range. Earth's year frequency octave-shifted = 136.1 Hz — matching the traditional Om chanting frequency. Venus and Earth form an 8:13 ratio (Fibonacci numbers approaching phi). Cousto published 'The Cosmic Octave' in 1978. Planetary tuning forks are commercially available based on these calculations.",
    links: [
      { label: "Planetary Frequencies Table — Planetware", url: "https://www.planetware.de/octave/table.html" },
      { label: "Comprehensive Planetary Frequency Guide — Harmonance", url: "https://harmonance.com/resources/a-comprehensive-guide-to-planetary-frequencies-the-symphony-of-celestial-bodies" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Sacred Tibetan Tones
   ──────────────────────────────────────────────────────────── */
const tibetan = [
  {
    title: "Tibetan Singing Bowls — Acoustics & Frequencies", tag: "Measured", playHz: 528,
    summary: "Antique hand-hammered bronze bowls produce 4–18 simultaneous frequency partials. Range: 110–660+ Hz. Each bowl creates monaural beats (not binaural) from mode splitting — tiny irregularities cause two closely-spaced frequencies that pulse at theta brainwave rates (4–8 Hz).",
    details: "MIT researchers Terwagne & Bush published the definitive physics paper on singing bowl acoustics (2011, Nonlinearity). Bowl at fundamental 482.61 Hz produces a beat of 6.68 Hz — precisely theta band. Alloy is typically 77% copper / 22% tin (bell metal bronze), NOT the mythical 7 sacred metals (debunked by metallurgical testing). Bowl types: Thadobati (straight walls, 5.5–10\"), Jambati (largest, 8.5–14\"), Manipuri (shallowest), Ultabati, Naga, Lingam, Remuna. Kim & Choi (2023) measured up to 251% increase in brainwave spectral magnitudes at the beat frequency during singing bowl exposure.",
    links: [
      { label: "MIT Physics Paper — arXiv", url: "https://arxiv.org/abs/1106.6348" },
      { label: "Kim & Choi Brainwave Study — PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/37372766/" },
      { label: "Frequency Heatmap by Bowl Type — Best Singing Bowls", url: "https://bestsingingbowls.com/style-frequency-heatmap/" },
      { label: "Seven Metal Myth Debunked — Bells of Bliss", url: "https://bellsofbliss.com/blogs/good-to-know/the-seven-metal-singing-bowls-myth" },
      { label: "The Pulse of Singing Bowls — Bells of Bliss", url: "https://bellsofbliss.com/blogs/good-to-know/the-pulse-of-singing-bowls-brainwaves-and-brain-entrainment" },
    ],
    media: [
      { type: "Audio", label: "7 Chakra Meditation — 21 Antique Bowls (70 min)", url: "https://www.youtube.com/watch?v=Nb3okem4OCk" },
      { type: "Audio", label: "9 Hours Tibetan Healing Sounds", url: "https://www.youtube.com/watch?v=OW7TH2U4hps" },
      { type: "Audio", label: "528 Hz Antique Mani Bowl (33 min)", url: "https://www.youtube.com/watch?v=eNmjWjpxUOM" },
      { type: "FLAC", label: "33 Bowls — Hi-Res Antique Bowl Recordings", url: "https://33bowls.bandcamp.com/" },
      { type: "Tool", label: "Online Frequency Analyzer — Bells of Bliss", url: "https://bellsofbliss.com/pages/sound-frequency-analyzer" },
      { type: "Tool", label: "Interactive Singing Bowl Soundscape — myNoise", url: "https://mynoise.net/NoiseMachines/singingBowlsDroneGenerator.php" },
    ],
  },
  {
    title: "Gyuto & Gyume Monks — Overtone Chanting", tag: "Measured", playHz: 75,
    summary: "Each monk produces multiple notes simultaneously — the 'One Voice Chord.' Fundamental ~75 Hz (below normal vocal range). Up to 9 distinguishable overtones across 3 octaves. Gyuto uses 'ocean-rolling voice'; Gyume uses 'mountain-cracking voice.'",
    details: "In 1967, Huston Smith recorded the Gyuto monks at their monastery in India. MIT sound engineers confirmed a single voice producing a chord. The 5th and 10th harmonics (major third intervals) are spiritually significant. Both styles trace to Tsongkhapa (14th-15th century) who had visions yielding two chanting methods. Mickey Hart of the Grateful Dead heard Smith's tape in SF, sparking Western interest. Technique uses vestibular fold engagement for the extremely low fundamental. Album: 'Music of Tibet' (Anthology Records).",
    links: [
      { label: "Gyuto Monks Harmonics — ANU Reporter", url: "https://reporter.anu.edu.au/all-stories/the-harmonic-sounds-of-the-gyuto-monks" },
      { label: "Ancient Practice, Modern Sound — NPR", url: "https://www.npr.org/2009/03/24/102234687/gyuto-monks-ancient-practice-modern-sound" },
      { label: "The One Voice Chord — Research", url: "http://vaczy.dk/htm/voice.html" },
      { label: "Overtone Singing Physics — UBC", url: "https://wiki.ubc.ca/Course:PHYS341/Archive/2016wTerm2/OvertoneSinging" },
    ],
    media: [
      { type: "Video", label: "Gyuto Tantra Excerpt — Monks of Gyuto Tantric College", url: "https://www.youtube.com/watch?v=mtparAI9TRE" },
      { type: "Album", label: "Gyuto Monks Tantric Choir — Full Album", url: "https://www.youtube.com/watch?v=C5Dz84buYRs" },
      { type: "Playlist", label: "Gyuto Monks — YouTube Music Playlist", url: "https://www.youtube.com/playlist?list=OLAK5uy_m84FDQc6FDZl_TvjkT-LV0ZO8oRZsU6hc" },
      { type: "Spotify", label: "Gyuto Monks on Spotify", url: "https://open.spotify.com/album/5xaYkpGEv6uaWi05al3ZW3" },
    ],
  },
  {
    title: "Five Warrior Syllables — Bon Tradition", tag: "Traditional", playHz: 136.1,
    summary: "The oldest Tibetan spiritual tradition. Five sacred sounds mapped to 5 chakras: A (crown/white), OM (throat/red), HUNG (heart/blue), RAM (navel/yellow), DZA (secret/green). Called 'warriors' for their power to conquer ignorance.",
    details: "The Bon tradition predates Buddhism in Tibet. These are considered the first sounds arising from primordial essence. Unlike Western New Age chakra-note mapping, the traditional Tibetan system uses 5 chakras (not 7) and maps via color, shape, deity, and seed syllable — not Hz frequencies. Each syllable connects to a Buddha family: Vairocana (OM/white/center), Akshobhya (HUNG/blue/east), Ratnasambhava (TRAM/yellow/south), Amitabha (HRI/red/west), Amoghasiddhi (AH/green/north). Teacher: Tenzin Wangyal Rinpoche, Ligmincha Institute.",
    links: [
      { label: "Five Warrior Syllables — Shambhala", url: "https://www.shambhala.com/snowlion_articles/the-practice-of-the-five-warrior-syllables/" },
      { label: "Tibetan Sound Healing — Ligmincha Learning", url: "https://ligminchalearning.com/tibetan-sound-healing/" },
      { label: "Five Buddha Families & Mantras — Buddha Weekly", url: "https://buddhaweekly.com/five-buddhas-5-wisdoms-5-mantras-their-practices-symbols-seed-syllables-and-visualizations/" },
      { label: "Book: Tibetan Sound Healing — Amazon", url: "https://www.amazon.com/Tibetan-Sound-Healing-Practices-Obstacles/dp/1604070951" },
    ],
  },
  {
    title: "Tibetan Instruments — Dungchen, Kangling, Damaru, Tingsha, Drilbu", tag: "Traditional", playHz: 58,
    summary: "Dungchen (long horn): ~58 Hz fundamental, 3–12 feet long. Kangling (thighbone trumpet): Chod ritual. Damaru (hand drum): always paired with drilbu (bell). Tingsha (cymbals): 2000+ Hz, marks meditation. Rolmo: large cymbals for wrathful practices.",
    details: "Dungchen produces 2–3 deep notes near Bb1 (58 Hz). The kangling is literally carved from a human femur — its sound is said to please wrathful deities and terrify evil spirits. Damaru's fading resonance reflects sunyata (emptiness). Tingsha cuts through thought patterns for immediate mental focus. The umze (chant leader) uses rolmo to conduct the monastery orchestra. The drilbu symbolizes wisdom (prajna) and is always paired with the dorje (skillful means) in ritual.",
    links: [
      { label: "Dungchen Acoustics — ResearchGate", url: "https://www.researchgate.net/publication/272529513" },
      { label: "Kangling — Wikipedia", url: "https://en.wikipedia.org/wiki/Kangling" },
      { label: "Met Museum — Drilbu & Dorje", url: "https://www.metmuseum.org/art/collection/search/502009" },
      { label: "Damaru — Wikipedia", url: "https://en.wikipedia.org/wiki/Damaru" },
    ],
    media: [
      { type: "Video", label: "Tibetan Sacred Ceremony — 8 Hours Full Ambience", url: "https://www.youtube.com/watch?v=4ZBqgYqXZhY" },
      { type: "Video", label: "Tibetan Sound Revelation Documentary", url: "https://www.youtube.com/watch?v=OPcmirIGA0E" },
      { type: "Museum", label: "Himalayan Art — Damaru Collection", url: "https://www.himalayanart.org/search/set.cfm?setID=833" },
      { type: "Museum", label: "Rubin Museum of Himalayan Art", url: "https://rubinmuseum.org/our-collection/" },
    ],
  },
  {
    title: "Clinical Evidence — Singing Bowl Therapy", tag: "Peer-Reviewed", playHz: 0,
    summary: "Systematic reviews (2025): 14+ quantitative studies show significant reductions in anxiety, depression; increases in HRV and theta/delta brainwaves. A single session reduced tension, anger, fatigue, and depressed mood (all p<.001). Previously naive meditators benefited most.",
    details: "Key studies: Lin, Yang & Wang (2025, Healthcare) — 14 studies, 6 databases. Goldsby et al. (2017, JEBIM) — 62 participants, all negative mood states significantly reduced. Kim & Choi (2023) — 251% increase in brainwave magnitudes at beat frequency. RCT (2023, IJERPH) — TSB group showed significant anxiety reduction, increased HRV, decreased blood pressure and heart rate. University Clinic Regensburg (2022) — EEG shift to mindful/meditative alpha state during Klangmassage.",
    links: [
      { label: "2025 Systematic Review — PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/40868617/" },
      { label: "Goldsby 2017 Study — SAGE Journals", url: "https://journals.sagepub.com/doi/10.1177/2156587216668109" },
      { label: "Brainwave Synchronization — PMC", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10298245/" },
      { label: "Relaxation RCT — PMC", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9955072/" },
      { label: "Neurophysiological Effects — MDPI", url: "https://www.mdpi.com/1648-9144/58/5/594" },
      { label: "Therapeutic Effects Review 2025 — ScienceDirect", url: "https://www.sciencedirect.com/science/article/pii/S2213422025000241" },
    ],
  },
  {
    title: "The Origin Controversy — Are 'Tibetan' Bowls Actually Tibetan?", tag: "Scholarship", playHz: 0,
    summary: "No hard evidence that singing bowls are ancient or even Tibetan. Popularity surged in the 1990s alongside Western interest in Tibet. Metallurgical testing debunks the 7-metal myth. Western chakra-note mapping (C=Root, B=Crown) has no basis in traditional Tibetan practice.",
    details: "Scholar Donald Lopez Jr. noted myths have infiltrated even prestigious publications. Tibetan writers in North America question the pedigree. Mitch Nur's academic paper separates truth from myth. Traditional Tibetan system uses 5 chakras (not 7) mapped via seed syllables and color — not Western musical notes. Antique bowls were never decorated with Buddhist imagery (a modern addition). Forging tradition centered in Nepal's Kathmandu Valley, not Tibet. Despite contested origins, clinical evidence for health effects is real and growing.",
    links: [
      { label: "Where Did 'Tibetan' Bowls Come From? — Tricycle", url: "https://tricycle.org/article/tibetan-singing-bowls/" },
      { label: "Singing Bowls: Separating Truth from Myth — Mitch Nur (Academia.edu)", url: "https://www.academia.edu/33267014" },
      { label: "Chakra-Note Myth — Bells of Bliss", url: "https://bellsofbliss.com/blogs/good-to-know/notes-and-chakras-spiritual-fraud-with-the-best-intentions" },
      { label: "Antique Bowl Authenticity Guide", url: "https://antiquesingingbowls.com/guidance/distinguish-old-bowls" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Scientific Basis
   ──────────────────────────────────────────────────────────── */
const science = [
  {
    title: "Vibroacoustic Therapy (VAT)", tag: "Moderate", year: "1980s–Present", playHz: 40,
    summary: "Clinically studied therapy delivering 30–120 Hz sine waves directly to the body via transducer furniture. 40 Hz treatment for fibromyalgia: significant pain improvement; 25% discontinued medications.",
    details: "Invented by Norwegian therapist Olav Skille in the 1980s. VAT delivers low-frequency sine waves (30–120 Hz) through transducers embedded in beds, chairs, or mats — the body is literally vibrated from the inside out. Key clinical findings: (1) Fibromyalgia: a controlled study at Duke University Medical Center used twice-weekly 40 Hz treatments for 5 weeks; significant pain improvement on the VAS scale; 25% of participants discontinued all pain medications. (2) Chronic musculoskeletal pain: 29 patients showed significant improvement in pain, mood, relaxation, and sleep quality. (3) Parkinson's Disease: preliminary studies showed improved motor control and reduced rigidity during 30–40 Hz sessions. (4) NICU neonatal care: low-frequency vibration mats improved weight gain and sleep in premature infants. Mechanism: vibration activates Pacinian corpuscles (mechanoreceptors detecting up to 1,000 Hz), stimulates proprioceptive nerve endings, increases local blood flow, and shifts the autonomic nervous system toward parasympathetic dominance. The protocol is precise: specific frequencies for specific conditions — 40 Hz for muscle pain, 52 Hz for joint stiffness, 68 Hz for anxiety. Sessions last 23–30 minutes. Contraindications: pacemakers, DBS devices, pregnancy, active psychosis, sound-triggered epilepsy. VAT is now used in hospitals in Finland, Norway, Sweden, UK, and the US. It is distinct from WBVT (whole-body vibration training) which uses mechanical plates.",
    links: [
      { label: "Vibroacoustic Therapy — Wikipedia", url: "https://en.wikipedia.org/wiki/Vibroacoustic_therapy" },
      { label: "30 Hz Frequency Protocol — Vibroacoustic Solutions", url: "https://vibroacousticsolutions.com/blogs/vibroacoustic-therapy-frequencies/vibroacoustic-therapy-30-hz-frequency" },
    ],
  },
  {
    title: "Cymatics — Visible Sound", tag: "Foundational", year: "1787–Present", playHz: 432,
    summary: "Sand, water, or particles on vibrating plates self-organize into geometric patterns at specific frequencies. Each frequency = unique pattern. Higher frequencies = more complex geometry. The human body is ~60% water.",
    details: "Ernst Chladni (1787) drew a violin bow across metal plates covered in sand, producing 'Chladni figures' — the sand gathering at nodal lines (points of no vibration). Each frequency produces a unique, repeatable geometric pattern. Hans Jenny (1960s) coined 'cymatics' from the Greek 'kyma' (wave) and used sine wave generators to systematically catalog these patterns. His key discoveries: (1) Every frequency creates a distinct and repeatable pattern. (2) Higher frequencies produce more intricate geometry. (3) In spherical fluid volumes, all five Platonic solids appear — tetrahedra, cubes, octahedra, icosahedra, and dodecahedra emerge at specific frequencies. (4) When frequencies transition, patterns dissolve into chaos before reorganizing into the new pattern — Jenny called this the 'breakdown before breakthrough.' Modern applications: (1) Cymatics imaging is used in industrial non-destructive testing to detect cracks in aircraft components. (2) CymaScope technology by acoustic researcher John Stuart Reid creates visual representations of sounds — he has cymascoped dolphin vocalizations, music therapy sessions, and even crop circle frequencies. (3) Dr. Masaru Emoto's controversial water crystal experiments (photographing frozen water exposed to different music/words) are often cited alongside cymatics, though his methodology was criticized for lack of blinding. The human body is approximately 60% water by mass — providing the theoretical basis for how sound frequencies could influence cellular structure. While cymatics proves sound physically restructures matter, the leap from 'sand on a plate' to 'healing organs' requires mechanisms not yet established.",
    links: [
      { label: "Cymatics & Sound Healing — Enso Sensory", url: "https://ensosensory.com/blogs/news/cymatics-and-sound-healing-visual-evidence" },
      { label: "From Cymatics to Sound Therapy — PhilArchive", url: "https://philarchive.org/archive/CHRFCT" },
      { label: "Hans Jenny Cymatics Research — Geometry Matters", url: "https://geometrymatters.com/hans-jenny-and-the-science-of-sound-cymatics/" },
    ],
  },
  {
    title: "Binaural Beats — Brainwave Entrainment", tag: "Moderate", year: "1839–Present", playHz: 10,
    summary: "Two slightly different frequencies in each ear (headphones required). Brain perceives the difference as a 'beat.' 200 Hz left + 210 Hz right = 10 Hz perceived alpha beat. Isochronic tones (pulsed single tone, no headphones) produce strongest cortical response.",
    details: "Discovered by physicist Heinrich Wilhelm Dove in 1839, forgotten for a century, then rediscovered by biophysicist Gerald Oster in 1973 (Scientific American). The mechanism: when two tones of slightly different frequencies are presented separately to each ear via headphones, the brain perceives a phantom 'beat' at the frequency difference. Example: 200 Hz left + 210 Hz right = the brain perceives a 10 Hz beat (alpha range). This is called 'frequency following response' (FFR) — the brain's electrical activity entrains to the beat frequency. Key studies: (1) Frontiers in Psychology (2021) — personalized theta (6 Hz) and beta (18 Hz) binaural beats successfully entrained EEG activity in target bands. (2) A meta-analysis of 22 studies found significant effects on anxiety reduction and memory performance. (3) The U.S. Army's Gateway Process (1983) used binaural beats (Monroe Institute's Hemi-Sync) to induce altered states for remote viewing — the recently declassified CIA report describes the technique in detail. Three entrainment methods compared: Binaural beats (two tones, headphones required, subtle effect) vs. Monaural beats (pre-mixed externally, no headphones, moderate effect) vs. Isochronic tones (single tone pulsed on/off, no headphones, strongest cortical response). Duration: 15–60 minutes for therapeutic effect. Individual variation is high — approximately 30% of people show strong entrainment, 50% moderate, 20% minimal. Never use while driving or operating machinery. The Monroe Institute has trained thousands using Hemi-Sync technology, and Brain.fm uses a proprietary variant for commercial focus/sleep applications.",
    links: [
      { label: "Binaural Beats — WebMD", url: "https://www.webmd.com/balance/what-are-binaural-beats" },
      { label: "Personalized Binaural Beats Study — Frontiers", url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.764068/full" },
      { label: "Binaural vs Monaural vs Isochronic — Brain.fm", url: "https://www.brain.fm/blog/binaural-beats-vs-monaural-beats-vs-isochronic-tones" },
    ],
  },
  {
    title: "Schumann Resonance — Earth's Electromagnetic Heartbeat", tag: "Moderate", year: "1952–Present", playHz: 7.83,
    summary: "7.83 Hz electromagnetic resonance between Earth's surface and ionosphere. Falls at theta-alpha boundary. 2022 RCT: 7.83 Hz device for insomnia showed improvements vs. placebo. Harmonics: 14.3, 20.8, 27.3, 33.8 Hz.",
    details: "The Earth itself resonates. Physicist Winfried Otto Schumann predicted it mathematically in 1952; first measured in 1954. Lightning strikes (40–50 per second globally) excite the electromagnetic cavity between Earth's surface and ionosphere, producing standing waves at 7.83 Hz (fundamental) with harmonics at 14.3, 20.8, 27.3, and 33.8 Hz. The fundamental drifts between 7.4–8.2 Hz based on ionospheric conditions, solar activity, and season. Key findings: (1) Max Planck Institute researcher Rütger Wever's underground bunker experiments (1960s–70s): volunteers living in electromagnetic-shielded bunkers for weeks developed circadian rhythm disruption, headaches, and emotional distress — symptoms that reversed when a 7.83 Hz electromagnetic field was reintroduced. (2) A 2006 study by Cherry found real-time coherence between Schumann resonance variations and human brain activity in the 6–16 Hz band — when the Schumann resonance shifted, human brainwaves shifted with it. (3) 2022 double-blind RCT: 40 adults with chronic insomnia used a 7.83 Hz device for 4 weeks; significant improvement vs. placebo in sleep onset latency and total sleep time. (4) HeartMath Institute's Global Coherence Initiative monitors Schumann resonances alongside human HRV data from thousands of participants, finding correlations between geomagnetic/Schumann activity and collective human physiological states. The 7.83 Hz fundamental falls precisely at the boundary between theta (4–8 Hz) and alpha (8–13 Hz) brainwaves — the transition zone associated with the hypnagogic state, meditation, and creative insight. Some researchers call it Earth's 'heartbeat.' Astronauts on the ISS are exposed to weaker Schumann resonances due to altitude — NASA has considered Schumann generators for spacecraft.",
    links: [
      { label: "Schumann Resonance & Bioregulation — BRMI", url: "https://www.brmi.online/post/2019/09/20/schumann-resonances-and-their-effect-on-human-bioregulation" },
      { label: "Insomnia RCT — PMC", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9189153/" },
      { label: "Is Earth's Heartbeat Influencing Behavior? — Big Think", url: "https://bigthink.com/hard-science/schumann-resonance-earths-heartbeat/" },
    ],
  },
  {
    title: "Royal Rife Frequency Therapy", tag: "Rejected", year: "1920s–1971", playHz: 727,
    summary: "Every microorganism has a 'Mortal Oscillatory Rate' (MOR). Matching that frequency shatters it. Common Rife frequencies: 727 Hz (general), 787 Hz (bacterial), 880 Hz (inflammation). Condemned by AMA — no peer-reviewed replication.",
    details: "Royal Raymond Rife (1888–1971) was an American inventor who built the Universal Microscope — claimed to achieve 60,000x magnification using multiple prisms and UV light, which he said allowed him to observe living viruses (impossible with standard optical microscopes of the era). His theory: every microorganism has a specific electromagnetic frequency (Mortal Oscillatory Rate/MOR) — exposure to this frequency at sufficient intensity destroys it, like an opera singer shattering a wine glass. He claimed to successfully treat 16 terminal cancer patients in 1934 in a clinical trial supervised by University of Southern California physicians — all reportedly recovered. The story goes that the AMA then suppressed his technology. Common Rife frequencies circulated today: 727 Hz (general infection), 787 Hz (all-purpose bacterial), 880 Hz (staphylococcus/inflammation), 465 Hz (candida/fungal). However, Rife's original frequencies were in the kHz-MHz range — the audio-range frequencies used by modern 'Rife machines' were derived decades later by researchers like John Crane and are several orders of magnitude different. The 1934 trial has no surviving documentation that meets peer-review standards. In 1958, California labs tested a Rife-type device and found it safe to use but the AMA blocked further testing. Modern Rife devices are classified as pseudomedical by the FDA and FTC. That said, Novocure's Tumor Treating Fields (TTFields) — FDA-approved for glioblastoma in 2011 — use electromagnetic fields at 100–300 kHz to disrupt cancer cell division, providing a striking modern parallel to Rife's concept, even though the mechanism and frequencies differ entirely.",
    links: [
      { label: "Royal Rife — Wikipedia", url: "https://en.wikipedia.org/wiki/Royal_Rife" },
      { label: "Rife Frequency Chart — Stop Fighting Cancer", url: "https://www.stopfightingcancer.com/rife-machine-frequency-chart-your-guide-to-vibrational-therapy/" },
      { label: "Rife Machine & Cancer — Healthline", url: "https://www.healthline.com/health/rife-machine-cancer" },
    ],
  },
  {
    title: "Frequency Specific Microcurrent (FSM)", tag: "Moderate", year: "1997–Present", playHz: 0,
    summary: "Pairs of microampere-level electrical frequencies targeting specific conditions + tissues. 4,000+ trained practitioners. Cleveland Clinic acknowledges FSM. Uses sub-perceptible current — not sound.",
    details: "Developed by Dr. Carolyn McMakin in 1997 after acquiring a list of frequencies from a retired osteopath who had been using them since the 1920s on a two-channel microcurrent device. FSM uses pairs of sub-perceptible electrical frequencies: Channel A targets the condition (40 Hz for inflammation, 124 Hz for scarring, 18 Hz for hemorrhage) while Channel B targets the tissue type (396 Hz for nerve, 62 Hz for muscle, 40 Hz for connective tissue). The current is measured in microamperes (millionths of an amp) — patients feel nothing. Key clinical evidence: (1) A study on delayed-onset muscle soreness (DOMS) found FSM reduced inflammatory cytokines (IL-1, IL-6, TNF-alpha) by 10–20x within 90 minutes — results so dramatic the researchers initially disbelieved them and repeated the study. Published in the Journal of Bodywork and Movement Therapies. (2) Traumatic brain injury: case series showed improvement in cognitive function, mood, and sleep. (3) Fibromyalgia associated with cervical spine trauma: controlled study showed significant pain reduction. (4) Cleveland Clinic lists FSM as a treatment option for chronic pain. Over 4,000 practitioners trained worldwide across 20+ countries. The mechanism is believed to involve ATP production: microcurrent at the right frequency increases cellular ATP by up to 500% (Cheng et al., 1982, Clinical Orthopaedics) — providing cells with the energy needed for repair. FSM uses electrical current, not acoustic sound, making it distinct from other frequency therapies — but the dual-frequency targeting concept is conceptually similar to Rife and Nogier.",
    links: [
      { label: "FSM — Cleveland Clinic", url: "https://my.clevelandclinic.org/health/treatments/15935-frequency-specific-microcurrent" },
      { label: "FSM Science & Protocols — BRMI", url: "https://www.brmi.online/post/frequency-specific-microcurrent-fsm-the-science-protocols-and-healing-potential-of-frequency-me" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   DATA — Brainwave Reference
   ──────────────────────────────────────────────────────────── */
const brainwaves = [
  { band: "Delta", range: "0.5–4 Hz", state: "Deep sleep, healing, restoration", color: "text-pulse", use: "Insomnia, deep recovery, pain relief", method: "Binaural beats, PEMF devices" },
  { band: "Theta", range: "4–8 Hz", state: "Deep meditation, creativity, REM, trance", color: "text-pulse", use: "Meditation, creativity, shamanic drumming", method: "Binaural beats, singing bowls, drumming (3–7 BPS)" },
  { band: "Alpha", range: "8–13 Hz", state: "Calm wakefulness, quiet reflection", color: "text-signal", use: "Stress relief, mindfulness, light meditation", method: "Binaural beats, Om chanting, Schumann devices" },
  { band: "SMR", range: "12–15 Hz", state: "Calm focus without anxiety", color: "text-signal", use: "Attention, neurofeedback", method: "Isochronic tones, neurofeedback" },
  { band: "Beta", range: "15–30 Hz", state: "Active thinking, problem-solving", color: "text-ember", use: "Study, work, concentration", method: "Binaural beats, isochronic tones" },
  { band: "Gamma", range: "30–100+ Hz", state: "Peak cognition, memory integration", color: "text-ember", use: "Cognitive enhancement, Alzheimer's protocol (40 Hz)", method: "40 Hz light/sound stimulation, Tibetan chanting" },
];

/* ────────────────────────────────────────────────────────────
   DATA — Timeline
   ──────────────────────────────────────────────────────────── */
const timeline = [
  { year: "~3500 BCE", event: "Hal Saflieni Hypogeum built in Malta — Oracle Chamber resonates at 111 Hz" },
  { year: "~2560 BCE", event: "Great Pyramid of Giza constructed — chambers resonate at 5–120 Hz" },
  { year: "~2500 BCE", event: "Lyres of Ur — earliest stringed instruments with diatonic tuning (4ths and 5ths)" },
  { year: "~1800 BCE", event: "Babylonian cuneiform tablets document 7-mode heptatonic tuning system" },
  { year: "~1550 BCE", event: "Ebers Papyrus prescribes ritual recitation as healing — sound as carrier of ka" },
  { year: "~1400 BCE", event: "Hurrian Hymn No. 6 — oldest complete melody, cuneiform notation for 9-string lyre" },
  { year: "~530 BCE", event: "Pythagoras discovers musical ratios: octave (2:1), fifth (3:2), fourth (4:3)" },
  { year: "~500 BCE", event: "Pythagoras proposes Musica Universalis — planets emit tones as they orbit" },
  { year: "~420 CE", event: "Chinese Six Healing Sounds (Liu Zi Jue) codified — organ-specific vocal tones" },
  { year: "~800 CE", event: "Himalayan singing bowl forging tradition established in Nepal's Kathmandu Valley" },
  { year: "~990 CE", event: "Guido d'Arezzo develops solfege system (Ut-Re-Mi-Fa-Sol-La) from Hymn to St. John" },
  { year: "~1000 CE", event: "Tibetan Buddhist overtone chanting traditions established at Gyuto and Gyume monasteries" },
  { year: "1787", event: "Ernst Chladni demonstrates visible sound patterns on vibrating plates" },
  { year: "1839", event: "Heinrich Wilhelm Dove discovers binaural beats" },
  { year: "1859", event: "France standardizes concert pitch at A=435 Hz" },
  { year: "1888", event: "Royal Raymond Rife born — will later develop frequency therapy (unverified)" },
  { year: "1920s", event: "Rife builds Universal Microscope, begins frequency experiments on pathogens" },
  { year: "1939", event: "International conference adopts A=440 Hz (later ISO standard in 1953)" },
  { year: "1952", event: "Winfried Otto Schumann documents 7.83 Hz electromagnetic resonance of Earth" },
  { year: "1960s", event: "Hans Jenny coins 'cymatics' — systematically documents sound-matter patterns" },
  { year: "1967", event: "Huston Smith records Gyuto monks' One Voice Chord at their monastery in India" },
  { year: "1971", event: "Frank Perry receives first Himalayan singing bowls — begins 50+ year practice" },
  { year: "1974", event: "Robert Monroe founds Monroe Institute — develops Hemi-Sync binaural beat technology" },
  { year: "1978", event: "Hans Cousto publishes 'The Cosmic Octave' — planetary frequencies calculated" },
  { year: "1970s", event: "Dr. Joseph Puleo claims to discover hidden Solfeggio frequencies in Book of Numbers" },
  { year: "1997", event: "Dr. Carolyn McMakin develops Frequency Specific Microcurrent — Cleveland Clinic adopts it" },
  { year: "1999", event: "Horowitz publishes 'Healing Codes for the Biological Apocalypse' — Solfeggio system popularized" },
  { year: "2011", event: "MIT publishes definitive singing bowl acoustics paper — Faraday waves, mode splitting documented" },
  { year: "2016", event: "MIT Picower Institute: 40 Hz gamma stimulation reduces Alzheimer's plaques in mice (Nature)" },
  { year: "2017", event: "Goldsby et al. — singing bowl meditation significantly reduces tension, anger, fatigue, depression (p<.001)" },
  { year: "2022", event: "Double-blind RCT: 7.83 Hz Schumann device improves insomnia vs. placebo" },
  { year: "2023", event: "Kim & Choi: singing bowl beats produce 251% increase in theta brainwave magnitudes" },
  { year: "2025", event: "Two systematic reviews (19 + 14 studies) confirm singing bowl therapy benefits — growing evidence base" },
  { year: "2025", event: "MIT: expanding evidence for 40 Hz gamma stimulation in human Alzheimer's patients" },
];

/* ────────────────────────────────────────────────────────────
   DATA — Media & Resources
   ──────────────────────────────────────────────────────────── */
const media = [
  { title: "7 Chakra Meditation — 21 Antique Tibetan Singing Bowls", type: "Audio", desc: "70-minute meditation journey from Crown B through Root C using 21 genuine antique bowls. Temple Sounds.", url: "https://www.youtube.com/watch?v=Nb3okem4OCk" },
  { title: "Gyuto Monks Tantric Choir — Full Album", type: "Album", desc: "Complete recording of the Gyuto Tantric College monks performing deep overtone chanting. Multiple voices creating the One Voice Chord.", url: "https://www.youtube.com/watch?v=C5Dz84buYRs" },
  { title: "Tibetan Sacred Ceremony — 8 Hour Full Ambience", type: "Audio", desc: "Complete temple ceremony with singing bowls, dungchen, chanting, and monastery atmosphere. Ideal for extended meditation.", url: "https://www.youtube.com/watch?v=4ZBqgYqXZhY" },
  { title: "33 Bowls — Hi-Res Antique Bowl Recordings", type: "FLAC", desc: "24-bit high-resolution recordings of 33 pitch-matched antique Tibetan singing bowls spanning centuries. No compression, limiting, or EQ.", url: "https://33bowls.bandcamp.com/" },
  { title: "Cymatics — Water Patterns in Singing Bowl", type: "Video", desc: "Visual demonstration of standing wave patterns (Faraday waves) forming in water inside a singing bowl — cymatics in action.", url: "https://www.youtube.com/watch?v=CGSdcab6AB0" },
  { title: "Tibetan Sound Revelation Documentary", type: "Documentary", desc: "Documentary exploring the sacred sound traditions of Tibet, including singing bowls, overtone chanting, and ritual instruments.", url: "https://www.youtube.com/watch?v=OPcmirIGA0E" },
  { title: "Temple Sounds — Emile de Leon (YouTube Channel)", type: "Channel", desc: "20+ years creating meditation music with carefully selected antique Tibetan singing bowls. 5 album series: Celestial, Goddess, Meditation, Mystic, Shaman.", url: "https://www.youtube.com/channel/UC1jtAq_bP3reGKykkbW26ww" },
  { title: "Online Singing Bowl Frequency Analyzer", type: "Tool", desc: "Interactive web tool for measuring and analyzing the frequency of singing bowls in real-time using your device microphone.", url: "https://bellsofbliss.com/pages/sound-frequency-analyzer" },
  { title: "Interactive Singing Bowl Soundscape Generator", type: "Tool", desc: "Customizable singing bowl drone generator with individual control over multiple bowl layers. Adjustable frequency and mix.", url: "https://mynoise.net/NoiseMachines/singingBowlsDroneGenerator.php" },
  { title: "Frequency Heatmap by Bowl Type", type: "Database", desc: "The only comprehensive frequency heatmap organized by antique bowl style (Thadobati, Jambati, Manipuri, etc.) — based on tens of thousands of cataloged bowls.", url: "https://bestsingingbowls.com/style-frequency-heatmap/" },
  { title: "Antique Singing & Healing Bowls — Full Catalog", type: "Database", desc: "Each bowl cataloged with weight, measurements, photographs, audio recordings, fundamental/rim notes, and Hz frequency. The most comprehensive antique bowl database online.", url: "https://antiquesingingbowls.com/" },
  { title: "Healing Frequencies Scale — Interactive Chart", type: "Tool", desc: "Interactive 0–4,225 Hz chart mapping Solfeggio, Rife, Nogier, chakra, and organ frequencies on a single visual scale.", url: "https://evoluteur.github.io/healing-frequencies/healing-frequencies-scale.html" },
  { title: "Himalayan Sound Revelations — Frank Perry", type: "Book", desc: "The most comprehensive singing bowl book ever written. 271 bowl types, 60 techniques, 25 exercises. Covers Chinese bells, drilbu, planets, cymatics, overtones, Pythagoras.", url: "https://www.amazon.com/Himalayan-Sound-Revelations-Complete-Singing/dp/1905398379" },
  { title: "Tibetan Sound Healing — Tenzin Wangyal Rinpoche", type: "Book", desc: "Authentic Bon tradition sound healing practice. Seven guided practices using the Five Warrior Syllables. By the foremost modern teacher of this tradition.", url: "https://www.amazon.com/Tibetan-Sound-Healing-Practices-Obstacles/dp/1604070951" },
  { title: "Scala — Microtonal Tuning Software", type: "Software", desc: "Free software to create, archive, and play any musical scale. Export to synthesizers. The .scl format is the standard for microtonal scale exchange. Essential for recreating ancient tuning systems.", url: "https://www.huygens-fokker.org/microtonality/software_en.html" },
  { title: "Scale Workshop — Web-Based Tuning Tool", type: "Software", desc: "Free open-source web app for creating, visualizing, playing, and exporting custom microtonal scales. Supports Pythagorean, just intonation, historical, and non-octave scales.", url: "https://github.com/xenharmonic-devs/scale-workshop" },
  { title: "528 Hz Antique Himalayan Mani Bowl — 33 Minutes", type: "Audio", desc: "Extended meditation recording of a single antique Mani bowl tuned to 528 Hz (the Love/Miracle frequency).", url: "https://www.youtube.com/watch?v=eNmjWjpxUOM" },
  { title: "Gyuto Monks on Spotify", type: "Streaming", desc: "The Gyuto Monks Tantric Choir on Spotify — deep overtone chanting albums available for streaming.", url: "https://open.spotify.com/album/5xaYkpGEv6uaWi05al3ZW3" },
];

/* ────────────────────────────────────────────────────────────
   PAGE COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function FrequenciesPage() {
  return (
    <Suspense fallback={<main className="relative min-h-screen pt-16"><ParticleField /><div className="flex items-center justify-center h-[60vh]"><div className="h-3 w-3 rounded-full bg-signal animate-glow-breathe" /></div></main>}>
      <FrequenciesContent />
    </Suspense>
  );
}

function FrequenciesContent() {
  const [activeTab, setActiveTab] = useState<Tab>("solfeggio");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "solfeggio", label: "SOLFEGGIO", count: solfeggio.length },
    { id: "organs", label: "BODY & ORGANS", count: organs.length },
    { id: "ancient", label: "ANCIENT & LOST", count: ancient.length },
    { id: "tibetan", label: "SACRED TIBETAN", count: tibetan.length },
    { id: "science", label: "SCIENCE", count: science.length },
    { id: "brainwaves", label: "BRAINWAVES", count: brainwaves.length },
    { id: "timeline", label: "TIMELINE", count: timeline.length },
    { id: "media", label: "MEDIA & TOOLS", count: media.length },
    { id: "generator", label: "TONE GENERATOR", count: 0 },
  ];

  return (
    <main className="relative min-h-screen pt-16">
      <ParticleField />

      {/* Header */}
      <div className="relative border-b border-bone/10 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.4em] text-ember font-medium">THE FREQUENCY LIBRARY</p>
          <h1 className="mt-3 text-5xl font-bold uppercase md:text-6xl">FREQUENCIES &amp; TONES</h1>
          <p className="mt-4 max-w-2xl text-bone/50 leading-relaxed">
            A definitive research archive of healing frequencies, sacred tones, ancient tuning systems, and
            the science of sound. From Solfeggio scales to Tibetan singing bowls, from measured pyramid acoustics
            to peer-reviewed clinical studies. Every claim labeled with its evidence level.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-bone/30">
            <span>{solfeggio.length + organs.length + ancient.length + tibetan.length + science.length} entries</span>
            <span>&middot;</span>
            <span>{tibetan.length} Tibetan traditions</span>
            <span>&middot;</span>
            <span>{timeline.length} timeline events</span>
            <span>&middot;</span>
            <span>{media.length} media resources</span>
            <span>&middot;</span>
            <span>Live tone generator</span>
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
              {tab.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeTab === tab.id ? "bg-signal/20" : "bg-bone/5"}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 py-12 md:px-12">
        <div className="mx-auto max-w-6xl">

          {/* SOLFEGGIO */}
          {activeTab === "solfeggio" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {solfeggio.map((freq) => (
                  <ExpandableCard key={freq.hz} expanded={expandedId === String(freq.hz)} onClick={() => toggle(String(freq.hz))}>
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider bg-signal/10 text-signal">{freq.chakra}</span>
                      <span className="font-mono text-lg text-signal/70">{freq.hz} Hz</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{freq.name}</h3>
                    <p className="mt-1 text-[10px] text-bone/30">Digit sum: {freq.digitSum} &middot; {freq.digitSum === 3 ? "3" : freq.digitSum === 6 ? "6" : "9"}-series</p>
                    <p className="mt-3 text-sm text-bone/60 leading-relaxed">{freq.summary}</p>

                    <AnimatePresence>
                      {expandedId === String(freq.hz) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 border-t border-bone/10 pt-4">
                            <p className="text-sm text-bone/70 leading-relaxed">{freq.details}</p>
                            <p className="mt-3 text-[10px] text-bone/40"><span className="text-ember/60 font-semibold">EVIDENCE:</span> {freq.evidence}</p>
                            <InlineTonePlayer hz={freq.hz} />
                            <div className="mt-4 space-y-2">
                              <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">SOURCES</p>
                              {freq.links.map((link) => (
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

          {/* ORGANS */}
          {activeTab === "organs" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {organs.map((organ) => (
                  <ExpandableCard key={organ.name} expanded={expandedId === organ.name} onClick={() => toggle(organ.name)}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                        organ.evidence === "Strong" ? "bg-pulse/15 text-pulse" :
                        organ.evidence === "Moderate" ? "bg-signal/15 text-signal" :
                        organ.evidence === "Mixed" ? "bg-ember/15 text-ember" :
                        "bg-bone/10 text-bone/50"
                      }`}>{organ.evidence}</span>
                      <span className="font-mono text-sm text-signal/60">{organ.hz}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{organ.name}</h3>
                    <p className="mt-1 text-[10px] text-bone/30">{organ.source} &middot; {organ.tag}</p>
                    <AnimatePresence>
                      {expandedId === organ.name && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 border-t border-bone/10 pt-4">
                            <p className="text-sm text-bone/70 leading-relaxed">{organ.details}</p>
                            {organ.playHz > 0 && <InlineTonePlayer hz={organ.playHz} />}
                            <div className="mt-4 space-y-2">
                              {organ.links.map((link) => (
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

          {/* ANCIENT & LOST */}
          {activeTab === "ancient" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {ancient.map((item) => (
                  <ExpandableCard key={item.title} expanded={expandedId === item.title} onClick={() => toggle(item.title)}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                        item.tag === "Measured" ? "bg-pulse/15 text-pulse" :
                        item.tag === "Mathematical" ? "bg-signal/15 text-signal" :
                        item.tag === "Archaeological" ? "bg-ember/15 text-ember" :
                        "bg-bone/10 text-bone/50"
                      }`}>{item.tag}</span>
                      <span className="text-[10px] text-bone/30">{item.era}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                    <p className="mt-1 text-[11px] tracking-wider text-ember/70">{item.origin}</p>
                    <p className="mt-3 text-sm text-bone/60 leading-relaxed">{item.summary}</p>

                    <AnimatePresence>
                      {expandedId === item.title && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 border-t border-bone/10 pt-4">
                            <p className="text-sm text-bone/70 leading-relaxed">{item.details}</p>
                            {item.playHz > 0 && <InlineTonePlayer hz={item.playHz} />}
                            <div className="mt-4 space-y-2">
                              <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">SOURCES</p>
                              {item.links.map((link) => (
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

          {/* SACRED TIBETAN */}
          {activeTab === "tibetan" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {tibetan.map((item) => (
                  <ExpandableCard key={item.title} expanded={expandedId === item.title} onClick={() => toggle(item.title)}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                        item.tag === "Peer-Reviewed" ? "bg-pulse/15 text-pulse" :
                        item.tag === "Measured" ? "bg-signal/15 text-signal" :
                        item.tag === "Scholarship" ? "bg-hazard/15 text-hazard" :
                        "bg-ember/15 text-ember"
                      }`}>{item.tag}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm text-bone/60 leading-relaxed">{item.summary}</p>

                    <AnimatePresence>
                      {expandedId === item.title && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 border-t border-bone/10 pt-4">
                            <p className="text-sm text-bone/70 leading-relaxed">{item.details}</p>
                            {item.playHz > 0 && <InlineTonePlayer hz={item.playHz} />}
                            <div className="mt-4 space-y-2">
                              <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">SOURCES &amp; PAPERS</p>
                              {item.links.map((link) => (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-2 rounded-lg border border-bone/10 bg-black/40 px-4 py-3 text-sm text-signal/80 transition hover:border-signal/30 hover:text-signal">
                                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                  {link.label}
                                </a>
                              ))}
                            </div>
                            {"media" in item && item.media && (
                              <div className="mt-4 space-y-2">
                                <p className="text-[10px] font-semibold tracking-[0.2em] text-pulse">LISTEN &amp; WATCH</p>
                                {(item.media as { type: string; label: string; url: string }[]).map((m) => (
                                  <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer"
                                     className="flex items-center gap-2 rounded-lg border border-pulse/10 bg-pulse/5 px-4 py-3 text-sm text-pulse/80 transition hover:border-pulse/30 hover:text-pulse">
                                    <span className="rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider bg-pulse/15">{m.type}</span>
                                    {m.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ExpandableCard>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* SCIENCE */}
          {activeTab === "science" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {science.map((item) => (
                  <ExpandableCard key={item.title} expanded={expandedId === item.title} onClick={() => toggle(item.title)}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                        item.tag === "Moderate" ? "bg-signal/15 text-signal" :
                        item.tag === "Foundational" ? "bg-pulse/15 text-pulse" :
                        item.tag === "Rejected" ? "bg-hazard/15 text-hazard" :
                        "bg-bone/10 text-bone/50"
                      }`}>{item.tag}</span>
                      <span className="text-[10px] text-bone/30">{item.year}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm text-bone/60 leading-relaxed">{item.summary}</p>

                    <AnimatePresence>
                      {expandedId === item.title && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 border-t border-bone/10 pt-4">
                            <p className="text-sm text-bone/70 leading-relaxed">{item.details}</p>
                            {item.playHz > 0 && <InlineTonePlayer hz={item.playHz} />}
                            <div className="mt-4 space-y-2">
                              <p className="text-[10px] font-semibold tracking-[0.2em] text-ember">REFERENCES</p>
                              {item.links.map((link) => (
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

          {/* BRAINWAVES */}
          {activeTab === "brainwaves" && (
            <div className="space-y-3">
              {brainwaves.map((bw) => (
                <div key={bw.band} className="rounded-xl border border-bone/10 bg-black/30 p-5 transition hover:border-signal/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-2xl font-bold ${bw.color}`}>{bw.band}</span>
                      <span className="font-mono text-sm text-bone/50">{bw.range}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-bone/70">{bw.state}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 text-[11px]">
                    <div><span className="text-bone/40">Applications:</span> <span className="text-bone/60">{bw.use}</span></div>
                    <div><span className="text-bone/40">Methods:</span> <span className="text-bone/60">{bw.method}</span></div>
                  </div>
                </div>
              ))}

              {/* Evidence banner */}
              <div className="mt-6 rounded-xl border border-pulse/20 bg-pulse/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <div className="absolute h-8 w-8 rounded-full border border-pulse/30 animate-pulse-ring" />
                    <div className="h-3 w-3 rounded-full bg-pulse/60" />
                  </div>
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-pulse">STRONGEST EVIDENCE</p>
                </div>
                <p className="mt-3 text-sm text-bone/60 leading-relaxed">
                  <span className="text-pulse font-semibold">40 Hz gamma stimulation</span> has the strongest scientific backing of any frequency intervention.
                  MIT&apos;s Picower Institute published in <span className="text-signal">Nature</span>, showed amyloid plaque reduction in Alzheimer&apos;s mouse models,
                  and completed a <span className="text-signal">Phase 2a human trial</span> showing zero brain atrophy in treated patients vs. controls.
                  This is real, peer-reviewed, replicated neuroscience — not alternative medicine.
                </p>
              </div>
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
                  <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                    item.type === "Audio" || item.type === "Album" || item.type === "FLAC" || item.type === "Streaming" ? "bg-pulse/10 text-pulse" :
                    item.type === "Tool" || item.type === "Software" ? "bg-signal/10 text-signal" :
                    item.type === "Database" ? "bg-ember/10 text-ember" :
                    item.type === "Book" ? "bg-hazard/10 text-hazard" :
                    "bg-bone/10 text-bone/50"
                  }`}>{item.type}</span>
                  <h3 className="mt-2 text-base font-bold group-hover:text-signal transition">{item.title}</h3>
                  <p className="mt-2 text-sm text-bone/60 leading-relaxed">{item.desc}</p>
                  <p className="mt-3 text-[10px] text-signal/40 tracking-wider group-hover:text-signal/70 transition">OPEN &rarr;</p>
                </a>
              ))}
            </div>
          )}

          {/* TONE GENERATOR */}
          {activeTab === "generator" && (
            <div className="space-y-6">
              <ToneGenerator />

              <div className="rounded-xl border border-bone/10 bg-black/30 p-5">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-ember">USAGE GUIDE</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-bone/60 leading-relaxed">
                  <div>
                    <p className="font-semibold text-bone/80">Waveforms</p>
                    <p className="mt-1"><span className="text-signal">Sine</span> — Pure tone, smooth, standard for healing frequencies</p>
                    <p><span className="text-signal">Triangle</span> — Soft, flute-like, gentle therapy</p>
                    <p><span className="text-signal">Square</span> — Buzzy, stimulating, breaks energy blockages</p>
                    <p><span className="text-signal">Sawtooth</span> — Rich, brassy, broadest harmonic content</p>
                  </div>
                  <div>
                    <p className="font-semibold text-bone/80">Duration &amp; Safety</p>
                    <p className="mt-1">Beginners: 10–15 min, 2–3x/week</p>
                    <p>General wellness: 20–30 min daily</p>
                    <p>Deep work: 30–60 min, 3–5x/week</p>
                    <p className="mt-2 text-hazard/60">Do not use with pacemakers, epilepsy, or while driving. Start at low volume.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Evidence Hierarchy */}
      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-bone/10 bg-black/20 p-6">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-ember mb-3">EVIDENCE HIERARCHY</p>
          <div className="grid gap-2 md:grid-cols-4 text-[11px]">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pulse" /><span className="text-bone/60"><span className="text-pulse font-semibold">Strong</span> — Peer-reviewed, replicated, clinical trials</span></div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-signal" /><span className="text-bone/60"><span className="text-signal font-semibold">Moderate</span> — Multiple studies, some clinical evidence</span></div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ember" /><span className="text-bone/60"><span className="text-ember font-semibold">Weak</span> — Limited studies, preliminary, or alternative</span></div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-hazard" /><span className="text-bone/60"><span className="text-hazard font-semibold">Rejected</span> — No peer-reviewed support</span></div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-16">
        <div className="mx-auto max-w-6xl rounded-xl border border-bone/5 bg-black/20 p-6 text-center">
          <p className="text-xs text-bone/30 leading-relaxed max-w-2xl mx-auto">
            This archive presents documented research, measured acoustic data, peer-reviewed studies, and traditional practices for educational purposes.
            Every claim is labeled with its evidence level. Sound therapy is not a substitute for medical treatment.
            The Telekinesis Support Group does not make healing claims — we present the research as it exists.
            <br /><span className="text-bone/50">No claims. No promises. Just show up and pay attention.</span>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
