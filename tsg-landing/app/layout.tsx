import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telekinesis Support Group — The Control Series™",
  description: "You don't have to believe anything. Experiment. Observe. Discover.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="fixed top-0 z-50 w-full border-b border-bone/10 bg-transparent backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-signal/40">
                <div className="h-2 w-2 rounded-full bg-signal animate-glow-breathe" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-wide">TELEKINESIS</p>
                <p className="text-[10px] tracking-[0.2em] text-ember">SUPPORT GROUP</p>
              </div>
            </div>
            <div className="hidden items-center gap-8 text-xs tracking-[0.15em] text-bone/70 md:flex">
              <a href="/" className="transition hover:text-bone">HOME</a>
              <a href="/#sessions" className="transition hover:text-bone">SESSIONS</a>
              <a href="/#tool" className="transition hover:text-bone">TOOL</a>
              <a href="/files" className="transition hover:text-bone text-signal">FILES</a>
              <a href="/#field-guide" className="transition hover:text-bone">FIELD GUIDE</a>
              <a href="/#about" className="transition hover:text-bone">ABOUT</a>
            </div>
            <a href="#join" className="rounded-full border border-ember bg-ember/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-ember transition hover:bg-ember hover:text-black">
              JOIN THE LIST
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
