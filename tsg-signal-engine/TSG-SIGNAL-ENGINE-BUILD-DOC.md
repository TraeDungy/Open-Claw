# TSG Signal Engine — Complete Build Documentation

**Project:** THE SIGNAL — Autonomous Email Newsletter Engine
**Owner:** Trial X Fire / Telekinesis Support Group
**Status:** Ready to ship (static images). GIF Art Direction Engine pending.
**VPS:** 5.78.44.176 (Hetzner CPX31)
**Repo path:** `/Users/trialxfire/open claw/tsg-signal-engine/`
**Landing page:** `/Users/trialxfire/open claw/tsg-landing/`

---

## What This Is

An autonomous PM2 service that runs on the VPS and sends a premium weekly/monthly newsletter called **THE SIGNAL** to TSG subscribers. Content is auto-generated from 202 curated archive entries (declassified government docs, frequency research, researcher profiles). Each email gets a custom LLM-written intro in the TSG brand voice via Kimi K2.5 (free, local).

The newsletter looks like a classified dossier from a 1990s government research lab — file folder tabs, monospace classification stamps, evidence grades, forensic typography, and a hidden scavenger hunt (THE DEAD DROP) with near-invisible clickable links to obscure declassified documents.

---

## Architecture

```
VPS PM2: tsg-signal-engine (runs hourly)
  │
  ├─ Drip Engine (14-day, 6 emails per new subscriber)
  │   ├─ Day 1:  WHAT IS THE SIGNAL? (LLM manifesto)
  │   ├─ Day 3:  YOUR FIRST FILE (CIA Stargate spotlight)
  │   ├─ Day 5:  THE FREQUENCY VARIABLE (528 Hz deep-dive)
  │   ├─ Day 7:  TRAIN YOUR PERCEPTION (Zener tool challenge)
  │   ├─ Day 10: THE SUBJECTS WHO CAME BEFORE (Swann + Kulagina)
  │   └─ Day 14: OPEN SIGNAL (film CTA + calibration complete)
  │
  ├─ Broadcast Engine (ongoing, subscriber-chosen cadence)
  │   ├─ Weekly: rotates through 85-entry content calendar
  │   └─ Monthly: 4-entry curated digest, first week of month
  │
  ├─ LLM Polish (Kimi K2.5 via LiteLLM localhost:9000)
  │   ├─ TSG brand voice system prompt (Signal Archaeology + divine energy + Black mysticism)
  │   └─ Fallback: raw content summary if LLM unavailable
  │
  ├─ Banner Generator (GPT Image API — per-issue)
  │   ├─ 70s-80s pulp sci-fi style locked prompt
  │   ├─ Content-type specific modifiers (declassified, frequency, profile, etc.)
  │   └─ Saves to /banners/ directory, served via nginx
  │
  └─ Resend API
      ├─ contacts.list() → sync subscribers
      ├─ emails.send() → deliver
      └─ 90/day rate cap (10 reserved for signup welcomes)
```

---

## File Inventory

### Signal Engine (`/root/tsg-signal-engine/` on VPS)

| File | Lines | Purpose |
|------|-------|---------|
| `tsg-signal-engine.mjs` | ~130 | Main loop — runs hourly, syncs contacts, sends drips + broadcasts |
| `env.mjs` | ~15 | Loads .env file into process.env |
| `llm.mjs` | ~55 | LiteLLM client with TSG brand voice system prompt |
| `resend.mjs` | ~35 | Resend API — list contacts, send emails |
| `state.mjs` | ~80 | Subscriber state persistence (JSON file) |
| `atomic-write.mjs` | ~8 | Safe atomic JSON writes |
| `content.mjs` | ~55 | Loads archive JSON, resolves entries, generates content calendar |
| `drip.mjs` | ~80 | 6-email drip sequence definitions + scheduling logic |
| `broadcast.mjs` | ~35 | Weekly/monthly content calendar rotation |
| `templates.mjs` | ~500 | Full HTML email template system (dossier aesthetic) |
| `banner-gen.mjs` | ~130 | GPT Image API banner generator per issue |
| `ecosystem.config.cjs` | ~20 | PM2 config |
| `.env` | ~8 | Secrets (Resend, LiteLLM, site URL) |
| `data/files.json` | — | 104 archive entries (7 categories) |
| `data/frequencies.json` | — | 98 frequency entries (8 categories) |
| `generate-test-issue.mjs` | ~100 | Test issue generator (dev only) |

