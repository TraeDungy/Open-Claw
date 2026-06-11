# 🎰💘 POLY SWIPE — Vegas Slot Dating Game Show Form

Mobile-first guest application form for the live poly dating game. A mix of
**Tinder swiping** and a **casino big-win slot machine** — built to make
signing up feel like hitting a jackpot.

**Brand:** POLYWOOD presents POLY SWIPE — "One Swipe Could Change Everything."
Pink-chrome + gold-chrome 3D title, script taglines, neon swipe arrows, gold
bokeh on black — all assets are self-hosted CSS/SVG/woff2 (see `assets/` and
`fonts/`), matching the show flyer.

## The experience

1. **Attract mode** — neon marquee with chasing bulbs, flickering chrome "POLY SWIPE"
   sign, and a real spinning 3-reel slot machine. Tap **PULL TO PLAY** → reels
   spin with blur + staggered stops and land on 💘💘💘 → screen shakes, coins
   rain, the form begins.
2. **Card deck** — each question is a playing card stacked Tinder-style.
   Answer it, then **swipe right** (or tap LOCK IT IN) to stamp it `LOCKED`
   and fly it off-screen with spring physics. Invalid answers shake the card
   and snap it back. Every locked card pays out **+100 credits** with a rolling
   counter and progress bulbs lighting up.
3. **The lever** — final screen: physically drag the slot lever all the way
   down to submit. Reels spin while the submission posts.
4. **JACKPOT** — coin shower, confetti blast, +777,777 rolling win counter,
   and a share button to refer other players (native share sheet / clipboard).

Micro-details: WebAudio synth sound effects (chip clicks, lock-in arpeggio,
jackpot fanfare) with mute toggle, haptic vibration on mobile, safe-area
support for notched phones, and `prefers-reduced-motion` support.

## What it collects

| Field | Type |
|---|---|
| Name | text |
| **Email** | validated email |
| Age range | single select (18+ gate) |
| City | text |
| Relationship structure | multi select |
| Looking for | multi select |
| Social handle | optional text |
| On-camera comfort | single select |
| One-line pitch | optional textarea |

## Run locally

```bash
cd vegas-slot-dating-form
node server.mjs          # http://localhost:3020
```

No dependencies — pure Node 18+, vanilla JS/CSS frontend.

Submissions append to `submissions.jsonl` (git-ignored). If the API is
unreachable (e.g. static-only deploy), submissions are backed up to
`localStorage` so no lead is ever lost.

## Airtable forwarding (optional)

Set these env vars and every submission is also pushed to Airtable:

```bash
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...
AIRTABLE_TABLE="Poly Swipe Applicants"
```

Expected Airtable fields: `Name`, `Email`, `Age Range`, `City`,
`Relationship Structure`, `Looking For`, `Social`, `On Camera`, `Pitch`,
`Submitted At`.

## Deploy to the VPS (standard Open Claw pattern)

```bash
# on the VPS
pm2 start server.mjs --name poly-swipe --cwd /root/Open-Claw/vegas-slot-dating-form
pm2 save
```

Then add an nginx location block (e.g. `/jackpot/` → `localhost:3020`) in
`/etc/nginx/sites-enabled/unified-routing.conf`. The frontend uses relative
API paths so it works behind any subpath.
