/**
 * Spades Game Engine — pure logic, no UI.
 * Standard 4-player partnership Spades.
 */

// ── TYPES ──

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type PlayerIndex = 0 | 1 | 2 | 3; // 0=human, 1=partner(Maya), 2=opponent(Dex), 3=opponent(OG-PT)

export interface Player {
  index: PlayerIndex;
  name: string;
  hand: Card[];
  bid: number | null; // null = hasn't bid yet
  tricksTaken: number;
}

export interface Team {
  name: string;
  players: [PlayerIndex, PlayerIndex];
  score: number;
  bags: number;
}

export interface TrickCard {
  playerIndex: PlayerIndex;
  card: Card;
}

export type GamePhase = "dealing" | "bidding" | "playing" | "trick-complete" | "round-over" | "game-over";

export interface GameState {
  phase: GamePhase;
  players: Player[];
  teams: [Team, Team]; // team0=[0,2] human+Maya, team1=[1,3] Dex+OG-PT — wait, partnerships
  deck: Card[];
  currentTrick: TrickCard[];
  trickLeader: PlayerIndex;
  currentPlayer: PlayerIndex;
  spadesbroken: boolean;
  tricksPlayed: number;
  roundNumber: number;
  winningScore: number;
  lastTrickWinner: PlayerIndex | null;
}

// ── CONSTANTS ──

const SUITS: Suit[] = ["clubs", "diamonds", "hearts", "spades"];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const RANK_NAMES: Record<number, string> = {
  2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8",
  9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A",
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣",
};

// ── HELPERS ──

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function cardValue(card: Card): number {
  // For comparing within same suit
  return card.rank;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { clubs: 0, diamonds: 1, hearts: 2, spades: 3 };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
    return a.rank - b.rank;
  });
}

