//
// FILE: tailwind.config.ts
// CLASSIFICATION: TOP SECRET // OGM-V2 // UI DECONSTRUCTION
// PURPOSE: Translates the reverse-engineered style guide into a functional theme.
//
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      // Decision: Using CSS variables for colors makes theming trivial.
      // This is a direct implementation of your style guide analysis.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Custom additions from your report:
        'lb-primary-blue': 'hsl(var(--lb-primary-blue))',
        'lb-bg-primary': 'hsl(var(--lb-bg-primary))',
        'lb-bg-secondary': 'hsl(var(--lb-bg-secondary))',
        'lb-border-default': 'hsl(var(--lb-border-default))',
        'lb-text-primary': 'hsl(var(--lb-text-primary))',
        'lb-text-secondary': 'hsl(var(--lb-text-secondary))',
        'lb-text-tertiary': 'hsl(var(--lb-text-tertiary))',
        'lb-accent-green': 'hsl(var(--lb-accent-green))',
        'lb-accent-red': 'hsl(var(--lb-accent-red))',
        'lb-accent-orange': 'hsl(var(--lb-accent-orange))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;