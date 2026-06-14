# TSG -- Telekinesis Support Group / THE SIGNAL

**Project:** TSG -- Signal Archaeology Newsletter & Archive Platform
**Owner:** Trial X Fire (@The_Operatorbot)
**VPS:** 5.78.227.123
**Live URL:** http://5.78.227.123/tsg/
**GitHub:** TraeDungy/TSG (standalone) + TraeDungy/Open-Claw (branch: tsg-season-1-production)

---

## 1. Overview

TSG (Telekinesis Support Group) is an autonomous newsletter platform and curated archive built around **Signal Archaeology** -- the practice of documenting phenomena at the threshold of human perception. The project sits at the intersection of declassified government research, ancient practices, peer-reviewed consciousness studies, and modern Black mysticism.

### Brand Aesthetic

- **Visual:** 70s-80s pulp sci-fi paperback covers -- painterly, golden amber, textured grain, aged edges
- **Voice:** Assured, unhurried, spacious -- like a late-night radio host who knows something. Divine feminine + masculine energy. Afrofuturist, diasporic, deeply rooted. Oscilloscope meets mandala. Clinical precision meets sacred ritual.
- **Tone:** "No claims. No promises. Just show up and pay attention." Never sell. Never hype. Always invite. No exclamation marks. No emoji. Em dashes, not semicolons.
- **5D consciousness growth** -- grounded, never woo-woo, always links to evidence even when the evidence is strange

### Design System

| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `void` | Void Black | `#050505` | Backgrounds |
| `bone` | Bone | `#F5E3B3` | Primary text, body copy |
| `ember` | Ember | `#FF8A18` | Accents, labels |
| `signal` | Signal | `#FFC260` | Headlines, CTAs |
| `hazard` | Hazard | `#FF2A1F` | Warnings, DECLASSIFIED tags |
| `pulse` | Pulse | `#00FFB3` | Success, VERIFIED, evidence bars |

**Fonts:** Rajdhani (headings, display), Inter (body text), Courier New (monospace -- classification stamps, metadata, forensic labels)

---

## 2. Architecture

```
                        LANDING PAGE (tsg-landing/)
                        Next.js 14 | Port 3020 | PM2 ID 26
                        ┌─────────────────────────────────┐
                        │  /           Home + signup form  │
  Visitor ──────────────│  /files      Archive (104 items) │
                        │  /frequencies  Freq DB (98 items)│
                        │  /tool       Zener card trainer  │
                        │  /submit     Film submission     │
                        └──────┬──────────────┬────────────┘
                               │              │
                    POST /api/signup    POST /api/contact
                               │              │
                               ▼              ▼
                        ┌──────────────┐  Admin email
                        │  Resend API  │  (film submission
                        │  Audience    │   notification)
                        │  + Welcome   │
                        └──────┬───────┘
                               │ Contact synced hourly
                               ▼
                SIGNAL ENGINE (tsg-signal-engine/)
                Node.js PM2 | Port 3095 (approval) | PM2 ID 29
                ┌─────────────────────────────────────────┐
                │                                         │
                │  Hourly Cycle                           │
                │  ├─ syncContacts() ← Resend API         │
                │  ├─ processDrips() → 6 emails / 14 days │
                │  ├─ processBroadcasts() → weekly/monthly │
                │  └─ Content Scout (Sundays only)        │
                │                                         │
                │  LLM Polish ─────→ Kimi K2.5 via        │
                │                    LiteLLM :9000        │
                │                                         │
                │  Banner Gen ─────→ Gemini Flash Image   │
                │                    via OpenRouter       │
                │                                         │
                │  Delivery ───────→ Resend API           │
                │                    (90/day cap)         │
                └─────────────────────────────────────────┘
```

---

## 3. Landing Page (tsg-landing/)

