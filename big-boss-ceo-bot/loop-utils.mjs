/**
 * Shared helpers for the autonomous loops (CEO, PMs, notifier).
 */

/**
 * Run fn on an interval using chained timeouts instead of setInterval,
 * so a slow cycle (hung LLM call, CLI timeout) can never overlap the next
 * one or stack up. Errors are caught and logged; the loop keeps going.
 */
export function startLoop(name, fn, { intervalMs, initialDelayMs = 0 }) {
  async function tick() {
    try {
      await fn();
    } catch (err) {
      console.error(`[${name}] tick error:`, err.message);
    } finally {
      setTimeout(tick, intervalMs);
    }
  }
  setTimeout(tick, initialDelayMs);
}

/**
 * Parse ACTION lines from an LLM response.
 * Tolerant of whitespace after the colon and logs unparseable JSON instead
 * of silently dropping it (malformed action lines were previously invisible).
 *
 * Returns [{ verb, params }] for JSON actions, [{ verb, message }] for
 * free-text actions like ESCALATE.
 */
export function parseActionLines(text) {
  const actions = [];
  for (const line of (text || '').split('\n')) {
    const m = line.trim().match(/^ACTION:\s*([A-Z_]+)\s*(.*)$/);
    if (!m) continue;
    const [, verb, rest] = m;
    if (rest.startsWith('{')) {
      try {
        actions.push({ verb, params: JSON.parse(rest) });
      } catch (err) {
        console.error(`[actions] unparseable ${verb} action (${err.message}): ${rest.slice(0, 150)}`);
      }
    } else {
      actions.push({ verb, message: rest });
    }
  }
  return actions;
}

function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Is this title effectively the same as one of the existing titles?
 * Exact normalized match always counts; containment only counts for
 * reasonably long titles so short generic words don't false-positive.
 */
export function isDuplicateTitle(title, existingTitles) {
  const norm = normalizeTitle(title);
  if (!norm) return false;
  return existingTitles.some(t => {
    const existing = normalizeTitle(t);
    if (!existing) return false;
    if (existing === norm) return true;
    const shorter = existing.length < norm.length ? existing : norm;
    const longer = existing.length < norm.length ? norm : existing;
    return shorter.length >= 20 && longer.includes(shorter);
  });
}
