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

## Intake schema (the 180-column master CSV)

Every submission is appended to `submissions.csv` using the canonical
production schema in [`schema.mjs`](./schema.mjs): **52 submission-level
columns + 32 columns × 4 person blocks (`p1_`–`p4_`) = 180 columns**, in a
fixed header order that imports cleanly into Sheets/Airtable. Singles fill
only `p1_`; couples `p1_`–`p2_`; throuples and quads add `p3_`/`p4_`. Unused
person blocks stay blank.

The form supports **solo, couple, throuple, and quad** submissions — the
card deck regenerates per party size, and each player gets their own deck
(contact, age band, identity/pronouns + on-screen display preference, poly
style, bio, green/red flags, dealbreakers, hard limits, and **individual
consent flags** for live broadcast, media release, and voluntary
participation — no one can sign for anyone else).

### Privacy model (two-stage intake)

The public form collects only the **required-at-intake** tier:

- **Age bands, not DOB.** Exact DOB, legal names, emergency contacts, and
  verification documents are collected later via a secured callback workflow
  — the columns exist so the master CSV doubles as the booking sheet, but
  they stay blank at intake.
- **No sex or STI questions.** `p#_sex` is never asked;
  `p#_sti_status_optional` defaults to the privacy-protective
  `not_disclosed`.
- **Per-person consent enforcement.** If any active player's
  `consent_live_broadcast` / `consent_media_release` / `consent_voluntary`
  is not `yes`, the row is written with `mod_safety_flag=review` so it can't
  be cast until resolved.
- **Internal columns** (`producer_status`, seven `producer_score_*` fields,
  `producer_notes`, `mod_safety_flag`) ride along blank/system-set and are
  never applicant-facing.
- Accessibility and transport needs are first-class intake fields, owned by
  production.

### Producer export

```bash
EXPORT_TOKEN=yoursecret node server.mjs
curl "http://localhost:3020/api/export.csv?token=yoursecret" -o applicants.csv
```

Direct static access to `submissions.csv`, `submissions.jsonl`, and
`uploads/` (applicant photos) is blocked — the CSV references photos by
filename only.

## Run locally

```bash
cd vegas-slot-dating-form
node server.mjs          # http://localhost:3020
```

No dependencies — pure Node 18+, vanilla JS/CSS frontend.

Submissions append to `submissions.csv` + `submissions.jsonl` (both
git-ignored). If the API is unreachable (e.g. static-only deploy),
submissions are backed up to `localStorage` so no lead is ever lost.

## Environment variables (all optional)

```bash
PORT=3020
EXPORT_TOKEN=...                 # enables /api/export.csv
EVENT_NAME="POLY SWIPE"          # event metadata prefilled into every row
EVENT_CITY="Fort Lauderdale"
EVENT_STATE=FL
EVENT_VENUE="Polywood Live Studio"
EVENT_DATE=2026-07-24
SEASON_LABEL="Summer 2026"
AIRTABLE_API_KEY=...             # forward a summary record per submission
AIRTABLE_BASE_ID=...
AIRTABLE_TABLE="Poly Swipe Applicants"
```

Airtable receives a screening summary (`Submission ID`, `Name`, `Email`,
`Phone`, `Group Size`, `Config`, `Searching For`, `Stage Role`, `City`,
`State`, `Status`, `Safety Flag`, `Submitted At`) — the full 180-column
record lives in the master CSV.

## Deploy to the VPS (standard Open Claw pattern)

```bash
# on the VPS
pm2 start server.mjs --name poly-swipe --cwd /root/Open-Claw/vegas-slot-dating-form
pm2 save
```

Then add an nginx location block (e.g. `/jackpot/` → `localhost:3020`) in
`/etc/nginx/sites-enabled/unified-routing.conf`. The frontend uses relative
API paths so it works behind any subpath.
