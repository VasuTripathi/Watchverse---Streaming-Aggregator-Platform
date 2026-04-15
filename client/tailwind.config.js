/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'electric-crimson': '#E50914',
        'deep-charcoal': '#0f0f0f',
        'obsidian': '#1a1a1a',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'loading': 'loading 1.5s infinite',
        'stagger': 'stagger 0.5s ease-out',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}