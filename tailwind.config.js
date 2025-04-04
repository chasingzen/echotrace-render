module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        pulseGlow: "pulse 3s ease-in-out infinite"
      }
    },
  },
  plugins: [],
}