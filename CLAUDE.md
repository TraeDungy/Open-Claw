# Open Claw — Claude Code Project Instructions

**Project:** Open Claw AI Assistant Platform
**Owner:** Trial X Fire (@The_Operatorbot)
**VPS:** http://5.78.44.176

---

## Project Context

Open Claw is the AI infrastructure hub for Trial X Fire — a content distribution company operating FAST channels, OTT platforms, and video delivery pipelines. The system includes:

- Telegram bot (@The_Operatorbot) as primary interface
- Hetzner VPS running Node.js services
- Cloudflare R2 for video storage
- Airtable as the content catalog source of truth
- Vimeo for video hosting and OTT
- Film Plug CMS for OTT management
- Distribution to Tubi, Pluto TV, Xumo, Plex, Future Today, Roku, Fire TV, Apple TV

## Skill System

All capabilities are organized as skills. See [OPENCLAW-SKILLS-REFERENCE.md](./OPENCLAW-SKILLS-REFERENCE.md) for the full 195+ skill catalog.

### Mandatory Skill Usage

Before ANY task, check the skill Quick Reference Map in `using-superpowers/SKILL.md`. If a skill matches, use it. This is non-negotiable.

**Quick domain → skill mapping:**

| Domain | Primary Skill |
|---|---|
| Video encoding/transcoding | `video-encoding-pipeline` |
| Content distribution (FAST) | `trialxfire-content-distribution` |
| Aspera file delivery | `aspera-file-delivery-workflows` |
| Catalog management | `trialxfire-catalog-manager` |
| Vimeo ↔ Airtable sync | `trialxfire-vimeo-airtable-sync` |
| R2 migration | `trialxfire-r2-migration` |
| Tubi metadata | `tubi-metadata` |
| Film Plug OTT | `film-plug-ott-management` |
| Roku development | `roku-brightscript-development` |
| Directory / listing / catalog website | `directory-website-builder` |
| Web design planning | `web-design-orchestrator` |
| Any bug/error | `systematic-debugging` |
| Shell commands, rm, chmod, kill, systemctl | `exec-shell-commands` |
| New feature | `brainstorming` → implement |

---

## Design Skill System

The Open Claw design system uses a layered skill architecture. Always orchestrate design using the correct recipe.

### Design Skill Stack (in invocation order)

```
1. web-design-orchestrator     → select style, define constraints
2. motion-as-brand-identity    → define spring tokens, establish timing language
3. Component layer             → shadcn-tailwind-builder / neobrutalism-design / glassmorphism-design
4. Interaction layer           → micro-interactions-animations / css-scroll-driven-animations
5. Temporal layer (optional)   → web-design-archaeology + speculative-ui-futures
6. Adaptive layer (optional)   → ai-adaptive-ui
7. Reward layer (optional)     → dopamine-design
```

### Temporal Design Skills (NEW — Feb 2026)

**`web-design-archaeology`** — Recovers what past design movements got RIGHT:
- Skeuomorphic depth (neumorphism, tactile buttons)
- Flash-era cursor-tracked interactivity
- CRT/Terminal phosphor clarity and scanlines
- Desktop window chrome (draggable panels)
- CD-ROM spatial navigation (View Transitions)
- Swiss International Style grid discipline
- Teletext constraint-as-aesthetic

**`speculative-ui-futures`** — Near-future patterns buildable today:
- Spatial depth-layer UI (CSS perspective + pointer parallax)
- AI-native/ambient UI (expanding inputs, thinking pulse, ghost chrome)
- Biological/organic morphing (@property gradient animation, mycelial networks)
- Crystalline/mineral data (geological strata, prismatic facets, clip-path)
- Solarpunk (asymmetric organic shapes, warm earthy palette)
- Liquid physics (clip-path pour animations, ripple canvas)

**Temporal Synthesis Recipes:**

| Recipe | Past Element | Future Element |
|---|---|---|
| Ghost in the Terminal | Swiss grid + CRT/phosphor | AI-native ambient input |
| Dead Drop Interface | Window chrome (draggable panels) | Biological breathing |
| Garden Terminal | Solarpunk colors | AI-native + organic morphing |
| Crystal Mind | Crystalline data | AI thinking states |
| Living Archive | Spatial depth + Flash hover-reveal | Crystalline strata |
| Retro Spatial | CD-ROM navigation | Spatial depth panels + Swiss grid |

