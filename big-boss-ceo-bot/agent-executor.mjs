#!/usr/bin/env node
/**
 * Agent Executor Daemon
 *
 * The missing piece: polls Paperclip for assigned issues, checks them out,
 * executes work via LiteLLM or claw binary, posts results back, marks done.
 *
 * Architecture:
 *   Paperclip (issues) → Executor (this) → LiteLLM / Claw → Paperclip (results)
 *
 * Runs as PM2 process on VPS. Processes one issue at a time.
 *
 * Usage: node agent-executor.mjs [--once] [--dry-run] [--issue <id>]
 */

import './env.mjs';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync, spawn } from 'child_process';
import {
  startRunning, recordActivity, completeIssue, failAndRetry,
  isManaged, getSnapshot,
} from './orchestrator.mjs';
import { ensureWorkspace, removeWorkspace } from './workspace-manager.mjs';
import { getConfig } from './workflow-loader.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────
const PAPERCLIP_URL   = process.env.PAPERCLIP_URL || 'http://localhost:3100';
const COMPANY_ID      = process.env.COMPANY_ID || '2f28832f-6750-4a2e-9f45-32ac3da9c458';
const LITELLM_URL     = process.env.LITELLM_BASE_URL || 'http://127.0.0.1:9000/v1';
const LITELLM_KEY     = process.env.LITELLM_API_KEY;
if (!LITELLM_KEY) { console.error('[executor] LITELLM_API_KEY env var required'); process.exit(1); }
const LITELLM_MODEL   = process.env.EXECUTOR_MODEL || 'llm-fast';
const CLAW_RUNNER_URL = process.env.CLAW_RUNNER_URL || 'http://127.0.0.1:7080';
const POLL_INTERVAL   = parseInt(process.env.EXECUTOR_POLL_MS || '300000', 10); // 5min default (was 60s)
const MAX_TOKENS      = parseInt(process.env.EXECUTOR_MAX_TOKENS || '4096', 10);
const TIMEOUT_MS      = parseInt(process.env.EXECUTOR_TIMEOUT_MS || '120000', 10);
const MAX_CONCURRENT  = 1; // Start simple — one at a time
const LOG_FILE        = '/tmp/agent-executor.log';
const STATE_FILE      = join(__dir, 'executor-state.json');

const RUN_ONCE  = process.argv.includes('--once');
const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE_ID  = process.argv.find((a, i) => process.argv[i - 1] === '--issue');

// Adapters that can actually execute on VPS
const EXECUTABLE_ADAPTERS = new Set([
  'opencode_local',    // 29 agents — uses LiteLLM
  'claude_local',      // 83 agents — use claw binary or LiteLLM
  'codex_local',       // 2 agents
  'process',           // 5 agents
  'openclaw_gateway',  // 9 agents (Goldie, Selene, etc.) — idle, execute via LiteLLM
  'gemini_local',      // 1 agent (Catalog Intelligence) — execute via LiteLLM
]);

// Priorities in execution order
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ── State ───────────────────────────────────────────────────────────────────
let _state = null;
function loadState() {
  if (_state) return _state;
  try { _state = JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { _state = { executing: null, completed: [], failed: [], stats: { total: 0, success: 0, failed: 0 } }; }
  return _state;
}
function saveState() { writeFileSync(STATE_FILE, JSON.stringify(_state, null, 2)); }

// ── Logging ─────────────────────────────────────────────────────────────────
function log(level, tag, msg) {
  const line = `[${new Date().toISOString()}] ${level} [${tag}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ── HTTP Helpers ────────────────────────────────────────────────────────────
async function fetchJSON(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeout || 15000);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...opts.headers },
    });
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text }; }
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message };
  } finally { clearTimeout(timer); }
}

// ── Paperclip API ───────────────────────────────────────────────────────────
async function getIssues() {
  const r = await fetchJSON(`${PAPERCLIP_URL}/api/companies/${COMPANY_ID}/issues`);
  return r.ok ? r.data : [];
}

async function getAgents() {
  const r = await fetchJSON(`${PAPERCLIP_URL}/api/companies/${COMPANY_ID}/agents`);
  return r.ok ? r.data : [];
}

async function checkoutIssue(issueId, agentId) {
  return fetchJSON(`${PAPERCLIP_URL}/api/issues/${issueId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ agentId, expectedStatuses: ['todo', 'backlog'] }),
  });
}