### Tech Stack

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.16 | App Router, standalone output |
| React | 18.3.1 | UI framework |
| Tailwind CSS | 3.4.15 | Utility-first styling |
| Framer Motion | 11.11.17 | Page transitions, scroll reveals |
| Resend | 6.12.4 | Email delivery SDK |
| Sharp | 0.34.5 | Image optimization |
| TypeScript | 5.6.3 | Type safety |

### Configuration

```js
// next.config.mjs
{
  output: 'standalone',     // Self-contained build for PM2
  basePath: '/tsg',          // Served behind nginx at /tsg/
  images: {
    formats: ['image/avif', 'image/webp']
  }
}
```

### Pages

| Route | File | Description |
|-------|------|-------------|
| `/tsg` | `app/page.tsx` | Landing page -- hero, pillars, signup, training modes, sessions |
| `/tsg/files` | `app/files/page.tsx` | Archive browser -- 104 entries across 7 categories with tab navigation |
| `/tsg/frequencies` | `app/frequencies/page.tsx` | Frequency database -- 98 entries across 8 categories |
| `/tsg/tool` | `app/tool/page.tsx` | Zener card perception training game (5 symbols, 20 rounds) |
| `/tsg/submit` | `app/submit/page.tsx` | Dual-tab: contact form + film submission portal |

### Components (20 total)

| Component | Description |
|-----------|-------------|
| `Archives.tsx` | Archive browser with category tabs and search |
| `CadenceSelector.tsx` | Weekly/monthly frequency picker shown after signup |
| `CymaticField.tsx` | Animated cymatic wave background effect |
| `EventCard.tsx` | Card component for events/sessions |
| `FieldGuideCard.tsx` | Field guide content card with evidence grade |
| `Footer.tsx` | Site footer with Open Signal film CTA and links |
| `Hero.tsx` | Full-bleed hero with third-eye portrait, particle field, signup |
| `InlineTonePlayer.tsx` | Audio player for frequency tones (inline) |
| `Navigation.tsx` | Mobile hamburger nav with archive sub-menu |
| `ParticleField.tsx` | Canvas-based ambient particle animation |
| `Pillars.tsx` | Three-pillar section (declassified, ancient, modern) |
| `ProgressionPath.tsx` | Visual progression/journey tracker |
| `ScrollReveal.tsx` | Framer Motion scroll-triggered reveal wrapper |
| `SignalLine.tsx` | Decorative animated signal/frequency line |
| `SignupForm.tsx` | Email signup form wired to /api/signup + cadence selector |
| `ToneGenerator.tsx` | Interactive frequency tone generator |
| `ToolPreview.tsx` | Preview card for the Zener perception tool |
| `TrainingModes.tsx` | Training mode selector with signup integration |
| `ZenerCard.tsx` | Individual Zener card component (circle, star, waves, square, cross) |
| `ZenerGame.tsx` | Full Zener card game -- 20 rounds, hit rate tracking, statistics |

### API Routes

#### `POST /api/signup`

Creates a Resend audience contact, sends a welcome email, and notifies the admin.

- **Body:** `{ email: string, source?: string }`
- **Actions:** Create Resend contact -> send welcome email -> send admin notification
- **Response:** `{ ok: true }` or `{ error: string }`

#### `PATCH /api/signup`

Updates a contact's cadence preference (weekly or monthly).

- **Body:** `{ email: string, cadence: "weekly" | "monthly" }`
- **Storage:** Cadence stored in Resend contact `lastName` field
- **Response:** `{ ok: true }`

#### `POST /api/contact`

Film submission endpoint. Sends formatted submission to admin email.

- **Body:** `{ name, email, filmTitle, genre, runtime, link, synopsis, statement }`
- **Genres:** Sci-Fi, Futurism, Afrofuturism, Consciousness & Perception, Experimental / Avant-Garde, Documentary, Other

### Data Files

#### `data/files.json` -- 104 entries, 7 categories

