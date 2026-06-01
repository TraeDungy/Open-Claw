/**
 * Symphony Orchestrator — 5-State Claim Model
 *
 * State Machine:
 *   Unclaimed → Claimed → Running → RetryQueued → Released
 *                  ↑                      │
 *                  └──────────────────────┘
 *
 * Replaces simple seen-tracking with proper claim-based orchestration.
 * Integrates with WORKFLOW.md config, workspace isolation, and retry logic.
 *
 * Persists state to orchestrator-state.json for crash recovery.
 */
import { readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { atomicWriteJSON } from './atomic-write.mjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConfig, loadWorkflow, renderPrompt } from './workflow-loader.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dir, 'orchestrator-state.json');

// ── State Constants ──────────────────────────────────────────────
export const STATES = {
  UNCLAIMED: 'unclaimed',
  CLAIMED:   'claimed',
  RUNNING:   'running',
  RETRY_QUEUED: 'retry_queued',
  RELEASED:  'released',
};

// ── Runtime State ────────────────────────────────────────────────
// In-memory state — persisted to disk on every mutation
let _state = null;

function defaultState() {
  return {
    version: 1,
    running: {},       // { issueId: RunRecord }
    claimed: {},       // { issueId: ClaimRecord }
    retryQueue: {},    // { issueId: RetryEntry }
    completed: {},     // { issueId: timestamp } — recent completions
    released: {},      // { issueId: timestamp } — recently released
    stats: {
      totalDispatched: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalRetries: 0,
    },
    lastPollAt: null,
  };
}

function loadState() {
  if (_state) return _state;
  try {
    _state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    // Migration: ensure all fields exist
    _state = { ...defaultState(), ..._state };
  } catch {
    _state = defaultState();
  }
  return _state;
}

function saveState() {
  const s = loadState();
  s.lastPollAt = Date.now();
  atomicWriteJSON(STATE_FILE, s);
}

// ── Claim Operations ─────────────────────────────────────────────

/**
 * Claim an issue — transition from Unclaimed → Claimed.
 * Prevents duplicate dispatch.
 */
export function claimIssue(issue, agentId) {
  const s = loadState();
  if (s.running[issue.id] || s.claimed[issue.id] || s.retryQueue[issue.id]) {
    return false; // Already claimed/running/retrying
  }

  s.claimed[issue.id] = {
    issueId: issue.id,
    identifier: issue.identifier || issue.title?.slice(0, 30),
    agentId,
    claimedAt: Date.now(),
    title: issue.title,
    priority: issue.priority,
    status: issue.status,
  };
  s.stats.totalDispatched++;
  saveState();
  return true;
}

/**
 * Start running — transition from Claimed → Running.
 * Called when the executor picks up the issue.
 */
export function startRunning(issueId, { agentId, sessionId, workspacePath } = {}) {
  const s = loadState();
  const claim = s.claimed[issueId];
  if (!claim) {
    // Allow direct Unclaimed → Running for backward compat
    s.running[issueId] = {
      issueId,
      agentId: agentId || null,
      sessionId: sessionId || null,
      workspacePath: workspacePath || null,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      turnCount: 0,
      attempt: 1,
      tokens: { input: 0, output: 0, total: 0 },
    };
  } else {
    s.running[issueId] = {
      ...claim,
      sessionId: sessionId || null,
      workspacePath: workspacePath || null,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      turnCount: 0,
      attempt: (s.retryQueue[issueId]?.attempt || 0) + 1,
      tokens: { input: 0, output: 0, total: 0 },
    };
    delete s.claimed[issueId];
  }
  delete s.retryQueue[issueId];
  saveState();
}

/**
 * Record activity — heartbeat from running worker.
 */
export function recordActivity(issueId, { tokens, turnCount, sessionId } = {}) {
  const s = loadState();
  const run = s.running[issueId];
  if (!run) return;

  run.lastActivityAt = Date.now();
  if (tokens) {
    run.tokens = { ...run.tokens, ...tokens };
  }
  if (turnCount != null) run.turnCount = turnCount;
  if (sessionId) run.sessionId = sessionId;
  saveState();
}

/**
 * Complete successfully — transition from Running → Released (terminal).
 */
export function completeIssue(issueId) {
  const s = loadState();
  delete s.running[issueId];
  delete s.claimed[issueId];
  delete s.retryQueue[issueId];
  s.completed[issueId] = Date.now();
  s.stats.totalCompleted++;
  saveState();
  console.log(`[orchestrator] ✓ ${issueId} completed`);
}

