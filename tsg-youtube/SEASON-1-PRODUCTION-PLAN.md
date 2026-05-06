# TSG YouTube — Full Season Production Plan

## Context
The Telekinesis Support Group landing page is built and polished (cymatic effects, Zener card game, hero image). Cinematic poster art for 5 YouTube content series has been generated via GPT Image 2 with title overlays. Now we need to produce actual video content — full Season 1 for each series (50 episodes total). All tools are already installed: FFmpeg 7.1, MusicGen, Chatterbox TTS, Kokoro TTS, p5.js skill, and the assembler pipeline from the audiobook project.

---

## 5 Series — Season 1 Episode Lists

### Series 1: SLEEP AIDE (10 episodes, 3-8h each)
| # | Title | Duration |
|---|-------|----------|
| 1 | THETA DRIFT 001 — 6Hz Deep Presence | 3h |
| 2 | DELTA DESCENT 001 — 2Hz Sleep Induction | 4h |
| 3 | THETA DRIFT 002 — 4.5Hz Liminal Gate | 3h |
| 4 | DELTA DESCENT 002 — 1Hz Deep Void | 6h |
| 5 | THETA-DELTA CYCLE 001 — Sleep Architecture | 8h |
| 6 | THETA DRIFT 003 — 5.5Hz Hypnagogic Edge | 3h |
| 7 | DELTA DESCENT 003 — 0.5Hz Abyssal | 6h |
| 8 | CARRIER WAVE 001 — 174Hz Solfeggio Foundation | 4h |
| 9 | THETA-DELTA CYCLE 002 — Full Night Protocol | 8h |
| 10 | THE LONGEST NIGHT — 0.75Hz Infinite Rest | 8h |

### Series 2: TK MANTRA SESSIONS (10 episodes, 45-90min each)
| # | Title | Duration |
|---|-------|----------|
| 1 | CYCLE 01: AWARENESS > CONTROL | 45 min |
| 2 | CYCLE 02: STILLNESS > SIGNAL | 60 min |
| 3 | CYCLE 03: PERCEPTION > REACH | 45 min |
| 4 | CYCLE 04: BREATH > FORCE | 60 min |
| 5 | CYCLE 05: OBJECT > FIELD | 90 min |
| 6 | CYCLE 06: IMPULSE > DIRECTION | 60 min |
| 7 | CYCLE 07: RESISTANCE > FLOW | 45 min |
| 8 | CYCLE 08: FREQUENCY > LOCK | 60 min |
| 9 | CYCLE 09: FIELD > COHERENCE | 90 min |
| 10 | CYCLE 10: CONTROL > RELEASE | 90 min |

### Series 3: THE FREQUENCY ROOM (12 episodes, 1-2h each)
| # | Title | Duration |
|---|-------|----------|
| 1 | 7.83 Hz — The Schumann Resonance | 1h |
| 2 | 40 Hz — Gamma Consciousness | 1h |
| 3 | 432 Hz — Natural Tuning | 1.5h |
| 4 | 528 Hz — The Repair Frequency | 1h |
| 5 | 174 Hz — Foundation Tone | 1.5h |
| 6 | 396 Hz — Liberation | 1h |
| 7 | 10 Hz — Alpha Peak | 1h |
| 8 | 136.1 Hz — The OM Frequency | 1.5h |
| 9 | 963 Hz — Crown Activation | 1h |
| 10 | 285 Hz — Cellular Memory | 1h |
| 11 | 4 Hz — Theta Gateway | 1.5h |
| 12 | 7.83 Hz REVISITED — Deep Schumann | 2h |

### Series 4: BLACK ROOM SESSIONS (8 episodes, 30-60min each)
| # | Title | Hidden Symbol Time |
|---|-------|--------------------|
| 1 | CAN YOU HOLD THE SIGNAL? | Circle @ 23:00 |
| 2 | THE EDGE OF NOTHING | Star @ 17:42 |
| 3 | WHAT THE DARK RETURNS | Waves @ 31:15 |
| 4 | THE ROOM REMEMBERS | Cross @ 28:06 |
| 5 | PRESSURE WITHOUT WEIGHT | Square @ 40:22 |
| 6 | SIGNAL IN THE STATIC | Circle @ 25:50 |
| 7 | THE LONGEST HOLD | Star @ 52:18 |
| 8 | WHAT DID YOU SEE? | All 5 symbols in final 5 min |

### Series 5: THE CONTROL TAPES (10 episodes, 25-40min each)
| # | Title | Description |
|---|-------|-------------|
| 1 | CALIBRATION (Subject 14) | Dr. Voss begins protocol. Baseline Zener tests. |
| 2 | ANOMALY LOG | Third consecutive session at 11/25. Voss notes it. |
| 3 | THE FREQUENCY VARIABLE | Binaural audio during testing. Scores jump to 16/25. |
| 4 | DEVIATION | Glass of water is vibrating. Nobody mentions it. |
| 5 | PROTOCOL SEVEN | Classified protocol. Military interest. Tape degrades. |
| 6 | THE BLACK ROOM | Sensory deprivation chamber. 8 min silence, then metal bending. |
| 7 | INTERFERENCE | Voss's private journal. She is afraid. Tape skips. |
| 8 | THE CONTROL GROUP | There was never a control group. |
| 9 | SIGNAL LOSS | Subject 14 is gone. Glass still vibrating. |
| 10 | CALIBRATION (Subject 15) | New subject. Same protocol. The voice is familiar. |

