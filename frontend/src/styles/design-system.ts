/**
 * HR of One Design System
 * 
 * A professional, trustworthy design system for HR management
 * Targets small business owners and solo HR managers
 */

export const colors = {
  // Primary - Utlyze Blue
  primary: {
    50: '#e6efff',
    100: '#b3ceff',
    200: '#80adff',
    300: '#4d8cff',
    400: '#1a6bff',
    500: '#4169E1', // Main brand color
    600: '#3458c4',
    700: '#2747a7',
    800: '#1a368a',
    900: '#0d256d',
  },
  
  // Accent - Professional Blue
  accent: {
    50: '#e6f3fc',
    100: '#b3ddf7',
    200: '#80c7f2',
    300: '#4db1ed',
    400: '#1a9be8',
    500: '#3498DB', // Accent color
    600: '#2a7fb8',
    700: '#206695',
    800: '#164d72',
    900: '#0c344f',
  },
  
  // Neutral grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Semantic colors
  success: {
    light: '#10b981',
    DEFAULT: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#f59e0b',
    DEFAULT: '#d97706',
    dark: '#b45309',
  },
  error: {
    light: '#ef4444',
    DEFAULT: '#dc2626',
    dark: '#b91c1c',
  },
  info: {
    light: '#3b82f6',
    DEFAULT: '#2563eb',
    dark: '#1d4ed8',
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  slower: '500ms ease-in-out',
};

export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
};

// Component-specific design tokens
export const components = {
  button: {
    sizes: {
      sm: {
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
        height: '32px',
      },
      md: {
        padding: `${spacing[2.5]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
        height: '40px',
      },
      lg: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.lg,
        height: '48px',
      },
    },
    variants: {
      primary: {
        background: colors.primary[500],
        color: '#ffffff',
        hover: colors.primary[600],
        active: colors.primary[700],
      },
      secondary: {
        background: colors.gray[100],
        color: colors.gray[800],
        hover: colors.gray[200],
        active: colors.gray[300],
        border: colors.gray[300],
      },
      outline: {
        background: 'transparent',
        color: colors.primary[500],
        hover: colors.primary[50],
        active: colors.primary[100],
        border: colors.primary[500],
      },
      ghost: {
        background: 'transparent',
        color: colors.gray[700],
        hover: colors.gray[100],
        active: colors.gray[200],
      },
    },
  },
  input: {
    sizes: {
      sm: {
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
        height: '32px',
      },
      md: {
        padding: `${spacing[2.5]} ${spacing[3]}`,
        fontSize: typography.fontSize.base,
        height: '40px',
      },
      lg: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.lg,
        height: '48px',
      },
    },
    states: {
      default: {
        border: colors.gray[300],
        background: '#ffffff',
      },
      focus: {
        border: colors.primary[500],
        outline: `2px solid ${colors.primary[100]}`,
      },
      error: {
        border: colors.error.DEFAULT,
        background: '#fef2f2',
      },
      disabled: {
        background: colors.gray[100],
        cursor: 'not-allowed',
      },
    },
  },
  card: {
    padding: spacing[6],
    background: '#ffffff',
    border: colors.gray[200],
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
  },
};

// HR-specific design patterns
export const hrPatterns = {
  // Status indicators for HR processes
  statusColors: {
    pending: colors.warning.DEFAULT,
    inProgress: colors.info.DEFAULT,
    completed: colors.success.DEFAULT,
    rejected: colors.error.DEFAULT,
    onHold: colors.gray[500],
  },
  
  // Employee lifecycle stages
  lifecycleColors: {
    candidate: colors.accent[300],
    onboarding: colors.accent[400],
    active: colors.success.DEFAULT,
    offboarding: colors.warning.DEFAULT,
    alumni: colors.gray[400],
  },
  
  // Department color scheme
  departmentColors: {
    engineering: '#6366f1',
    sales: '#f59e0b',
    marketing: '#ec4899',
    hr: colors.primary[500],
    finance: '#10b981',
    operations: '#8b5cf6',
  },
};

// Export Tailwind config extension
export const tailwindExtend = {
  colors: {
    primary: colors.primary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  spacing: spacing,
  borderRadius: borderRadius,
  boxShadow: shadows,
  screens: breakpoints,
}; 