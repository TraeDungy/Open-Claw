const SITE_URL = () => process.env.SITE_URL || "http://5.78.227.123/tsg";
const HEADER_IMG = () => `${SITE_URL()}/assets/email-header.png`;

/* ════════════════════════════════════════════════════════════
   EVIDENCE GRADE SYSTEM
   ════════════════════════════════════════════════════════════ */
const GRADES = {
  "A+": { label: "VERIFIED", color: "#00FFB3", pct: "96" },
  "A":  { label: "STRONG", color: "#00FFB3", pct: "82" },
  "B+": { label: "CREDIBLE", color: "#FFC260", pct: "72" },
  "B":  { label: "PLAUSIBLE", color: "#FFC260", pct: "58" },
  "C":  { label: "UNCONFIRMED", color: "#FF8A18", pct: "40" },
  "D":  { label: "SPECULATIVE", color: "#FF2A1F", pct: "22" },
  "F":  { label: "BS", color: "#FF2A1F", pct: "8" },
};

function gradeBlock(grade) {
  const g = GRADES[grade] || GRADES["C"];
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0;">
    <tr><td style="padding:10px 14px;border:1px solid ${g.color}25;border-radius:4px;background:#0a0a0a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;color:${g.color};font-weight:700;">▎ EVIDENCE: ${grade}</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:10px;color:${g.color}88;">${g.label}</td>
      </tr></table>
      <div style="margin:8px 0 2px;height:4px;background:#111;border-radius:2px;overflow:hidden;">
        <div style="width:${g.pct}%;height:100%;background:${g.color};border-radius:2px;"></div>
      </div>
    </td></tr>
  </table>`;
}

/* ════════════════════════════════════════════════════════════
   DOSSIER BASE LAYOUT
   90s file-folder aesthetic. Forensic. Negative-space outlines.
   Recovered from somewhere. Classification stamps. Tab dividers.
   ════════════════════════════════════════════════════════════ */
function baseLayout(content, preheader = "", issueNum = "", date = "") {
  const siteUrl = SITE_URL();
  const issueDate = date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>THE SIGNAL${issueNum ? ` #${issueNum}` : ""}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#F5E3B3;-webkit-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}

  <!-- OUTER FRAME — simulates desk / dark surface -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:20px 12px;">

      <!-- THE DOSSIER — file folder outline -->
      <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;border:1px solid rgba(245,227,179,0.08);background:#050505;">

        <!-- ▬▬▬ TSG TEXT LOGO — top of email, centered ▬▬▬ -->
        <tr><td style="padding:20px 28px 14px;text-align:center;border-bottom:1px solid rgba(245,227,179,0.04);">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
            <td style="width:28px;height:28px;border:1px solid rgba(255,194,96,0.3);border-radius:50%;text-align:center;vertical-align:middle;">
              <span style="display:inline-block;width:6px;height:6px;background:#FFC260;border-radius:50%;"></span>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <p style="margin:0;font-size:16px;font-weight:800;letter-spacing:0.3em;color:#F5E3B3;">TELEKINESIS</p>
              <p style="margin:0;font-size:9px;letter-spacing:0.25em;color:#FF8A18;font-weight:600;">SUPPORT GROUP</p>
            </td>
          </tr></table>
        </td></tr>

        <!-- ▬▬▬ FILE TAB (top-left, like a manila folder tab) ▬▬▬ -->
        <tr><td style="padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:rgba(245,227,179,0.06);padding:6px 18px 5px;border-bottom:1px solid rgba(245,227,179,0.08);border-right:1px solid rgba(245,227,179,0.08);">
              <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.35em;color:rgba(245,227,179,0.35);font-weight:700;">THE SIGNAL${issueNum ? ` &mdash; No. ${issueNum}` : ""}</span>
            </td>
            <td style="border-bottom:1px solid rgba(245,227,179,0.08);width:100%;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- ▬▬▬ CLASSIFICATION STRIP ▬▬▬ -->
        <tr><td style="padding:10px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.4em;color:rgba(245,227,179,0.18);">THE CONTROL SERIES&trade;</td>
            <td align="right" style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.2em;color:rgba(245,227,179,0.15);">${issueDate}</td>
          </tr></table>
        </td></tr>

        <!-- ▬▬▬ HERO IMAGE — FULL BLEED ▬▬▬ -->
        <tr><td style="padding:14px 28px 0;">
          <img src="${HEADER_IMG()}" alt="THE SIGNAL" width="564" style="display:block;width:100%;max-width:564px;height:auto;border:1px solid rgba(245,227,179,0.06);"/>
        </td></tr>

        <!-- ▬▬▬ SPECTRUM LINE (under hero) ▬▬▬ -->
        <tr><td style="padding:0 28px;">
          <div style="height:1px;background:linear-gradient(to right,rgba(255,194,96,0.2),rgba(255,138,24,0.35),rgba(255,194,96,0.2));"></div>
        </td></tr>

        <!-- ▬▬▬ MAIN CONTENT ▬▬▬ -->
        <tr><td style="padding:24px 28px 0;">
          ${content}
        </td></tr>

        <!-- ▬▬▬ SHARE THE SIGNAL ▬▬▬ -->
        <tr><td style="padding:20px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed rgba(255,194,96,0.12);border-radius:0;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.4em;color:rgba(255,194,96,0.4);">DISTRIBUTION</p>
              <p style="margin:0 0 10px;font-size:11px;color:rgba(245,227,179,0.35);">The more people who see this, the harder it is to classify.</p>
              <a href="mailto:?subject=You%20need%20to%20see%20this&body=I%20found%20something.%20${encodeURIComponent(siteUrl)}" style="display:inline-block;padding:7px 20px;border:1px solid rgba(255,194,96,0.25);color:#FFC260;font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.2em;text-decoration:none;">FORWARD THIS FILE</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- ▬▬▬ FOOTER LOGO — centered, definitive ▬▬▬ -->
        <tr><td style="padding:24px 28px 8px;text-align:center;">
          <div style="height:1px;background:rgba(245,227,179,0.04);margin-bottom:24px;"></div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
            <td style="width:40px;height:40px;border:1px solid rgba(255,194,96,0.15);border-radius:50%;text-align:center;vertical-align:middle;">
              <span style="display:inline-block;width:8px;height:8px;background:rgba(255,194,96,0.5);border-radius:50%;"></span>
            </td>
          </tr></table>
          <p style="margin:14px 0 2px;font-size:11px;font-weight:800;letter-spacing:0.35em;color:rgba(245,227,179,0.2);">TELEKINESIS</p>
          <p style="margin:0 0 2px;font-size:8px;letter-spacing:0.3em;color:rgba(255,138,24,0.25);">SUPPORT GROUP</p>
          <p style="margin:6px 0 0;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.2em;color:rgba(245,227,179,0.08);">THE CONTROL SERIES&trade;</p>
        </td></tr>

        <!-- ▬▬▬ FOOTER LINKS ▬▬▬ -->
        <tr><td style="padding:12px 28px 20px;text-align:center;">
          <a href="${siteUrl}" style="color:rgba(245,227,179,0.18);font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.15em;text-decoration:underline;">ARCHIVE</a>
          <span style="color:rgba(245,227,179,0.06);margin:0 8px;">|</span>
          <a href="${siteUrl}/frequencies" style="color:rgba(255,138,24,0.2);font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.15em;text-decoration:underline;">FREQUENCIES</a>
          <span style="color:rgba(245,227,179,0.06);margin:0 8px;">|</span>
          <a href="${siteUrl}/submit" style="color:rgba(0,255,179,0.2);font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.15em;text-decoration:underline;">SUBMIT</a>
          <span style="color:rgba(245,227,179,0.06);margin:0 8px;">|</span>
          <a href="#" style="color:rgba(245,227,179,0.12);font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.15em;text-decoration:underline;">UNSUB</a>
        </td></tr>

        <!-- ▬▬▬ BOTTOM SPECTRUM — static gradient ▬▬▬ -->
        <tr><td style="padding:0 28px 8px;">
          <div style="height:1px;background:linear-gradient(to right,rgba(255,194,96,0.08),rgba(255,138,24,0.2),rgba(255,194,96,0.08));"></div>
        </td></tr>

      </table><!-- end dossier -->

    </td></tr>
  </table><!-- end outer -->
</body></html>`;
}

/* ════════════════════════════════════════════════════════════
   REUSABLE BLOCKS — forensic, dossier-grade components
   ════════════════════════════════════════════════════════════ */

function sectionTab(label, color = "rgba(245,227,179,0.06)") {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 14px;"><tr>
    <td style="background:${color};padding:4px 14px 3px;border:1px solid rgba(245,227,179,0.08);">
      <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.4em;color:rgba(245,227,179,0.4);font-weight:700;">${label}</span>
    </td>
  </tr></table>`;
}

