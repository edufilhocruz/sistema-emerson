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
        'raunaimer-gold': '#3f3f3f',
        'raunaimer-gray': '#4a5568',
        'raunaimer-white': '#ffffff',
      },
    },
  },
  plugins: [],
} 