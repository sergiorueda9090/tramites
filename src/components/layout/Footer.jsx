import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Link, useTheme } from '@mui/material';
import { selectLayoutStyle } from '../../store/uiStore/uiStore';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const layoutStyle = useSelector(selectLayoutStyle);

  const isColored = layoutStyle === 'colored';

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: isColored ? 'primary.main' : 'background.paper',
        color: isColored ? 'primary.contrastText' : 'text.primary',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: isColored ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
        >
          © {currentYear} Movilidad2A. Todos los derechos reservados.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link
            href="#"
            variant="body2"
            sx={{ color: isColored ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
            underline="hover"
          >
            Términos
          </Link>
          <Link
            href="#"
            variant="body2"
            sx={{ color: isColored ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
            underline="hover"
          >
            Privacidad
          </Link>
          <Link
            href="#"
            variant="body2"
            sx={{ color: isColored ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
            underline="hover"
          >
            Soporte
          </Link>
          <Typography
            variant="body2"
            sx={{ color: isColored ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
          >
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