| Category | Count | Content |
|----------|-------|---------|
| `declassified` | 7 | CIA, DIA, NSA programs (Stargate, Grill Flame, Sun Streak) |
| `disclosure` | 9 | UAP/UFO releases, congressional hearings, whistleblowers |
| `studies` | 7 | Peer-reviewed consciousness/psi research |
| `individuals` | 10 | Documented practitioners and researchers |
| `schools` | 12 | Research institutions and training centers |
| `timeline` | 42 | Historical timeline of psi research |
| `media` | 17 | Documentaries, books, video essays |

#### `data/frequencies.json` -- 98 entries, 8 categories

| Category | Count | Content |
|----------|-------|---------|
| `solfeggio` | 9 | Solfeggio frequency deep-dives (174-963 Hz) |
| `organs` | 11 | Organ resonance frequencies |
| `ancient` | 8 | Ancient/Pythagorean frequencies |
| `tibetan` | 6 | Tibetan singing bowl frequencies |
| `science` | 6 | Science-based sound therapy |
| `brainwaves` | 6 | Brainwave entrainment (delta, theta, alpha, beta, gamma) |
| `timeline` | 34 | Historical frequency research timeline |
| `media` | 18 | Sound healing documentaries and resources |

### Email Templates (`lib/emails/`)

| File | Template | Used For |
|------|----------|----------|
| `base-layout.ts` | Shared HTML wrapper -- void black background, TSG header, footer | All emails |
| `welcome.ts` | Welcome email sent on signup | POST /api/signup |
| `content-drop.ts` | Archive content spotlight email | Signal engine drips/broadcasts |
| `film-call.ts` | Open Signal film submission CTA | Drip day 14 |

### Shared Libraries (`lib/`)

| File | Purpose |
|------|---------|
| `resend.ts` | Resend SDK singleton -- exports `resend`, `AUDIENCE_ID`, `FROM_EMAIL`, `SITE_URL` |
| `hooks/useSignup.ts` | React hook for signup flow with cadence selection |

---

## 4. Signal Engine (tsg-signal-engine/)

The Signal Engine is an autonomous PM2 service that runs hourly on the VPS. It syncs subscribers from Resend, sends drip emails to new subscribers, broadcasts weekly/monthly content to graduated subscribers, and runs a weekly Content Scout to discover new archive material.

### Module Inventory

| Module | Lines | Purpose |
|--------|-------|---------|
| `tsg-signal-engine.mjs` | 190 | Main loop -- hourly cycle, contact sync, drip + broadcast dispatch |
| `env.mjs` | ~15 | Loads `.env` into `process.env` |
| `llm.mjs` | 53 | LiteLLM client with TSG brand voice system prompt |
| `resend.mjs` | ~35 | Resend API wrapper -- list contacts, send emails |
| `state.mjs` | ~80 | Subscriber state persistence (JSON file, daily send counter) |
| `atomic-write.mjs` | ~8 | Safe atomic JSON file writes |
| `content.mjs` | ~55 | Archive JSON loader, entry resolver, content calendar generator |
| `drip.mjs` | 72 | 6-email drip sequence definitions + scheduling logic |
| `broadcast.mjs` | ~35 | Weekly/monthly content calendar rotation |
| `templates.mjs` | 543 | Full HTML email template system (dossier aesthetic) |
| `banner-gen.mjs` | ~130 | Gemini Flash Image banner generator per issue |
| `gen-banners.mjs` | -- | Batch banner generation script |
| `content-scout.mjs` | 512 | Weekly agentic archive curator with approval workflow |
| `generate-test-issue.mjs` | ~100 | Dev-only test issue generator |
| `ecosystem.config.cjs` | 22 | PM2 configuration |

### Hourly Cycle

```
Every hour:
  1. resetIfNewDay()         -- reset daily send counter at midnight
  2. syncContacts()          -- pull Resend audience, init new subscribers
  3. If SEND_HOUR (14 UTC):
     a. processDrips()       -- send due drip emails to new subscribers
     b. processBroadcasts()  -- send weekly/monthly content to graduated subscribers
     c. Content Scout        -- weekly archive scan (Sundays only)
```

### Drip Sequence (6 emails over 14 days)

