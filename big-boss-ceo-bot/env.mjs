/**
 * Loads .env from this directory into process.env (no dotenv dep).
 *
 * Must be the FIRST import in the entry point: static imports are hoisted,
 * so modules like paperclip.mjs and llm.mjs that read process.env at load
 * time are evaluated before any inline loader code in the entry file runs.
 * Importing this module first guarantees the env is populated before them.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

try {
  const lines = readFileSync(join(__dir, '.env'), 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}
