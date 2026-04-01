/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "var(--app-bg)",
          glass: "var(--app-glass)",
          glassHover: "var(--app-glass-hover)",
          glassBorder: "var(--app-glass-border)",
          primary: "var(--app-primary)",
          secondary: "var(--app-secondary)",
          text: "var(--app-text)",
          textMuted: "var(--app-text-muted)",
          cardBorder: "var(--app-card-border)",
        }
      }
    },
  },
  plugins: [],
}
