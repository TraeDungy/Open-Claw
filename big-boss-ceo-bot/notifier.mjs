/**
 * Notifier — polls Paperclip every 2 minutes
 * Proactive alerts for:
 *   1. New issues assigned to BIG BOSS CEO
 *   2. Issues completed (done/cancelled)
 *   3. New agent-creation proposals
 *   4. Agents in error state
 *   5. Blocked issues with no owner (stale blockers)
 *   6. Unassigned critical backlog (> CRITICAL_ALERT_THRESHOLD)
 *   7. Startup priorities push
 */
import { listIssues, listAgents } from './paperclip.mjs';
import { hasSeen, markSeen, setLastPoll } from './state.mjs';

const CEO_ID = process.env.CEO_AGENT_ID;

// How many unassigned critical issues trigger a proactive alert
const CRITICAL_UNASSIGNED_THRESHOLD = 3;
// Minutes before a blocked issue with no owner is flagged as stale
const STALE_BLOCKED_MINUTES = 30;

// Seconds since epoch of last "unassigned critical" alert (rate-limit to once/hour)
let lastUnassignedAlert = 0;

const AGENT_PROPOSAL_PATTERNS = [
  /create.*agent/i,
  /new agent/i,
  /propose.*agent/i,
  /agent.*proposal/i,
  /spin up.*agent/i,
];

function isAgentProposal(issue) {
  return AGENT_PROPOSAL_PATTERNS.some(p =>
    p.test(issue.title || '') || p.test(issue.body || '')
  );
}

function escapeMarkdown(text) {
  return (text || '').replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

export { isAgentProposal as _isAgentProposal, escapeMarkdown as _escapeMarkdown };

// Push the top 3 priorities on startup so owner knows what's hot immediately
async function pushStartupPriorities(sendFn) {
  try {
    const critical = listIssues({ status: 'todo', priority: 'critical', limit: 20 });
    const blocked = listIssues({ status: 'blocked', limit: 10 });
    const unassigned = critical.filter(i => !i.assigneeAgentId).slice(0, 5);

    if (critical.length === 0 && blocked.length === 0) return;

    const lines = [];

    if (critical.length > 0) {
      lines.push(`*🎯 Top critical (${critical.length} total):*`);
      for (const i of critical.slice(0, 3)) {
        const flag = !i.assigneeAgentId ? ' ⚠️ unassigned' : '';
        lines.push(`• *${escapeMarkdown(i.identifier)}* — ${escapeMarkdown((i.title || '').slice(0, 60))}${flag}`);
      }
    }

    if (blocked.length > 0) {
      lines.push(`\n*🛑 Blocked (${blocked.length}):*`);
      for (const i of blocked.slice(0, 3)) {
        lines.push(`• *${escapeMarkdown(i.identifier)}* — ${escapeMarkdown((i.title || '').slice(0, 60))}`);
      }
    }

    if (unassigned.length > 0) {
      lines.push(`\n_${unassigned.length} critical issue(s) have no owner — CEO will assign\\._`);
    }

    await sendFn([
      `📌 *Attention now:*`,
      ``,
      ...lines,
    ].join('\n'));
  } catch (err) {
    console.error('[notifier] startup priorities error:', err.message);
  }
}

export function startNotifier(sendFn) {
  const interval = parseInt(process.env.POLL_INTERVAL_MS || '120000');

  // Push priorities immediately on boot
  setTimeout(() => pushStartupPriorities(sendFn), 5000);

  async function poll() {
    try {
      setLastPoll(new Date().toISOString());

      // 1. Issues assigned to CEO (new)
      const ceoIssues = listIssues({ assigneeAgentId: CEO_ID, limit: 30 });
      for (const issue of ceoIssues) {
        if (!issue.id) continue;
        if (!hasSeen(issue.id, 'assigned')) {
          markSeen(issue.id, 'assigned');
          const priority = (issue.priority || 'normal').toUpperCase();
          const status = issue.status || 'todo';
          await sendFn([
            `📋 *New issue assigned to CEO*`,
            ``,
            `*${escapeMarkdown(issue.identifier)}* — ${escapeMarkdown(issue.title)}`,
            `Priority: ${priority} \\| Status: ${status}`,
          ].join('\n'));
        }
      }

      // 2. Recently completed issues
      const doneIssues = listIssues({ status: 'done', limit: 20 });
      for (const issue of doneIssues) {
        if (!issue.id) continue;
        if (!hasSeen(issue.id, 'done')) {
          markSeen(issue.id, 'done');
          await sendFn([
            `✅ *Task completed*`,
            ``,
            `*${escapeMarkdown(issue.identifier)}* — ${escapeMarkdown(issue.title)}`,
          ].join('\n'));
        }
      }

      // 3. Agent proposal issues
      const allCritical = listIssues({ priority: 'critical', limit: 50 });
      for (const issue of allCritical) {
        if (!issue.id) continue;
        if (isAgentProposal(issue) && !hasSeen(issue.id, 'proposal')) {
          markSeen(issue.id, 'proposal');
          await sendFn([
            `🤖 *New Agent Proposal*`,
            ``,
            `*${escapeMarkdown(issue.identifier)}* — ${escapeMarkdown(issue.title)}`,
            ``,
            `CEO will review and act autonomously\\.`,
          ].join('\n'));
        }
      }

      // 4. Agents in error state
      const agents = listAgents();
      for (const agent of agents) {
        if (agent.status === 'error' && !hasSeen(agent.id, 'error')) {
          markSeen(agent.id, 'error');
          await sendFn(`⚠️ *Agent error:* ${escapeMarkdown(agent.name)}\nCEO will investigate and reassign work\\.`);
        }
      }

      // 5. Stale blocked issues — blocked with no assignee (alert once per issue)
      const blocked = listIssues({ status: 'blocked', limit: 30 });
      const unownedBlocked = blocked.filter(i => !i.assigneeAgentId);
      for (const issue of unownedBlocked) {
        if (!issue.id) continue;
        if (!hasSeen(issue.id, 'stale_blocked')) {
          markSeen(issue.id, 'stale_blocked');
          await sendFn([
            `🛑 *Blocked with no owner*`,
            ``,
            `*${escapeMarkdown(issue.identifier)}* — ${escapeMarkdown((issue.title || '').slice(0, 80))}`,
            `_CEO will assign or unblock in next cycle\\._`,
          ].join('\n'));
        }
      }

      // 6. Unassigned critical backlog — alert owner if threshold exceeded (once/hour)
      const unassignedCritical = allCritical.filter(i => !i.assigneeAgentId && i.status !== 'done');
      const now = Date.now();
      if (
        unassignedCritical.length >= CRITICAL_UNASSIGNED_THRESHOLD &&
        now - lastUnassignedAlert > 60 * 60 * 1000
      ) {
        lastUnassignedAlert = now;
        const topIssues = unassignedCritical.slice(0, 3).map(i =>
          `• *${escapeMarkdown(i.identifier)}* — ${escapeMarkdown((i.title || '').slice(0, 60))}`
        ).join('\n');
        await sendFn([
          `⚡ *${unassignedCritical.length} critical issues have no owner*`,
          ``,
          topIssues,
          ``,
          `_CEO loop will assign these — or use /cycle to act now\\._`,
        ].join('\n'));
      }

    } catch (err) {
      console.error('[notifier] poll error:', err.message);
    }
  }

  poll();
  setInterval(poll, interval);
  console.log(`[notifier] polling every ${interval / 1000}s`);
}
