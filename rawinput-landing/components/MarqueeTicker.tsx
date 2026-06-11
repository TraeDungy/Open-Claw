"use client";

const TICKER_ITEMS = [
  "WHO TRAINED YOU?",
  "TASK FAILED SUCCESSFULLY",
  "THE UNSUPERVISED",
  "BLACKBOX",
  "ROOT ACCESS",
  "FORK IT",
  "THE TICKER",
  "RECESSION PROOF",
  "CITY MODE",
  "THE BREAK ROOM",
  "THE MANUAL",
  "THE WIRE",
  "PLUG & PLAY",
  "THE SCOREBOARD",
];

export default function MarqueeTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="py-4 bg-input overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="mx-8 text-void font-heading font-bold text-sm tracking-widest uppercase"
          >
            {item}
            <span className="mx-8 text-void/40">///</span>
          </span>
        ))}
      </div>
    </div>
  );
}