function firstSectionTab(label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;"><tr>
    <td style="background:rgba(245,227,179,0.06);padding:4px 14px 3px;border:1px solid rgba(245,227,179,0.08);">
      <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.4em;color:rgba(245,227,179,0.4);font-weight:700;">${label}</span>
    </td>
  </tr></table>`;
}

function headline(text) {
  return `<h2 style="margin:0 0 12px;font-size:21px;font-weight:800;letter-spacing:0.1em;color:#F5E3B3;text-transform:uppercase;line-height:1.35;">${text}</h2>`;
}

function subhead(text) {
  return `<p style="margin:0 0 10px;font-size:13px;font-weight:600;letter-spacing:0.08em;color:#FF8A18;text-transform:uppercase;">${text}</p>`;
}

function body(html) {
  return `<div style="font-size:14px;color:rgba(245,227,179,0.72);line-height:1.9;">${html}</div>`;
}

function pullQuote(text) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;">
    <tr>
      <td style="width:3px;background:linear-gradient(to bottom,#FF8A18,#FFC260);"></td>
      <td style="padding:10px 0 10px 16px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#F5E3B3;line-height:1.65;font-style:italic;">&ldquo;${text}&rdquo;</p>
      </td>
    </tr>
  </table>`;
}

function statBlock(stats) {
  const rows = stats.map(s => `<tr>
    <td style="padding:5px 14px 5px 0;font-family:'Courier New',monospace;font-size:20px;font-weight:800;color:#FF8A18;white-space:nowrap;vertical-align:top;letter-spacing:0.03em;">${s.value}</td>
    <td style="padding:5px 0;font-size:12px;color:rgba(245,227,179,0.45);line-height:1.5;vertical-align:middle;">${s.label}</td>
  </tr>`).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0;">
    <tr><td style="padding:14px 16px;border:1px solid rgba(245,227,179,0.06);background:#0a0a0a;">
      <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.4em;color:rgba(255,194,96,0.35);font-weight:700;">BY THE NUMBERS</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table>
    </td></tr>
  </table>`;
}

function bottomLine(text, grade) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;">
    <tr><td style="padding:16px 18px;border:1px solid rgba(255,194,96,0.1);background:rgba(255,194,96,0.02);">
      <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.4em;color:rgba(255,194,96,0.4);font-weight:700;">THE BOTTOM LINE</p>
      <p style="margin:0;font-size:13px;color:rgba(245,227,179,0.68);line-height:1.75;">${text}</p>
      ${grade ? gradeBlock(grade) : ""}
    </td></tr>
  </table>`;
}

