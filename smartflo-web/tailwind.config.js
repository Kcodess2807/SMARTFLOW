/** @type {import('tailwindcss').Config} */

// SmartFlow — "Transit Blueprint" design tokens.
// A light, editorial engineering-paper system: warm paper, ink, one confident
// "go" accent, with amber + stop-red reserved for secondary / emergency states.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces (warm paper stack)
        paper: "#F4F1EA", // page background
        surface: "#FBFAF5", // raised cards / panels
        sunken: "#ECE8DD", // recessed wells, table zebra
        // Ink / text
        ink: "#14171A", // primary text, headlines
        graphite: "#5A6066", // secondary text, captions
        muted: "#8A8F98", // tertiary / micro-labels
        rule: "#D8D2C4", // hairline rules, borders, blueprint ticks
        // Signal accents (used functionally, never as gradient decoration)
        go: {
          DEFAULT: "#157F5B", // primary accent = the RL agent / "go"
          deep: "#0F5F44",
          tint: "#E4EFE9",
        },
        amber: {
          DEFAULT: "#E08A00", // secondary accent / caution
          tint: "#F8ECD6",
        },
        stop: {
          DEFAULT: "#C2453C", // reserved strictly for emergency / stop
          tint: "#F5E0DD",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Public Sans"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        // Editorial type scale (1.25 major-third-ish, tuned)
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.14em" }],
        "display-sm": ["2.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["3.75rem", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        "display-lg": ["5.5rem", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
      },
      maxWidth: {
        prose: "68ch",
        page: "1240px",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "5px",
      },
      boxShadow: {
        figure: "0 1px 0 0 #D8D2C4, 0 18px 40px -28px rgba(20,23,26,0.28)",
        lift: "0 24px 50px -32px rgba(20,23,26,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        dash: {
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};
