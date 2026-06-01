/**
 * Persistent dedup state — same pattern as error-triage
 * Now with atomic writes and TTL-based pruning.
 */
import { readFileSync, existsSync } from 'fs';
import { atomicWriteJSON } from './atomic-write.mjs';

const STATE_FILE = new URL('./state.json', import.meta.url).pathname;
const PRUNE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let _state = null;
let _saveCount = 0;

function load() {
  if (_state) return _state;
  if (!existsSync(STATE_FILE)) {
    _state = { seenIssues: {}, lastPollAt: null };
    return _state;
  }
  try {
    _state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    _state = { seenIssues: {}, lastPollAt: null };
  }
  return _state;
}

function pruneState() {
  const s = load();
  const cutoff = Date.now() - PRUNE_MAX_AGE_MS;
  for (const [id, events] of Object.entries(s.seenIssues)) {
    const allOld = Object.values(events).every(ts => ts < cutoff);
    if (allOld) delete s.seenIssues[id];
  }
}

function save() {
  _saveCount++;
  if (_saveCount % 50 === 0) pruneState();
  atomicWriteJSON(STATE_FILE, _state);
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
