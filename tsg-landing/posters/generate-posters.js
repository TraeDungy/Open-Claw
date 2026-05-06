const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = '/Users/trialxfire/.claude/skills/canvas-design/canvas-fonts';
const OUT_DIR = path.join(__dirname);

// Register fonts
registerFont(path.join(FONTS_DIR, 'Jura-Light.ttf'), { family: 'Jura', weight: '300' });
registerFont(path.join(FONTS_DIR, 'Jura-Medium.ttf'), { family: 'Jura', weight: '500' });
registerFont(path.join(FONTS_DIR, 'DMMono-Regular.ttf'), { family: 'DMMono' });
registerFont(path.join(FONTS_DIR, 'Outfit-Regular.ttf'), { family: 'Outfit' });
registerFont(path.join(FONTS_DIR, 'Outfit-Bold.ttf'), { family: 'Outfit', weight: 'bold' });
registerFont(path.join(FONTS_DIR, 'BigShoulders-Bold.ttf'), { family: 'BigShoulders', weight: 'bold' });
registerFont(path.join(FONTS_DIR, 'GeistMono-Regular.ttf'), { family: 'GeistMono' });

const W = 1920, H = 1080;

// Brand palette
const VOID = '#050505';
const BONE = '#F5E3B3';
const EMBER = '#FF902E';
const SIGNAL = '#FFC260';
const HAZARD = '#FF2A1F';
const PULSE = '#00FFB3';

function save(canvas, name) {
  const buf = canvas.toBuffer('image/png');
  const fp = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(fp, buf);
  console.log(`  ✓ ${fp}`);
}

