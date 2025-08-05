/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'raunaimer-dark': '#1a365d',
        'raunaimer-gold': '#d69e2e',
        'raunaimer-gray': '#4a5568',
        'raunaimer-white': '#ffffff',
      },
    },
  },
  plugins: [],
} 