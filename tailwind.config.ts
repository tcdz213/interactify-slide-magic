import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-display)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-code)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        /** Phase B — design-system type scale */
        'ds-xs': ['var(--text-xs)', { lineHeight: '1.4' }],
        'ds-sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'ds-base': ['var(--text-base)', { lineHeight: '1.6' }],
        'ds-lg': ['var(--text-lg)', { lineHeight: '1.5' }],
        'ds-xl': ['var(--text-xl)', { lineHeight: '1.3' }],
        'ds-2xl': ['var(--text-2xl)', { lineHeight: '1.25' }],
        'ds-3xl': ['var(--text-3xl)', { lineHeight: '1.2' }],
      },
      spacing: {
        /** Phase C — 4px-base spacing tokens */
        'ds-1': 'var(--space-1)',
        'ds-2': 'var(--space-2)',
        'ds-3': 'var(--space-3)',
        'ds-4': 'var(--space-4)',
        'ds-5': 'var(--space-5)',
        'ds-6': 'var(--space-6)',
        'ds-8': 'var(--space-8)',
        'ds-10': 'var(--space-10)',
        'ds-12': 'var(--space-12)',
        'ds-16': 'var(--space-16)',
      },
      maxWidth: {
        'page': 'var(--page-max-width)',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Semantic status colors */
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        /* Subtle status variants (bg, fg, border) */
        "success-subtle": {
          DEFAULT: "hsl(var(--success-subtle-bg))",
          foreground: "hsl(var(--success-subtle-fg))",
          border: "hsl(var(--success-subtle-border))",
        },
        "warning-subtle": {
          DEFAULT: "hsl(var(--warning-subtle-bg))",
          foreground: "hsl(var(--warning-subtle-fg))",
          border: "hsl(var(--warning-subtle-border))",
        },
        "info-subtle": {
          DEFAULT: "hsl(var(--info-subtle-bg))",
          foreground: "hsl(var(--info-subtle-fg))",
          border: "hsl(var(--info-subtle-border))",
        },
        "destructive-subtle": {
          DEFAULT: "hsl(var(--destructive-subtle-bg))",
          foreground: "hsl(var(--destructive-subtle-fg))",
          border: "hsl(var(--destructive-subtle-border))",
        },
        /* Extended accent colors */
        "accent-purple": {
          DEFAULT: "hsl(var(--accent-purple))",
          subtle: "hsl(var(--accent-purple-subtle-bg))",
          "subtle-fg": "hsl(var(--accent-purple-subtle-fg))",
          "subtle-border": "hsl(var(--accent-purple-subtle-border))",
        },
        "accent-cyan": {
          DEFAULT: "hsl(var(--accent-cyan))",
          subtle: "hsl(var(--accent-cyan-subtle-bg))",
          "subtle-fg": "hsl(var(--accent-cyan-subtle-fg))",
          "subtle-border": "hsl(var(--accent-cyan-subtle-border))",
        },
        "accent-orange": {
          DEFAULT: "hsl(var(--accent-orange))",
          subtle: "hsl(var(--accent-orange-subtle-bg))",
          "subtle-fg": "hsl(var(--accent-orange-subtle-fg))",
          "subtle-border": "hsl(var(--accent-orange-subtle-border))",
        },
        "accent-indigo": {
          DEFAULT: "hsl(var(--accent-indigo))",
          subtle: "hsl(var(--accent-indigo-subtle-bg))",
          "subtle-fg": "hsl(var(--accent-indigo-subtle-fg))",
          "subtle-border": "hsl(var(--accent-indigo-subtle-border))",
        },
        /* Sidebar */
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Charts */
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        /* G5 — Shake animation for validation errors */
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "count-up": "count-up 0.5s ease-out",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
