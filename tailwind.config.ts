import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        primary: token("primary"),
        "primary-ink": token("primary-ink"),
        accent: token("accent"),
        success: token("success"),
        danger: token("danger"),
      },
      fontFamily: {
        display: ['"Bodoni Moda"', "Georgia", "serif"],
        ui: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
      },
      fontSize: {
        display: [
          "clamp(2.75rem, 9vw, 5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.02em" },
        ],
      },
      borderRadius: {
        card: "1.25rem",
        board: "2rem",
      },
      boxShadow: {
        lift: "0 24px 48px -24px rgb(0 0 0 / 0.65)",
        glow: "0 0 0 1px rgb(var(--c-primary) / 0.55), 0 0 30px -4px rgb(var(--c-primary) / 0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 7s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
