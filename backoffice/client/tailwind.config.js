/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cezame: {
          blue: '#8FA6FF',
          darkBlue: '#607FE8',
          green: '#B4EE83',
          darkGreen: '#91C85A',
          yellow: '#FDE694',
          orange: '#FFB55F',
          purple: '#AC84FF',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#1E293B',
          muted: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
