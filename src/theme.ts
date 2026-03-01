import { createTheme } from '@mui/material/styles';

// Idea Weaver — sleek & sharp: crisp radii, tight shadows, clear hierarchy
const LIGHT = {
  bg: '#f6f5f3',
  paper: '#ffffff',
  text: '#18181b',
  textSecondary: '#52525b',
  accent: '#27272a',
  accentHover: '#3f3f46',
  warm: '#b45309',
  border: '#e4e4e7',
  success: '#15803d',
  error: '#b91c1c',
};

const DARK = {
  bg: '#09090b',
  paper: '#18181b',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  accent: '#fafafa',
  accentHover: '#d4d4d8',
  warm: '#fbbf24',
  border: '#27272a',
  success: '#22c55e',
  error: '#ef4444',
};

const RADIUS = { sm: 4, md: 6, lg: 8 };
const SHADOW = {
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  md: '0 2px 8px rgba(0,0,0,0.06)',
  lg: '0 4px 16px rgba(0,0,0,0.08)',
};

export function createAppTheme(isDark: boolean) {
  const c = isDark ? DARK : LIGHT;
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: c.accent,
        light: isDark ? '#d4d4d8' : '#3f3f46',
        dark: isDark ? '#fafafa' : '#09090b',
      },
      secondary: {
        main: c.warm,
        light: isDark ? '#fde68a' : '#f59e0b',
        dark: isDark ? '#d97706' : '#b45309',
      },
      background: {
        default: c.bg,
        paper: c.paper,
      },
      text: {
        primary: c.text,
        secondary: c.textSecondary,
      },
      success: { main: c.success },
      error: { main: c.error },
    },
    typography: {
      fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
      h1: {
        fontFamily: '"Instrument Serif", "DM Sans", Georgia, serif',
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '-0.03em',
        lineHeight: 1.15,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.02em',
      },
      h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.125rem', fontWeight: 600 },
      h5: { fontSize: '1rem', fontWeight: 600 },
      h6: { fontSize: '0.9375rem', fontWeight: 600 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      button: { fontWeight: 500, textTransform: 'none', letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: RADIUS.md,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            padding: '8px 16px',
            fontWeight: 500,
            boxShadow: 'none',
          },
          contained: {
            '&:hover': {
              boxShadow: isDark ? SHADOW.md : SHADOW.sm,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: RADIUS.lg,
            border: `1px solid ${c.border}`,
            boxShadow: SHADOW.sm,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${c.border}`,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: RADIUS.sm,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: c.textSecondary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: c.accent,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.md,
            boxShadow: SHADOW.md,
            '&:hover': {
              boxShadow: SHADOW.lg,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.lg,
            border: `1px solid ${c.border}`,
            boxShadow: SHADOW.sm,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: RADIUS.lg,
            boxShadow: SHADOW.lg,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: RADIUS.md,
            boxShadow: SHADOW.lg,
            border: `1px solid ${c.border}`,
          },
        },
      },
    },
  });
}