/**
 * Fail and queue retry — transition from Running → RetryQueued.
 * Uses exponential backoff: delay = min(base * 2^(attempt-1), max_backoff)
 */
export function failAndRetry(issueId, error) {
  const s = loadState();
  const run = s.running[issueId];
  const attempt = run?.attempt || 1;

  const baseMs = getConfig('retry.failure_base_ms', 10000);
  const multiplier = getConfig('retry.failure_multiplier', 2);
  const maxBackoff = getConfig('agent.max_retry_backoff_ms', 300000);
  const delayMs = Math.min(baseMs * Math.pow(multiplier, attempt - 1), maxBackoff);

  s.retryQueue[issueId] = {
    issueId,
    identifier: run?.identifier || issueId,
    agentId: run?.agentId || null,
    title: run?.title || null,
    attempt: attempt + 1,
    dueAt: Date.now() + delayMs,
    error: error?.slice?.(0, 200) || 'Unknown error',
    workspacePath: run?.workspacePath || null,
  };
  delete s.running[issueId];
  s.stats.totalFailed++;
  s.stats.totalRetries++;
  saveState();
  console.log(`[orchestrator] ⟳ ${issueId} retry #${attempt + 1} in ${Math.round(delayMs / 1000)}s — ${error?.slice(0, 80)}`);
}

/**
 * Release claim — transition from any state → Released.
 * Used when issue is no longer eligible (cancelled, done externally, etc.)
 */
export function releaseIssue(issueId) {
  const s = loadState();
  delete s.running[issueId];
  delete s.claimed[issueId];
  delete s.retryQueue[issueId];
  s.released[issueId] = Date.now();
  saveState();
}

// ── Query Operations ─────────────────────────────────────────────

/**
 * Check if an issue is currently managed (claimed, running, or retrying).
 */
export function isManaged(issueId) {
  const s = loadState();
  return !!(s.running[issueId] || s.claimed[issueId] || s.retryQueue[issueId]);
}

/**
 * Get the state of a specific issue.
 */
export function getIssueState(issueId) {
  const s = loadState();
  if (s.running[issueId]) return { state: STATES.RUNNING, data: s.running[issueId] };
  if (s.claimed[issueId]) return { state: STATES.CLAIMED, data: s.claimed[issueId] };
  if (s.retryQueue[issueId]) return { state: STATES.RETRY_QUEUED, data: s.retryQueue[issueId] };
  if (s.completed[issueId]) return { state: STATES.RELEASED, data: { completedAt: s.completed[issueId] } };
  if (s.released[issueId]) return { state: STATES.RELEASED, data: { releasedAt: s.released[issueId] } };
  return { state: STATES.UNCLAIMED, data: null };
}

/**
 * Get all running issues.
 */
export function getRunning() {
  return { ...loadState().running };
}

/**
 * Get all retry-queued issues.
 */
export function getRetryQueue() {
  return { ...loadState().retryQueue };
}

/**
 * Get concurrency status.
 */
export function getConcurrency() {
  const s = loadState();
  const maxConcurrent = getConfig('agent.max_concurrent_agents', 5);
  const runningCount = Object.keys(s.running).length;
  return {
    running: runningCount,
    max: maxConcurrent,
    available: Math.max(0, maxConcurrent - runningCount),
    claimed: Object.keys(s.claimed).length,
    retrying: Object.keys(s.retryQueue).length,
  };
}

/**
 * Get full orchestrator snapshot for observability.
 */
export function getSnapshot() {
  const s = loadState();
  return {
    running: Object.values(s.running).map(r => ({
      issueId: r.issueId,
      identifier: r.identifier,
      agentId: r.agentId,
      sessionId: r.sessionId,
      startedAt: r.startedAt,
      turnCount: r.turnCount,
      attempt: r.attempt,
      tokens: r.tokens,
    })),
    retrying: Object.values(s.retryQueue).map(r => ({
      issueId: r.issueId,
      identifier: r.identifier,
      attempt: r.attempt,
      dueAt: r.dueAt,
      error: r.error,
    })),
    claimed: Object.keys(s.claimed),
    stats: { ...s.stats },
    concurrency: getConcurrency(),
    lastPollAt: s.lastPollAt,
  };
}

// ── Reconciliation ───────────────────────────────────────────────

/**
 * Stall detection — find running issues with no recent activity.
 * Returns list of stalled issue IDs.
 */
