"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const SYMBOLS = [
  { id: "circle" },
  { id: "star" },
  { id: "waves" },
  { id: "square" },
  { id: "cross" },
];

function SymbolSVG({ id, size = 64, color = "#FFC260" }: { id: string; size?: number; color?: string }) {
  const s = size;
  const paths: Record<string, React.ReactNode> = {
    circle: <ellipse cx={s/2} cy={s/2} rx={s*0.35} ry={s*0.38} fill="none" stroke={color} strokeWidth="2.5" />,
    star: <polygon points={`${s/2},${s*0.1} ${s*0.6},${s*0.4} ${s*0.92},${s*0.4} ${s*0.66},${s*0.6} ${s*0.76},${s*0.9} ${s/2},${s*0.71} ${s*0.24},${s*0.9} ${s*0.34},${s*0.6} ${s*0.08},${s*0.4} ${s*0.4},${s*0.4}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />,
    waves: <>{[0.35, 0.5, 0.65].map((y) => <path key={y} d={`M${s*0.15},${s*y} Q${s*0.33},${s*(y-0.12)} ${s/2},${s*y} Q${s*0.67},${s*(y+0.12)} ${s*0.85},${s*y}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />)}</>,
    square: <rect x={s*0.18} y={s*0.18} width={s*0.64} height={s*0.64} fill="none" stroke={color} strokeWidth="2.5" />,
    cross: <><line x1={s/2} y1={s*0.12} x2={s/2} y2={s*0.88} stroke={color} strokeWidth="2.5" strokeLinecap="round" /><line x1={s*0.12} y1={s/2} x2={s*0.88} y2={s/2} stroke={color} strokeWidth="2.5" strokeLinecap="round" /></>,
  };
  return <svg viewBox={`0 0 ${s} ${s}`} width={size} height={size} style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}>{paths[id]}</svg>;
}

// ── Card Back — layered occult design ──
function CardBack() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl border border-signal/20"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        background: "radial-gradient(ellipse at 50% 40%, #0f0e0a 0%, #080808 50%, #050505 100%)",
      }}
    >
      {/* Inner border inset */}
      <div className="absolute inset-[5px] rounded-lg border border-signal/10" />

      {/* Subtle crosshatch pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0,0 L8,8 M8,0 L0,8" stroke="#FFC260" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crosshatch)" />
      </svg>

      {/* Center mandala / sacred geometry */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 80 80" width={72} height={72} className="opacity-30">
          {/* Outer ring */}
          <circle cx="40" cy="40" r="34" fill="none" stroke="#FFC260" strokeWidth="0.6" />
          {/* Inner ring */}
          <circle cx="40" cy="40" r="24" fill="none" stroke="#FFC260" strokeWidth="0.5" />
          {/* Innermost ring */}
          <circle cx="40" cy="40" r="14" fill="none" stroke="#FFC260" strokeWidth="0.4" />
          {/* Radial lines — 8 spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line
              key={deg}
              x1="40" y1="40"
              x2={40 + Math.cos(deg * Math.PI / 180) * 34}
              y2={40 + Math.sin(deg * Math.PI / 180) * 34}
              stroke="#FFC260" strokeWidth="0.4"
            />
          ))}
          {/* Small diamonds at cardinal points */}
          {[0, 90, 180, 270].map(deg => {
            const x = 40 + Math.cos(deg * Math.PI / 180) * 29;
            const y = 40 + Math.sin(deg * Math.PI / 180) * 29;
            return <rect key={deg} x={x - 2} y={y - 2} width={4} height={4} fill="#FFC260" opacity={0.4} transform={`rotate(45 ${x} ${y})`} />;
          })}
          {/* Center dot */}
          <circle cx="40" cy="40" r="2" fill="#FFC260" opacity={0.5} />
        </svg>
      </div>

      {/* Corner ornaments — L-shaped brackets */}
      <div className="absolute top-[10px] left-[10px] h-3 w-3 border-t border-l border-signal/25" />
      <div className="absolute top-[10px] right-[10px] h-3 w-3 border-t border-r border-signal/25" />
      <div className="absolute bottom-[10px] left-[10px] h-3 w-3 border-b border-l border-signal/25" />
      <div className="absolute bottom-[10px] right-[10px] h-3 w-3 border-b border-r border-signal/25" />

      {/* Top/bottom center dots */}
      <div className="absolute top-[14px] left-1/2 -translate-x-1/2 flex gap-1">
        <div className="h-[3px] w-[3px] rounded-full bg-signal/20" />
        <div className="h-[3px] w-[3px] rounded-full bg-signal/30" />
        <div className="h-[3px] w-[3px] rounded-full bg-signal/20" />
      </div>
      <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2 flex gap-1">
        <div className="h-[3px] w-[3px] rounded-full bg-signal/20" />
        <div className="h-[3px] w-[3px] rounded-full bg-signal/30" />
        <div className="h-[3px] w-[3px] rounded-full bg-signal/20" />
      </div>

      {/* Vignette edge darkening */}
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)" }} />
    </div>
  );
}

