import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

process.env.PAPERCLIP_CLI = '/usr/bin/paperclipai';
process.env.COMPANY_ID = 'test-company-id';
process.env.CEO_AGENT_ID = 'ceo-uuid';

mock.module('child_process', {
  namedExports: { spawnSync: mock.fn(() => ({ status: 0, stdout: '', stderr: '' })) },
});

const {
  _isAgentProposal: isAgentProposal,
  _escapeMarkdown: escapeMarkdown,
} = await import('../notifier.mjs');

describe('isAgentProposal', () => {
  it('detects "create agent" in title', () => {
    assert.ok(isAgentProposal({ title: 'Create new agent for encoding' }));
  });

  it('detects "new agent" in title', () => {
    assert.ok(isAgentProposal({ title: 'New agent needed for monitoring' }));
  });

  it('detects "propose agent" in title', () => {
    assert.ok(isAgentProposal({ title: 'Propose agent for content pipeline' }));
  });

  it('detects "agent proposal" in title', () => {
    assert.ok(isAgentProposal({ title: 'Agent proposal: Media Encoder' }));
  });

  it('detects "spin up agent" in title', () => {
    assert.ok(isAgentProposal({ title: 'Spin up agent for QA testing' }));
  });

  it('detects patterns in body when title does not match', () => {
    assert.ok(isAgentProposal({ title: 'Task', body: 'We need to create a new agent for this' }));
  });

  it('is case-insensitive', () => {
    assert.ok(isAgentProposal({ title: 'CREATE NEW AGENT' }));
    assert.ok(isAgentProposal({ title: 'New Agent Proposal' }));
  });

  it('returns false for non-proposal issues', () => {
    assert.ok(!isAgentProposal({ title: 'Fix encoding pipeline' }));
    assert.ok(!isAgentProposal({ title: 'Update agent configuration' }));
    assert.ok(!isAgentProposal({ title: 'Agent is in error state' }));
  });

  it('handles missing title and body', () => {
    assert.ok(!isAgentProposal({}));
    assert.ok(!isAgentProposal({ title: '' }));
    assert.ok(!isAgentProposal({ title: null, body: null }));
  });
});

describe('escapeMarkdown', () => {
  it('escapes special Telegram MarkdownV2 characters', () => {
    assert.equal(escapeMarkdown('hello_world'), 'hello\\_world');
    assert.equal(escapeMarkdown('*bold*'), '\\*bold\\*');
    assert.equal(escapeMarkdown('[link](url)'), '\\[link\\]\\(url\\)');
  });

  it('escapes dots, dashes, and exclamation marks', () => {
    assert.equal(escapeMarkdown('v1.2.3'), 'v1\\.2\\.3');
    assert.equal(escapeMarkdown('high-priority'), 'high\\-priority');
    assert.equal(escapeMarkdown('Alert!'), 'Alert\\!');
  });

  it('escapes backticks and tildes', () => {
    assert.equal(escapeMarkdown('`code`'), '\\`code\\`');
    assert.equal(escapeMarkdown('~strike~'), '\\~strike\\~');
  });

  it('escapes hash and plus', () => {
    assert.equal(escapeMarkdown('#heading'), '\\#heading');
    assert.equal(escapeMarkdown('+add'), '\\+add');
  });

  it('escapes pipes and braces', () => {
    assert.equal(escapeMarkdown('a|b'), 'a\\|b');
    assert.equal(escapeMarkdown('{obj}'), '\\{obj\\}');
  });

  it('handles empty and null input', () => {
    assert.equal(escapeMarkdown(''), '');
    assert.equal(escapeMarkdown(null), '');
    assert.equal(escapeMarkdown(undefined), '');
  });

  it('leaves alphanumeric text unchanged', () => {
    assert.equal(escapeMarkdown('hello world 123'), 'hello world 123');
  });

  it('handles multiple special chars in sequence', () => {
    const input = '*_[test]_*';
    const escaped = escapeMarkdown(input);
    assert.equal(escaped, '\\*\\_\\[test\\]\\_\\*');
  });
});