async function updateIssue(issueId, updates) {
  return fetchJSON(`${PAPERCLIP_URL}/api/issues/${issueId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

async function commentIssue(issueId, body) {
  return fetchJSON(`${PAPERCLIP_URL}/api/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

// ── Task Classification (tiered model routing) ─────────────────────────────

/**
 * Classify task complexity to route to the right free model tier:
 *   'fast'    → llm-glm47 (GLM-4.7, 98.8% tool calling, fast)
 *   'agent'   → llm-glm5 (GLM-5 744B, 77.8% SWE-bench, best free agent)
 *   'coder'   → llm-deepseek (DeepSeek V3.2, 70.2% SWE-bench, thinking mode)
 *   'reason'  → llm-qwen35 (Qwen 3.5 397B, 80% SWE-bench, heavy reasoning)
 *   'plan'    → llm-kimi (Kimi K2.5, CEO/strategy/planning)
 */
function classifyTask(issue) {
  const text = `${issue.title || ''} ${issue.description || ''}`.toLowerCase();
  const len = text.length;

  // Simple ops → GLM-4.7 (fast + 98.8% tool calling)
  const simplePatterns = /assign|close|comment|update status|label|tag|notify|remind|schedule|list|check|status|ping|health|report|audit/i;
  if (simplePatterns.test(text) && len < 500) return 'fast';

  // Code generation → DeepSeek V3.2 (thinking-mode tool calling, strong at code)
  const codePatterns = /implement|code|build|deploy|fix bug|write.*script|create.*file|refactor|debug|encode|transcode|api.*endpoint|migrate|integration/i;
  if (codePatterns.test(text)) return 'coder';

  // Game dev / complex multi-step agent tasks → GLM-5 (best free agent, 98.5% tool calling)
  const agentPatterns = /game|engine|loot|marketplace|3d|roku|brand bible|cross-game|character.*consistency|economy.*system|progression/i;
  if (agentPatterns.test(text)) return 'agent';

  // Deep reasoning / architecture → Qwen 3.5 397B (80% SWE-bench)
  const reasonPatterns = /architect|system.*design|framework|specification|research.*deep|evaluate.*options|technical.*review/i;
  if (reasonPatterns.test(text) || len > 2000) return 'reason';

  // Strategy / planning / brand → Kimi K2.5 (long context, strong planning)
  const planPatterns = /strategy|plan|analyze|campaign|marketing|brand|revenue|content.*calendar|roadmap|budget|prioritize/i;
  if (planPatterns.test(text)) return 'plan';

  // Default: GLM-5 (best all-around free agent model)
  return 'agent';
}

const MODEL_TIER_MAP = {
  'fast':   process.env.EXECUTOR_MODEL_FAST   || 'llm-glm47',
  'agent':  process.env.EXECUTOR_MODEL_AGENT  || 'llm-glm5',
  'coder':  process.env.EXECUTOR_MODEL_CODER  || 'llm-deepseek',
  'reason': process.env.EXECUTOR_MODEL_REASON || 'llm-qwen35',
  'plan':   process.env.EXECUTOR_MODEL_PLAN   || 'llm-kimi',
};

// ── Execution Engines ───────────────────────────────────────────────────────

/**
 * Execute via LiteLLM — works for any agent, uses free/cheap models
 */
async function executeLLM(issue, agent) {
  const systemPrompt = buildAgentSystemPrompt(agent, issue);
  const userPrompt = buildTaskPrompt(issue);

  // Route to appropriate free model tier based on task complexity
  const tier = classifyTask(issue);
  const model = MODEL_TIER_MAP[tier] || LITELLM_MODEL;
  log('INFO', 'TIER', `Task classified as "${tier}" → model: ${model}`);

  const r = await fetchJSON(`${LITELLM_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${LITELLM_KEY}` },
    timeout: TIMEOUT_MS,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
    }),
  });

  if (!r.ok) {
    throw new Error(`LiteLLM error ${r.status}: ${JSON.stringify(r.data)}`);
  }

  const content = r.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('LiteLLM returned empty content');
  }

  return {
    output: content,
    model: r.data?.model || LITELLM_MODEL,
    tokens: r.data?.usage?.total_tokens || 0,
    cost: r.data?.usage?.total_cost || 0,
  };
}

/**
 * Execute via Claw binary — for tasks needing file access, code execution
 */
async function executeClaw(issue, agent) {
  const task = `${issue.title}\n\n${issue.description || ''}`;

  const r = await fetchJSON(`${CLAW_RUNNER_URL}/run`, {
    method: 'POST',
    timeout: TIMEOUT_MS,
    body: JSON.stringify({
      task,
      model: 'sonnet',
      timeoutMs: TIMEOUT_MS - 5000,
    }),
  });

  if (!r.ok) {
    throw new Error(`Claw runner error ${r.status}: ${JSON.stringify(r.data)}`);
  }

  return {
    output: r.data?.output || r.data?.result || JSON.stringify(r.data),
    model: 'claw/sonnet',
    tokens: 0,
    cost: 0,
  };
}

