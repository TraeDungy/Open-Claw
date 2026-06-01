/**
 * Auto-Assignment Loop — Symphony Edition
 * Polls for new unassigned issues and routes them to the correct agent
 * based on keyword matching against title/description.
 *
 * Upgraded with Symphony-inspired patterns:
 *   - 5-state claim model (Unclaimed → Claimed → Running → RetryQueued → Released)
 *   - Per-issue workspace isolation
 *   - Stall detection + reconciliation
 *   - Exponential retry backoff
 *   - WORKFLOW.md-driven config (dynamic reload)
 *
 * Runs every 60s. Uses orchestrator.mjs for state management.
 * Falls back to BIG BOSS CEO for issues that don't match any routing rule.
 *
 * Usage: import { startAssignmentLoop } from './assignment-loop.mjs';
 *        startAssignmentLoop(sendFn);
 */
import { readFileSync, existsSync } from 'fs';
import { atomicWriteJSON } from './atomic-write.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { queryKnowledge } from './lightrag.mjs';
import {
  claimIssue, isManaged, isEligible, getSnapshot, getConcurrency,
  reconcileWithTracker, detectStalls, processDueRetries, failAndRetry,
  releaseIssue, pruneHistory,
} from './orchestrator.mjs';
import { ensureWorkspace } from './workspace-manager.mjs';
import { AGENTS, AGENT_NAMES } from './agents.mjs';
import { getConfig } from './workflow-loader.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const SEEN_FILE = join(__dir, 'assignment-state.json');

const PAPERCLIP_URL = process.env.PAPERCLIP_URL || 'http://localhost:3100';
const COMPANY_ID = process.env.COMPANY_ID || '2f28832f-6750-4a2e-9f45-32ac3da9c458';
const INTERVAL_MS = parseInt(process.env.ASSIGNMENT_INTERVAL_MS || '60000', 10);

// Simple seen-state tracker (independent from bot's state.mjs)
const SEEN_PRUNE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

let _seen = null;
function loadSeen() {
  if (_seen) return _seen;
  try { _seen = JSON.parse(readFileSync(SEEN_FILE, 'utf8')); } catch { _seen = {}; }
  return _seen;
}
function hasSeen(id) { return !!loadSeen()[id]; }
function markSeen(id) { const s = loadSeen(); s[id] = Date.now(); atomicWriteJSON(SEEN_FILE, s); }
function pruneSeen() {
  const s = loadSeen();
  const cutoff = Date.now() - SEEN_PRUNE_MAX_AGE_MS;
  for (const [id, ts] of Object.entries(s)) {
    if (ts < cutoff) delete s[id];
  }
  atomicWriteJSON(SEEN_FILE, s);
}

