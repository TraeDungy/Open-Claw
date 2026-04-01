/**
 * BIG BOSS CEO Telegram Bot
 * Main entry point — initializes bot, notifier, CEO loop, digest cron
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env manually (no dotenv dep needed)
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, '.env');
try {
  const lines = readFileSync(envPath, 'utf8').split('\n');
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

import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { listIssues, listAgents, getDashboard, createIssue, commentIssue, updateIssue, wakeupAgent } from './paperclip.mjs';
import { startNotifier } from './notifier.mjs';
import { startCEOLoop, runCycle } from './ceo-loop.mjs';
import { startAllPMLoops } from './pm-loop.mjs';
import { generateDigest } from './digest.mjs';
import { chat } from './llm.mjs';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const CEO_ID = process.env.CEO_AGENT_ID;
const COMPANY_ID = process.env.COMPANY_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('Missing BOT_TOKEN or CHAT_ID');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function escMd(text) {
  return (text || '').replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

async function send(text) {
  try {
    await bot.sendMessage(CHAT_ID, text, {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    });
  } catch (err) {
    // Fallback: send as plain text
    try {
      await bot.sendMessage(CHAT_ID, text.replace(/[*_`\\]/g, ''), {
        disable_web_page_preview: true,
      });
    } catch (e2) {
      console.error('[bot] send error:', e2.message);
    }
  }
}

// ── Commands ────────────────────────────────────────────────────────────────

bot.onText(/\/start/, async () => {
  await send([
    `👑 *BIG BOSS CEO — Autonomous Mode*`,
    ``,
    `Running company operations without you\\. I create, assign, wake up, close, and reassign work autonomously\\.`,
    ``,
    `*Commands:*`,
    `/status — scoreboard`,
    `/priorities — what needs attention now`,
    `/issues — open critical issues`,
    `/blocked — blocked issues`,
    `/agents — fleet status`,
    `/wakeup \\[agent\\-name\\] — wake up an agent`,
    `/digest — generate briefing now`,
    `/cycle — trigger CEO cycle now`,
    `/push \\[message\\] — inject directive`,
    `/assign \\[issue\\-id\\] \\[agent\\-name\\] — reassign issue`,
    `/done \\[issue\\-id\\] — mark complete`,
    ``,
    `Or just message me — I\\'ll reason and act\\.`,
  ].join('\n'));
});

bot.onText(/\/status/, async () => {
  try {
    const dashboard = getDashboard();
    const agents = listAgents();
    const running = agents.filter(a => a.status === 'running').map(a => a.name).join(', ') || 'none';
    const errored = agents.filter(a => a.status === 'error').map(a => a.name).join(', ') || 'none';

    await send([
      `📊 *Company Status*`,
      ``,
      `*Tasks*`,
      `Open: ${dashboard?.tasks?.open} \\| In Progress: ${dashboard?.tasks?.inProgress} \\| Blocked: ${dashboard?.tasks?.blocked} \\| Done: ${dashboard?.tasks?.done}`,
      ``,
      `*Agents* \\(${dashboard?.agents?.active} active\\)`,
      `Running: ${escMd(running)}`,
      `Error: ${escMd(errored)}`,
      ``,
      `*Initiatives*`,
      `🎯 Revenue targets`,
      `🚀 Platform launches`,
      `📦 Content pipeline`,
      `📱 Social media rollout`,
      ``,
      `_Use /issues for task breakdown_`,
    ].join('\n'));
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/issues/, async () => {
  try {
    const inProgress = listIssues({ status: 'in_progress', limit: 10 });
    const critical = listIssues({ status: 'todo', priority: 'critical', limit: 15 });

    const fmt = (issues) => issues.map(i =>
      `• *${escMd(i.identifier)}* — ${escMd((i.title || '').slice(0, 60))}${i.assigneeAgentId ? '' : ' ⚠️'}`
    ).join('\n') || '_None_';

    await send([
      `📋 *Open Issues*`,
      ``,
      `*In Progress \\(${inProgress.length}\\)*`,
      fmt(inProgress),
      ``,
      `*Critical Todo \\(${critical.length}\\)*`,
      fmt(critical),
    ].join('\n'));
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/blocked/, async () => {
  try {
    const blocked = listIssues({ status: 'blocked', limit: 20 });
    if (blocked.length === 0) {
      await send(`✅ *No blocked issues right now\\.*`);
      return;
    }
    const lines = blocked.map(i =>
      `• *${escMd(i.identifier)}* — ${escMd((i.title || '').slice(0, 70))}`
    ).join('\n');
    await send(`🛑 *Blocked Issues \\(${blocked.length}\\)*\n\n${lines}`);
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/agents/, async () => {
  try {
    const agents = listAgents();
    const byStatus = {};
    for (const a of agents) {
      const s = a.status || 'unknown';
      if (!byStatus[s]) byStatus[s] = [];
      byStatus[s].push(a.name);
    }
    const lines = Object.entries(byStatus).map(([status, names]) => {
      const emoji = { running: '🟢', idle: '⚪️', error: '🔴', paused: '🟡' }[status] || '⚫️';
      return `${emoji} *${status}* \\(${names.length}\\): ${escMd(names.join(', '))}`;
    });
    await send(`🤖 *Agent Fleet*\n\n${lines.join('\n')}`);
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/digest/, async () => {
  await send(`_Generating daily briefing\\.\\.\\._`);
  try {
    const digest = await generateDigest();
    // Split long messages
    const chunks = digest.match(/[\s\S]{1,3800}/g) || [digest];
    for (const chunk of chunks) {
      await bot.sendMessage(CHAT_ID, chunk, { disable_web_page_preview: true });
    }
  } catch (err) {
    await send(`❌ Digest error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/cycle/, async () => {
  await send(`_Running CEO decision cycle\\.\\.\\._`);
  try {
    const outcome = await runCycle();
    if (!outcome) {
      await send(`✅ *No actions needed this cycle\\.*`);
      return;
    }
    const msg = [
      `🤖 *CEO Cycle Complete*`,
      ``,
      outcome.analysis ? outcome.analysis.slice(0, 400) : '',
      ``,
      `*Actions taken:*`,
      ...outcome.results,
    ].filter(Boolean).join('\n');
    await bot.sendMessage(CHAT_ID, msg, { disable_web_page_preview: true });
  } catch (err) {
    await send(`❌ Cycle error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/push (.+)/, async (msg, match) => {
  const directive = match[1].trim();
  await send(`_Processing directive\\.\\.\\._`);
  try {
    // Create a high-priority issue assigned to CEO with the directive
    const out = createIssue({
      title: `[OWNER DIRECTIVE] ${directive.slice(0, 100)}`,
      body: `Owner directive received via Telegram:\n\n${directive}\n\nCEO: review and delegate immediately.`,
      assigneeAgentId: CEO_ID,
      priority: 'critical',
    });
    await send(`✅ *Directive issued to BIG BOSS CEO*\n\n_"${escMd(directive.slice(0, 200))}"_`);
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/assign (\S+) (.+)/, async (msg, match) => {
  const issueId = match[1].trim();
  const agentName = match[2].trim().toLowerCase();
  try {
    // Find agent by name
    const agents = listAgents();
    const agent = agents.find(a => a.name.toLowerCase().includes(agentName));
    if (!agent) {
      await send(`❌ No agent found matching "${escMd(agentName)}"`);
      return;
    }
    updateIssue(issueId, { assigneeAgentId: agent.id });
    await send(`✅ Assigned *${escMd(issueId)}* to *${escMd(agent.name)}*`);
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/done (\S+)/, async (msg, match) => {
  const issueId = match[1].trim();
  try {
    updateIssue(issueId, { status: 'done' });
    await send(`✅ Marked *${escMd(issueId)}* as done\\.`);
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/priorities/, async () => {
  try {
    const critical = listIssues({ status: 'todo', priority: 'critical', limit: 20 });
    const blocked = listIssues({ status: 'blocked', limit: 10 });
    const unassigned = critical.filter(i => !i.assigneeAgentId);

    const fmtIssue = (i) => {
      const flag = !i.assigneeAgentId ? ' ⚠️' : '';
      return `• *${escMd(i.identifier)}* — ${escMd((i.title || '').slice(0, 70))}${flag}`;
    };

    const lines = [];
    if (critical.length > 0) {
      lines.push(`*🎯 Critical todo \\(${critical.length}\\)*`);
      lines.push(...critical.slice(0, 5).map(fmtIssue));
    }
    if (blocked.length > 0) {
      lines.push(`\n*🛑 Blocked \\(${blocked.length}\\)*`);
      lines.push(...blocked.slice(0, 5).map(fmtIssue));
    }
    if (unassigned.length > 0) {
      lines.push(`\n_${unassigned.length} critical with no owner — CEO will assign\\._`);
    }

    await send([`📌 *Priorities Right Now*`, ``, ...lines].join('\n'));
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

bot.onText(/\/wakeup (.+)/, async (msg, match) => {
  const agentName = match[1].trim().toLowerCase();
  try {
    const agents = listAgents();
    const agent = agents.find(a => a.name.toLowerCase().includes(agentName));
    if (!agent) {
      await send(`❌ No agent found matching "${escMd(agentName)}"`);
      return;
    }
    await wakeupAgent(agent.id, `Manual wakeup from owner via Telegram`);
    await send(`⚡ *${escMd(agent.name)}* has been woken up\\.`);
  } catch (err) {
    await send(`❌ Error: ${escMd(err.message)}`);
  }
});

// ── Free-text → CEO reasoning ───────────────────────────────────────────────

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  if (String(msg.chat.id) !== CHAT_ID) return;

  const userMessage = msg.text.trim();
  await bot.sendChatAction(CHAT_ID, 'typing');

  try {
    const dashboard = getDashboard();
    const agents = listAgents();
    const critical = listIssues({ status: 'todo', priority: 'critical', limit: 20 });

    const context = `
Dashboard: ${dashboard?.tasks?.open} open, ${dashboard?.tasks?.inProgress} in progress, ${dashboard?.tasks?.blocked} blocked
Agents: ${agents.length} total, ${agents.filter(a => a.status === 'running').length} running, ${agents.filter(a => a.status === 'error').length} in error
Top critical issues: ${critical.slice(0, 5).map(i => `[${i.identifier}] ${i.title}`).join(' | ')}
`.trim();

    const systemPrompt = `You are BIG BOSS CEO of Trial X Fire. You are direct, decisive, and focused on moving the business forward.

Current company context:
${context}

The owner is messaging you directly on Telegram. Respond concisely (2-4 sentences max unless they ask for detail).
If they ask you to do something actionable, say what you'll do and create appropriate Paperclip issues.
Be the CEO — confident, strategic, no fluff.`;

    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ], { maxTokens: 800 });

    await bot.sendMessage(CHAT_ID, response, { disable_web_page_preview: true });

  } catch (err) {
    await send(`❌ ${escMd(err.message)}`);
  }
});

// ── Startup ──────────────────────────────────────────────────────────────────

console.log('[big-boss-ceo-bot] starting up...');

// Start autonomous notifier (polls every 2min, pushes priorities on boot)
startNotifier(send);

// Start CEO autonomous loop (runs every 15min, 6 actions, full authority)
startCEOLoop(send);

// Start PM autonomous loops (Empire PM 30min, Media PM 30min, Revenue Ops 45min, SaaS PM 45min)
startAllPMLoops(send);

// Daily digest cron
const digestCron = process.env.DIGEST_CRON || '0 9 * * *';
cron.schedule(digestCron, async () => {
  console.log('[digest] running daily digest...');
  try {
    const digest = await generateDigest();
    await bot.sendMessage(CHAT_ID, `📅 *DAILY CEO BRIEFING*\n\n${digest}`, {
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.error('[digest] error:', err.message);
  }
}, { timezone: 'America/New_York' });

// Boot message
send([
  `👑 *BIG BOSS CEO — Online*`,
  ``,
  `*Autonomous operations active:*`,
  `• CEO cycle every 15min \\(create, assign, wake, close, reassign\\)`,
  `• Empire PM cycle every 30min`,
  `• Media PM cycle every 30min`,
  `• Revenue Ops cycle every 45min`,
  `• SaaS PM cycle every 45min`,
  `• Alerts every 2min`,
  `• Daily digest at 9am ET`,
  ``,
  `_Sending priorities now\\.\\.\\._`,
].join('\n'));

console.log('[big-boss-ceo-bot] online');
