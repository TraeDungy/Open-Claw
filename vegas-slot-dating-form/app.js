/* ================================================================
   POLY SWIPE — game logic
   Flow: attract spin → shared cards → per-player card decks (p1–p4)
         → lever pull → jackpot win
   Data contract: payload { shared, players[], photo } maps to the
   180-column intake CSV on the server (schema.mjs).
   ================================================================ */

'use strict';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const CREDITS_PER_STEP = 100;
const SYMBOLS = ['🍒', '💋', '7️⃣', '🔔', '💍', '🍀', '💘'];
const JACKPOT_SYM = '💘';

/* ---------------- option lists (mirror schema.mjs VOCAB) ---------------- */
const OPT = {
  party: [
    { v: 1, l: 'Just me 🃏' }, { v: 2, l: "We're a couple 💕" },
    { v: 3, l: 'Throuple 💞' }, { v: 4, l: 'Quad 🔥' },
  ],
  searching_for: [
    { v: 'single_male', l: 'Single guys' }, { v: 'single_female', l: 'Single gals' },
    { v: 'single_nonbinary', l: 'Single enbies' }, { v: 'couple', l: 'A couple' },
    { v: 'throuple', l: 'A throuple' }, { v: 'quad', l: 'A quad' },
    { v: 'open_to_any', l: 'Open to any 🎲' },
  ],
  stage_role: [
    { v: 'featured', l: 'Featured on stage 🌟' }, { v: 'backup', l: 'Backup player 🎟️' },
    { v: 'audience_only', l: 'Audience only 👀' },
  ],
  yes_no: [{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }],
  age_band: [
    { v: '18_20', l: '18–20' }, { v: '21_24', l: '21–24' }, { v: '25_29', l: '25–29' },
    { v: '30_34', l: '30–34' }, { v: '35_39', l: '35–39' }, { v: '40_44', l: '40–44' },
    { v: '45_49', l: '45–49' }, { v: '50_54', l: '50–54' }, { v: '55_plus', l: '55+' },
  ],
  relationship_status: [
    { v: 'single', l: 'Single' }, { v: 'dating', l: 'Dating' }, { v: 'partnered', l: 'Partnered' },
    { v: 'married', l: 'Married' }, { v: 'its_complicated', l: "It's complicated 😅" },
  ],
  gender_identity: [
    { v: 'woman', l: 'Woman' }, { v: 'man', l: 'Man' }, { v: 'nonbinary', l: 'Nonbinary' },
    { v: 'genderfluid', l: 'Genderfluid' }, { v: 'agender', l: 'Agender' },
  ],
  pronouns: [
    { v: 'she_her', l: 'she/her' }, { v: 'he_him', l: 'he/him' }, { v: 'they_them', l: 'they/them' },
    { v: 'she_they', l: 'she/they' }, { v: 'he_they', l: 'he/they' }, { v: 'any_pronouns', l: 'any pronouns' },
  ],
  pronoun_display: [
    { v: 'show_on_screen', l: 'Show them on screen 📺' },
    { v: 'internal_only', l: 'Crew only — keep off screen 🤫' },
  ],
  poly_style: [
    { v: 'solo_poly', l: 'Solo poly' }, { v: 'polyamorous', l: 'Polyamorous' },
    { v: 'ethical_non_monogamy', l: 'ENM' }, { v: 'open_relationship', l: 'Open relationship' },
    { v: 'relationship_anarchy', l: 'Relationship anarchist' }, { v: 'swinger', l: 'Swinger' },
    { v: 'monogamish', l: 'Monogamish' }, { v: 'poly_curious', l: 'Poly-curious' },
    { v: 'figuring_it_out', l: 'Figuring it out 🌀' },
  ],
  role_in_group: [
    { v: 'partner', l: 'Partner' }, { v: 'member', l: 'Member' },
    { v: 'single_friend', l: 'Single friend' },
  ],
  relationship_goals: [
    { v: 'casual_connections', l: 'Casual connections' }, { v: 'dating_exploration', l: 'Dating + exploring' },
    { v: 'long_term_partner', l: 'Long-term partner' }, { v: 'expand_existing_relationship', l: 'Grow our relationship' },
    { v: 'community', l: 'Community' }, { v: 'new_friendships', l: 'New friendships' },
  ],
  referral_source: [
    { v: 'instagram', l: 'Instagram' }, { v: 'tiktok', l: 'TikTok' }, { v: 'facebook', l: 'Facebook' },
    { v: 'website', l: 'Website' }, { v: 'friend', l: 'A friend' },
    { v: 'producer_outreach', l: 'You found me 😏' }, { v: 'other', l: 'Other' },
  ],
  compensation: [
    { v: 'none', l: "I'm here for the vibes" }, { v: 'travel_only', l: 'Cover my travel' },
    { v: 'discuss_if_selected', l: 'Talk if selected' },
  ],
};

