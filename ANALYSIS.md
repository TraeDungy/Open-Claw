# Open Claw: Full VPS & Paperclip Setup Analysis

## Executive Summary

Open Claw is an autonomous AI operations platform for **Trial X Fire**, a content distribution company running FAST channels and OTT platforms. The system runs on a **Hetzner VPS** (5.78.44.176) and uses **Paperclip** as its agent task management layer. The `main` branch contains the full operational code; feature branches only have the legacy `install.sh` installer.

---

## 1. VPS Setup (Hetzner — 5.78.44.176)

### Infrastructure Stack

| Component | Technology | Details |
|-----------|-----------|---------|
| **VPS Provider** | Hetzner Cloud | IP: 5.78.44.176 |
| **Runtime** | Node.js | ES Modules (.mjs) |
| **Process Manager** | PM2 | `pm2-root.service` systemd-enabled for auto-restart |
| **Reverse Proxy** | nginx | `/etc/nginx/sites-enabled/unified-routing.conf` |
| **SSL** | Certbot | Let's Encrypt certificates |
| **LLM Gateway** | LiteLLM | Port 9000 (loopback), model `llm-kimi` |
| **Object Storage** | Cloudflare R2 | 3 buckets: `filmplug-content`, `filmplug-posters`, `trialxfire-content` |
| **Database** | Airtable | Content catalog (external SaaS) |
| **CI/CD** | GitHub Actions | Standard deployment pattern |
| **SSH Key** | Ed25519 | `~/.ssh/id_ed25519_hetzner` |

### Services Running on VPS

| URL Path | Service | Port |
|----------|---------|------|
| `/` (HTTP) | Film Plug Studios landing | 3006 |
| `/` (WebSocket) | OpenClaw Gateway | 19000 (loopback) |
| `/openclaw/` | Open Claw Control UI / Webchat | 19000 |
| `/dashboard/` | Open Claw Dashboard (Next.js) | 3010 |
| `/mcc/` | Master Control Center | 4001 |
| `/kanban/` | Kanban board | 3000 |

### VPS Auto-Restart Configuration

- **openclaw-gateway**: User-scoped systemd service with linger enabled (`systemctl --user`)
- **nginx**: System-level systemd enabled
- **PM2 processes**: `pm2-root.service` systemd-enabled, dump saved for persistence
- **Error Triage**: PM2 process ID 21, scans all services every 5 minutes

### LiteLLM Model Routing (Port 9000)

The VPS runs LiteLLM as a local OpenAI-compatible proxy. Free-tier model mapping:

| Alias | Routes To | Use Case |
|-------|-----------|----------|
| `gpt-4o` | kimi-k2.5 | GPT-4 level, long context |
| `gpt-4` | deepseek-v3.2 | Best OSS coder |
| `llm-kimi` | Kimi | Default CEO bot model |
| `llm-qwen35` | Qwen 3.5 | Available |
| `llm-step35` | StepFun 3.5 | Available |
| `llm-nemotron-nano` | Nemotron Nano | Available |

### Cloudflare R2 Buckets

| Bucket | Created | Purpose |
|--------|---------|---------|
| `filmplug-content` | 2025-12-30 | Video content storage |
| `filmplug-posters` | 2025-12-23 | Poster/artwork storage |
| `trialxfire-content` | 2025-12-30 | Trial X Fire media |

**Not deployed**: No Cloudflare Workers, KV Namespaces, D1 Databases, or Hyperdrive configs.

---

## 2. Paperclip Setup

**Paperclip** is the agent task management system — it's an issue tracker and agent orchestration layer, not a file attachment library. It runs locally at `http://localhost:3100` and acts as the central nervous system connecting the CEO bot, PM loops, error triage, and 20+ AI agents.

### Paperclip CLI & API

- **CLI binary**: `/root/.npm/_npx/43414d9b790239bb/node_modules/.bin/paperclipai`
- **Local API**: `http://localhost:3100`
- **Company ID**: `2f28832f-6750-4a2e-9f45-32ac3da9c458`
- **Auth Token**: `local-board`

### paperclip.mjs — The CLI Wrapper

Location: `big-boss-ceo-bot/paperclip.mjs` (5,985 bytes)

This module wraps the Paperclip CLI and HTTP API, providing:

| Function | Method | Purpose |
|----------|--------|---------|
| `listIssues()` | CLI | List issues with status/assignee/priority filters |
| `getIssue()` | CLI | Get single issue by ID |
| `createIssue()` | CLI | Create issue with title, body, assignee, priority |
| `updateIssue()` | CLI | Update status, priority, or assignee |
| `commentIssue()` | CLI | Add comment to an issue |
| `closeIssue()` | CLI | Mark issue as done |
| `reassignIssue()` | CLI | Change assignee |
| `listAgents()` | CLI | List all registered agents |
| `getDashboard()` | CLI | Get company dashboard (JSON) |
| `checkoutIssue()` | CLI | Assign agent to work on issue |
| `wakeupAgent()` | HTTP POST | Wake up idle agent (not in CLI) |

