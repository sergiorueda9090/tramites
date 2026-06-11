import React from 'react';
import { Card, CardActionArea, CardContent, Avatar, Typography } from '@mui/material';

const MetodoConsultaCard = ({ codigo, nombre, descripcion, Icono, seleccionado, onClick }) => {
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
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Avatar
            sx={{
              bgcolor: seleccionado ? 'primary.main' : 'grey.300',
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
            }}
          >
            <Icono />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descripcion}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MetodoConsultaCard;
