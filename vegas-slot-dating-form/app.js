/* ================================================================
   POLY JACKPOT — game logic
   Flow: attract spin → swipeable question cards → lever pull → win
   ================================================================ */

'use strict';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------------- question deck ---------------- */
const STEPS = [
  {
    id: 'name', suit: '♥️', type: 'text',
    q: "What's your name, high roller?",
    sub: 'First name or stage name — whatever the table knows you by.',
    placeholder: 'Your name',
    validate: (v) => v.trim().length >= 2 || 'Give us at least 2 letters!',
  },
  {
    id: 'email', suit: '💌', type: 'email',
    q: 'Where do we send your winnings?',
    sub: "Your email. If you're picked for the show, this is how we deal you in.",
    placeholder: 'you@email.com',
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "That email doesn't look right — double-check it!",
  },
  {
    id: 'age', suit: '🎂', type: 'chips-single',
    q: 'Pick your table.',
    sub: 'This is an adults-only casino. 😏',
    options: ['18–24', '25–34', '35–44', '45–54', '55+'],
    validate: (v) => !!v || 'Pick an age range to keep playing!',
  },
  {
    id: 'city', suit: '🌆', type: 'text',
    q: "What city are you playing from?",
    sub: 'City + state/country.',
    placeholder: 'e.g. Las Vegas, NV',
    validate: (v) => v.trim().length >= 2 || 'Tell us where you roll from!',
  },
  {
    id: 'structure', suit: '🃏', type: 'chips-multi',
    q: 'Your hand. How do you play?',
    sub: 'Select all that apply — no wrong answers at this table.',
    options: ['Solo poly', 'Partnered + open', 'Triad / throuple', 'Relationship anarchist', 'Swinger', 'Poly-curious', 'It’s complicated 😅'],
    validate: (v) => (v && v.length > 0) || 'Pick at least one card from your hand!',
  },
  {
    id: 'lookingFor', suit: '🎯', type: 'chips-multi',
    q: 'What are you betting on?',
    sub: 'What are you hoping to find? Choose all that apply.',
    options: ['A new partner', 'A couple to join', 'A third', 'Friends + community', 'Fun on camera', 'True love, jackpot style 💍'],
    validate: (v) => (v && v.length > 0) || 'Place at least one bet!',
  },
  {
    id: 'social', suit: '📱', type: 'text', optional: true,
    q: 'Drop your socials.',
    sub: 'Instagram or TikTok — optional, but it helps us know you faster.',
    placeholder: '@yourhandle',
    validate: () => true,
  },
  {
    id: 'onCamera', suit: '🎥', type: 'chips-single',
    q: 'Ready for the spotlight?',
    sub: "This game is played LIVE. How do you feel about being on camera?",
    options: ['Born ready 🌟', 'Nervous but IN', 'Watching first this time'],
    validate: (v) => !!v || 'Tell us your camera vibe!',
  },
  {
    id: 'pitch', suit: '💎', type: 'textarea', optional: true,
    q: 'Your winning line.',
    sub: 'One or two sentences: why would the audience root for you?',
    placeholder: "I'm the wildcard this game needs because…",
    validate: () => true,
  },
];

const CREDITS_PER_STEP = 100;
const SYMBOLS = ['🍒', '💋', '7️⃣', '🔔', '💍', '🍀', '💘'];
const JACKPOT_SYM = '💘';

const state = {
  step: 0,
  answers: {},
  credits: 0,
  muted: false,
  submitting: false,
};

/* ================= tiny WebAudio synth ================= */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio */ }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
function tone(freq, dur = 0.12, type = 'square', vol = 0.06, when = 0) {
  if (!audioCtx || state.muted) return;
  const t = audioCtx.currentTime + when;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}
const sfx = {
  click: () => tone(880, 0.06, 'square', 0.05),
  chip: () => { tone(660, 0.05, 'triangle', 0.07); tone(990, 0.08, 'triangle', 0.05, 0.04); },
  lock: () => { tone(523, 0.1, 'square', 0.06); tone(784, 0.12, 'square', 0.06, 0.08); tone(1047, 0.18, 'square', 0.06, 0.16); },
  bad: () => { tone(220, 0.18, 'sawtooth', 0.06); tone(180, 0.22, 'sawtooth', 0.05, 0.1); },
  spin: () => { for (let i = 0; i < 12; i++) tone(300 + Math.random() * 500, 0.05, 'square', 0.025, i * 0.09); },
  reelStop: () => tone(440, 0.1, 'square', 0.08),
  jackpot: () => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
    notes.forEach((n, i) => tone(n, 0.22, 'square', 0.07, i * 0.13));
  },
  coin: () => tone(1200 + Math.random() * 800, 0.07, 'sine', 0.04),
};

function buzz(pattern) {
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch { /* ignore */ } }
}

