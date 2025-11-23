import { createTheme } from '@mui/material/styles';

// Colores Material Design 3
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
          paper: '#F3F3FA', // Ligeramente gris para diferenciar de default
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
          default: '#141218',
          paper: '#1D1B20',
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
      fontSize: '3.5rem', // MD3 Display Small
      fontWeight: 400,
      lineHeight: 1.1,
    },
    h2: {
      fontSize: '2.8rem', // MD3 Headline Large
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '2.25rem', // MD3 Headline Medium
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '2rem', // MD3 Headline Small
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.5rem', // MD3 Title Large
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1.25rem', // MD3 Title Medium
      fontWeight: 500,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem', // MD3 Body Large
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
    },
    body2: {
      fontSize: '0.875rem', // MD3 Body Medium
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.25px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
  },
  shape: {
    borderRadius: 16, // MD3 usa bordes más redondeados por defecto
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Pill shape
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none', // Evitar overlay en modo oscuro por defecto de MUI
          boxShadow: mode === 'light'
            ? '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
            : '0px 1px 3px 1px rgba(0, 0, 0, 0.3), 0px 1px 2px 0px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16, // MD3 FAB shape (Container)
          boxShadow: mode === 'light'
            ? '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)'
            : '0px 4px 8px 3px rgba(0, 0, 0, 0.3), 0px 1px 3px 0px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
            : '0px 1px 3px 1px rgba(0, 0, 0, 0.3), 0px 1px 2px 0px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28, // MD3 Dialog shape
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: mode === 'light' ? '#FEF7FF' : '#141218', // Surface color
          color: mode === 'light' ? '#1C1B1F' : '#E6E1E5', // On Surface
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4, // Text fields son un poco menos redondeados en MD3 outlined
          },
        },
      },
    },
  },
});

export const createCustomTheme = (mode) => createTheme(getDesignTokens(mode));