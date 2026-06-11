/**
 * LiteLLM client — OpenAI-compatible, routes through port 9000
 * Hardened: request timeout (a hung fetch used to hang a whole loop cycle)
 * and one retry with backoff on transient failures.
 */

const BASE_URL = process.env.LITELLM_BASE_URL;
const API_KEY = process.env.LITELLM_API_KEY;
const MODEL = process.env.LITELLM_MODEL || 'llm-kimi';
const TIMEOUT_MS = parseInt(process.env.LITELLM_TIMEOUT_MS || '120000');

export async function chat(messages, { model = MODEL, maxTokens = 4096, retries = 1 } = {}) {
  if (!BASE_URL) {
    throw new Error('LITELLM_BASE_URL is not set — check .env (see .env.example)');
  }

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`LiteLLM error ${res.status}: ${err.slice(0, 300)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content == null) {
        throw new Error('LiteLLM returned no content');
      }
      return content;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const backoff = 2000 * (attempt + 1);
        console.error(`[llm] attempt ${attempt + 1} failed (${err.message}), retrying in ${backoff}ms`);
        await new Promise(r => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr;
}