/* ================= helpers ================= */
function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function switchScreen(id) {
  $$('.screen').forEach((s) => s.classList.remove('active', 'enter'));
  const next = $(id);
  next.classList.add('active', 'enter');
}

function buildBulbRows() {
  $$('.bulbs').forEach((row) => {
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('div');
      b.className = 'bulb';
      b.style.animationDelay = `${(i % 2) * 0.55}s`;
      row.appendChild(b);
    }
  });
}

/* ================= intro slot machine ================= */
const SYM_H = 96;
const STRIP_REPEAT = 14;

function buildReels() {
  $$('#reels .reel-strip').forEach((strip) => {
    for (let r = 0; r < STRIP_REPEAT; r++) {
      SYMBOLS.forEach((s) => {
        const d = document.createElement('div');
        d.className = 'sym';
        d.textContent = s;
        strip.appendChild(d);
      });
    }
  });
}

function spinReelTo(reelIdx, targetSym, duration) {
  return new Promise((resolve) => {
    const reel = $$('#reels .reel')[reelIdx];
    const strip = reel.querySelector('.reel-strip');
    const symIdx = SYMBOLS.indexOf(targetSym);
    // land deep into the strip so the spin travels many symbols
    const landingRow = (STRIP_REPEAT - 3) * SYMBOLS.length + symIdx;
    const offset = landingRow * SYM_H;
    reel.classList.add('spinning');
    strip.style.transition = `transform ${duration}ms cubic-bezier(.15,.6,.25,1)`;
    strip.style.transform = `translateY(${-offset}px)`;
    setTimeout(() => {
      reel.classList.remove('spinning');
      sfx.reelStop();
      buzz(30);
      resolve();
    }, duration);
  });
}

async function playIntroSpin() {
  const btn = $('#spinBtn');
  btn.disabled = true;
  ensureAudio();
  sfx.spin();
  buzz([40, 60, 40]);

  await Promise.all([
    spinReelTo(0, JACKPOT_SYM, 1700),
    spinReelTo(1, JACKPOT_SYM, 2400),
    spinReelTo(2, JACKPOT_SYM, 3100),
  ]);

  // JACKPOT moment
  $('#slotMachine').classList.add('jackpot');
  document.querySelector('.marquee-frame').classList.add('frenzy');
  sfx.jackpot();
  buzz([80, 50, 80, 50, 200]);
  coinShower(28);

  setTimeout(() => {
    document.querySelector('.marquee-frame').classList.remove('frenzy');
    startForm();
  }, 1600);
}

/* ================= card deck ================= */
function startForm() {
  switchScreen('#screen-form');
  buildProgressBulbs();
  renderDeck();
}

function buildProgressBulbs() {
  const wrap = $('#progressBulbs');
  wrap.innerHTML = '';
  STEPS.forEach((_, i) => {
    const b = document.createElement('div');
    b.className = 'pbulb';
    if (i === state.step) b.classList.add('current');
    if (i < state.step) b.classList.add('done');
    wrap.appendChild(b);
  });
}

function renderDeck() {
  const deck = $('#cardDeck');
  deck.innerHTML = '';
  // render up to 3 cards: active + 2 behind
  for (let depth = Math.min(2, STEPS.length - 1 - state.step); depth >= 0; depth--) {
    const idx = state.step + depth;
    if (idx >= STEPS.length) continue;
    const card = buildCard(STEPS[idx], idx);
    if (depth === 1) card.classList.add('behind-1');
    if (depth === 2) card.classList.add('behind-2');
    if (depth === 0) {
      card.classList.add('active-card', 'pop-in');
      attachSwipe(card);
    }
    deck.appendChild(card);
  }
  buildProgressBulbs();
  // hide swipe hint after the first couple of cards
  $('#swipeHint').classList.toggle('hidden', state.step > 1);
  // focus text input slightly after pop-in
  setTimeout(() => {
    const input = deck.querySelector('.active-card .neon-input');
    if (input && state.step === 0) input.focus({ preventScroll: true });
  }, 550);
}

