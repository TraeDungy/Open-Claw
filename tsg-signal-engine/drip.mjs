export const DRIP_SEQUENCE = [
  {
    day: 1,
    id: "manifesto",
    subject: "WHAT IS THE SIGNAL?",
    type: "llm-generated",
    llmPrompt: `Write a TSG brand manifesto email (2-3 paragraphs). Explain what Signal Archaeology is — the practice of documenting phenomena at the threshold of perception. Cover three pillars: (1) declassified government files proving governments spent decades and millions studying this, (2) ancient practices spanning millennia across every continent, (3) modern peer-reviewed studies with statistical significance. End with what the subscriber will receive — curated transmissions from the archive, each one a primary source document or research finding they can verify themselves.`,
    preheader: "Signal Archaeology — documenting what others dismissed.",
  },
  {
    day: 3,
    id: "first-file",
    subject: "YOUR FIRST FILE",
    type: "content-spotlight",
    contentSource: { page: "files", tab: "declassified", index: 0 },
    preheader: "20 years. $20 million. 89,000 pages. A conclusion they tried to bury.",
  },
  {
    day: 5,
    id: "frequency",
    subject: "THE FREQUENCY VARIABLE",
    type: "content-spotlight",
    contentSource: { page: "frequencies", tab: "solfeggio", index: 4 },
    preheader: "The frequency of chlorophyll. The frequency that rewrites cells.",
  },
  {
    day: 7,
    id: "tool",
    subject: "TRAIN YOUR PERCEPTION",
    type: "llm-generated",
    llmPrompt: `Write an email introducing the Zener Card perception training tool on the TSG website. Reference the Rhine experiments at Duke University (90,000+ trials, p < 0.001 across decades). Frame it as: perception is trainable, attention is direction, stillness is power. Include a challenge — do 25 trials, note the hit rate, see if it changes over a week of daily practice. The tool at /tsg/tool has 5 symbols: circle, star, waves, square, cross. 20 rounds per session. Chance is 20%. Most beginners score 18-22%. Consistent practitioners report 28-35% over time.`,
    ctaUrl: "/tool",
    ctaLabel: "BEGIN TRAINING",
    preheader: "Perception is trainable. Here is the instrument.",
  },
  {
    day: 10,
    id: "subjects",
    subject: "THE SUBJECTS WHO CAME BEFORE",
    type: "dual-spotlight",
    contentSources: [
      { page: "files", tab: "individuals", index: 2 },
      { page: "files", tab: "individuals", index: 0 },
    ],
    preheader: "She lost 4 pounds in 30 minutes. He drew Jupiter's rings before Voyager.",
  },
  {
    day: 14,
    id: "open-signal",
    subject: "OPEN SIGNAL",
    type: "llm-generated",
    llmPrompt: `Write an email for day 14 of the TSG drip. The subscriber has been receiving transmissions for two weeks. Now it's time to deepen. Two things: (1) Mention the Open Signal — TSG is seeking films in sci-fi, futurism, afrofuturism, and consciousness. If the subscriber creates, or knows someone who does, the submission portal is open at /tsg/submit. No entry fee. (2) Their weekly or monthly transmissions will continue — each one drawn from the archive, polished and curated. Frame the entire drip experience as "calibration" — they've been tuned to the frequency of the archive. Now the real signal begins.`,
    preheader: "Calibration complete. The real signal begins.",
  },
];

export function getDueDrips(subscriber, now) {
  const joinedAt = new Date(subscriber.joinedAt);
  const daysSinceJoin = Math.floor((now - joinedAt) / 86400000);
  const due = [];

  for (let i = subscriber.dripIndex; i < DRIP_SEQUENCE.length; i++) {
    if (DRIP_SEQUENCE[i].day <= daysSinceJoin) {
      due.push({ ...DRIP_SEQUENCE[i], index: i });
    } else {
      break;
    }
  }

  return due;
}
