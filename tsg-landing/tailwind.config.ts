import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        bone: "#F5E3B3",
        ember: "#FF8A18",
        signal: "#FFC260",
        hazard: "#FF2A1F",
        pulse: "#00FFB3"
      }
    }
  },
  plugins: []
};

export default config;