// ─────────────────────────────────────────────
// POSTER 1: SLEEP AIDE — Ethereal/cosmic
// ─────────────────────────────────────────────
function poster1_sleep() {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Deep void base
  ctx.fillStyle = '#020204';
  ctx.fillRect(0, 0, W, H);

  // Nebula glow — soft radial layers
  const nebula = (cx, cy, r, color, alpha) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
    g.addColorStop(0.4, color.replace(')', `,${alpha * 0.3})`).replace('rgb', 'rgba'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };

  nebula(W * 0.35, H * 0.4, 500, 'rgb(40,20,80)', 0.25);
  nebula(W * 0.65, H * 0.55, 450, 'rgb(20,30,70)', 0.2);
  nebula(W * 0.5, H * 0.3, 350, 'rgb(80,50,30)', 0.12);
  nebula(W * 0.7, H * 0.35, 200, 'rgb(255,194,96)', 0.04);

  // Particle drift — hundreds of tiny stars
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = Math.random() * 1.5 + 0.3;
    const a = Math.random() * 0.5 + 0.1;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 227, 179, ${a})`;
    ctx.fill();
  }

  // Larger glow particles — sparse
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = Math.random() * 3 + 1;
    const g = ctx.createRadialGradient(x, y, 0, x, y, s * 6);
    g.addColorStop(0, 'rgba(255, 194, 96, 0.15)');
    g.addColorStop(1, 'rgba(255, 194, 96, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - s * 6, y - s * 6, s * 12, s * 12);
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 227, 179, 0.5)';
    ctx.fill();
  }

  // Concentric rings — very faint, suggesting theta waves
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.04)';
  ctx.lineWidth = 0.5;
  for (let r = 80; r < 600; r += 40) {
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.42, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Title
  ctx.fillStyle = BONE;
  ctx.font = '300 84px Jura';
  ctx.textAlign = 'center';
  ctx.fillText('3 HOURS THETA SLEEP', W / 2, H * 0.72);

  // Subtitle
  ctx.font = '300 28px Jura';
  ctx.fillStyle = 'rgba(255, 194, 96, 0.5)';
  ctx.fillText('DEEP AMBIENT DRIFT', W / 2, H * 0.78);

  // Thin line
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.35, H * 0.82);
  ctx.lineTo(W * 0.65, H * 0.82);
  ctx.stroke();

  // Brand
  ctx.font = '10px GeistMono';
  ctx.fillStyle = 'rgba(255, 144, 46, 0.35)';
  ctx.fillText('TELEKINESIS SUPPORT GROUP — THE CONTROL SERIES™', W / 2, H * 0.86);

  // Frequency label
  ctx.font = '10px GeistMono';
  ctx.fillStyle = 'rgba(245, 227, 179, 0.2)';
  ctx.textAlign = 'left';
  ctx.fillText('4–7 Hz THETA RANGE', 60, H - 40);

  // Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  save(c, 'poster-01-sleep-aide');
}

// ─────────────────────────────────────────────
// POSTER 2: TK MANTRA — Cymatic/sacred geometry
// ─────────────────────────────────────────────
function poster2_mantra() {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H * 0.44;

  // Sacred geometry — concentric cymatic rings
  for (let r = 30; r < 420; r += 18) {
    const nodes = Math.floor(r / 40) + 3;
    const alpha = 0.06 + (1 - r / 420) * 0.12;
    ctx.strokeStyle = `rgba(255, 194, 96, ${alpha})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let s = 0; s <= 360; s++) {
      const a = (s / 360) * Math.PI * 2;
      const mod = Math.sin(a * nodes) * r * 0.06;
      const px = cx + Math.cos(a) * (r + mod);
      const py = cy + Math.sin(a) * (r + mod);
      s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Radial spokes
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.strokeStyle = 'rgba(255, 194, 96, 0.04)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 500, cy + Math.sin(a) * 500);
    ctx.stroke();
  }

  // Golden particles along wave crests
  for (let i = 0; i < 300; i++) {
    const ring = 30 + Math.random() * 380;
    const a = Math.random() * Math.PI * 2;
    const nodes = Math.floor(ring / 40) + 3;
    const crest = Math.abs(Math.sin(a * nodes));
    if (crest < 0.5) continue;
    const mod = Math.sin(a * nodes) * ring * 0.06;
    const px = cx + Math.cos(a) * (ring + mod);
    const py = cy + Math.sin(a) * (ring + mod);
    const s = 0.4 + crest * 1.2;
    ctx.beginPath();
    ctx.arc(px, py, s, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 210, 130, ${crest * 0.4})`;
    ctx.fill();
  }

  // Center glow
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
  cg.addColorStop(0, 'rgba(255, 194, 96, 0.12)');
  cg.addColorStop(0.5, 'rgba(255, 144, 46, 0.04)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(cx - 80, cy - 80, 160, 160);

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = SIGNAL;
  ctx.fill();

  // Title
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px Outfit';
  ctx.fillStyle = EMBER;
  ctx.letterSpacing = '8px';
  ctx.fillText('T E L E K I N E S I S   M A N T R A   S E S S I O N', cx, H * 0.82);

  ctx.font = 'bold 42px BigShoulders';
  ctx.fillStyle = BONE;
  ctx.fillText('CYCLE 01: AWARENESS > CONTROL', cx, H * 0.89);

  // Bottom line
  ctx.strokeStyle = 'rgba(255, 144, 46, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.3, H * 0.92);
  ctx.lineTo(W * 0.7, H * 0.92);
  ctx.stroke();

  // Brand
  ctx.font = '10px GeistMono';
  ctx.fillStyle = 'rgba(255, 144, 46, 0.3)';
  ctx.fillText('THE CONTROL SERIES™', cx, H * 0.96);

  // Vignette
  const vig = ctx.createRadialGradient(cx, cy, 200, cx, cy, W * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  save(c, 'poster-02-tk-mantra');
}

// ─────────────────────────────────────────────
// POSTER 3: FREQUENCY ROOM — Chladni plate
// ─────────────────────────────────────────────
function poster3_frequency() {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#030303';
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H * 0.48;
  const plateR = 360;

  // Plate circle — dark subtle boundary
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.stroke();

  // Chladni pattern — particles collecting at nodal lines
  // Chladni equation: cos(n*pi*x/L)*cos(m*pi*y/L) - cos(m*pi*x/L)*cos(n*pi*y/L) = 0
  const n = 3, m = 5;
  for (let i = 0; i < 12000; i++) {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > 1) continue;

    const val = Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) -
                Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);

    // Particles collect where val is near zero (nodal lines)
    const proximity = Math.abs(val);
    if (proximity > 0.15) continue;

    const px = cx + x * plateR;
    const py = cy + y * plateR;
    const alpha = (1 - proximity / 0.15) * 0.6;
    const size = 0.5 + (1 - proximity / 0.15) * 1;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 210, 130, ${alpha})`;
    ctx.fill();
  }

  // Faint glow at center of plate
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
  cg.addColorStop(0, 'rgba(255, 194, 96, 0.03)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(cx - 100, cy - 100, 200, 200);

  // Frequency number — huge, architectural
  ctx.textAlign = 'center';
  ctx.font = '300 160px Jura';
  ctx.fillStyle = 'rgba(255, 194, 96, 0.08)';
  ctx.fillText('7.83', cx, cy + 60);

  // Overlay the Chladni pattern on top of the number
  // (already drawn above, this creates depth)

  // Labels
  ctx.font = '500 14px Jura';
  ctx.fillStyle = SIGNAL;
  ctx.fillText('7 . 8 3  H z', cx, H * 0.12);

  ctx.font = '300 36px Jura';
  ctx.fillStyle = BONE;
  ctx.fillText('THE SCHUMANN RESONANCE', cx, H * 0.19);

  // Scientific annotations
  ctx.font = '11px GeistMono';
  ctx.fillStyle = 'rgba(245, 227, 179, 0.2)';
  ctx.textAlign = 'left';
  ctx.fillText('MODE: n=3, m=5', 60, H - 80);
  ctx.fillText('CHLADNI PLATE VISUALIZATION', 60, H - 60);
  ctx.fillText('EARTH–IONOSPHERE CAVITY', 60, H - 40);

  ctx.textAlign = 'right';
  ctx.fillText('THE FREQUENCY ROOM', W - 60, H - 60);
  ctx.fillStyle = 'rgba(255, 144, 46, 0.25)';
  ctx.fillText('THE CONTROL SERIES™', W - 60, H - 40);

  // Thin border
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.06)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  save(c, 'poster-03-frequency-room');
}

