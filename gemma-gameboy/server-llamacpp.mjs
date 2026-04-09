import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.GEMMA_PORT || 7777;
const LLAMA_URL = process.env.LLAMA_URL || 'http://localhost:8080';
const MODEL = process.env.GEMMA_MODEL || 'gemma-2-2b-it';
const MACHINE_NAME = process.env.MACHINE_NAME || 'UNKNOWN';

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && req.url === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: MODEL, machine: MACHINE_NAME, ollamaUrl: LLAMA_URL }));
    return;
  }

  // Chat endpoint — adapts to llama.cpp /v1/chat/completions streaming
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { messages } = JSON.parse(body);

    const payload = JSON.stringify({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 512,
    });

    const llamaReq = http.request(`${LLAMA_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (llamaRes) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      let buffer = '';
      llamaRes.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
          } catch {}
        }
      });
      llamaRes.on('end', () => res.end());
      llamaRes.on('error', (e) => {
        res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
        res.end();
      });
    });

    llamaReq.on('error', (e) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `llama.cpp unreachable: ${e.message}` }));
    });

    llamaReq.write(payload);
    llamaReq.end();
    return;
  }

  const filePath = path.join(__dirname, req.url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  GEMMA GAMEBOY  [${MACHINE_NAME}]`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  Backend: ${LLAMA_URL} (llama.cpp)`);
  console.log(`  UI: http://0.0.0.0:${PORT}\n`);
});
