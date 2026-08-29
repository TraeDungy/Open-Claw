/**
 * Flat-file project store. One JSON document per project under `data/projects`.
 * No database to install — the whole point is that `npm start` just works.
 */

import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeProject } from '../lib/project.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.TINY_HOME_DATA_DIR
  ? path.resolve(process.env.TINY_HOME_DATA_DIR)
  : path.resolve(here, '../../data/projects');

const SAFE_ID = /^[A-Za-z0-9_-]{1,80}$/;

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

function fileFor(id) {
  if (!SAFE_ID.test(id)) throw new Error('Invalid project id');
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listProjects() {
  await ensureDir();
  const files = (await readdir(DATA_DIR)).filter((name) => name.endsWith('.json'));
  const projects = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8'));
      projects.push({
        id: raw.id,
        name: raw.name,
        templateId: raw.templateId ?? null,
        updatedAt: raw.updatedAt,
        moduleCount: Array.isArray(raw.modules) ? raw.modules.length : 0,
      });
    } catch {
      // A half-written or hand-edited file should not take the list down.
    }
  }
  return projects.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getProject(id) {
  await ensureDir();
  try {
    const raw = JSON.parse(await readFile(fileFor(id), 'utf8'));
    return normalizeProject(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function saveProject(rawProject) {
  await ensureDir();
  const project = normalizeProject(rawProject);
  const file = fileFor(project.id);
  await writeFile(`${file}.tmp`, JSON.stringify(project, null, 2), 'utf8');
  const { rename } = await import('node:fs/promises');
  await rename(`${file}.tmp`, file);
  return project;
}

export async function deleteProject(id) {
  try {
    await unlink(fileFor(id));
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
