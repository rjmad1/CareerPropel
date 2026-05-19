import { createTheme, alpha } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1E40AF',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F97316',
      light: '#FED7AA',
      dark: '#EA580C',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06B6D4',
      light: '#67E8F9',
      dark: '#0891B2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontSize: '0.75rem', color: '#6B7280' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0px 1px 2px rgba(0,0,0,0.05)',
    '0px 1px 3px rgba(0,0,0,0.1)',
    '0px 2px 6px rgba(0,0,0,0.08)',
    '0px 4px 12px rgba(0,0,0,0.08)',
    '0px 6px 16px rgba(0,0,0,0.1)',
    '0px 8px 24px rgba(0,0,0,0.1)',
    '0px 10px 28px rgba(0,0,0,0.12)',
    '0px 12px 32px rgba(0,0,0,0.12)',
    '0px 14px 36px rgba(0,0,0,0.12)',
    '0px 16px 40px rgba(0,0,0,0.14)',
    '0px 18px 44px rgba(0,0,0,0.14)',
    '0px 20px 48px rgba(0,0,0,0.14)',
    '0px 22px 52px rgba(0,0,0,0.14)',
    '0px 24px 56px rgba(0,0,0,0.14)',
    '0px 26px 60px rgba(0,0,0,0.14)',
    '0px 28px 64px rgba(0,0,0,0.16)',
    '0px 30px 68px rgba(0,0,0,0.16)',
    '0px 32px 72px rgba(0,0,0,0.16)',
    '0px 34px 76px rgba(0,0,0,0.16)',
    '0px 36px 80px rgba(0,0,0,0.16)',
    '0px 38px 84px rgba(0,0,0,0.16)',
    '0px 40px 88px rgba(0,0,0,0.16)',
    '0px 42px 92px rgba(0,0,0,0.16)',
    '0px 44px 96px rgba(0,0,0,0.18)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        sizeMedium: { padding: '8px 20px' },
        sizeSmall: { padding: '5px 14px', fontSize: '0.8125rem' },
      },
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        outlined: { borderRadius: 8 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 600, fontSize: '1.125rem' } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 44,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#F9FAFB',
            color: '#374151',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#F3F4F6' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha('#2563EB', 0.12),
            '&:hover': { backgroundColor: alpha('#2563EB', 0.18) },
          },
        },
      },
    },
  },
})

export default theme