// ── Prompt Building ─────────────────────────────────────────────────────────
function buildAgentSystemPrompt(agent, issue) {
  return `You are ${agent.name}, a ${agent.role || 'specialist'} agent at Trial X Fire.

Your capabilities: ${agent.capabilities || 'General engineering and problem-solving'}

You are executing a task from the Paperclip issue tracker. Provide a thorough, actionable response.
If the task requires code, write the code. If it requires a plan, write the plan with specific steps.
If you need information you don't have, say what you need and suggest how to get it.

Be concise but complete. Focus on deliverables, not process.`;
}

function buildTaskPrompt(issue) {
  let prompt = `# Task: ${issue.title}\n\n`;
  if (issue.description) {
    prompt += `## Description\n${issue.description}\n\n`;
  }
  prompt += `## Priority: ${issue.priority || 'medium'}\n`;
  prompt += `## Status: ${issue.status}\n\n`;
  prompt += `Provide your work output. If this is a research/analysis task, deliver the analysis. If this is an implementation task, provide the code or detailed implementation plan with file paths and code blocks.`;
  return prompt;
}

// ── Execution Decision ──────────────────────────────────────────────────────
function chooseEngine(agent, issue) {
  const adapter = agent.adapterType || '';
  const title = (issue.title || '').toLowerCase();
  const desc = (issue.description || '').toLowerCase();

  // Tasks that need file system access → claw
  const needsExecution = /deploy|build|fix|implement|create.*file|write.*code|install|configure|set up|migrate/i;
  if (needsExecution.test(title) || needsExecution.test(desc)) {
    // Only use claw if the runner is available and the task is VPS-scoped
    return 'claw';
  }

  // Everything else → LLM (research, planning, analysis, writing, design)
  return 'llm';
}

// ── Main Execution Loop ─────────────────────────────────────────────────────
async function findNextIssue(issues, agents) {
  if (FORCE_ID) {
    const issue = issues.find(i => i.id === FORCE_ID);
    if (!issue) { log('ERROR', 'FIND', `Issue ${FORCE_ID} not found`); return null; }
    return issue;
  }

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const state = loadState();

  // Filter to executable issues
  const candidates = issues.filter(i => {
    if (!['todo', 'backlog'].includes(i.status)) return false;
    if (!i.assigneeAgentId) return false;
    const agent = agentMap[i.assigneeAgentId];
    if (!agent) return false;
    if (!EXECUTABLE_ADAPTERS.has(agent.adapterType)) return false;
    if (agent.status === 'error' || agent.status === 'paused') return false;
    // Skip recently failed issues (cooldown)
    const failEntry = state.failed.find(f => f.id === i.id);
    if (failEntry && Date.now() - failEntry.at < 3600000) return false; // 1hr cooldown
    return true;
  });

  if (candidates.length === 0) return null;

  // Sort by priority
  candidates.sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    return pa - pb;
  });

  return candidates[0];
}

