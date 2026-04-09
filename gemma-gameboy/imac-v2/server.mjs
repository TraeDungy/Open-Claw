import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.GEMMA_PORT || 7777;
const LLAMA_URL = process.env.LLAMA_URL || 'http://localhost:8080';
const RUNNER_URL = process.env.RUNNER_URL || 'http://localhost:7070';
const MODEL = process.env.GEMMA_MODEL || 'gemma-2-2b-it';
const MACHINE_NAME = process.env.MACHINE_NAME || 'MACKS-IMAC';

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
    res.end(JSON.stringify({ model: MODEL, machine: MACHINE_NAME, runner: RUNNER_URL }));
    return;
  }

  // === Tool execution endpoint ===
  if (req.method === 'POST' && req.url === '/tool') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { tool, args } = JSON.parse(body);

    try {
      let result;
      switch (tool) {
        case 'shell':
          result = await runTask('shell', { command: args.command });
          break;
        case 'applescript':
          result = await runTask('applescript', { script: args.script });
          break;
        case 'screenshot':
          result = await runTask('screenshot', {});
          break;
        case 'system_info':
          result = await runTask('system_info', {});
          break;
        case 'running_apps':
          result = await runTask('running_apps', {});
          break;
        case 'kill_app':
          result = await runTask('kill_app', { name: args.name });
          break;
        case 'open_url':
          result = await runTask('open_url', { url: args.url });
          break;
        case 'notify':
          result = await runTask('notify', { title: args.title, message: args.message });
          break;
        case 'clipboard':
          result = await runTask('clipboard', { action: args.action, text: args.text });
          break;
        case 'desktop_list':
          result = await runTask('shell', { command: 'ls -la ~/Desktop/' });
          break;
        case 'desktop_organize':
          result = await runTask('shell', {
            command: `cd ~/Desktop && mkdir -p Documents Images Videos Music Archives Code Other Screenshots && \
find . -maxdepth 1 \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.bmp" -o -name "*.tiff" -o -name "*.svg" -o -name "*.webp" -o -name "*.heic" \\) | while IFS= read -r f; do mv "$f" Images/ 2>/dev/null && echo "-> Images: $f"; done && \
find . -maxdepth 1 \\( -name "*.pdf" -o -name "*.doc" -o -name "*.docx" -o -name "*.txt" -o -name "*.rtf" -o -name "*.pages" -o -name "*.xlsx" -o -name "*.csv" \\) | while IFS= read -r f; do mv "$f" Documents/ 2>/dev/null && echo "-> Documents: $f"; done && \
find . -maxdepth 1 \\( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.mkv" -o -name "*.wmv" -o -name "*.flv" -o -name "*.m4v" \\) | while IFS= read -r f; do mv "$f" Videos/ 2>/dev/null && echo "-> Videos: $f"; done && \
find . -maxdepth 1 \\( -name "*.mp3" -o -name "*.wav" -o -name "*.aac" -o -name "*.flac" -o -name "*.m4a" -o -name "*.ogg" \\) | while IFS= read -r f; do mv "$f" Music/ 2>/dev/null && echo "-> Music: $f"; done && \
find . -maxdepth 1 \\( -name "*.zip" -o -name "*.tar" -o -name "*.gz" -o -name "*.rar" -o -name "*.7z" -o -name "*.dmg" \\) | while IFS= read -r f; do mv "$f" Archives/ 2>/dev/null && echo "-> Archives: $f"; done && \
find . -maxdepth 1 \\( -name "*.js" -o -name "*.py" -o -name "*.sh" -o -name "*.json" -o -name "*.html" -o -name "*.css" -o -name "*.ts" -o -name "*.mjs" \\) | while IFS= read -r f; do mv "$f" Code/ 2>/dev/null && echo "-> Code: $f"; done && \
echo "Desktop organized" && ls ~/Desktop/`
          });
          break;
        case 'disk_usage':
          result = await runTask('shell', { command: 'df -h / && echo "---" && du -sh ~/Desktop ~/Documents ~/Downloads 2>/dev/null' });
          break;
        case 'empty_trash':
          result = await runTask('applescript', { script: 'tell application "Finder" to empty the trash' });
          break;
        case 'downloads_cleanup':
          result = await runTask('shell', {
            command: 'find ~/Downloads -type f -mtime +30 -exec ls -lh {} \\; | head -20 && echo "---" && find ~/Downloads -type f -mtime +30 | wc -l | xargs echo "Files older than 30 days:"'
          });
          break;
        default:
          result = { error: `Unknown tool: ${tool}` };
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // === Agent chat endpoint — Gemma calls tools, server executes, loops ===
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { messages } = JSON.parse(body);

    const SYSTEM_PROMPT = {
      role: 'system',
      content: `You control this iMac. Run commands in code blocks:

\`\`\`shell
ls ~/Desktop
\`\`\`

Home: /Users/newowner. Use find for files with spaces:
find ~/Desktop -maxdepth 1 -name "*.png" | while IFS= read -r f; do mv "$f" ~/Desktop/Images/; done

Common tasks:
- Organize desktop: mkdir -p folders, then find+mv by extension
- List files: ls -la ~/Desktop/
- Disk: df -h /
- Apps: ps aux | grep /Applications
- Kill app: killall AppName
- System: top -l 1 | head -10

Be brief. Do it, don't just describe it.`
    };

    const fewShot = [
      { role: 'user', content: 'list my desktop' },
      { role: 'assistant', content: '```shell\nls -la ~/Desktop/\n```' },
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const agentMessages = [SYSTEM_PROMPT, ...fewShot, ...messages];
    const MAX_LOOPS = 5;

    for (let loop = 0; loop < MAX_LOOPS; loop++) {
      // Stream Gemma's response, collecting full text to detect tool calls
      let fullText = '';
      try {
        fullText = await streamLlama(agentMessages, res);
      } catch (e) {
        res.write(`data: ${JSON.stringify({ token: `\n[ERROR: ${e.message}]` })}\n\n`);
        break;
      }

      // Extract tool calls from code blocks: ```shell\n...\n``` or ```applescript\n...\n```
      // Also supports <tool>type: cmd</tool> format as fallback
      const toolCalls = [];
      const codeBlockRegex = /```(shell|applescript|bash|tool_code|tool)\n([\s\S]*?)```/g;
      let match;
      while ((match = codeBlockRegex.exec(fullText)) !== null) {
        const lang = match[1].trim().toLowerCase();
        const cmd = match[2].trim();
        if (cmd) {
          const tool = (lang === 'applescript') ? 'applescript' : 'shell';
          toolCalls.push({ tool, arg: cmd });
        }
      }
      // Fallback: <tool>type: cmd</tool>
      const xmlRegex = /<tool>(.*?): ([\s\S]*?)<\/tool>/g;
      while ((match = xmlRegex.exec(fullText)) !== null) {
        toolCalls.push({ tool: match[1].trim().toLowerCase(), arg: match[2].trim() });
      }

      if (toolCalls.length === 0) break;

      agentMessages.push({ role: 'assistant', content: fullText });

      let toolResults = '';
      for (const tc of toolCalls) {
        res.write(`data: ${JSON.stringify({ toolCall: { tool: tc.tool, arg: tc.arg } })}\n\n`);

        let result;
        try {
          switch (tc.tool) {
            case 'shell':
              result = await runTask('shell', { command: tc.arg });
              break;
            case 'applescript':
              result = await runTask('applescript', { script: tc.arg });
              break;
            case 'open':
              result = await runTask('open_url', { url: tc.arg });
              break;
            case 'notify': {
              const [title, ...mp] = tc.arg.split('|');
              result = await runTask('notify', { title: title.trim(), message: (mp.join('|') || '').trim() });
              break;
            }
            case 'kill':
              result = await runTask('kill_app', { name: tc.arg });
              break;
            case 'clipboard':
              result = tc.arg.toLowerCase() === 'read'
                ? await runTask('clipboard', { action: 'read' })
                : await runTask('clipboard', { action: 'write', text: tc.arg });
              break;
            default:
              result = { error: `Unknown tool: ${tc.tool}` };
          }
        } catch (e) {
          result = { error: e.message };
        }

        const output = result.output || result.stdout || result.error || JSON.stringify(result);
        toolResults += `[${tc.tool}]: ${output}\n`;
        res.write(`data: ${JSON.stringify({ toolResult: { tool: tc.tool, output } })}\n\n`);
      }

      agentMessages.push({ role: 'user', content: `Results:\n${toolResults}\nContinue or summarize. Don't repeat succeeded commands.` });
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // Stream llama.cpp response, forwarding tokens to SSE, returning full text
  function streamLlama(messages, sseRes) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 512,
      });

      let fullText = '';
      const llamaReq = http.request(`${LLAMA_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (llamaRes) => {
        let buffer = '';
        llamaRes.on('data', (chunk) => {
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
                // Don't show <tool> tags raw — strip them from display
                const clean = token.replace(/<\/?tool>/g, '');
                if (clean) sseRes.write(`data: ${JSON.stringify({ token: clean })}\n\n`);
              }
            } catch {}
          }
        });
        llamaRes.on('end', () => resolve(fullText));
        llamaRes.on('error', reject);
      });
      llamaReq.on('error', reject);
      llamaReq.setTimeout(300000, () => { llamaReq.destroy(); reject(new Error('LLM timeout')); });
      llamaReq.write(payload);
      llamaReq.end();
    });
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
  console.log(`\n  GEMMA BOY v2  [${MACHINE_NAME}]`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  LLM: ${LLAMA_URL}`);
  console.log(`  Runner: ${RUNNER_URL}`);
  console.log(`  UI: http://0.0.0.0:${PORT}\n`);
});
