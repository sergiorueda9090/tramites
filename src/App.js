import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import AppBackdrop from './components/AppBackdrop';
import { createAppTheme } from './theme/theme';
import { selectThemeMode, selectCustomColors, selectSnackbar, hideSnackbar } from './store/uiStore/uiStore';

function App() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const customColors = useSelector(selectCustomColors);
  const snackbar = useSelector(selectSnackbar);

  const theme = useMemo(() => createAppTheme(themeMode, customColors), [themeMode, customColors]);

  const handleCloseSnackbar = () => {
    dispatch(hideSnackbar());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary fullPage>
        <AppRouter />

        {/* Global Backdrop */}
        <AppBackdrop />

        {/* Global Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
