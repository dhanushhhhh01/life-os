/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0a0f",
          50: "#0f0f18",
          100: "#141420",
          200: "#1a1a2e",
          300: "#22223a",
        },
        accent: {
          DEFAULT: "#7c5bf5",
          light: "#a78bfa",
          dark: "#5b3cc4",
          glow: "rgba(124, 91, 245, 0.15)",
        },
        mood: {
          terrible: "#ef4444",
          bad: "#f97316",
          low: "#eab308",
          okay: "#a3e635",
          good: "#22c55e",
          great: "#06b6d4",
          amazing: "#8b5cf6",
          peak: "#ec4899",
        },
        energy: {
          low: "#f87171",
          medium: "#fbbf24",
          high: "#34d399",
        },
        glass: "rgba(255, 255, 255, 0.03)",
        "glass-border": "rgba(255, 255, 255, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 91, 245, 0.15)",
        "glow-sm": "0 0 20px rgba(124, 91, 245, 0.1)",
        card: "0 4px 30px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-ring": "glowRing 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowRing: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 91, 245, 0.3), inset 0 0 20px rgba(124, 91, 245, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 91, 245, 0.5), inset 0 0 40px rgba(124, 91, 245, 0.2)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