const state = {
  step: 0,
  shared: {},
  players: [{}],
  photoData: null,
  photoName: '',
  credits: 0,
  muted: false,
  submitting: false,
};

/* ================= step definitions ================= */
const text = (key, label, opts = {}) => ({ key, label, type: 'text', ...opts });
const chips = (key, label, options, opts = {}) => ({ key, label, type: 'chips', options, ...opts });
const multi = (key, label, options, opts = {}) => ({ key, label, type: 'chips-multi', options, ...opts });
const area = (key, label, opts = {}) => ({ key, label, type: 'textarea', ...opts });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const reqText = (msg) => (v) => (v && String(v).trim().length >= 2) || msg;

function computeSteps() {
  const size = state.shared.group_size || 1;
  const isGroup = size > 1;
  const needsPhoto = state.shared.preferred_stage_role !== 'audience_only';
  const steps = [];

  /* ---- shared block ---- */
  steps.push({
    id: 'party', suit: '🎰', q: "Who's at your table?",
    sub: 'Solo players, couples, throuples, and quads are all welcome.',
    fields: [
      chips('group_size', '', OPT.party, { validate: (v) => !!v || 'Pick your party size!' }),
      text('current_config_notes', 'Anything quirky about your setup? (optional)', {
        optional: true, placeholder: 'e.g. a couple + our single best friend',
      }),
    ],
  });
  steps.push({
    id: 'searching', suit: '🎯', q: 'Who are you swiping for?',
    sub: 'Select all that apply.',
    fields: [multi('searching_for', '', OPT.searching_for, {
      validate: (v) => (v && v.length > 0) || 'Pick at least one!',
    })],
  });
  steps.push({
    id: 'role', suit: '🌟', q: 'How do you want to play?',
    sub: 'Featured players hit the stage. Backups stay on call. Audience watches the sparks fly.',
    fields: [chips('preferred_stage_role', '', OPT.stage_role, {
      validate: (v) => !!v || 'Pick how you want to play!',
    })],
  });
  steps.push({
    id: 'homebase', suit: '🌆', q: 'Where do you roll from?',
    fields: [
      text('home_city', 'City', { placeholder: 'e.g. Fort Lauderdale', validate: reqText('City, please!') }),
      text('home_state', 'State (2 letters)', {
        placeholder: 'FL', maxlength: 2,
        validate: (v) => /^[A-Za-z]{2}$/.test((v || '').trim()) || '2-letter state code!',
      }),
    ],
  });
  steps.push({
    id: 'when', suit: '🗓️', q: 'When can you play?',
    fields: [
      { key: 'availability_from', label: 'Available from', type: 'date', validate: (v) => !!v || 'Pick a start date!' },
      { key: 'availability_to', label: 'Until', type: 'date', validate: (v) => !!v || 'Pick an end date!' },
      text('blackout_dates', 'Blackout dates (optional)', { optional: true, placeholder: 'e.g. 2026-08-01; 2026-08-15' }),
      chips('weekday_evening_ok', 'Weekday evenings OK?', OPT.yes_no, { validate: (v) => !!v || 'Yes or no!' }),
      chips('weekend_ok', 'Weekends OK?', OPT.yes_no, { validate: (v) => !!v || 'Yes or no!' }),
      chips('short_notice_ok', 'Short notice OK?', OPT.yes_no, { validate: (v) => !!v || 'Yes or no!' }),
    ],
  });
  steps.push({
    id: 'logistics', suit: '🚗', q: 'Getting you here.', optional: true,
    sub: 'All optional — helps us plan transport and accommodations.',
    fields: [
      { key: 'travel_radius_mi', label: 'How far will you travel? (miles)', type: 'number', optional: true, placeholder: '50' },
      chips('can_self_transport', 'Got your own ride?', OPT.yes_no, { optional: true }),
      text('transport_needs', 'Transport needs (optional)', { optional: true, placeholder: 'e.g. parking pass' }),
      area('accessibility_needs', 'Accessibility or communication needs (optional)', {
        optional: true, placeholder: 'Captioning, interpretation, sensory, mobility… production will handle it.',
      }),
    ],
  });
  if (isGroup) {
    steps.push({
      id: 'table', suit: '🃏', q: 'Map your table.',
      sub: "Who's connected to whom, and who handles scheduling?",
      fields: [
        area('relationship_map', 'Your relationship map', {
          maxlength: 150, placeholder: 'e.g. p1–p2 married couple; p3 dating both',
          validate: reqText('Sketch the map — even one line helps!'),
        }),
        chips('primary_contact_slot', 'Who books the table?',
          Array.from({ length: size }, (_, i) => ({ v: `p${i + 1}`, l: `Player ${i + 1}` })),
          { validate: (v) => !!v || 'Pick your scheduler!' }),
        text('group_socials', 'Shared socials (optional)', { optional: true, placeholder: 'ig:@yourcrew' }),
      ],
    });
    steps.push({
      id: 'groupstory', suit: '📖', q: "Your table's story.",
      fields: [
        area('group_bio', 'Group bio', {
          placeholder: 'Who are you together? What makes your dynamic work?',
          validate: (v) => (v && v.trim().length >= 30) || 'Give us at least a few sentences (30+ chars)!',
        }),
        area('group_dynamic_summary', 'Your dynamic in one line (optional)', { optional: true }),
      ],
    });
  }
  if (needsPhoto) {
    steps.push({
      id: 'photo', suit: '📸', q: 'Show us the goods.',
      sub: isGroup ? 'One recent photo with everyone in it.' : 'One recent photo of you.',
      fields: [{
        key: 'photo', label: '', type: 'photo',
        validate: () => !!state.photoData || 'A photo is required for stage players!',
      }],
    });
  }
  steps.push({
    id: 'referral', suit: '📣', q: 'How did you find us?', optional: true,
    fields: [
      chips('referral_source', '', OPT.referral_source, { optional: true }),
      text('referral_detail', 'Details (optional)', { optional: true, placeholder: 'e.g. Polywood IG story' }),
      chips('compensation_expectation', 'Compensation expectations', OPT.compensation, { optional: true }),
      chips('marketing_opt_in', 'Can we email you about future events?', OPT.yes_no, { optional: true }),
    ],
  });
  steps.push({
    id: 'houserules', suit: '📜', q: 'House rules.',
    sub: 'The fine print, minus the fine print: be kind, respect consent, and let us handle your info per our privacy policy.',
    fields: [
      chips('consent_code_of_conduct', 'I agree to the code of conduct — kindness and consent, always.', OPT.yes_no,
        { validate: (v) => v === 'yes' || 'The code of conduct is required to play.' }),
      chips('consent_house_rules', 'I agree to the live-show house rules.', OPT.yes_no,
        { validate: (v) => v === 'yes' || 'House rules are required to play.' }),
      chips('consent_data_privacy', 'I agree to the data privacy terms.', OPT.yes_no,
        { validate: (v) => v === 'yes' || 'Privacy terms are required to play.' }),
    ],
  });

  /* ---- per-player blocks ---- */
  for (let i = 0; i < size; i++) {
    const P = `PLAYER ${i + 1}`;
    const you = size === 1 ? 'you' : P;
    steps.push({
      id: `p${i}_contact`, suit: '♥️', player: i, badge: P,
      q: i === 0 ? "Deal yourself in." : `Deal in ${P.toLowerCase()}.`,
      sub: 'Name and contact info — this is how we reach you if you’re picked.',
      fields: [
        text('display_name', 'Name (or stage name)', { validate: reqText('At least 2 letters!') }),
        { key: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com',
          validate: (v) => EMAIL_RE.test((v || '').trim()) || "That email doesn't look right!" },
        { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 555 0100',
          validate: (v) => ((v || '').replace(/\D/g, '').length >= 7) || 'A real phone number, please!' },
      ],
    });
    steps.push({
      id: `p${i}_vibe`, suit: '🎂', player: i, badge: P,
      q: 'Pick your table.',
      sub: 'This is an adults-only casino. 😏',
      fields: [
        chips('age_band', 'Age range', OPT.age_band, { validate: (v) => !!v || 'Pick an age range!' }),
        chips('relationship_status', 'Relationship status', OPT.relationship_status,
          { validate: (v) => !!v || 'Pick a status!' }),
      ],
    });
    steps.push({
      id: `p${i}_identity`, suit: '💫', player: i, badge: P,
      q: 'Tell us who you are.',
      sub: 'Self-described, always. Pronoun display is your call — on screen or crew-only.',
      fields: [
        chips('gender_identity', 'Gender identity', OPT.gender_identity, {
          validate: (v, scope) => !!(v || (scope.gender_identity_custom || '').trim()) || 'Pick one or self-describe below!',
        }),
        text('gender_identity_custom', 'Or in your own words (optional)', { optional: true }),
        chips('pronouns', 'Pronouns', OPT.pronouns, {
          validate: (v, scope) => !!(v || (scope.pronouns_custom || '').trim()) || 'Pick or write your pronouns!',
        }),
        text('pronouns_custom', 'Custom pronouns (optional)', { optional: true, placeholder: 'e.g. ze/zir' }),
        chips('pronoun_display', 'On-screen display', OPT.pronoun_display,
          { validate: (v) => !!v || 'On screen or crew-only?' }),
      ],
    });
    steps.push({
      id: `p${i}_style`, suit: '🧭', player: i, badge: P,
      q: 'How do you play?',
      fields: [
        chips('poly_style', 'Relationship style', OPT.poly_style, { validate: (v) => !!v || 'Pick a style!' }),
        ...(i > 0 ? [chips('role_in_group', 'Role in this submission', OPT.role_in_group,
          { validate: (v) => !!v || 'Pick a role!' })] : []),
      ],
    });
    steps.push({
      id: `p${i}_bio`, suit: '🎤', player: i, badge: P,
      q: 'Your 10-second intro.',
      sub: 'How the host would introduce you. Make it sing.',
      fields: [area('short_bio', '', {
        placeholder: 'e.g. Tattoo artist, Pisces, and soft-spoken flirt with a sharp read on vibes.',
        validate: (v) => (v && v.trim().length >= 30) || 'Give us at least 30 characters of you!',
      })],
    });
    steps.push({
      id: `p${i}_flags`, suit: '🚩', player: i, badge: P,
      q: 'Show your flags.',
      sub: 'Three green flags you bring. Three red flags you won’t tolerate.',
      fields: [
        { key: 'green_flags', label: '💚 Green flags (yours)', type: 'list3',
          placeholders: ['communicates directly', 'keeps agreements', 'great sense of humor'],
          validate: (v) => (Array.isArray(v) && v.filter((x) => x && x.trim()).length === 3) || 'All 3 green flags, please!' },
        { key: 'red_flags', label: '🚩 Red flags (dealkillers in others)', type: 'list3',
          placeholders: ['love bombing', 'calendar chaos', 'avoids accountability'],
          validate: (v) => (Array.isArray(v) && v.filter((x) => x && x.trim()).length === 3) || 'All 3 red flags, please!' },
      ],
    });
    steps.push({
      id: `p${i}_lines`, suit: '🛑', player: i, badge: P,
      q: 'Your lines. We protect them.',
      sub: 'The host and moderators read these before you ever hit the stage.',
      fields: [
        area('dealbreakers', 'Dealbreakers (1–5, separate with ;)', {
          placeholder: 'dishonesty; coercion; disrespect toward partners',
          validate: (v) => {
            const items = (v || '').split(/[;\n]/).map((s) => s.trim()).filter(Boolean);
            return (items.length >= 1 && items.length <= 5) || 'List 1 to 5 dealbreakers, separated by ;';
          },
        }),
        area('boundaries_hard_limits', 'Hard limits on the show (no-gos)', {
          placeholder: 'e.g. No surprise kissing; no humiliation bits; no alcohol pressure.',
          validate: reqText('Your no-gos matter — give us at least one!'),
        }),
        text('health_safety_notes', 'Anything for our safety team? (optional)', {
          optional: true, placeholder: 'e.g. allergies, sober by choice, sensory needs',
        }),
      ],
    });
    steps.push({
      id: `p${i}_bonus`, suit: '💎', player: i, badge: P, optional: true,
      q: 'Bonus round.',
      sub: 'All optional — but it’s how you win the audience.',
      fields: [
        text('social_handles', 'Socials', { optional: true, placeholder: 'ig:@you; tt:@you' }),
        text('favorite_food', 'Favorite food', { optional: true, placeholder: 'spicy tuna rolls' }),
        text('best_qualities', 'Your best qualities (separate with ;)', { optional: true, placeholder: 'warm; articulate; confident' }),
        multi('relationship_goals', 'What are you betting on?', OPT.relationship_goals, { optional: true }),
        { key: 'longest_relationship_months', label: 'Longest relationship (months)', type: 'number', optional: true, placeholder: '36' },
      ],
    });
    steps.push({
      id: `p${i}_consent`, suit: '✍️', player: i, badge: P,
      q: size === 1 ? 'Your signature, player.' : `${P}, your signature.`,
      sub: 'This show is LIVE and recorded. Every player signs for themselves — no one can sign for you.',
      fields: [
        chips('consent_live_broadcast', `I (${you}) consent to appearing on a live broadcast.`, OPT.yes_no,
          { validate: (v) => v === 'yes' || 'Live-broadcast consent is required to be on the show.' }),
        chips('consent_media_release', 'I consent to my name, image, and submission being used for the show and promotion.', OPT.yes_no,
          { validate: (v) => v === 'yes' || 'Media release consent is required to be on the show.' }),
        chips('consent_voluntary', 'I am here voluntarily — no partner, friend, or producer pressured me.', OPT.yes_no,
          { validate: (v) => v === 'yes' || 'Participation must be voluntary. If you feel pressured, please step back.' }),
      ],
    });
  }

  return steps;
}