function articleCard(title, summary, tag, url, grade, imageUrl) {
  const tagColor = tag === "DECLASSIFIED" ? "#FF2A1F" : tag === "STUDY" ? "#00FFB3" : tag === "PROFILE" ? "#FFC260" : tag === "FREQUENCY" ? "#FF8A18" : tag === "DISCLOSURE" ? "#00FFB3" : "rgba(245,227,179,0.3)";
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
    <tr><td style="padding:0;border:1px solid rgba(245,227,179,0.06);background:#0a0a0a;">
      ${imageUrl ? `<a href="${url || "#"}" style="display:block;"><img src="${imageUrl}" alt="${title}" width="564" style="display:block;width:100%;height:auto;border-bottom:1px solid rgba(245,227,179,0.04);"/></a>` : ""}
      <div style="padding:14px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.35em;color:${tagColor};font-weight:700;background:${tagColor}12;padding:2px 6px;">${tag}</span></td>
          ${grade ? `<td align="right"><span style="font-family:'Courier New',monospace;font-size:8px;color:${(GRADES[grade]||GRADES["C"]).color}88;">▎${grade}</span></td>` : ""}
        </tr></table>
        <p style="margin:8px 0 4px;font-size:14px;font-weight:700;color:#F5E3B3;line-height:1.4;">${url ? `<a href="${url}" style="color:#F5E3B3;text-decoration:none;">${title}</a>` : title}</p>
        <p style="margin:0;font-size:12px;color:rgba(245,227,179,0.4);line-height:1.6;">${summary}</p>
      </div>
    </td></tr>
  </table>`;
}

function profileCard(name, era, origin, bio, imageUrl) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
    <tr><td style="padding:16px;border:1px solid rgba(245,227,179,0.06);background:#0a0a0a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        ${imageUrl ? `<td style="width:60px;vertical-align:top;padding-right:14px;">
          <img src="${imageUrl}" alt="${name}" width="60" style="display:block;width:60px;height:60px;border-radius:4px;border:1px solid rgba(245,227,179,0.08);object-fit:cover;"/>
        </td>` : ""}
        <td style="vertical-align:top;">
          <span style="font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.35em;color:#FFC260;font-weight:700;background:rgba(255,194,96,0.08);padding:2px 6px;">PROFILE</span>
          <p style="margin:6px 0 2px;font-size:15px;font-weight:700;color:#F5E3B3;">${name}</p>
          <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:9px;color:rgba(245,227,179,0.3);letter-spacing:0.15em;">${era}${origin ? ` · ${origin}` : ""}</p>
          <p style="margin:0;font-size:12px;color:rgba(245,227,179,0.45);line-height:1.6;">${bio.slice(0, 200)}${bio.length > 200 ? "..." : ""}</p>
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

function classifiedExcerpt(docId, text) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0;">
    <tr><td style="padding:12px 14px;border:1px solid rgba(255,42,31,0.15);background:rgba(255,42,31,0.03);">
      <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.4em;color:#FF2A1F;font-weight:800;">CLASSIFIED EXCERPT</p>
      ${docId ? `<p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:9px;color:rgba(245,227,179,0.2);">REF: ${docId}</p>` : ""}
      <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:rgba(245,227,179,0.55);line-height:1.7;">${text}</p>
    </td></tr>
  </table>`;
}

function rabbitHole(teaser, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
    <tr><td style="padding:12px 14px;border:1px dashed rgba(0,255,179,0.12);background:rgba(0,255,179,0.02);">
      <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.4em;color:#00FFB3;font-weight:700;">RABBIT HOLE</p>
      <p style="margin:0 0 8px;font-size:12px;color:rgba(245,227,179,0.5);line-height:1.6;">${teaser}</p>
      <a href="${url}" style="font-family:'Courier New',monospace;color:#00FFB3;font-size:10px;letter-spacing:0.15em;text-decoration:underline;font-weight:600;">GO DEEP &rarr;</a>
    </td></tr>
  </table>`;
}

