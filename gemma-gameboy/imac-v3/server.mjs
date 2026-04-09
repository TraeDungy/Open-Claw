import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.GEMMA_PORT || 7777;
const LLAMA_URL = process.env.LLAMA_URL || 'http://localhost:8080';
const RUNNER_URL = process.env.RUNNER_URL || 'http://localhost:7070';
const MODEL_NAME = process.env.MODEL_NAME || 'qwen2.5-1.5b';
const MACHINE_NAME = process.env.MACHINE_NAME || 'MACKS-IMAC';

// === Tools definition (Hermes-3 ChatML native format) ===
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'shell',
      description: 'Run a shell command on this Mac. Use for file operations, listing directories, moving files, checking disk, running scripts. Always quote paths with spaces. Home dir: /Users/newowner.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The bash command to execute' }
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'applescript',
      description: 'Run AppleScript for macOS automation — control Finder, apps, dialogs, system preferences.',
      parameters: {
        type: 'object',
        properties: {
          script: { type: 'string', description: 'The AppleScript code to execute' }
        },
        required: ['script']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'open_app',
      description: 'Open a URL in the browser or launch an application by name.',
      parameters: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'URL or application name to open' }
        },
        required: ['target']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'notify',
      description: 'Send a macOS desktop notification.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Notification title' },
          message: { type: 'string', description: 'Notification body text' }
        },
        required: ['title', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'kill_app',
      description: 'Quit or force-kill a running application.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Application name to kill' }
        },
        required: ['name']
      }
    }
  }
];

const SYSTEM_PROMPT = `You are a computer agent. You act by running shell commands in code blocks.

RULES:
1. ALWAYS run commands — never just describe what to do.
2. First, list files to see what exists. Then act on what you see.
3. Use find for files with spaces: find ~/Desktop -maxdepth 1 -name "*.jpg" | while IFS= read -r f; do mv "$f" ~/Desktop/Images/; done
4. After moving files, run ls to verify.

Desktop sort rules: .jpg/.png/.gif → Images, .pdf/.doc/.docx → Documents, .py/.js/.sh → Code, .mp4/.mov → Videos, .mp3/.wav → Music, .zip/.dmg → Archives

Home: /Users/newowner. Run commands like this:
\`\`\`shell
ls ~/Desktop/
\`\`\``;

