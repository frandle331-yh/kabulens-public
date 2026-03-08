/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kabulens: {
          bg: '#0f172a',
          card: '#1e293b',
          accent: '#38bdf8',
          green: '#4ade80',
          red: '#f87171',
          yellow: '#fbbf24',
          purple: '#a78bfa',
        }
      }
    },
  },
  plugins: [],
}
