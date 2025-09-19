/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta propuesta
        brand: { 600: '#667eea', 700: '#764ba2' }, // gradiente
        success: { 500: '#10b981', 600: '#059669' },
        info:    { 500: '#0ea5e9', 600: '#0284c7' },
        warn:    { 500: '#f59e0b', 600: '#d97706' },
        neutral: { 50:'#f8fafc', 100:'#f1f5f9', 500:'#64748b', 700:'#334155' },

        // Mantén estos si los usas en dark cards
        darkBg: '#384f7bff',
        darkCard: '#dce8ffff',
        darkBorder: '#303a4aff',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
      },
      boxShadow: {
        card: '0 8px 24px rgba(2,6,23,.08)',
      },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
};