// === Nano Claw Runner proxy ===
async function runTask(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ type, ...payload });
    const req = http.request(`${RUNNER_URL}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve({ output: body }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

// === SAFETY LAYER ===
// Commands that are NEVER allowed, regardless of context
const BLOCKED_PATTERNS = [
  /\brm\s+(-[a-zA-Z]*)?r/i,          // rm -r, rm -rf, rm -Rf, etc.
  /\brm\s+(-[a-zA-Z]*\s+)?[~\/]/,    // rm ~/anything, rm /anything
  /\brm\s+(-[a-zA-Z]*\s+)?\*/,       // rm *, rm -f *
  /\bmkfs\b/i,                         // format disk
  /\bdd\s+if=/i,                       // disk destroyer
  /\b:\(\)\s*\{/,                      // fork bomb
  /\bchmod\s+(-[a-zA-Z]*\s+)?777/,    // world-writable
  /\bchmod\s+(-[a-zA-Z]*\s+)?666/,    // world-writable files
  /\bchown\s+(-[a-zA-Z]*\s+)?root/,   // take ownership as root
  /\bcurl\b.*\|/i,                      // pipe curl to anything
  /\bwget\b.*\|/i,                     // pipe wget to anything
  /\bsudo\b/i,                         // no sudo
  /\bsu\s+/i,                          // no su
  /\b>\s*\/dev\/s/,                    // write to devices
  /\bkill\s+-9\s+1\b/,                // kill init/launchd
  /\bkillall\s+-9\s/,                  // force kill all
  /\breboot\b/i,                       // reboot
  /\bshutdown\b/i,                     // shutdown
  /\bhalt\b/i,                         // halt
  /\blaunchctl\s+(un)?load/i,          // mess with services
  /\bnohup\b.*&/,                      // background persistent processes
  /\bssh\b/i,                          // no SSH from agent
  /\bscp\b/i,                          // no SCP from agent
  /\bnc\s+-/i,                         // netcat
  /\bopen\s+.*\.app.*--args/i,         // app with args injection
];

// Paths that must NEVER be targets of write/delete operations
const PROTECTED_PATHS = [
  /^\/System\b/,
  /^\/Library\b/,
  /^\/usr\b/,
  /^\/bin\b/,
  /^\/sbin\b/,
  /^\/private\/etc\b/,
  /^\/var\b/,
  /^~\/Library\b/,
  /^~\/\.ssh\b/,
  /^~\/\.nvm\b/,
  /^~\/\.claude\b/,
  /^\/Users\/newowner\/Library\b/,
  /^\/Users\/newowner\/\.ssh\b/,
];

// Commands that require confirmation (returned as warnings, not blocked)
const WARN_PATTERNS = [
  { pattern: /\brm\b/, msg: 'DELETE operation' },
  { pattern: /\bmv\b.*\/(Documents|Downloads|Pictures|Music)\b/, msg: 'Moving system folder contents' },
  { pattern: /\bkillall\b/, msg: 'Kill all instances of an app' },
  { pattern: /empty.*trash/i, msg: 'Empty trash (permanent)' },
];

function checkCommandSafety(command) {
  if (!command || typeof command !== 'string') {
    return { allowed: false, reason: 'Empty command' };
  }

  // FIRST: check the FULL command string (catches pipes, chains)
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return {
        allowed: false,
        reason: `BLOCKED: "${command.substring(0, 80)}" matches safety rule: ${pattern}`,
      };
    }
  }

  // THEN: check each sub-command after splitting
  const lines = command.split(/[;\n&]+/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(line)) {
        return {
          allowed: false,
          reason: `BLOCKED: "${line.substring(0, 80)}" matches safety rule: ${pattern}`,
        };
      }
    }

    // Check protected paths for write operations
    if (/\b(rm|mv|cp|chmod|chown|cat\s*>|echo\s*>|>\s*)\b/.test(line)) {
      for (const pathPattern of PROTECTED_PATHS) {
        if (pathPattern.test(line)) {
          return {
            allowed: false,
            reason: `BLOCKED: Write/delete to protected path in "${line.substring(0, 80)}"`,
          };
        }
      }
    }
  }

  // Check for warnings (allowed but flagged)
  const warnings = [];
  for (const { pattern, msg } of WARN_PATTERNS) {
    if (pattern.test(command)) warnings.push(msg);
  }

  return { allowed: true, warnings };
}

function checkAppleScriptSafety(script) {
  if (!script || typeof script !== 'string') {
    return { allowed: false, reason: 'Empty script' };
  }

  const lower = script.toLowerCase();

  // Block dangerous AppleScript patterns
  if (/do shell script/.test(lower) && /rm\s+-r/.test(lower)) {
    return { allowed: false, reason: 'BLOCKED: rm -r via AppleScript do shell script' };
  }
  if (/do shell script/.test(lower) && /sudo/.test(lower)) {
    return { allowed: false, reason: 'BLOCKED: sudo via AppleScript' };
  }
  if (/system events.*keystroke/.test(lower) && /password/.test(lower)) {
    return { allowed: false, reason: 'BLOCKED: Keystroke injection near password field' };
  }

  return { allowed: true, warnings: [] };
}

console.log(`  Safety: ${BLOCKED_PATTERNS.length} blocked patterns, ${PROTECTED_PATHS.length} protected paths`);

// Execute a tool call from the model — WITH SAFETY CHECKS
async function executeTool(name, args) {
  switch (name) {
    case 'shell': {
      const check = checkCommandSafety(args.command);
      if (!check.allowed) {
        console.log(`  SAFETY BLOCKED: ${check.reason}`);
        return { error: `SAFETY: ${check.reason}. Try a safer approach.` };
      }
      if (check.warnings?.length) {
        console.log(`  SAFETY WARNING: ${check.warnings.join(', ')}`);
      }
      return await runTask('shell', { command: args.command });
    }
    case 'applescript': {
      const check = checkAppleScriptSafety(args.script);
      if (!check.allowed) {
        console.log(`  SAFETY BLOCKED: ${check.reason}`);
        return { error: `SAFETY: ${check.reason}. Try a safer approach.` };
      }
      return await runTask('applescript', { script: args.script });
    }
    case 'open_app':
      return await runTask('open_url', { url: args.target });
    case 'notify':
      return await runTask('notify', { title: args.title, message: args.message });
    case 'kill_app':
      return await runTask('kill_app', { name: args.name });
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Stream llama.cpp response, forward tokens to SSE, return full text
function streamLlama(messages, sseRes) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });

    let fullText = '';
    const req = http.request(`${LLAMA_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6).trim();
          if (d === '[DONE]') continue;
          try {
            const parsed = JSON.parse(d);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              fullText += token;
              // Strip tool_call tags from display but keep in fullText for parsing
              const clean = token.replace(/<\/?tool_call>/g, '').replace(/<\/?tool_response>/g, '');
              if (clean.trim()) sseRes.write(`data: ${JSON.stringify({ token: clean })}\n\n`);
            }
          } catch {}
        }
      });
      res.on('end', () => resolve(fullText));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(300000, () => { req.destroy(); reject(new Error('LLM timeout')); });
    req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve UI
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Config
  if (req.method === 'GET' && req.url === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: MODEL_NAME, machine: MACHINE_NAME, runner: RUNNER_URL, tools: TOOLS.map(t => t.function.name) }));
    return;
  }

  // === Direct tool execution (sidebar buttons) ===
  if (req.method === 'POST' && req.url === '/tool') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { tool, args } = JSON.parse(body);
    try {
      const result = await executeTool(tool, args || {});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // === Agent chat — Hermes-3 ChatML tool calling via <tool_call> tags ===
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { messages } = JSON.parse(body);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const agentMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const MAX_LOOPS = 6;

    try {
      for (let loop = 0; loop < MAX_LOOPS; loop++) {
        res.write(`data: ${JSON.stringify({ status: `thinking (step ${loop + 1})...` })}\n\n`);

        // Stream response, collect full text
        let fullText = '';
        try {
          fullText = await streamLlama(agentMessages, res);
        } catch (e) {
          res.write(`data: ${JSON.stringify({ token: `\n[ERROR: ${e.message}]` })}\n\n`);
          break;
        }

        // Extract <tool_call>...</tool_call> blocks (Hermes-3 native format)
        const toolCalls = [];
        const hermesTCRegex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
        let match;
        while ((match = hermesTCRegex.exec(fullText)) !== null) {
          try {
            const parsed = JSON.parse(match[1]);
            const name = parsed.name || parsed.function;
            const args = parsed.arguments || parsed.params || parsed;
            if (name) toolCalls.push({ name, args });
          } catch {
            // Try extracting from malformed JSON
            const nameMatch = match[1].match(/"name"\s*:\s*"(\w+)"/);
            const argsMatch = match[1].match(/"arguments"\s*:\s*({[\s\S]*})/);
            if (nameMatch) {
              let args = {};
              try { args = JSON.parse(argsMatch?.[1] || '{}'); } catch {}
              toolCalls.push({ name: nameMatch[1], args });
            }
          }
        }

        // Also detect ```shell code blocks as fallback
        const codeBlockRegex = /```(shell|bash|applescript)\n([\s\S]*?)```/g;
        while ((match = codeBlockRegex.exec(fullText)) !== null) {
          const lang = match[1].toLowerCase();
          const cmd = match[2].trim();
          if (cmd && toolCalls.length === 0) {
            toolCalls.push({
              name: lang === 'applescript' ? 'applescript' : 'shell',
              args: lang === 'applescript' ? { script: cmd } : { command: cmd },
            });
          }
        }

        if (toolCalls.length === 0) break; // Model is done

        agentMessages.push({ role: 'assistant', content: fullText });

        let toolResultsText = '';
        for (const tc of toolCalls) {
          res.write(`data: ${JSON.stringify({ toolCall: { tool: tc.name, args: tc.args } })}\n\n`);

          let result;
          try {
            result = await executeTool(tc.name, tc.args);
          } catch (e) {
            result = { error: e.message };
          }

          const output = result.output || result.stdout || result.error || JSON.stringify(result);
          res.write(`data: ${JSON.stringify({ toolResult: { tool: tc.name, output } })}\n\n`);
          toolResultsText += `\n<tool_response>\n${output.substring(0, 2000)}\n</tool_response>\n`;
        }

        agentMessages.push({ role: 'user', content: `Tool results:${toolResultsText}\nReview the results. If more work is needed, call another tool. If done, summarize what you did.` });
      }
    } catch (e) {
      res.write(`data: ${JSON.stringify({ token: `\n[ERROR: ${e.message}]` })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // Static files
  const filePath = path.join(__dirname, req.url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  GEMMA BOY v3  [${MACHINE_NAME}]`);
  console.log(`  Model: ${MODEL_NAME}`);
  console.log(`  LLM: ${LLAMA_URL}`);
  console.log(`  Runner: ${RUNNER_URL}`);
  console.log(`  Tools: ${TOOLS.map(t => t.function.name).join(', ')}`);
  console.log(`  UI: http://0.0.0.0:${PORT}\n`);
});
