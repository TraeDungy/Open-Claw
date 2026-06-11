/**
 * Persistent dedup state — same pattern as error-triage
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const STATE_FILE = new URL('./state.json', import.meta.url).pathname;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

let _state = null;

function load() {
  if (_state) return _state;
  if (!existsSync(STATE_FILE)) {
    _state = { seenIssues: {}, lastPollAt: null, recentActions: [] };
    return _state;
  }
  try {
    _state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    _state = { seenIssues: {}, lastPollAt: null, recentActions: [] };
  }
  if (!Array.isArray(_state.recentActions)) _state.recentActions = [];
  return _state;
}

// Drop entries older than MAX_AGE_MS so the state file doesn't grow forever
function prune(s) {
  const cutoff = Date.now() - MAX_AGE_MS;
  s.recentActions = s.recentActions.filter(a => a.ts > cutoff);
  for (const [id, events] of Object.entries(s.seenIssues || {})) {
    if (Math.max(...Object.values(events)) < cutoff) delete s.seenIssues[id];
  }
}

function save() {
  writeFileSync(STATE_FILE, JSON.stringify(_state, null, 2));
}

export function hasSeen(issueId, eventType) {
  const s = load();
  return !!(s.seenIssues[issueId]?.[eventType]);
}

export function markSeen(issueId, eventType) {
  const s = load();
  if (!s.seenIssues[issueId]) s.seenIssues[issueId] = {};
  s.seenIssues[issueId][eventType] = Date.now();
  save();
}

export function setLastPoll(ts) {
  const s = load();
  s.lastPollAt = ts;
  save();
}

export function getState() {
  return load();
}

/**
 * Action memory — lets the CEO/PM loops remember what they did across
 * cycles (and restarts) so they don't repeat themselves.
 */
export function recordAction(loop, { type, summary = '', agentId = null }) {
  const s = load();
  s.recentActions.push({ loop, type, summary, agentId, ts: Date.now() });
  prune(s);
  save();
}

// loop=null returns actions from all loops (e.g. global wakeup throttling)
export function getRecentActions(windowMs, loop = null) {
  const s = load();
  const cutoff = Date.now() - windowMs;
  return s.recentActions.filter(a => a.ts > cutoff && (!loop || a.loop === loop));
}