Key design decisions:
- Uses `spawnSync` with args array (not shell string) to avoid shell-escaping bugs
- Smart `-C` flag routing — only appended to commands that accept company ID
- Agent name-to-UUID resolution — LLM can return human names, module resolves to UUIDs
- HTTP fallback for operations not available in CLI (wakeup, hire)

### Registered Agent Fleet (20+ Agents)

| Role | Agent Name | UUID |
|------|-----------|------|
| **CEO** | Big Boss CEO | `010acbc6-...` |
| **Engineering** | Founding Engineer | `5938656f-...` |
| **VPS Engineering** | VPS Founding Engineer | `a1aebd73-...` |
| **VPS Operations** | VPS Ops | `adbe4d36-...` |
| **Empire PM** | Empire PM | `b2a39cff-...` |
| **Media PM** | Media PM | `0aa84859-...` |
| **SaaS PM** | SaaS PM | `4e54548f-...` |
| **Games PM** | Games PM | `f5014598-...` |
| **Revenue Ops** | Revenue Ops | `505ac295-...` |
| **Velocity PM** | Velocity PM | `2d7c772f-...` |
| **Brand** | Laced Tribe Brand Manager | `2528e917-...` |
| **Builder** | Goldie | `b1719ba8-...` |
| **Integration** | Integration Specialist | `f0cc5daf-...` |
| **Catalog** | Catalog Intelligence | `aaccba6c-...` |
| **GPU** | NVIDIA Worker | `49d5f91f-...` |
| **Device** | Nano Claw | `8d0c0062-...` |
| **OTT** | Film Plug Operator | `5c095393-...` |
| **Desktop** | Macks iMac Operator | `84c0f6e7-...` |
| **Payments** | Selene Vale | `8767955d-...` |
| **Creative** | Axiom | `fe6752f9-...` |
| **Creative** | Morrow | `e0367d9d-...` |

### Gateway Agent Device Keys

Agents using the `openclaw_gateway` adapter require Ed25519 public keys registered on the VPS at `/root/.openclaw/paperclip-devices/{agentId}.pem`. The `scripts/sync-gateway-device-keys.mjs` script automates this:

1. Reads all Paperclip agents from `http://localhost:3100`
2. Extracts Ed25519 public key from each agent's `devicePrivateKeyPem`
3. SCPs missing keys to VPS
4. Restarts gateway only when new keys are added

Currently registered gateway agents: goldie, integration-specialist, selene-vale, velocity-pm, saas-builder-3

---

## 3. Big Boss CEO Bot — Architecture

### Entry Point: `bot.mjs`

A Telegram bot (`node-telegram-bot-api`) that serves as the human interface. Dependencies are minimal: just `node-telegram-bot-api` and `node-cron`.

**Telegram Commands:**

| Command | Action |
|---------|--------|
| `/status` | Company scoreboard (dashboard + agent fleet) |
| `/priorities` | Critical/blocked issues needing attention |
| `/issues` | Open in-progress and critical todo issues |
| `/blocked` | All blocked issues |
| `/agents` | Fleet status by state (running/idle/error) |
| `/wakeup [agent]` | Manually wake up an agent |
| `/digest` | Generate CEO briefing on demand |
| `/cycle` | Trigger CEO decision cycle manually |
| `/push [message]` | Inject owner directive as critical issue |
| `/assign [id] [agent]` | Reassign issue to agent |
| `/done [id]` | Mark issue complete |
| Free text | Routed to LLM with company context for CEO-style response |

### Autonomous Loops

The bot starts 4 autonomous systems on boot:

#### CEO Loop (`ceo-loop.mjs`) — Every 15 minutes
- Reviews all Paperclip projects autonomously
- Up to **6 actions per cycle**: CREATE_ISSUE, COMMENT, WAKEUP_AGENT, CLOSE_ISSUE, REASSIGN, ESCALATE
- Full authority — no human approval needed except ESCALATE
- Uses LLM to analyze dashboard state and decide actions
- Output is structured (ACTION:TYPE JSON) parsed into executable actions

#### PM Loops (`pm-loop.mjs`) — 4 independent loops
Each PM manages its own domain with up to 4 actions per cycle:

