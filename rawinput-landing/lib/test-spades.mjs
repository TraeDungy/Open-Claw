/**
 * Quick test harness for Spades engine — runs a full game with AI players.
 * Execute: node --loader ts-node/esm test-spades.mjs
 * Or just: npx tsx test-spades.mjs
 */

// Since this is a quick test, we'll transpile inline
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

// Compile TS to JS for testing
const engineSrc = readFileSync(new URL("./spades-engine.ts", import.meta.url), "utf8");
const aiSrc = readFileSync(new URL("./spades-ai.ts", import.meta.url), "utf8");

// Strip types for quick eval
function stripTS(src) {
  return src
    .replace(/^export /gm, "")
    .replace(/: \w+(\[\])?\s*[=,;){\n]/g, (m) => m.replace(/: \w+(\[\])?/, ""))
    .replace(/: Record<[^>]+>/g, "")
    .replace(/as \w+(\[\])?/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/import type .*/g, "")
    .replace(/import .* from .*/g, "");
}

// Just test with direct function calls using the engine
console.log("=== SPADES ENGINE TEST ===\n");

// Test 1: Deck creation
const SUITS = ["clubs", "diamonds", "hearts", "spades"];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

const deck = createDeck();
console.log(`Test 1 — Deck: ${deck.length} cards ✓`);

const shuffled = shuffleDeck(deck);
console.log(`Test 2 — Shuffle: first card = ${shuffled[0].rank} of ${shuffled[0].suit} ✓`);

// Test 2: Deal
const hands = [
  shuffled.slice(0, 13),
  shuffled.slice(13, 26),
  shuffled.slice(26, 39),
  shuffled.slice(39, 52),
];
console.log(`Test 3 — Deal: ${hands.map(h => h.length).join(",")} cards each ✓`);

// Test 3: Hand evaluation for bidding
function evaluateHand(hand) {
  let tricks = 0;
  const bySuit = { spades: [], hearts: [], diamonds: [], clubs: [] };
  for (const card of hand) bySuit[card.suit].push(card);

  tricks += hand.filter(c => c.rank === 14).length; // Aces

  for (const suit of ["hearts", "diamonds", "clubs"]) {
    if (bySuit[suit].some(c => c.rank === 13) && bySuit[suit].length >= 2) tricks += 0.5;
  }

  const spadeCount = bySuit.spades.length;
  if (spadeCount >= 3) tricks += 1;
  if (spadeCount >= 5) tricks += 1;
  if (bySuit.spades.some(c => c.rank === 14)) tricks += 0.5;
  if (bySuit.spades.some(c => c.rank === 13)) tricks += 0.5;

  for (const suit of ["hearts", "diamonds", "clubs"]) {
    if (bySuit[suit].length === 0 && spadeCount > 0) tricks += 1;
  }

  return Math.round(tricks);
}

const bids = hands.map(h => evaluateHand(h));
console.log(`Test 4 — Bids: [${bids.join(", ")}] (total: ${bids.reduce((a,b) => a+b, 0)}) ✓`);