| Day | ID | Subject | Type | Content |
|-----|----|---------|------|---------|
| 1 | `manifesto` | WHAT IS THE SIGNAL? | LLM-generated | Brand manifesto -- Signal Archaeology, three pillars, what they'll receive |
| 3 | `first-file` | YOUR FIRST FILE | Content spotlight | CIA Stargate Program deep-dive (declassified[0]) |
| 5 | `frequency` | THE FREQUENCY VARIABLE | Content spotlight | 528 Hz (solfeggio[4]) |
| 7 | `tool` | TRAIN YOUR PERCEPTION | LLM-generated | Zener card tool intro + training challenge (CTA: /tool) |
| 10 | `subjects` | THE SUBJECTS WHO CAME BEFORE | Dual spotlight | Nina Kulagina + Ingo Swann profiles (individuals[2] + individuals[0]) |
| 14 | `open-signal` | OPEN SIGNAL | LLM-generated | Film submission CTA + calibration complete (CTA: /submit) |

After day 14, the subscriber is marked `dripComplete` and enters the broadcast rotation.

### Broadcast Engine

**Weekly subscribers:** Receive one content spotlight per week, rotating through an 85-entry content calendar that cycles through all archive categories.

**Monthly subscribers:** Receive a 4-entry curated digest in the first week of each month.

| Calendar Position | Content Type | Entries |
|-------------------|-------------|---------|
| Weeks 1-7 | Declassified spotlights | 7 |
| Weeks 8-16 | Solfeggio frequency deep-dives | 9 |
| Weeks 17-26 | Researcher profiles | 10 |
| Weeks 27-38 | Institute spotlights | 12 |
| Weeks 39-45 | Studies | 7 |
| Weeks 46-53 | Ancient frequencies | 8 |
| Weeks 54-59 | Tibetan/spiritual | 6 |
| Weeks 60-65 | Science-based | 6 |
| Weeks 66-74 | UAP Disclosure | 9 |
| Weeks 75-84 | Organ frequencies | 11 |
| Week 85+ | Calendar restarts from beginning | -- |

### LLM Integration

- **Model:** Kimi K2.5 via LiteLLM (`http://127.0.0.1:9000/v1`)
- **Temperature:** 0.4 (newsletter intros), 0.3 (content scout)
- **Max tokens:** 1024 (intros), 8192 (scout recommendations)
- **Fallback:** If LLM is unavailable, raw content summary is used instead
- **Brand voice:** Fully defined system prompt (see `llm.mjs`)

### Email Template System (templates.mjs)

Each email is rendered as a classified dossier with up to 18 sections:

| Section | Description |
|---------|-------------|
| TSG Text Logo | Signal dot + "TELEKINESIS / SUPPORT GROUP" centered |
| File Tab | "THE SIGNAL -- No. 007" manila folder tab |
| Classification Strip | "THE CONTROL SERIES" + date in monospace |
| Hero Image | Full-bleed AI-generated banner |
| The Briefing | Conversational cold open (italic) |
| The Main File | Lead article with headline, body, classified excerpt, evidence grade |
| The Dossier | "By the Numbers" stat block |
| Also in This File | 3-4 article cards with color-coded tags |
| Subject File | Profile card (name, era, origin, bio, pull quote) |
| Signal of the Week | Recent news brief |
| Last Week We Said | Prediction tracker (HIT/MISS) |
| From the Field | Reader intel (amber-bordered note) |
| Rabbit Hole | Teaser + "GO DEEP" link |
| The Dead Drop | Near-invisible scavenger hunt (6-7% opacity, hidden clickable dot) |
| The Closer | Centered italic quote |
| Footer Logo | Signal dot ring + TSG text |
| Footer Links | ARCHIVE / FREQUENCIES / SUBMIT / UNSUB |
| Spectrum Line | Gradient bar at bottom |

**Exported template functions:**

