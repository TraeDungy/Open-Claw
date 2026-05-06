export default function Footer() {
  return (
    <footer className="border-t border-bone/10 px-6 py-16">
      <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-signal/30">
              <div className="h-2 w-2 rounded-full bg-signal" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">TELEKINESIS</p>
              <p className="text-[9px] tracking-[0.2em] text-ember">SUPPORT GROUP</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] tracking-[0.15em] text-bone/30">THE CONTROL SERIES&trade;</p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-bone/40">QUICK LINKS</p>
          <ul className="mt-3 space-y-2 text-sm text-bone/50">
            <li><a href="#" className="transition hover:text-bone">Home</a></li>
            <li><a href="#sessions" className="transition hover:text-bone">Sessions</a></li>
            <li><a href="/tool" className="transition hover:text-bone">Signal Tool</a></li>
            <li><a href="#field-guide" className="transition hover:text-bone">Field Guide</a></li>
          </ul>
        </div>

        {/* Follow */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-bone/40">FOLLOW</p>
          <ul className="mt-3 space-y-2 text-sm text-bone/50">
            <li><a href="#" className="transition hover:text-bone">Instagram</a></li>
            <li><a href="#" className="transition hover:text-bone">YouTube</a></li>
            <li><a href="#" className="transition hover:text-bone">X (Twitter)</a></li>
          </ul>
        </div>

        {/* Closing quote */}
        <div className="flex items-end">
          <p className="text-sm font-bold leading-snug text-bone/40">
            REALITY IS MORE RESPONSIVE THAN MOST PEOPLE REALIZE.
            <br />
            <span className="text-bone/60">YOU JUST HAVE TO LEARN HOW TO ASK.</span>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl flex flex-wrap items-center justify-between gap-4 border-t border-bone/5 pt-6 text-[10px] text-bone/20">
        <p>&copy; 2026 Telekinesis Support Group. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-bone/40">Privacy</a>
          <a href="#" className="hover:text-bone/40">Terms</a>
        </div>
      </div>
    </footer>
  );
}
