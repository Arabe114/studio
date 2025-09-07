
import type {Config} from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      backgroundImage: {
        'glow': "radial-gradient(circle at var(--mouse-x) var(--mouse-y), hsl(var(--primary) / 0.15), transparent 20%)",
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'shake': {
            '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
            '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
            '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
            '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        'success-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'neon-pulse': {
            '0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary)/0.4), 0 0 10px hsl(var(--primary)/0.4)' },
            '50%': { boxShadow: '0 0 10px hsl(var(--primary)/0.6), 0 0 20px hsl(var(--primary)/0.6)' },
        },
        'neon-border-pulse': {
          '0%, 100%': { boxShadow: '0 0 2px hsl(var(--primary)/0.3), 0 0 5px hsl(var(--primary)/0.3), inset 0 0 5px hsl(var(--primary)/0.3)' },
          '50%': { boxShadow: '0 0 4px hsl(var(--primary)/0.5), 0 0 10px hsl(var(--primary)/0.5), inset 0 0 10px hsl(var(--primary)/0.5)' },
        },
        'shimmer': {
          'from': { 'background-position': '200% 0' },
          'to': { 'background-position': '-200% 0' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        'success-pop': 'success-pop 0.3s ease-out',
        'neon-pulse': 'neon-pulse 4s ease-in-out infinite',
        'neon-border-pulse': 'neon-border-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1s linear infinite'
      },
      boxShadow: {
        'neon-primary': '0 0 8px hsl(var(--primary) / 0.5), 0 0 12px hsl(var(--primary) / 0.5)',
        'neon-accent': '0 0 8px hsl(var(--accent) / 0.5)',
      },
      textShadow: {
        'neon-primary': '0 0 8px hsl(var(--primary) / 0.8)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function({ theme, addUtilities }) {
      const newUtilities = {
        '.text-shadow-neon-primary': {
          textShadow: theme('textShadow.neon-primary'),
        },
      }
      addUtilities(newUtilities)
    })
  ],
} satisfies Config;