| Function | Purpose |
|----------|---------|
| `theSignal()` | Master template -- assembles all sections |
| `manifesto()` | Day 1 drip -- brand manifesto |
| `contentSpotlight()` | Single archive entry spotlight |
| `dualSpotlight()` | Two-subject profile email |
| `toolIntro()` | Zener card tool introduction |
| `openSignal()` | Day 14 drip -- film CTA + calibration complete |
| `weeklySignal()` | Weekly broadcast (wraps contentSpotlight) |
| `monthlyDigest()` | Monthly 4-entry digest |

### Evidence Grade System

| Grade | Label | Color | Bar % | Use |
|-------|-------|-------|-------|-----|
| A+ | VERIFIED | `#00FFB3` | 96% | Multiple declassified docs + independent confirmation |
| A | STRONG | `#00FFB3` | 82% | Government documents, congressional testimony |
| B+ | CREDIBLE | `#FFC260` | 72% | Peer-reviewed research, multiple witnesses |
| B | PLAUSIBLE | `#FFC260` | 58% | Single credible source, circumstantial |
| C | UNCONFIRMED | `#FF8A18` | 40% | Interesting but unverifiable |
| D | SPECULATIVE | `#FF2A1F` | 22% | We're telling you, not vouching |
| F | BS | `#FF2A1F` | 8% | We looked into it. It's not real. |

### Banner Generation (banner-gen.mjs)

Generates a unique banner per newsletter issue using the Gemini Flash Image API via OpenRouter.

**Locked style base:** 70s-80s pulp science fiction paperback cover art. Syd Mead/John Harris aesthetic. Void black, warm amber-gold, ember orange, bone cream, rare phosphor green. Film grain, aged edges, sacred geometry, volumetric golden light.

**Content-specific prompt modifiers:**

| Type | Visual |
|------|--------|
| `declassified` | 1970s government lab desk, manila folders, reel-to-reel tape, redacted documents |
| `frequency` | Chladni plate, golden sand mandala, standing wave patterns |
| `individual` | Figure in Rembrandt lighting, third eye amber glow, cymatic rings |
| `institute` | Aerial research campus at twilight, brutalist architecture, ley line geometry |
| `study` | Analog lab -- oscilloscopes, EEG leads, statistical anomaly charts |

---

## 5. Content Scout Workflow

The Content Scout is an autonomous weekly curation agent that discovers new archive material, presents it for human approval, and auto-publishes approved entries.

```
Sunday at SEND_HOUR (14 UTC)
          │
          ▼
   ┌──────────────────────────┐
   │  shouldRunScout(now)     │   Last run >= 6 days ago?
   │  Day === Sunday?         │   No scout-state.json?
   └──────────┬───────────────┘
              │ yes
              ▼
   ┌──────────────────────────┐
   │  Load Archive            │   files.json (104 entries)
   │  Build existing titles   │   frequencies.json (98 entries)
   │  Set = ~200 titles       │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │  For each of 23 search   │   5 core + 10 expanded +
   │  categories:             │   5 media + 3 afrofuturism
   │                          │
   │  1. webSearch() via      │   Perplexity Sonar
   │     OpenRouter            │   (OpenRouter API key)
   │  2. llmCall() to         │   Kimi K2.5 generates
   │     generate 2-3 entries │   JSON entries per category
   │  3. Deduplicate against  │   existing titles Set
   │  4. 2s rate limit pause  │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │  Save to scout-state.json│   status: "pending_approval"
   │  Send approval email     │   Cards with APPROVE/SKIP
   │  to admin                │   + APPROVE ALL / REJECT ALL
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │  Approval Server         │   HTTP on port 3095
   │  /approve/:id            │   Approve single entry
   │  /reject/:id             │   Skip single entry
   │  /approve-all            │   Approve all entries
   │  /reject-all             │   Reject all entries
   └──────────┬───────────────┘
              │ on approve
              ▼
   ┌──────────────────────────┐
   │  applyApproved()         │
   │  1. Write to data/*.json │   Both engine + landing copies
   │  2. invalidateCache()    │   Content module reloads
   │  3. Auto-rebuild site    │   next build + pm2 restart
   │  4. Send confirmation    │   Admin email: "X entries live"
   └──────────────────────────┘
```