export function detectStalls() {
  const s = loadState();
  const stallTimeout = getConfig('codex.stall_timeout_ms', 300000);
  if (stallTimeout <= 0) return [];

  const now = Date.now();
  const stalled = [];

  for (const [issueId, run] of Object.entries(s.running)) {
    const lastActivity = run.lastActivityAt || run.startedAt;
    if (now - lastActivity > stallTimeout) {
      stalled.push(issueId);
    }
  }
  return stalled;
}

/**
 * Process due retries — find retry entries whose timer has fired.
 * Returns list of { issueId, agentId, attempt, workspacePath }
 */
export function processDueRetries() {
  const s = loadState();
  const now = Date.now();
  const due = [];

  for (const [issueId, entry] of Object.entries(s.retryQueue)) {
    if (entry.dueAt <= now) {
      due.push(entry);
    }
  }
  return due;
}

/**
 * Reconcile with tracker — release claims for issues that are no longer active.
 * Call this with the current list of active issue IDs from Paperclip.
 */
export function reconcileWithTracker(activeIssueIds) {
  const s = loadState();
  const activeSet = new Set(activeIssueIds);
  let released = 0;

  // Check running issues
  for (const issueId of Object.keys(s.running)) {
    if (!activeSet.has(issueId)) {
      releaseIssue(issueId);
      released++;
      console.log(`[orchestrator] reconcile: released running ${issueId} (no longer active in tracker)`);
    }
  }

  // Check claimed issues
  for (const issueId of Object.keys(s.claimed)) {
    if (!activeSet.has(issueId)) {
      releaseIssue(issueId);
      released++;
      console.log(`[orchestrator] reconcile: released claimed ${issueId} (no longer active)`);
    }
  }

  // Check retry queue
  for (const issueId of Object.keys(s.retryQueue)) {
    if (!activeSet.has(issueId)) {
      releaseIssue(issueId);
      released++;
      console.log(`[orchestrator] reconcile: released retry ${issueId} (no longer active)`);
    }
  }

  return released;
}

/**
 * Cleanup old entries:
 * - completed/released: keep last 200
 * - stale claimed: remove if older than 24h (abandoned)
 * - stale running: remove if older than 6h (hung)
 */
export function pruneHistory() {
  const s = loadState();
  const MAX_HISTORY = 200;
  const STALE_CLAIMED_MS = 24 * 60 * 60 * 1000; // 24h
  const STALE_RUNNING_MS = 6 * 60 * 60 * 1000;  // 6h
  const now = Date.now();

  for (const map of [s.completed, s.released]) {
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (entries.length > MAX_HISTORY) {
      for (const [id] of entries.slice(MAX_HISTORY)) {
        delete map[id];
      }
    }
  }

  // Prune stale claimed entries
  for (const [id, record] of Object.entries(s.claimed)) {
    const claimedAt = record.claimedAt || record.timestamp || 0;
    if (now - claimedAt > STALE_CLAIMED_MS) {
      delete s.claimed[id];
    }
  }

  // Prune stale running entries
  for (const [id, record] of Object.entries(s.running)) {
    const startedAt = record.startedAt || record.timestamp || 0;
    if (now - startedAt > STALE_RUNNING_MS) {
      delete s.running[id];
    }
  }

  saveState();
}

// ── Dispatch Eligibility ─────────────────────────────────────────

/**
 * Check if an issue is eligible for dispatch.
 * Symphony rules: has required fields, active state, not managed, slots available.
 */
export function isEligible(issue, activeStates) {
  const s = loadState();
  const terminalStates = getConfig('tracker.terminal_states', ['done', 'cancelled']);

  // Must have required fields
  if (!issue.id || !issue.title || !issue.status) return false;

  // Must be in active state
  if (!activeStates.includes(issue.status)) return false;

  // Must not be in terminal state
  if (terminalStates.includes(issue.status)) return false;

  // Must not already be managed
  if (s.running[issue.id] || s.claimed[issue.id] || s.retryQueue[issue.id]) return false;

  // Must not be recently completed (debounce)
  if (s.completed[issue.id] && Date.now() - s.completed[issue.id] < 60000) return false;

  // Concurrency check
  const { available } = getConcurrency();
  if (available <= 0) return false;

  // Per-state concurrency check
  const byState = getConfig('agent.max_concurrent_agents_by_state', {});
  const stateLimit = byState[issue.status?.toLowerCase()];
  if (stateLimit != null) {
    const runningInState = Object.values(s.running).filter(
      r => r.status === issue.status
    ).length;
    if (runningInState >= stateLimit) return false;
  }

  return true;
}