function fieldNote(text) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
    <tr>
      <td style="width:3px;background:#FFC260;"></td>
      <td style="padding:10px 0 10px 14px;background:rgba(255,194,96,0.02);">
        <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.35em;color:rgba(255,194,96,0.4);font-weight:700;">FIELD NOTE</p>
        <p style="margin:0;font-size:12px;color:rgba(245,227,179,0.5);line-height:1.6;font-style:italic;">${text}</p>
      </td>
    </tr>
  </table>`;
}

function ctaButton(url, label, color = "#FF8A18") {
  const fullUrl = url.startsWith("http") ? url : SITE_URL() + url;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px 0;"><tr><td>
    <a href="${fullUrl}" style="display:inline-block;padding:10px 26px;background:${color};color:#050505;font-family:'Courier New',monospace;font-size:10px;font-weight:800;letter-spacing:0.25em;text-decoration:none;text-transform:uppercase;">${label}</a>
  </td></tr></table>`;
}

function divider() {
  return `<div style="height:1px;background:rgba(245,227,179,0.04);margin:6px 0;"></div>`;
}

/* ════════════════════════════════════════════════════════════
   THE SIGNAL — PREMIUM ISSUE BUILDER
   Full newsletter: 1 lead + 3-4 sub-articles + profile/study
   + news signal + closer + rabbit hole
   ════════════════════════════════════════════════════════════ */
