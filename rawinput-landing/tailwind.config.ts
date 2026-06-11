import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Raw Input palette — bold, high contrast, unapologetic
        void: "#0A0A0A",        // near-black background
        raw: "#FFFFFF",         // pure white — text, impact, contrast
        input: "#FF3D00",       // deep orange-red — the brand color. Raw. Hot. Urgent
        chrome: "#B0B0B0",      // neutral chrome — secondary text, borders
        terminal: "#00FF88",    // terminal green — active states, success, code
        signal: "#FFD600",      // bright yellow — warnings, highlights, attention
        static: "#1A1A1A",      // slightly lighter than void — cards, surfaces
        noise: "#2A2A2A",       // border color, dividers
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