---

## Infrastructure

### Key Services

- **VPS:** Hetzner (5.78.44.176) — Node.js, PM2
- **Storage:** Cloudflare R2 (`trial-x-fire-media` bucket)
- **CDN:** Cloudflare
- **Database:** Airtable (content catalog)
- **Video:** Vimeo (hosting + OTT), Cloudflare Stream (transcoding)

### Deployment Pattern

All deployments use `hetzner-cloud-deployment` skill. Standard stack:
- Node.js + PM2
- Nginx reverse proxy
- Certbot SSL
- GitHub Actions CI/CD

### Environment Variables

Never commit secrets. Environment variables are stored on the VPS in `.env` files and managed via PM2 ecosystem config.

---

## Content Pipeline

The Trial X Fire content pipeline flows:

```
Vimeo (source)
  → Airtable (catalog/metadata)
  → R2 (HLS transcoded storage)
  → Film Plug CMS (OTT management)
  → FAST channels (Tubi, Pluto, Xumo, Plex)
  → Platform apps (Roku, Fire TV, Apple TV, iOS, Android)
```

Skills per stage:
1. `trialxfire-vimeo-airtable-sync` — sync Vimeo metadata to Airtable
2. `trialxfire-r2-migration` — transcode + upload to R2
3. `trialxfire-catalog-manager` — unified catalog operations
4. `tubi-metadata` — generate platform-specific metadata
5. `trialxfire-content-distribution` — deliver to FAST channels
6. `aspera-file-delivery-workflows` — high-speed file transfer

---

## Conventions

### Code Style
- Node.js / JavaScript primary language
- ES Modules (import/export)
- Async/await (no raw Promise chains)
- No TypeScript unless existing file uses it

### File Organization
Follow existing patterns. Explore before adding files.

### Commits
Only commit when explicitly asked. Use conventional commit format.

### Skill Usage
Always use the Skill tool (not just reading the skill file). Announce the skill before using it.

---

## Dashboard & Web Access

### Open Claw Control UI (Webchat)

- **URL:** <http://5.78.44.176/openclaw/>
- **WebSocket:** `ws://5.78.44.176/` (auto-detected — nginx routes WS upgrades at root to gateway)
- **Gateway Token:** `77363b109ac5502e236ae3b426defabed281f0e313937e7b1cb2887d2cc3eff3`
- **Gateway port (internal):** 19000 (loopback only, proxied via nginx)
- Auto-opens on Mac login via LaunchAgent: `~/Library/LaunchAgents/com.openclaw.dashboard.plist`

### Other Dashboard URLs

| URL | Service |
| --- | --- |
| <http://5.78.44.176/> | Film Plug Studios landing |
| <http://5.78.44.176/openclaw/> | Open Claw Control UI / Webchat |
| <http://5.78.44.176/dashboard/> | Open Claw Dashboard (Next.js, port 3010) |
| <http://5.78.44.176/mcc/> | Master Control Center (port 4001) |
| <http://5.78.44.176/kanban/> | Kanban (port 3000) |

### nginx Routing Fix (Mar 2026)

Root `/` WebSocket upgrades route to openclaw gateway (port 19000).
HTTP requests at `/` still serve Film Plug Studios (port 3006).
Config: `/etc/nginx/sites-enabled/unified-routing.conf`

### VPS Auto-Restart

All services restart automatically on VPS reboot:

- `openclaw-gateway` — **user** systemd service (`systemctl --user status openclaw-gateway`), linger enabled
- `nginx` — systemd enabled
- PM2 processes — `pm2-root.service` systemd enabled, dump saved

**Gateway management commands:**

```bash
systemctl --user status openclaw-gateway    # check status
systemctl --user restart openclaw-gateway   # restart
openclaw gateway start                      # re-register + start if missing
openclaw gateway run                        # foreground (debug only)
```

Never send SIGHUP to the gateway process — it kills it.

---

## Paperclip Agent Management

### openclaw_gateway Agents — Device Key Requirement

Any Paperclip agent using the `openclaw_gateway` adapter (routing to `ws://5.78.44.176/`) requires its Ed25519 public key registered on the VPS at `/root/.openclaw/paperclip-devices/{agentId}.pem`. Missing keys cause:

```text
agent "X" does not match session key agent "main"
```

**Currently registered:** goldie, integration-specialist, selene-vale, velocity-pm, saas-builder-3

