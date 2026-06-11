"use client";
import ScrollReveal from "./ScrollReveal";

export default function DailyJoke() {
  return (
    <section className="py-16 bg-signal/5 border-y border-signal/10">
      <div className="container-wide">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <span className="tag tag-signal mb-6 inline-block">
              // break room &mdash; joke of the day
            </span>
            <blockquote className="font-heading text-2xl md:text-4xl font-bold text-raw leading-tight mb-6">
              &ldquo;Recruiter: We&apos;re looking for a junior developer with
              10 years of experience in a framework that&apos;s been out for 3
              years.&rdquo;
            </blockquote>
            <p className="text-mono text-signal text-sm">
              &mdash; Dex, The Break Room
            </p>
            <p className="text-chrome/40 text-xs mt-4 font-mono">
              New joke every day at 8am. Subscribe for the full set.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