### Landing Page Changes (`tsg-landing/`)

| File | Change |
|------|--------|
| `components/Navigation.tsx` | NEW — mobile hamburger nav + SUBMIT link |
| `components/CadenceSelector.tsx` | NEW — weekly/monthly picker after signup |
| `components/SignupForm.tsx` | MODIFIED — wired to API + cadence flow |
| `components/TrainingModes.tsx` | MODIFIED — wired to API + cadence flow |
| `components/Hero.tsx` | MODIFIED — next/image optimization |
| `components/Footer.tsx` | MODIFIED — Open Signal film CTA |
| `app/layout.tsx` | MODIFIED — extracted nav to Navigation component |
| `app/tool/page.tsx` | MODIFIED — upgraded to full ZenerGame |
| `app/submit/page.tsx` | NEW — film submission form |
| `app/api/signup/route.ts` | MODIFIED — PATCH for cadence, Resend audience |
| `app/api/contact/route.ts` | NEW — film submission endpoint |
| `lib/resend.ts` | NEW — Resend SDK singleton |
| `lib/hooks/useSignup.ts` | NEW — shared signup hook with cadence |
| `lib/emails/*.ts` | NEW — 4 email templates (welcome, content-drop, film-call, base-layout) |
| `data/files.json` | NEW — extracted archive data |
| `data/frequencies.json` | NEW — extracted frequency data |
| `scripts/extract-content.mjs` | NEW — one-time content extraction |

---

## Newsletter Structure (THE SIGNAL)

Each issue has up to 11 sections, each styled as a file folder tab:

1. **TSG TEXT LOGO** — centered at very top, signal dot + "TELEKINESIS / SUPPORT GROUP"
2. **FILE TAB** — "THE SIGNAL — No. 007" manila folder tab
3. **CLASSIFICATION STRIP** — "THE CONTROL SERIES™" + date in monospace
4. **HERO IMAGE** — full-bleed banner (AI-generated per issue)
5. **THE BRIEFING** — personal, conversational cold open (italic)
6. **THE MAIN FILE** — lead article with:
   - Tabloid headline (hood-raw energy)
   - Feature image (cinematic poster quality)
   - Long-form body (14px, 1.9 line height)
   - CLASSIFIED EXCERPT box (red border, monospace, document ID)
   - EVIDENCE GRADE (progress bar with A+ through F rating)
   - THE BOTTOM LINE (summary box with grade)
7. **THE DOSSIER** — "By the Numbers" stat block (large monospace numbers)
8. **ALSO IN THIS FILE** — 3-4 article cards with:
   - Color-coded tags (DECLASSIFIED=red, FREQUENCY=amber, DISCLOSURE=green, PROFILE=gold, STUDY=green)
   - Evidence grade badges
   - Optional thumbnail images
   - Clickable titles
9. **SUBJECT FILE** — profile card (name, era, origin, bio, pull quote)
10. **SIGNAL OF THE WEEK** — recent news, brief
11. **LAST WEEK WE SAID...** — prediction tracker (▲ HIT green / ▼ MISS red)
12. **FROM THE FIELD** — reader intel (amber-bordered field note, italic)
13. **RABBIT HOLE** — dashed green border, teaser + "GO DEEP →"
14. **THE DEAD DROP** — near-invisible scavenger hunt (6-7% opacity text, hidden clickable dot linking to obscure declassified document, GPS coordinates watermark)
15. **THE CLOSER** — centered italic quote
16. **FOOTER LOGO** — signal dot ring + TSG text, centered
17. **FOOTER LINKS** — ARCHIVE | FREQUENCIES | SUBMIT | UNSUB
18. **SPECTRUM LINE** — gradient bar at bottom of dossier

---

## Evidence Grade System

| Grade | Label | Color | Use |
|-------|-------|-------|-----|
| A+ | VERIFIED | #00FFB3 | Multiple declassified docs + independent confirmation |
| A | STRONG | #00FFB3 | Government documents, congressional testimony |
| B+ | CREDIBLE | #FFC260 | Peer-reviewed research, multiple witnesses |
| B | PLAUSIBLE | #FFC260 | Single credible source, circumstantial |
| C | UNCONFIRMED | #FF8A18 | Interesting but unverifiable |
| D | SPECULATIVE | #FF2A1F | We're telling you, not vouching |
| F | BS | #FF2A1F | We looked into it. It's not real. |

