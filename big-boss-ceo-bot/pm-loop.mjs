/**
 * PM Autonomous Loop
 * Each PM agent runs its own scoped decision cycle independently.
 * Manages their backlog, delegates to team agents, and reports to CEO only when blocked.
 *
 * Usage: import { startAllPMLoops } from './pm-loop.mjs'; then call startAllPMLoops(sendFn).
 */
import {
  listIssues, listAgents, createIssue, commentIssue,
  updateIssue, closeIssue, reassignIssue, wakeupAgent,
} from './paperclip.mjs';
import { chat } from './llm.mjs';

// PM configuration — each entry defines one PM's scope, team, and decision authority
const PM_CONFIGS = [
  {
    name: 'Empire PM',
    agentId: 'b2a39cff-567d-48c8-a799-983930a28591',
    role: 'Content Empire — FAST channels, OTT distribution, Tubi/Pluto/Plex delivery pipelines',
    keywords: ['empire', 'fast', 'channel', 'distribution', 'tubi', 'pluto', 'plex', 'xumo', 'ott', 'roku', 'fire tv'],
    team: {
      'Film Plug Operator': '5c095393-946a-4a15-8294-3f7de1483a1f',
      'Nano Claw': '8d0c0062-33e8-4f03-bdcc-d9014f778fdc',
      'Catalog Intelligence': 'aaccba6c-d649-4d63-bd29-d73a56bcd640',
    },
    intervalMs: 30 * 60 * 1000, // 30 min
    startDelayMs: 3 * 60 * 1000, // stagger starts
  },
  {
    name: 'Media PM',
    agentId: '0aa84859-2cad-45c7-99fa-d4aa4bdbdcbc',
    role: 'Content Pipeline — video encoding, transcoding, R2 uploads, Airtable metadata, Vimeo sync',
    keywords: ['media', 'video', 'encode', 'transcode', 'r2', 'vimeo', 'airtable', 'content', 'pipeline', 'metadata'],
    team: {
      'Goldie': 'b1719ba8-10e9-4a40-babb-6b956bd74fed',
      'NVIDIA Worker': '49d5f91f-da34-4014-b824-9521920af7de',
      'Catalog Intelligence': 'aaccba6c-d649-4d63-bd29-d73a56bcd640',
      'Nano Claw': '8d0c0062-33e8-4f03-bdcc-d9014f778fdc',
    },
    intervalMs: 30 * 60 * 1000,
    startDelayMs: 7 * 60 * 1000,
  },
  {
    name: 'Revenue Ops',
    agentId: '505ac295-5be4-44d6-b0f1-c751c8980251',
    role: 'Revenue Operations — monetization, billing, payments, analytics, x402 services, revenue targets',
    keywords: ['revenue', 'monetize', 'billing', 'payment', 'stripe', 'x402', 'analytics', 'wallet', 'income'],
    team: {
      'Selene Vale': '8767955d-87f9-4fa6-a7e5-5a3c24cf6b1c',
      'Integration Specialist': 'f0cc5daf-6d1f-4146-8b10-7be414024cb8',
    },
    intervalMs: 45 * 60 * 1000,
    startDelayMs: 11 * 60 * 1000,
  },
  {
    name: 'SaaS PM',
    agentId: '4e54548f-2ee2-4d0c-8b34-991d059d30bf',
    role: 'SaaS Product Development — web apps, dashboards, APIs, user-facing product features',
    keywords: ['saas', 'product', 'dashboard', 'api', 'web app', 'feature', 'launch', 'deploy', 'frontend', 'backend'],
    team: {
      'Integration Specialist': 'f0cc5daf-6d1f-4146-8b10-7be414024cb8',
      'Goldie': 'b1719ba8-10e9-4a40-babb-6b956bd74fed',
      'VPS Ops': 'adbe4d36-daee-4cff-b188-7d325cc0ca7c',
    },
    intervalMs: 45 * 60 * 1000,
    startDelayMs: 15 * 60 * 1000,
  },
];

function buildPMContext(config) {
  // Fetch all open issues — filter to this PM's domain by keyword
  const allOpen = listIssues({ status: 'todo', limit: 100 });
  const allInProgress = listIssues({ status: 'in_progress', limit: 50 });
  const allBlocked = listIssues({ status: 'blocked', limit: 30 });

  const matches = (issue) => {
    const text = `${issue.title || ''} ${issue.body || ''}`.toLowerCase();
    return config.keywords.some(kw => text.includes(kw));
  };

  const myTodo = allOpen.filter(matches).slice(0, 20);
  const myInProgress = allInProgress.filter(matches).slice(0, 15);
  const myBlocked = allBlocked.filter(matches).slice(0, 10);

  const issueLines = (issues) =>
    issues.map(i =>
      `[${i.identifier}] ${i.title} | priority:${i.priority || '?'} | assignee:${i.assigneeAgentId || 'UNASSIGNED'} | id:${i.id || i.identifier}`
    ).join('\n') || 'None';

  return `
=== YOUR DOMAIN: ${config.role} ===

=== YOUR TEAM ===
${Object.entries(config.team).map(([name, id]) => `${name}: ${id}`).join('\n')}

=== YOUR TODO (${myTodo.length}) ===
${issueLines(myTodo)}

=== YOUR IN PROGRESS (${myInProgress.length}) ===
${issueLines(myInProgress)}

=== YOUR BLOCKED (${myBlocked.length}) ===
${issueLines(myBlocked)}
`.trim();
}

