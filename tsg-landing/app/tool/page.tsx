"use client";
import { useMemo, useState } from "react";

const shapes = [
  { id: "circle", label: "Circle", symbol: "○" },
  { id: "star", label: "Star", symbol: "☆" },
  { id: "waves", label: "Waves", symbol: "≋" },
  { id: "square", label: "Square", symbol: "□" },
  { id: "cross", label: "Cross", symbol: "+" }
];

export default function ToolPage() {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState<string | null>(null);
  const target = useMemo(() => shapes[Math.floor(Math.random() * shapes.length)], [round]);

  const pick = (id: string) => {
    setReveal(target.id);
    if (id === target.id) setScore((s) => s + 1);
    setTimeout(() => {
      setRound((r) => r + 1);
      setReveal(null);
    }, 800);
  };

  if (round > 20) {
    const accuracy = Math.round((score / 20) * 100);
    return <main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="text-4xl font-bold">Pattern recorded</h1><p className="mt-4">Final accuracy: {accuracy}%</p><a href="/tool" className="mt-6 inline-block rounded-full bg-ember px-6 py-3 text-black">Continue training</a></main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="tracking-[0.3em] text-bone/70">ROUND {round}/20</p>
      <h1 className="mt-3 text-4xl font-bold">Select the signal shape</h1>
      {reveal && <p className="mt-3 text-signal">The signal was {shapes.find((shape) => shape.id === reveal)?.label}</p>}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">{shapes.map((shape) => <button key={shape.id} onClick={() => pick(shape.id)} className="rounded-xl border border-signal/40 bg-black p-6 text-3xl">{shape.symbol}</button>)}</div>
      <p className="mt-6 text-bone/80">Correct: {score} · Missed: {round - 1 - score}</p>
    </main>
  );
}