function buildCard(step, idx) {
  const card = document.createElement('div');
  card.className = 'q-card';
  card.dataset.id = step.id;

  const stepNum = `CARD ${idx + 1} / ${STEPS.length}${step.optional ? ' · OPTIONAL' : ''}`;
  card.innerHTML = `
    <div class="card-suit">${step.suit}</div>
    <div class="card-step-num">${stepNum}</div>
    <div class="card-q">${step.q}</div>
    <div class="card-sub">${step.sub}</div>
    <div class="card-body"></div>
    <div class="stamp">LOCKED</div>
  `;

  const body = card.querySelector('.card-body');

  if (step.type === 'text' || step.type === 'email') {
    const input = document.createElement('input');
    input.className = 'neon-input';
    input.type = step.type === 'email' ? 'email' : 'text';
    input.placeholder = step.placeholder || '';
    input.autocomplete = step.type === 'email' ? 'email' : 'off';
    input.enterKeyHint = 'go';
    input.value = state.answers[step.id] || '';
    input.addEventListener('input', () => { state.answers[step.id] = input.value; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); lockIn(); } });
    body.appendChild(input);
  } else if (step.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.className = 'neon-input';
    ta.placeholder = step.placeholder || '';
    ta.value = state.answers[step.id] || '';
    ta.addEventListener('input', () => { state.answers[step.id] = ta.value; });
    body.appendChild(ta);
  } else if (step.type === 'chips-single' || step.type === 'chips-multi') {
    const grid = document.createElement('div');
    grid.className = 'chip-grid';
    const multi = step.type === 'chips-multi';
    if (multi && !Array.isArray(state.answers[step.id])) state.answers[step.id] = [];
    step.options.forEach((opt) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = opt;
      const isSel = multi ? state.answers[step.id].includes(opt) : state.answers[step.id] === opt;
      if (isSel) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        ensureAudio();
        sfx.chip();
        buzz(15);
        if (multi) {
          const arr = state.answers[step.id];
          const at = arr.indexOf(opt);
          if (at >= 0) { arr.splice(at, 1); chip.classList.remove('selected'); }
          else { arr.push(opt); chip.classList.add('selected'); }
        } else {
          state.answers[step.id] = opt;
          grid.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
          chip.classList.add('selected');
        }
      });
      grid.appendChild(chip);
    });
    body.appendChild(grid);
  }

  return card;
}

/* ---------------- swipe physics ---------------- */
function attachSwipe(card) {
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
  const stamp = card.querySelector('.stamp');

  const isInteractive = (el) =>
    el.closest('.neon-input, .chip, button, input, textarea');

  card.addEventListener('pointerdown', (e) => {
    if (isInteractive(e.target)) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    card.classList.remove('snap-back');
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    const rot = dx * 0.07;
    card.style.transform = `translate(${dx}px, ${dy * 0.4}px) rotate(${rot}deg)`;
    stamp.style.opacity = Math.min(1, Math.max(0, dx / 110));
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    const threshold = card.offsetWidth * 0.34;
    if (dx > threshold) {
      lockIn(card, dx, dy);
    } else {
      // snap back (left swipes snap back too — no skipping required questions)
      card.classList.add('snap-back');
      card.style.transform = '';
      stamp.style.opacity = 0;
      if (dx < -threshold) showToast("No folding! Answer to keep playing 😉");
    }
    dx = 0; dy = 0;
  };

  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);
}

function currentCard() {
  return $('#cardDeck .active-card');
}

function lockIn(card = currentCard(), dx = 0, dy = 0) {
  if (!card || state.submitting) return;
  const step = STEPS[state.step];
  const value = state.answers[step.id];
  const result = step.validate(value ?? '');

  ensureAudio();

  if (result !== true) {
    sfx.bad();
    buzz([60, 40, 60]);
    card.classList.remove('snap-back');
    card.style.transform = '';
    card.querySelector('.stamp').style.opacity = 0;
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 450);
    showToast(result);
    return;
  }

  // fly off to the right
  sfx.lock();
  buzz([30, 20, 60]);
  const flyX = Math.max(window.innerWidth, dx * 4);
  const flyY = dy * 2;
  card.classList.add('fly-off');
  card.style.transform = `translate(${flyX}px, ${flyY}px) rotate(28deg)`;
  card.querySelector('.stamp').style.opacity = 1;

  addCredits(CREDITS_PER_STEP);

  setTimeout(() => {
    state.step++;
    if (state.step >= STEPS.length) {
      showFinal();
    } else {
      renderDeck();
    }
  }, 380);
}

function addCredits(amount) {
  const el = $('#credits');
  const from = state.credits;
  state.credits += amount;
  el.classList.remove('bump');
  void el.offsetWidth; // restart animation
  el.classList.add('bump');
  // rolling counter
  const start = performance.now();
  const dur = 500;
  (function roll(now) {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(from + (state.credits - from) * p).toLocaleString();
    if (p < 1) requestAnimationFrame(roll);
  })(start);
  sfx.coin();
}

/* ================= final lever ================= */
function showFinal() {
  switchScreen('#screen-final');
  $$('#finalReels .mini-reel').forEach((r) => r.classList.add('tease'));
}