function parsePMActions(text) {
  const actions = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('ACTION:ASSIGN')) {
      try { actions.push({ type: 'assign', ...JSON.parse(trimmed.replace('ACTION:ASSIGN', '').trim()) }); } catch {}
    } else if (trimmed.startsWith('ACTION:CREATE')) {
      try { actions.push({ type: 'create', ...JSON.parse(trimmed.replace('ACTION:CREATE', '').trim()) }); } catch {}
    } else if (trimmed.startsWith('ACTION:CLOSE')) {
      try { actions.push({ type: 'close', ...JSON.parse(trimmed.replace('ACTION:CLOSE', '').trim()) }); } catch {}
    } else if (trimmed.startsWith('ACTION:WAKEUP')) {
      try { actions.push({ type: 'wakeup', ...JSON.parse(trimmed.replace('ACTION:WAKEUP', '').trim()) }); } catch {}
    } else if (trimmed.startsWith('ACTION:ESCALATE_CEO')) {
      const msg = trimmed.replace('ACTION:ESCALATE_CEO', '').trim();
      actions.push({ type: 'escalate_ceo', message: msg });
    }
  }
  return actions;
}

export { parsePMActions as _parsePMActions, PM_CONFIGS as _PM_CONFIGS };

async function runPMCycle(config, sendFn) {
  console.log(`[pm-loop:${config.name}] running cycle...`);

  const context = buildPMContext(config);

  const systemPrompt = `You are ${config.name} — an autonomous project manager at Trial X Fire.

Your domain: ${config.role}

You manage your own backlog independently. You have authority to:
- Assign unassigned issues to your team agents
- Create new issues for work that's missing from the backlog
- Close issues that are complete or no longer relevant
- Wake up team agents that should be working
- Escalate ONLY to the CEO when you are genuinely blocked (need resources, cross-domain decision, or external access)

RULES:
- Be specific and decisive — no vague issues
- Max 4 actions per cycle
- Only escalate to CEO if you truly cannot resolve it yourself
- If a team agent is the right person for something, assign it or wake them up — don't wait

OUTPUT FORMAT:
Write 1-2 sentences on your current domain state.
Then output actions:

ACTION:ASSIGN {"issueId":"UUID-or-identifier","agentId":"UUID","reason":"..."}
ACTION:CREATE {"title":"...","body":"...","agentId":"UUID","priority":"critical|high|medium"}
ACTION:CLOSE {"issueId":"UUID-or-identifier"}
ACTION:WAKEUP {"agentId":"UUID","reason":"..."}
ACTION:ESCALATE_CEO Your message to the CEO here

If no action needed: NO_ACTION_NEEDED`;

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context },
  ], { maxTokens: 1500 });

  console.log(`[pm-loop:${config.name}] response:\n`, response);

  if (!response || response.includes('NO_ACTION_NEEDED')) return null;

  const actions = parsePMActions(response);
  const results = [];

  for (const action of actions.slice(0, 4)) {
    try {
      if (action.type === 'assign') {
        reassignIssue(action.issueId, action.agentId);
        results.push(`🎯 Assigned ${action.issueId} — ${action.reason}`);

      } else if (action.type === 'create') {
        createIssue({
          title: action.title,
          body: action.body,
          assigneeAgentId: action.agentId,
          priority: action.priority || 'high',
        });
        results.push(`📝 Created: ${action.title}`);

      } else if (action.type === 'close') {
        closeIssue(action.issueId);
        results.push(`✅ Closed ${action.issueId}`);

      } else if (action.type === 'wakeup') {
        await wakeupAgent(action.agentId, action.reason);
        results.push(`⚡ Woke up agent: ${action.reason}`);

      } else if (action.type === 'escalate_ceo') {
        // Create a CEO-assigned issue to escalate
        createIssue({
          title: `[${config.name} ESCALATION] ${action.message.slice(0, 80)}`,
          body: `Escalated by ${config.name}:\n\n${action.message}`,
          assigneeAgentId: '010acbc6-304f-4e92-a308-e005d5ea892e', // BIG BOSS CEO
          priority: 'high',
        });
        results.push(`🚨 Escalated to CEO`);
      }
    } catch (err) {
      console.error(`[pm-loop:${config.name}] action error:`, err.message);
    }
  }

  const analysis = response.split('\n')
    .filter(l => !l.trim().startsWith('ACTION:') && !l.startsWith('NO_ACTION'))
    .join('\n').trim().slice(0, 300);

  return { analysis, results };
}

export function startAllPMLoops(sendFn) {
  for (const config of PM_CONFIGS) {
    setTimeout(() => {
      async function tick() {
        try {
          const outcome = await runPMCycle(config, sendFn);
          if (outcome && outcome.results.length > 0 && sendFn) {
            const msg = [
              `🗂️ *${config.name} Cycle*`,
              outcome.analysis ? `_${outcome.analysis.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}_` : '',
              ...outcome.results,
            ].filter(Boolean).join('\n');
            await sendFn(msg);
          }
        } catch (err) {
          console.error(`[pm-loop:${config.name}] tick error:`, err.message);
        }
      }

      tick(); // Run once immediately after stagger delay
      setInterval(tick, config.intervalMs);
      console.log(`[pm-loop:${config.name}] loop started every ${config.intervalMs / 1000 / 60}min`);
    }, config.startDelayMs);
  }

  console.log(`[pm-loop] ${PM_CONFIGS.length} PM loops scheduled`);
}
