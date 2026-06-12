#!/usr/bin/env node
/**
 * WLTBO Pixel Art Playing Card Generator
 * Adapted from Outlaw Empire Port City sprite pipeline.
 * Uses OpenRouter → Gemini Flash Image (free) for generation.
 *
 * Generates 52 pixel-art playing cards + 1 card back design.
 * Style: Chunky pixel art, white card face, black pixel border,
 * bold pixel suit symbols, face cards with character art.
 *
 * Usage: node generate-pixel-cards.mjs [--dry-run] [--limit N] [--suit spades]
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";

const API_KEY = process.env.OPENROUTER_API_KEY || "";
const MODEL = "google/gemini-2.5-flash-image";
const OUT_DIR = "./public/block-sprites/cards";
const DELAY_MS = 2000;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ── ART BIBLE (LOCKED) ──

const ART_BIBLE = `You are an elite pixel artist specializing in playing card design.
Follow these non-negotiable rules:

STYLE:
- Classic pixel art playing card, NOT photo-realistic
- Chunky visible pixels, hard edges, NO anti-aliasing, NO gradients, NO blur
- Style reference: GBA/SNES era pixel art cards, 16-bit aesthetic
- Each card rendered as a single upright playing card on transparent background

CARD STRUCTURE:
- White/cream card face with thick black pixel border (3-4px)
- Slightly rounded corners (1-2px radius in pixel terms)
- Rank in top-left corner: bold pixel font, large and readable
- Suit symbol in top-left below rank, small
- Large centered suit symbol(s) for number cards
- Rank + suit repeated upside-down in bottom-right
- Face cards (J/Q/K): pixel art royal figure filling center area

COLORS (LOCKED):
- Card face: pure white (#FFFFFF)
- Border: black (#000000), thick pixel outline
- Hearts & Diamonds: bright red (#FF0000)
- Spades & Clubs: black (#000000)
- Face card accents: gold (#FFD700), royal blue (#2060C0), red (#E83030)
- NO other colors for suit symbols

DO NOT include any text labels, watermarks, shadows, or background.
Output a single PNG image of one playing card.`;

// ── CARD DEFINITIONS ──

const SUITS = ["spades", "hearts", "diamonds", "clubs"];
const SUIT_NAMES = { spades: "Spades", hearts: "Hearts", diamonds: "Diamonds", clubs: "Clubs" };
const SUIT_SYMBOLS = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };
const SUIT_COLORS = { spades: "black", hearts: "red", diamonds: "red", clubs: "black" };

const RANKS = [
  { rank: "A", name: "Ace", desc: "single large suit symbol centered, bold A in corners" },
  { rank: "2", name: "Two", desc: "two suit symbols vertically arranged" },
  { rank: "3", name: "Three", desc: "three suit symbols in triangle arrangement" },
  { rank: "4", name: "Four", desc: "four suit symbols in 2x2 grid" },
  { rank: "5", name: "Five", desc: "five suit symbols, 2-1-2 arrangement" },
  { rank: "6", name: "Six", desc: "six suit symbols in 2x3 grid" },
  { rank: "7", name: "Seven", desc: "seven suit symbols, 2-1-2-1-1 arrangement" },
  { rank: "8", name: "Eight", desc: "eight suit symbols in structured arrangement" },
  { rank: "9", name: "Nine", desc: "nine suit symbols filling the card center" },
  { rank: "10", name: "Ten", desc: "ten suit symbols densely arranged" },
  { rank: "J", name: "Jack", desc: "pixel art young royal figure in profile, holding a weapon, ornate costume with suit-colored accents" },
  { rank: "Q", name: "Queen", desc: "pixel art queen figure holding a flower or scepter, crown, ornate dress with suit-colored accents, mirrored top-bottom" },
  { rank: "K", name: "King", desc: "pixel art king figure with crown, beard, holding sword, robes with suit-colored accents, mirrored top-bottom" },
];

function buildPrompt(suit, rankDef) {
  const suitName = SUIT_NAMES[suit];
  const suitSym = SUIT_SYMBOLS[suit];
  const suitColor = SUIT_COLORS[suit];
  const isFaceCard = ["J", "Q", "K"].includes(rankDef.rank);

  let details = `
Generate a single pixel art playing card:
- Card: ${rankDef.name} of ${suitName} (${rankDef.rank}${suitSym})
- Suit color: ${suitColor}
- Suit symbol: ${suitSym}
- Layout: ${rankDef.desc}
`;

  if (isFaceCard) {
    details += `- This is a FACE CARD: the center should show a detailed pixel art royal figure
- The figure should be mirrored (upside-down duplicate in bottom half, like real cards)
- Use gold (#FFD700) for crown/jewelry accents
- The royal figure should have visible pixel features: eyes, mouth, clothing detail
- Make the figure fill most of the card center area
`;
  }

  details += `- Card dimensions: portrait orientation, roughly 3:4 aspect ratio
- Transparent background behind the card
- The card should look like a physical playing card rendered in chunky pixel art
`;

  return ART_BIBLE + "\n" + details;
}

// ── GENERATION ──

async function generateCard(suit, rankDef) {
  const filename = `${rankDef.rank.toLowerCase()}_${suit}.png`;
  const outPath = `${OUT_DIR}/${filename}`;

  if (existsSync(outPath)) {
    console.log(`  [SKIP] ${filename} (exists)`);
    return true;
  }

  const prompt = buildPrompt(suit, rankDef);

  console.log(`  [GEN] ${rankDef.rank} of ${SUIT_NAMES[suit]}...`);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: `Generate this image: ${prompt}` }],
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      console.error(`  [ERR] HTTP ${res.status}: ${await res.text()}`);
      return false;
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;

    // Extract image
    const images = msg?.images || [];
    for (const img of images) {
      const url = img?.image_url?.url || img?.url || "";
      if (url.startsWith("data:image/")) {
        const b64 = url.split(",")[1];
        const buf = Buffer.from(b64, "base64");
        writeFileSync(outPath, buf);
        console.log(`  [OK] ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
        return true;
      }
    }

    // Check multipart content
    const content = msg?.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.inline_data) {
          const buf = Buffer.from(part.inline_data.data, "base64");
          writeFileSync(outPath, buf);
          console.log(`  [OK] ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
          return true;
        }
      }
    }

    console.error(`  [ERR] No image in response for ${filename}`);
    return false;
  } catch (e) {
    console.error(`  [ERR] ${filename}: ${e.message}`);
    return false;
  }
}

async function generateCardBack() {
  const outPath = `${OUT_DIR}/back.png`;
  if (existsSync(outPath)) {
    console.log(`  [SKIP] back.png (exists)`);
    return;
  }

  const prompt = `${ART_BIBLE}

Generate a pixel art playing card BACK design:
- Ornate repeating geometric pattern in deep purple (#2D1B4E) and gold (#FFD700)
- Thick black pixel border
- Central diamond/medallion shape with "RI" monogram in pixel font
- Symmetrical design (rotated 180 degrees looks identical)
- Rich, royal feel — like a premium card deck
- Transparent background behind the card shape
`;

  console.log("  [GEN] Card back...");
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: `Generate this image: ${prompt}` }],
        max_tokens: 4096,
      }),
    });

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    const images = msg?.images || [];
    for (const img of images) {
      const url = img?.image_url?.url || img?.url || "";
      if (url.startsWith("data:image/")) {
        const buf = Buffer.from(url.split(",")[1], "base64");
        writeFileSync(outPath, buf);
        console.log(`  [OK] back.png (${(buf.length / 1024).toFixed(0)} KB)`);
        return;
      }
    }
    console.error("  [ERR] No image for card back");
  } catch (e) {
    console.error(`  [ERR] Card back: ${e.message}`);
  }
}

// ── MAIN ──

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 0;
const suitIdx = args.indexOf("--suit");
const onlySuit = suitIdx >= 0 ? args[suitIdx + 1] : null;

console.log("=== WLTBO Pixel Art Card Generator ===");
console.log(`Model: ${MODEL}`);
console.log(`Output: ${OUT_DIR}`);
if (dryRun) console.log("[DRY RUN] — no API calls");
if (onlySuit) console.log(`Suit filter: ${onlySuit}`);
if (limit) console.log(`Limit: ${limit} cards`);
console.log("");

(async () => {
  let generated = 0;
  let failed = 0;
  let count = 0;

  const suits = onlySuit ? [onlySuit] : SUITS;

  // Card back first
  if (!dryRun) {
    await generateCardBack();
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  for (const suit of suits) {
    console.log(`\n── ${SUIT_NAMES[suit] || suit} ──`);
    for (const rankDef of RANKS) {
      if (limit && count >= limit) break;
      count++;

      if (dryRun) {
        console.log(`  [DRY] ${rankDef.rank} of ${SUIT_NAMES[suit]}`);
        continue;
      }

      const ok = await generateCard(suit, rankDef);
      if (ok) generated++;
      else failed++;

      await new Promise(r => setTimeout(r, DELAY_MS));
    }
    if (limit && count >= limit) break;
  }

  console.log(`\n=== Done ===`);
  console.log(`Generated: ${generated} | Failed: ${failed} | Total: ${count}`);
  console.log(`Output: ${OUT_DIR}`);
})();