// ─────────────────────────────────────────────
// POSTER 4: BLACK ROOM — Pure darkness
// ─────────────────────────────────────────────
function poster4_blackroom() {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Pure black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // The Zener circle — barely visible, emerging from void
  const cx = W / 2, cy = H * 0.45;
  const r = 120;

  // Outermost whisper glow
  const og = ctx.createRadialGradient(cx, cy, r - 20, cx, cy, r + 80);
  og.addColorStop(0, 'rgba(255, 194, 96, 0.012)');
  og.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, W, H);

  // The circle itself — opacity 0.04, threshold of visibility
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.04)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.85, r * 0.92, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring — even fainter
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.02)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.55, r * 0.6, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Center point — the faintest suggestion
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 194, 96, 0.06)';
  ctx.fill();

  // Text at the very bottom — tiny, clinical
  ctx.textAlign = 'center';
  ctx.font = '10px GeistMono';
  ctx.fillStyle = 'rgba(245, 227, 179, 0.12)';
  ctx.fillText('BLACK ROOM SESSION 01', cx, H - 80);

  ctx.font = '11px GeistMono';
  ctx.fillStyle = 'rgba(245, 227, 179, 0.08)';
  ctx.fillText('CAN YOU HOLD THE SIGNAL?', cx, H - 58);

  // Brand — barely there
  ctx.font = '9px GeistMono';
  ctx.fillStyle = 'rgba(255, 144, 46, 0.07)';
  ctx.fillText('THE CONTROL SERIES™', cx, H - 30);

  save(c, 'poster-04-black-room');
}

