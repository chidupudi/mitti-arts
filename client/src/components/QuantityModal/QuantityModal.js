// theme/terracottaTheme.js
import { createTheme } from '@mui/material/styles';

export const terracottaTheme = createTheme({
  palette: {
    primary: {
      main: '#D2691E',
      light: '#E8A857',
      dark: '#A0522D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#CD853F',
      light: '#DDB778',
      dark: '#8B5A2B',
    },
    accent: {
      main: '#F4A460',
      light: '#F7C794',
      dark: '#C8834D',
    },
    background: {
      default: '#FDFCFA',
      paper: '#FFFFFF',
      light: '#FFEEE6',
    },
    text: {
      primary: '#2C1810',
      secondary: '#6B4423',
    },
    divider: '#E8D5C4',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(210, 105, 30, 0.08)',
    '0px 4px 8px rgba(210, 105, 30, 0.12)',
    '0px 8px 16px rgba(210, 105, 30, 0.16)',
    '0px 12px 24px rgba(210, 105, 30, 0.20)',
    // ... rest of shadows
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(210, 105, 30, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D2691E',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D2691E',
            },
          },
        },
      },
    },
  },
});