// Routing rules — first match wins. Order matters (specific before general).
// Each rule: [regex pattern on title+description, agent UUID]
const ROUTING_RULES = [
  // Content Pipeline & Storage
  [/r2|cloudflare|content vault|cdn|bucket|storage migrat/i,     AGENTS['Founding Engineer']],
  [/vimeo.*sync|airtable.*sync|catalog.*sync/i,                  AGENTS['Catalog Intelligence']],
  [/vimeo|airtable|catalog|metadata.*feed|mrss/i,                AGENTS['Catalog Intelligence']],
  [/film plug|ott.*platform|roku.*channel|fire tv|apple tv/i,    AGENTS['Film Plug Operator']],
  [/fast channel|tubi|pluto|xumo|plex.*feed/i,                   AGENTS['Empire PM']],
  [/aspera|file delivery|file transfer|high.speed/i,             AGENTS['Founding Engineer']],

  // SaaS & Payments
  [/stripe|checkout|payment|billing|subscription|gumroad/i,      AGENTS['Velocity PM']],
  [/shopify|app store listing|oauth.*app/i,                      AGENTS['SaaS Builder']],
  [/script.speech/i,                                             AGENTS['SaaS Builder']],
  [/customer.service.agent/i,                                    AGENTS['SaaS Builder']],
  [/supabase|postgres.*migrat/i,                                 AGENTS['Founding Engineer']],
  [/auth.*microservice|rbac|role.based|production auth/i,        AGENTS['Founding Engineer']],

  // Trading & Polymarket
  [/polymarket|trading|portfolio.*risk|pnl|backtesting/i,        AGENTS['Poly Strategy']],
  [/stop.loss|take.profit|position.*siz/i,                       AGENTS['Poly Strategy']],

  // Games
  [/unity|unreal|godot|game.*room|multiplayer.*game/i,           AGENTS['Game Dev']],
  [/sprite|collision|tilemap|level.*load|particle.*effect/i,     AGENTS['Game Dev']],
  [/leaderboard|achievement|tournament|campaign mode/i,          AGENTS['Game Dev']],
  [/3d.*city|3d.*character|outlaw empire|port city/i,            AGENTS['Game Dev']],
  [/deeper|game.*dev|pixel.*game|brightscript/i,                 AGENTS['Game Dev']],
  [/sound effect|game.*audio/i,                                  AGENTS['Game Dev']],

  // Infrastructure & DevOps
  [/ci.cd|github actions|deploy.*vps|pm2|nginx|certbot|ssl/i,    AGENTS['VPS Ops']],
  [/docker|pwa|grafana|webhook|rate limit|ddos/i,                AGENTS['VPS Ops']],
  [/websocket.*endpoint|websocket.*progress/i,                   AGENTS['VPS Ops']],
  [/incident.*log|audit.*log|activity.*track/i,                  AGENTS['VPS Ops']],
  [/guardian|litellm|deepseek.*upgrade/i,                        AGENTS['VPS Ops']],

  // Agent & Integration
  [/mcp.*tool|agent.*workflow|agent.*orchestrat/i,               AGENTS['Integration Specialist']],
  [/developer.*doc|api.*reference|getting.*started/i,            AGENTS['Integration Specialist']],

  // Content & Marketing
  [/selene|tiktok|instagram|social media|content calendar/i,     AGENTS['Selene Vale']],
  [/ugc|seo|schema\.org|sitemap|google analytics/i,              AGENTS['Selene Vale']],
  [/email.*capture|mailchimp|convertkit|waitlist|drip/i,         AGENTS['Selene Vale']],
  [/book.*cover|cinema samurai|pilot episode|audiobook/i,        AGENTS['Selene Vale']],

  // Revenue & Royalties
  [/royalt|collaborator.*payout|revenue.*dashboard/i,            AGENTS['Revenue Ops']],
  [/x402|monetiz/i,                                              AGENTS['Revenue Ops']],

  // Video & AI
  [/comfyui|ffmpeg|davinci|upscal|runpod|transcode/i,           AGENTS['Founding Engineer']],
  [/elevenlabs|voice clon|ai.*caption|ai.*key moment/i,         AGENTS['Founding Engineer']],
  [/video.*generat|video.*encod|hls.*transcode/i,               AGENTS['Media PM']],

  // E-commerce
  [/shopify.*product|printful|merch|dropship/i,                  AGENTS['SaaS Builder']],
  [/storefront|abandoned cart|post.purchase/i,                   AGENTS['SaaS Builder']],

  // Forms & Tools
  [/form.*submission|csv.*export|embed.*widget/i,                AGENTS['SaaS Builder']],
  [/batch.*process|job.*storage|npm.*module/i,                   AGENTS['Founding Engineer']],
  [/test.*suite|test.*coverage|integration test/i,               AGENTS['Founding Engineer']],
];

function matchAgent(title, description) {
  const text = `${title || ''} ${description || ''}`;
  for (const [pattern, agentId] of ROUTING_RULES) {
    if (pattern.test(text)) return agentId;
  }
  return null;
}

/**
 * Semantic fallback: query LightRAG for agent expertise when regex misses.
 * Returns agent UUID or null (caller falls back to CEO).
 */
