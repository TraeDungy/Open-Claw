/**
 * Spades AI — personality-driven agent strategies.
 * Maya: Conservative, makes her bid.
 * Dex: Aggressive, overbids, goes for big plays.
 * OG-PT: Strategic, counts cards, veteran energy.
 */

import type { Card, GameState, PlayerIndex, Suit, TrickCard } from "./spades-engine";
import { getPlayableCards, cardValue } from "./spades-engine";

type Personality = "conservative" | "aggressive" | "strategic";

const PERSONALITY_MAP: Record<string, Personality> = {
  "Maya": "conservative",
  "Dex": "aggressive",
  "OG-PT": "strategic",
};

// ── BIDDING ──

export function aiBid(state: GameState, playerIndex: PlayerIndex): number {
  const player = state.players[playerIndex];
  const hand = player.hand;
  const personality = PERSONALITY_MAP[player.name] || "conservative";

  let bid = evaluateHand(hand);

  switch (personality) {
    case "aggressive":
      bid = Math.min(13, bid + 1); // Dex always overbids by 1
      break;
    case "conservative":
      bid = Math.max(1, bid); // Maya always bids at least 1, never nil
      break;
    case "strategic":
      // OG-PT considers partner's bid
      const partnerIndex = ((playerIndex + 2) % 4) as PlayerIndex;
      const partnerBid = state.players[partnerIndex].bid;
      if (partnerBid !== null && partnerBid >= 4) {
        bid = Math.max(1, bid - 1); // Back off if partner bid high
      }
      break;
  }

  return Math.max(1, Math.min(13, bid));
}

function evaluateHand(hand: Card[]): number {
  let tricks = 0;

  // Count by suit
  const bySuit: Record<Suit, Card[]> = { spades: [], hearts: [], diamonds: [], clubs: [] };
  for (const card of hand) {
    bySuit[card.suit].push(card);
  }

  // Aces are almost always tricks
  tricks += hand.filter((c) => c.rank === 14).length;

  // Kings with 2+ in suit are usually tricks
  for (const suit of ["hearts", "diamonds", "clubs"] as Suit[]) {
    const suitCards = bySuit[suit];
    if (suitCards.some((c) => c.rank === 13) && suitCards.length >= 2) {
      tricks += 0.5;
    }
  }

  // Spades are strong
  const spadeCount = bySuit.spades.length;
  if (spadeCount >= 3) tricks += 1;
  if (spadeCount >= 5) tricks += 1;

  // Spade face cards
  if (bySuit.spades.some((c) => c.rank === 14)) tricks += 0.5; // Ace of spades extra value
  if (bySuit.spades.some((c) => c.rank === 13)) tricks += 0.5;

  // Void suits = potential trumping
  for (const suit of ["hearts", "diamonds", "clubs"] as Suit[]) {
    if (bySuit[suit].length === 0 && spadeCount > 0) tricks += 1;
  }

  return Math.round(tricks);
}

// ── PLAYING ──

export function aiPlayCard(state: GameState, playerIndex: PlayerIndex): Card {
  const playable = getPlayableCards(state, playerIndex);
  if (playable.length === 1) return playable[0];

  const player = state.players[playerIndex];
  const personality = PERSONALITY_MAP[player.name] || "conservative";

  if (state.currentTrick.length === 0) {
    return aiLead(playable, state, playerIndex, personality);
  }

  return aiFollow(playable, state, playerIndex, personality);
}

function aiLead(playable: Card[], state: GameState, playerIndex: PlayerIndex, personality: Personality): Card {
  // Sort by rank descending
  const sorted = [...playable].sort((a, b) => b.rank - a.rank);

  switch (personality) {
    case "aggressive":
      // Dex leads with highest card to assert dominance
      return sorted[0];

    case "conservative":
      // Maya leads mid-range, saves high cards
      const mid = Math.floor(sorted.length / 2);
      return sorted[mid];

    case "strategic":
      // OG-PT leads with aces to cash guaranteed tricks
      const aces = sorted.filter((c) => c.rank === 14 && c.suit !== "spades");
      if (aces.length > 0) return aces[0];
      // Otherwise lead lowest
      return sorted[sorted.length - 1];
  }
}

function aiFollow(playable: Card[], state: GameState, playerIndex: PlayerIndex, personality: Personality): Card {
  const leadSuit = state.currentTrick[0].card.suit;
  const isFollowingSuit = playable[0].suit === leadSuit;
  const partnerIndex = ((playerIndex + 2) % 4) as PlayerIndex;

  // Check if partner is currently winning
  const partnerWinning = isPartnerWinningTrick(state.currentTrick, partnerIndex);

  if (isFollowingSuit) {
    return followSuitStrategy(playable, state, partnerWinning, personality);
  }

  // Can't follow suit — decide whether to trump
  return trumpStrategy(playable, state, partnerWinning, personality);
}

