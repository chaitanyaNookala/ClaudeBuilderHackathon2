/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        accent: {
          standard: '#f5c842',
          disability: '#5be3b0',
          firstgen: '#f07048',
        }
      }
    },
  },
  plugins: [],
};
