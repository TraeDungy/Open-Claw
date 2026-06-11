/* POLY SWIPE — static server + applicant intake collector
 *
 * Writes every submission to:
 *   - submissions.csv    master intake CSV (exact 180-column schema, schema.mjs)
 *   - submissions.jsonl  raw structured backup
 *   - uploads/           applicant photos (filename referenced in the CSV)
 *
 * Optional env:
 *   PORT             listen port (default 3020)
 *   EXPORT_TOKEN     enables GET /api/export.csv?token=...
 *   EVENT_NAME, EVENT_CITY, EVENT_STATE, EVENT_VENUE, EVENT_DATE, SEASON_LABEL
 *                    prefill event metadata columns
 *   AIRTABLE_API_KEY + AIRTABLE_BASE_ID + AIRTABLE_TABLE
 *                    forward a summary record to Airtable
 *
 * Run:  node server.mjs
 */

import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HEADER, PERSON_COLUMNS, MAX_PERSONS, VOCAB,
  toCsvLine, headerLine,
} from './schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3020;
const CSV_FILE = path.join(__dirname, 'submissions.csv');
const JSONL_FILE = path.join(__dirname, 'submissions.jsonl');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MAX_BODY = 12 * 1024 * 1024; // allow one base64 photo
const PRIVATE_PATHS = [CSV_FILE, JSONL_FILE, UPLOADS_DIR];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const EVENT_META = {
  event_name: process.env.EVENT_NAME || 'POLY SWIPE',
  event_city: process.env.EVENT_CITY || '',
  event_state: process.env.EVENT_STATE || '',
  event_venue: process.env.EVENT_VENUE || '',
  event_date: process.env.EVENT_DATE || '',
  season_label: process.env.SEASON_LABEL || '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max = 500) => (v == null ? '' : String(v).trim().slice(0, max));
const inVocab = (v, list) => (list.includes(v) ? v : '');
const joinList = (v, sep, max = 10) =>
  Array.isArray(v) ? v.map((x) => clean(x, 120)).filter(Boolean).slice(0, max).join(sep) : '';

async function nextSubmissionId() {
  let count = 0;
  try {
    const data = await readFile(CSV_FILE, 'utf8');
    count = data.split('\n').filter(Boolean).length - 1; // minus header
  } catch { /* file doesn't exist yet */ }
  const n = String(Math.max(0, count) + 1).padStart(3, '0');
  return `PS-${new Date().getFullYear()}-${n}`;
}

async function savePhoto(photo, submissionId, slot) {
  if (!photo || !photo.data) return '';
  const ext = /^data:image\/png/.test(photo.data) ? '.png' : '.jpg';
  const b64 = photo.data.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 100 || buf.length > 10 * 1024 * 1024) return '';
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${submissionId}_${slot}${ext}`;
  await writeFile(path.join(UPLOADS_DIR, filename), buf);
  return filename;
}

/* Map the structured client payload onto the flat 180-column row. */
function buildRow({ shared = {}, players = [] }, submissionId, photoFile) {
  const groupSize = Math.min(MAX_PERSONS, Math.max(1, players.length));
  const configBySize = { 1: 'solo', 2: 'couple', 3: 'throuple', 4: 'quad' };
  const row = {};
  HEADER.forEach((c) => { row[c] = ''; });

  Object.assign(row, EVENT_META, {
    submission_id: submissionId,
    application_ts: new Date().toISOString(),
    submission_type: groupSize > 1 ? 'group' : 'single',
    group_size: groupSize,
    current_config: inVocab(shared.current_config, VOCAB.current_config) || configBySize[groupSize],
    current_config_notes: clean(shared.current_config_notes, 300),
    searching_for: joinList(shared.searching_for, '|').split('|')
      .filter((v) => VOCAB.searching_for.includes(v)).join('|'),
    preferred_stage_role: inVocab(shared.preferred_stage_role, VOCAB.preferred_stage_role),
    relationship_map: clean(shared.relationship_map, 150),
    primary_contact_slot: inVocab(shared.primary_contact_slot, VOCAB.primary_contact_slot) || 'p1',
    home_city: clean(shared.home_city, 80),
    home_state: clean(shared.home_state, 2).toUpperCase(),
    availability_from: clean(shared.availability_from, 10),
    availability_to: clean(shared.availability_to, 10),
    blackout_dates: clean(shared.blackout_dates, 200),
    weekday_evening_ok: inVocab(shared.weekday_evening_ok, VOCAB.yes_no),
    weekend_ok: inVocab(shared.weekend_ok, VOCAB.yes_no),
    short_notice_ok: inVocab(shared.short_notice_ok, VOCAB.yes_no),
    travel_radius_mi: /^\d{1,3}$/.test(String(shared.travel_radius_mi)) ? shared.travel_radius_mi : '',
    can_self_transport: inVocab(shared.can_self_transport, VOCAB.yes_no),
    transport_needs: clean(shared.transport_needs, 250),
    accessibility_needs: clean(shared.accessibility_needs, 250),
    group_socials: clean(shared.group_socials, 200),
    group_bio: clean(shared.group_bio, 500),
    group_dynamic_summary: clean(shared.group_dynamic_summary, 500),
    consent_code_of_conduct: inVocab(shared.consent_code_of_conduct, VOCAB.yes_no),
    consent_house_rules: inVocab(shared.consent_house_rules, VOCAB.yes_no),
    consent_data_privacy: inVocab(shared.consent_data_privacy, VOCAB.yes_no),
    marketing_opt_in: inVocab(shared.marketing_opt_in, VOCAB.yes_no),
    referral_source: inVocab(shared.referral_source, VOCAB.referral_source),
    referral_detail: clean(shared.referral_detail, 150),
    compensation_expectation: inVocab(shared.compensation_expectation, VOCAB.compensation_expectation),
    group_photo_file: photoFile,
    producer_status: 'new',
  });

  players.slice(0, MAX_PERSONS).forEach((p, i) => {
    const k = (col) => `p${i + 1}_${col}`;
    row[k('display_name')] = clean(p.display_name, 80);
    row[k('email')] = clean(p.email, 120).toLowerCase();
    row[k('phone')] = clean(p.phone, 25);
    row[k('age_band')] = inVocab(p.age_band, VOCAB.age_band);
    row[k('relationship_status')] = inVocab(p.relationship_status, VOCAB.relationship_status);
    row[k('gender_identity')] = clean(p.gender_identity, 60);
    row[k('pronouns')] = clean(p.pronouns, 40);
    row[k('pronoun_display')] = inVocab(p.pronoun_display, VOCAB.pronoun_display);
    row[k('poly_style')] = inVocab(p.poly_style, VOCAB.poly_style);
    row[k('role_in_group')] = inVocab(p.role_in_group, VOCAB.role_in_group)
      || (i === 0 ? 'primary_applicant' : 'member');
    row[k('social_handles')] = clean(p.social_handles, 200);
    row[k('short_bio')] = clean(p.short_bio, 300);
    row[k('green_flags')] = joinList(p.green_flags, ';', 3);
    row[k('red_flags')] = joinList(p.red_flags, ';', 3);
    row[k('dealbreakers')] = joinList(p.dealbreakers, ';', 5);
    row[k('favorite_food')] = clean(p.favorite_food, 80);
    row[k('best_qualities')] = joinList(p.best_qualities, ';', 5);
    row[k('longest_relationship_months')] =
      /^\d{1,3}$/.test(String(p.longest_relationship_months)) ? p.longest_relationship_months : '';
    row[k('relationship_goals')] = joinList(p.relationship_goals, '|', 6).split('|')
      .filter((v) => VOCAB.relationship_goals.includes(v)).join('|');
    row[k('boundaries_hard_limits')] = clean(p.boundaries_hard_limits, 300);
    row[k('health_safety_notes')] = clean(p.health_safety_notes, 250);
    // privacy-protective default; real status only via secured callback workflow
    row[k('sti_status_optional')] = inVocab(p.sti_status_optional, VOCAB.sti_status_optional) || 'not_disclosed';
    row[k('consent_live_broadcast')] = inVocab(p.consent_live_broadcast, VOCAB.yes_no);
    row[k('consent_media_release')] = inVocab(p.consent_media_release, VOCAB.yes_no);
    row[k('consent_voluntary')] = inVocab(p.consent_voluntary, VOCAB.yes_no);
  });

  // any missing person-level consent => flag for producer review before casting
  const consentCols = ['consent_live_broadcast', 'consent_media_release', 'consent_voluntary'];
  const allConsented = players.slice(0, MAX_PERSONS).every((_, i) =>
    consentCols.every((c) => row[`p${i + 1}_${c}`] === 'yes'));
  row.mod_safety_flag = allConsented ? 'none' : 'review';

  return row;
}

function validateSubmission({ shared = {}, players = [] }) {
  if (!Array.isArray(players) || players.length < 1 || players.length > MAX_PERSONS) {
    return 'between 1 and 4 players required';
  }
  for (const [i, p] of players.entries()) {
    if (!clean(p.display_name)) return `player ${i + 1}: name required`;
    if (!EMAIL_RE.test(clean(p.email))) return `player ${i + 1}: valid email required`;
    if (!VOCAB.age_band.includes(p.age_band)) return `player ${i + 1}: age band required`;
  }
  for (const c of ['consent_code_of_conduct', 'consent_house_rules', 'consent_data_privacy']) {
    if (shared[c] !== 'yes') return `${c} acknowledgment required`;
  }
  return null;
}

async function forwardToAirtable(row) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE } = process.env;
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE) return;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Submission ID': row.submission_id,
            Name: row.p1_display_name,
            Email: row.p1_email,
            Phone: row.p1_phone,
            'Group Size': Number(row.group_size),
            Config: row.current_config,
            'Searching For': row.searching_for,
            'Stage Role': row.preferred_stage_role,
            City: row.home_city,
            State: row.home_state,
            Status: row.producer_status,
            'Safety Flag': row.mod_safety_flag,
            'Submitted At': row.application_ts,
          },
        }),
      },
    );
    if (!res.ok) console.error('[airtable] forward failed:', res.status, await res.text());
  } catch (err) {
    console.error('[airtable] forward error:', err.message);
  }
}

function readBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // intake endpoint (relative-safe behind nginx subpaths)
  if (req.method === 'POST' && url.pathname.endsWith('/api/submit')) {
    try {
      const data = JSON.parse(await readBody(req));
      const error = validateSubmission(data);
      if (error) return json(res, 400, { ok: false, error });

      const submissionId = await nextSubmissionId();
      const photoFile = await savePhoto(data.photo, submissionId, 'group');
      const row = buildRow(data, submissionId, photoFile);

      if (!existsSync(CSV_FILE)) await appendFile(CSV_FILE, headerLine() + '\n');
      await appendFile(CSV_FILE, toCsvLine(row) + '\n');

      const { photo, ...rest } = data;
      await appendFile(JSONL_FILE, JSON.stringify({
        submission_id: submissionId,
        receivedAt: row.application_ts,
        ip: req.socket.remoteAddress,
        photo_file: photoFile,
        ...rest,
      }) + '\n');

      forwardToAirtable(row); // fire and forget
      console.log(`[submit] ${submissionId} ${row.p1_email} (${row.current_config}, ${row.group_size} player${row.group_size > 1 ? 's' : ''})`);
      return json(res, 200, { ok: true, submission_id: submissionId });
    } catch (err) {
      return json(res, 400, { ok: false, error: err.message });
    }
  }

  // master CSV export for producers (requires EXPORT_TOKEN)
  if (req.method === 'GET' && url.pathname.endsWith('/api/export.csv')) {
    const token = process.env.EXPORT_TOKEN;
    if (!token || url.searchParams.get('token') !== token) {
      res.writeHead(403); return res.end('forbidden');
    }
    if (!existsSync(CSV_FILE)) {
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' });
      return res.end(headerLine() + '\n');
    }
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="poly-swipe-applicants.csv"',
    });
    return createReadStream(CSV_FILE).pipe(res);
  }

  // static files
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = url.pathname.replace(/^\/+/, '') || 'index.html';
    if (filePath.endsWith('/')) filePath += 'index.html';
    const resolved = path.join(__dirname, path.normalize(filePath));
    const isPrivate = PRIVATE_PATHS.some((p) => resolved === p || resolved.startsWith(p + path.sep));
    if (!resolved.startsWith(__dirname) || isPrivate) {
      res.writeHead(403); return res.end('forbidden');
    }
    const target = existsSync(resolved) ? resolved : path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(target).pipe(res);
  }

  res.writeHead(405); res.end();
});

server.listen(PORT, () => {
  console.log(`🎰 POLY SWIPE intake running at http://localhost:${PORT} (${HEADER.length}-column schema)`);
});
