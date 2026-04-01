/**
 * Persistent dedup state — same pattern as error-triage
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const STATE_FILE = new URL('./state.json', import.meta.url).pathname;

let _state = null;

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