### Search Categories (23 total)

**Core (5):** declassified, disclosure, studies, individuals, frequencies

**Expanded Consciousness (10):** telekinesis/PK, levitation, dematerialization, tummo/invincibility, rainbow body/metamorphosis, lucid dreaming/OBE, bilocation, siddhi abilities, elemental manipulation, physical manifestation

**Media + Video (3):** consciousness documentaries, YouTube/lectures, video essays

**Afrofuturism (5):** visual art, film, books/fiction, music, mythology/cosmology

---

## 6. Deployment

### VPS Services

| Service | PM2 ID | Port | Process |
|---------|--------|------|---------|
| `tsg-landing` | 26 | 3020 | Next.js standalone server |
| `tsg-signal-engine` | 29 | -- (3095 for scout approval) | Hourly email engine |

### nginx Configuration

The landing page is served at `/tsg/` via nginx reverse proxy. Static assets are served directly:

```nginx
location /tsg/ {
    proxy_pass http://127.0.0.1:3020/tsg/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Static assets served directly
location /tsg/assets/ {
    alias /root/tsg-landing/public/assets/;
}

location /tsg/posters/ {
    alias /root/tsg-landing/public/posters/;
}
```

### Deploy Commands

```bash
# --- Landing Page ---

# 1. Push changes from local
cd "/Users/trialxfire/open claw/tsg-landing"
git add -A && git commit -m "update tsg-landing"
git push origin tsg-season-1-production

# 2. Deploy on VPS
ssh -i ~/.ssh/id_ed25519_hetzner root@5.78.227.123
cd /root/tsg-landing
git pull
npm ci
npm run build
pm2 restart tsg-landing
pm2 save

# --- Signal Engine ---

# 1. SCP engine to VPS
scp -i ~/.ssh/id_ed25519_hetzner -r \
  "/Users/trialxfire/open claw/tsg-signal-engine/" \
  root@5.78.227.123:/root/tsg-signal-engine/

# 2. Start/restart on VPS
ssh -i ~/.ssh/id_ed25519_hetzner root@5.78.227.123
cd /root/tsg-signal-engine
npm ci
pm2 start ecosystem.config.cjs   # first time
pm2 restart tsg-signal-engine     # subsequent
pm2 save

# --- Verify ---
pm2 logs tsg-landing --lines 10
pm2 logs tsg-signal-engine --lines 20
curl -s http://127.0.0.1:3020/tsg/ | head -5
```

### Resend Configuration

| Setting | Value |
|---------|-------|
| Audience | "TSG Signal List" (`b7bddc0b-11ef-4570-905d-1cc4571c1708`) |
| From address | `TSG <onboarding@resend.dev>` |
| Free tier | 100 emails/day, 3,000/month |
| Daily cap (engine) | 90 sends (10 reserved for signup welcomes) |
| Send hour | 14 UTC (10 AM ET) |
| Cadence storage | Resend contact `lastName` field ("weekly" or "monthly") |
| Upgrade path | Resend Pro ($20/mo) at 30+ subscribers for 5,000/month |

---

## 7. Environment Variables

### tsg-landing/.env

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxx                        # Resend API key
RESEND_AUDIENCE_ID=b7bddc0b-xxxx               # Resend audience ID for contact list
FROM_EMAIL=TSG <onboarding@resend.dev>          # Sender address
SITE_URL=http://5.78.227.123/tsg               # Base URL for email links/images
ADMIN_EMAIL=trae.dungy@gmail.com               # Admin notification recipient
```

### tsg-signal-engine/.env

```bash
# LLM (Kimi K2.5 via LiteLLM)
LITELLM_BASE_URL=http://127.0.0.1:9000/v1     # LiteLLM proxy endpoint
LITELLM_MODEL=llm-kimi                         # Model identifier