| PM | Domain | Interval | Team |
|----|--------|----------|------|
| Empire PM | FAST channels, OTT, Tubi/Pluto/Plex | 30 min | Film Plug Operator, Nano Claw, Catalog Intelligence |
| Media PM | Video encoding, R2, Vimeo, Airtable | 30 min | Goldie, NVIDIA Worker, Catalog Intelligence, Nano Claw |
| Revenue Ops | Billing, payments, analytics, x402 | 45 min | Selene Vale, Integration Specialist |
| SaaS PM | Web apps, dashboards, APIs | 45 min | Integration Specialist, Goldie, VPS Ops |

PM loops are staggered (3min, 7min, 11min, 15min delay) to avoid thundering herd.

#### Notifier (`notifier.mjs`) — Every 2 minutes
Polls Paperclip and pushes alerts for:
1. New issues assigned to CEO
2. Issues completed
3. New agent-creation proposals
4. Agents in error state
5. Blocked issues with no owner (stale blockers)
6. Unassigned critical backlog (threshold: 3+, rate-limited to once/hour)
7. Startup priorities push (runs once on boot)

#### Daily Digest (`digest.mjs`) — 9am ET (cron)
LLM-generated briefing covering 5 initiatives: revenue targets, platform launches, content pipeline, social media rollout, priority issues.

### LLM Layer (`llm.mjs`)

- Routes through LiteLLM at `http://127.0.0.1:9000/v1`
- Default model: `llm-kimi`
- Temperature: 0.3 (deterministic/decisive)
- OpenAI-compatible API

### State Management (`state.mjs`)

File-based dedup at `big-boss-ceo-bot/state.json`:
- Tracks seen issues by ID + event type (assigned, done, proposal, error, stale_blocked)
- Prevents duplicate notifications
- Persists across restarts

---

## 4. Gear Switch System (`scripts/gear-switch.mjs`)

A model tier management tool for switching all agents between cost tiers:

| Gear | Adapter | Models | Cost |
|------|---------|--------|------|
| **Premium** | claude_local | sonnet-4-6 (CEO/eng), haiku (PM) | Claude Code auth |
| **Economy** | claude_local | haiku for all roles | Lower budget burn |
| **Free** | openclaw_gateway | NVIDIA free tier via VPS LiteLLM | $0 |

Commands:
- `--mode premium` / `--mode free` / `--mode economy`
- `--status` — show current gear and agent spend
- `--reset-spend` — zero out monthly spend counters
- `--resume-errors` — resume all error/paused agents

---

## 5. Error Triage System (Separate from this repo)

Located at `/root/error-triage/` on VPS (PM2 ID 21). Three-layer architecture:

1. **Layer 1 — Error Triage**: Scans PM2 logs every 5min, routes known errors to mapped agents via Paperclip
2. **Layer 2 — CEO Layer**: LLM-powered routing for unknown errors (assign, create agent, needs_human, ignore)
3. **Layer 3 — Telegram**: Owner escalation (max 3 messages per 5min cycle)

---

## 6. Content Pipeline

```
Vimeo (source) → Airtable (catalog) → R2 (HLS storage) → Film Plug CMS → FAST channels → Apps
```

Distribution targets: Tubi, Pluto TV, Xumo, Plex, Future Today, Roku, Fire TV, Apple TV

---

## 7. Key Findings & Observations

### Strengths
1. **Fully autonomous operation** — CEO bot + 4 PM loops + notifier + error triage run 24/7 without human intervention
2. **Smart cost management** — Gear switch system lets you toggle entire fleet between premium/economy/free tiers
3. **Hierarchical delegation** — CEO delegates to PMs, PMs delegate to builders, with escalation paths back up
4. **Resilient deployment** — PM2 + systemd + auto-restart ensures services survive reboots

### Security Concerns
1. **Exposed secrets in `ecosystem.config.cjs`** — Telegram bot token, LiteLLM API key, and company IDs are committed to the repo in plaintext. These should be in `.env` files excluded from git.
2. **Gateway token in `CLAUDE.md`** — The OpenClaw gateway token is committed to documentation.
3. **SSH key path hardcoded** — `~/.ssh/id_ed25519_hetzner` referenced in scripts.

### Architecture Gaps
1. **No health checks** — No HTTP health endpoints for monitoring service liveness
2. **No metrics/observability** — No Prometheus, Grafana, or structured logging
3. **File-based state** — `state.json` could corrupt on crash; consider SQLite or D1
4. **No rate limiting on LLM calls** — CEO loop + 4 PM loops + notifier + free-text chat all hit LiteLLM without backpressure
5. **No tests** — Zero test coverage across all modules

### Branch Divergence
The `main` branch on GitHub has the full operational code. The local branch (`claude/analyze-vps-setup-361b0`) and `claude/fix-openclaw-ssl-error-D2130` only have the legacy `install.sh` — they diverged before the big-boss-ceo-bot code was added.
