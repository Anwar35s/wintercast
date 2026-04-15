/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        amber: { DEFAULT: "#f0a500", light: "#ffbe3d" },
        bg: { DEFAULT: "#080b0f", 2: "#0d1117", 3: "#111820" },
      },
      fontFamily: {
        mono: ["Space Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
}