let steps = computeSteps();

function scopeFor(step) {
  if (step.player == null) return state.shared;
  while (state.players.length <= step.player) state.players.push({});
  return state.players[step.player];
}

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
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
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
    const landingRow = (STRIP_REPEAT - 3) * SYMBOLS.length + symIdx;
    reel.classList.add('spinning');
    strip.style.transition = `transform ${duration}ms cubic-bezier(.15,.6,.25,1)`;
    strip.style.transform = `translateY(${-(landingRow * SYM_H)}px)`;
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

  $('#slotMachine').classList.add('jackpot');
  document.querySelector('.marquee-frame').classList.add('frenzy');
  sfx.jackpot();
  buzz([80, 50, 80, 50, 200]);
  coinShower(28);

  setTimeout(() => {
    document.querySelector('.marquee-frame').classList.remove('frenzy');
    switchScreen('#screen-form');
    renderDeck();
  }, 1600);
}

/* ================= progress ================= */
function renderProgress() {
  const pct = Math.round((state.step / steps.length) * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progressLabel').textContent = `${Math.min(state.step + 1, steps.length)} / ${steps.length}`;
}

/* ================= card deck ================= */
function renderDeck() {
  steps = computeSteps();
  const deck = $('#cardDeck');
  deck.innerHTML = '';
  for (let depth = Math.min(2, steps.length - 1 - state.step); depth >= 0; depth--) {
    const idx = state.step + depth;
    if (idx >= steps.length) continue;
    const card = buildCard(steps[idx], idx);
    if (depth === 1) card.classList.add('behind-1');
    if (depth === 2) card.classList.add('behind-2');
    if (depth === 0) {
      card.classList.add('active-card', 'pop-in');
      attachSwipe(card);
    }
    deck.appendChild(card);
  }
  renderProgress();
  $('#swipeHint').classList.toggle('hidden', state.step > 1);
}

function buildCard(step, idx) {
  const card = document.createElement('div');
  card.className = 'q-card';
  card.dataset.id = step.id;

  const badge = step.badge ? `${step.badge} · ` : '';
  const opt = step.optional ? ' · OPTIONAL' : '';
  card.innerHTML = `
    <div class="card-suit">${step.suit}</div>
    <div class="card-step-num">${badge}CARD ${idx + 1} / ${steps.length}${opt}</div>
    <div class="card-q">${step.q}</div>
    ${step.sub ? `<div class="card-sub">${step.sub}</div>` : ''}
    <div class="card-body"></div>
    <div class="stamp">LOCKED</div>
  `;

  const body = card.querySelector('.card-body');
  const scope = scopeFor(step);
  step.fields.forEach((f) => body.appendChild(buildField(f, scope)));
  return card;
}

function buildField(f, scope) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  if (f.label) {
    const label = document.createElement('div');
    label.className = 'f-label';
    label.textContent = f.label;
    wrap.appendChild(label);
  }

  const setVal = (v) => { scope[f.key] = v; };

  if (f.type === 'chips' || f.type === 'chips-multi') {
    const isMulti = f.type === 'chips-multi';
    if (isMulti && !Array.isArray(scope[f.key])) scope[f.key] = [];
    const grid = document.createElement('div');
    grid.className = 'chip-grid';
    f.options.forEach((opt) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = opt.l;
      const isSel = isMulti ? scope[f.key].includes(opt.v) : scope[f.key] === opt.v;
      if (isSel) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        ensureAudio(); sfx.chip(); buzz(15);
        if (isMulti) {
          const arr = scope[f.key];
          const at = arr.indexOf(opt.v);
          if (at >= 0) { arr.splice(at, 1); chip.classList.remove('selected'); }
          else { arr.push(opt.v); chip.classList.add('selected'); }
        } else {
          setVal(opt.v);
          grid.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
          chip.classList.add('selected');
        }
      });
      grid.appendChild(chip);
    });
    wrap.appendChild(grid);
  } else if (f.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.className = 'neon-input';
    ta.placeholder = f.placeholder || '';
    if (f.maxlength) ta.maxLength = f.maxlength;
    ta.value = scope[f.key] || '';
    ta.addEventListener('input', () => setVal(ta.value));
    wrap.appendChild(ta);
  } else if (f.type === 'list3') {
    if (!Array.isArray(scope[f.key])) scope[f.key] = ['', '', ''];
    for (let i = 0; i < 3; i++) {
      const input = document.createElement('input');
      input.className = 'neon-input mini';
      input.type = 'text';
      input.placeholder = (f.placeholders && f.placeholders[i]) || `#${i + 1}`;
      input.value = scope[f.key][i] || '';
      input.addEventListener('input', () => { scope[f.key][i] = input.value; });
      wrap.appendChild(input);
    }
  } else if (f.type === 'photo') {
    const drop = document.createElement('div');
    drop.className = 'photo-drop';
    const preview = document.createElement('img');
    preview.className = 'photo-preview';
    preview.alt = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip photo-btn';
    btn.textContent = state.photoData ? '📸 Swap photo' : '📸 Add a photo';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    if (state.photoData) { preview.src = state.photoData; drop.classList.add('has-photo'); }
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) { showToast('Max 8MB — try a smaller photo!'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        state.photoData = reader.result;
        state.photoName = file.name;
        preview.src = state.photoData;
        drop.classList.add('has-photo');
        btn.textContent = '📸 Swap photo';
        sfx.chip(); buzz(20);
      };
      reader.readAsDataURL(file);
    });
    drop.append(preview, btn, input);
    wrap.appendChild(drop);
  } else {
    const input = document.createElement('input');
    input.className = 'neon-input';
    input.type = f.type === 'number' ? 'number' : f.type;
    input.placeholder = f.placeholder || '';
    if (f.maxlength) input.maxLength = f.maxlength;
    if (f.type === 'email') input.autocomplete = 'email';
    if (f.type === 'tel') input.autocomplete = 'tel';
    input.enterKeyHint = 'next';
    input.value = scope[f.key] ?? '';
    input.addEventListener('input', () => setVal(input.value));
    wrap.appendChild(input);
  }
  return wrap;
}

