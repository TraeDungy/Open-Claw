/**
 * Paperclip CLI wrapper — uses spawnSync args array to avoid shell-escaping bugs
 * Direct HTTP used for endpoints not available in CLI (wakeup, hire)
 */
import { spawnSync } from 'child_process';

const CLI = process.env.PAPERCLIP_CLI;
const COMPANY_ID = process.env.COMPANY_ID;
const PAPERCLIP_URL = process.env.PAPERCLIP_URL || 'http://localhost:3100';
const PAPERCLIP_TOKEN = process.env.PAPERCLIP_TOKEN || 'local-board';

// Full agent name → UUID lookup (handles LLM returning names instead of UUIDs)
const AGENT_NAME_MAP = {
  // Command layer
  'big boss ceo': '010acbc6-304f-4e92-a308-e005d5ea892e',
  'founding engineer': '5938656f-445f-4f41-8351-b745d72cbc04',
  'vps founding engineer': 'a1aebd73-da0b-432e-91b6-a1c548825bbf',
  'vps ops': 'adbe4d36-daee-4cff-b188-7d325cc0ca7c',
  // Project management
  'empire pm': 'b2a39cff-567d-48c8-a799-983930a28591',
  'media pm': '0aa84859-2cad-45c7-99fa-d4aa4bdbdcbc',
  'saas pm': '4e54548f-2ee2-4d0c-8b34-991d059d30bf',
  'games pm': 'f5014598-2378-4e27-a897-14c38c7a99e9',
  'revenue ops': '505ac295-5be4-44d6-b0f1-c751c8980251',
  'velocity pm': '2d7c772f-2463-4b71-b04c-3253a0ac6c04',
  'laced tribe brand manager': '2528e917-70b8-49dd-bd60-60b0c8352d77',
  // Builders
  'goldie': 'b1719ba8-10e9-4a40-babb-6b956bd74fed',
  'integration specialist': 'f0cc5daf-6d1f-4146-8b10-7be414024cb8',
  'catalog intelligence': 'aaccba6c-d649-4d63-bd29-d73a56bcd640',
  'nvidia worker': '49d5f91f-da34-4014-b824-9521920af7de',
  // Special / device agents
  'nano claw': '8d0c0062-33e8-4f03-bdcc-d9014f778fdc',
  'film plug operator': '5c095393-946a-4a15-8294-3f7de1483a1f',
  'macks imac operator': '84c0f6e7-eede-4496-9639-71872123f2d6',
  'selene vale': '8767955d-87f9-4fa6-a7e5-5a3c24cf6b1c',
  // Creative agency
  'axiom': 'fe6752f9-3654-481d-85bc-36783ed0db52',
  'morrow': 'e0367d9d-4f16-4a18-b9ac-6b4207b97f0a',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveAgentId(agentIdOrName) {
  if (!agentIdOrName) return undefined;
  if (UUID_RE.test(agentIdOrName)) return agentIdOrName;
  return AGENT_NAME_MAP[agentIdOrName.toLowerCase()] || agentIdOrName;
}

// Commands that accept -C (company ID): list/create/dashboard ops
// Commands that operate on a specific resource by ID do NOT accept -C
const COMMANDS_WITH_COMPANY_ID = new Set([
  'issue:list', 'issue:create', 'agent:list', 'dashboard:get',
]);

function run(argArray) {
  const cmdKey = `${argArray[0]}:${argArray[1]}`;
  const companyArgs = COMMANDS_WITH_COMPANY_ID.has(cmdKey) ? ['-C', COMPANY_ID] : [];
  const args = ['--', CLI, ...argArray, ...companyArgs];
  const result = spawnSync('node', args, { encoding: 'utf8', timeout: 30000 });
  if (result.status !== 0) {
    const msg = (result.stderr || result.stdout || '').trim();
    throw new Error(`paperclip CLI error: ${msg}`);
  }
  return (result.stdout || '').trim();
}

function parseLines(output) {
  return output.split('\n')
    .filter(l => l.trim())
    .map(line => {
      const obj = {};
      for (const match of line.matchAll(/(\w+)=([^\s].*?)(?=\s+\w+=|$)/g)) {
        obj[match[1]] = match[2].trim();
      }
      return obj;
    })
    .filter(o => Object.keys(o).length > 0);
}

export function listIssues({ status, assigneeAgentId, limit = 50, priority } = {}) {
  const args = ['issue', 'list'];
  if (status) { args.push('--status', status); }
  if (assigneeAgentId) { args.push('--assignee-agent-id', resolveAgentId(assigneeAgentId)); }

  const out = run(args);
  let issues = parseLines(out);
  if (priority) issues = issues.filter(i => i.priority === priority);
  return issues.slice(0, limit);
}

export function getIssue(idOrIdentifier) {
  return run(['issue', 'get', idOrIdentifier]);
}

export function createIssue({ title, body, assigneeAgentId, priority = 'high', projectId } = {}) {
  const args = ['issue', 'create', '--title', title];
  if (body) { args.push('--description', body); }
  const resolvedAgent = resolveAgentId(assigneeAgentId);
  if (resolvedAgent) { args.push('--assignee-agent-id', resolvedAgent); }
  if (priority) { args.push('--priority', priority); }
  if (projectId) { args.push('--project-id', projectId); }
  return run(args);
}

export function updateIssue(issueId, { status, priority, assigneeAgentId } = {}) {
  const args = ['issue', 'update', issueId];
  if (status) { args.push('--status', status); }
  if (priority) { args.push('--priority', priority); }
  if (assigneeAgentId) { args.push('--assignee-agent-id', resolveAgentId(assigneeAgentId)); }
  return run(args);
}

export function commentIssue(issueId, body) {
  return run(['issue', 'comment', issueId, '--body', body]);
}

export function listAgents() {
  const out = run(['agent', 'list']);
  return parseLines(out);
}

export function getDashboard() {
  const out = run(['dashboard', 'get', '--json']);
  try { return JSON.parse(out); } catch { return {}; }
}

export function checkoutIssue(issueId, agentId) {
  return run(['issue', 'checkout', issueId, '--agent-id', resolveAgentId(agentId)]);
}

export function closeIssue(issueId) {
  return updateIssue(issueId, { status: 'done' });
}

export function reassignIssue(issueId, agentId) {
  return updateIssue(issueId, { assigneeAgentId: agentId });
}

// Direct HTTP for endpoints not in CLI (wakeup, hire)
async function paperclipPost(path, body) {
  const resp = await fetch(`${PAPERCLIP_URL}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAPERCLIP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Paperclip API ${path} failed ${resp.status}: ${text.slice(0, 200)}`);
  }
  return resp.json().catch(() => ({}));
}

export async function wakeupAgent(agentId, reason) {
  const resolvedId = resolveAgentId(agentId);
  return paperclipPost(`/api/agents/${resolvedId}/wakeup`, { reason });
}

export { resolveAgentId as _resolveAgentId, parseLines as _parseLines, COMMANDS_WITH_COMPANY_ID as _COMMANDS_WITH_COMPANY_ID };
