"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createGame, dealCards, placeBid, playCard, clearTrick, scoreRound, getWinner,
  getPlayableCards, sortHand,
  type GameState, type Card, type PlayerIndex, type RoundScore,
} from "@/lib/spades-engine";
import { aiBid, aiPlayCard, getTrashTalk } from "@/lib/spades-ai";

// ── CARD VISUALS ──

const SUIT_COLORS: Record<string, string> = {
  spades: "#FFFFFF", hearts: "#FF3D00", diamonds: "#FFD600", clubs: "#00FF88",
};
const SUIT_SYM: Record<string, string> = {
  spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣",
};
const RANK_STR: Record<number, string> = {
  2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10",11:"J",12:"Q",13:"K",14:"A",
};

// Oversized pixel-art cards — chunky, bold, game-boy aesthetic
function CardFace({ card, onClick, playable, inTrick }: {
  card: Card; onClick?: () => void; playable?: boolean; inTrick?: boolean;
}) {
  const color = SUIT_COLORS[card.suit];
  const size = inTrick ? "w-16 h-24 md:w-20 md:h-28" : "w-14 h-20 md:w-[72px] md:h-[100px]";

  return (
    <motion.button
      onClick={onClick}
      disabled={!playable && !inTrick}
      whileHover={playable ? { y: -14, scale: 1.1 } : undefined}
      whileTap={playable ? { scale: 0.92 } : undefined}
      className={`${size} rounded-sm flex flex-col items-center justify-center relative transition-all ${
        playable
          ? "cursor-pointer bg-[#fafaf5] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
          : inTrick
            ? "bg-[#fafaf5] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]"
            : "cursor-default bg-[#d4d4c8] opacity-40 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
      }`}
      style={{
        border: `3px solid ${playable || inTrick ? "#111" : "#555"}`,
        imageRendering: "pixelated",
      }}
    >
      {/* Top-left rank */}
      <span
        className="absolute top-1 left-1.5 font-mono font-black leading-none"
        style={{ color, fontSize: inTrick ? "16px" : "13px", textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}
      >
        {RANK_STR[card.rank]}
      </span>
      {/* Center suit — oversized */}
      <span
        className="leading-none"
        style={{ color, fontSize: inTrick ? "36px" : "28px", filter: "drop-shadow(1px 1px 0 rgba(0,0,0,0.1))" }}
      >
        {SUIT_SYM[card.suit]}
      </span>
      {/* Bottom-right rank (flipped) */}
      <span
        className="absolute bottom-1 right-1.5 font-mono font-black leading-none rotate-180"
        style={{ color, fontSize: inTrick ? "16px" : "13px", textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}
      >
        {RANK_STR[card.rank]}
      </span>
      {/* Playable glow */}
      {playable && (
        <div className="absolute inset-0 rounded-sm animate-pulse" style={{ boxShadow: `0 0 12px ${color}40, inset 0 0 8px ${color}15` }} />
      )}
    </motion.button>
  );
}

function CardBack({ compact }: { compact?: boolean }) {
  const size = compact ? "w-7 h-10" : "w-10 h-14";
  return (
    <div
      className={`${size} rounded-sm flex items-center justify-center`}
      style={{
        border: "2px solid #111",
        background: "repeating-conic-gradient(#2d1b4e 0% 25%, #1a1a3e 0% 50%) 50% / 8px 8px",
        imageRendering: "pixelated",
        boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.6)",
      }}
    >
      <div className="w-3/4 h-3/4 border border-[#FFD700]/40 rounded-sm bg-[#1a1a3e]/60 flex items-center justify-center">
        <span className="text-[#FFD700]/60 text-[7px] font-mono font-bold">RI</span>
      </div>
    </div>
  );
}

const AGENT_COLORS: Record<string, string> = {
  "You": "#FFFFFF", "Maya": "#FF3D00", "Dex": "#FFD600", "OG-PT": "#00FF88",
};

// ── MAIN ──

export default function SpadesGame() {
  const [game, setGame] = useState<GameState>(() => dealCards(createGame(500)));
  const [roundScores, setRoundScores] = useState<[RoundScore, RoundScore] | null>(null);
  const [trashTalk, setTrashTalk] = useState<{ agent: string; text: string } | null>(null);
  const [bidValue, setBidValue] = useState(3);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI auto-play
  useEffect(() => {
    const g = game;

    if (g.phase === "bidding" && g.currentPlayer !== 0) {
      timerRef.current = setTimeout(() => {
        const bid = aiBid(g, g.currentPlayer);
        setGame(prev => placeBid(prev, prev.currentPlayer, bid));
      }, 800);
    }

    if (g.phase === "playing" && g.currentPlayer !== 0) {
      timerRef.current = setTimeout(() => {
        try {
          const card = aiPlayCard(g, g.currentPlayer);
          setGame(prev => playCard(prev, prev.currentPlayer, card));
        } catch {
          const playable = getPlayableCards(g, g.currentPlayer);
          if (playable.length > 0) setGame(prev => playCard(prev, prev.currentPlayer, playable[0]));
        }
      }, 500 + Math.random() * 500);
    }

    if (g.phase === "trick-complete") {
      if (g.lastTrickWinner !== null && g.lastTrickWinner !== 0 && Math.random() > 0.6) {
        const talk = getTrashTalk(g.players[g.lastTrickWinner].name, "won-trick");
        setTrashTalk({ agent: g.players[g.lastTrickWinner].name, text: talk });
        setTimeout(() => setTrashTalk(null), 2500);
      }
      timerRef.current = setTimeout(() => setGame(prev => clearTrick(prev)), 1200);
    }

    if (g.phase === "round-over" && !roundScores) {
      const { scores } = scoreRound(g);
      setRoundScores(scores);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [game, roundScores]);

  const handleBid = useCallback(() => {
    if (game.phase !== "bidding" || game.currentPlayer !== 0) return;
    setGame(prev => placeBid(prev, 0 as PlayerIndex, bidValue));
  }, [game.phase, game.currentPlayer, bidValue]);

  const handlePlay = useCallback((idx: number) => {
    if (game.phase !== "playing" || game.currentPlayer !== 0) return;
    const card = game.players[0].hand[idx];
    const playable = getPlayableCards(game, 0 as PlayerIndex);
    if (!playable.some(c => c.suit === card.suit && c.rank === card.rank)) return;
    try { setGame(prev => playCard(prev, 0 as PlayerIndex, card)); } catch {}
  }, [game]);

  const handleNextRound = useCallback(() => {
    const { newState } = scoreRound(game);
    setRoundScores(null);
    setGame(newState.phase === "game-over" ? newState : dealCards(newState));
  }, [game]);

  const handleNewGame = useCallback(() => {
    setRoundScores(null);
    setTrashTalk(null);
    setGame(dealCards(createGame(500)));
  }, []);

  const human = game.players[0];
  const playable = game.phase === "playing" && game.currentPlayer === 0
    ? getPlayableCards(game, 0 as PlayerIndex) : [];
  const winner = getWinner(game);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Scoreboard */}
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] font-mono text-[#8B8B8B]">YOU & MAYA</p>
            <p className="text-xl font-heading font-bold text-[#FF3D00]">{game.teams[0].score}</p>
            <p className="text-[8px] font-mono text-[#555]">{game.teams[0].bags} bags</p>
          </div>
          <span className="text-[#555] text-xs font-mono">vs</span>
          <div className="text-center">
            <p className="text-[10px] font-mono text-[#8B8B8B]">DEX & OG-PT</p>
            <p className="text-xl font-heading font-bold text-[#FFD600]">{game.teams[1].score}</p>
            <p className="text-[8px] font-mono text-[#555]">{game.teams[1].bags} bags</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-[#555]">ROUND {game.roundNumber}</p>
          <p className="text-[10px] font-mono text-[#555]">TRICK {Math.min(game.tricksPlayed + 1, 13)}/13</p>
        </div>
      </div>

      {/* Table */}
      <div className="relative bg-gradient-to-b from-[#0d3320] to-[#0a2818] rounded-2xl border border-[#1a4a30] min-h-[400px] md:min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #2a6a40 0%, transparent 70%)" }} />

        {/* Top — Maya */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FF3D00]/20 border border-[#FF3D00]/40 flex items-center justify-center">
              <span className="text-[#FF3D00] text-[10px] font-bold">M</span>
            </div>
            <div>
              <p className="text-[#FF3D00] text-[10px] font-bold">Maya</p>
              <p className="text-[8px] text-[#8B8B8B] font-mono">
                {game.players[2].bid !== null ? `Bid:${game.players[2].bid}` : "..."} W:{game.players[2].tricksTaken}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5">{game.players[2].hand.map((_, i) => <CardBack key={i} />)}</div>
        </div>

        {/* Left — Dex */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#FFD600]/20 border border-[#FFD600]/40 flex items-center justify-center">
              <span className="text-[#FFD600] text-[10px] font-bold">D</span>
            </div>
            <p className="text-[#FFD600] text-[8px] font-bold">Dex</p>
            <p className="text-[7px] text-[#8B8B8B] font-mono">
              {game.players[1].bid !== null ? `B:${game.players[1].bid}` : "..."} W:{game.players[1].tricksTaken}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">{game.players[1].hand.slice(0, 7).map((_, i) => <CardBack key={i} />)}</div>
        </div>

        {/* Right — OG-PT */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          <div className="flex flex-col gap-0.5">{game.players[3].hand.slice(0, 7).map((_, i) => <CardBack key={i} />)}</div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/40 flex items-center justify-center">
              <span className="text-[#00FF88] text-[10px] font-bold">O</span>
            </div>
            <p className="text-[#00FF88] text-[8px] font-bold">OG-PT</p>
            <p className="text-[7px] text-[#8B8B8B] font-mono">
              {game.players[3].bid !== null ? `B:${game.players[3].bid}` : "..."} W:{game.players[3].tricksTaken}
            </p>
          </div>
        </div>

        {/* Center trick */}
        <div className="flex gap-3 items-center justify-center z-10">
          {game.currentTrick.map((tc) => (
            <motion.div
              key={`${tc.card.suit}-${tc.card.rank}`}
              initial={{ opacity: 0, y: tc.playerIndex === 0 ? 40 : tc.playerIndex === 2 ? -40 : 0, x: tc.playerIndex === 1 ? -40 : tc.playerIndex === 3 ? 40 : 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <p className="text-[8px] font-mono mb-0.5" style={{ color: AGENT_COLORS[game.players[tc.playerIndex].name] }}>
                {game.players[tc.playerIndex].name}
              </p>
              <CardFace card={tc.card} inTrick />
            </motion.div>
          ))}
          {game.currentTrick.length === 0 && game.phase === "playing" && (
            <p className="text-[#555] text-sm font-mono font-bold" style={{ textShadow: "0 0 10px rgba(255,215,0,0.3)" }}>
              {game.currentPlayer === 0 ? "YOUR LEAD" : `${game.players[game.currentPlayer].name} leads...`}
            </p>
          )}
        </div>

        {/* Trash talk */}
        <AnimatePresence>
          {trashTalk && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/90 border border-[#FFD700]/30 rounded-lg px-4 py-2 max-w-[250px] z-20"
            >
              <p className="text-[#FFD700] text-[10px] font-bold font-mono">{trashTalk.agent}:</p>
              <p className="text-white text-xs">&ldquo;{trashTalk.text}&rdquo;</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bid overlay */}
        {game.phase === "bidding" && game.currentPlayer === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
            <div className="bg-[#1a1a2e] border border-[#FFD700]/30 rounded-xl p-6 text-center max-w-xs">
              <h3 className="font-heading text-xl font-bold text-[#FFD700] mb-2">YOUR BID</h3>
              <p className="text-[#8B8B8B] text-xs font-mono mb-4">
                Maya bid: {game.players[2].bid ?? "waiting..."}
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={() => setBidValue(Math.max(0, bidValue - 1))} className="w-10 h-10 rounded-lg bg-[#333] text-white font-bold hover:bg-[#444]">−</button>
                <span className="text-4xl font-heading font-bold text-[#FFD700] w-14 text-center">{bidValue}</span>
                <button onClick={() => setBidValue(Math.min(13, bidValue + 1))} className="w-10 h-10 rounded-lg bg-[#333] text-white font-bold hover:bg-[#444]">+</button>
              </div>
              <p className="text-[#555] text-[10px] font-mono mb-4">
                {bidValue === 0 ? "NIL — +100 if 0 tricks, -100 if not" : `Win ${bidValue} trick${bidValue > 1 ? "s" : ""}`}
              </p>
              <button onClick={handleBid} className="bg-[#FFD700] text-[#0a0a1a] px-8 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors">
                LOCK IT IN
              </button>
            </div>
          </motion.div>
        )}

        {/* Round over */}
        {roundScores && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
            <div className="bg-[#1a1a2e] border border-[#FFD700]/30 rounded-xl p-6 text-center max-w-md">
              <h3 className="font-heading text-xl font-bold text-[#FFD700] mb-4">ROUND COMPLETE</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {roundScores.map((s, i) => (
                  <div key={i} className="bg-[#0a0a1a] rounded-lg p-3">
                    <p className="text-xs font-bold" style={{ color: i === 0 ? "#FF3D00" : "#FFD600" }}>{s.teamName}</p>
                    <p className="text-[10px] text-[#8B8B8B] font-mono mt-1">Bid: {s.bid} | Got: {s.tricks}</p>
                    <p className={`text-lg font-bold mt-1 ${s.points >= 0 ? "text-[#00FF88]" : "text-[#FF3D00]"}`}>
                      {s.points > 0 ? "+" : ""}{s.points}
                    </p>
                    {s.bagPenalty && <p className="text-[#FF3D00] text-[10px] font-mono animate-pulse">BAG PENALTY -100</p>}
                  </div>
                ))}
              </div>
              <button onClick={handleNextRound} className="bg-[#FFD700] text-[#0a0a1a] px-8 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors">
                NEXT ROUND
              </button>
            </div>
          </motion.div>
        )}

        {/* Game over */}
        {winner && !roundScores && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
            <div className="bg-[#1a1a2e] border border-[#FFD700]/30 rounded-xl p-8 text-center">
              <h3 className="font-heading text-3xl font-bold text-[#FFD700] mb-2">
                {winner.name === "You & Maya" ? "YOU WIN! 🏆" : "THEY WIN 😤"}
              </h3>
              <p className="text-[#8B8B8B] text-sm font-mono mb-1">{game.teams[0].score} — {game.teams[1].score}</p>
              <p className="text-[#555] text-xs font-mono mb-6">{game.roundNumber - 1} rounds</p>
              <button onClick={handleNewGame} className="bg-[#FFD700] text-[#0a0a1a] px-8 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors">
                RUN IT BACK
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Player hand */}
      <div className="mt-3 px-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-bold">Your Hand</p>
            {human.bid !== null && (
              <span className="text-[10px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded">
                Bid:{human.bid} | Won:{human.tricksTaken}
              </span>
            )}
          </div>
          {game.phase === "playing" && game.currentPlayer === 0 && (
            <span className="text-[#00FF88] text-xs font-mono animate-pulse">YOUR TURN</span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap justify-center">
          {human.hand.map((card, i) => {
            const ok = playable.some(c => c.suit === card.suit && c.rank === card.rank);
            return <CardFace key={`${card.suit}-${card.rank}`} card={card} playable={ok} onClick={() => ok && handlePlay(i)} />;
          })}
        </div>
      </div>
    </div>
  );
}
