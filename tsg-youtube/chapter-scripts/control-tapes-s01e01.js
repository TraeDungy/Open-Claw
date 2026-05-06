// ── CONTROL TAPE 001 — CALIBRATION (Subject 14) ──
// Duration: ~25 minutes
// Format: Found-footage research recording
// Hidden binaural: 6Hz theta at -28dB
// Tape degradation: CLEAN (Ep 1-3)
// Characters: tape_label (Kokoro), voss (Chatterbox), subject14 (Chatterbox)

export const TITLE = 'CONTROL TAPE 001 — CALIBRATION';
export const SERIES = 'THE CONTROL TAPES';
export const DURATION_TARGET = 25 * 60;
export const BINAURAL = { carrier: 150, beat: 6, db: -28 };
export const TAPE_FILTER = 'highpass=f=80,lowpass=f=8000'; // Clean tape, Ep 1-3

export const CAST = {
  tape_label: { engine: 'kokoro', voice: 'am_adam', speed: 0.85 },
  voss: {
    engine: 'chatterbox',
    ref_audio: 'voice-references/voss-reference.wav',
    exaggeration: 0.25,
    cfg_weight: 0.55,
  },
  subject14: {
    engine: 'chatterbox',
    ref_audio: 'voice-references/subject14-reference.wav',
    exaggeration: 0.15,
    cfg_weight: 0.60,
  },
};

