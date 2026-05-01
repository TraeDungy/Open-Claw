import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';

// Set env vars before importing
process.env.PAPERCLIP_CLI = '/usr/bin/paperclipai';
process.env.COMPANY_ID = 'test-company-id';
process.env.PAPERCLIP_URL = 'http://localhost:3100';
process.env.PAPERCLIP_TOKEN = 'test-token';

// Mock child_process.spawnSync before importing paperclip
const mockSpawnSync = mock.fn(() => ({
  status: 0,
  stdout: '',
  stderr: '',
}));

mock.module('child_process', {
  namedExports: { spawnSync: mockSpawnSync },
});

const {
  _resolveAgentId: resolveAgentId,
  _parseLines: parseLines,
  _COMMANDS_WITH_COMPANY_ID: COMMANDS_WITH_COMPANY_ID,
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  commentIssue,
  listAgents,
  getDashboard,
  checkoutIssue,
  closeIssue,
  reassignIssue,
  wakeupAgent,
} = await import('../paperclip.mjs');

describe('resolveAgentId', () => {
  it('returns undefined for falsy input', () => {
    assert.equal(resolveAgentId(null), undefined);
    assert.equal(resolveAgentId(undefined), undefined);
    assert.equal(resolveAgentId(''), undefined);
  });

  it('passes through valid UUIDs unchanged', () => {
    const uuid = '010acbc6-304f-4e92-a308-e005d5ea892e';
    assert.equal(resolveAgentId(uuid), uuid);
  });

  it('passes through uppercase UUIDs', () => {
    const uuid = '010ACBC6-304F-4E92-A308-E005D5EA892E';
    assert.equal(resolveAgentId(uuid), uuid);
  });

  it('resolves known agent names to UUIDs (case-insensitive)', () => {
    assert.equal(resolveAgentId('Big Boss CEO'), '010acbc6-304f-4e92-a308-e005d5ea892e');
    assert.equal(resolveAgentId('BIG BOSS CEO'), '010acbc6-304f-4e92-a308-e005d5ea892e');
    assert.equal(resolveAgentId('goldie'), 'b1719ba8-10e9-4a40-babb-6b956bd74fed');
    assert.equal(resolveAgentId('Founding Engineer'), '5938656f-445f-4f41-8351-b745d72cbc04');
    assert.equal(resolveAgentId('selene vale'), '8767955d-87f9-4fa6-a7e5-5a3c24cf6b1c');
  });

  it('returns unknown names as-is', () => {
    assert.equal(resolveAgentId('unknown-agent'), 'unknown-agent');
  });
});

describe('parseLines', () => {
  it('parses key=value output into objects', () => {
    const output = 'id=abc-123 title=Test Issue status=todo priority=high';
    const result = parseLines(output);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'abc-123');
    assert.equal(result[0].title, 'Test Issue');
    assert.equal(result[0].status, 'todo');
    assert.equal(result[0].priority, 'high');
  });

  it('handles multiple lines', () => {
    const output = [
      'id=issue-1 title=First status=todo',
      'id=issue-2 title=Second status=done',
    ].join('\n');
    const result = parseLines(output);
    assert.equal(result.length, 2);
    assert.equal(result[0].id, 'issue-1');
    assert.equal(result[1].id, 'issue-2');
  });

  it('skips empty lines', () => {
    const output = '\n\nid=abc title=Test\n\n';
    const result = parseLines(output);
    assert.equal(result.length, 1);
  });

  it('returns empty array for empty output', () => {
    assert.deepEqual(parseLines(''), []);
    assert.deepEqual(parseLines('\n\n'), []);
  });

  it('handles values with spaces', () => {
    const output = 'id=abc-123 title=My Long Title status=in_progress';
    const result = parseLines(output);
    assert.equal(result[0].title, 'My Long Title');
  });
});

describe('COMMANDS_WITH_COMPANY_ID', () => {
  it('includes issue:list', () => {
    assert.ok(COMMANDS_WITH_COMPANY_ID.has('issue:list'));
  });

  it('includes issue:create', () => {
    assert.ok(COMMANDS_WITH_COMPANY_ID.has('issue:create'));
  });

  it('includes agent:list', () => {
    assert.ok(COMMANDS_WITH_COMPANY_ID.has('agent:list'));
  });

  it('includes dashboard:get', () => {
    assert.ok(COMMANDS_WITH_COMPANY_ID.has('dashboard:get'));
  });

  it('does not include issue:update', () => {
    assert.ok(!COMMANDS_WITH_COMPANY_ID.has('issue:update'));
  });

  it('does not include issue:comment', () => {
    assert.ok(!COMMANDS_WITH_COMPANY_ID.has('issue:comment'));
  });
});