export function cardToString(card: Card): string {
  return `${RANK_NAMES[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

// ── GAME CREATION ──

export function createGame(winningScore = 500): GameState {
  const players: Player[] = [
    { index: 0, name: "You", hand: [], bid: null, tricksTaken: 0 },
    { index: 1, name: "Dex", hand: [], bid: null, tricksTaken: 0 },
    { index: 2, name: "Maya", hand: [], bid: null, tricksTaken: 0 },
    { index: 3, name: "OG-PT", hand: [], bid: null, tricksTaken: 0 },
  ];

  // Partnerships: You(0) + Maya(2) vs Dex(1) + OG-PT(3)
  const teams: [Team, Team] = [
    { name: "You & Maya", players: [0, 2], score: 0, bags: 0 },
    { name: "Dex & OG-PT", players: [1, 3], score: 0, bags: 0 },
  ];

  return {
    phase: "dealing",
    players,
    teams,
    deck: [],
    currentTrick: [],
    trickLeader: 0,
    currentPlayer: 0,
    spadesbroken: false,
    tricksPlayed: 0,
    roundNumber: 1,
    winningScore,
    lastTrickWinner: null,
  };
}

// ── DEAL ──

export function dealCards(state: GameState): GameState {
  const deck = shuffleDeck(createDeck());
  const newState = { ...state, deck: [] };

  for (let i = 0; i < 4; i++) {
    newState.players = newState.players.map((p, idx) => ({
      ...p,
      hand: sortHand(deck.slice(idx * 13, (idx + 1) * 13)),
      bid: null,
      tricksTaken: 0,
    }));
  }

  newState.phase = "bidding";
  newState.currentPlayer = newState.trickLeader; // Dealer's left starts bidding
  newState.currentTrick = [];
  newState.spadesbroken = false;
  newState.tricksPlayed = 0;

  return newState;
}

// ── BIDDING ──

export function placeBid(state: GameState, playerIndex: PlayerIndex, bid: number): GameState {
  if (state.phase !== "bidding") throw new Error("Not in bidding phase");
  if (state.currentPlayer !== playerIndex) throw new Error("Not your turn to bid");
  if (bid < 0 || bid > 13) throw new Error("Bid must be 0-13");

  const newPlayers = state.players.map((p) =>
    p.index === playerIndex ? { ...p, bid } : p
  );

  const nextPlayer = ((playerIndex + 1) % 4) as PlayerIndex;
  const allBid = newPlayers.every((p) => p.bid !== null);

  return {
    ...state,
    players: newPlayers,
    currentPlayer: allBid ? state.trickLeader : nextPlayer,
    phase: allBid ? "playing" : "bidding",
  };
}

// ── PLAYING ──

export function getPlayableCards(state: GameState, playerIndex: PlayerIndex): Card[] {
  const player = state.players[playerIndex];
  const hand = player.hand;

  if (state.currentTrick.length === 0) {
    // Leading the trick
    if (!state.spadesbroken) {
      const nonSpades = hand.filter((c) => c.suit !== "spades");
      // Must lead non-spades unless only spades left
      return nonSpades.length > 0 ? nonSpades : hand;
    }
    return hand;
  }

  // Must follow suit if possible
  const leadSuit = state.currentTrick[0].card.suit;
  const suitCards = hand.filter((c) => c.suit === leadSuit);

  if (suitCards.length > 0) return suitCards;

  // Can't follow suit — play anything
  return hand;
}

export function playCard(state: GameState, playerIndex: PlayerIndex, card: Card): GameState {
  if (state.phase !== "playing") throw new Error("Not in playing phase");
  if (state.currentPlayer !== playerIndex) throw new Error("Not your turn");

  const playable = getPlayableCards(state, playerIndex);
  const isPlayable = playable.some((c) => c.suit === card.suit && c.rank === card.rank);
  if (!isPlayable) throw new Error("Card not playable");

  // Remove card from hand
  const newPlayers = state.players.map((p) =>
    p.index === playerIndex
      ? { ...p, hand: p.hand.filter((c) => !(c.suit === card.suit && c.rank === card.rank)) }
      : p
  );

  const newTrick = [...state.currentTrick, { playerIndex, card }];
  let spadesbroken = state.spadesbroken || card.suit === "spades";

  if (newTrick.length < 4) {
    // Trick not complete yet
    return {
      ...state,
      players: newPlayers,
      currentTrick: newTrick,
      currentPlayer: ((playerIndex + 1) % 4) as PlayerIndex,
      spadesbroken,
    };
  }

  // Trick complete — determine winner
  const winner = determineTrickWinner(newTrick);

  const updatedPlayers = newPlayers.map((p) =>
    p.index === winner ? { ...p, tricksTaken: p.tricksTaken + 1 } : p
  );

  const tricksPlayed = state.tricksPlayed + 1;

  if (tricksPlayed >= 13) {
    // Round over
    return {
      ...state,
      players: updatedPlayers,
      currentTrick: newTrick,
      spadesbroken,
      tricksPlayed,
      lastTrickWinner: winner,
      phase: "trick-complete",
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    currentTrick: newTrick,
    trickLeader: winner,
    currentPlayer: winner,
    spadesbroken,
    tricksPlayed,
    lastTrickWinner: winner,
    phase: "trick-complete",
  };
}

export function clearTrick(state: GameState): GameState {
  if (state.phase !== "trick-complete") throw new Error("No trick to clear");

  if (state.tricksPlayed >= 13) {
    return { ...state, currentTrick: [], phase: "round-over" };
  }

  return {
    ...state,
    currentTrick: [],
    currentPlayer: state.lastTrickWinner!,
    phase: "playing",
  };
}

function determineTrickWinner(trick: TrickCard[]): PlayerIndex {
  const leadSuit = trick[0].card.suit;
  let winningPlay = trick[0];

  for (let i = 1; i < trick.length; i++) {
    const play = trick[i];
    if (play.card.suit === "spades" && winningPlay.card.suit !== "spades") {
      winningPlay = play;
    } else if (play.card.suit === winningPlay.card.suit && play.card.rank > winningPlay.card.rank) {
      winningPlay = play;
    }
  }

  return winningPlay.playerIndex;
}

// ── SCORING ──

export interface RoundScore {
  teamName: string;
  bid: number;
  tricks: number;
  points: number;
  bags: number;
  bagPenalty: boolean;
}

export function scoreRound(state: GameState): { scores: [RoundScore, RoundScore]; newState: GameState } {
  const scores: RoundScore[] = state.teams.map((team) => {
    const bid = team.players.reduce<number>((sum, pi) => sum + (state.players[pi].bid || 0), 0);
    const tricks = team.players.reduce<number>((sum, pi) => sum + state.players[pi].tricksTaken, 0);

    let points = 0;
    let bags = 0;
    let bagPenalty = false;

    if (bid === 0) {
      // Both players bid nil — handle individually
      // For simplicity, treat as team bid of 0
      points = tricks === 0 ? 100 : -100;
    } else if (tricks >= bid) {
      points = bid * 10;
      bags = tricks - bid;
      points += bags; // 1 point per bag
    } else {
      // Set — didn't make bid
      points = -bid * 10;
    }

    // Check bag penalty
    const totalBags = team.bags + bags;
    if (totalBags >= 10) {
      bagPenalty = true;
      points -= 100;
      bags = totalBags - 10; // Reset bags
    } else {
      bags = totalBags;
    }

    return { teamName: team.name, bid, tricks, points, bags, bagPenalty };
  });

  // Apply scores
  const newTeams: [Team, Team] = [
    { ...state.teams[0], score: state.teams[0].score + scores[0].points, bags: scores[0].bags },
    { ...state.teams[1], score: state.teams[1].score + scores[1].points, bags: scores[1].bags },
  ];

  // Check for game over
  const gameOver = newTeams.some((t) => t.score >= state.winningScore);

  const newState: GameState = {
    ...state,
    teams: newTeams,
    roundNumber: state.roundNumber + 1,
    trickLeader: ((state.trickLeader + 1) % 4) as PlayerIndex,
    phase: gameOver ? "game-over" : "dealing",
  };

  return { scores: scores as [RoundScore, RoundScore], newState };
}

// ── GAME WINNER ──

export function getWinner(state: GameState): Team | null {
  if (state.phase !== "game-over") return null;
  if (state.teams[0].score >= state.winningScore && state.teams[1].score >= state.winningScore) {
    return state.teams[0].score >= state.teams[1].score ? state.teams[0] : state.teams[1];
  }
  if (state.teams[0].score >= state.winningScore) return state.teams[0];
  if (state.teams[1].score >= state.winningScore) return state.teams[1];
  return null;
}
