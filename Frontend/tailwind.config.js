/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#F0F4FF',
        muted: 'rgba(255, 255, 255, 0.5)',
        hairline: 'rgba(255, 255, 255, 0.12)',
        parchment: '#05070F',
        glow: {
          cyan: '#00F0FF',
          violet: '#9B5CFF',
          white: '#E8EEFF',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 1.8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.15), inset 0 0 5px rgba(0, 240, 255, 0.05)' },
          '100%': { boxShadow: '0 0 25px rgba(155, 92, 255, 0.35), inset 0 0 12px rgba(155, 92, 255, 0.15)' }
        }
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