describe('listIssues', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
  });

  it('builds correct args with no filters', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    listIssues();
    const call = mockSpawnSync.mock.calls[0];
    const args = call.arguments[1];
    assert.ok(args.includes('issue'));
    assert.ok(args.includes('list'));
    assert.ok(args.includes('-C'));
  });

  it('adds status filter', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    listIssues({ status: 'blocked' });
    const args = mockSpawnSync.mock.calls[0].arguments[1];
    assert.ok(args.includes('--status'));
    assert.ok(args.includes('blocked'));
  });

  it('resolves agent name in assignee filter', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    listIssues({ assigneeAgentId: 'goldie' });
    const args = mockSpawnSync.mock.calls[0].arguments[1];
    assert.ok(args.includes('--assignee-agent-id'));
    assert.ok(args.includes('b1719ba8-10e9-4a40-babb-6b956bd74fed'));
  });

  it('filters by priority client-side', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0,
      stdout: 'id=1 priority=critical title=A\nid=2 priority=high title=B\nid=3 priority=critical title=C',
      stderr: '',
    }));
    const result = listIssues({ priority: 'critical' });
    assert.equal(result.length, 2);
    assert.ok(result.every(i => i.priority === 'critical'));
  });

  it('respects limit', () => {
    const lines = Array.from({ length: 10 }, (_, i) =>
      `id=${i} title=Issue${i} status=todo`
    ).join('\n');
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: lines, stderr: '',
    }));
    const result = listIssues({ limit: 3 });
    assert.equal(result.length, 3);
  });

  it('throws on CLI error', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 1, stdout: '', stderr: 'connection refused',
    }));
    assert.throws(() => listIssues(), /paperclip CLI error/);
  });
});

describe('createIssue', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
  });

  it('builds args with all options', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: 'created', stderr: '',
    }));
    createIssue({
      title: 'Test Issue',
      body: 'Description here',
      assigneeAgentId: 'goldie',
      priority: 'critical',
      projectId: 'proj-1',
    });
    const args = mockSpawnSync.mock.calls[0].arguments[1];
    assert.ok(args.includes('--title'));
    assert.ok(args.includes('Test Issue'));
    assert.ok(args.includes('--description'));
    assert.ok(args.includes('Description here'));
    assert.ok(args.includes('--assignee-agent-id'));
    assert.ok(args.includes('b1719ba8-10e9-4a40-babb-6b956bd74fed'));
    assert.ok(args.includes('--priority'));
    assert.ok(args.includes('critical'));
    assert.ok(args.includes('--project-id'));
    assert.ok(args.includes('proj-1'));
    assert.ok(args.includes('-C'));
  });

  it('omits optional fields when not provided', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: 'created', stderr: '',
    }));
    createIssue({ title: 'Minimal Issue' });
    const args = mockSpawnSync.mock.calls[0].arguments[1];
    assert.ok(args.includes('--title'));
    assert.ok(!args.includes('--description'));
    assert.ok(!args.includes('--assignee-agent-id'));
    assert.ok(!args.includes('--project-id'));
  });
});

describe('updateIssue', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
  });

  it('does not append -C (not in COMMANDS_WITH_COMPANY_ID)', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: 'updated', stderr: '',
    }));
    updateIssue('issue-123', { status: 'done' });
    const args = mockSpawnSync.mock.calls[0].arguments[1];
    assert.ok(!args.includes('-C'));
    assert.ok(args.includes('issue-123'));
    assert.ok(args.includes('--status'));
    assert.ok(args.includes('done'));
  });
});

describe('closeIssue', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
  });

  it('delegates to updateIssue with status=done', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: 'updated', stderr: '',
    }));
    closeIssue('issue-456');
    const args = mockSpawnSync.mock.calls[0].arguments[1];
    assert.ok(args.includes('issue-456'));
    assert.ok(args.includes('--status'));
    assert.ok(args.includes('done'));
  });
});

describe('getDashboard', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
  });

  it('parses JSON output', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0,
      stdout: JSON.stringify({ tasks: { open: 5, done: 10 } }),
      stderr: '',
    }));
    const result = getDashboard();
    assert.equal(result.tasks.open, 5);
    assert.equal(result.tasks.done, 10);
  });

  it('returns empty object on invalid JSON', () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: 'not json', stderr: '',
    }));
    const result = getDashboard();
    assert.deepEqual(result, {});
  });
});

describe('wakeupAgent', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('calls the correct API endpoint with resolved agent ID', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => ({
      ok: true,
      json: async () => ({ success: true }),
    }));

    await wakeupAgent('goldie', 'Time to work');

    const call = fetchMock.mock.calls[0];
    assert.ok(call.arguments[0].includes('/api/agents/b1719ba8-10e9-4a40-babb-6b956bd74fed/wakeup'));
    const body = JSON.parse(call.arguments[1].body);
    assert.equal(body.reason, 'Time to work');
  });

  it('throws on non-ok response', async () => {
    mock.method(globalThis, 'fetch', async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    }));

    await assert.rejects(
      () => wakeupAgent('goldie', 'test'),
      /Paperclip API.*failed 500/,
    );
  });
});
