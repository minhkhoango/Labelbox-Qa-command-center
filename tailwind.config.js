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
        // Labelbox Design System Colors
        'lb': {
          'primary-blue': 'var(--lb-primary-blue)',
          'primary-blue-hover': 'var(--lb-primary-blue-hover)',
          'primary-blue-light': 'var(--lb-primary-blue-light)',
          
          'bg-primary': 'var(--lb-bg-primary)',
          'bg-secondary': 'var(--lb-bg-secondary)',
          'bg-tertiary': 'var(--lb-bg-tertiary)',
          
          'border-default': 'var(--lb-border-default)',
          'border-light': 'var(--lb-border-light)',
          'border-focus': 'var(--lb-border-focus)',
          
          'text-primary': 'var(--lb-text-primary)',
          'text-secondary': 'var(--lb-text-secondary)',
          'text-tertiary': 'var(--lb-text-tertiary)',
          'text-white': 'var(--lb-text-white)',
          
          'accent-green': 'var(--lb-accent-green)',
          'accent-red': 'var(--lb-accent-red)',
          'accent-orange': 'var(--lb-accent-orange)',
          'accent-purple': 'var(--lb-accent-purple)',
        }
      },
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--lb-text-xs)',
        'sm': 'var(--lb-text-sm)',
        'base': 'var(--lb-text-base)',
        'lg': 'var(--lb-text-lg)',
        'xl': 'var(--lb-text-xl)',
        '2xl': 'var(--lb-text-2xl)',
        '3xl': 'var(--lb-text-3xl)',
      },
      spacing: {
        'xs': 'var(--lb-spacing-xs)',
        'sm': 'var(--lb-spacing-sm)',
        'md': 'var(--lb-spacing-md)',
        'lg': 'var(--lb-spacing-lg)',
        'xl': 'var(--lb-spacing-xl)',
      },
      borderRadius: {
        'sm': 'var(--lb-radius-sm)',
        'md': 'var(--lb-radius-md)',
        'lg': 'var(--lb-radius-lg)',
      },
      boxShadow: {
        'lb-sm': 'var(--lb-shadow-sm)',
        'lb-md': 'var(--lb-shadow-md)',
      }
    },
  },
  plugins: [],
}