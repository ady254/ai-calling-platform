/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        secondary: '#ec4899',
        accent: '#8b5cf6',
        background: '#0f172a',
        surface: '#1e293b',
        'surface-alt': '#334155',
        text: '#f8fafc',
        'text-dim': '#94a3b8',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      borderRadius: {
        'lg': '32px',
        'md': '20px',
        'sm': '8px',
        'pill': '100px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}
