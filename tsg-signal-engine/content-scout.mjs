/**
 * TSG Content Scout — Weekly Agentic Archive Curator
 *
 * Runs weekly: scans existing archive for gaps, searches the web for new
 * content (declassified docs, studies, researchers, frequencies, UAP disclosure),
 * generates 12+ recommendations in exact archive JSON format, emails admin
 * for approval with easy select mechanism.
 *
 * On approval → updates data/files.json + data/frequencies.json → rebuilds site.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { atomicWriteJSON } from "./atomic-write.mjs";
import { invalidateCache } from "./content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILES_PATH = join(__dirname, "data/files.json");
const FREQ_PATH = join(__dirname, "data/frequencies.json");
const SCOUT_STATE = join(__dirname, "scout-state.json");

const LITELLM_URL = () => process.env.LITELLM_BASE_URL || "http://127.0.0.1:9000/v1";
const SCOUT_MODEL = () => process.env.SCOUT_MODEL || process.env.LITELLM_MODEL || "llm-kimi";
const RESEND_KEY = () => process.env.RESEND_API_KEY;
const FROM_EMAIL = () => process.env.FROM_EMAIL || "TSG <onboarding@resend.dev>";
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || "trae.dungy@gmail.com";
const SITE_URL = () => process.env.SITE_URL || "http://5.78.227.123/tsg";
const APPROVAL_PORT = parseInt(process.env.SCOUT_APPROVAL_PORT || "3095", 10);

// ─── Load current archive ───────────────────────────────────────

function loadArchive() {
  const files = JSON.parse(readFileSync(FILES_PATH, "utf8"));
  const freq = JSON.parse(readFileSync(FREQ_PATH, "utf8"));
  return { files, freq };
}

function getExistingTitles(archive) {
  const titles = new Set();
  for (const arr of Object.values(archive.files)) {
    for (const e of arr) titles.add((e.title || e.name || "").toLowerCase());
  }
  for (const arr of Object.values(archive.freq)) {
    for (const e of arr) titles.add((e.name || e.title || `${e.hz}hz`).toLowerCase());
  }
  return titles;
}

// ─── Web search via OpenRouter (Perplexity sonar) ───────────────

async function webSearch(query) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) { console.warn("No OPENROUTER_API_KEY — skipping web search"); return ""; }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "perplexity/sonar",
        messages: [{ role: "user", content: query }],
        max_tokens: 4096,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch { return ""; }
}

// ─── LLM call ───────────────────────────────────────────────────

async function llmCall(systemPrompt, userPrompt) {
  try {
    const res = await fetch(`${LITELLM_URL()}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: SCOUT_MODEL(),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8192,
      }),
    });
    if (!res.ok) { console.error(`LLM ${res.status}`); return null; }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) { console.error("LLM error:", err.message); return null; }
}

// ─── Generate recommendations ───────────────────────────────────

const SCOUT_SYSTEM = `You are the TSG Content Scout — a research agent for the Telekinesis Support Group archive.

Your job: find NEW, high-quality content that belongs in our archive. The archive covers:
- DECLASSIFIED: Government programs studying psi/consciousness (CIA, DIA, NSA, military)
- DISCLOSURE: UAP/UFO releases, congressional hearings, whistleblower testimony
- STUDIES: Peer-reviewed research on psi, consciousness, remote viewing, psychokinesis, siddhi abilities
- INDIVIDUALS: Documented practitioners, researchers, subjects with verifiable results across ALL abilities
- SCHOOLS: Research institutions, training centers, academic programs, monasteries, lineages
- FREQUENCIES: Sound healing research, brainwave entrainment, vibroacoustic therapy
- MEDIA: Documentaries, books, video essays, archives, government portals, YouTube recommendations
- TELEKINESIS: Psychokinesis, macro-PK, micro-PK, PEAR Lab, random number generators
- LEVITATION: Documented cases, yogic flying, acoustic levitation, historical accounts with witnesses
- DEMATERIALIZATION: Object disappearance, Zhang Baosheng experiments, apport phenomena
- INVINCIBILITY: Tummo, fire immunity, extreme physical resilience under controlled observation
- PHYSICAL METAMORPHOSIS: Body transformation, rainbow body, documented physical changes
- WATER/FIRE BENDING: Hydrokinesis, pyrokinesis, documented elemental manipulation research
- PHYSICAL MANIFESTATION: Materialization, ectoplasm research, séance phenomena under controlled conditions
- DREAM TRAVEL: Lucid dreaming research, astral projection, out-of-body experiences (Monroe Institute, Gateway Process)
- BILOCATION: Documented bilocation cases, Padre Pio, remote presence, quantum consciousness theories
- SIDDHI ABILITIES: Yoga Sutras siddhis, Buddhist supernatural powers, documented meditation attainments
- VIDEO RECOMMENDATIONS: YouTube, streaming docs, lectures, interviews with researchers and practitioners

RULES:
- Every recommendation must have VERIFIABLE sources (official government sites, academic journals, reputable archives, credible video channels)
- Never recommend fringe blogs, conspiracy sites, or unverifiable claims
- Every link must be real and accessible
- Match the existing archive's evidence-based, "no claims just documents" tone
- DO NOT recommend anything already in the archive (check the existing titles list)
- Focus on primary sources: declassified documents, published papers, official records, credible practitioners with documented results
- For video recommendations: prioritize academic lectures, researcher interviews, well-produced documentaries, and channels with high production value
- Output ONLY valid JSON — no markdown, no commentary, no backticks`;

const CATEGORIES_TO_SEARCH = [
  // Core archive categories
  { cat: "declassified", query: "newly declassified government documents psychic phenomena remote viewing consciousness telekinesis research 2024 2025 2026 FOIA", fields: "title, agency, year, classification, summary, documents (array of {label, url}), details" },
  { cat: "disclosure", query: "UAP UFO disclosure 2025 2026 congressional hearing whistleblower AARO PURSUE program new releases", fields: "title, agency, year, classification, summary, documents (array of {label, url}), details" },
  { cat: "studies", query: "peer reviewed research consciousness psi telekinesis psychokinesis levitation siddhi brainwave entrainment 2023 2024 2025 published study", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "individuals", query: "documented psychic practitioners telekinesis levitation bilocation fire immunity tummo remote viewing verified results biography", fields: "name, era, origin, bio, notable, links (array of {label, url})" },
  { cat: "frequencies", query: "new research healing frequencies vibroacoustic therapy brainwave entrainment binaural beats 40Hz gamma sound therapy siddhi 2024 2025 published", fields: "hz (number), name, summary, details, evidence, links (array of {label, url})" },

  // Expanded consciousness phenomena categories
  { cat: "studies", query: "telekinesis psychokinesis research macro PK micro PK PEAR Lab random number generator mind over matter scientific study documented", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "levitation acoustic levitation yogic flying TM sidhi program documented cases scientific research controlled observation", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "dematerialization apport phenomena Zhang Baosheng Chinese EHF exceptional human function object teleportation research documented", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "tummo meditation fire immunity invincibility Wim Hof ice man extreme physical resilience controlled scientific study body temperature", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "rainbow body physical metamorphosis Buddhist Tibetan body transformation documented cases dzogchen tukdam death meditation", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "lucid dreaming astral projection out of body experience OBE Monroe Institute Gateway Process dream travel scientific research", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "bilocation documented cases Padre Pio remote presence quantum consciousness simultaneous location research", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "siddhi abilities yoga sutras supernatural powers Buddhist jhana meditation attainments eight siddhis documented research", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "pyrokinesis hydrokinesis elemental manipulation fire starting water bending human bioelectricity electrokinesis research documented", fields: "title, org, year, summary, links (array of {label, url}), details" },
  { cat: "studies", query: "physical manifestation materialization ectoplasm research controlled séance phenomena Scole experiment Philip experiment", fields: "title, org, year, summary, links (array of {label, url}), details" },

  // Media + video recommendations
  { cat: "media", query: "best documentaries consciousness psychic phenomena telekinesis UAP 2024 2025 2026 streaming YouTube", fields: "title, type (Documentary/Book/Archive/Report/Podcast), desc, url" },
  { cat: "media", query: "best YouTube channels videos lectures consciousness research remote viewing telekinesis siddhi abilities meditation science 2024 2025", fields: "title, type (Video/YouTube/Lecture/Interview), desc, url" },

  // Afrofuturism — art, film, creators, literature, music, visual art
  { cat: "media", query: "afrofuturism art artists 2024 2025 visual art painting sculpture digital art exhibitions galleries Black futurism contemporary", fields: "title, type (Art/Artist/Exhibition), desc, url" },
  { cat: "media", query: "afrofuturism film movies short films directors Black sci-fi cinema 2023 2024 2025 2026 independent streaming", fields: "title, type (Film/Short Film/Series), desc, url" },
  { cat: "media", query: "afrofuturism books novels authors Black speculative fiction science fiction Octavia Butler NK Jemisin new releases 2024 2025", fields: "title, type (Book/Novel/Anthology/Graphic Novel), desc, url" },
  { cat: "media", query: "afrofuturism music musicians producers Black electronic experimental jazz Sun Ra Flying Lotus Janelle Monae contemporary 2024 2025", fields: "title, type (Music/Album/Artist), desc, url" },
  { cat: "individuals", query: "afrofuturism creators pioneers artists filmmakers writers Black futurism visionaries consciousness African diaspora mythology Yoruba cosmology", fields: "name, era, origin, bio, notable, links (array of {label, url})" },
  { cat: "media", query: "afrofuturism video essay documentary African mythology Yoruba Dogon cosmology Kemetic science Egyptian technology ancient African civilizations", fields: "title, type (Documentary/Video Essay/Lecture), desc, url" },
];

export async function runScout() {
  console.log("\n[Content Scout] Starting weekly scan...");

  const archive = loadArchive();
  const existing = getExistingTitles(archive);
  console.log(`[Content Scout] Archive has ${existing.size} existing entries`);

  const allRecommendations = [];

  for (const { cat, query, fields } of CATEGORIES_TO_SEARCH) {
    console.log(`[Content Scout] Searching: ${cat}...`);

    // Web search for fresh content
    const searchResults = await webSearch(query);

    // Get existing titles for this category
    const catTitles = [];
    const catData = cat === "frequencies" ? archive.freq : archive.files;
    const catKey = cat === "frequencies" ? "solfeggio" : cat; // frequencies uses subcategories
    for (const [key, arr] of Object.entries(catData)) {
      if (cat === "frequencies" || key === cat) {
        for (const e of arr) catTitles.push(e.title || e.name || `${e.hz}hz`);
      }
    }

    const userPrompt = `Search results for "${cat}" category:\n\n${searchResults || "(no web results available — use your training knowledge)"}\n\nExisting entries in this category (DO NOT duplicate):\n${catTitles.join(", ")}\n\nGenerate 2-3 NEW entries for the "${cat}" category that are NOT already in the archive.\n\nEach entry must have these exact fields: ${fields}\n\nOutput as a JSON array. Every link/URL must be real and verifiable. Focus on primary sources.`;

    const result = await llmCall(SCOUT_SYSTEM, userPrompt);
    if (!result) { console.log(`  No results for ${cat}`); continue; }

    try {
      // Extract JSON from response
      let json = result;
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) json = jsonMatch[0];
      const entries = JSON.parse(json);

      // Filter out duplicates
      const fresh = entries.filter(e => {
        const title = (e.title || e.name || "").toLowerCase();
        return title && !existing.has(title);
      });

      for (const entry of fresh) {
        allRecommendations.push({ category: cat, entry });
        existing.add((entry.title || entry.name || "").toLowerCase());
      }
      console.log(`  Found ${fresh.length} new entries for ${cat}`);
    } catch (err) {
      console.error(`  Parse error for ${cat}:`, err.message);
    }

    // Rate limit between searches
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`[Content Scout] Total recommendations: ${allRecommendations.length}`);

  if (allRecommendations.length === 0) {
    console.log("[Content Scout] No new content found. Done.");
    return;
  }

  // Save recommendations to state
  const scoutState = {
    generatedAt: new Date().toISOString(),
    status: "pending_approval",
    recommendations: allRecommendations.map((r, i) => ({
      id: i,
      category: r.category,
      entry: r.entry,
      approved: false,
    })),
  };
  atomicWriteJSON(SCOUT_STATE, scoutState);

  // Send approval email
  await sendApprovalEmail(scoutState);
}

// ─── Approval email ─────────────────────────────────────────────

async function sendApprovalEmail(scoutState) {
  const approvalUrl = `${SITE_URL().replace("/tsg", "")}:${APPROVAL_PORT}`;
  const recs = scoutState.recommendations;

  const cards = recs.map((r, i) => {
    const e = r.entry;
    const title = e.title || e.name || `${e.hz} Hz`;
    const summary = e.summary || e.bio || e.desc || "";
    const catColor = {
      declassified: "#FF2A1F", disclosure: "#00FFB3", studies: "#00FFB3",
      individuals: "#FFC260", frequencies: "#FF8A18", media: "#F5E3B3",
    }[r.category] || "#FFC260";

    return `<div style="margin:12px 0;padding:14px 16px;border:1px solid rgba(245,227,179,0.08);background:#0a0a0a;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><span style="font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.3em;color:${catColor};font-weight:700;background:${catColor}15;padding:2px 6px;">${r.category.toUpperCase()}</span></td>
        <td align="right"><span style="font-family:'Courier New',monospace;font-size:9px;color:rgba(245,227,179,0.3);">#${i + 1}</span></td>
      </tr></table>
      <p style="margin:8px 0 4px;font-size:14px;font-weight:700;color:#F5E3B3;">${title}</p>
      <p style="margin:0 0 10px;font-size:12px;color:rgba(245,227,179,0.45);line-height:1.6;">${summary.slice(0, 200)}${summary.length > 200 ? "..." : ""}</p>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:8px;">
          <a href="${approvalUrl}/approve/${i}" style="display:inline-block;padding:6px 16px;background:#00FFB3;color:#050505;font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.2em;text-decoration:none;">APPROVE</a>
        </td>
        <td>
          <a href="${approvalUrl}/reject/${i}" style="display:inline-block;padding:6px 16px;border:1px solid rgba(255,42,31,0.3);color:#FF2A1F;font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.2em;text-decoration:none;">SKIP</a>
        </td>
      </tr></table>
    </div>`;
  }).join("");

  const html = `<div style="font-family:'Courier New',monospace;background:#050505;color:#F5E3B3;padding:28px;max-width:600px;margin:0 auto;">
    <div style="height:2px;background:linear-gradient(to right,#00FFB3,#FFC260,#FF8A18);margin-bottom:20px;"></div>
    <p style="font-size:8px;letter-spacing:0.4em;color:#FFC260;margin:0 0 4px;">TSG CONTENT SCOUT</p>
    <p style="font-size:18px;font-weight:700;color:#F5E3B3;margin:0 0 6px;">Weekly Archive Recommendations</p>
    <p style="font-size:11px;color:rgba(245,227,179,0.4);margin:0 0 20px;">${recs.length} new entries found — review and approve below</p>

    ${cards}

    <div style="margin:20px 0;padding:14px;border:1px dashed rgba(0,255,179,0.15);background:rgba(0,255,179,0.02);">
      <p style="font-size:8px;letter-spacing:0.3em;color:#00FFB3;margin:0 0 6px;">BULK ACTIONS</p>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:8px;">
          <a href="${approvalUrl}/approve-all" style="display:inline-block;padding:8px 20px;background:#00FFB3;color:#050505;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.2em;text-decoration:none;">APPROVE ALL ${recs.length}</a>
        </td>
        <td>
          <a href="${approvalUrl}/reject-all" style="display:inline-block;padding:8px 20px;border:1px solid rgba(255,42,31,0.3);color:#FF2A1F;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.2em;text-decoration:none;">REJECT ALL</a>
        </td>
      </tr></table>
    </div>

    <div style="height:1px;background:rgba(255,194,96,0.08);margin:16px 0;"></div>
    <p style="font-size:8px;color:rgba(245,227,179,0.2);letter-spacing:0.2em;">AUTOMATED — TSG SIGNAL ENGINE</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL(),
        to: [ADMIN_EMAIL()],
        subject: `TSG CONTENT SCOUT — ${recs.length} New Recommendations`,
        html,
      }),
    });
    if (res.ok) console.log("[Content Scout] Approval email sent");
    else console.error("[Content Scout] Email failed:", res.status);
  } catch (err) { console.error("[Content Scout] Email error:", err.message); }
}

// ─── Approval HTTP server ───────────────────────────────────────

export async function startApprovalServer() {
  const { createServer } = await import("http");

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${APPROVAL_PORT}`);
    const path = url.pathname;

    // Load current state
    if (!existsSync(SCOUT_STATE)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h2>No pending recommendations</h2>");
      return;
    }

    const scoutState = JSON.parse(readFileSync(SCOUT_STATE, "utf8"));

    if (path.startsWith("/approve/")) {
      const id = parseInt(path.split("/")[2], 10);
      if (scoutState.recommendations[id]) {
        scoutState.recommendations[id].approved = true;
        atomicWriteJSON(SCOUT_STATE, scoutState);
        await applyApproved(scoutState);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(approvalPage(scoutState, `Entry #${id + 1} approved`));
      }
    } else if (path.startsWith("/reject/")) {
      const id = parseInt(path.split("/")[2], 10);
      if (scoutState.recommendations[id]) {
        scoutState.recommendations[id].approved = false;
        atomicWriteJSON(SCOUT_STATE, scoutState);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(approvalPage(scoutState, `Entry #${id + 1} skipped`));
      }
    } else if (path === "/approve-all") {
      for (const r of scoutState.recommendations) r.approved = true;
      atomicWriteJSON(SCOUT_STATE, scoutState);
      await applyApproved(scoutState);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(approvalPage(scoutState, "All entries approved"));
    } else if (path === "/reject-all") {
      for (const r of scoutState.recommendations) r.approved = false;
      scoutState.status = "rejected";
      atomicWriteJSON(SCOUT_STATE, scoutState);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(approvalPage(scoutState, "All entries rejected"));
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(approvalPage(scoutState));
    }
  });

  server.listen(APPROVAL_PORT, "0.0.0.0", () => {
    console.log(`[Content Scout] Approval server on port ${APPROVAL_PORT} (public)`);
  });
}

function approvalPage(state, message = "") {
  const recs = state.recommendations;
  const approved = recs.filter(r => r.approved).length;
  const items = recs.map((r, i) => {
    const title = r.entry.title || r.entry.name || `${r.entry.hz} Hz`;
    const status = r.approved
      ? `<span style="color:#00FFB3;">APPROVED</span>`
      : `<a href="/approve/${i}" style="color:#FFC260;text-decoration:underline;">Approve</a> | <a href="/reject/${i}" style="color:#FF2A1F;text-decoration:underline;">Skip</a>`;
    return `<tr><td style="padding:8px;border-bottom:1px solid #111;color:#F5E3B3;">${r.category.toUpperCase()}</td><td style="padding:8px;border-bottom:1px solid #111;color:#F5E3B3;">${title}</td><td style="padding:8px;border-bottom:1px solid #111;">${status}</td></tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><title>TSG Content Scout</title></head>
  <body style="background:#050505;color:#F5E3B3;font-family:'Courier New',monospace;padding:32px;max-width:700px;margin:0 auto;">
    <h1 style="color:#FF8A18;letter-spacing:0.15em;font-size:18px;">TSG CONTENT SCOUT</h1>
    ${message ? `<p style="color:#00FFB3;margin:12px 0;">${message}</p>` : ""}
    <p style="color:rgba(245,227,179,0.4);font-size:12px;">${approved}/${recs.length} approved</p>
    <p style="margin:12px 0;"><a href="/approve-all" style="color:#00FFB3;font-weight:700;">APPROVE ALL</a> | <a href="/reject-all" style="color:#FF2A1F;">REJECT ALL</a></p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr style="background:#111;"><th style="padding:8px;text-align:left;color:#FFC260;font-size:10px;">CAT</th><th style="padding:8px;text-align:left;color:#FFC260;font-size:10px;">TITLE</th><th style="padding:8px;text-align:left;color:#FFC260;font-size:10px;">ACTION</th></tr>
      ${items}
    </table>
  </body></html>`;
}

// ─── Apply approved entries to archive ───────────────────────────

function guessFreqSubcategory(entry) {
  const hz = entry.hz || 0;
  const name = (entry.name || entry.title || "").toLowerCase();
  const summary = (entry.summary || "").toLowerCase();
  if (name.includes("tibetan") || name.includes("singing bowl") || summary.includes("tibetan")) return "tibetan";
  if (name.includes("ancient") || name.includes("pyramid") || name.includes("pythagor")) return "ancient";
  if (name.includes("brain") || name.includes("gamma") || name.includes("theta") || name.includes("alpha") || name.includes("delta")) return "brainwaves";
  if (name.includes("organ") || name.includes("body") || name.includes("heart") || name.includes("liver")) return "organs";
  if (summary.includes("vibroacoustic") || summary.includes("cymatics") || summary.includes("binaural")) return "science";
  if (hz >= 174 && hz <= 963) return "solfeggio";
  return "science"; // default
}

async function applyApproved(scoutState) {
  const approved = scoutState.recommendations.filter(r => r.approved);
  if (approved.length === 0) return;

  const archive = loadArchive();
  const addedTitles = [];

  for (const rec of approved) {
    const cat = rec.category;
    const title = rec.entry.title || rec.entry.name || `${rec.entry.hz} Hz`;

    if (cat === "frequencies") {
      const subcat = guessFreqSubcategory(rec.entry);
      if (!archive.freq[subcat]) archive.freq[subcat] = [];
      archive.freq[subcat].push(rec.entry);
    } else {
      if (!archive.files[cat]) archive.files[cat] = [];
      archive.files[cat].push(rec.entry);
    }
    addedTitles.push(`${cat.toUpperCase()}: ${title}`);
  }

  // Save updated archives (engine copy)
  atomicWriteJSON(FILES_PATH, archive.files);
  atomicWriteJSON(FREQ_PATH, archive.freq);

  // Update landing page data (VPS path)
  const vpsLandingData = "/root/tsg-landing/data";
  const landingFiles = join(vpsLandingData, "files.json");
  const landingFreq = join(vpsLandingData, "frequencies.json");
  if (existsSync(landingFiles)) atomicWriteJSON(landingFiles, archive.files);
  if (existsSync(landingFreq)) atomicWriteJSON(landingFreq, archive.freq);

  // Also try relative path (dev environment)
  const devLandingFiles = join(__dirname, "../tsg-landing/data/files.json");
  const devLandingFreq = join(__dirname, "../tsg-landing/data/frequencies.json");
  if (existsSync(devLandingFiles)) atomicWriteJSON(devLandingFiles, archive.files);
  if (existsSync(devLandingFreq)) atomicWriteJSON(devLandingFreq, archive.freq);

  scoutState.status = "applied";
  scoutState.appliedAt = new Date().toISOString();
  atomicWriteJSON(SCOUT_STATE, scoutState);

  console.log(`[Content Scout] Applied ${approved.length} entries to archive`);

  // Invalidate content cache so signal engine picks up new entries
  invalidateCache();

  // Auto-rebuild the landing page
  try {
    const { execSync } = await import("child_process");
    console.log("[Content Scout] Rebuilding landing page...");
    execSync("cd /root/tsg-landing && npx next build && pm2 restart tsg-landing", {
      timeout: 120000,
      stdio: "pipe",
    });
    console.log("[Content Scout] Site rebuilt with new entries");
  } catch (err) {
    console.error("[Content Scout] Auto-rebuild failed:", err.message);
    console.log("[Content Scout] Manual rebuild needed: cd /root/tsg-landing && npx next build && pm2 restart tsg-landing");
  }

  // Send confirmation email to admin
  try {
    const list = addedTitles.map(t => `<tr><td style="padding:4px 0;font-size:12px;color:#F5E3B3;">→ ${t}</td></tr>`).join("");
    const html = `<div style="font-family:'Courier New',monospace;background:#050505;color:#F5E3B3;padding:24px;max-width:500px;">
      <div style="height:2px;background:linear-gradient(to right,#00FFB3,#FFC260);margin-bottom:16px;"></div>
      <p style="font-size:8px;letter-spacing:0.4em;color:#00FFB3;margin:0 0 4px;">CONTENT SCOUT</p>
      <p style="font-size:16px;font-weight:700;margin:0 0 12px;">${approved.length} Entries Added to Archive</p>
      <table style="width:100%;">${list}</table>
      <p style="margin:16px 0 0;font-size:10px;color:rgba(245,227,179,0.3);">Site has been rebuilt. Changes are live.</p>
    </div>`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL(),
        to: [ADMIN_EMAIL()],
        subject: `TSG ARCHIVE UPDATED — ${approved.length} new entries live`,
        html,
      }),
    });
    console.log("[Content Scout] Confirmation email sent");
  } catch (err) {
    console.error("[Content Scout] Confirmation email failed:", err.message);
  }
}

// ─── Check if scout should run (weekly, Sundays) ────────────────

export function shouldRunScout(now) {
  if (now.getUTCDay() !== 0) return false; // Sunday only

  if (!existsSync(SCOUT_STATE)) return true;

  try {
    const state = JSON.parse(readFileSync(SCOUT_STATE, "utf8"));
    const lastRun = new Date(state.generatedAt);
    const daysSince = (now - lastRun) / 86400000;
    return daysSince >= 6; // At least 6 days since last run
  } catch { return true; }
}
