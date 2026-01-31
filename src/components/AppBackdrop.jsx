import React from 'react';
import { useSelector } from 'react-redux';
import { Backdrop, Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { selectGlobalLoading, selectLoadingMessage } from '../store/uiStore/uiStore';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const AppBackdrop = () => {
  const isLoading = useSelector(selectGlobalLoading);
  const message = useSelector(selectLoadingMessage);

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        flexDirection: 'column',
        gap: 3,
      }}
      open={isLoading}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          animation: `${fadeIn} 0.3s ease-out`,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'primary.main',
              borderRightColor: 'primary.light',
              animation: `${spin} 1.2s linear infinite`,
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderBottomColor: 'secondary.main',
              borderLeftColor: 'secondary.light',
              animation: `${spin} 1s linear infinite reverse`,
            }}
          />

          <Box
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${pulse} 2s ease-in-out infinite`,
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
            }}
          >
            <Typography
              variant="h6"
              color="white"
              fontWeight="bold"
              sx={{ letterSpacing: -0.5 }}
            >
              M2A
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: 'white',
              mb: 0.5,
            }}
          >
            {message || 'Procesando...'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Por favor espere un momento
          </Typography>
        </Box>

        <Box
          sx={{
            width: 200,
            height: 4,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: '40%',
              height: '100%',
              bgcolor: 'primary.main',
              borderRadius: 2,
              animation: 'loading 1.5s ease-in-out infinite',
              '@keyframes loading': {
                '0%': {
                  transform: 'translateX(-100%)',
                },
                '50%': {
                  transform: 'translateX(250%)',
                },
                '100%': {
                  transform: 'translateX(-100%)',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Backdrop>
  );
};

export default AppBackdrop;
