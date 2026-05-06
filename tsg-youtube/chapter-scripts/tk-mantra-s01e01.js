// ── TK MANTRA SESSION — CYCLE 01: AWARENESS > CONTROL ──
// Duration: ~45 minutes
// Binaural: 10Hz alpha (relaxed awareness)
// Voice: Kokoro am_adam OR Chatterbox guide voice
// Structure: guided instruction (60-90s) → silence (3-5 min) → repeat

export const TITLE = 'CYCLE 01: AWARENESS > CONTROL';
export const SERIES = 'TK MANTRA SESSIONS';
export const DURATION_TARGET = 45 * 60; // 45 minutes in seconds
export const BINAURAL = { carrier: 100, beat: 10, db: -28 };

export const CAST = {
  guide: { engine: 'kokoro', voice: 'am_adam', speed: 0.90 },
};

export const SEGMENTS = [
  // ── OPENING (0:00 - 2:00) ──
  { sfxBed: 'binaural-alpha-10hz', sfxDb: -28 },
  { silenceMs: 5000 },
  { char: 'guide', text: 'Welcome to the Telekinesis Support Group.' },
  { silenceMs: 3000 },
  { char: 'guide', text: 'This is Cycle One. Awareness leading to Control.' },
  { silenceMs: 4000 },
  { char: 'guide', text: 'Find your position. Sit or lie down. It does not matter which. What matters is that you are still.' },
  { silenceMs: 5000 },
  { char: 'guide', text: 'Close your eyes. Or leave them open. The instruction is the same either way.' },
  { silenceMs: 3000 },
  { char: 'guide', text: 'Pay attention.' },
  { silenceMs: 8000 },

  // ── BODY AWARENESS (2:00 - 7:00) ──
  { char: 'guide', text: 'For the next forty-five minutes, you have one task. Notice what is already happening.' },
  { silenceMs: 6000 },
  { char: 'guide', text: 'Begin with the weight of your body against the surface beneath you. Feel it. The pressure. The temperature. The texture.' },
  { silenceMs: 15000 },
  { char: 'guide', text: 'Now notice your breathing. Do not change it. Do not deepen it. Simply watch it move.' },
  { silenceMs: 20000 },
  { char: 'guide', text: 'You are not trying to relax. You are not trying to do anything. You are observing a system that is already running.' },
  { silenceMs: 30000 },
  { char: 'guide', text: 'Good. Stay here.' },
  { silenceMs: 120000 }, // 2 min silence

  // ── ATTENTION TRAINING (7:00 - 15:00) ──
  { char: 'guide', text: 'Now. Bring your attention to a single point. The space between your eyebrows. The third eye point.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'You do not need to visualize anything. You do not need to see light or color. Simply place your attention there. Like placing your hand on a table.' },
  { silenceMs: 10000 },
  { char: 'guide', text: 'Hold it.' },
  { silenceMs: 60000 }, // 1 min
  { char: 'guide', text: 'When your attention drifts, and it will drift, bring it back. No judgment. No frustration. Just return.' },
  { silenceMs: 120000 }, // 2 min
  { char: 'guide', text: 'This is the fundamental skill. Everything that follows depends on this. Attention is direction.' },
  { silenceMs: 180000 }, // 3 min

  // ── THE SIGNAL CONCEPT (15:00 - 22:00) ──
  { char: 'guide', text: 'In this work, we use the word signal. A signal is focused attention with intention behind it.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'Right now, your attention is a flashlight. It goes where you point it. But it has no force. No weight.' },
  { silenceMs: 6000 },
  { char: 'guide', text: 'We are going to change that.' },
  { silenceMs: 10000 },
  { char: 'guide', text: 'Return to the point between your eyebrows. Hold your attention there. And this time, imagine that your attention has density. Weight. Substance.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'As if your awareness itself could press against that point.' },
  { silenceMs: 120000 }, // 2 min
  { char: 'guide', text: 'Do not strain. The moment you strain, you lose it. This is about presence, not force.' },
  { silenceMs: 180000 }, // 3 min

  // ── FIRST EXERCISE (22:00 - 32:00) ──
  { char: 'guide', text: 'Good. Now we begin the first exercise.' },
  { silenceMs: 6000 },
  { char: 'guide', text: 'Extend your dominant hand in front of you. Palm facing forward. Fingers relaxed.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'Place your attention on the center of your palm. Feel the air against your skin. The warmth. The tingling. Whatever is there.' },
  { silenceMs: 15000 },
  { char: 'guide', text: 'Now. Without moving your hand, push your attention outward. Through your palm. Into the space in front of you.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'As if your awareness could extend past the boundary of your skin.' },
  { silenceMs: 10000 },
  { char: 'guide', text: 'Hold this.' },
  { silenceMs: 180000 }, // 3 min
  { char: 'guide', text: 'What did you notice. Not what you expected. Not what you hoped. What actually happened in your field of sensation.' },
  { silenceMs: 120000 }, // 2 min
  { char: 'guide', text: 'Lower your hand. Rest.' },
  { silenceMs: 60000 }, // 1 min

  // ── SECOND EXERCISE (32:00 - 40:00) ──
  { char: 'guide', text: 'One more exercise before we close.' },
  { silenceMs: 5000 },
  { char: 'guide', text: 'Close your eyes if they are not already closed. Return to the third eye point.' },
  { silenceMs: 10000 },
  { char: 'guide', text: 'Imagine a single shape in front of you. A circle. Just a simple circle. Golden. Floating in darkness.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'Hold this image as steady as you can. Do not let it drift. Do not let it change shape. Just hold it.' },
  { silenceMs: 10000 },
  { char: 'guide', text: 'This is what control feels like. Not force. Stillness.' },
  { silenceMs: 240000 }, // 4 min
  { char: 'guide', text: 'Release the image. Let it dissolve.' },
  { silenceMs: 60000 }, // 1 min

  // ── CLOSING (40:00 - 45:00) ──
  { char: 'guide', text: 'You have completed Cycle One.' },
  { silenceMs: 5000 },
  { char: 'guide', text: 'The skills practiced today are attention placement, sustained focus, and directed awareness. These are the foundation of everything that comes next.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'Before the next session, practice holding your attention on a single point for five minutes each day. Any point. A dot on a wall. A candle flame. The center of your palm.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'Consistency matters more than duration. Five minutes of genuine focus is worth more than an hour of scattered trying.' },
  { silenceMs: 10000 },
  { char: 'guide', text: 'No claims. No promises. Just show up and pay attention.' },
  { silenceMs: 5000 },
  { char: 'guide', text: 'This has been the Telekinesis Support Group. Cycle One. Awareness leading to Control.' },
  { silenceMs: 8000 },
  { char: 'guide', text: 'End of session.' },
  { silenceMs: 30000 }, // 30s fade out
];
