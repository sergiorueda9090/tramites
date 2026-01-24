import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
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
        <Typography variant="body2" color="text.secondary">
          © {currentYear} Movilidad2A. Todos los derechos reservados.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link
            href="#"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            Términos
          </Link>
          <Link
            href="#"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            Privacidad
          </Link>
          <Link
            href="#"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            Soporte
          </Link>
          <Typography variant="body2" color="text.secondary">
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
