"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ParticleField from "@/components/ParticleField";
import { Suspense } from "react";

type Tab = "contact" | "submit";
type Status = "idle" | "loading" | "success" | "error";

const genres = [
  "Sci-Fi",
  "Futurism",
  "Afrofuturism",
  "Consciousness & Perception",
  "Experimental / Avant-Garde",
  "Documentary",
  "Other",
];

function ContactContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("contact");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "submit") setTab("submit");
  }, [searchParams]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/tsg/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: tab }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage(
          tab === "submit"
            ? "Your signal has been received. We review every submission and will be in touch if your work resonates with the frequency."
            : "Message received. We'll be in touch."
        );
      } else {
        const err = await res.json();
        setStatus("error");
        setMessage(err.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Try again.");
    }
  }

  if (status === "success") {
    return (
      <main className="relative min-h-screen px-6 py-24">
        <ParticleField />
        <div className="mx-auto max-w-xl text-center pt-20">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pulse/40 mb-4">
            <div className="h-2 w-2 rounded-full bg-pulse" />
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{tab === "submit" ? "Signal Received" : "Message Sent"}</h1>
          <p className="mt-5 text-sm text-bone/60 leading-relaxed max-w-md mx-auto">{message}</p>
          <a href="/tsg" className="mt-8 inline-block text-xs tracking-[0.2em] text-bone/40 hover:text-bone transition">
            RETURN HOME
          </a>
        </div>
      </main>
    );
  }

  const inputClass = "w-full rounded-lg border border-bone/15 bg-black/50 px-4 py-3 text-sm backdrop-blur-sm placeholder:text-bone/20 focus:border-signal/40 focus:outline-none";
  const labelClass = "mb-1.5 block text-[10px] tracking-[0.2em] text-bone/40";

  return (
    <main className="relative min-h-screen px-6 py-24">
      <ParticleField />
      <div className="relative mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs tracking-[0.4em] text-bone/30">THE CONTROL SERIES&trade;</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Contact</h1>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex justify-center gap-1">
          <button
            onClick={() => setTab("contact")}
            className={`px-5 py-2 text-[10px] tracking-[0.25em] font-semibold transition-all ${
              tab === "contact"
                ? "bg-bone/8 text-bone border border-bone/15"
                : "text-bone/30 border border-transparent hover:text-bone/50"
            }`}
          >
            CONTACT US
          </button>
          <button
            onClick={() => setTab("submit")}
            className={`px-5 py-2 text-[10px] tracking-[0.25em] font-semibold transition-all ${
              tab === "submit"
                ? "bg-pulse/5 text-pulse border border-pulse/20"
                : "text-bone/25 border border-transparent hover:text-pulse/40"
            }`}
          >
            FILM SUBMISSION
          </button>
        </div>

        {/* ── FILM SUBMISSION TAB: hero image + what we're looking for ── */}
        {tab === "submit" && (
          <div className="mb-8">
            {/* Prominent image */}
            <div className="relative w-full overflow-hidden rounded-lg border border-bone/6" style={{ height: "220px" }}>
              <Image
                src="/posters/cinematic-02-tk-mantra.png"
                alt="Open Signal — A Call for Films"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 672px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
                <p className="text-[9px] tracking-[0.35em] text-pulse/70 font-semibold">OPEN SIGNAL</p>
                <p className="mt-1 text-lg font-bold">A Call for Films</p>
              </div>
            </div>

            {/* What we're looking for */}
            <div className="mt-4 rounded-lg border border-bone/6 bg-black/30 p-4">
              <p className="text-[9px] tracking-[0.3em] text-bone/35 font-semibold mb-3">WHAT WE&apos;RE LOOKING FOR</p>
              <p className="text-sm text-bone/55 leading-relaxed mb-3">
                Work that exists at the intersection of cinema and consciousness.
                Stories that interrogate perception. Visions rooted in ancestry projected forward.
                No budget requirements. No festival credits needed. Just signal.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, -1).map((g) => (
                  <span key={g} className="rounded-full border border-pulse/15 bg-pulse/4 px-2.5 py-0.5 text-[9px] tracking-wider text-pulse/60">
                    {g.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Shared fields */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>YOUR NAME *</label>
              <input name="name" required className={inputClass} placeholder="Full name" />
            </div>
            <div>
              <label className={labelClass}>EMAIL *</label>
              <input name="email" type="email" required className={inputClass} placeholder="you@example.com" />
            </div>
          </div>

          {/* Contact-only fields */}
          {tab === "contact" && (
            <>
              <div>
                <label className={labelClass}>SUBJECT</label>
                <input name="subject" className={inputClass} placeholder="What is this regarding?" />
              </div>
              <div>
                <label className={labelClass}>MESSAGE *</label>
                <textarea name="message" required rows={5} className={`${inputClass} resize-none`} placeholder="Your message" />
              </div>
            </>
          )}

          {/* Film submission fields */}
          {tab === "submit" && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>FILM TITLE</label>
                  <input name="filmTitle" className={inputClass} placeholder="Title of your film" />
                </div>
                <div>
                  <label className={labelClass}>GENRE</label>
                  <select name="genre" className={`${inputClass} text-bone/70`}>
                    <option value="">Select genre</option>
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>RUNTIME</label>
                  <input name="runtime" className={inputClass} placeholder="e.g. 12 min, 90 min" />
                </div>
                <div>
                  <label className={labelClass}>SCREENER LINK</label>
                  <input name="link" type="url" className={inputClass} placeholder="Vimeo, YouTube, or Drive link" />
                </div>
              </div>

              <div>
                <label className={labelClass}>SYNOPSIS</label>
                <textarea name="synopsis" rows={3} className={`${inputClass} resize-none`} placeholder="Brief description of your film" />
              </div>

              <div>
                <label className={labelClass}>DIRECTOR STATEMENT</label>
                <textarea name="statement" rows={3} className={`${inputClass} resize-none`} placeholder="Why did you make this? What frequency were you tuned into?" />
              </div>
            </>
          )}

          {status === "error" && (
            <p className="text-xs text-hazard">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full rounded-xl py-4 text-sm font-bold tracking-wider text-black transition-all disabled:opacity-50 ${
              tab === "submit"
                ? "bg-pulse hover:shadow-[0_0_40px_rgba(0,255,179,0.3)]"
                : "bg-ember hover:shadow-[0_0_40px_rgba(255,144,46,0.3)]"
            }`}
          >
            {status === "loading"
              ? "TRANSMITTING..."
              : tab === "submit"
                ? "SUBMIT YOUR SIGNAL"
                : "SEND MESSAGE"}
          </button>

          {tab === "submit" && (
            <p className="text-center text-[10px] text-bone/25 tracking-wider">
              No entry fee. Shorts and features welcome. We review everything.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}
