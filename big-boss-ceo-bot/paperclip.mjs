/**
 * Paperclip HTTP client — async fetch to localhost:3100 API
 * Replaces previous spawnSync CLI wrapper for non-blocking operation.
 */
import { resolveAgentId } from './agents.mjs';

const COMPANY_ID = process.env.COMPANY_ID;
const PAPERCLIP_URL = process.env.PAPERCLIP_URL || 'http://localhost:3100';
const PAPERCLIP_TOKEN = process.env.PAPERCLIP_TOKEN || 'local-board';

const HEADERS = {
  'Authorization': `Bearer ${PAPERCLIP_TOKEN}`,
  'Content-Type': 'application/json',
};

async function paperclipFetch(method, path, body) {
  const url = `${PAPERCLIP_URL}${path}`;
  const opts = { method, headers: HEADERS };
  if (body) opts.body = JSON.stringify(body);

  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Paperclip API ${method} ${path} failed ${resp.status}: ${text.slice(0, 200)}`);
  }
  return resp.json().catch(() => ({}));
}

export async function listIssues({ status, assigneeAgentId, limit = 50, priority } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (assigneeAgentId) params.set('assigneeAgentId', resolveAgentId(assigneeAgentId));
  const qs = params.toString() ? `?${params}` : '';

  const data = await paperclipFetch('GET', `/api/companies/${COMPANY_ID}/issues${qs}`);
  let issues = Array.isArray(data) ? data : (data.issues || data.data || []);
  if (priority) issues = issues.filter(i => i.priority === priority);
  return issues.slice(0, limit);
}

export async function getIssue(idOrIdentifier) {
  return paperclipFetch('GET', `/api/issues/${idOrIdentifier}`);
}

export async function createIssue({ title, body, assigneeAgentId, priority = 'high', projectId } = {}) {
  const payload = { title, priority };
  if (body) payload.description = body;
  const resolved = resolveAgentId(assigneeAgentId);
  if (resolved) payload.assigneeAgentId = resolved;
  if (projectId) payload.projectId = projectId;

  return paperclipFetch('POST', `/api/companies/${COMPANY_ID}/issues`, payload);
}

export async function updateIssue(issueId, { status, priority, assigneeAgentId } = {}) {
  const payload = {};
  if (status) payload.status = status;
  if (priority) payload.priority = priority;
  if (assigneeAgentId) payload.assigneeAgentId = resolveAgentId(assigneeAgentId);

  return paperclipFetch('PATCH', `/api/issues/${issueId}`, payload);
}

export async function commentIssue(issueId, body) {
  return paperclipFetch('POST', `/api/issues/${issueId}/comments`, { body });
}

export async function listAgents() {
  const data = await paperclipFetch('GET', `/api/companies/${COMPANY_ID}/agents`);
  return Array.isArray(data) ? data : (data.agents || data.data || []);
}

export async function getDashboard() {
  try {
    return await paperclipFetch('GET', `/api/companies/${COMPANY_ID}/dashboard`);
  } catch {
    return {};
  }
}

export async function checkoutIssue(issueId, agentId) {
  return paperclipFetch('POST', `/api/issues/${issueId}/checkout`, {
    agentId: resolveAgentId(agentId),
    expectedStatuses: ['todo', 'backlog', 'in_progress'],
  });
}

export async function closeIssue(issueId) {
  return updateIssue(issueId, { status: 'done' });
}

export async function reassignIssue(issueId, agentId) {
  return updateIssue(issueId, { assigneeAgentId: agentId });
}

export async function wakeupAgent(agentId, reason) {
  const resolvedId = resolveAgentId(agentId);
  return paperclipFetch('POST', `/api/agents/${resolvedId}/wakeup`, { reason });
}
