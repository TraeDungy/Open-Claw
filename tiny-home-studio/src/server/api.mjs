/**
 * JSON API. Every analysis endpoint runs the same shared library the browser
 * runs, so the numbers on screen and the numbers in an export always agree.
 */

import {
  CONTAINERS,
  CONTAINER_CONDITIONS,
  INSULATION,
  OPENING_TYPES,
  ZONE_TYPES,
} from '../lib/containers.mjs';
import { FINISH_TIERS, FOUNDATIONS, REGIONS, createProject, normalizeProject } from '../lib/project.mjs';
import { TEMPLATES, buildFromTemplate, templateSummaries } from '../lib/templates.mjs';
import { projectGeometry } from '../lib/geometry.mjs';
import { runCodeChecks } from '../lib/codecheck.mjs';
import { estimateProject } from '../lib/estimate.mjs';
import { renderPlanSvg } from '../lib/svg.mjs';
import { renderSpecSheet } from '../lib/spec.mjs';
import { deleteProject, getProject, listProjects, saveProject } from './store.mjs';

const json = (body, status = 200) => ({
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

const notFound = () => json({ error: 'Not found' }, 404);
const badRequest = (message) => json({ error: message }, 400);

/** The full analysis payload used by the editor's right-hand rail. */
export function analyze(rawProject) {
  const project = normalizeProject(rawProject);
  const geometry = projectGeometry(project);
  return {
    project,
    checks: runCodeChecks(project),
    estimate: estimateProject(project),
    stats: {
      totalLivingArea: geometry.totalLivingArea,
      interiorArea: geometry.interiorArea,
      habitableArea: geometry.habitableArea,
      loftArea: geometry.loftArea,
      groundFootprint: geometry.groundFootprint,
      moduleCount: geometry.moduleCount,
      levels: geometry.levels,
      bounds: geometry.bounds,
    },
  };
}

/**
 * @param {{method: string, pathname: string, query: URLSearchParams, body: any}} request
 * @returns {Promise<{status:number, headers:object, body:string}|null>} null when the route is not an API route
 */
export async function handleApi({ method, pathname, query, body }) {
  if (!pathname.startsWith('/api/')) return null;
  const route = pathname.slice(5);

  try {
    if (route === 'catalog' && method === 'GET') {
      return json({
        containers: CONTAINERS,
        conditions: CONTAINER_CONDITIONS,
        insulation: INSULATION,
        zoneTypes: ZONE_TYPES,
        openingTypes: OPENING_TYPES,
        finishTiers: FINISH_TIERS,
        regions: REGIONS,
        foundations: FOUNDATIONS,
      });
    }

    if (route === 'templates' && method === 'GET') {
      return json({ templates: templateSummaries() });
    }

    if (route.startsWith('templates/') && method === 'POST') {
      const id = route.slice('templates/'.length);
      if (!TEMPLATES.some((template) => template.id === id)) return notFound();
      return json(analyze(buildFromTemplate(id)));
    }

    if (route === 'analyze' && method === 'POST') {
      if (!body || typeof body !== 'object') return badRequest('Expected a project object');
      return json(analyze(body.project ?? body));
    }

    if (route === 'projects' && method === 'GET') {
      return json({ projects: await listProjects() });
    }

    if (route === 'projects' && method === 'POST') {
      const project = await saveProject(body?.project ?? createProject());
      return json({ project }, 201);
    }

    if (route.startsWith('projects/')) {
      const id = decodeURIComponent(route.slice('projects/'.length));
      if (method === 'GET') {
        const project = await getProject(id);
        return project ? json(analyze(project)) : notFound();
      }
      if (method === 'PUT') {
        if (!body?.project) return badRequest('Expected { project }');
        const project = await saveProject({ ...body.project, id });
        return json({ project });
      }
      if (method === 'DELETE') {
        return json({ deleted: await deleteProject(id) });
      }
    }

    if (route === 'export/plan.svg' && method === 'POST') {
      const project = normalizeProject(body?.project ?? body);
      const svg = renderPlanSvg(project, {
        estimate: estimateProject(project),
        level: body?.level ?? null,
      });
      return {
        status: 200,
        headers: {
          'content-type': 'image/svg+xml; charset=utf-8',
          'content-disposition': `attachment; filename="${slug(project.name)}-plan.svg"`,
        },
        body: svg,
      };
    }

    if (route === 'export/spec.html' && method === 'POST') {
      const project = normalizeProject(body?.project ?? body);
      return {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
        body: renderSpecSheet(project),
      };
    }

    return notFound();
  } catch (error) {
    return json({ error: error.message ?? 'Server error' }, 500);
  }
}

function slug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'tiny-home';
}