async function executeIssue(issue, agents) {
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const agent = agentMap[issue.assigneeAgentId];
  if (!agent) {
    log('ERROR', 'EXEC', `Agent ${issue.assigneeAgentId} not found for issue ${issue.id}`);
    return;
  }

  const engine = chooseEngine(agent, issue);
  const state = loadState();

  log('INFO', 'EXEC', `Starting: [${issue.priority}] "${issue.title.substring(0, 60)}" → ${agent.name} via ${engine}`);

  if (DRY_RUN) {
    log('INFO', 'DRY_RUN', `Would execute: ${engine} for ${issue.id} with agent ${agent.name}`);
    return;
  }

  // Step 1: Checkout the issue (mark in_progress)
  const checkout = await checkoutIssue(issue.id, agent.id);
  if (!checkout.ok) {
    // Checkout failed — might already be checked out or wrong status
    log('WARN', 'CHECKOUT', `Failed to checkout ${issue.id}: ${JSON.stringify(checkout.data)}`);
    // Try direct status update as fallback
    await updateIssue(issue.id, { status: 'in_progress' });
  }

  state.executing = { id: issue.id, agent: agent.name, engine, startedAt: Date.now() };
  saveState();

  // ── Orchestrator: Claimed → Running ──────────────────────────
  let workspacePath = null;
  try {
    const ws = ensureWorkspace(issue);
    workspacePath = ws.path;
  } catch (wsErr) {
    log('WARN', 'WORKSPACE', `Workspace creation failed for ${issue.id}: ${wsErr.message}`);
  }
  startRunning(issue.id, { agentId: agent.id, sessionId: null, workspacePath });

  try {
    // Step 2: Execute
    let result;
    if (engine === 'claw') {
      try {
        result = await executeClaw(issue, agent);
      } catch (clawErr) {
        // Fallback to LLM if claw fails
        log('WARN', 'CLAW_FALLBACK', `Claw failed (${clawErr.message}), falling back to LLM`);
        result = await executeLLM(issue, agent);
      }
    } else {
      result = await executeLLM(issue, agent);
    }

    // Quality gate: reject empty or trivially short outputs
    if (!result.output || result.output.trim().length < 50) {
      throw new Error(`Output too short (${(result.output || '').trim().length} chars) — likely empty LLM response`);
    }

    // Step 3: Post results as comment
    const comment = `## Agent Execution: ${agent.name}\n**Engine:** ${result.model}\n**Tokens:** ${result.tokens}\n\n---\n\n${result.output.substring(0, 10000)}`;
    await commentIssue(issue.id, comment);

    // Step 4: Mark done
    await updateIssue(issue.id, { status: 'done' });

    // Step 4b: Orchestrator: Running → Released (completed)
    completeIssue(issue.id);
    recordActivity(issue.id, { tokens: { total: result.tokens }, turnCount: 1 });
    // Workspace cleanup
    if (getConfig('workspace.cleanup_on_terminal', true) && (issue.identifier || issue.id)) {
      try { removeWorkspace(issue.identifier || issue.id); } catch {}
    }

    // Step 5: Update state
    state.stats.total++;
    state.stats.success++;
    state.completed.push({ id: issue.id, title: issue.title.substring(0, 80), agent: agent.name, at: Date.now() });
    // Keep last 100 completions
    if (state.completed.length > 100) state.completed = state.completed.slice(-100);

    log('INFO', 'DONE', `Completed: "${issue.title.substring(0, 60)}" → ${result.tokens} tokens`);

  } catch (err) {
    // Execution failed
    log('ERROR', 'FAIL', `Failed: "${issue.title.substring(0, 60)}" — ${err.message}`);

    // Post failure comment
    await commentIssue(issue.id, `## Execution Failed\n**Agent:** ${agent.name}\n**Error:** ${err.message}\n\nCEO will review and reassign.`);

    // Mark blocked so CEO loop picks it up
    await updateIssue(issue.id, { status: 'blocked' });

    // Orchestrator: Running → RetryQueued (exponential backoff)
    failAndRetry(issue.id, err.message);

    state.stats.total++;
    state.stats.failed++;
    state.failed.push({ id: issue.id, title: issue.title.substring(0, 80), error: err.message, at: Date.now() });
    // Keep last 50 failures
    if (state.failed.length > 50) state.failed = state.failed.slice(-50);

  } finally {
    state.executing = null;
    saveState();
  }
}

async function runCycle() {
  try {
    const [issues, agents] = await Promise.all([getIssues(), getAgents()]);

    const next = await findNextIssue(issues, agents);
    if (!next) {
      // Silently wait — no work to do
      return;
    }

    await executeIssue(next, agents);

  } catch (err) {
    log('ERROR', 'CYCLE', `Cycle error: ${err.message}`);
  }
}

// ── Health Endpoint (optional) ──────────────────────────────────────────────
async function startHealthServer() {
  const { createServer } = await import('http');
  const server = createServer((req, res) => {
    const state = loadState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      executing: state.executing,
      stats: state.stats,
      lastCompleted: state.completed.slice(-5),
      lastFailed: state.failed.slice(-3),
      orchestrator: getSnapshot(),
    }));
  });
  server.listen(7081, '127.0.0.1');
  log('INFO', 'HEALTH', 'Health endpoint at http://127.0.0.1:7081');
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  log('INFO', 'STARTUP', `Agent Executor starting (poll=${POLL_INTERVAL/1000}s, model=${LITELLM_MODEL}, mode=${DRY_RUN ? 'dry-run' : 'live'})`);

  await startHealthServer();

  // First cycle immediately
  await runCycle();

  if (RUN_ONCE) {
    log('INFO', 'EXIT', 'Single cycle complete (--once). Exiting.');
    process.exit(0);
  }

  // Continue polling
  setInterval(runCycle, POLL_INTERVAL);
  log('INFO', 'LOOP', `Polling every ${POLL_INTERVAL / 1000}s for work.`);
}

main().catch(err => {
  log('ERROR', 'FATAL', `Executor crashed: ${err.message}`);
  process.exit(1);
});
