import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Avatar } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

import { selectTipoVehiculo, setTipoVehiculo } from '../../../store/cotizadorStore/cotizadorSlice';

const TIPOS_VEHICULO = [
  {
    codigo: 'USADO',
    nombre: 'Vehículo Usado',
    descripcion: 'Vehículo con placa y registro previo',
    Icono: DirectionsCarIcon,
  },
  {
    codigo: 'CERO_KM',
    nombre: 'Cero Kilómetros',
    descripcion: 'Vehículo nuevo sin placa asignada',
    Icono: NewReleasesIcon,
  },
];

const Step3_TipoVehiculo = () => {
  const dispatch = useDispatch();
  const tipoVehiculo = useSelector(selectTipoVehiculo);

  const handleSelect = (codigo) => {
    dispatch(setTipoVehiculo(codigo));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tipo de vehículo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona si el vehículo es usado o cero kilómetros.
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {TIPOS_VEHICULO.map((tipo) => {
          const isSelected = tipoVehiculo === tipo.codigo;
          return (
            <Grid item xs={12} sm={6} md={5} key={tipo.codigo}>
              <Card
                variant="outlined"
                sx={{
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.50' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: 2 },
                }}
              >
                <CardActionArea onClick={() => handleSelect(tipo.codigo)}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: isSelected ? 'primary.main' : 'grey.300',
                        width: 72,
                        height: 72,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <tipo.Icono sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {tipo.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {tipo.descripcion}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Step3_TipoVehiculo;
