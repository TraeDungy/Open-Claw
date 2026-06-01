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
import { AGENTS as AGENT_ROSTER } from './agents.mjs';

const INITIATIVES = [
  'revenue targets',
  'platform launches',
  'content pipeline completion',
  'social media brand rollout',
];

let _sendFn = null;

async function buildContext() {
  const dashboard = await getDashboard();
  const inProgress = await listIssues({ status: 'in_progress', limit: 25 });
  const blocked = await listIssues({ status: 'blocked', limit: 20 });
  const criticalTodo = await listIssues({ status: 'todo', priority: 'critical', limit: 30 });
  const allTodo = await listIssues({ status: 'todo', limit: 50 });
  const unassigned = allTodo.filter(i => !i.assigneeAgentId).slice(0, 20);
  const agents = await listAgents();

  const agentSummary = agents.map(a =>
    `${a.name} [${a.id}] (${a.status || 'unknown'})`
  ).join('\n');

  const issueLines = (issues) =>
    issues.map(i =>
      `[${i.identifier}] ${i.title} | status:${i.status || '?'} | priority:${i.priority || '?'} | assignee:${i.assigneeAgentId || 'UNASSIGNED'} | id:${i.id || i.identifier}`
    ).join('\n');

  return `
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
`.trim();
}

function parseActions(text) {
  const actions = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('ACTION:CREATE_ISSUE')) {
      try {
        actions.push({ type: 'create_issue', ...JSON.parse(trimmed.replace('ACTION:CREATE_ISSUE', '').trim()) });
      } catch {}
    } else if (trimmed.startsWith('ACTION:COMMENT')) {
      try {
        actions.push({ type: 'comment', ...JSON.parse(trimmed.replace('ACTION:COMMENT', '').trim()) });
      } catch {}
    } else if (trimmed.startsWith('ACTION:WAKEUP_AGENT')) {
      try {
        actions.push({ type: 'wakeup_agent', ...JSON.parse(trimmed.replace('ACTION:WAKEUP_AGENT', '').trim()) });
      } catch {}
    } else if (trimmed.startsWith('ACTION:CLOSE_ISSUE')) {
      try {
        actions.push({ type: 'close_issue', ...JSON.parse(trimmed.replace('ACTION:CLOSE_ISSUE', '').trim()) });
      } catch {}
    } else if (trimmed.startsWith('ACTION:REASSIGN')) {
      try {
        actions.push({ type: 'reassign', ...JSON.parse(trimmed.replace('ACTION:REASSIGN', '').trim()) });
      } catch {}
    } else if (trimmed.startsWith('ACTION:ESCALATE')) {
      const msg = trimmed.replace('ACTION:ESCALATE', '').trim();
      actions.push({ type: 'escalate', message: msg });
    }
  }
  return actions;
}

export async function runCycle() {
  const sendFn = _sendFn;
  console.log('[ceo-loop] running decision cycle...');

  const context = await buildContext();

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

  if (!response || response.includes('NO_ACTION_NEEDED')) {
    console.log('[ceo-loop] no action needed this cycle');
    return null;
  }

  const actions = parseActions(response);
  const results = [];

  for (const action of actions.slice(0, 6)) {
    try {
      if (action.type === 'create_issue') {
        const out = await createIssue({
          title: action.title,
          body: action.body,
          assigneeAgentId: action.assigneeAgentId,
          priority: action.priority || 'high',
        });
        console.log('[ceo-loop] created issue:', out);
        results.push(`📝 Created: *${action.title}*`);

      } else if (action.type === 'comment') {
        await commentIssue(action.issueId, action.body);
        console.log('[ceo-loop] commented on:', action.issueId);
        results.push(`💬 Commented on ${action.issueId}`);

      } else if (action.type === 'wakeup_agent') {
        await wakeupAgent(action.agentId, action.reason);
        console.log('[ceo-loop] woke up agent:', action.agentId);
        const name = Object.entries(AGENT_ROSTER).find(([, id]) => id === action.agentId)?.[0] || action.agentId;
        results.push(`⚡ Woke up *${name}*: ${action.reason}`);

      } else if (action.type === 'close_issue') {
        await closeIssue(action.issueId);
        console.log('[ceo-loop] closed issue:', action.issueId);
        results.push(`✅ Closed ${action.issueId}`);

      } else if (action.type === 'reassign') {
        await reassignIssue(action.issueId, action.agentId);
        console.log('[ceo-loop] reassigned:', action.issueId, '→', action.agentId);
        const name = Object.entries(AGENT_ROSTER).find(([, id]) => id === action.agentId)?.[0] || action.agentId;
        results.push(`🔄 Reassigned ${action.issueId} → *${name}*`);

      } else if (action.type === 'escalate') {
        if (sendFn) await sendFn(`🚨 *CEO Escalation*\n\n${action.message}`);
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

  async function tick() {
    try {
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
    } catch (err) {
      console.error('[ceo-loop] tick error:', err.message);
    }
  }

  // First run after 30s startup delay
  setTimeout(tick, 30000);
  setInterval(tick, interval);
  console.log(`[ceo-loop] autonomous loop every ${interval / 1000 / 60}min`);
}
