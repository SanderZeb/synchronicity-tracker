/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New clean color palette
        'primary': {
          50: '#f0f8fe',
          100: '#deeffe',
          200: '#b4e2fd',
          300: '#7bd0fc',
          400: '#3bb9f8',
          500: '#3399e6', // Main primary color HSL 210, 70%, 50%
          600: '#2b7bc7',
          700: '#2463a1',
          800: '#245384',
          900: '#24456d',
        },
        'accent': {
          50: '#f0fdfd',
          100: '#ccf7f7',
          200: '#99efef',
          300: '#5ce0e0',
          400: '#339999', // Main accent color HSL 180, 60%, 40%
          500: '#2b8080',
          600: '#266666',
          700: '#1f5252',
          800: '#1a4343',
          900: '#173838',
        },
        'background': {
          DEFAULT: '#f0f4f7', // HSL 210, 20%, 95%
          dark: '#e8ecf0',
          light: '#f8fafc'
        },
        'surface': {
          DEFAULT: '#ffffff',
          secondary: '#fafbfc',
          tertiary: '#f5f7fa'
        },
        'text': {
          primary: '#1a202c',
          secondary: '#4a5568',
          tertiary: '#718096',
          muted: '#a0aec0'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3399e6 0%, #2b7bc7 100%)',
        'gradient-accent': 'linear-gradient(135deg, #339999 0%, #2b8080 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f0f4f7 0%, #e8ecf0 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(51, 153, 230, 0.1), 0 4px 6px -2px rgba(51, 153, 230, 0.05)',
        'medium': '0 4px 25px -5px rgba(51, 153, 230, 0.15), 0 10px 10px -5px rgba(51, 153, 230, 0.04)',
        'strong': '0 10px 40px -10px rgba(51, 153, 230, 0.2), 0 20px 25px -5px rgba(51, 153, 230, 0.1)',
      }
    },
  },
  plugins: [],
  // Safelist important classes to prevent purging
  safelist: [
    // Color variations for dynamic classes
    'bg-primary-100',
    'bg-primary-200', 
    'bg-primary-500',
    'bg-primary-600',
    'bg-accent-100',
    'bg-accent-200',
    'bg-accent-400',
    'bg-accent-500',
    'bg-green-100',
    'bg-green-200',
    'bg-green-500',
    'bg-green-600',
    'bg-yellow-100',
    'bg-yellow-200',
    'bg-yellow-500',
    'bg-yellow-600',
    'bg-orange-100',
    'bg-orange-200',
    'bg-orange-500',
    'bg-orange-600',
    'bg-red-100',
    'bg-red-200',
    'bg-red-500',
    'bg-red-600',
    'bg-purple-100',
    'bg-purple-200',
    'bg-purple-500',
    'bg-purple-600',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-300',
    'bg-gray-500',
    // Text colors
    'text-primary-600',
    'text-primary-700',
    'text-accent-600',
    'text-accent-700',
    'text-green-600',
    'text-green-700',
    'text-green-800',
    'text-yellow-600',
    'text-yellow-700',
    'text-yellow-800',
    'text-orange-600',
    'text-orange-700',
    'text-orange-800',
    'text-red-600',
    'text-red-700',
    'text-red-800',
    'text-purple-600',
    'text-purple-700',
    'text-purple-800',
    // Border colors
    'border-primary-200',
    'border-primary-300',
    'border-accent-200',
    'border-accent-300',
    'border-green-200',
    'border-green-300',
    'border-yellow-200',
    'border-yellow-300',
    'border-orange-200',
    'border-orange-300',
    'border-red-200',
    'border-red-300',
    'border-purple-200',
    'border-purple-300',
    // Hover states
    'hover:bg-primary-100',
    'hover:bg-primary-200',
    'hover:bg-accent-100',
    'hover:bg-accent-200',
    'hover:bg-green-100',
    'hover:bg-green-200',
    'hover:border-primary-200',
    'hover:border-primary-300',
    'hover:border-accent-200',
    'hover:border-accent-300',
    // Status colors
    'status-active',
    'status-inactive',
    'status-warning',
    'status-error',
  ]
}