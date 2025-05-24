import { createTheme } from '@mui/material/styles';

export const terracottaTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#CD5C5C', // Indian Red / Terracotta
      light: '#E07A7A',
      dark: '#B84A4A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D2691E', // Chocolate/Orange terracotta
      light: '#E08A47',
      dark: '#B8571A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FDF5F3', // Very light terracotta/cream
      paper: '#FFFFFF',
    },
    surface: {
      main: '#F5F5F5',
      light: '#FAFAFA',
      dark: '#EEEEEE',
    },
    text: {
      primary: '#2C1810', // Dark brown
      secondary: '#5D4037', // Medium brown
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#ED6C02',
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
      dark: '#01579B',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    // Custom terracotta shades
    terracotta: {
      50: '#FDF5F3',
      100: '#F8E6E0',
      200: '#F0C6B8',
      300: '#E8A690',
      400: '#E08668',
      500: '#CD5C5C', // Main terracotta
      600: '#B84A4A',
      700: '#A33838',
      800: '#8E2626',
      900: '#791414',
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#2C1810',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2C1810',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2C1810',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2C1810',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2C1810',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#2C1810',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2C1810',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#5D4037',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(205, 92, 92, 0.12), 0px 1px 2px rgba(205, 92, 92, 0.24)',
    '0px 3px 6px rgba(205, 92, 92, 0.16), 0px 3px 6px rgba(205, 92, 92, 0.23)',
    '0px 10px 20px rgba(205, 92, 92, 0.19), 0px 6px 6px rgba(205, 92, 92, 0.23)',
    '0px 14px 28px rgba(205, 92, 92, 0.25), 0px 10px 10px rgba(205, 92, 92, 0.22)',
    '0px 19px 38px rgba(205, 92, 92, 0.30), 0px 15px 12px rgba(205, 92, 92, 0.22)',
    '0px 24px 48px rgba(205, 92, 92, 0.35), 0px 19px 15px rgba(205, 92, 92, 0.22)',
    // ... continue pattern for remaining shadows
    '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',
    '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)',
    '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)',
    '0px 14px 28px rgba(0,0,0,0.25), 0px 10px 10px rgba(0,0,0,0.22)',
    '0px 19px 38px rgba(0,0,0,0.30), 0px 15px 12px rgba(0,0,0,0.22)',
    '0px 24px 48px rgba(0,0,0,0.35), 0px 19px 15px rgba(0,0,0,0.22)',
    '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',
    '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)',
    '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)',
    '0px 14px 28px rgba(0,0,0,0.25), 0px 10px 10px rgba(0,0,0,0.22)',
    '0px 19px 38px rgba(0,0,0,0.30), 0px 15px 12px rgba(0,0,0,0.22)',
    '0px 24px 48px rgba(0,0,0,0.35), 0px 19px 15px rgba(0,0,0,0.22)',
    '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',
    '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)',
    '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)',
    '0px 14px 28px rgba(0,0,0,0.25), 0px 10px 10px rgba(0,0,0,0.22)',
    '0px 19px 38px rgba(0,0,0,0.30), 0px 15px 12px rgba(0,0,0,0.22)',
    '0px 24px 48px rgba(0,0,0,0.35), 0px 19px 15px rgba(0,0,0,0.22)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(205, 92, 92, 0.25)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(205, 92, 92, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(205, 92, 92, 0.1)',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(205, 92, 92, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(205, 92, 92, 0.12), 0px 1px 2px rgba(205, 92, 92, 0.24)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#CD5C5C',
          boxShadow: '0px 2px 4px rgba(205, 92, 92, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        filled: {
          backgroundColor: '#F8E6E0',
          color: '#CD5C5C',
          '&:hover': {
            backgroundColor: '#F0C6B8',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CD5C5C',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CD5C5C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#CD5C5C',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8E6E0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8E6E0',
          color: '#2C1810',
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(205, 92, 92, 0.04)',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0px 4px 16px rgba(205, 92, 92, 0.15)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(205, 92, 92, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(205, 92, 92, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(205, 92, 92, 0.12)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default terracottaTheme;