/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: '#0a0a0c',
        panel: '#101014',
        card: '#141419',
        edge: '#232329',
        brand: {
          DEFAULT: '#8b9cff',
          dim: '#c7ceff',
        },
      },
      boxShadow: {
        lift: '0 8px 30px rgba(0,0,0,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn .35s ease both',
        'slide-up': 'slideUp .4s ease both',
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: .5 } },
      },
    },
  },
  plugins: [],
};
