export default function FieldGuideCard() {
  return (
    <div className="rounded-xl border border-bone/15 bg-black/40 p-5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-lg border border-signal/20 bg-void p-3">
          <div className="h-12 w-10 rounded border border-signal/30 bg-gradient-to-b from-signal/5 to-transparent flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-signal animate-glow-breathe" />
          </div>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.25em] text-bone/50 uppercase">Get the Field Guide</p>
          <p className="mt-1 font-semibold">Signal Detection Vol. 1</p>
          <p className="mt-1 text-xs text-bone/50">Start your training.</p>
        </div>
      </div>
      <button className="mt-4 w-full rounded-full border border-signal/40 px-4 py-2.5 text-xs font-semibold tracking-wider transition hover:bg-signal/10">
        DOWNLOAD FREE
      </button>
    </div>
  );
}