# Resend
RESEND_API_KEY=re_xxxxx                        # Resend API key
RESEND_AUDIENCE_ID=b7bddc0b-xxxx               # Audience for contact sync
FROM_EMAIL=TSG <onboarding@resend.dev>          # Sender address

# Site
SITE_URL=http://5.78.227.123/tsg               # Base URL for email links/images
SEND_HOUR_UTC=14                               # Hour (UTC) to send emails
MAX_DAILY_SENDS=90                             # Daily send cap

# Content Scout
ADMIN_EMAIL=trae.dungy@gmail.com               # Admin for approval emails
SCOUT_MODEL=llm-kimi                           # Model for scout recommendations
SCOUT_APPROVAL_PORT=3095                       # HTTP approval server port
OPENROUTER_API_KEY=sk-or-xxxxx                 # OpenRouter key for web search (Perplexity Sonar)
```

---

## 8. Git Repositories

### TraeDungy/TSG (standalone)

The primary standalone repository containing both codebases:
- `tsg-landing/` -- Next.js landing page
- `tsg-signal-engine/` -- Node.js PM2 signal engine

### TraeDungy/Open-Claw (branch: tsg-season-1-production)

The TSG codebases also live within the Open Claw monorepo on the `tsg-season-1-production` branch:
- `/Users/trialxfire/open claw/tsg-landing/`
- `/Users/trialxfire/open claw/tsg-signal-engine/`

---

## 9. Testing

```bash
# Generate a test email locally (signal engine)
cd tsg-signal-engine
node generate-test-issue.mjs
# Output: /tmp/tsg-ultimate.html

# Preview in browser with local image paths
cd ../tsg-landing/public && python3 -m http.server 8788 &
sed 's|http://5.78.227.123/tsg/|http://localhost:8788/|g' \
  /tmp/tsg-ultimate.html > /tmp/tsg-preview.html
open /tmp/tsg-preview.html

# Send a real test email via Resend CLI
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"TSG <onboarding@resend.dev>\",
    \"to\": [\"your@email.com\"],
    \"subject\": \"TEST -- THE SIGNAL\",
    \"html\": $(cat /tmp/tsg-ultimate.html | jq -Rs .)
  }"

# Dev server (landing page)
cd tsg-landing
npm run dev
# Opens at http://localhost:3000/tsg
```

---

## 10. Pending / Roadmap

### GIF Art Direction Engine
**Paperclip Issue:** `1a86787a`
**Status:** Not built. Documented in `TSG-SIGNAL-ENGINE-BUILD-DOC.md`.

Autonomous pipeline to generate premium animated GIFs per newsletter issue. Each style category (LEAD, DECLASSIFIED, FREQUENCY, PROFILE, STUDY, DISCLOSURE, OBJECT) gets a locked generation prompt + animation technique. Pipeline: GPT Image API -> FFmpeg animation -> Gifsicle compression -> LLM quality gate. Constraints: 200KB max, 480px wide, 10-15 fps, 2-3 second seamless loops.

### Unsubscribe Endpoint
Currently unsubscribe links point to `#unsubscribe` anchor. Needs a real `/api/unsubscribe` endpoint that calls `resend.contacts.update({ unsubscribed: true })`.

### Email Queue / Retry System
Currently emails are fire-and-forget. Needs a persistent queue with retry logic for failed sends, especially for broadcasts to larger subscriber lists.

### Weekly Admin Summary
Monday: week-ahead preview (what content goes out, subscriber count, drip status).
Friday: week-in-review (sends completed, open rates if available, new subscribers).

### Domain Purchase
Recommended: `telekinesis.support` -- aligns with brand name and available as a `.support` TLD.
Alternative: `thesignalarchive.com`

### Stripe Paywall
Tiered archive access:
- **Free:** First 3 files per category + weekly newsletter
- **Creator ($10/mo):** Full archive access + monthly digest
- **Researcher ($25/mo):** Full archive + API access + priority content scout