function attachLever() {
  const knob = $('#leverKnob');
  const lever = $('#lever');
  const MAX_PULL = 120;
  let startY = 0, pulling = false;

  knob.addEventListener('pointerdown', (e) => {
    if (state.submitting) return;
    pulling = true;
    startY = e.clientY;
    knob.style.animation = 'none';
    knob.setPointerCapture(e.pointerId);
    ensureAudio();
  });

  knob.addEventListener('pointermove', (e) => {
    if (!pulling) return;
    const pull = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
    knob.style.transform = `translate(-50%, ${pull}px)`;
    if (pull > 8 && Math.random() < 0.2) buzz(8);
  });

  const release = (e) => {
    if (!pulling) return;
    pulling = false;
    const pull = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
    if (pull >= MAX_PULL * 0.85) {
      // full pull — submit!
      buzz([50, 30, 100]);
      sfx.spin();
      lever.style.pointerEvents = 'none';
      submitApplication();
    } else {
      knob.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      knob.style.transform = 'translate(-50%, 0)';
      setTimeout(() => { knob.style.transition = ''; }, 450);
      showToast('Pull it ALL the way down! 🎰');
    }
  };

  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
}

/* ================= submit ================= */
async function submitApplication() {
  if (state.submitting) return;
  state.submitting = true;

  const payload = {
    ...state.answers,
    submittedAt: new Date().toISOString(),
    source: 'poly-jackpot-form',
    userAgent: navigator.userAgent,
  };

  // animate mini reels while we "spin" the submission
  const reels = $$('#finalReels .mini-reel');
  const spinInterval = setInterval(() => {
    reels.forEach((r) => { r.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; });
  }, 80);

  let saved = false;
  try {
    const res = await fetch('api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    saved = res.ok;
  } catch { /* offline / static deploy — fall through to local backup */ }

  if (!saved) {
    // never lose a lead: stash locally as backup
    try {
      const backlog = JSON.parse(localStorage.getItem('pj-submissions') || '[]');
      backlog.push(payload);
      localStorage.setItem('pj-submissions', JSON.stringify(backlog));
    } catch { /* storage full/blocked */ }
  }

  // let the reels spin at least 1.2s for drama, then land on jackpot
  setTimeout(() => {
    clearInterval(spinInterval);
    reels.forEach((r, i) => setTimeout(() => {
      r.textContent = JACKPOT_SYM;
      r.classList.remove('tease');
      sfx.reelStop();
    }, i * 200));
    setTimeout(showWin, 800);
  }, 1200);
}

function showWin() {
  switchScreen('#screen-win');
  $('#winName').textContent = (state.answers.name || 'player').trim();
  document.querySelector('.marquee-frame').classList.add('frenzy');
  sfx.jackpot();
  buzz([100, 60, 100, 60, 300]);
  coinShower(48);
  confettiBlast(70);
  // roll the win amount
  const el = $('#winAmount');
  const target = 777777;
  const start = performance.now();
  (function roll(now) {
    const p = Math.min(1, (now - start) / 1800);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = '+' + Math.round(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(roll);
  })(start);
  setTimeout(() => document.querySelector('.marquee-frame').classList.remove('frenzy'), 4000);
}

/* ================= particles ================= */
function coinShower(n) {
  const layer = $('#coinLayer');
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'coin';
    c.textContent = Math.random() < 0.5 ? '🪙' : '💰';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.fontSize = 22 + Math.random() * 20 + 'px';
    c.style.animationDuration = 1.4 + Math.random() * 1.6 + 's';
    c.style.animationDelay = Math.random() * 0.9 + 's';
    layer.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

function confettiBlast(n) {
  const layer = $('#confettiLayer');
  const colors = ['#ffd700', '#ff2d78', '#00f0ff', '#a855f7', '#39ff88', '#fff7e6'];
  for (let i = 0; i < n; i++) {
    const b = document.createElement('div');
    b.className = 'confetti-bit';
    b.style.left = Math.random() * 100 + 'vw';
    b.style.background = colors[Math.floor(Math.random() * colors.length)];
    b.style.animationDuration = 2.2 + Math.random() * 2 + 's';
    b.style.animationDelay = Math.random() * 0.8 + 's';
    layer.appendChild(b);
    setTimeout(() => b.remove(), 5500);
  }
}

/* ================= wire up ================= */
buildBulbRows();
buildReels();
attachLever();

$('#spinBtn').addEventListener('click', playIntroSpin);
$('#lockBtn').addEventListener('click', () => { sfx.click(); lockIn(); });
$('#muteBtn').addEventListener('click', () => {
  state.muted = !state.muted;
  $('#muteBtn').textContent = state.muted ? '🔇' : '🔊';
});
$('#againBtn').addEventListener('click', async () => {
  const shareData = {
    title: 'POLY JACKPOT 🎰💘',
    text: 'I just applied to play on POLY JACKPOT — the live poly dating game. Come hit it big in love:',
    url: location.href,
  };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* user cancelled */ }
  } else {
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      showToast('Link copied! Send it to a player 💌');
    } catch {
      showToast(location.href);
    }
  }
});
