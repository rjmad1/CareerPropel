/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors
        primary: '#2563EB',
        success: '#10B981',
        warning: '#F97316',
        error: '#EF4444',
        info: '#06B6D4',
        
        // Pipeline stage colors (14 stages)
        'stage-sourced': '#9CA3AF',
        'stage-interested': '#3B82F6',
        'stage-resume': '#A78BFA',
        'stage-applied': '#6366F1',
        'stage-recruiter': '#06B6D4',
        'stage-hiring': '#14B8A6',
        'stage-technical': '#10B981',
        'stage-system': '#059669',
        'stage-behavioral': '#84CC16',
        'stage-final': '#EAB308',
        'stage-offer': '#F97316',
        'stage-negotiation': '#EF4444',
        'stage-rejected': '#64748B',
        'stage-archived': '#A1A1A1',
      },
      spacing: {
        0: '0',
        1: '0.5rem',
        2: '1rem',
        3: '1.5rem',
        4: '2rem',
        5: '2.5rem',
        6: '3rem',
        8: '4rem',
        10: '5rem',
        12: '6rem',
        16: '8rem',
        20: '10rem',
        24: '12rem',
        32: '16rem',
      },
      fontFamily: {
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.67' }],
        sm: ['14px', { lineHeight: '1.57' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.4' }],
        xl: ['20px', { lineHeight: '1.33' }],
        '2xl': ['24px', { lineHeight: '1.25' }],
        '3xl': ['32px', { lineHeight: '1.25' }],
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        300: '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        base: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        base: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