// ── Card Front — symbol with depth and texture ──
function CardFront({ id }: { id: string }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl border border-signal/25"
      style={{
        backfaceVisibility: "hidden",
        background: "radial-gradient(ellipse at 50% 35%, #100e08 0%, #0a0a0a 50%, #060606 100%)",
      }}
    >
      {/* Inner border inset */}
      <div className="absolute inset-[5px] rounded-lg border border-signal/8" />

      {/* Faint radial burst behind the symbol */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(255,194,96,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Corner ornaments */}
      <div className="absolute top-[10px] left-[10px] h-3 w-3 border-t border-l border-signal/20" />
      <div className="absolute top-[10px] right-[10px] h-3 w-3 border-t border-r border-signal/20" />
      <div className="absolute bottom-[10px] left-[10px] h-3 w-3 border-b border-l border-signal/20" />
      <div className="absolute bottom-[10px] right-[10px] h-3 w-3 border-b border-r border-signal/20" />

      {/* Top dot trio */}
      <div className="absolute top-[14px] left-1/2 -translate-x-1/2 flex gap-1">
        <div className="h-[3px] w-[3px] rounded-full bg-signal/15" />
        <div className="h-[3px] w-[3px] rounded-full bg-signal/25" />
        <div className="h-[3px] w-[3px] rounded-full bg-signal/15" />
      </div>

      {/* Symbol — centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <SymbolSVG id={id} />
      </div>

      {/* Faint circle frame around symbol */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[76px] w-[76px] rounded-full border border-signal/8" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 25px rgba(0,0,0,0.5)" }} />
    </div>
  );
}

type Phase = "stacked" | "spread" | "playing" | "results";

