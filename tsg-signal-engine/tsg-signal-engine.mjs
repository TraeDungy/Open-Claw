import "./env.mjs";
import { generateIntro } from "./llm.mjs";
import { listContacts, sendEmail } from "./resend.mjs";
import * as state from "./state.mjs";
import { DRIP_SEQUENCE, getDueDrips } from "./drip.mjs";
import { getCalendar, getWeekNumber, getCurrentEntry, getMonthlyDigest } from "./broadcast.mjs";
import { resolveEntry } from "./content.mjs";
import * as tpl from "./templates.mjs";
import { runScout, shouldRunScout, startApprovalServer } from "./content-scout.mjs";

const HOUR_MS = 60 * 60 * 1000;
const SEND_HOUR = parseInt(process.env.SEND_HOUR_UTC || "14", 10);

async function buildDripEmail(drop) {
  if (drop.type === "llm-generated") {
    const intro = await generateIntro(drop.llmPrompt);
    const fallback = "The signal continues. Each transmission brings you closer to the archive.";

    if (drop.id === "manifesto") return tpl.manifesto(intro || fallback);
    if (drop.id === "tool") return tpl.toolIntro(intro || fallback);
    if (drop.id === "open-signal") return tpl.openSignal(intro || fallback);
  }

  if (drop.type === "content-spotlight") {
    const entry = resolveEntry(drop.contentSource);
    if (!entry) return null;
    const prompt = `Write a 2-3 paragraph intro for this archive entry: "${entry.title || entry.name}". Summary: ${entry.summary || ""}`;
    const intro = await generateIntro(prompt);
    return tpl.contentSpotlight(entry, intro || entry.summary);
  }

  if (drop.type === "dual-spotlight") {
    const entries = drop.contentSources.map(s => resolveEntry(s)).filter(Boolean);
    if (entries.length === 0) return null;
    const names = entries.map(e => e.name || e.title).join(" and ");
    const prompt = `Write a 2-3 paragraph intro about these two subjects from the TSG archive: ${names}. They are part of the history of documented psychic phenomena.`;
    const intro = await generateIntro(prompt);
    return tpl.dualSpotlight(entries, intro || "They were documented. Their results were measured.");
  }

  return null;
}

async function processDrips(now) {
  const st = state.load();

  for (const [email, sub] of Object.entries(st.subscribers)) {
    if (sub.unsubscribed || sub.dripComplete) continue;
    if (!state.canSendToday()) { console.log("Daily send limit reached — stopping drips"); return; }

    const due = getDueDrips(sub, now);
    if (due.length === 0) continue;

    // Send only the first due drip per cycle (avoid overwhelming)
    const drop = due[0];
    try {
      console.log(`Drip: ${email} — day ${drop.day} (${drop.id})`);
      const result = await buildDripEmail(drop);
      if (!result) { console.warn(`  Skip: no content for ${drop.id}`); continue; }

      await sendEmail(email, result.subject, result.html);
      sub.dripIndex = drop.index + 1;
      sub.lastDripSent = now.toISOString();
      sub.totalSent++;
      state.incrementSendCount();
      console.log(`  Sent: ${result.subject}`);

      if (sub.dripIndex >= DRIP_SEQUENCE.length) {
        sub.dripComplete = true;
        console.log(`  Drip complete for ${email}`);
      }
    } catch (err) {
      console.error(`  Error sending drip to ${email}:`, err.message);
    }
  }
}

