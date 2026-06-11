"use client";
import ScrollReveal from "./ScrollReveal";
import CadenceSelector from "./CadenceSelector";
import { useSignup } from "@/lib/hooks/useSignup";

export default function SignupForm() {
  const { email, setEmail, status, message, submit, submitCadence } = useSignup("main-signup");

  return (
    <section id="join" className="relative px-6 py-24">
      {/* Glow backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-ember/5 blur-[100px]" />

      <div className="relative mx-auto max-w-xl text-center">
        <ScrollReveal>
          <h2 className="text-4xl font-bold uppercase md:text-5xl">Join the List</h2>
          <p className="mt-3 text-bone/60">
            Get updates on sessions, tools, and community access.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          {(status === "cadence-select" || status === "cadence-loading" || status === "done") ? (
            <div className="mt-8">
              <CadenceSelector onSelect={submitCadence} loading={status === "cadence-loading"} />
            </div>
          ) : (
            <form className="mt-8 space-y-3" onSubmit={submit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "loading"}
                className="w-full rounded-xl border border-bone/15 bg-black/50 px-5 py-4 text-center text-sm backdrop-blur-sm placeholder:text-bone/30 focus:border-signal/40 focus:outline-none focus:shadow-[0_0_20px_rgba(255,194,96,0.1)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-ember py-4 text-sm font-bold tracking-wider text-black transition-all hover:shadow-[0_0_40px_rgba(255,144,46,0.4)] disabled:opacity-50"
              >
                {status === "loading" ? "TRANSMITTING..." : "REQUEST ACCESS"}
              </button>
              {status === "error" && (
                <p className="text-xs text-hazard">{message}</p>
              )}
            </form>
          )}
          <p className="mt-4 text-[10px] text-bone/30 tracking-wider">
            ◌ Small group. Limited sessions. No spam. Unsubscribe anytime.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
