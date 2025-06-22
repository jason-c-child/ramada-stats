/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          namada: {
            50: '#fff7ed',
            500: '#f97316',
            600: '#ea580c',
            900: '#7c2d12',
          },
        },
        opacity: {
          '15': '0.15',
          '25': '0.25',
          '35': '0.35',
          '45': '0.45',
          '55': '0.55',
          '65': '0.65',
          '75': '0.75',
          '85': '0.85',
          '95': '0.95',
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        boxShadow: {
          'win95': 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, 1px 1px 0px #ffffff, -1px -1px 0px #808080',
          'win95-inset': 'inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff',
          'win95-button': 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080',
          'win95-button-active': 'inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff',
        },
        fontFamily: {
          'win95': ['MS Sans Serif', 'Microsoft Sans Serif', 'Arial', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  