/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0F1F46', // Sidebar navy
          900: '#172554', // Primary navy
          800: '#1E3A8A',
          700: '#1D4ED8',
        },
        brand: {
          blue: '#2563EB',    // Royal blue
          light: '#EFF6FF',   // Light blue
          bg: '#F1F5F9',      // Main background
          card: '#FFFFFF',    // Card background
          text: '#0F172A',    // Primary text
          muted: '#64748B',   // Secondary text
          border: '#E2E8F0',  // Border
          success: '#16A34A', // Success
          warning: '#F59E0B', // Warning
          danger: '#DC2626',  // Error
          purple: '#7C3AED',  // Purple accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'dropdown': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
