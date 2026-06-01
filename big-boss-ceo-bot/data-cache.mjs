/**
 * Centralized Paperclip Data Cache
 *
 * Polls Paperclip once every 60s and caches the results.
 * All consumers (notifier, CEO loop, PM loops, bot commands, digest)
 * read from cache instead of making independent HTTP calls.
 *
 * This eliminates the thundering herd problem where 11+ timers
 * all hit Paperclip independently.
 */
import { listIssues, listAgents, getDashboard } from './paperclip.mjs';

const POLL_INTERVAL_MS = parseInt(process.env.CACHE_POLL_MS || '60000', 10);

// Cached data — populated on first poll, refreshed every 60s
let _cache = {
  dashboard: {},
  agents: [],
  issues: {
    todo: [],
    in_progress: [],
    blocked: [],
    done: [],
    backlog: [],
  },
  lastPollAt: null,
  pollCount: 0,
  errors: 0,
};

let _polling = false;

async function refresh() {
  if (_polling) return; // Prevent overlapping polls
  _polling = true;
  try {
    const [dashboard, agents, todo, inProgress, blocked, done] = await Promise.all([
      getDashboard(),
      listAgents(),
      listIssues({ status: 'todo', limit: 200 }),
      listIssues({ status: 'in_progress', limit: 100 }),
      listIssues({ status: 'blocked', limit: 50 }),
      listIssues({ status: 'done', limit: 30 }),
    ]);

    _cache = {
      dashboard,
      agents,
      issues: { todo, in_progress: inProgress, blocked, done, backlog: [] },
      lastPollAt: Date.now(),
      pollCount: _cache.pollCount + 1,
      errors: 0,
    };
  } catch (err) {
    console.error('[data-cache] poll error:', err.message);
    _cache.errors++;
    // Keep stale data — better than nothing
  } finally {
    _polling = false;
  }
}

// ── Public API ──────────────────────────────────────────────────

/** Start the background poll loop. Call once from bot.mjs. */
export function startDataCache() {
  refresh(); // First poll immediately
  setInterval(refresh, POLL_INTERVAL_MS);
  console.log(`[data-cache] polling every ${POLL_INTERVAL_MS / 1000}s`);
}

/** Force an immediate refresh (e.g., after a write operation). */
export async function forceRefresh() {
  await refresh();
}

/** Get cached dashboard data. */
export function getCachedDashboard() {
  return _cache.dashboard;
}

/** Get cached agent list. */
export function getCachedAgents() {
  return _cache.agents;
}

/**
 * Get cached issues, optionally filtered.
 * @param {object} opts - { status, priority, assigneeAgentId, limit }
 */
export function getCachedIssues({ status, priority, assigneeAgentId, limit = 50 } = {}) {
  let pool;
  if (status && _cache.issues[status]) {
    pool = _cache.issues[status];
  } else if (status) {
    pool = []; // Unknown status — return empty (cache doesn't have it)
  } else {
    // All statuses combined
    pool = [
      ..._cache.issues.todo,
      ..._cache.issues.in_progress,
      ..._cache.issues.blocked,
      ..._cache.issues.done,
    ];
  }

  if (priority) pool = pool.filter(i => i.priority === priority);
  if (assigneeAgentId) pool = pool.filter(i => i.assigneeAgentId === assigneeAgentId);
  return pool.slice(0, limit);
}

/** Cache health info for /healthz endpoint. */
export function getCacheStats() {
  return {
    lastPollAt: _cache.lastPollAt,
    pollCount: _cache.pollCount,
    staleMs: _cache.lastPollAt ? Date.now() - _cache.lastPollAt : null,
    errors: _cache.errors,
    agentCount: _cache.agents.length,
    issueCount: Object.values(_cache.issues).reduce((s, a) => s + a.length, 0),
  };
}