async function semanticMatchAgent(title, description) {
  try {
    const result = await queryKnowledge(
      `Which agent has experience handling issues like: ${title}. ${(description || '').slice(0, 200)}`,
      { mode: 'local', topK: 5 }
    );
    if (!result || result.includes('[no-context]')) return null;

    // Check if any known agent name appears in the response
    const lower = result.toLowerCase();
    for (const [uuid, name] of Object.entries(AGENT_NAMES)) {
      const readable = name.toLowerCase().replace(/_/g, ' ');
      if (lower.includes(readable)) return uuid;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function patchIssue(issueId, body) {
  const res = await fetch(`${PAPERCLIP_URL}/api/issues/${issueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function runAssignmentCycle() {
  try {
    const issues = await fetchJSON(
      `${PAPERCLIP_URL}/api/companies/${COMPANY_ID}/issues`
    );

    // ── Phase 1: Reconciliation (Symphony pattern) ────────────────
    const activeStates = getConfig('tracker.active_states', ['todo', 'backlog', 'in_progress', 'in_review']);
    const activeIssueIds = issues
      .filter(i => activeStates.includes(i.status))
      .map(i => i.id);
    const reconciled = reconcileWithTracker(activeIssueIds);
    if (reconciled > 0) {
      console.log(`[assignment] reconciled ${reconciled} stale claims`);
    }

    // ── Phase 2: Stall Detection ──────────────────────────────────
    const stalled = detectStalls();
    for (const issueId of stalled) {
      failAndRetry(issueId, 'Stalled — no activity past timeout');
      console.log(`[assignment] stall detected: ${issueId}`);
    }

    // ── Phase 3: Process Due Retries ──────────────────────────────
    const dueRetries = processDueRetries();
    for (const entry of dueRetries) {
      // Re-check if issue is still active before retrying
      const issue = issues.find(i => i.id === entry.issueId);
      if (!issue || !activeStates.includes(issue.status)) {
        releaseIssue(entry.issueId);
        console.log(`[assignment] retry skipped for ${entry.issueId} — no longer active`);
        continue;
      }
      // Re-claim for dispatch (will be picked up by executor)
      if (claimIssue(issue, entry.agentId)) {
        console.log(`[assignment] retry #${entry.attempt} dispatched: ${entry.identifier}`);
      }
    }

    // ── Phase 4: New Assignment (existing logic + orchestrator) ───
    const openStatuses = new Set(activeStates);
    const unassigned = issues.filter(
      (i) => openStatuses.has(i.status) && !i.assigneeAgentId && !hasSeen(i.id) && !isManaged(i.id)
    );

    if (unassigned.length === 0) {
      pruneHistory(); // Periodic cleanup
      return;
    }

    // Sort by priority (Symphony pattern: priority → creation time)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    unassigned.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 2;
      const pb = priorityOrder[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      return (a.createdAt || '') < (b.createdAt || '') ? -1 : 1;
    });

    let assigned = 0;
    let fallback = 0;
    const { available } = getConcurrency();

    for (const issue of unassigned) {
      // Check eligibility (concurrency, state, etc.)
      if (!isEligible(issue, activeStates)) continue;

      let agentId = matchAgent(issue.title, issue.description);

      // Semantic fallback via LightRAG knowledge graph
      if (!agentId) {
        agentId = await semanticMatchAgent(issue.title, issue.description);
        if (agentId) {
          console.log(`[assignment] semantic match: "${issue.title?.slice(0, 50)}" → ${AGENT_NAMES[agentId] || agentId}`);
        }
      }

      if (!agentId) {
        agentId = AGENTS['Big Boss CEO'];
        fallback++;
      }

      // Claim in orchestrator BEFORE patching Paperclip (prevents races)
      if (!claimIssue(issue, agentId)) continue;

      // Create workspace for the issue
      try {
        const ws = ensureWorkspace(issue);
        if (ws.created) {
          console.log(`[assignment] workspace: ${ws.path} (${ws.mode})`);
        }
      } catch (err) {
        console.error(`[assignment] workspace failed for ${issue.identifier}: ${err.message}`);
        // Non-fatal — assignment continues without workspace
      }

      await patchIssue(issue.id, { assigneeAgentId: agentId });
      markSeen(issue.id);
      assigned++;
    }

    if (assigned > 0) {
      const snap = getConcurrency();
      console.log(`[assignment] assigned ${assigned} (${fallback} CEO) | running:${snap.running}/${snap.max} claimed:${snap.claimed} retry:${snap.retrying}`);
    }

    pruneHistory();
    pruneSeen();
  } catch (err) {
    console.error('[assignment] error:', err.message);
  }
}

export function startAssignmentLoop() {
  console.log(`[assignment] starting Symphony-enhanced assignment loop (interval: ${INTERVAL_MS / 1000}s, Paperclip: ${PAPERCLIP_URL})`);
  console.log(`[assignment] state machine: Unclaimed → Claimed → Running → RetryQueued → Released`);
  console.log(`[assignment] workspace isolation: ${getConfig('workspace.isolation', 'directory')} (root: ${getConfig('workspace.root', '/tmp/openclaw-workspaces')})`);

  // Run once immediately after a short delay
  setTimeout(() => runAssignmentCycle(), 5000);

  // Then run on interval
  setInterval(() => runAssignmentCycle(), INTERVAL_MS);
}

/**
 * Export orchestrator snapshot for external consumers (CEO loop, notifier, etc.)
 */
export { getSnapshot, getConcurrency } from './orchestrator.mjs';
export { getConfig } from './workflow-loader.mjs';

// Standalone mode — run directly with: node assignment-loop.mjs
if (process.argv[1] && process.argv[1].endsWith('assignment-loop.mjs')) {
  startAssignmentLoop();
}