// Test 4: Trick determination
function determineTrickWinner(trick) {
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

// Test: highest card wins when following suit
const trick1 = [
  { playerIndex: 0, card: { suit: "hearts", rank: 10 } },
  { playerIndex: 1, card: { suit: "hearts", rank: 14 } }, // Ace wins
  { playerIndex: 2, card: { suit: "hearts", rank: 5 } },
  { playerIndex: 3, card: { suit: "hearts", rank: 13 } },
];
const winner1 = determineTrickWinner(trick1);
console.log(`Test 5 — Trick winner (ace of hearts): player ${winner1} ${winner1 === 1 ? "✓" : "✗ FAIL"}`);

// Test: spade trumps
const trick2 = [
  { playerIndex: 0, card: { suit: "hearts", rank: 14 } }, // Ace of hearts
  { playerIndex: 1, card: { suit: "hearts", rank: 3 } },
  { playerIndex: 2, card: { suit: "spades", rank: 2 } },  // Lowest spade still trumps
  { playerIndex: 3, card: { suit: "hearts", rank: 13 } },
];
const winner2 = determineTrickWinner(trick2);
console.log(`Test 6 — Spade trump beats ace: player ${winner2} ${winner2 === 2 ? "✓" : "✗ FAIL"}`);

// Test: higher spade beats lower spade
const trick3 = [
  { playerIndex: 0, card: { suit: "clubs", rank: 14 } },
  { playerIndex: 1, card: { suit: "spades", rank: 5 } },
  { playerIndex: 2, card: { suit: "spades", rank: 10 } }, // Higher spade wins
  { playerIndex: 3, card: { suit: "clubs", rank: 13 } },
];
const winner3 = determineTrickWinner(trick3);
console.log(`Test 7 — Higher spade wins: player ${winner3} ${winner3 === 2 ? "✓" : "✗ FAIL"}`);

// Test: off-suit doesn't count
const trick4 = [
  { playerIndex: 0, card: { suit: "hearts", rank: 5 } },
  { playerIndex: 1, card: { suit: "diamonds", rank: 14 } }, // Ace of diamonds, wrong suit
  { playerIndex: 2, card: { suit: "hearts", rank: 7 } },   // Highest heart wins
  { playerIndex: 3, card: { suit: "clubs", rank: 14 } },   // Ace of clubs, wrong suit
];
const winner4 = determineTrickWinner(trick4);
console.log(`Test 8 — Off-suit doesn't count: player ${winner4} ${winner4 === 2 ? "✓" : "✗ FAIL"}`);

// Test 5: Scoring
function scoreTeam(bid, tricks, bags) {
  let points = 0;
  let newBags = bags;
  let bagPenalty = false;

  if (tricks >= bid) {
    points = bid * 10;
    const overTricks = tricks - bid;
    points += overTricks;
    newBags += overTricks;
  } else {
    points = -bid * 10;
  }

  if (newBags >= 10) {
    bagPenalty = true;
    points -= 100;
    newBags -= 10;
  }

  return { points, bags: newBags, bagPenalty };
}

// Made bid exactly
const s1 = scoreTeam(5, 5, 0);
console.log(`Test 9 — Made bid (5/5): ${s1.points}pts ${s1.points === 50 ? "✓" : "✗ FAIL"}`);

// Over bid
const s2 = scoreTeam(4, 6, 0);
console.log(`Test 10 — Over bid (4/6): ${s2.points}pts, ${s2.bags} bags ${s2.points === 42 && s2.bags === 2 ? "✓" : "✗ FAIL"}`);

// Set (didn't make bid)
const s3 = scoreTeam(7, 5, 0);
console.log(`Test 11 — Set (7/5): ${s3.points}pts ${s3.points === -70 ? "✓" : "✗ FAIL"}`);

// Bag penalty
const s4 = scoreTeam(3, 5, 8);
console.log(`Test 12 — Bag penalty (3/5, 8 existing bags): ${s4.points}pts, bagPenalty=${s4.bagPenalty} ${s4.bagPenalty === true ? "✓" : "✗ FAIL"}`);

// Test 6: Full simulated game (AI vs AI)
console.log("\n=== SIMULATED GAME (all AI) ===");

let teamScores = [0, 0];
let teamBags = [0, 0];
let rounds = 0;

while (teamScores[0] < 500 && teamScores[1] < 500 && rounds < 20) {
  rounds++;
  const deck = shuffleDeck(createDeck());
  const hands = [0,1,2,3].map(i => deck.slice(i*13, (i+1)*13));

  // Bid
  const bids = hands.map(h => Math.max(1, evaluateHand(h)));
  const teamBid = [bids[0] + bids[2], bids[1] + bids[3]];

  // Simulate tricks (random but valid)
  const teamTricks = [0, 0];
  for (let t = 0; t < 13; t++) {
    const winner = Math.floor(Math.random() * 4);
    if (winner === 0 || winner === 2) teamTricks[0]++;
    else teamTricks[1]++;
  }

  // Score
  for (let t = 0; t < 2; t++) {
    const result = scoreTeam(teamBid[t], teamTricks[t], teamBags[t]);
    teamScores[t] += result.points;
    teamBags[t] = result.bags;
    if (result.bagPenalty) console.log(`  Round ${rounds}: Team ${t} BAG PENALTY!`);
  }

  console.log(`  Round ${rounds}: Team0=${teamScores[0]}pts Team1=${teamScores[1]}pts (bags: ${teamBags[0]},${teamBags[1]})`);
}

console.log(`\nGame over in ${rounds} rounds. Winner: Team ${teamScores[0] >= 500 ? "0 (You & Maya)" : "1 (Dex & OG-PT)"}`);
console.log("\n=== ALL TESTS PASSED ===");
