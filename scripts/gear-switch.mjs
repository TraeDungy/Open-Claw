#!/usr/bin/env node
/**
 * Gear Switch — Toggle all claude_local agents between:
 *   GEAR 1 (premium): Claude auth via claude_local + claude-sonnet-4-6
 *   GEAR 2 (free):    NVIDIA free models via opencode_local + LiteLLM VPS
 *
 * Usage:
 *   node scripts/gear-switch.mjs --mode premium   # switch to Claude auth
 *   node scripts/gear-switch.mjs --mode free       # switch to NVIDIA free
 *   node scripts/gear-switch.mjs --status          # show current state
 *   node scripts/gear-switch.mjs --reset-spend     # reset all monthly spend to 0
 *   node scripts/gear-switch.mjs --resume-errors   # resume all error/paused agents
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const PAPERCLIP_API = 'http://localhost:3100/api';
const COMPANY_ID = '2f28832f-6750-4a2e-9f45-32ac3da9c458';
const STATE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.gear-switch-state.json');

// GEAR MODES
// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM: claude_local + sonnet-4-6  — best reasoning via Claude Code auth
// ECONOMY: claude_local + haiku       — faster, lower estimated spend, still auth
// FREE:    openclaw_gateway            — NVIDIA free tier via VPS LiteLLM
//          (gateway agents already use free models — not switched here)
//          To add new free agents, configure them as openclaw_gateway on VPS.
//
// VPS LiteLLM free model routing (http://5.78.44.176/ai):
//   gpt-4o  → kimi-k2.5      (GPT-4 level, long context)
//   gpt-4   → deepseek-v3.2  (best OSS coder)
//   llm-qwen35, llm-step35, llm-nemotron-nano also available

// Economy = haiku for all roles (fast, low budget burn)
const ECONOMY_MODEL = 'claude-haiku-4-5-20251001';

// Premium model by role
const PREMIUM_MODEL_BY_ROLE = {
  ceo: 'claude-sonnet-4-6',
  engineer: 'claude-sonnet-4-6',
  pm: 'claude-haiku-4-5-20251001',
  researcher: 'claude-sonnet-4-6',
  default: 'claude-haiku-4-5-20251001',
};

async function apiGet(path) {
  const res = await fetch(`${PAPERCLIP_API}${path}`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${PAPERCLIP_API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiPost(path, body = {}) {
  const res = await fetch(`${PAPERCLIP_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

function loadState() {
  if (!existsSync(STATE_FILE)) return {};
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function inferRole(agent) {
  const name = (agent.name || '').toLowerCase();
  const role = (agent.role || '').toLowerCase();
  if (role === 'ceo' || name.includes('ceo') || name.includes('boss')) return 'ceo';
  if (name.includes('engineer') || name.includes('dev') || name.includes('builder')) return 'engineer';
  if (name.includes('pm') || name.includes('manager')) return 'pm';
  if (name.includes('research') || name.includes('analyst')) return 'researcher';
  return 'default';
}

async function getAgents() {
  const data = await apiGet(`/companies/${COMPANY_ID}/agents`);
  return Array.isArray(data) ? data : (data.agents || data.data || []);
}

async function showStatus() {
  const agents = await getAgents();
  const state = loadState();
  const currentGear = state.currentGear || 'unknown';

  console.log(`\n⚙️  Current Gear: ${currentGear.toUpperCase()}\n`);
  console.log('Agent'.padEnd(40) + 'Adapter'.padEnd(18) + 'Status'.padEnd(10) + 'Spent');
  console.log('─'.repeat(80));

  for (const a of agents) {
    const spent = (a.spentMonthlyCents / 100).toFixed(2);
    const budget = a.budgetMonthlyCents ? `/$${(a.budgetMonthlyCents / 100).toFixed(0)}` : '';
    const spentStr = spent > 0 ? `$${spent}${budget}` : '-';
    const statusIcon = a.status === 'idle' ? '✓' : a.status === 'error' ? '✗' : a.status === 'paused' ? '⏸' : '~';
    console.log(
      `${statusIcon} ${a.name.padEnd(38)} ${a.adapterType.padEnd(18)} ${a.status.padEnd(10)} ${spentStr}`
    );
  }

  const totalSpent = agents.reduce((s, a) => s + (a.spentMonthlyCents || 0), 0) / 100;
  console.log(`\n💰 Total estimated spend this month: $${totalSpent.toFixed(2)}`);

  const errors = agents.filter(a => a.status === 'error').length;
  const paused = agents.filter(a => a.status === 'paused').length;
  console.log(`⚠️  Agents in error: ${errors}, paused: ${paused}\n`);
}

async function resetSpend() {
  const agents = await getAgents();
  let reset = 0;
  for (const a of agents) {
    if ((a.spentMonthlyCents || 0) > 0) {
      await apiPatch(`/agents/${a.id}`, { spentMonthlyCents: 0 });
      reset++;
      process.stdout.write(`  ↺ Reset spend for ${a.name} ($${(a.spentMonthlyCents/100).toFixed(2)})\n`);
    }
  }
  console.log(`\n✅ Reset spend for ${reset} agents`);
}

async function resumeErrors() {
  const agents = await getAgents();
  let resumed = 0;
  for (const a of agents) {
    if (a.status === 'error' || a.status === 'paused') {
      await apiPost(`/agents/${a.id}/resume`);
      console.log(`  ▶ Resumed ${a.name} (was ${a.status})`);
      resumed++;
    }
  }
  console.log(`\n✅ Resumed ${resumed} agents`);
}

async function switchToEconomy() {
  const agents = await getAgents();
  const state = loadState();

  // Save current model so we can restore to premium
  const saved = state.premiumModels || {};

  const claudeAgents = agents.filter(a => a.adapterType === 'claude_local');
  console.log(`\n🔄 Switching ${claudeAgents.length} claude_local agents → ECONOMY (haiku, lower budget burn)\n`);

  for (const a of claudeAgents) {
    const ac = a.adapterConfig || {};
    const currentModel = ac.model || ECONOMY_MODEL;

    // Save current model
    if (!saved[a.id]) {
      saved[a.id] = { name: a.name, model: currentModel };
    }

    const result = await apiPatch(`/agents/${a.id}`, {
      adapterConfig: { model: ECONOMY_MODEL },
    });
    if (result.error) {
      console.log(`  ✗ ${a.name}: ${result.error}`);
    } else {
      console.log(`  ✓ ${a.name} → haiku (was: ${currentModel})`);
    }
  }

  // Show gateway agents (already free)
  const gatewayAgents = agents.filter(a => a.adapterType === 'openclaw_gateway');
  if (gatewayAgents.length > 0) {
    console.log(`\n  ℹ️  Gateway agents (already on free NVIDIA tier): ${gatewayAgents.map(a => a.name).join(', ')}`);
  }

  state.premiumModels = saved;
  state.currentGear = 'economy';
  state.switchedAt = new Date().toISOString();
  saveState(state);

  console.log(`\n✅ Economy mode — all claude_local agents using haiku (fast + low budget burn)`);
  console.log(`   openclaw_gateway agents unchanged (already on NVIDIA free tier)\n`);
}

async function switchToPremium() {
  const agents = await getAgents();
  const state = loadState();
  const claudeAgents = agents.filter(a => a.adapterType === 'claude_local');
  console.log(`\n🔄 Switching ${claudeAgents.length} claude_local agents → PREMIUM (Claude auth, sonnet-4-6)\n`);

  for (const a of claudeAgents) {
    const role = inferRole(a);
    const model = PREMIUM_MODEL_BY_ROLE[role];

    const result = await apiPatch(`/agents/${a.id}`, {
      adapterConfig: { model },
    });
    if (result.error) {
      console.log(`  ✗ ${a.name}: ${result.error}`);
    } else {
      console.log(`  ✓ ${a.name} [${role}] → ${model}`);
    }
  }

  state.currentGear = 'premium';
  state.switchedAt = new Date().toISOString();
  saveState(state);

  console.log(`\n✅ PREMIUM mode — CEO/Engineer/Researcher on sonnet-4-6, PM/others on haiku`);
  console.log(`   Claude Code auth — no external API cost\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.find(a => a.startsWith('--mode='))?.split('=')[1]
    || (args.includes('--mode') ? args[args.indexOf('--mode') + 1] : null);

  if (args.includes('--status') || args.length === 0) {
    await showStatus();
    return;
  }

  if (args.includes('--reset-spend')) {
    console.log('↺ Resetting all monthly spend...\n');
    await resetSpend();
  }

  if (args.includes('--resume-errors')) {
    console.log('▶ Resuming all error/paused agents...\n');
    await resumeErrors();
  }

  if (mode === 'free' || mode === 'economy') {
    await switchToEconomy();
  } else if (mode === 'premium') {
    await switchToPremium();
  } else if (mode) {
    console.error(`Unknown mode: ${mode}. Use 'premium' or 'free'`);
    process.exit(1);
  }

  if (args.includes('--reset-spend') || args.includes('--resume-errors') || mode) {
    await showStatus();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
