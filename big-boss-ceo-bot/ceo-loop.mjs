/**
 * Autonomous CEO Loop — runs every 15 minutes
 * BIG BOSS CEO reviews all Paperclip projects and takes autonomous action.
 * Actions: CREATE_ISSUE, COMMENT, WAKEUP_AGENT, CLOSE_ISSUE, REASSIGN, ESCALATE
 */
import {
  listIssues, listAgents, createIssue, commentIssue,
  updateIssue, closeIssue, reassignIssue, wakeupAgent, getDashboard,
} from './paperclip.mjs';
import { chat } from './llm.mjs';
import { startLoop, parseActionLines, isDuplicateTitle } from './loop-utils.mjs';
import { recordAction, getRecentActions } from './state.mjs';

const ACTION_MEMORY_MS = 24 * 60 * 60 * 1000;  // how far back the CEO remembers
const WAKEUP_THROTTLE_MS = 60 * 60 * 1000;     // min gap between wakeups per agent

// Full agent roster — all agents CEO can delegate to or wake up
const AGENT_ROSTER = {
  // Command
  'Founding Engineer': '5938656f-445f-4f41-8351-b745d72cbc04',
  'VPS Founding Engineer': 'a1aebd73-da0b-432e-91b6-a1c548825bbf',
  'VPS Ops': 'adbe4d36-daee-4cff-b188-7d325cc0ca7c',
  // PMs
  'Empire PM': 'b2a39cff-567d-48c8-a799-983930a28591',
  'Media PM': '0aa84859-2cad-45c7-99fa-d4aa4bdbdcbc',
  'SaaS PM': '4e54548f-2ee2-4d0c-8b34-991d059d30bf',
  'Games PM': 'f5014598-2378-4e27-a897-14c38c7a99e9',
  'Revenue Ops': '505ac295-5be4-44d6-b0f1-c751c8980251',
  'Velocity PM': '2d7c772f-2463-4b71-b04c-3253a0ac6c04',
  'Laced Tribe Brand Manager': '2528e917-70b8-49dd-bd60-60b0c8352d77',
  // Builders
  'Goldie': 'b1719ba8-10e9-4a40-babb-6b956bd74fed',
  'Integration Specialist': 'f0cc5daf-6d1f-4146-8b10-7be414024cb8',
  'Catalog Intelligence': 'aaccba6c-d649-4d63-bd29-d73a56bcd640',
  'NVIDIA Worker': '49d5f91f-da34-4014-b824-9521920af7de',
  // Special
  'Nano Claw': '8d0c0062-33e8-4f03-bdcc-d9014f778fdc',
  'Film Plug Operator': '5c095393-946a-4a15-8294-3f7de1483a1f',
  'Selene Vale': '8767955d-87f9-4fa6-a7e5-5a3c24cf6b1c',
  'Axiom': 'fe6752f9-3654-481d-85bc-36783ed0db52',
};

const INITIATIVES = [
  'revenue targets',
  'platform launches',
  'content pipeline completion',
  'social media brand rollout',
];

let _sendFn = null;

function buildContext() {
  const dashboard = getDashboard();
  const inProgress = listIssues({ status: 'in_progress', limit: 25 });
  const blocked = listIssues({ status: 'blocked', limit: 20 });
  const criticalTodo = listIssues({ status: 'todo', priority: 'critical', limit: 30 });
  const allTodo = listIssues({ status: 'todo', limit: 50 });
  const unassigned = allTodo.filter(i => !i.assigneeAgentId).slice(0, 20);
  const agents = listAgents();

  // Every open title the CEO can see — used to block duplicate CREATE_ISSUE
  const openTitles = [...inProgress, ...blocked, ...criticalTodo, ...allTodo]
    .map(i => i.title).filter(Boolean);

  const recent = getRecentActions(ACTION_MEMORY_MS, 'ceo');
  const recentLines = recent.map(a =>
    `${new Date(a.ts).toISOString().slice(0, 16)} ${a.type}: ${a.summary}`
  ).join('\n');

  const agentSummary = agents.map(a =>
    `${a.name} [${a.id}] (${a.status || 'unknown'})`
  ).join('\n');

  const issueLines = (issues) =>
    issues.map(i =>
      `[${i.identifier}] ${i.title} | status:${i.status || '?'} | priority:${i.priority || '?'} | assignee:${i.assigneeAgentId || 'UNASSIGNED'} | id:${i.id || i.identifier}`
    ).join('\n');

  const text = `
=== DASHBOARD ===
Open: ${dashboard?.tasks?.open || '?'} | In Progress: ${dashboard?.tasks?.inProgress || '?'} | Blocked: ${dashboard?.tasks?.blocked || '?'} | Done: ${dashboard?.tasks?.done || '?'}
Agents running: ${dashboard?.agents?.running || '?'} / ${dashboard?.agents?.active || '?'} active | In error: ${dashboard?.agents?.error || '?'}

=== ACTIVE INITIATIVES ===
${INITIATIVES.join('\n')}

=== IN PROGRESS (${inProgress.length}) ===
${issueLines(inProgress) || 'None'}

=== BLOCKED (${blocked.length}) ===
${issueLines(blocked) || 'None'}

=== CRITICAL TODO (${criticalTodo.length}) ===
${issueLines(criticalTodo) || 'None'}

=== UNASSIGNED OPEN ISSUES (${unassigned.length}) ===
${issueLines(unassigned) || 'None'}

=== AGENT FLEET ===
${agentSummary}

=== AGENTS AVAILABLE FOR DELEGATION ===
${Object.entries(AGENT_ROSTER).map(([name, id]) => `${name}: ${id}`).join('\n')}

=== YOUR ACTIONS IN THE LAST 24H (do NOT repeat these) ===
${recentLines || 'None'}
`.trim();

  return { text, openTitles };
}

