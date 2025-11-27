/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        raven: {
          50: '#f7f8fb',
          100: '#e3e6f2',
          200: '#c2c8de',
          300: '#9aa5c7',
          400: '#6c7aa9',
          500: '#4b578b',
          600: '#394271',
          700: '#2f365c',
          800: '#232942',
          900: '#1a1f31',
        },
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        shake: 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both',
      },
    },
  },
  plugins: [],
};
