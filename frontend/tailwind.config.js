/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        primary: { DEFAULT: '#1a3a5c', light: '#2563a8', pale: '#e8f0fb' },
        accent: { DEFAULT: '#e85d26', light: '#fff0e8' },
      }
    },
  },
  plugins: [],
}