function isPartnerWinningTrick(trick: TrickCard[], partnerIndex: PlayerIndex): boolean {
  if (trick.length === 0) return false;

  const leadSuit = trick[0].card.suit;
  let winnerIndex = trick[0].playerIndex;
  let winnerCard = trick[0].card;

  for (let i = 1; i < trick.length; i++) {
    const play = trick[i];
    if (play.card.suit === "spades" && winnerCard.suit !== "spades") {
      winnerIndex = play.playerIndex;
      winnerCard = play.card;
    } else if (play.card.suit === winnerCard.suit && play.card.rank > winnerCard.rank) {
      winnerIndex = play.playerIndex;
      winnerCard = play.card;
    }
  }

  return winnerIndex === partnerIndex;
}

function followSuitStrategy(playable: Card[], state: GameState, partnerWinning: boolean, personality: Personality): Card {
  const sorted = [...playable].sort((a, b) => a.rank - b.rank);

  if (partnerWinning) {
    // Partner is winning — play lowest to save high cards
    return sorted[0];
  }

  // Try to win the trick
  const currentHigh = getHighestInTrick(state.currentTrick);

  // Cards that can beat current high
  const winners = sorted.filter((c) => c.rank > currentHigh.rank);

  if (winners.length > 0) {
    switch (personality) {
      case "aggressive":
        return winners[winners.length - 1]; // Play highest winner
      case "conservative":
        return winners[0]; // Play lowest winner
      case "strategic":
        // Play just enough to win
        return winners[0];
    }
  }

  // Can't win — dump lowest
  return sorted[0];
}

function trumpStrategy(playable: Card[], state: GameState, partnerWinning: boolean, personality: Personality): Card {
  const spades = playable.filter((c) => c.suit === "spades");
  const nonSpades = playable.filter((c) => c.suit !== "spades");

  if (partnerWinning) {
    // Don't waste a trump — dump lowest non-spade
    if (nonSpades.length > 0) {
      return nonSpades.sort((a, b) => a.rank - b.rank)[0];
    }
    return spades.sort((a, b) => a.rank - b.rank)[0]; // Only spades left
  }

  // Consider trumping
  const alreadyTrumped = state.currentTrick.some((tc) => tc.card.suit === "spades");

  if (spades.length > 0) {
    if (alreadyTrumped) {
      // Need to overtrump
      const highestSpadeInTrick = Math.max(
        ...state.currentTrick.filter((tc) => tc.card.suit === "spades").map((tc) => tc.card.rank)
      );
      const overTrumps = spades.filter((c) => c.rank > highestSpadeInTrick);
      if (overTrumps.length > 0) {
        return overTrumps.sort((a, b) => a.rank - b.rank)[0];
      }
    } else {
      // First to trump
      switch (personality) {
        case "aggressive":
          return spades.sort((a, b) => b.rank - a.rank)[0]; // Highest spade
        case "conservative":
          return spades.sort((a, b) => a.rank - b.rank)[0]; // Lowest spade
        case "strategic":
          return spades.sort((a, b) => a.rank - b.rank)[0]; // Lowest spade — efficient
      }
    }
  }

  // Can't/won't trump — dump lowest
  const all = [...playable].sort((a, b) => a.rank - b.rank);
  return all[0];
}

function getHighestInTrick(trick: TrickCard[]): Card {
  const leadSuit = trick[0].card.suit;
  let highest = trick[0].card;

  for (const tc of trick) {
    if (tc.card.suit === "spades" && highest.suit !== "spades") {
      highest = tc.card;
    } else if (tc.card.suit === highest.suit && tc.card.rank > highest.rank) {
      highest = tc.card;
    }
  }

  return highest;
}

// ── TRASH TALK ──

const TRASH_TALK: Record<string, string[]> = {
  "Maya": [
    "I told y'all I was coming for that bid.",
    "That's called fundamentals. Look it up.",
    "My partner got me. That's how you do it.",
    "See, this is why I don't play with amateurs.",
    "Book. After book. After book.",
  ],
  "Dex": [
    "YOOOO did you see that play?! I'm HIM.",
    "Somebody come get they mans, he just got cooked.",
    "I don't make bids, I EXCEED them.",
    "That ace ain't saving you. Nothing saving you.",
    "GG. Actually no, it wasn't good for YOU.",
  ],
  "OG-PT": [
    "I counted every card. You played exactly what I expected.",
    "Young blood, I've been cutting spades since before you had WiFi.",
    "Patience. That's what separates the winners from the bidders.",
    "The wise play isn't always the obvious one.",
    "I've seen this hand before. 1997. Same result.",
  ],
};

export function getTrashTalk(agentName: string, context: "won-trick" | "made-bid" | "set-opponent" | "nil-success"): string {
  const lines = TRASH_TALK[agentName] || TRASH_TALK["Maya"];
  return lines[Math.floor(Math.random() * lines.length)];
}
