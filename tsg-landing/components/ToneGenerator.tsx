"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const PRESETS = [
  { hz: 7.83, label: "Schumann Resonance", note: "Earth", method: "binaural" },
  { hz: 40, label: "Gamma — MIT Alzheimer's Protocol", note: "Gamma", method: "binaural" },
  { hz: 111, label: "Temple Resonance — Hal Saflieni", note: "A2", method: "direct" },
  { hz: 128, label: "Otto Tuning Fork — C3", note: "C3", method: "direct" },
  { hz: 136.1, label: "Om — Sacred Chant Frequency", note: "C#3", method: "direct" },
  { hz: 174, label: "Solfeggio — Pain Relief", note: "—", method: "direct" },
  { hz: 285, label: "Solfeggio — Tissue Repair", note: "—", method: "direct" },
  { hz: 396, label: "Solfeggio — Liberation (Root)", note: "G4", method: "direct" },
  { hz: 417, label: "Solfeggio — Change (Sacral)", note: "G#4", method: "direct" },
  { hz: 432, label: "Pythagorean A — Natural Tuning", note: "A4", method: "direct" },
  { hz: 528, label: "Solfeggio — Love / Miracle Tone", note: "C5", method: "direct" },
  { hz: 639, label: "Solfeggio — Connection (Heart)", note: "D#5", method: "direct" },
  { hz: 741, label: "Solfeggio — Awakening (Throat)", note: "F#5", method: "direct" },
  { hz: 852, label: "Solfeggio — Intuition (Third Eye)", note: "G#5", method: "direct" },
  { hz: 963, label: "Solfeggio — Divine (Crown)", note: "B5", method: "direct" },
];

const WAVEFORMS: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];

/* ────────────────────────────────────────────────────────────
   VISUALIZER — Real-time waveform + cymatic ring
   Draws from AnalyserNode time-domain data (actual audio).
   Top: oscilloscope waveform. Center: cymatic ring that morphs
   with the frequency — higher = more nodes, more complexity.
   ──────────────────────────────────────────────────────────── */
