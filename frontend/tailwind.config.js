/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          // Slate / steel blue-grey (#9cadc0)
          plum: '#9cadc0',
          'plum-light': '#b5c4d4',
          'plum-dark': '#788a9e',
          // Soft ice blue (#c0d4ed)
          teal: '#c0d4ed',
          'teal-light': '#dce8f7',
          'teal-dark': '#a4bedb',
          pink: '#c0d4ed',
          cream: '#f0f5fc',
          // Crisp soft light backgrounds
          mint: '#f5f9fd',
          'mint-soft': '#f0f5fc',
          sand: '#cbd8e6',
          'sand-light': '#e7f0fa',
          'sand-dark': '#a8b9cc',
          // Deep slate navy text / ink (#1c2b39)
          charcoal: '#1c2b39',
          'charcoal-light': '#334454',
          // Dark mode surfaces (deep navy-slate)
          'charcoal-card': '#18222e',
          'charcoal-bg': '#0f1720',
        },
        ios: {
          bg: '#000000',
          card: '#1c1c1e',
          button: '#2c2c2e',
          active: '#3a3a3c',
          green: '#30d158',
          red: '#ff453a',
        },
      },
    },
  },
  plugins: [],
};