export const SEGMENTS = [
  // ── TAPE HEADER ──
  { sfxBed: 'tape-room-tone', sfxDb: -35 },
  { sfx: 'tape-start-click' },
  { silenceMs: 2000 },
  { char: 'tape_label', text: 'The Control Series. Signal Research Unit. Recording number zero zero one. Date redacted. Clearance level three. Principal investigator, Doctor Elara Voss.' },
  { silenceMs: 3000 },
  { sfx: 'tape-start-click' },
  { silenceMs: 1500 },

  // ── SESSION BEGINS ──
  { char: 'voss', text: 'Session one. Subject fourteen. This is Doctor Voss. It is... eight forty-seven in the morning. The subject has been seated for approximately four minutes. Vitals are baseline. Room temperature is sixty-eight degrees.' },
  { silenceMs: 3000 },
  { char: 'voss', text: 'Subject fourteen, please state your name for the record.' },
  { silenceMs: 2000 },
  { char: 'subject14', text: 'I would prefer not to.' },
  { silenceMs: 2500 },
  { char: 'voss', text: 'That is fine. Subject fourteen will suffice. Can you confirm that you are here voluntarily?' },
  { silenceMs: 1500 },
  { char: 'subject14', text: 'Yes.' },
  { silenceMs: 1000 },
  { char: 'voss', text: 'And you understand the nature of the tests we will be conducting today?' },
  { silenceMs: 2000 },
  { char: 'subject14', text: 'You are going to show me cards and ask me to guess what is on them.' },
  { silenceMs: 1500 },
  { char: 'voss', text: 'That is... essentially correct. We are measuring statistical deviation in forced-choice perception tasks. The cards are called Zener cards. There are five symbols. Circle, star, waves, square, and cross. Twenty-five cards in the deck. Five of each symbol.' },
  { silenceMs: 2000 },
  { char: 'voss', text: 'By chance alone, you would correctly identify five out of twenty-five. Twenty percent.' },
  { silenceMs: 1500 },
  { char: 'subject14', text: 'And what would not be chance?' },
  { silenceMs: 3000 },
  { char: 'voss', text: 'Let us start the test. I will select a card. You tell me which symbol you believe it to be. Ready?' },
  { silenceMs: 2000 },
  { char: 'subject14', text: 'Ready.' },

  // ── ZENER TEST BLOCK 1 (Cards 1-10) ──
  { silenceMs: 4000 },
  { sfx: 'card-shuffle' },
  { silenceMs: 3000 },
  { char: 'voss', text: 'Card one.' },
  { silenceMs: 5000 },
  { char: 'subject14', text: 'Waves.' },
  { silenceMs: 1500 },
  { sfx: 'pencil-scratch' },
  { silenceMs: 3000 },

  { char: 'voss', text: 'Card two.' },
  { silenceMs: 4000 },
  { char: 'subject14', text: 'Square.' },
  { silenceMs: 1500 },
  { sfx: 'pencil-scratch' },
  { silenceMs: 3000 },

  { char: 'voss', text: 'Card three.' },
  { silenceMs: 6000 },
  { char: 'subject14', text: 'Circle. No. Star.' },
  { silenceMs: 2000 },
  { char: 'voss', text: 'Your first answer or your second?' },
  { silenceMs: 1500 },
  { char: 'subject14', text: 'Star.' },
  { sfx: 'pencil-scratch' },
  { silenceMs: 4000 },

  { char: 'voss', text: 'Card four.' },
  { silenceMs: 5000 },
  { char: 'subject14', text: 'Cross.' },
  { sfx: 'pencil-scratch' },
  { silenceMs: 3000 },

  { char: 'voss', text: 'Card five.' },
  { silenceMs: 7000 },
  { char: 'subject14', text: 'I do not know.' },
  { silenceMs: 2000 },
  { char: 'voss', text: 'Please give your best guess. There are no wrong answers in this context.' },
  { silenceMs: 3000 },
  { char: 'subject14', text: 'Circle.' },
  { sfx: 'pencil-scratch' },
  { silenceMs: 5000 },

  // ── SKIP AHEAD IN THE TEST ──
  { char: 'voss', text: 'Cards six through twenty. Continuing.' },
  { silenceMs: 2000 },

  // Time-compressed middle section — shorter gaps, rhythm established
  { char: 'voss', text: 'Card six.' }, { silenceMs: 4000 },
  { char: 'subject14', text: 'Waves.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2500 },
  { char: 'voss', text: 'Seven.' }, { silenceMs: 3500 },
  { char: 'subject14', text: 'Star.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2500 },
  { char: 'voss', text: 'Eight.' }, { silenceMs: 4000 },
  { char: 'subject14', text: 'Square.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2500 },
  { char: 'voss', text: 'Nine.' }, { silenceMs: 3000 },
  { char: 'subject14', text: 'Cross.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2500 },
  { char: 'voss', text: 'Ten.' }, { silenceMs: 5000 },
  { char: 'subject14', text: 'Waves.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2000 },

  // ── BRIEF PAUSE ──
  { char: 'voss', text: 'Halfway mark. How are you feeling?' },
  { silenceMs: 3000 },
  { char: 'subject14', text: 'Fine. It feels like guessing.' },
  { silenceMs: 2000 },
  { char: 'voss', text: 'That is what it should feel like. Continuing.' },
  { silenceMs: 4000 },

  // Cards 11-25 compressed
  { char: 'voss', text: 'Eleven.' }, { silenceMs: 3000 },
  { char: 'subject14', text: 'Circle.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2000 },
  { char: 'voss', text: 'Twelve.' }, { silenceMs: 3500 },
  { char: 'subject14', text: 'Star.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2000 },
  { char: 'voss', text: 'Thirteen.' }, { silenceMs: 4000 },
  { char: 'subject14', text: 'Cross.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2000 },
  { char: 'voss', text: 'Fourteen.' }, { silenceMs: 3000 },
  { char: 'subject14', text: 'Circle.' }, { sfx: 'pencil-scratch' }, { silenceMs: 2000 },
  { char: 'voss', text: 'Fifteen.' }, { silenceMs: 5000 },
  { char: 'subject14', text: 'Star.' },
  { silenceMs: 1000 },
  { char: 'subject14', text: 'Wait. Waves. No, star. Star.' },
  { sfx: 'pencil-scratch' }, { silenceMs: 3000 },

  { char: 'voss', text: 'Sixteen through twenty-five. Take your time.' },
  { silenceMs: 3000 },
  { char: 'subject14', text: 'Square. Cross. Waves. Circle. Star. Cross. Circle. Waves. Square. Star.' },
  { silenceMs: 2000 },
  { sfx: 'pencil-scratch' },
  { silenceMs: 5000 },

  // ── RESULTS ──
  { char: 'voss', text: 'Thank you. That concludes the first run.' },
  { silenceMs: 3000 },
  { sfx: 'paper-shuffle' },
  { silenceMs: 8000 },
  { char: 'voss', text: 'Eleven out of twenty-five.' },
  { silenceMs: 4000 },
  { char: 'subject14', text: 'Is that good?' },
  { silenceMs: 3000 },
  { char: 'voss', text: 'Chance is five. You scored eleven. That is... notable.' },
  { silenceMs: 2000 },
  { char: 'subject14', text: 'Notable how?' },
  { silenceMs: 5000 },
  { char: 'voss', text: 'It is within the range we would consider statistically interesting. But one session does not constitute data. We will need to repeat this.' },
  { silenceMs: 3000 },
  { char: 'subject14', text: 'When?' },
  { silenceMs: 2000 },
  { char: 'voss', text: 'Tomorrow. Same time. Same room. Same protocol.' },
  { silenceMs: 4000 },

  // ── PRIVATE NOTE (Voss alone) ──
  { sfx: 'door-close' },
  { silenceMs: 5000 },
  { char: 'voss', text: 'Private notation. Session one. Subject fourteen scored eleven out of twenty-five on the initial Zener protocol. Two point four standard deviations above chance. P value approximately zero point zero one six.' },
  { silenceMs: 3000 },
  { char: 'voss', text: 'The result is... within the range Rhine would have flagged for follow-up. But it is a single session. It means nothing by itself.' },
  { silenceMs: 4000 },
  { char: 'voss', text: 'What is unusual is the subject is demeanor. Most subjects treat this as a game. Subject fourteen treated it as a task. Flat affect. Minimal eye contact. Answered as if reporting observations rather than making guesses.' },
  { silenceMs: 5000 },
  { char: 'voss', text: 'Scheduling session two for tomorrow. Standard protocol. No modifications.' },
  { silenceMs: 3000 },
  { char: 'voss', text: 'End of recording.' },
  { silenceMs: 2000 },

  // ── TAPE END ──
  { sfx: 'tape-stop-click' },
  { silenceMs: 5000 },
];