// ─────────────────────────────────────────────
// POSTER 5: CONTROL TAPES — Classified/vintage
// ─────────────────────────────────────────────
function poster5_tapes() {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Aged paper base — warm dark
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(0, 0, W, H);

  // Paper grain texture
  for (let i = 0; i < 50000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = Math.random() * 0.03;
    ctx.fillStyle = `rgba(180, 160, 120, ${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Fold/crease lines
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.03)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke();

  // Document border — double line
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 50, W - 120, H - 100);
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.05)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(68, 58, W - 136, H - 116);

  // CLASSIFIED stamp — angled
  ctx.save();
  ctx.translate(W * 0.78, H * 0.18);
  ctx.rotate(-0.15);
  ctx.strokeStyle = 'rgba(255, 42, 31, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-90, -22, 180, 44);
  ctx.font = 'bold 24px Outfit';
  ctx.fillStyle = 'rgba(255, 42, 31, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('CLASSIFIED', 0, 8);
  ctx.restore();

  // Reel icon — simplified
  const rx = W * 0.5, ry = H * 0.38;
  const rr = 140;
  ctx.strokeStyle = 'rgba(255, 194, 96, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(rx, ry, rr * 0.7, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(rx, ry, rr * 0.15, 0, Math.PI * 2); ctx.stroke();
  // Spokes
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(rx + Math.cos(a) * rr * 0.15, ry + Math.sin(a) * rr * 0.15);
    ctx.lineTo(rx + Math.cos(a) * rr * 0.7, ry + Math.sin(a) * rr * 0.7);
    ctx.stroke();
  }
  // Hub holes
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const hx = rx + Math.cos(a) * rr * 0.42;
    const hy = ry + Math.sin(a) * rr * 0.42;
    ctx.beginPath(); ctx.arc(hx, hy, rr * 0.12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 194, 96, 0.08)';
    ctx.stroke();
  }

  // Header text
  ctx.textAlign = 'left';
  ctx.font = '11px DMMono';
  ctx.fillStyle = 'rgba(245, 227, 179, 0.3)';
  ctx.fillText('PROGRAM: THE CONTROL SERIES', 100, 100);
  ctx.fillText('DIVISION: SIGNAL RESEARCH UNIT', 100, 118);
  ctx.fillText('DATE: ████████', 100, 136);
  ctx.fillText('CLEARANCE: LEVEL 3', 100, 154);

  // Main title
  ctx.textAlign = 'center';
  ctx.font = 'bold 72px BigShoulders';
  ctx.fillStyle = BONE;
  ctx.fillText('CONTROL TAPE 001', W / 2, H * 0.7);

  ctx.font = '300 28px Jura';
  ctx.fillStyle = 'rgba(255, 194, 96, 0.5)';
  ctx.fillText('CALIBRATION — SUBJECT 14', W / 2, H * 0.77);

  // Redacted blocks
  ctx.fillStyle = 'rgba(245, 227, 179, 0.06)';
  ctx.fillRect(100, H * 0.83, 300, 14);
  ctx.fillRect(100, H * 0.86, 220, 14);
  ctx.fillRect(440, H * 0.83, 180, 14);

  // Redaction black bars over them
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(160, H * 0.83, 150, 14);
  ctx.fillRect(480, H * 0.83, 100, 14);

  // Footer
  ctx.font = '9px DMMono';
  ctx.fillStyle = 'rgba(255, 144, 46, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('TELEKINESIS SUPPORT GROUP — THE CONTROL SERIES™', W / 2, H - 70);
  ctx.fillStyle = 'rgba(245, 227, 179, 0.1)';
  ctx.fillText('UNAUTHORIZED REPRODUCTION PROHIBITED', W / 2, H - 54);

  // Film grain overlay
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
    ctx.fillRect(x, y, 1, 1);
  }

  save(c, 'poster-05-control-tapes');
}

// ── Generate all ──
console.log('Generating TSG YouTube posters...\n');
poster1_sleep();
poster2_mantra();
poster3_frequency();
poster4_blackroom();
poster5_tapes();
console.log('\nAll 5 posters generated.');
