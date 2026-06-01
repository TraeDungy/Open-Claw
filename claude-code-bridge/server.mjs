/**
 * Claude Code Bridge — OpenAI-compatible HTTP server
 * Routes LiteLLM model calls through local `claude --print` subprocess
 * Claude Code is exempt from Anthropic's April 4 third-party harness restriction
 *
 * Port: 8899
 * Tailscale: VPS reaches MacBook at 100.83.6.87:8899
 */

import http from 'http';
import { spawn } from 'child_process';

const PORT = 8899;
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN || 'claude-code-bridge-local';
const CLAUDE_BIN = process.env.CLAUDE_BIN || '/Users/trialxfire/.local/bin/claude';

// Model name → claude --model arg
const MODEL_MAP = {
  'claude-sonnet-4-6':         'claude-sonnet-4-6',
  'claude-opus-4-6':           'claude-opus-4-6',
  'claude-haiku-4-5':          'claude-haiku-4-5-20251001',
  'claude-sonnet':             'claude-sonnet-4-6',
  'claude-opus':               'claude-opus-4-6',
  'claude-haiku':              'claude-haiku-4-5-20251001',
  'llm-claude-sonnet':         'claude-sonnet-4-6',
  'llm-claude-opus':           'claude-opus-4-6',
  'llm-claude-haiku':          'claude-haiku-4-5-20251001',
};

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// Convert OpenAI messages array to a single prompt string for claude -p
function messagesToPrompt(messages) {
  if (!messages || messages.length === 0) return '';

  // If only one user message, send it directly
  if (messages.length === 1 && messages[0].role === 'user') {
    return typeof messages[0].content === 'string'
      ? messages[0].content
      : messages[0].content.map(c => c.text || '').join('\n');
  }

  // Multi-turn: format as conversation
  return messages.map(m => {
    const role = m.role === 'assistant' ? 'Assistant' : m.role === 'system' ? 'System' : 'Human';
    const content = typeof m.content === 'string'
      ? m.content
      : m.content.map(c => c.text || '').join('\n');
    return `${role}: ${content}`;
  }).join('\n\n') + '\n\nAssistant:';
}

function runClaude(prompt, model, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const modelArg = MODEL_MAP[model] || 'claude-sonnet-4-6';
    const args = ['--print', '--model', modelArg, prompt];

    log(`Spawning: ${CLAUDE_BIN} --print --model ${modelArg} [${prompt.length} chars]`);

    const proc = spawn(CLAUDE_BIN, args, {
      env: { ...process.env, HOME: '/Users/trialxfire' },
      timeout: timeoutMs,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Claude timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.on('close', code => {
      clearTimeout(timer);
      if (code !== 0 && !stdout) {
        reject(new Error(`Claude exited ${code}: ${stderr.slice(0, 200)}`));
      } else {
        resolve(stdout.trim());
      }
    });

    proc.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function makeOpenAIResponse(content, model) {
  const id = `chatcmpl-cc-${Date.now()}`;
  return {
    id,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: MODEL_MAP[model] || model,
    choices: [{
      index: 0,
      message: { role: 'assistant', content },
      finish_reason: 'stop',
    }],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}

const server = http.createServer(async (req, res) => {
  // Auth check
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (token !== BRIDGE_TOKEN) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bridge: 'claude-code', bin: CLAUDE_BIN }));
    return;
  }

  // Models list (LiteLLM probes this)
  if (req.method === 'GET' && req.url === '/v1/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      object: 'list',
      data: Object.keys(MODEL_MAP).map(id => ({
        id, object: 'model', created: 1700000000, owned_by: 'claude-code-bridge',
      })),
    }));
    return;
  }

  // Chat completions
  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { messages, model = 'claude-sonnet-4-6', stream = false } = payload;

        if (stream) {
          // Streaming not supported — LiteLLM will fall back to non-stream
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Streaming not supported by claude-code-bridge' }));
          return;
        }

        const prompt = messagesToPrompt(messages);
        const content = await runClaude(prompt, model);

        log(`Response: ${content.length} chars from model ${model}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(makeOpenAIResponse(content, model)));
      } catch (err) {
        log(`Error: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: err.message, type: 'bridge_error' } }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  log(`Claude Code Bridge listening on 0.0.0.0:${PORT}`);
  log(`Tailscale accessible at 100.83.6.87:${PORT}`);
  log(`Claude binary: ${CLAUDE_BIN}`);
  log(`Token: ${BRIDGE_TOKEN}`);
});

server.on('error', err => {
  console.error('Server error:', err);
  process.exit(1);
});

function shutdown(signal) {
  log(`${signal} received, closing server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
