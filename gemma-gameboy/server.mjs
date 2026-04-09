import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.GEMMA_PORT || 7777;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.GEMMA_MODEL || 'gemma3:4b';
const MACHINE_NAME = process.env.MACHINE_NAME || 'UNKNOWN';

const server = http.createServer(async (req, res) => {
  // CORS
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

  // Config endpoint
  if (req.method === 'GET' && req.url === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: MODEL, machine: MACHINE_NAME, ollamaUrl: OLLAMA_URL }));
    return;
  }

  // Chat endpoint — streaming
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { messages } = JSON.parse(body);

    const payload = JSON.stringify({ model: MODEL, messages, stream: true });

    const ollamaReq = http.request(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (ollamaRes) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      ollamaRes.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n').filter(Boolean);
          for (const line of lines) {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              res.write(`data: ${JSON.stringify({ token: parsed.message.content })}\n\n`);
            }
            if (parsed.done) {
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            }
          }
        } catch (e) {
          // partial JSON, ignore
        }
      });
      ollamaRes.on('end', () => res.end());
      ollamaRes.on('error', (e) => {
        res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
        res.end();
      });
    });

    ollamaReq.on('error', (e) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Ollama unreachable: ${e.message}` }));
    });

    ollamaReq.write(payload);
    ollamaReq.end();
    return;
  }

  // Static files
  const filePath = path.join(__dirname, req.url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.wav': 'audio/wav' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n  GEMMA GAMEBOY  [${MACHINE_NAME}]`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  Ollama: ${OLLAMA_URL}`);
  console.log(`  UI: http://localhost:${PORT}\n`);
});