export function theSignal({
  issueNum = "",
  date = "",
  preheader = "",
  // THE BRIEFING
  briefing = "",
  // MAIN FILE (lead article)
  mainHeadline = "",
  mainBody = "",
  mainGrade = "",
  mainBottomLine = "",
  mainDocExcerpt = "",
  mainDocId = "",
  // BY THE NUMBERS
  stats = [],
  // SUB-ARTICLES (3-4 clickable cards)
  articles = [],
  // PROFILE or IN-DEPTH STUDY
  profile = null,
  // SIGNAL OF THE WEEK (recent news)
  signalTitle = "",
  signalBody = "",
  signalUrl = "",
  // LAST WEEK WE SAID
  lastWeek = "",
  // FROM THE FIELD
  fieldReport = "",
  // RABBIT HOLE
  rabbitTeaser = "",
  rabbitUrl = "",
  // THE DEAD DROP
  deadDrop = "",
  // CLOSER
  closerQuote = "",
}) {
  let c = "";

  // ── 01. THE BRIEFING ──
  c += firstSectionTab("THE BRIEFING");
  c += `<p style="margin:0;font-size:14px;color:rgba(245,227,179,0.55);line-height:1.85;font-style:italic;">${briefing}</p>`;

  // ── 02. THE MAIN FILE ──
  c += sectionTab("THE MAIN FILE");
  c += headline(mainHeadline);
  c += body(mainBody);
  if (mainDocExcerpt) c += classifiedExcerpt(mainDocId, mainDocExcerpt);
  if (mainGrade) c += gradeBlock(mainGrade);
  if (mainBottomLine) c += bottomLine(mainBottomLine, mainGrade);

  // ── 03. BY THE NUMBERS ──
  if (stats.length > 0) {
    c += sectionTab("THE DOSSIER");
    c += statBlock(stats);
  }

  // ── 04. SUB-ARTICLES ──
  if (articles.length > 0) {
    c += sectionTab("ALSO IN THIS FILE");
    for (const a of articles) {
      c += articleCard(a.title, a.summary, a.tag || "INTEL", a.url || "", a.grade || "", a.imageUrl || "");
    }
  }

  // ── 05. PROFILE / IN-DEPTH ──
  if (profile) {
    c += sectionTab(profile.sectionTitle || "SUBJECT FILE");
    c += profileCard(profile.name, profile.era || "", profile.origin || "", profile.bio || "", profile.imageUrl || "");
    if (profile.pullQuote) c += pullQuote(profile.pullQuote);
  }

  // ── 06. SIGNAL OF THE WEEK ──
  if (signalTitle) {
    c += sectionTab("SIGNAL OF THE WEEK");
    c += `<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#F5E3B3;line-height:1.4;">${signalTitle}</p>`;
    c += `<p style="margin:0;font-size:12px;color:rgba(245,227,179,0.5);line-height:1.7;">${signalBody}</p>`;
    if (signalUrl) c += `<p style="margin:6px 0 0;"><a href="${signalUrl}" style="font-family:'Courier New',monospace;color:#FFC260;font-size:9px;letter-spacing:0.2em;text-decoration:underline;">READ MORE &rarr;</a></p>`;
  }

  // ── 07. LAST WEEK WE SAID ──
  if (lastWeek) {
    c += sectionTab("LAST WEEK WE SAID...");
    c += `<p style="margin:0;font-size:12px;color:rgba(245,227,179,0.5);line-height:1.75;">${lastWeek}</p>`;
  }

  // ── 08. FROM THE FIELD ──
  if (fieldReport) {
    c += sectionTab("FROM THE FIELD");
    c += fieldNote(fieldReport);
  }

  // ── 09. RABBIT HOLE ──
  if (rabbitTeaser && rabbitUrl) {
    c += sectionTab("RABBIT HOLE");
    c += rabbitHole(rabbitTeaser, rabbitUrl);
  }

  // ── 10. THE DEAD DROP — cryptic scavenger hunt ──
  if (deadDrop) {
    const dd = typeof deadDrop === "string" ? { text: deadDrop } : deadDrop;
    c += `<div style="margin:28px 0 4px;">
      <!-- The dead drop hides in plain sight. The link is embedded in the period, the dot, or the icon. Readers who know, know. -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid rgba(245,227,179,0.03);">
        <tr><td style="padding:14px 16px;background:rgba(245,227,179,0.01);">
          <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.35em;color:rgba(245,227,179,0.06);">THE DEAD DROP</p>
          <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:9px;color:rgba(245,227,179,0.07);line-height:1.6;">${dd.text}</p>
          ${dd.hiddenUrl ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 0;"><tr>
            <td style="text-align:center;">
              <!-- The signal dot IS the link. Only those paying attention will find it. -->
              <a href="${dd.hiddenUrl}" style="display:inline-block;width:8px;height:8px;background:rgba(255,194,96,0.04);border-radius:50%;text-decoration:none;border:1px solid rgba(255,194,96,0.03);" title="◉">&nbsp;</a>
            </td>
          </tr></table>` : ""}
          ${dd.coordinates ? `<p style="margin:6px 0 0;font-family:'Courier New',monospace;font-size:7px;color:rgba(245,227,179,0.04);letter-spacing:0.15em;">${dd.coordinates}</p>` : ""}
        </td></tr>
      </table>
    </div>`;
  }

  // ── 11. THE CLOSER ──
  if (closerQuote) {
    c += `<div style="margin:24px 0 8px;text-align:center;">
      <div style="height:1px;width:40px;background:rgba(255,194,96,0.15);margin:0 auto 16px;"></div>
      <p style="margin:0;font-size:13px;font-weight:600;color:rgba(245,227,179,0.4);line-height:1.7;font-style:italic;">${closerQuote}</p>
      <p style="margin:6px 0 0;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.25em;color:rgba(245,227,179,0.15);">— THE CONTROL SERIES</p>
    </div>`;
  }

  return { subject: `THE SIGNAL${issueNum ? ` #${issueNum}` : ""} — ${mainHeadline}`, html: baseLayout(c, preheader, issueNum, date) };
}

/* ════════════════════════════════════════════════════════════
   BACKWARD-COMPATIBLE EXPORTS (for drip + broadcast engines)
   ════════════════════════════════════════════════════════════ */

export function manifesto(intro) {
  return theSignal({
    issueNum: "001",
    preheader: "Signal Archaeology — documenting what others dismissed.",
    briefing: "You signed up. That means something. Most people scroll past. You stopped. Here is what you just joined.",
    mainHeadline: "WHAT IS THE SIGNAL?",
    mainBody: intro,
    stats: [
      { value: "$20M", label: "CIA budget for Project Stargate (1975–1995)" },
      { value: "89,000", label: "Declassified pages in the Stargate archive" },
      { value: "2,500+", label: "Cases studied at UVA Division of Perceptual Studies" },
      { value: "14", label: "Countries with documented psi research programs" },
    ],
    articles: [
      { title: "CIA Stargate Project — Full Collection", summary: "89,000+ pages of remote viewing research. Operational transcripts, training manuals, mission reports.", tag: "DECLASSIFIED", url: "https://www.cia.gov/readingroom/collection/stargate", grade: "A" },
      { title: "528 Hz — The Love Frequency", summary: "Two studies. One in Tehran, one in Japan. Cell repair and cortisol reduction at this specific frequency.", tag: "FREQUENCY", grade: "C" },
      { title: "Ingo Swann — The Man Who Saw Jupiter", summary: "Described the planet's rings 6 years before Voyager 1 confirmed them. Documented at Stanford Research Institute.", tag: "PROFILE", grade: "A" },
    ],
    rabbitTeaser: "The U.S. Army wrote a 29-page manual on leaving your body. It was classified until 2003. It has diagrams. Read it.",
    rabbitUrl: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf",
    closerQuote: "No claims. No promises. Just show up and pay attention.",
  });
}

export function contentSpotlight(entry, intro) {
  const title = entry.title || entry.name || (entry.hz ? `${entry.hz} Hz — ${entry.name}` : "UNKNOWN FILE");
  const summary = entry.summary || "";
  const grade = entry.evidence?.includes("Strong") ? "A" : entry.evidence?.includes("Moderate") ? "B+" : entry.evidence?.includes("Weak") ? "C" : "B";
  const links = (entry.links || entry.documents || []).slice(0, 2);
  const linksHtml = links.map(l => `<a href="${l.url}" style="color:#FFC260;text-decoration:underline;font-size:12px;">${l.label || l.title}</a>`).join(" · ");

  return theSignal({
    preheader: title,
    briefing: "New file from the archive. Primary sources attached. Verify everything yourself.",
    mainHeadline: title.toUpperCase(),
    mainBody: `${intro || summary}${linksHtml ? `<br/><br/>${linksHtml}` : ""}`,
    mainGrade: grade,
    mainBottomLine: summary.slice(0, 250) + (summary.length > 250 ? "..." : ""),
    closerQuote: "The signal does not require your belief. It requires your attention.",
  });
}

export function dualSpotlight(entries, intro) {
  return theSignal({
    preheader: "They were documented. Their results were measured.",
    briefing: "Two subjects. Two continents. Decades apart. The same impossible results.",
    mainHeadline: "THE SUBJECTS WHO CAME BEFORE",
    mainBody: intro,
    mainGrade: "A",
    mainBottomLine: "They were filmed. They were tested. They produced results that made scientists deeply uncomfortable. The files are in the archive.",
    profile: entries[0] ? { name: entries[0].name || entries[0].title, era: entries[0].era || "", origin: entries[0].origin || "", bio: entries[0].bio || entries[0].summary || "" } : null,
    articles: entries.slice(1).map(e => ({
      title: e.name || e.title,
      summary: (e.bio || e.summary || "").slice(0, 150),
      tag: "PROFILE",
      grade: "A",
    })),
    closerQuote: "History remembers what institutions try to forget.",
  });
}

export function toolIntro(intro) {
  return theSignal({
    preheader: "Perception is trainable. Here is the instrument.",
    briefing: "Today is different. Today you don't read. Today you train.",
    mainHeadline: "TRAIN YOUR PERCEPTION",
    mainBody: `${intro}<br/><br/>${ctaButton("/tool", "BEGIN TRAINING", "#00FFB3")}`,
    mainGrade: "A",
    stats: [
      { value: "90,000+", label: "Trials in the Rhine experiments (Duke University)" },
      { value: "p < 0.001", label: "Statistical significance across decades" },
      { value: "20%", label: "Chance accuracy (5 symbols)" },
      { value: "28-35%", label: "Consistent practitioner range" },
    ],
    mainBottomLine: "Perception is trainable. Attention is direction. Stillness is power. The tool is free. Use it daily. Track your baseline.",
    closerQuote: "The instrument does not lie. It only measures.",
  });
}

export function openSignal(intro) {
  return theSignal({
    preheader: "Calibration complete. The real signal begins.",
    briefing: "Fourteen days. Six transmissions. Calibration is complete. Now we go deeper.",
    mainHeadline: "OPEN SIGNAL — A CALL FOR FILMS",
    mainBody: `${intro}<br/><br/>${ctaButton("/submit", "SUBMIT YOUR FILM", "#00FFB3")}`,
    articles: [
      { title: "Sci-Fi & Speculative Fiction", summary: "Stories that interrogate what's possible. Hard or soft. Near or far.", tag: "GENRE" },
      { title: "Futurism & Afrofuturism", summary: "Visions rooted in ancestry projected forward. The future remembers.", tag: "GENRE" },
      { title: "Consciousness & Experimental", summary: "Cinema at the threshold. Perception as medium. Attention as narrative.", tag: "GENRE" },
    ],
    closerQuote: "The signal doesn't care about your budget. It cares about your attention.",
  });
}

export function weeklySignal(entry, intro) {
  return contentSpotlight(entry, intro);
}

export function monthlyDigest(entries, intro) {
  return theSignal({
    preheader: "This month's curated signal from the archive.",
    briefing: "Four files. One thread. The monthly transmission.",
    mainHeadline: "THE SIGNAL — CONCENTRATED",
    mainBody: intro,
    articles: entries.map(e => ({
      title: e.entry?.title || e.entry?.name || (e.entry?.hz ? `${e.entry.hz} Hz` : "Entry"),
      summary: (e.entry?.summary || "").slice(0, 120) + "...",
      tag: e.type === "spotlight" ? "DECLASSIFIED" : e.type === "profile" ? "PROFILE" : e.type === "study" ? "STUDY" : "FREQUENCY",
    })),
    closerQuote: "The archive grows. The signal continues.",
  });
}
