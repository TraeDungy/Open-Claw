"use client";
import { useState } from "react";

type Cadence = "weekly" | "monthly";

interface Props {
  onSelect: (cadence: Cadence) => void;
  loading?: boolean;
}

export default function CadenceSelector({ onSelect, loading }: Props) {
  const [selected, setSelected] = useState<Cadence>("weekly");
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    setConfirmed(true);
    onSelect(selected);
  }

  if (confirmed) {
    return (
      <div className="text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pulse/40 mb-3">
          <div className="h-2 w-2 rounded-full bg-pulse animate-glow-breathe" />
        </div>
        <p className="text-sm text-pulse tracking-wider">
          {loading ? "Setting your frequency..." : "Your frequency has been set."}
        </p>
        <p className="mt-2 text-xs text-bone/40">First transmission incoming.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-bone/40 mb-5 text-center">
        HOW OFTEN WOULD YOU LIKE TO HEAR FROM US?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Weekly */}
        <button
          type="button"
          onClick={() => setSelected("weekly")}
          className={`relative rounded-xl border p-4 text-left transition-all ${
            selected === "weekly"
              ? "border-pulse/50 bg-pulse/5 shadow-[0_0_20px_rgba(0,255,179,0.08)]"
              : "border-bone/10 bg-black/30 hover:border-bone/20"
          }`}
        >
          {selected === "weekly" && (
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-pulse animate-glow-breathe" />
          )}
          <p className="text-xs font-semibold tracking-[0.2em] text-bone/80">WEEKLY SIGNAL</p>
          <p className="mt-1 text-[10px] tracking-wider text-pulse/60">RECOMMENDED</p>
          <p className="mt-2 text-[11px] text-bone/40 leading-relaxed">
            A new file, frequency, or researcher every week.
          </p>
        </button>

        {/* Monthly */}
        <button
          type="button"
          onClick={() => setSelected("monthly")}
          className={`relative rounded-xl border p-4 text-left transition-all ${
            selected === "monthly"
              ? "border-signal/50 bg-signal/5 shadow-[0_0_20px_rgba(255,194,96,0.08)]"
              : "border-bone/10 bg-black/30 hover:border-bone/20"
          }`}
        >
          {selected === "monthly" && (
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-signal animate-glow-breathe" />
          )}
          <p className="text-xs font-semibold tracking-[0.2em] text-bone/80">MONTHLY TRANSMISSION</p>
          <p className="mt-1 text-[10px] tracking-wider text-signal/60">CURATED</p>
          <p className="mt-2 text-[11px] text-bone/40 leading-relaxed">
            A curated digest once a month — the essential signal, concentrated.
          </p>
        </button>
      </div>

      <button
        onClick={confirm}
        className="mt-4 w-full rounded-xl bg-ember/90 py-3 text-xs font-bold tracking-wider text-black transition hover:bg-ember hover:shadow-[0_0_30px_rgba(255,144,46,0.3)]"
      >
        SET MY FREQUENCY
      </button>
    </div>
  );
}