async function processBroadcasts(now) {
  const st = state.load();
  const currentWeek = `${now.getFullYear()}-W${getWeekNumber(now)}`;

  if (st.lastBroadcastWeek === currentWeek) return;

  const calendar = getCalendar();
  if (calendar.length === 0) return;

  for (const [email, sub] of Object.entries(st.subscribers)) {
    if (sub.unsubscribed || !sub.dripComplete) continue;
    if (!state.canSendToday()) { console.log("Daily send limit reached — stopping broadcasts"); return; }

    try {
      if (sub.cadence === "weekly") {
        const calEntry = getCurrentEntry(st.broadcastCursor);
        if (!calEntry) continue;

        const title = calEntry.entry?.title || calEntry.entry?.name || (calEntry.entry?.hz ? `${calEntry.entry.hz} Hz` : "Archive Entry");
        const prompt = `Write a 2-3 paragraph intro for this ${calEntry.type} from the TSG archive: "${title}". Summary: ${calEntry.entry?.summary || ""}`;
        const intro = await generateIntro(prompt);

        const result = tpl.weeklySignal(calEntry.entry, intro || calEntry.entry?.summary || "");
        await sendEmail(email, result.subject, result.html);
        sub.totalSent++;
        sub.lastBroadcastSent = now.toISOString();
        state.incrementSendCount();
        console.log(`Weekly: ${email} — ${title}`);
      } else if (sub.cadence === "monthly" && now.getDate() <= 7) {
        const entries = getMonthlyDigest(st.broadcastCursor);
        if (entries.length === 0) continue;

        const titles = entries.map(e => e.entry?.title || e.entry?.name || "").filter(Boolean).join(", ");
        const prompt = `Write a 2-3 paragraph intro for this month's TSG digest. The four entries are: ${titles}. Tie them together thematically.`;
        const intro = await generateIntro(prompt);

        const result = tpl.monthlyDigest(entries, intro || "This month's curated signal from the archive.");
        await sendEmail(email, result.subject, result.html);
        sub.totalSent++;
        sub.lastBroadcastSent = now.toISOString();
        state.incrementSendCount();
        console.log(`Monthly: ${email} — digest`);
      }
    } catch (err) {
      console.error(`Broadcast error for ${email}:`, err.message);
    }
  }

  st.broadcastCursor++;
  st.lastBroadcastWeek = currentWeek;
}

async function syncContacts() {
  const contacts = await listContacts();
  const st = state.load();

  for (const contact of contacts) {
    if (!st.subscribers[contact.email]) {
      const cadence = contact.last_name || "weekly";
      state.initSubscriber(contact.email, contact.created_at || new Date().toISOString(), cadence);
      console.log(`New subscriber: ${contact.email} (${cadence})`);
    }
    if (contact.unsubscribed) {
      st.subscribers[contact.email].unsubscribed = true;
    }
  }
}

async function runCycle() {
  const now = new Date();
  const hour = now.getUTCHours();

  console.log(`\n[${now.toISOString()}] Cycle start (UTC hour: ${hour}, send hour: ${SEND_HOUR})`);

  state.resetIfNewDay();

  try {
    await syncContacts();
  } catch (err) {
    console.error("Contact sync failed:", err.message);
    return;
  }

  // Only send emails during the preferred hour
  if (hour === SEND_HOUR) {
    await processDrips(now);
    await processBroadcasts(now);

    // Content Scout — weekly archive curation (Sundays at send hour)
    if (shouldRunScout(now)) {
      console.log("[Content Scout] Weekly scan triggered");
      await runScout().catch(err => console.error("[Content Scout] Error:", err.message));
    }
  } else {
    console.log(`Waiting for send hour (${SEND_HOUR} UTC). Synced contacts only.`);
  }

  const st = state.load();
  st.lastRun = now.toISOString();
  state.save();
  console.log(`Cycle complete. Daily sends: ${st.dailySendCount}`);
}

// Run immediately, then every hour
console.log("TSG Signal Engine starting...");
console.log(`Send hour: ${SEND_HOUR} UTC | Model: ${process.env.LITELLM_MODEL || "llm-kimi"}`);

// Start approval server for content scout
startApprovalServer().catch(err => console.error("Approval server error:", err.message));

runCycle().catch(console.error);
setInterval(() => runCycle().catch(console.error), HOUR_MS);
