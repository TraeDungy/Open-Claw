/**
 * LiteLLM client — OpenAI-compatible, routes through port 9000
 */

const BASE_URL = process.env.LITELLM_BASE_URL;
const API_KEY = process.env.LITELLM_API_KEY;
const MODEL = process.env.LITELLM_MODEL || 'llm-kimi';

export async function chat(messages, { model = MODEL, maxTokens = 4096 } = {}) {
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
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LiteLLM error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
