import React from 'react';
import { Card, CardActionArea, CardContent, Avatar, Typography, Box } from '@mui/material';

const TipoTramiteCard = ({ codigo, nombre, descripcion, Icono, seleccionado, onClick }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        border: seleccionado ? 2 : 1,
        borderColor: seleccionado ? 'primary.main' : 'divider',
        bgcolor: seleccionado ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
          <Avatar
            sx={{
              bgcolor: seleccionado ? 'primary.main' : 'grey.300',
              width: 48,
              height: 48,
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <Icono />
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {descripcion}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default TipoTramiteCard;
