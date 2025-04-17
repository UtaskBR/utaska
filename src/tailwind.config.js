/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/app/**/*.{js,ts,jsx,tsx}',
      './src/pages/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'primary': 'var(--primary-color, #4361ee)',
          'secondary': 'var(--secondary-color, #3f37c9)',
          'accent': 'var(--accent-color, #4895ef)',
          'utask-blue': 'var(--utask-blue, #3b82f6)',
          'utask-blue-dark': 'var(--utask-blue-dark, #2563eb)',
          'utask-gray': 'var(--utask-gray, #e5e7eb)',
          'utask-gray-dark': 'var(--utask-gray-dark, #9ca3af)',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
        },
      },
    },
    plugins: [],
  }
  