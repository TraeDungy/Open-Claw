import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.LITELLM_BASE_URL = 'http://localhost:9000/v1';
process.env.LITELLM_API_KEY = 'test-api-key';
process.env.LITELLM_MODEL = 'test-model';

const mockFetch = mock.method(globalThis, 'fetch', async () => ({
  ok: true,
  json: async () => ({
    choices: [{ message: { content: 'LLM response text' } }],
  }),
}));

const { chat } = await import('../llm.mjs');

describe('chat', () => {
  beforeEach(() => {
    mockFetch.mock.resetCalls();
  });

  it('sends correct request to LiteLLM', async () => {
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'test response' } }],
      }),
    }));

    const messages = [
      { role: 'system', content: 'You are a CEO.' },
      { role: 'user', content: 'Status report' },
    ];

    await chat(messages);

    const call = mockFetch.mock.calls[0];
    assert.equal(call.arguments[0], 'http://localhost:9000/v1/chat/completions');

    const opts = call.arguments[1];
    assert.equal(opts.method, 'POST');
    assert.equal(opts.headers['Content-Type'], 'application/json');
    assert.equal(opts.headers['Authorization'], 'Bearer test-api-key');

    const body = JSON.parse(opts.body);
    assert.equal(body.model, 'test-model');
    assert.deepEqual(body.messages, messages);
    assert.equal(body.temperature, 0.3);
    assert.equal(body.max_tokens, 4096);
  });

  it('returns message content from response', async () => {
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'CEO says: all good' } }],
      }),
    }));

    const result = await chat([{ role: 'user', content: 'test' }]);
    assert.equal(result, 'CEO says: all good');
  });

  it('respects custom model and maxTokens', async () => {
    mockFetch.mock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'ok' } }],
      }),
    }));

    await chat(
      [{ role: 'user', content: 'test' }],
      { model: 'custom-model', maxTokens: 500 },
    );

    const body = JSON.parse(mockFetch.mock.calls[0].arguments[1].body);
    assert.equal(body.model, 'custom-model');
    assert.equal(body.max_tokens, 500);
  });

  it('throws on non-ok response with status code', async () => {
    mockFetch.mock.mockImplementation(async () => ({
      ok: false,
      status: 429,
      text: async () => 'Rate limited',
    }));

    await assert.rejects(
      () => chat([{ role: 'user', content: 'test' }]),
      /LiteLLM error 429: Rate limited/,
    );
  });

  it('throws on server error', async () => {
    mockFetch.mock.mockImplementation(async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    }));

    await assert.rejects(
      () => chat([{ role: 'user', content: 'test' }]),
      /LiteLLM error 500/,
    );
  });
});
