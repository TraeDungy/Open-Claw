import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

process.env.PAPERCLIP_CLI = '/usr/bin/paperclipai';
process.env.COMPANY_ID = 'test-company-id';
process.env.LITELLM_BASE_URL = 'http://localhost:9000/v1';
process.env.LITELLM_API_KEY = 'test-key';

mock.module('child_process', {
  namedExports: { spawnSync: mock.fn(() => ({ status: 0, stdout: '', stderr: '' })) },
});

const { _parsePMActions: parsePMActions, _PM_CONFIGS: PM_CONFIGS } = await import('../pm-loop.mjs');

describe('parsePMActions', () => {
  it('parses ASSIGN action', () => {
    const text = 'ACTION:ASSIGN {"issueId":"issue-1","agentId":"abc-123","reason":"Best fit for encoding"}';
    const actions = parsePMActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'assign');
    assert.equal(actions[0].issueId, 'issue-1');
    assert.equal(actions[0].agentId, 'abc-123');
    assert.equal(actions[0].reason, 'Best fit for encoding');
  });

  it('parses CREATE action', () => {
    const text = 'ACTION:CREATE {"title":"New task","body":"Details","agentId":"xyz","priority":"high"}';
    const actions = parsePMActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'create');
    assert.equal(actions[0].title, 'New task');
    assert.equal(actions[0].agentId, 'xyz');
  });

  it('parses CLOSE action', () => {
    const text = 'ACTION:CLOSE {"issueId":"issue-done"}';
    const actions = parsePMActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'close');
    assert.equal(actions[0].issueId, 'issue-done');
  });

  it('parses WAKEUP action', () => {
    const text = 'ACTION:WAKEUP {"agentId":"abc","reason":"Pipeline stalled"}';
    const actions = parsePMActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'wakeup');
  });

  it('parses ESCALATE_CEO action', () => {
    const text = 'ACTION:ESCALATE_CEO Need budget approval for R2 migration';
    const actions = parsePMActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'escalate_ceo');
    assert.equal(actions[0].message, 'Need budget approval for R2 migration');
  });

  it('parses multiple mixed actions', () => {
    const text = `Domain looks good.
ACTION:ASSIGN {"issueId":"i-1","agentId":"a-1","reason":"r"}
ACTION:CREATE {"title":"t","body":"b","agentId":"a-2","priority":"medium"}
ACTION:WAKEUP {"agentId":"a-3","reason":"idle"}
ACTION:ESCALATE_CEO blocked on external API`;
    const actions = parsePMActions(text);
    assert.equal(actions.length, 4);
    assert.equal(actions[0].type, 'assign');
    assert.equal(actions[1].type, 'create');
    assert.equal(actions[2].type, 'wakeup');
    assert.equal(actions[3].type, 'escalate_ceo');
  });

  it('skips malformed JSON gracefully', () => {
    const text = `ACTION:ASSIGN {not valid}
ACTION:CLOSE {"issueId":"valid"}`;
    const actions = parsePMActions(text);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].type, 'close');
  });

  it('returns empty for NO_ACTION_NEEDED', () => {
    assert.deepEqual(parsePMActions('NO_ACTION_NEEDED'), []);
  });
});

describe('PM_CONFIGS', () => {
  it('defines 4 PM configurations', () => {
    assert.equal(PM_CONFIGS.length, 4);
  });

  it('each PM has required fields', () => {
    for (const pm of PM_CONFIGS) {
      assert.ok(pm.name, `PM missing name`);
      assert.ok(pm.agentId, `${pm.name} missing agentId`);
      assert.ok(pm.role, `${pm.name} missing role`);
      assert.ok(Array.isArray(pm.keywords), `${pm.name} keywords not array`);
      assert.ok(pm.keywords.length > 0, `${pm.name} has no keywords`);
      assert.ok(typeof pm.team === 'object', `${pm.name} team not object`);
      assert.ok(Object.keys(pm.team).length > 0, `${pm.name} has no team`);
      assert.ok(pm.intervalMs > 0, `${pm.name} missing intervalMs`);
      assert.ok(pm.startDelayMs >= 0, `${pm.name} missing startDelayMs`);
    }
  });

  it('PMs have staggered start delays', () => {
    const delays = PM_CONFIGS.map(c => c.startDelayMs);
    for (let i = 1; i < delays.length; i++) {
      assert.ok(delays[i] > delays[i - 1], `PM ${PM_CONFIGS[i].name} delay not staggered`);
    }
  });

  it('includes expected PM names', () => {
    const names = PM_CONFIGS.map(c => c.name);
    assert.ok(names.includes('Empire PM'));
    assert.ok(names.includes('Media PM'));
    assert.ok(names.includes('Revenue Ops'));
    assert.ok(names.includes('SaaS PM'));
  });

  it('Empire PM keywords include FAST channel terms', () => {
    const empire = PM_CONFIGS.find(c => c.name === 'Empire PM');
    assert.ok(empire.keywords.includes('tubi'));
    assert.ok(empire.keywords.includes('pluto'));
    assert.ok(empire.keywords.includes('plex'));
    assert.ok(empire.keywords.includes('fast'));
  });

  it('all agent UUIDs are valid format', () => {
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const pm of PM_CONFIGS) {
      assert.ok(uuidRe.test(pm.agentId), `${pm.name} agentId invalid: ${pm.agentId}`);
      for (const [name, id] of Object.entries(pm.team)) {
        assert.ok(uuidRe.test(id), `${pm.name} team member ${name} has invalid UUID: ${id}`);
      }
    }
  });
});
