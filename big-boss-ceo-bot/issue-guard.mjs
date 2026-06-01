/**
 * Issue Guard — prevents spam issue creation
 *
 * Shared by CEO loop, PM loops, and error-triage.
 * Three layers of protection:
 *   1. Keyword blocklist — blocks known noise patterns
 *   2. Rate limit — max 5 new issues per hour per source
 *   3. Title dedup — blocks if similar issue already exists (open)
 */
import { listIssues } from "./paperclip.mjs";

const RATE_WINDOW_MS = 3600000; // 1 hour
const MAX_PER_HOUR = 5;

// Track recent creations per source
const recentCreations = new Map();

// Patterns that should NEVER become issues
const BLOCKLIST = [
  /\[lightrag\]/i,
  /CEO-routed:.*TimeoutError/i,
  /CEO-routed:.*Failed to extract/i,
  /CEO-routed:.*WorkerTimeoutError/i,
  /CEO-routed:.*chunk-/i,
  /Recurring error:.*TimeoutError/i,
  /Recurring error:.*WARNING/i,
  /TRIAGE.*New agent needed/i,
  /ESCALATION.*TRI-\d+.*deadline/i,
  /ESCALATION.*API Contract/i,
  /Assign and (Prioritize|Execute|Start|Initiate) TRI-/i,
  /URGENT.*Agent Utilization/i,
  /Reassign.*Blocked Tasks/i,
  /Reallocate Tasks from/i,
  /Unblock Founding Engineer/i,
  /Assign ownership for blocked/i,
  /Restart Errored Agents/i,
  /Brand Bible Published/i,
  /Assign owner for landing/i,
  /Assign High-Priority Todo/i,
  /Delegate.*Audit to available/i,
  /\[error-triage\] CEO-routed/i,
  /LLM call failed/i,
  /NumPy Compatibility/i,
  /LLM Output Validator/i,
  /LLM Worker.*Specialist/i,
  /LLM Worker.*Optimizer/i,
  /Error Triage Specialist/i,
  /Entity Extraction Specialist/i,
  /LLM Optimizer/i,
  /Assign.*unowned.*critical/i,
  /Assign.*Infrastructure Recovery/i,
  /Restore R2.*Airtable/i,
  /Restore.*TTS Services/i,
  /Restart TTS Services/i,
  /Agent Fleet Recovery/i,
  /Activate.*Idle Agent Fleet/i,
  /Critical Agent System Recovery/i,
  /Phase 1 Credentials Chase/i,
  /Assign Phase 1/i,
  /Assign TRI-\d+/i,
];

function similar(a, b) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return true;
  if (na.length > 10 && nb.length > 10 && (na.includes(nb) || nb.includes(na))) return true;
  const wa = new Set(na.split(" "));
  const wb = new Set(nb.split(" "));
  const overlap = [...wa].filter(w => wb.has(w) && w.length > 3).length;
  const maxWords = Math.max(wa.size, wb.size);
  return maxWords > 0 && overlap / maxWords > 0.6;
}

export async function shouldCreateIssue(title, source = "unknown") {
  // Layer 1: Blocklist
  for (const pattern of BLOCKLIST) {
    if (pattern.test(title)) {
      console.log(`[issue-guard] BLOCKED (blocklist): "${title.slice(0, 60)}" from ${source}`);
      return { allowed: false, reason: "BLOCKLIST" };
    }
  }

  // Layer 2: Rate limit
  const now = Date.now();
  if (!recentCreations.has(source)) recentCreations.set(source, []);
  const timestamps = recentCreations.get(source).filter(t => now - t < RATE_WINDOW_MS);
  recentCreations.set(source, timestamps);

  // Purge empty map entries to prevent unbounded growth
  for (const [src, times] of recentCreations) {
    if (times.length === 0) recentCreations.delete(src);
  }

  if (timestamps.length >= MAX_PER_HOUR) {
    console.log(`[issue-guard] BLOCKED (rate limit): ${source} at ${timestamps.length}/${MAX_PER_HOUR} per hour`);
    return { allowed: false, reason: "RATE_LIMIT" };
  }

  // Layer 3: Dedup
  try {
    const [todo, blocked, backlog] = await Promise.all([
      listIssues({ status: "todo", limit: 100 }),
      listIssues({ status: "blocked", limit: 50 }),
      listIssues({ status: "backlog", limit: 50 }),
    ]);
    const allOpen = [...todo, ...blocked, ...backlog];
    for (const existing of allOpen) {
      if (similar(title, existing.title || "")) {
        console.log(`[issue-guard] BLOCKED (dedup): "${title.slice(0, 40)}" ≈ "${(existing.title || "").slice(0, 40)}"`);
        return { allowed: false, reason: "DEDUP" };
      }
    }
  } catch {
    // Can't check — allow but warn
  }

  // Allowed
  timestamps.push(now);
  return { allowed: true };
}
