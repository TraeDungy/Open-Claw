import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.PAPERCLIP_CLI = '/usr/bin/paperclipai';
process.env.COMPANY_ID = 'test-company-id';
process.env.LITELLM_BASE_URL = 'http://localhost:9000/v1';
process.env.LITELLM_API_KEY = 'test-key';
process.env.LITELLM_MODEL = 'test-model';

const mockSpawnSync = mock.fn(() => ({
  status: 0,
  stdout: '',
  stderr: '',
}));

mock.module('child_process', {
  namedExports: { spawnSync: mockSpawnSync },
});

const mockFetch = mock.method(globalThis, 'fetch', async () => ({
  ok: true,
  json: async () => ({
    choices: [{ message: { content: 'Daily digest content here' } }],
  }),
}));

const { generateDigest } = await import('../digest.mjs');

describe('generateDigest', () => {
  beforeEach(() => {
    mockSpawnSync.mock.resetCalls();
    mockFetch.mock.resetCalls();
  });

  it('returns LLM-generated digest string', async () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Revenue on track. Pipeline 80% complete.' } }],
      }),
    }));

    const result = await generateDigest();
    assert.equal(result, 'Revenue on track. Pipeline 80% complete.');
  });

  it('calls Paperclip for multiple issue statuses', async () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'digest' } }],
      }),
    }));

    await generateDigest();

    // Should call spawnSync multiple times for listIssues, listAgents, getDashboard
    assert.ok(mockSpawnSync.mock.calls.length >= 5, `Expected 5+ CLI calls, got ${mockSpawnSync.mock.calls.length}`);
  });

  it('includes all 5 initiatives in the LLM prompt', async () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'digest' } }],
      }),
    }));

    await generateDigest();

    const fetchBody = JSON.parse(mockFetch.mock.calls[0].arguments[1].body);
    const prompt = fetchBody.messages[0].content;
    assert.ok(prompt.includes('Revenue targets'), 'Missing revenue targets');
    assert.ok(prompt.includes('Platform launches'), 'Missing platform launches');
    assert.ok(prompt.includes('Content pipeline'), 'Missing content pipeline');
    assert.ok(prompt.includes('Social media'), 'Missing social media');
    assert.ok(prompt.includes('Priority issues'), 'Missing priority issues');
  });

  it('propagates LLM errors', async () => {
    mockSpawnSync.mock.mockImplementation(() => ({
      status: 0, stdout: '', stderr: '',
    }));
    mockFetch.mock.mockImplementation(async () => ({
      ok: false,
      status: 500,
      text: async () => 'Service down',
    }));

    await assert.rejects(() => generateDigest(), /LiteLLM error 500/);
  });
});
