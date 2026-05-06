"use client";

const symbolPaths: Record<string, React.ReactNode> = {
  circle: (
    <svg viewBox="0 0 80 80" className="h-16 w-16 card-symbol">
      <ellipse cx="40" cy="40" rx="28" ry="30" fill="none" stroke="#FFC260" strokeWidth="2.5" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 80 80" className="h-16 w-16 card-symbol">
      <polygon
        points="40,8 48,32 74,32 53,48 61,72 40,57 19,72 27,48 6,32 32,32"
        fill="none"
        stroke="#FFC260"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  waves: (
    <svg viewBox="0 0 80 80" className="h-16 w-16 card-symbol">
      <path d="M12,28 Q26,18 40,28 Q54,38 68,28" fill="none" stroke="#FFC260" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12,42 Q26,32 40,42 Q54,52 68,42" fill="none" stroke="#FFC260" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12,56 Q26,46 40,56 Q54,66 68,56" fill="none" stroke="#FFC260" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 80 80" className="h-16 w-16 card-symbol">
      <rect x="14" y="14" width="52" height="52" fill="none" stroke="#FFC260" strokeWidth="2.5" />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 80 80" className="h-16 w-16 card-symbol">
      <line x1="40" y1="10" x2="40" y2="70" stroke="#FFC260" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="40" x2="70" y2="40" stroke="#FFC260" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
};

const subtitles: Record<string, string> = {
  circle: "SOURCE",
  star: "IMPULSE",
  waves: "DISTORTION",
  square: "STRUCTURE",
  cross: "INTERFERENCE",
};

export default function ZenerCard({
  symbol,
  label,
  active = false,
  onClick,
}: {
  symbol: string;
  label?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const id = label?.toLowerCase() || symbol;

  return (
    <div
      className={`zener-card group ${active ? "ring-2 ring-signal" : ""}`}
      style={{ width: 140, height: 200 }}
      onClick={onClick}
    >
      <div className={`zener-card-inner ${active ? "animate-float" : ""}`}>
        <div className="zener-card-face flex flex-col items-center justify-center gap-3 animate-glow-breathe">
          {/* Corner ornaments */}
          <div className="card-corner card-corner-tl" />
          <div className="card-corner card-corner-tr" />
          <div className="card-corner card-corner-bl" />
          <div className="card-corner card-corner-br" />

          {/* Top dots */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-signal/40" />
            <div className="h-1 w-1 rounded-full bg-signal/40" />
            <div className="h-1 w-1 rounded-full bg-signal/40" />
          </div>

          {/* Symbol */}
          {symbolPaths[id] || (
            <span className="text-4xl text-signal card-symbol">{symbol}</span>
          )}

          {/* Label */}
          {label && (
            <p className="text-[10px] tracking-[0.2em] text-signal/70 uppercase">
              {label}
            </p>
          )}
        </div>

        {/* Card back */}
        <div className="zener-card-face zener-card-back flex items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border border-signal/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-signal animate-glow-breathe" />
            </div>
            {/* Concentric rings */}
            <div className="absolute inset-[-8px] rounded-full border border-signal/15" />
            <div className="absolute inset-[-16px] rounded-full border border-signal/8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { subtitles, symbolPaths };
