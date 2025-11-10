import { createTheme } from '@mui/material/styles';

// Colores Material Design 3
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Modo Claro
          primary: {
            main: '#6750A4',
            light: '#EADDFF',
            dark: '#21005D',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#625B71',
            light: '#E8DEF8',
            dark: '#1D192B',
            contrastText: '#FFFFFF',
          },
          error: {
            main: '#BA1A1A',
            light: '#FFDAD6',
            dark: '#410002',
          },
          warning: {
            main: '#F59E0B',
            light: '#FEF3C7',
            dark: '#92400E',
          },
          success: {
            main: '#10B981',
            light: '#D1FAE5',
            dark: '#065F46',
          },
          background: {
            default: '#FEF7FF',
            paper: '#FFFBFE',
          },
          text: {
            primary: '#1C1B1F',
            secondary: '#49454F',
          },
        }
      : {
          // Modo Oscuro
          primary: {
            main: '#D0BCFF',
            light: '#EADDFF',
            dark: '#4F378B',
            contrastText: '#371E73',
          },
          secondary: {
            main: '#CCC2DC',
            light: '#E8DEF8',
            dark: '#4A4458',
            contrastText: '#332D41',
          },
          error: {
            main: '#FFB4AB',
            light: '#FFDAD6',
            dark: '#93000A',
          },
          warning: {
            main: '#FCD34D',
            light: '#FEF3C7',
            dark: '#78350F',
          },
          success: {
            main: '#6EE7B7',
            light: '#D1FAE5',
            dark: '#047857',
          },
          background: {
            default: '#1C1B1F',
            paper: '#2B2930',
          },
          text: {
            primary: '#E6E1E5',
            secondary: '#CAC4D0',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0px 1px 3px rgba(0, 0, 0, 0.12)' 
            : '0px 1px 3px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export const createCustomTheme = (mode) => createTheme(getDesignTokens(mode));