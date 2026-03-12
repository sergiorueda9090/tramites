import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  TextField,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';
import SpeedIcon from '@mui/icons-material/Speed';
import PinIcon from '@mui/icons-material/Pin';
import BadgeIcon from '@mui/icons-material/Badge';
import CommuteIcon from '@mui/icons-material/Commute';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScaleIcon from '@mui/icons-material/Scale';

import {
  selectPlaca,
  selectNumLicencia,
  selectVin,
  selectClase,
  selectTipoServicio,
  selectMarca,
  selectModelo,
  selectCilindraje,
  selectPesoBruto,
  selectColor,
  selectLinea,
  selectTipoCarroceria,
  selectTipoCombustible,
  selectNumMotor,
  selectNumChasis,
  selectEstadoAutomotor,
  selectClasificacion,
  selectOrganismoTransito,
  selectNumeroEjes,
  selectPasajerosSentados,
  selectCapacidadCarga,
  selectPuertas,
  selectGravamenes,
  selectPrendas,
  selectRepotenciado,
  selectDiasMatriculado,
  selectFechaRegistro,
} from '../../../store/apisExternasStore/apisExternasRuntStore';

const ReadOnlyField = ({ label, value, icon, endText }) => (
  <TextField
    fullWidth
    label={label}
    value={value || '-'}
    InputProps={{
      readOnly: true,
      startAdornment: icon ? (
        <InputAdornment position="start">{icon}</InputAdornment>
      ) : undefined,
      endAdornment: endText ? (
        <InputAdornment position="end">{endText}</InputAdornment>
      ) : undefined,
    }}
    variant="outlined"
  />
);

const formatFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-CO', { dateStyle: 'medium' });
};

const Step5_DatosVehiculo = () => {
  const placa = useSelector(selectPlaca);
  const numLicencia = useSelector(selectNumLicencia);
  const vin = useSelector(selectVin);
  const clase = useSelector(selectClase);
  const tipoServicio = useSelector(selectTipoServicio);
  const marca = useSelector(selectMarca);
  const modelo = useSelector(selectModelo);
  const cilindraje = useSelector(selectCilindraje);
  const pesoBruto = useSelector(selectPesoBruto);
  const color = useSelector(selectColor);
  const linea = useSelector(selectLinea);
  const tipoCarroceria = useSelector(selectTipoCarroceria);
  const tipoCombustible = useSelector(selectTipoCombustible);
  const numMotor = useSelector(selectNumMotor);
  const numChasis = useSelector(selectNumChasis);
  const estadoAutomotor = useSelector(selectEstadoAutomotor);
  const clasificacion = useSelector(selectClasificacion);
  const organismoTransito = useSelector(selectOrganismoTransito);
  const numeroEjes = useSelector(selectNumeroEjes);
  const pasajerosSentados = useSelector(selectPasajerosSentados);
  const capacidadCarga = useSelector(selectCapacidadCarga);
  const puertas = useSelector(selectPuertas);
  const gravamenes = useSelector(selectGravamenes);
  const prendas = useSelector(selectPrendas);
  const repotenciado = useSelector(selectRepotenciado);
  const diasMatriculado = useSelector(selectDiasMatriculado);
  const fechaRegistro = useSelector(selectFechaRegistro);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Datos del vehículo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Información del vehículo consultada en el RUNT.
        </Typography>
      </Box>

      {!placa ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No se han consultado datos del vehículo. Regresa al paso anterior para realizar la consulta.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Identificación del vehículo */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DirectionsCarIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Identificación del vehículo
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Placa" value={placa} icon={<PinIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Estado" value={estadoAutomotor} icon={<BadgeIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="No. Licencia de Tránsito" value={numLicencia} icon={<BadgeIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="VIN" value={vin} icon={<PinIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="No. Motor" value={numMotor} icon={<PinIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="No. Chasis" value={numChasis} icon={<PinIcon fontSize="small" color="action" />} />
              </Grid>
            </Grid>
          </Paper>

          {/* Clasificación */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CategoryIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Clasificación
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Clase" value={clase} icon={<CommuteIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Clasificación" value={clasificacion} icon={<CommuteIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Tipo Servicio" value={tipoServicio} icon={<CategoryIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Tipo Carrocería" value={tipoCarroceria} icon={<CategoryIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Color" value={color} icon={<CategoryIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Organismo de Tránsito" value={organismoTransito} icon={<CategoryIcon fontSize="small" color="action" />} />
              </Grid>
            </Grid>
          </Paper>

          {/* Especificaciones técnicas */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SpeedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Especificaciones técnicas
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Marca" value={marca} icon={<BrandingWatermarkIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Línea" value={linea} icon={<BrandingWatermarkIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Modelo (año)" value={modelo} icon={<CalendarMonthIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Cilindraje" value={cilindraje} icon={<SpeedIcon fontSize="small" color="action" />} endText="cc" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Combustible" value={tipoCombustible} icon={<SpeedIcon fontSize="small" color="action" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Peso Bruto" value={pesoBruto} icon={<ScaleIcon fontSize="small" color="action" />} endText="kg" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="No. Ejes" value={numeroEjes} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Puertas" value={puertas} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Pasajeros Sentados" value={pasajerosSentados} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Capacidad de Carga" value={capacidadCarga} endText="kg" />
              </Grid>
            </Grid>
          </Paper>

          {/* Información adicional */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BadgeIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Información adicional
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Fecha de Registro" value={formatFecha(fechaRegistro)} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Días Matriculado" value={diasMatriculado} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Gravámenes" value={gravamenes} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Prendas" value={prendas} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ReadOnlyField label="Repotenciado" value={repotenciado} />
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Step5_DatosVehiculo;
