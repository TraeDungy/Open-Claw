"use client";
import { useState, useRef, useCallback, useEffect } from "react";

/* ────────────────────────────────────────────────────────────
   InlineTonePlayer — minimal inline frequency player
   Sits inside expanded cards. Plays a single frequency with
   a small waveform visualizer. Click-to-play, auto-stop on
   unmount. Sleek, one-line design.
   ──────────────────────────────────────────────────────────── */
export default function InlineTonePlayer({ hz, label }: { hz: number; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const oscRRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);

  const stop = useCallback(() => {
    try {
      if (oscRef.current) { oscRef.current.stop(); oscRef.current = null; }
      if (oscRRef.current) { oscRRef.current.stop(); oscRRef.current = null; }
    } catch {}
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    stop();
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    gainRef.current = gain;

    if (hz < 20) {
      // Binaural
      const carrier = 200;
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = "sine";
      oscR.type = "sine";
      oscL.frequency.setValueAtTime(carrier - hz / 2, ctx.currentTime);
      oscR.frequency.setValueAtTime(carrier + hz / 2, ctx.currentTime);
      const panL = ctx.createStereoPanner();
      const panR = ctx.createStereoPanner();
      panL.pan.setValueAtTime(-1, ctx.currentTime);
      panR.pan.setValueAtTime(1, ctx.currentTime);
      oscL.connect(panL).connect(gain);
      oscR.connect(panR).connect(gain);
      oscL.start(); oscR.start();
      oscRef.current = oscL;
      oscRRef.current = oscR;
    } else {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
      osc.connect(gain);
      osc.start();
      oscRef.current = osc;
    }

    setPlaying(true);
  }, [hz, stop]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // don't collapse the parent card
    playing ? stop() : play();
  }, [playing, play, stop]);

  // Cleanup on unmount (card collapse)
  useEffect(() => {
    return () => {
      try {
        if (oscRef.current) { oscRef.current.stop(); oscRef.current = null; }
        if (oscRRef.current) { oscRRef.current.stop(); oscRRef.current = null; }
      } catch {}
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Mini waveform visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const bufLen = 512;
    const data = new Float32Array(bufLen);
    let t = 0;

    const draw = () => {
      t += 0.015;
      ctx.clearRect(0, 0, w, h);

      if (playing && analyserRef.current) {
        analyserRef.current.getFloatTimeDomainData(data);

        // Waveform
        ctx.beginPath();
        const sliceW = w / bufLen;
        for (let i = 0; i < bufLen; i++) {
          const x = i * sliceW;
          const y = h / 2 + data[i] * h * 0.8;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(255, 194, 96, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glow
        ctx.strokeStyle = "rgba(255, 194, 96, 0.15)";
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        // Idle — flat line with subtle breathe
        const breathe = Math.sin(t * 2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2 + breathe);
        ctx.lineTo(w, h / 2 + breathe);
        ctx.strokeStyle = "rgba(255, 194, 96, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  return (
    <div
      className="mt-3 flex items-center gap-3 rounded-lg bg-black/50 px-3 py-2 border border-bone/8"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Play/Stop */}
      <button
        onClick={toggle}
        className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition ${
          playing
            ? "bg-hazard/15 text-hazard hover:bg-hazard/25"
            : "bg-signal/10 text-signal hover:bg-signal/20"
        }`}
      >
        {playing ? (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
        ) : (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21" /></svg>
        )}
      </button>

      {/* Mini waveform */}
      <div className="flex-1 h-6 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Hz label */}
      <span className="flex-shrink-0 font-mono text-xs text-signal/60">
        {hz} Hz
      </span>

      {label && hz < 20 && (
        <span className="flex-shrink-0 text-[8px] text-pulse/60 tracking-wider">BINAURAL</span>
      )}
    </div>
  );
}
