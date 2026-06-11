/* POLY JACKPOT — static server + submission collector
 *
 * Serves the form and appends guest applications to submissions.jsonl.
 * If AIRTABLE_API_KEY + AIRTABLE_BASE_ID + AIRTABLE_TABLE are set,
 * each submission is also forwarded to Airtable.
 *
 * Run:  node server.mjs            (PORT env to override, default 3020)
 */

import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3020;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.jsonl');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function forwardToAirtable(record) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE } = process.env;
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE) return;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name: record.name || '',
            Email: record.email || '',
            'Age Range': record.age || '',
            City: record.city || '',
            'Relationship Structure': (record.structure || []).join(', '),
            'Looking For': (record.lookingFor || []).join(', '),
            Social: record.social || '',
            'On Camera': record.onCamera || '',
            Pitch: record.pitch || '',
            'Submitted At': record.submittedAt,
          },
        }),
      },
    );
    if (!res.ok) console.error('[airtable] forward failed:', res.status, await res.text());
  } catch (err) {
    console.error('[airtable] forward error:', err.message);
  }
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // submission endpoint (path is relative-safe behind nginx subpaths)
  if (req.method === 'POST' && url.pathname.endsWith('/api/submit')) {
    try {
      const body = await readBody(req);
      const data = JSON.parse(body);
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'valid email required' }));
        return;
      }
      const record = { ...data, ip: req.socket.remoteAddress, receivedAt: new Date().toISOString() };
      await appendFile(SUBMISSIONS_FILE, JSON.stringify(record) + '\n');
      forwardToAirtable(record); // fire and forget
      console.log(`[submit] ${record.email} (${record.name || 'no name'})`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // static files
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = url.pathname.replace(/^\/+/, '') || 'index.html';
    if (filePath.endsWith('/')) filePath += 'index.html';
    const resolved = path.join(__dirname, path.normalize(filePath));
    if (!resolved.startsWith(__dirname) || resolved === SUBMISSIONS_FILE) {
      res.writeHead(403); res.end('forbidden'); return;
    }
    const target = existsSync(resolved) ? resolved : path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' });
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(target).pipe(res);
    return;
  }

  res.writeHead(405); res.end();
});

server.listen(PORT, () => {
  console.log(`🎰 POLY JACKPOT form running at http://localhost:${PORT}`);
});
