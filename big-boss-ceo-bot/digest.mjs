/**
 * Daily digest — sent every morning at 9am
 * Summarizes all 5 initiatives using LiteLLM
 */
import { listIssues, listAgents, getDashboard } from './paperclip.mjs';
import { chat } from './llm.mjs';

const INITIATIVES = [
  'revenue targets',
  'platform launches',
  'content pipeline completion',
  'social media brand rollout',
  'priority issues',
];

export async function generateDigest() {
  const dashboard = getDashboard();
  const inProgress = listIssues({ status: 'in_progress', limit: 30 });
  const blocked = listIssues({ status: 'blocked', limit: 20 });
  const done = listIssues({ status: 'done', limit: 20 });
  const critical = listIssues({ priority: 'critical', limit: 40 });
  const agents = listAgents();

  const errorAgents = agents.filter(a => a.status === 'error');
  const runningAgents = agents.filter(a => a.status === 'running');

  const issueLines = (issues) =>
    issues.map(i => `- [${i.identifier}] ${i.title} (${i.status || '?'}${i.assigneeAgentId ? '' : ' — UNASSIGNED'})`).join('\n');

  const context = `
DAILY BRIEFING — ${new Date().toDateString()}

DASHBOARD:
Open: ${dashboard?.tasks?.open} | In Progress: ${dashboard?.tasks?.inProgress} | Blocked: ${dashboard?.tasks?.blocked} | Done: ${dashboard?.tasks?.done}
Running agents: ${runningAgents.map(a => a.name).join(', ') || 'none'}
Agents in error: ${errorAgents.map(a => a.name).join(', ') || 'none'}

IN PROGRESS:
${issueLines(inProgress) || 'None'}

BLOCKED:
${issueLines(blocked) || 'None'}

COMPLETED TODAY/THIS CYCLE:
${issueLines(done) || 'None'}

CRITICAL BACKLOG:
${issueLines(critical) || 'None'}
`.trim();

  const prompt = `You are BIG BOSS CEO. Write a concise daily digest (max 400 words) covering:

1. Each of these 5 initiatives — status (on track / at risk / blocked / done):
   - Revenue targets
   - Platform launches
   - Content pipeline completion
   - Social media brand rollout
   - Priority issues

2. Top 3 wins since yesterday
3. Top 3 blockers that need attention
4. Your #1 priority action for today

Be direct. No fluff. CEO voice.

DATA:
${context}`;

  const response = await chat([
    { role: 'user', content: prompt },
  ], { maxTokens: 1500 });

  return response;
}
