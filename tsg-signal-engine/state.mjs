import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { atomicWriteJSON } from "./atomic-write.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, "state.json");

let _state = null;

const EMPTY_STATE = {
  subscribers: {},
  broadcastCursor: 0,
  dailySendCount: 0,
  dailySendDate: null,
  lastRun: null,
  lastBroadcastWeek: null,
};

export function load() {
  if (_state) return _state;
  if (!existsSync(STATE_FILE)) {
    _state = { ...EMPTY_STATE };
    return _state;
  }
  try {
    _state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    _state = { ...EMPTY_STATE };
  }
  return _state;
}

export function save() {
  if (!_state) return;
  atomicWriteJSON(STATE_FILE, _state);
}

export function resetIfNewDay() {
  const state = load();
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailySendDate !== today) {
    state.dailySendCount = 0;
    state.dailySendDate = today;
  }
}

export function canSendToday() {
  const state = load();
  const max = parseInt(process.env.MAX_DAILY_SENDS || "90", 10);
  return state.dailySendCount < max;
}

export function incrementSendCount() {
  const state = load();
  state.dailySendCount++;
}

export function getSubscriber(email) {
  const state = load();
  return state.subscribers[email] || null;
}

export function initSubscriber(email, joinedAt, cadence) {
  const state = load();
  if (!state.subscribers[email]) {
    state.subscribers[email] = {
      joinedAt,
      dripIndex: 0,
      lastDripSent: null,
      dripComplete: false,
      cadence: cadence || "weekly",
      lastBroadcastSent: null,
      broadcastIndex: state.broadcastCursor,
      totalSent: 0,
    };
  }
  return state.subscribers[email];
}
