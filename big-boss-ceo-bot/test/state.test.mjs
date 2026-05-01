import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dir, '..', 'state.json');

function cleanup() {
  try { unlinkSync(STATE_FILE); } catch {}
}

describe('state module', () => {
  beforeEach(() => {
    cleanup();
    // Force re-import with fresh state by clearing the module cache
    // Since state.mjs caches in _state, we need to re-import fresh each time
  });

  afterEach(() => {
    cleanup();
  });

  it('hasSeen returns false for unseen issues', async () => {
    // Fresh import to reset cached _state
    const mod = await import(`../state.mjs?t=${Date.now()}`);
    assert.equal(mod.hasSeen('issue-1', 'assigned'), false);
  });

  it('markSeen + hasSeen round-trips correctly', async () => {
    const mod = await import(`../state.mjs?t=${Date.now()}-2`);
    mod.markSeen('issue-1', 'assigned');
    assert.equal(mod.hasSeen('issue-1', 'assigned'), true);
  });

  it('hasSeen distinguishes event types', async () => {
    const mod = await import(`../state.mjs?t=${Date.now()}-3`);
    mod.markSeen('issue-1', 'assigned');
    assert.equal(mod.hasSeen('issue-1', 'assigned'), true);
    assert.equal(mod.hasSeen('issue-1', 'done'), false);
  });

  it('hasSeen distinguishes issue IDs', async () => {
    const mod = await import(`../state.mjs?t=${Date.now()}-4`);
    mod.markSeen('issue-1', 'assigned');
    assert.equal(mod.hasSeen('issue-1', 'assigned'), true);
    assert.equal(mod.hasSeen('issue-2', 'assigned'), false);
  });

  it('setLastPoll updates the poll timestamp', async () => {
    const mod = await import(`../state.mjs?t=${Date.now()}-5`);
    const ts = '2026-05-01T12:00:00.000Z';
    mod.setLastPoll(ts);
    const state = mod.getState();
    assert.equal(state.lastPollAt, ts);
  });

  it('persists state to disk', async () => {
    const mod = await import(`../state.mjs?t=${Date.now()}-6`);
    mod.markSeen('issue-99', 'error');
    assert.ok(existsSync(STATE_FILE));
    const raw = JSON.parse(await import('fs').then(fs => fs.readFileSync(STATE_FILE, 'utf8')));
    assert.ok(raw.seenIssues['issue-99']);
    assert.ok(raw.seenIssues['issue-99'].error);
  });

  it('loads from existing state file', async () => {
    writeFileSync(STATE_FILE, JSON.stringify({
      seenIssues: { 'pre-existing': { done: 1234567890 } },
      lastPollAt: '2026-01-01T00:00:00Z',
    }));
    const mod = await import(`../state.mjs?t=${Date.now()}-7`);
    assert.equal(mod.hasSeen('pre-existing', 'done'), true);
    assert.equal(mod.getState().lastPollAt, '2026-01-01T00:00:00Z');
  });

  it('handles corrupted state file gracefully', async () => {
    writeFileSync(STATE_FILE, 'not valid json {{{');
    const mod = await import(`../state.mjs?t=${Date.now()}-8`);
    assert.equal(mod.hasSeen('any', 'any'), false);
    const state = mod.getState();
    assert.deepEqual(state.seenIssues, {});
    assert.equal(state.lastPollAt, null);
  });
});