export default function ZenerGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [phase, setPhase] = useState<Phase>("stacked");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState("");
  const [guess, setGuess] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const totalRounds = 10;

  const cardW = 120;
  const cardH = 170;

  // Spread cards when scrolled into view
  useEffect(() => {
    if (isInView && phase === "stacked") {
      const timer = setTimeout(() => setPhase("spread"), 300);
      return () => clearTimeout(timer);
    }
  }, [isInView, phase]);

  // Pick target each round
  useEffect(() => {
    if (phase === "playing") {
      setTarget(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id);
      setGuess(null);
      setShowResult(false);
    }
  }, [phase, round]);

  // Card click in spread phase: flip to reveal, then click again to start game
  const handleCardClick = useCallback((id: string) => {
    if (phase === "spread") {
      setFlippedCards(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          // Second click on a flipped card — start the game
          setRound(1);
          setScore(0);
          setPhase("playing");
          return new Set();
        }
        next.add(id);
        return next;
      });
    }
  }, [phase]);

  // Guess during gameplay
  const handleGuess = useCallback((symbolId: string) => {
    if (phase !== "playing" || showResult) return;

    setGuess(symbolId);
    setShowResult(true);
    if (symbolId === target) setScore(s => s + 1);

    setTimeout(() => {
      if (round >= totalRounds) {
        setPhase("results");
      } else {
        setRound(r => r + 1);
      }
    }, 1200);
  }, [phase, target, round, showResult]);

  const resetGame = () => {
    setPhase("spread");
    setFlippedCards(new Set());
    setRound(0);
    setScore(0);
    setGuess(null);
    setShowResult(false);
  };

  // ── Stack positions: all cards overlapping at center ──
  const stackOffset = (i: number) => ({
    x: 0,
    y: i * -3,
    rotate: (i - 2) * 1.5,
  });

  // ── Spread positions: fanned out ──
  const spreadOffset = (i: number) => {
    const total = SYMBOLS.length;
    const fanAngle = 6;
    const spacing = 135;
    return {
      x: (i - Math.floor(total / 2)) * spacing,
      y: Math.abs(i - Math.floor(total / 2)) * 8,
      rotate: (i - Math.floor(total / 2)) * fanAngle,
    };
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ── Card area ── */}
      <div className="flex items-center justify-center py-8 min-h-[280px]">
        <AnimatePresence mode="popLayout">

          {/* STACKED + SPREAD — cards visible */}
          {(phase === "stacked" || phase === "spread") && (
            <div className="relative" style={{ width: cardW, height: cardH }}>
              {SYMBOLS.map((sym, i) => {
                const pos = phase === "spread" ? spreadOffset(i) : stackOffset(i);
                const isFlipped = flippedCards.has(sym.id);

                return (
                  <motion.div
                    key={sym.id}
                    className="absolute cursor-pointer"
                    style={{
                      width: cardW,
                      height: cardH,
                      perspective: 800,
                      zIndex: phase === "spread" ? (isFlipped ? 10 : i) : SYMBOLS.length - i,
                    }}
                    initial={{ x: 0, y: i * -3, rotate: (i - 2) * 1.5, opacity: 0 }}
                    animate={{
                      x: pos.x,
                      y: pos.y,
                      rotate: pos.rotate,
                      opacity: 1,
                      scale: isFlipped ? 1.08 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 14,
                      delay: phase === "spread" ? i * 0.08 : 0,
                    }}
                    whileHover={phase === "spread" && !isFlipped ? { y: pos.y - 12, scale: 1.04, transition: { duration: 0.2 } } : {}}
                    onClick={() => handleCardClick(sym.id)}
                  >
                    <motion.div
                      className="relative w-full h-full"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: isFlipped ? 0 : 180 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 15 }}
                    >
                      <CardFront id={sym.id} />
                      <CardBack />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* PLAYING — clean, focused, no distractions */}
          {phase === "playing" && (
            <motion.div
              key="playing"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Round counter — minimal */}
              <p className="text-xs tracking-[0.3em] text-bone/40 tabular-nums">
                {round} / {totalRounds}
              </p>

              {/* The target card — static, no floating, no glow */}
              <div
                className="relative"
                style={{ width: cardW * 1.15, height: cardH * 1.15, perspective: 800 }}
              >
                <motion.div
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: showResult ? 0 : 180 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 15 }}
                >
                  {/* Front — revealed symbol with depth */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xl border"
                    style={{
                      backfaceVisibility: "hidden",
                      borderColor: guess === target
                        ? "rgba(0, 255, 179, 0.5)"
                        : guess
                        ? "rgba(255, 42, 31, 0.4)"
                        : "rgba(255, 194, 96, 0.25)",
                      background: "radial-gradient(ellipse at 50% 35%, #100e08 0%, #0a0a0a 50%, #060606 100%)",
                    }}
                  >
                    <div className="absolute inset-[5px] rounded-lg border border-signal/8" />
                    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,194,96,0.04) 0%, transparent 60%)" }} />
                    <div className="absolute top-[10px] left-[10px] h-3 w-3 border-t border-l border-signal/20" />
                    <div className="absolute top-[10px] right-[10px] h-3 w-3 border-t border-r border-signal/20" />
                    <div className="absolute bottom-[10px] left-[10px] h-3 w-3 border-b border-l border-signal/20" />
                    <div className="absolute bottom-[10px] right-[10px] h-3 w-3 border-b border-r border-signal/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SymbolSVG id={target} size={72} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-[88px] w-[88px] rounded-full border border-signal/6" />
                    </div>
                    {guess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute bottom-5 left-1/2 -translate-x-1/2 h-1.5 w-8 rounded-full ${guess === target ? "bg-pulse/60" : "bg-hazard/40"}`}
                      />
                    )}
                    <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 25px rgba(0,0,0,0.5)" }} />
                  </div>

                  {/* Back — same rich design as browse cards */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xl border border-signal/20"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "radial-gradient(ellipse at 50% 40%, #0f0e0a 0%, #080808 50%, #050505 100%)",
                    }}
                  >
                    <div className="absolute inset-[5px] rounded-lg border border-signal/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 80 80" width={64} height={64} className="opacity-25">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#FFC260" strokeWidth="0.6" />
                        <circle cx="40" cy="40" r="24" fill="none" stroke="#FFC260" strokeWidth="0.5" />
                        <circle cx="40" cy="40" r="14" fill="none" stroke="#FFC260" strokeWidth="0.4" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                          <line key={deg} x1="40" y1="40" x2={40 + Math.cos(deg * Math.PI / 180) * 34} y2={40 + Math.sin(deg * Math.PI / 180) * 34} stroke="#FFC260" strokeWidth="0.4" />
                        ))}
                        <circle cx="40" cy="40" r="2" fill="#FFC260" opacity={0.5} />
                      </svg>
                    </div>
                    <div className="absolute top-[10px] left-[10px] h-3 w-3 border-t border-l border-signal/25" />
                    <div className="absolute top-[10px] right-[10px] h-3 w-3 border-t border-r border-signal/25" />
                    <div className="absolute bottom-[10px] left-[10px] h-3 w-3 border-b border-l border-signal/25" />
                    <div className="absolute bottom-[10px] right-[10px] h-3 w-3 border-b border-r border-signal/25" />
                    <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)" }} />
                  </div>
                </motion.div>
              </div>

              {/* Score — subtle */}
              <div className="flex items-center gap-4 text-[10px] tracking-[0.15em] text-bone/30">
                <span>{score} correct</span>
                <span className="h-3 w-px bg-bone/10" />
                <span>{round - 1 - score + (showResult && guess !== target ? 1 : 0)} missed</span>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {phase === "results" && (
            <motion.div
              key="results"
              className="flex flex-col items-center gap-5 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[10px] tracking-[0.3em] text-bone/40">SESSION COMPLETE</p>

              {/* Score ring */}
              <div className="relative">
                <svg viewBox="0 0 120 120" width={120} height={120}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,194,96,0.08)" strokeWidth="5" />
                  <motion.circle
                    cx="60" cy="60" r="52" fill="none" stroke="#FFC260" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / totalRounds) * 327} 327`}
                    transform="rotate(-90 60 60)"
                    initial={{ strokeDasharray: "0 327" }}
                    animate={{ strokeDasharray: `${(score / totalRounds) * 327} 327` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-signal">{Math.round((score / totalRounds) * 100)}%</p>
                </div>
              </div>

              <p className="text-sm text-bone/50">{score} / {totalRounds}</p>

              <button
                onClick={resetGame}
                className="mt-2 rounded-full bg-ember px-6 py-3 text-xs font-bold tracking-wider text-black transition hover:shadow-[0_0_20px_rgba(255,144,46,0.3)]"
              >
                TRAIN AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Selection bar — only during gameplay, only when waiting for guess ── */}
      <AnimatePresence>
        {phase === "playing" && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center justify-center gap-3 py-3"
          >
            {SYMBOLS.map((sym) => (
              <motion.button
                key={sym.id}
                onClick={() => handleGuess(sym.id)}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-signal/15 bg-black/40 transition hover:border-signal/50 hover:bg-signal/5"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.93 }}
              >
                <SymbolSVG id={sym.id} size={28} color="#FFC260" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hint text ── */}
      {phase === "spread" && (
        <motion.p
          className="text-center text-[10px] tracking-[0.2em] text-bone/20 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          TAP A CARD TO REVEAL &middot; TAP AGAIN TO BEGIN
        </motion.p>
      )}
    </div>
  );
}