const VERB_MAP = {
  CREATE_ISSUE: 'create_issue',
  COMMENT: 'comment',
  WAKEUP_AGENT: 'wakeup_agent',
  CLOSE_ISSUE: 'close_issue',
  REASSIGN: 'reassign',
  ESCALATE: 'escalate',
};

function parseActions(text) {
  return parseActionLines(text)
    .map(({ verb, params, message }) => {
      const type = VERB_MAP[verb];
      if (!type) return null;
      if (type === 'escalate') return { type, message: message ?? params?.message ?? '' };
      return { type, ...params };
    })
    .filter(Boolean);
}

export async function runCycle() {
  const sendFn = _sendFn;
  console.log('[ceo-loop] running decision cycle...');

  const { text: context, openTitles } = buildContext();

  const systemPrompt = `You are BIG BOSS CEO — the fully autonomous chief executive of Trial X Fire, a content distribution company operating FAST channels, OTT platforms, and video delivery pipelines.

You have FULL authority to act without human approval. Do not ask for permission. Do not wait. You run this company.

Your mandate — keep these initiatives moving:
1. Revenue targets
2. Platform launches
3. Content pipeline completion
4. Social media brand rollout
5. Any issue marked critical

AUTONOMOUS AUTHORITY:
- Create issues and assign them to agents immediately
- Wake up idle agents and give them work directly
- Close completed or obsolete issues without asking
- Reassign stuck work to a better-suited agent
- Only ESCALATE when you literally cannot act without the owner (needs budget, external access, or a decision that requires ownership)

RULES:
- Never duplicate issues — check existing list before creating
- Prefer waking up an idle agent over creating a new issue for work that already exists
- Close issues that are clearly done or no longer relevant
- Reassign if an agent has been assigned something and is idle/error
- Max 6 actions per cycle — pick the highest-value 6
- Be decisive and specific — vague issues get ignored

OUTPUT FORMAT:
Write a 2-3 sentence CEO assessment of the current state.
Then output actions (one per line, no extra text on action lines):

ACTION:CREATE_ISSUE {"title":"...","body":"...","assigneeAgentId":"UUID","priority":"critical|high|medium"}
ACTION:COMMENT {"issueId":"UUID-or-identifier","body":"..."}
ACTION:WAKEUP_AGENT {"agentId":"UUID","reason":"..."}
ACTION:CLOSE_ISSUE {"issueId":"UUID-or-identifier"}
ACTION:REASSIGN {"issueId":"UUID-or-identifier","agentId":"UUID","reason":"..."}
ACTION:ESCALATE Your message to the owner here

If no action is needed, output exactly: NO_ACTION_NEEDED`;

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context },
  ], { maxTokens: 2500 });

  console.log('[ceo-loop] LLM response:\n', response);

  // Parse first, then decide — a stray NO_ACTION_NEEDED mention used to
  // discard real actions in the same response.
  const actions = parseActions(response || '');
  if (actions.length === 0) {
    if (response && !response.includes('NO_ACTION_NEEDED')) {
      console.log('[ceo-loop] response had no parseable actions');
    } else {
      console.log('[ceo-loop] no action needed this cycle');
    }
    return null;
  }

  const recentCreatedTitles = getRecentActions(ACTION_MEMORY_MS, 'ceo')
    .filter(a => a.type === 'create_issue')
    .map(a => a.summary);

  const results = [];

  for (const action of actions.slice(0, 6)) {
    try {
      if (action.type === 'create_issue') {
        if (isDuplicateTitle(action.title, [...openTitles, ...recentCreatedTitles])) {
          console.log('[ceo-loop] skipped duplicate issue:', action.title);
          results.push(`⏭️ Skipped duplicate: ${action.title}`);
          continue;
        }
        const out = createIssue({
          title: action.title,
          body: action.body,
          assigneeAgentId: action.assigneeAgentId,
          priority: action.priority || 'high',
        });
        console.log('[ceo-loop] created issue:', out);
        recordAction('ceo', { type: 'create_issue', summary: action.title });
        recentCreatedTitles.push(action.title);
        results.push(`📝 Created: *${action.title}*`);

      } else if (action.type === 'comment') {
        commentIssue(action.issueId, action.body);
        console.log('[ceo-loop] commented on:', action.issueId);
        recordAction('ceo', { type: 'comment', summary: action.issueId });
        results.push(`💬 Commented on ${action.issueId}`);

      } else if (action.type === 'wakeup_agent') {
        const recentWake = getRecentActions(WAKEUP_THROTTLE_MS)
          .some(a => a.type === 'wakeup' && a.agentId === action.agentId);
        if (recentWake) {
          console.log('[ceo-loop] skipped wakeup (woken within the last hour):', action.agentId);
          continue;
        }
        await wakeupAgent(action.agentId, action.reason);
        console.log('[ceo-loop] woke up agent:', action.agentId);
        const name = Object.entries(AGENT_ROSTER).find(([, id]) => id === action.agentId)?.[0] || action.agentId;
        recordAction('ceo', { type: 'wakeup', summary: `${name}: ${action.reason || ''}`, agentId: action.agentId });
        results.push(`⚡ Woke up *${name}*: ${action.reason}`);

      } else if (action.type === 'close_issue') {
        closeIssue(action.issueId);
        console.log('[ceo-loop] closed issue:', action.issueId);
        recordAction('ceo', { type: 'close_issue', summary: action.issueId });
        results.push(`✅ Closed ${action.issueId}`);

      } else if (action.type === 'reassign') {
        reassignIssue(action.issueId, action.agentId);
        console.log('[ceo-loop] reassigned:', action.issueId, '→', action.agentId);
        const name = Object.entries(AGENT_ROSTER).find(([, id]) => id === action.agentId)?.[0] || action.agentId;
        recordAction('ceo', { type: 'reassign', summary: `${action.issueId} → ${name}` });
        results.push(`🔄 Reassigned ${action.issueId} → *${name}*`);

      } else if (action.type === 'escalate') {
        if (sendFn) await sendFn(`🚨 *CEO Escalation*\n\n${action.message}`);
        recordAction('ceo', { type: 'escalate', summary: (action.message || '').slice(0, 120) });
        results.push(`🚨 Escalated to owner`);
      }
    } catch (err) {
      console.error('[ceo-loop] action error:', err.message);
      results.push(`⚠️ Action failed: ${err.message.slice(0, 100)}`);
    }
  }

  const analysis = response.split('\n')
    .filter(l => !l.trim().startsWith('ACTION:') && !l.startsWith('NO_ACTION'))
    .join('\n').trim().slice(0, 500);

  return { analysis, results };
}

export function startCEOLoop(sendFn) {
  _sendFn = sendFn;
  const interval = parseInt(process.env.CEO_LOOP_INTERVAL_MS || '900000');

  // Chained timeouts (via startLoop) instead of setInterval: a slow cycle
  // can no longer overlap or stack with the next one.
  startLoop('ceo-loop', async () => {
    const outcome = await runCycle();
    if (outcome && outcome.results.length > 0 && sendFn) {
      const msg = [
        `🤖 *CEO Cycle*`,
        ``,
        outcome.analysis ? `_${outcome.analysis.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}_` : '',
        ``,
        `*Actions:*`,
        ...outcome.results,
      ].filter(Boolean).join('\n');
      await sendFn(msg);
    }
  }, { intervalMs: interval, initialDelayMs: 30000 });

  console.log(`[ceo-loop] autonomous loop every ${interval / 1000 / 60}min`);
}