---

## Production Pipeline — What to Build

### Phase 1: Shared Infrastructure (build first)

1. **Create project directory** at `/Users/trialxfire/open claw/tsg-youtube/`
   - `scripts/`, `visuals/`, `audio/`, `chapter-scripts/`, `casts/`, `output/`, `thumbnails/`

2. **`scripts/generate-binaural.sh`** — Parameterized FFmpeg binaural beat generator
   - Input: carrier_freq, beat_freq, duration_seconds, output_path
   - Output: stereo WAV with left/right offset

3. **`scripts/musicgen-ambient-batch.py`** — Generate N×30s MusicGen clips, crossfade-concat to target duration
   - Runs on VPS in `/root/venvs/musicgen`

4. **`scripts/render-visuals.js`** — Headless p5.js renderer (node-canvas based)
   - Ports CymaticField.tsx wave logic to standalone canvas
   - Ports Chladni plate math from generate-posters.js
   - Outputs PNG frames or single still image per episode

5. **`scripts/assemble-video.sh`** — FFmpeg final assembly template per series format

6. **Zener symbol PNGs** at 2%, 4%, 6%, 8% opacity — for Black Room overlays

7. **Voice references** for Control Tapes — source 3 WAVs from YouTube for Chatterbox cloning

### Phase 2: First 5 Episodes (one per series)

**Build order by complexity (easiest first):**

| Order | Series | Episode | Why First |
|-------|--------|---------|-----------|
| 1 | BLACK ROOM | Session 01 | Simplest: black video + binaural + 1 symbol overlay |
| 2 | SLEEP AIDE | Theta Drift 001 | Still image + binaural + MusicGen ambient layer |
| 3 | FREQUENCY ROOM | 7.83 Hz Schumann | Chladni visual + tone generation |
| 4 | TK MANTRA | Cycle 01 | Needs narration script + TTS + cymatic visual |
| 5 | CONTROL TAPES | Tape 001 | Full voice cast + script + foley + tape aesthetic |

### Phase 3: Remaining 45 episodes
Steady cadence: 2-3 episodes per week across series.

---

## Audio Recipes (per series)

**Sleep Aide:** FFmpeg binaural (200Hz carrier ± beat_freq) + MusicGen ambient pad at -18dB + pink noise at -40dB
**TK Mantra:** Kokoro/Chatterbox narration + binaural at -28dB + MusicGen ritual ambient
**Frequency Room:** FFmpeg pure tone + harmonics (2x, 3x, 5x) + MusicGen harmonic drone
**Black Room:** Binaural at -30dB + room tone (pink noise bandpass 60-300Hz) + sparse 3D micro-events
**Control Tapes:** Multi-voice Chatterbox TTS + hidden binaural at -28dB + MusicGen tape hiss + FFmpeg foley + progressive tape degradation filters

---

## Visual Recipes (per series)

**Sleep Aide:** Cosmic particle drift (adapted ParticleField.tsx) or still poster image + Ken Burns
**TK Mantra:** Cymatic rings (adapted CymaticField.tsx) pulsing with narration rhythm
**Frequency Room:** Animated Chladni plate (math from generate-posters.js lines 265-288)
**Black Room:** Pure #000000 + single Zener symbol at 4% opacity at hidden timestamp
**Control Tapes:** Reel-to-reel tape image (poster-05) with slow reel rotation + film grain

---

## Critical Files to Reuse
- `tsg-landing/components/CymaticField.tsx` — Wave animation logic → port to p5.js
- `tsg-landing/posters/generate-posters.js` — Chladni math + brand fonts → port to p5.js
- `audiobooks/lib/assembler.js` — TTS segment concat pipeline → reuse for TK Mantra & Control Tapes
- `audiobooks/docs/production-pipeline.md` — Chatterbox/Kokoro/MusicGen infrastructure reference

---

## Cost: 50 episodes for ~$5-13 total
- Sleep Aide: $0 (all FFmpeg/MusicGen)
- TK Mantra: $0-3 (Kokoro free, Chatterbox GPU optional)
- Frequency Room: $0 (all FFmpeg)
- Black Room: $0 (all FFmpeg)
- Control Tapes: $5-10 (Chatterbox GPU for multi-voice)

---

## Verification
After building Phase 1 infrastructure:
1. Run `generate-binaural.sh 200 6 60 /tmp/test-binaural.wav` — confirm stereo WAV with audible 6Hz beat
2. Run `musicgen-ambient-batch.py --prompt "dark ambient" --clips 4 --output /tmp/test-ambient.wav` — confirm concat works
3. Run `render-visuals.js --mode cymatic --duration 10 --output /tmp/test-frames/` — confirm PNG frame output
4. Run `assemble-video.sh` on test assets — confirm playable MP4
5. Produce Black Room Session 01 end-to-end as proof of pipeline
