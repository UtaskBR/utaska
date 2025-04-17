module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
      './src/app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          // Definindo as cores principais do UTASK (azul claro e branco)
          'utask-blue': {
            light: '#7FB3FA',
            DEFAULT: '#4A90E2',
            dark: '#2171D6',
          },
          'utask-gray': {
            light: '#F5F7FA',
            DEFAULT: '#E4E7EB',
            dark: '#9AA5B1',
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
        boxShadow: {
          'card': '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          'button': '0 2px 4px rgba(74, 144, 226, 0.3)',
        },
      },
    },
    plugins: [],
  }