/* ---------------- swipe physics ---------------- */
function attachSwipe(card) {
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
  const stamp = card.querySelector('.stamp');
  const isInteractive = (el) => el.closest('.neon-input, .chip, button, input, textarea, .photo-drop');

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
    card.style.transform = `translate(${dx}px, ${dy * 0.4}px) rotate(${dx * 0.07}deg)`;
    stamp.style.opacity = Math.min(1, Math.max(0, dx / 110));
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    const threshold = card.offsetWidth * 0.34;
    if (dx > threshold) {
      lockIn(card, dx, dy);
    } else {
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

function validateStep(step) {
  const scope = scopeFor(step);
  for (const f of step.fields) {
    if (!f.validate) continue;
    const result = f.validate(scope[f.key], scope);
    if (result !== true) return result;
  }
  return true;
}

function lockIn(card = currentCard(), dx = 0, dy = 0) {
  if (!card || state.submitting) return;
  const step = steps[state.step];
  const result = validateStep(step);

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

  // group size locked in → sync players array
  if (step.id === 'party') {
    const size = state.shared.group_size || 1;
    while (state.players.length < size) state.players.push({});
    state.players.length = size;
  }

  sfx.lock();
  buzz([30, 20, 60]);
  const flyX = Math.max(window.innerWidth, dx * 4);
  card.classList.add('fly-off');
  card.style.transform = `translate(${flyX}px, ${dy * 2}px) rotate(28deg)`;
  card.querySelector('.stamp').style.opacity = 1;

  addCredits(CREDITS_PER_STEP);

  setTimeout(() => {
    state.step++;
    if (state.step >= steps.length) {
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
  void el.offsetWidth;
  el.classList.add('bump');
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
function buildPayload() {
  const players = state.players.map((p) => {
    const out = { ...p };
    if ((p.gender_identity_custom || '').trim()) out.gender_identity = p.gender_identity_custom.trim();
    if ((p.pronouns_custom || '').trim()) out.pronouns = p.pronouns_custom.trim();
    delete out.gender_identity_custom;
    delete out.pronouns_custom;
    out.dealbreakers = (p.dealbreakers || '').split(/[;\n]/).map((s) => s.trim()).filter(Boolean);
    out.best_qualities = (p.best_qualities || '').split(/[;\n]/).map((s) => s.trim()).filter(Boolean);
    return out;
  });
  return {
    shared: state.shared,
    players,
    photo: state.photoData ? { name: state.photoName, data: state.photoData } : null,
    source: 'poly-swipe-form',
    userAgent: navigator.userAgent,
  };
}

async function submitApplication() {
  if (state.submitting) return;
  state.submitting = true;

  const payload = buildPayload();
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
    try {
      const backlog = JSON.parse(localStorage.getItem('pj-submissions') || '[]');
      const { photo, ...rest } = payload;
      backlog.push(rest);
      localStorage.setItem('pj-submissions', JSON.stringify(backlog));
    } catch { /* storage full/blocked */ }
    // standalone build: hand the application over as a one-row CSV download
    if (window.PS_LOCAL) {
      try { downloadLocalCsv(payload); } catch { /* blob blocked */ }
    }
  }

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

/* Standalone (no-server) build: flatten the payload onto the 180-column
   schema header embedded by build-local.mjs and download it as CSV. */
function downloadLocalCsv(payload) {
  const H = window.PS_LOCAL.header;
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const row = Object.fromEntries(H.map((c) => [c, '']));
  const size = payload.players.length;
  Object.assign(row, {
    submission_id: 'PS-LOCAL-' + Date.now(),
    application_ts: new Date().toISOString(),
    event_name: 'POLY SWIPE',
    submission_type: size > 1 ? 'group' : 'single',
    group_size: size,
    current_config: { 1: 'solo', 2: 'couple', 3: 'throuple', 4: 'quad' }[size] || 'other',
    group_photo_file: state.photoName || '',
    producer_status: 'new',
  });
  for (const [k, v] of Object.entries(payload.shared)) {
    if (!(k in row)) continue;
    row[k] = Array.isArray(v) ? v.join(k === 'searching_for' ? '|' : ';') : v;
  }
  row.home_state = (row.home_state || '').toUpperCase();
  payload.players.forEach((p, i) => {
    const k = (col) => `p${i + 1}_${col}`;
    for (const [key, v] of Object.entries(p)) {
      const col = k(key);
      if (!(col in row)) continue;
      row[col] = Array.isArray(v) ? v.join(key === 'relationship_goals' ? '|' : ';') : v;
    }
    if (!row[k('role_in_group')]) row[k('role_in_group')] = i === 0 ? 'primary_applicant' : 'member';
    row[k('sti_status_optional')] = row[k('sti_status_optional')] || 'not_disclosed';
  });
  const consentCols = ['consent_live_broadcast', 'consent_media_release', 'consent_voluntary'];
  const allConsented = payload.players.every((_, i) => consentCols.every((c) => row[`p${i + 1}_${c}`] === 'yes'));
  row.mod_safety_flag = allConsented ? 'none' : 'review';

  const csv = H.join(',') + '\n' + H.map((c) => esc(row[c])).join(',') + '\n';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = row.submission_id + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function showWin() {
  switchScreen('#screen-win');
  $('#winName').textContent = ((state.players[0] || {}).display_name || 'player').trim();
  document.querySelector('.marquee-frame').classList.add('frenzy');
  sfx.jackpot();
  buzz([100, 60, 100, 60, 300]);
  coinShower(48);
  confettiBlast(70);
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
    title: 'POLY SWIPE 🎰💘',
    text: 'I just applied to be on POLY SWIPE — the live dating game show. One swipe could change everything:',
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
