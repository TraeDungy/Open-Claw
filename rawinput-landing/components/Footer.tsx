import Link from "next/link";

const FOOTER_LINKS = {
  Sections: [
    { label: "Who Trained You?", href: "/index-page?tab=creators" },
    { label: "The Wire", href: "/index-page?tab=news" },
    { label: "BLACKBOX", href: "/index-page?tab=deep-dives" },
    { label: "Fork It", href: "/resources" },
    { label: "Root Access", href: "/index-page?tab=jobs" },
    { label: "The Scoreboard", href: "/index-page?tab=scoreboard" },
  ],
  Community: [
    { label: "Who Cooked?", href: "/#who-cooked" },
    { label: "The Panel", href: "/#panel" },
    { label: "Who Let The Bots Out", href: "/block" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Submit Content", href: "#signup" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "mailto:signal@rawinput.io" },
    { label: "Subscribe", href: "#signup" },
    { label: "Privacy", href: "/about" },
    { label: "Terms", href: "/about" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-noise py-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-input rounded-sm flex items-center justify-center font-mono text-void text-xs font-bold">
                RI
              </div>
              <span className="font-heading text-xl font-bold text-raw">
                RAW INPUT
              </span>
            </Link>
            <p className="text-chrome text-sm leading-relaxed mb-4">
              Unfiltered. Uncompressed. Unsupervised.
            </p>
            <p className="text-mono text-chrome/40 text-xs">
              A Trial X Fire project
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-raw text-sm uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-chrome text-sm hover:text-raw transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-12 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-chrome/40 text-xs font-mono">
            &copy; {new Date().getFullYear()} Raw Input. All rights reserved.
          </p>
          <p className="text-chrome/30 text-xs font-mono">
            // built different. on purpose.
          </p>
        </div>
      </div>
    </footer>
  );
}
