"use client";
import { useEffect, useRef } from "react";

// ── Cymatic Frequency Field ──
// Expanding wave rings radiate from the 3rd eye like sound frequencies on a plate.
// Micro dots ride along wave crests / nodal lines.
// Mouse disrupts the frequency field — bends and distorts the wave pattern.

export default function CymaticField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Origin = 3rd eye position
    let ox = 0, oy = 0, w = 0, h = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
      ox = w * 0.5;
      oy = h * 0.30;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse + touch handlers — canvas is pointer-events:none so we listen on parent
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onTouchEnd = () => { mouseRef.current.active = false; };

    parent.addEventListener("mousemove", onMouseMove);
    parent.addEventListener("mouseleave", onMouseLeave);
    parent.addEventListener("touchmove", onTouchMove, { passive: true });
    parent.addEventListener("touchend", onTouchEnd);

    // ── Wave parameters ──
    const WAVE_COUNT = 12;           // number of expanding wave rings
    const WAVE_SPEED = 0.6;         // expansion speed
    const MAX_RADIUS = 500;         // max ring radius before reset
    const FREQ_MODES = [3, 5, 6, 8]; // cymatic frequency modes (nodal symmetry)

    // Each wave ring
    interface Wave {
      radius: number;
      birth: number;
      freq: number;   // number of nodes around the circumference
      phase: number;
    }

    const waves: Wave[] = [];
    for (let i = 0; i < WAVE_COUNT; i++) {
      waves.push({
        radius: (i / WAVE_COUNT) * MAX_RADIUS,
        birth: -i * 0.4,
        freq: FREQ_MODES[i % FREQ_MODES.length],
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ── Particle dots that ride on wave crests ──
    interface Particle {
      waveIdx: number;
      angle: number;
      size: number;
      brightness: number;
    }

    const particles: Particle[] = [];
    const isMobile = w < 768;
    const PARTICLES_PER_WAVE = isMobile ? 40 : 80;
    for (let wi = 0; wi < WAVE_COUNT; wi++) {
      for (let p = 0; p < PARTICLES_PER_WAVE; p++) {
        particles.push({
          waveIdx: wi,
          angle: (p / PARTICLES_PER_WAVE) * Math.PI * 2 + Math.random() * 0.1,
          size: 0.3 + Math.random() * 1.0,
          brightness: 0.3 + Math.random() * 0.7,
        });
      }
    }

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      ctx.clearRect(0, 0, w, h);

      // ── Update & draw each wave ring ──
      for (let wi = 0; wi < waves.length; wi++) {
        const wave = waves[wi];

        // Expand outward
        wave.radius += WAVE_SPEED;
        if (wave.radius > MAX_RADIUS) {
          wave.radius = 0;
          wave.freq = FREQ_MODES[Math.floor(Math.random() * FREQ_MODES.length)];
          wave.phase = Math.random() * Math.PI * 2;
        }

        const r = wave.radius;
        if (r < 2) continue;

        // Fade: appear near origin, fade at edge
        const life = r / MAX_RADIUS;
        const alpha = life < 0.05 ? life * 20 : life > 0.7 ? (1 - life) * 3.3 : 1;
        const ringAlpha = alpha * 0.12;

        // ── Draw the wave ring as a cymatic shape ──
        // The ring isn't a circle — it's modulated by the frequency mode
        // creating the characteristic cymatic standing wave pattern
        const segments = 360;
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const a = (s / segments) * Math.PI * 2;

          // Cymatic modulation: standing wave creates nodes & antinodes
          const cymatic = Math.sin(a * wave.freq + wave.phase + t * 0.8) * (r * 0.08);
          // Secondary harmonic for complexity
          const harmonic = Math.sin(a * wave.freq * 2 + wave.phase * 1.5 - t * 1.2) * (r * 0.03);
          // Breathing pulse
          const breathe = Math.sin(t * 1.5 + wi * 0.5) * (r * 0.015);

          let modR = r + cymatic + harmonic + breathe;

          // Mouse disruption: bend the wave near cursor
          if (mouseActive) {
            const px = ox + Math.cos(a) * modR;
            const py = oy + Math.sin(a) * modR;
            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = 150;
            if (dist < influence) {
              const warp = (1 - dist / influence) * 40;
              modR += warp;
            }
          }

          const px = ox + Math.cos(a) * modR;
          const py = oy + Math.sin(a) * modR;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 194, 96, ${ringAlpha})`;
        ctx.lineWidth = 0.8 + alpha * 0.5;
        ctx.stroke();

        // Inner glow line
        if (alpha > 0.3) {
          ctx.strokeStyle = `rgba(255, 170, 70, ${ringAlpha * 0.4})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      // ── Draw particles riding on wave crests ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const wave = waves[p.waveIdx];
        const r = wave.radius;
        if (r < 2) continue;

        const life = r / MAX_RADIUS;
        const fadeAlpha = life < 0.05 ? life * 20 : life > 0.7 ? (1 - life) * 3.3 : 1;
        if (fadeAlpha < 0.01) continue;

        // Slowly rotate the particle angle
        p.angle += 0.001;
        const a = p.angle;

        // Same cymatic modulation as the ring — particle sits ON the wave crest
        const cymatic = Math.sin(a * wave.freq + wave.phase + timeRef.current * 0.8) * (r * 0.08);
        const harmonic = Math.sin(a * wave.freq * 2 + wave.phase * 1.5 - timeRef.current * 1.2) * (r * 0.03);
        const breathe = Math.sin(timeRef.current * 1.5 + p.waveIdx * 0.5) * (r * 0.015);
        let modR = r + cymatic + harmonic + breathe;

        // Only draw particles near the wave crests (antinodes)
        const crestStrength = Math.abs(Math.sin(a * wave.freq + wave.phase + timeRef.current * 0.8));
        if (crestStrength < 0.4) continue; // skip particles at nodal points

        // Mouse disruption
        let px = ox + Math.cos(a) * modR;
        let py = oy + Math.sin(a) * modR;

        if (mouseRef.current.active) {
          const dx = px - mouseRef.current.x;
          const dy = py - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = 150;
          if (dist < influence) {
            const warp = (1 - dist / influence) * 40;
            modR += warp;
            px = ox + Math.cos(a) * modR;
            py = oy + Math.sin(a) * modR;
          }
        }

        const dotAlpha = fadeAlpha * p.brightness * crestStrength * 0.6;

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 194, 96, ${dotAlpha * 0.2})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 210, 130, ${dotAlpha})`;
        ctx.fill();
      }

      // ── Radial nodal lines — the "spokes" of the cymatic pattern ──
      const activeFreq = FREQ_MODES[Math.floor(timeRef.current * 0.15) % FREQ_MODES.length];
      for (let n = 0; n < activeFreq; n++) {
        const a = (n / activeFreq) * Math.PI * 2 + timeRef.current * 0.05;
        const lineAlpha = 0.03 + Math.sin(timeRef.current * 2 + n) * 0.015;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(a) * MAX_RADIUS, oy + Math.sin(a) * MAX_RADIUS);
        ctx.strokeStyle = `rgba(255, 194, 96, ${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── Central pulse at 3rd eye ──
      const pulseSize = 8 + Math.sin(timeRef.current * 3) * 4;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, pulseSize * 4);
      const pAlpha = 0.15 + Math.sin(timeRef.current * 2) * 0.08;
      grad.addColorStop(0, `rgba(255, 210, 130, ${pAlpha})`);
      grad.addColorStop(0.3, `rgba(255, 170, 70, ${pAlpha * 0.5})`);
      grad.addColorStop(1, "rgba(255, 144, 46, 0)");
      ctx.beginPath();
      ctx.arc(ox, oy, pulseSize * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(ox, oy, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 180, ${0.5 + Math.sin(timeRef.current * 3) * 0.3})`;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMouseMove);
      parent.removeEventListener("mouseleave", onMouseLeave);
      parent.removeEventListener("touchmove", onTouchMove);
      parent.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
}