function Visualizer({ analyser, frequency, playing }: {
  analyser: AnalyserNode | null;
  frequency: number;
  playing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const bufferLength = analyser ? analyser.fftSize : 2048;
    const dataArray = new Float32Array(bufferLength);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      timeRef.current += 0.008;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      if (!playing) {
        // Idle state — subtle breathing ring
        const idleR = Math.min(w, h) * 0.25;
        const breathe = 1 + Math.sin(t * 1.5) * 0.03;
        ctx.beginPath();
        ctx.arc(cx, cy, idleR * breathe, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 194, 96, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 194, 96, 0.15)";
        ctx.fill();

        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Get real audio data
      if (analyser) {
        analyser.getFloatTimeDomainData(dataArray);
      }

      // ── 1. OSCILLOSCOPE WAVEFORM (top third) ──
      const waveH = h * 0.22;
      const waveY = h * 0.12;
      const sliceW = w / bufferLength;

      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const v = analyser ? dataArray[i] : Math.sin((i / bufferLength) * Math.PI * 2 * 4 + t * 10);
        const x = i * sliceW;
        const y = waveY + (v * waveH);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255, 194, 96, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glow line
      ctx.strokeStyle = "rgba(255, 194, 96, 0.15)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // ── 2. CYMATIC RING (center) ──
      // Nodes increase with frequency — like a real Chladni plate
      const baseR = Math.min(w, h) * 0.28;
      const nodes = Math.max(3, Math.min(24, Math.round(frequency / 40)));
      const rings = 3;

      for (let r = 0; r < rings; r++) {
        const ringR = baseR * (0.5 + r * 0.25);
        const ringAlpha = 0.3 - r * 0.08;
        const segments = 360;

        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const a = (s / segments) * Math.PI * 2;

          // Sample audio amplitude at this angle for modulation
          const sampleIdx = Math.floor((s / segments) * bufferLength);
          const audioMod = analyser ? Math.abs(dataArray[sampleIdx]) * 30 : Math.abs(Math.sin(a * nodes + t * 3)) * 8;

          // Standing wave pattern — cymatic nodes
          const cymatic = Math.sin(a * nodes + t * 0.6 + r * 0.5) * (ringR * 0.06);
          const harmonic = Math.sin(a * nodes * 2 - t * 1.1 + r) * (ringR * 0.02);
          const breathe = Math.sin(t * 1.2 + r * 0.8) * (ringR * 0.01);

          const modR = ringR + cymatic + harmonic + breathe + audioMod * (0.5 + r * 0.3);

          const px = cx + Math.cos(a) * modR;
          const py = cy + Math.sin(a) * modR;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 194, 96, ${ringAlpha})`;
        ctx.lineWidth = 1.2 - r * 0.2;
        ctx.stroke();
      }

      // ── 3. NODAL DOTS — particles at wave antinodes ──
      const dotCount = nodes * 2;
      for (let d = 0; d < dotCount; d++) {
        const a = (d / dotCount) * Math.PI * 2 + t * 0.02;
        const crestStrength = Math.abs(Math.sin(a * nodes + t * 0.6));
        if (crestStrength < 0.5) continue;

        for (let r = 0; r < rings; r++) {
          const ringR = baseR * (0.5 + r * 0.25);
          const cymatic = Math.sin(a * nodes + t * 0.6 + r * 0.5) * (ringR * 0.06);
          const sampleIdx = Math.floor((d / dotCount) * bufferLength);
          const audioMod = analyser ? Math.abs(dataArray[sampleIdx]) * 30 : 0;
          const modR = ringR + cymatic + audioMod * (0.5 + r * 0.3);

          const px = cx + Math.cos(a) * modR;
          const py = cy + Math.sin(a) * modR;
          const dotAlpha = crestStrength * (0.5 - r * 0.12);
          const dotSize = 1 + crestStrength * 1.5;

          // Glow
          ctx.beginPath();
          ctx.arc(px, py, dotSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 194, 96, ${dotAlpha * 0.15})`;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 210, 130, ${dotAlpha})`;
          ctx.fill();
        }
      }

      // ── 4. RADIAL NODAL LINES ──
      for (let n = 0; n < nodes; n++) {
        const a = (n / nodes) * Math.PI * 2 + t * 0.015;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * baseR * 1.1, cy + Math.sin(a) * baseR * 1.1);
        ctx.strokeStyle = `rgba(255, 194, 96, ${0.04 + Math.sin(t * 2 + n) * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── 5. CENTER PULSE ──
      const rms = analyser ? Math.sqrt(dataArray.reduce((sum, v) => sum + v * v, 0) / bufferLength) : 0.3;
      const pulseSize = 4 + rms * 40 + Math.sin(t * 3) * 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize * 3);
      grad.addColorStop(0, `rgba(255, 210, 130, ${0.2 + rms * 0.4})`);
      grad.addColorStop(0.4, `rgba(255, 170, 70, ${0.1 + rms * 0.2})`);
      grad.addColorStop(1, "rgba(255, 144, 46, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 2 + rms * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 180, ${0.6 + rms * 0.4})`;
      ctx.fill();

      // ── 6. FREQUENCY LABEL (bottom) ──
      ctx.font = "11px monospace";
      ctx.fillStyle = "rgba(255, 194, 96, 0.25)";
      ctx.textAlign = "center";
      ctx.fillText(`${frequency.toFixed(1)} Hz · ${nodes} nodes`, cx, h - 12);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [analyser, frequency, playing]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function ToneGenerator() {
  const [playing, setPlaying] = useState(false);
  const [frequency, setFrequency] = useState(528);
  const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState(0.3);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscRRef = useRef<OscillatorNode | null>(null);

  const stop = useCallback(() => {
    try {
      if (oscRef.current) { oscRef.current.stop(); oscRef.current = null; }
      if (oscRRef.current) { oscRRef.current.stop(); oscRRef.current = null; }
    } catch {}
    setPlaying(false);
  }, []);

  const play = useCallback((hz: number, wave: OscillatorType, vol: number) => {
    stop();

    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    // Analyser for visualizer
    if (!analyserRef.current) {
      const a = ctx.createAnalyser();
      a.fftSize = 2048;
      a.smoothingTimeConstant = 0.85;
      analyserRef.current = a;
      setAnalyserNode(a);
    }
    const analyser = analyserRef.current;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    gainRef.current = gain;

    if (hz < 20) {
      const carrier = 200;
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = wave;
      oscR.type = wave;
      oscL.frequency.setValueAtTime(carrier - hz / 2, ctx.currentTime);
      oscR.frequency.setValueAtTime(carrier + hz / 2, ctx.currentTime);

      const panL = ctx.createStereoPanner();
      const panR = ctx.createStereoPanner();
      panL.pan.setValueAtTime(-1, ctx.currentTime);
      panR.pan.setValueAtTime(1, ctx.currentTime);

      oscL.connect(panL).connect(gain);
      oscR.connect(panR).connect(gain);

      oscL.start();
      oscR.start();
      oscRef.current = oscL;
      oscRRef.current = oscR;
    } else {
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
      osc.connect(gain);
      osc.start();
      oscRef.current = osc;
    }

    setPlaying(true);
  }, [stop]);

  useEffect(() => {
    if (!playing) return;
    if (oscRef.current) {
      oscRef.current.type = waveform;
      if (frequency >= 20) {
        oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current?.currentTime || 0);
      }
    }
    if (gainRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(volume, (audioCtxRef.current?.currentTime || 0) + 0.05);
    }
  }, [frequency, waveform, volume, playing]);

  const selectPreset = (idx: number) => {
    const p = PRESETS[idx];
    setFrequency(p.hz);
    setActivePreset(idx);
    if (playing) play(p.hz, waveform, volume);
  };

  return (
    <div className="rounded-2xl border border-bone/10 bg-black/40 overflow-hidden">

      {/* ── VISUALIZER ── */}
      <div className="relative w-full" style={{ height: "320px" }}>
        <Visualizer analyser={analyserNode} frequency={frequency} playing={playing} />

        {/* Play/Stop overlay button — centered */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <button
            onClick={() => playing ? stop() : play(frequency, waveform, volume)}
            className={`pointer-events-auto flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold tracking-wider transition backdrop-blur-sm ${
              playing
                ? "bg-hazard/10 text-hazard border border-hazard/30 hover:bg-hazard/20"
                : "bg-signal/10 text-signal border border-signal/30 hover:bg-signal/20"
            }`}
          >
            {playing ? (
              <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>STOP</>
            ) : (
              <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>PLAY</>
            )}
          </button>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="p-6 border-t border-bone/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-ember">TONE GENERATOR</p>
            <p className="mt-0.5 text-[10px] text-bone/30">Pure waveform synthesis &middot; Web Audio API &middot; Real-time visualization</p>
          </div>
          {activePreset !== null && (
            <span className="font-mono text-sm text-signal/50">{PRESETS[activePreset].note}</span>
          )}
        </div>

        {/* Sliders + Waveform row */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Frequency */}
          <div>
            <label className="text-[10px] tracking-[0.2em] text-bone/40">FREQUENCY</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range" min={1} max={1200} step={0.1} value={frequency}
                onChange={(e) => { setFrequency(parseFloat(e.target.value)); setActivePreset(null); }}
                className="flex-1 accent-signal h-1"
              />
              <span className="w-20 text-right font-mono text-sm text-signal">{frequency.toFixed(1)} Hz</span>
            </div>
            {frequency < 20 && (
              <p className="mt-1 text-[9px] text-pulse/70">Binaural mode — use headphones</p>
            )}
          </div>

          {/* Waveform */}
          <div>
            <label className="text-[10px] tracking-[0.2em] text-bone/40">WAVEFORM</label>
            <div className="mt-1 flex gap-1">
              {WAVEFORMS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWaveform(w)}
                  className={`flex-1 rounded-lg py-2 text-[9px] font-semibold tracking-wider transition ${
                    waveform === w
                      ? "bg-signal/15 text-signal border border-signal/30"
                      : "text-bone/30 hover:text-bone/50 border border-bone/8 hover:border-bone/15"
                  }`}
                >
                  {w.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="text-[10px] tracking-[0.2em] text-bone/40">VOLUME</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-signal h-1"
              />
              <span className="w-12 text-right font-mono text-sm text-bone/40">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4">
          <label className="text-[10px] tracking-[0.2em] text-bone/40">PRESETS</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={p.hz}
                onClick={() => selectPreset(i)}
                className={`rounded-full px-3 py-1.5 font-mono text-xs tracking-wide transition ${
                  activePreset === i
                    ? "bg-signal/15 text-signal"
                    : "text-bone/40 bg-bone/5 hover:bg-bone/8 hover:text-bone/60"
                }`}
                title={p.label}
              >
                {p.hz < 100 ? p.hz : Math.round(p.hz)}
              </button>
            ))}
          </div>
        </div>

        {/* Active preset info */}
        {activePreset !== null && (
          <div className="mt-3 rounded-lg border border-signal/10 bg-signal/5 px-4 py-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-signal">{PRESETS[activePreset].label}</p>
              <p className="text-[9px] text-bone/35">
                {PRESETS[activePreset].hz} Hz &middot; {PRESETS[activePreset].note}
                {PRESETS[activePreset].method === "binaural" && " · Binaural — headphones required"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