### Adding a New Gateway Agent

1. Create the agent in Paperclip with adapter config (`url`, `authToken`, `sessionKey`, `devicePrivateKeyPem`)
2. Run the sync script:

```bash
node "scripts/sync-gateway-device-keys.mjs"
```

That's it. The script auto-detects all gateway agents, registers any missing keys, and restarts the gateway only if needed.

### Sync Script

`scripts/sync-gateway-device-keys.mjs` — run whenever a new gateway agent is added.

- Reads all Paperclip agents from `http://localhost:3100` (Paperclip must be running)
- Extracts Ed25519 public key from each agent's `devicePrivateKeyPem`
- SCPs missing keys to VPS `/root/.openclaw/paperclip-devices/`
- Restarts gateway via `openclaw gateway start` only when new keys were added
- Skips already-registered agents (idempotent — safe to run anytime)

Requires Paperclip running locally and `/usr/local/bin/openssl` (Homebrew) for Ed25519 support.

---

## Error Triage & CEO Layer

Automated error monitoring system running on PM2 (`error-triage`, ID 21). Scans all services every 5 minutes.

### Files

- `/root/error-triage/error-triage.mjs` — main triage engine
- `/root/error-triage/ceo-layer.mjs` — CEO analysis layer (LLM)
- `/root/error-triage/runner.mjs` — 5-min loop runner
- `/root/.openclaw/error-triage-state.json` — deduplication state

### Three-Layer Architecture

```text
PM2 Logs (all services, every 5min)
       ↓
Layer 1 — Error Triage
  Known service   → Paperclip issue assigned to mapped agent
  Critical pattern → Telegram immediately (payment fail, OOM, disk full, SSL expiry)
  Persists 15min after assignment → Telegram re-escalation
       ↓ (no known assignee after 5 occurrences)
Layer 2 — CEO Layer (llm-fast via LiteLLM)
  assign_existing  → routes to best-fit agent + creates Paperclip issue
  create_new_agent → drafts spec + creates issue for BIG BOSS CEO + Telegram proposal
  needs_human      → Telegram with CEO reasoning
  ignore           → silently dropped
       ↓
Layer 3 — You (Telegram @The_Operatorbot)
  Max 3 messages per 5min cycle (overflow → Paperclip only)
  For new agent proposals: reply YES [agent-id] to approve
```

### Agent Routing Map (real Paperclip UUIDs)

| Service keyword | Agent | UUID |
| --- | --- | --- |
| command-attention, stripe, supabase | Selene Vale | `8767955d-...` |
| paperclip, openclaw-gateway, agent-worker | Integration Specialist | `f0cc5daf-...` |
| litellm, film-plug, openclaw-dashboard, fleet-monitor | Velocity PM | `2d7c772f-...` |
| agency-brain, script-speech, polymarket | Founding Engineer | `5938656f-...` |
| no assignee found | CEO Layer → BIG BOSS CEO | `010acbc6-...` |

### Thresholds

- `PERSIST_THRESHOLD = 5` — occurrences before creating Paperclip issue
- `ESCALATE_AFTER_MS = 15min` — re-escalate to Telegram if still failing after issue created
- Telegram cap: 3 messages per run (overflow logged to Paperclip only)

### Management

```bash
pm2 logs error-triage --lines 30     # view recent activity
pm2 restart error-triage             # restart after config changes
cat /root/.openclaw/error-triage-state.json | python3 -m json.tool | head -40
```

### Adding a New Service to the Map

Edit `/root/error-triage/error-triage.mjs`, add entry to `AGENT_MAP`:

```js
'service-name': 'paperclip-agent-uuid',  // Agent Name
```

Then `pm2 restart error-triage`.

---

## Troubleshooting

If Open Claw is down or erroring:
1. Use `openclaw-troubleshooting` skill
2. SSH to VPS, check PM2 logs: `pm2 logs`
3. Check Nginx: `nginx -t && systemctl status nginx`

For cost/health monitoring:
- Use `openclaw-maintenance` skill

---

## Reference

- **Full skill catalog:** [OPENCLAW-SKILLS-REFERENCE.md](./OPENCLAW-SKILLS-REFERENCE.md)
- **Skill files:** `/Users/trialxfire/.claude/skills/`
- **Telegram:** @The_Operatorbot
- **Dashboard:** http://5.78.44.176/openclaw/
