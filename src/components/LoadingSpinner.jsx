import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

const LoadingSpinner = ({
  size = 40,
  message = '',
  overlay = false,
  fullScreen = false,
  color = 'primary',
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay || fullScreen) {
    return (
      <Backdrop
        open
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: fullScreen
            ? 'rgba(0, 0, 0, 0.7)'
            : 'rgba(255, 255, 255, 0.8)',
          position: fullScreen ? 'fixed' : 'absolute',
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

export default LoadingSpinner;
