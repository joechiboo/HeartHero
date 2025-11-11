/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hr-rest': '#6b7280',
        'hr-warmup': '#3b82f6',
        'hr-fatburn': '#10b981',
        'hr-cardio': '#f59e0b',
        'hr-peak': '#ef4444',
        'hr-danger': '#dc2626',
      },
      animation: {
        'heartbeat': 'heartbeat 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
