import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';

import {
  selectTipoVehiculo,
  selectTitularCotizacion,
  selectTerceroTipoDocumento,
  selectTerceroDocumento,
  setTipoVehiculo,
  setTitularCotizacion,
  setTerceroTipoDocumento,
  setTerceroDocumento,
} from '../../../store/cotizadorStore/cotizadorSlice';

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

const OPCIONES_TITULAR = [
  {
    codigo: 'PROPIETARIO',
    nombre: 'Propietario en RUNT',
    descripcion: 'La cotización se hace a nombre del propietario registrado',
    Icono: PersonIcon,
  },
  {
    codigo: 'TERCERO',
    nombre: 'Tercero',
    descripcion: 'La cotización se hace a nombre de otra persona',
    Icono: PeopleIcon,
  },
];

const TIPOS_DOCUMENTO = [
  { codigo: 'C', nombre: 'Cédula de Ciudadanía' },
  { codigo: 'E', nombre: 'Cédula de Extranjería' },
  { codigo: 'T', nombre: 'Tarjeta de Identidad' },
  { codigo: 'P', nombre: 'Pasaporte' },
  { codigo: 'D', nombre: 'Carné / Carnet Diplomático' },
  { codigo: 'R', nombre: 'Registro Civil' },
  { codigo: 'Y', nombre: 'Permiso por Protección Temporal (PPT)' },
];

const Step3_TipoVehiculo = ({ onAutoAdvance }) => {
  const dispatch = useDispatch();
  const tipoVehiculo = useSelector(selectTipoVehiculo);
  const titularCotizacion = useSelector(selectTitularCotizacion);
  const terceroTipoDocumento = useSelector(selectTerceroTipoDocumento);
  const terceroDocumento = useSelector(selectTerceroDocumento);

  const handleSelectTipo = (codigo) => {
    dispatch(setTipoVehiculo(codigo));
    // Solo auto-avanzar si es Cero Kilómetros (no necesita preguntar titular)
    if (codigo === 'CERO_KM' && onAutoAdvance) {
      setTimeout(onAutoAdvance, 300);
    }
  };

  const handleSelectTitular = (codigo) => {
    dispatch(setTitularCotizacion(codigo));
    // Si es propietario, auto-avanzar directamente
    if (codigo === 'PROPIETARIO' && onAutoAdvance) {
      setTimeout(onAutoAdvance, 300);
    }
  };

  return (
    <Box>
      {/* Sección 1: Tipo de vehículo */}
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
                <CardActionArea onClick={() => handleSelectTipo(tipo.codigo)}>
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

      {/* Sección 2: ¿A nombre de quién? (solo vehículo usado) */}
      {tipoVehiculo === 'USADO' && (
        <>
          <Divider sx={{ my: 4 }}>
            <Chip label="Paso siguiente" size="small" />
          </Divider>

          <Typography variant="h6" gutterBottom>
            ¿A nombre de quién se cotiza?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Indica si la cotización es para el propietario registrado en RUNT o para un tercero.
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {OPCIONES_TITULAR.map((opcion) => {
              const isSelected = titularCotizacion === opcion.codigo;
              return (
                <Grid item xs={12} sm={6} md={5} key={opcion.codigo}>
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
                    <CardActionArea onClick={() => handleSelectTitular(opcion.codigo)}>
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Avatar
                          sx={{
                            bgcolor: isSelected ? 'primary.main' : 'grey.300',
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <opcion.Icono sx={{ fontSize: 36 }} />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          {opcion.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {opcion.descripcion}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Sección 3: Datos del tercero */}
          {titularCotizacion === 'TERCERO' && (
            <>
              <Divider sx={{ my: 4 }}>
                <Chip label="Datos del tercero" size="small" />
              </Divider>

              <Typography variant="h6" gutterBottom>
                Documento del tercero
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ingresa el tipo y número de documento de la persona a nombre de quien se cotiza.
              </Typography>

              <Grid container spacing={2} sx={{ maxWidth: 500 }}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de documento</InputLabel>
                    <Select
                      value={terceroTipoDocumento}
                      label="Tipo de documento"
                      onChange={(e) => dispatch(setTerceroTipoDocumento(e.target.value))}
                    >
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <MenuItem key={tipo.codigo} value={tipo.codigo}>
                          {tipo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Número de documento"
                    value={terceroDocumento}
                    onChange={(e) => dispatch(setTerceroDocumento(e.target.value))}
                    placeholder="Ej: 1234567890"
                  />
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Step3_TipoVehiculo;