---

## Brand Voice (LLM System Prompt)

The voice of THE SIGNAL is:
- **Assured, unhurried, spacious** — like a late-night radio host who knows something
- **Divine feminine + masculine energy** — the signal flows through all traditions
- **Modern Black mysticism** — afrofuturist, diasporic, deeply rooted
- **Clinical precision + sacred ritual** — oscilloscope meets mandala
- **5D consciousness growth** — grounded, never woo-woo, always links to evidence
- **"No claims. No promises. Just show up and pay attention."**

Never sell. Never hype. Always invite. No exclamation marks. No emoji. Em dashes, not semicolons.

---

## Visual Style

- **70s-80s pulp sci-fi paperback cover** aesthetic for all banner/feature images
- **Painterly, golden amber, textured grain, aged edges**
- **Color palette:** void black (#050505), bone (#F5E3B3), ember (#FF8A18), signal (#FFC260), hazard (#FF2A1F), pulse (#00FFB3)
- **Typography:** Courier New monospace for all metadata/labels (forensic, classification stamps), Inter/Helvetica for body text
- **The hero-woman image** (third eye, golden light, sacred geometry) is the signature reference for all generated art

---

## Content Calendar (85 entries, auto-cycles)

| Weeks | Content | Count |
|-------|---------|-------|
| 1-7 | Declassified spotlights | 7 |
| 8-16 | Solfeggio frequency deep-dives | 9 |
| 17-26 | Researcher profiles | 10 |
| 27-38 | Institute spotlights | 12 |
| 39-45 | Studies | 7 |
| 46-53 | Ancient frequencies | 8 |
| 54-59 | Tibetan/spiritual | 6 |
| 60-65 | Science-based | 6 |
| 66-74 | UAP Disclosure | 9 |
| 75-84 | Organ frequencies | 11 |
| 85+ | Cycle restarts | — |

---

## Deployment

```bash
# 1. SCP engine to VPS
scp -i ~/.ssh/id_ed25519_hetzner -r "/Users/trialxfire/open claw/tsg-signal-engine/" root@5.78.44.176:/root/tsg-signal-engine/

# 2. Copy poster assets to public directory on VPS
ssh root@5.78.44.176 "mkdir -p /path/to/tsg-landing/public/posters /path/to/tsg-landing/public/banners"
scp -i ~/.ssh/id_ed25519_hetzner "/Users/trialxfire/open claw/tsg-landing/public/posters/"*.png root@5.78.44.176:/path/to/tsg-landing/public/posters/

# 3. Start engine
ssh root@5.78.44.176
cd /root/tsg-signal-engine
pm2 start ecosystem.config.cjs
pm2 save

# 4. Deploy updated landing page
cd /path/to/tsg-landing
git pull && npm ci && npm run build && pm2 restart tsg-landing

# 5. Verify
pm2 logs tsg-signal-engine --lines 20
```

---

## Environment Variables

```
LITELLM_BASE_URL=http://127.0.0.1:9000/v1
LITELLM_MODEL=llm-kimi
RESEND_API_KEY=re_9WrJ3ymN_6W7MmdYwfqm1zm2vTv7zWnyy
RESEND_AUDIENCE_ID=b7bddc0b-11ef-4570-905d-1cc4571c1708
FROM_EMAIL=TSG <onboarding@resend.dev>
SITE_URL=http://5.78.44.176/tsg
SEND_HOUR_UTC=14
MAX_DAILY_SENDS=90
```

---

## PENDING: GIF Art Direction Engine

**Status:** Not built. Documented here for the agentic team to pick up.

**Objective:** Build an autonomous creative production pipeline that generates premium animated GIFs for each newsletter issue. Each GIF should be artwork in its own right — not generic motion graphics.

### Style Categories (each gets a locked generation prompt + animation technique)

| Category | Visual Style | Animation | Use Case |
|----------|-------------|-----------|----------|
| **LEAD** | 70s-80s pulp sci-fi, painterly, golden amber | Slow Ken Burns zoom, subtle glow pulse | Main article banner |
| **DECLASSIFIED** | Warhol pop-art treatment of government documents | Color-shift loop, scanline overlay | Classified file spotlights |
| **FREQUENCY** | Surrealist abstract — Dalí meets oscilloscope | Cymatic ring expansion, wave modulation | Frequency deep-dives |
| **PROFILE** | Ultra-realistic portrait, dramatic lighting, solid backdrop | Subtle breathing/glow, light flicker | Subject files |
| **STUDY** | MS-DOS style icons, retro terminal aesthetic | Cursor blink, text scroll, data readout | Research/data pieces |
| **DISCLOSURE** | Anime/manga panel style, dramatic reveal | Panel wipe, speed lines | UAP/disclosure content |
| **OBJECT** | Still life, immaculate lighting, solid color backdrop | Slow rotation, light sweep | Instrument/artifact features |
| **GENRE** | Sub-genre specific, varies | Varies | Section divider GIFs |

### Technical Constraints for Email GIFs

- **Max file size:** 200KB ideal, 1MB absolute max
- **Max dimensions:** 480px wide (600px absolute max)
- **Frame rate:** 10-15 fps
- **Colors:** 64-128 (GIF format max: 256)
- **Duration:** 2-3 seconds, seamless loop
- **Format:** GIF89a only (JPEG for stills, PNG for transparency)
- **Outlook desktop (2007-2019):** Shows first frame only — design first frame as standalone
- **Gmail clipping:** Images are external, don't count toward 102KB HTML limit
- **Total email HTML:** Keep under 100KB

### Pipeline Architecture

```
Content Calendar Entry
  → Determine style category from content type
  → Generate still image (GPT Image API, locked prompt)
  → Animate still (FFmpeg two-pass: raw MP4 → palette → optimized GIF)
  → Quality gate (LLM evaluates against style guide)
  → If pass: save to /banners/ and serve via nginx
  → If fail: regenerate or fall back to static image
```

### Animation Techniques (FFmpeg)

- **Ken Burns zoom:** `zoompan=z='1.0+0.001*on':d=30:s=600x200:fps=10`
- **Glow pulse:** `eq=brightness='0.05*sin(2*PI*t/3)'`
- **Scanline overlay:** `drawbox=x=0:y=mod(n*2,h):w=iw:h=1:color=white@0.03`
- **Color shift:** `hue=h=t*10`
- **Two-pass palette optimization:** Pass 1 `palettegen=max_colors=96`, Pass 2 `paletteuse=dither=bayer:bayer_scale=3`

### Tools Required

- **FFmpeg 7.1** (already on VPS) — animation, palette optimization
- **GPT Image API** (via OpenRouter or direct) — still generation
- **Gifsicle** (install on VPS: `apt install gifsicle`) — final compression pass
- **LLM quality gate** (Kimi K2.5 via LiteLLM) — evaluate output against style guide

### Build Steps for Agent Team

1. Create `gif-art-engine.mjs` in `/root/tsg-signal-engine/`
2. Implement style category → prompt mapping (use prompts from `banner-gen.mjs` CONTENT_PROMPTS)
3. Build GPT Image → FFmpeg animation → Gifsicle compression pipeline
4. Add quality gate: send generated image back to LLM with style guide, ask for pass/fail/retry
5. Integrate into `tsg-signal-engine.mjs` main loop — generate before sending each issue
6. Store generated assets in `/root/tsg-signal-engine/banners/` and serve via nginx
7. Test each style category with at least 3 sample entries
8. Verify GIF file sizes stay under 200KB
9. Verify seamless looping (use `-loop 0` flag, ensure last frame matches first)
10. Add fallback to static poster images if generation fails

---

## Resend Configuration

- **API Key:** `re_9WrJ3ymN_...` (in .env)
- **Audience:** "TSG Signal List" (`b7bddc0b-...`)
- **Free tier:** 100 emails/day, 3,000/month
- **Cadence stored in:** Resend contact `lastName` field ("weekly" or "monthly")
- **Upgrade path:** Resend Pro ($20/mo) at 30+ subscribers for 5,000/month

---

## Testing

```bash
# Generate a test issue locally
node generate-test-issue.mjs
# Output: /tmp/tsg-ultimate.html

# Preview with local server
cd ../tsg-landing/public && python3 -m http.server 8788 &
sed 's|http://5.78.44.176/tsg/|http://localhost:8788/|g' /tmp/tsg-ultimate.html > /tmp/tsg-preview.html
open /tmp/tsg-preview.html

# Send a real test email via Resend API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"from\":\"TSG <onboarding@resend.dev>\",\"to\":[\"your@email.com\"],\"subject\":\"TEST — THE SIGNAL\",\"html\":\"$(cat /tmp/tsg-ultimate.html | jq -Rs .)\"}"
```
