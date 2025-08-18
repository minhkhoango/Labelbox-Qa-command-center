/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for your dark theme
        'dark-bg': '#111827',
        'dark-border': '#374151',
        'dark-text': '#F9FAFB',
        'dark-text-secondary': '#9CA3AF',
      },
    },
  },
  plugins: [],
}