import { createTheme } from '@mui/material/styles';

const defaultColors = {
  light: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#00897b', light: '#4db6ac', dark: '#00695c' },
    success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
    warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
    error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
    info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
  },
  dark: {
    primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
    secondary: { main: '#80cbc4', light: '#b2dfdb', dark: '#4db6ac' },
    success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
    warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
    error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
    info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
  },
};

const getDesignTokens = (mode, customColors = null) => {
  const colors = customColors?.[mode] || defaultColors[mode];

  return {
    palette: {
      mode,
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: mode === 'light' ? '#ffffff' : '#000000',
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
        contrastText: mode === 'light' ? '#ffffff' : '#000000',
      },
      background: mode === 'light'
        ? { default: '#f5f5f5', paper: '#ffffff' }
        : { default: '#121212', paper: '#1e1e1e' },
      text: mode === 'light'
        ? { primary: '#212121', secondary: '#757575' }
        : { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
      success: {
        main: colors.success.main,
        light: colors.success.light,
        dark: colors.success.dark,
      },
      warning: {
        main: colors.warning.main,
        light: colors.warning.light,
        dark: colors.warning.dark,
      },
      error: {
        main: colors.error.main,
        light: colors.error.light,
        dark: colors.error.dark,
      },
      info: {
        main: colors.info.main,
        light: colors.info.light,
        dark: colors.info.dark,
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.2 },
      h2: { fontSize: '2rem', fontWeight: 500, lineHeight: 1.3 },
      h3: { fontSize: '1.75rem', fontWeight: 500, lineHeight: 1.4 },
      h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 },
      h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
      subtitle1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.75 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
      body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 8 },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
      '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
      '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
      '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
      '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
      '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
      '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
      '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
      '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
      '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
      '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
      '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 0,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: colors.primary.main,
              },
            },
            '&::-webkit-scrollbar-corner': {
              backgroundColor: 'transparent',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: `${
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)'
            } ${
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)'
            }`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, padding: '8px 16px' },
          contained: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 8 },
          elevation1: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
        },
      },
      MuiTableCell: {
        styleOverrides: { head: { fontWeight: 600 } },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
      MuiDrawer: {
        styleOverrides: { paper: { borderRight: 'none', borderRadius: 0 } },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 0 } },
      },
      MuiAppBar: {
        styleOverrides: { root: { boxShadow: 'none', borderRadius: 0 } },
      },
      MuiAvatar: {
        styleOverrides: { root: { borderRadius: 0 } },
      },
    },
  };
};

export const createAppTheme = (mode, customColors = null) => createTheme(getDesignTokens(mode, customColors));

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

export { defaultColors as themeDefaultColors };

export default lightTheme;
