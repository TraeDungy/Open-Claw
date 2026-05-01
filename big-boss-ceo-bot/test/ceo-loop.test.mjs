import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock all dependencies before importing
process.env.PAPERCLIP_CLI = '/usr/bin/paperclipai';
process.env.COMPANY_ID = 'test-company-id';
process.env.LITELLM_BASE_URL = 'http://localhost:9000/v1';
process.env.LITELLM_API_KEY = 'test-key';
process.env.LITELLM_MODEL = 'test-model';

const mockSpawnSync = mock.fn(() => ({ status: 0, stdout: '', stderr: '' }));
mock.module('child_process', { namedExports: { spawnSync: mockSpawnSync } });

const mockFetch = mock.fn(async () => ({
  ok: true,
  json: async () => ({ choices: [{ message: { content: 'NO_ACTION_NEEDED' } }] }),
  text: async () => '',
}));
globalThis.fetch = mockFetch;

const { _parseActions: parseActions, runCycle } = await import('../ceo-loop.mjs');

describe('parseActions', () => {
  it('parses CREATE_ISSUE action', () => {
    const text = `Some CEO analysis here.
ACTION:CREATE_ISSUE {"title":"Fix pipeline","body":"Pipeline is broken","assigneeAgentId":"abc-123","priority":"critical"}`;
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'create_issue');
    assert.equal(actions[0].title, 'Fix pipeline');
    assert.equal(actions[0].body, 'Pipeline is broken');
    assert.equal(actions[0].assigneeAgentId, 'abc-123');
    assert.equal(actions[0].priority, 'critical');
  });

  it('parses COMMENT action', () => {
    const text = 'ACTION:COMMENT {"issueId":"issue-1","body":"Looking into this"}';
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'comment');
    assert.equal(actions[0].issueId, 'issue-1');
    assert.equal(actions[0].body, 'Looking into this');
  });

  it('parses WAKEUP_AGENT action', () => {
    const text = 'ACTION:WAKEUP_AGENT {"agentId":"abc-123","reason":"Need you on pipeline"}';
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'wakeup_agent');
    assert.equal(actions[0].agentId, 'abc-123');
    assert.equal(actions[0].reason, 'Need you on pipeline');
  });

  it('parses CLOSE_ISSUE action', () => {
    const text = 'ACTION:CLOSE_ISSUE {"issueId":"issue-99"}';
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'close_issue');
    assert.equal(actions[0].issueId, 'issue-99');
  });

  it('parses REASSIGN action', () => {
    const text = 'ACTION:REASSIGN {"issueId":"issue-5","agentId":"xyz-789","reason":"Better fit"}';
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'reassign');
    assert.equal(actions[0].issueId, 'issue-5');
    assert.equal(actions[0].agentId, 'xyz-789');
    assert.equal(actions[0].reason, 'Better fit');
  });

  it('parses ESCALATE action (plain text, not JSON)', () => {
    const text = 'ACTION:ESCALATE Need owner approval for AWS budget increase';
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'escalate');
    assert.equal(actions[0].message, 'Need owner approval for AWS budget increase');
  });

  it('parses multiple actions from mixed response', () => {
    const text = `Company is on track. Pipeline needs attention.

ACTION:CREATE_ISSUE {"title":"Fix encoding","body":"HLS broken","assigneeAgentId":"abc","priority":"high"}
ACTION:WAKEUP_AGENT {"agentId":"def","reason":"Pipeline work"}
ACTION:CLOSE_ISSUE {"issueId":"old-issue"}
ACTION:ESCALATE Budget approval needed for R2 expansion`;
    const actions = parseActions(text);
    assert.equal(actions.length, 4);
    assert.equal(actions[0].type, 'create_issue');
    assert.equal(actions[1].type, 'wakeup_agent');
    assert.equal(actions[2].type, 'close_issue');
    assert.equal(actions[3].type, 'escalate');
  });

  it('skips malformed JSON in actions gracefully', () => {
    const text = `ACTION:CREATE_ISSUE {invalid json here
ACTION:CLOSE_ISSUE {"issueId":"valid-issue"}`;
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'close_issue');
  });

  it('returns empty array for no-action response', () => {
    assert.deepEqual(parseActions('NO_ACTION_NEEDED'), []);
  });

  it('returns empty array for plain text with no actions', () => {
    assert.deepEqual(parseActions('Everything looks good. No changes needed.'), []);
  });

  it('ignores lines that do not start with ACTION:', () => {
    const text = `Some analysis.
Not an action line.
ACTION:CLOSE_ISSUE {"issueId":"abc"}
Another non-action line.`;
    const actions = parseActions(text);
    assert.equal(actions.length, 1);
  });
});

describe('runCycle', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
    mockFetch.mock.resetCalls();
  });

  it('returns null when LLM says NO_ACTION_NEEDED', async () => {
    mockSpawnSync.mock.mockImplementation(() => ({ status: 0, stdout: '', stderr: '' }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'NO_ACTION_NEEDED' } }] }),
    }));

    const result = await runCycle();
    assert.equal(result, null);
  });

  it('executes actions and returns results', async () => {
    mockSpawnSync.mock.mockImplementation(() => ({ status: 0, stdout: '', stderr: '' }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: `Pipeline needs attention.\nACTION:CLOSE_ISSUE {"issueId":"done-issue"}`,
          },
        }],
      }),
    }));

    const result = await runCycle();
    assert.ok(result);
    assert.ok(result.analysis.includes('Pipeline needs attention'));
    assert.ok(result.results.length > 0);
  });

  it('limits to 6 actions max', async () => {
    const manyActions = Array.from({ length: 10 }, (_, i) =>
      `ACTION:CLOSE_ISSUE {"issueId":"issue-${i}"}`
    ).join('\n');

    mockSpawnSync.mock.mockImplementation(() => ({ status: 0, stdout: '', stderr: '' }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: `Analysis.\n${manyActions}` } }],
      }),
    }));

    const result = await runCycle();
    assert.ok(result.results.length <= 6);
  });
});
