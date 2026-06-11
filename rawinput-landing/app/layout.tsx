import "./globals.css";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Raw Input — Unfiltered. Uncompressed. Unsupervised.",
  description:
    "The home of Black AI and tech culture. Creators, code, commentary, and community — no filter. AI news, creator spotlights, jobs, education, and deep dives from the culture.",
  keywords: [
    "Black AI creators",
    "Black tech community",
    "AI news for Black professionals",
    "Black founded AI startups",
    "AI bias",
    "HBCU tech",
    "Black engineers",
    "AI art Afrofuturism",
    "tech jobs Black community",
    "HillmanTok",
    "AI education free courses",
    "Black tech culture",
    "AI ethics",
    "facial recognition bias",
    "remote work Black professionals",
  ],
  openGraph: {
    title: "Raw Input — Black AI & Tech Culture",
    description:
      "Creators, code, commentary, and community. AI news, jobs, education, and deep dives — unfiltered.",
    type: "website",
    locale: "en_US",
    siteName: "Raw Input",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raw Input — Unfiltered. Uncompressed. Unsupervised.",
    description:
      "The home of Black AI and tech culture. No filter. No permission. Just raw input.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "citation_title": "Raw Input — Black AI & Tech Culture Platform",
    "citation_author": "Trial X Fire",
    "article:section": "Technology",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Raw Input",
  alternateName: "Raw Input — Black AI & Tech Culture",
  description:
    "The home of Black AI and tech culture. Creators, code, commentary, and community — unfiltered.",
  url: "http://5.78.227.123/rawinput/",
  publisher: {
    "@type": "Organization",
    name: "Trial X Fire",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "http://5.78.227.123/rawinput/index-page?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Raw Input Content Index",
    description: "14 content verticals covering Black AI and tech culture",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Who Trained You? — Creator Spotlights" },
      { "@type": "ListItem", position: 2, name: "BLACKBOX — Deep Investigative Journalism" },
      { "@type": "ListItem", position: 3, name: "Root Access — Tech Jobs & Opportunities" },
      { "@type": "ListItem", position: 4, name: "The Wire — AI & Tech News" },
      { "@type": "ListItem", position: 5, name: "The Bag — Making Money with AI" },
      { "@type": "ListItem", position: 6, name: "Papers — Research Breakdowns" },
      { "@type": "ListItem", position: 7, name: "Learn — Free Courses & Education" },
      { "@type": "ListItem", position: 8, name: "City Mode — Local Tech Scenes" },
      { "@type": "ListItem", position: 9, name: "The Scoreboard — Sports Tech" },
      { "@type": "ListItem", position: 10, name: "Fork It — Open Source & Free Tools" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="grid-bg">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
