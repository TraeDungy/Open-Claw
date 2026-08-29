#!/usr/bin/env node
/**
 * Tiny Home Studio — zero-dependency HTTP server.
 *
 *   npm start            # http://localhost:4310
 *   PORT=8080 npm start
 *
 * Serves the editor from `public/`, exposes the shared design library at
 * `/lib/*` so the browser imports the exact modules the server uses, and hands
 * API traffic to `src/server/api.mjs`.
 */

import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { handleApi } from './src/server/api.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(here, 'public');
const LIB_DIR = path.join(here, 'src', 'lib');

const PORT = Number(process.env.PORT) || 4310;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Payload too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('Body must be JSON');
    error.statusCode = 400;
    throw error;
  }
}

/** Resolve a URL path to a file inside one of the served roots, or null. */
async function resolveStatic(pathname) {
  let root = PUBLIC_DIR;
  let relative = pathname;

  if (pathname.startsWith('/lib/')) {
    root = LIB_DIR;
    relative = pathname.slice('/lib'.length);
  }
  if (relative === '/' || relative === '') relative = '/index.html';

  const target = path.join(root, path.normalize(relative).replace(/^(\.\.[/\\])+/, ''));
  if (!target.startsWith(root)) return null;

  try {
    const info = await stat(target);
    if (info.isDirectory()) return resolveStatic(path.posix.join(pathname, 'index.html'));
    return { file: target, size: info.size, mtime: info.mtime };
  } catch {
    return null;
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);

  try {
    if (url.pathname.startsWith('/api/')) {
      const body = request.method === 'GET' || request.method === 'DELETE' ? null : await readBody(request);
      const result = await handleApi({
        method: request.method,
        pathname: url.pathname,
        query: url.searchParams,
        body,
      });
      if (result) {
        response.writeHead(result.status, { 'cache-control': 'no-store', ...result.headers });
        response.end(result.body);
        return;
      }
    }

    const asset = await resolveStatic(url.pathname);
    if (!asset) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const ext = path.extname(asset.file).toLowerCase();
    response.writeHead(200, {
      'content-type': MIME[ext] ?? 'application/octet-stream',
      'content-length': asset.size,
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=60',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(asset.file).pipe(response);
  } catch (error) {
    const status = error.statusCode ?? 500;
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: error.message ?? 'Server error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Tiny Home Studio → http://localhost:${PORT}`);
});

export { server };
