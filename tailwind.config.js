/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#27AE60',
        darkBg: '#0b1220',
        darkCard: '#192746ff',
        darkBorder: '#1f2937',
      },
    },
  },
  plugins: [],
};