import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  AlertTitle,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
  selectGrupoClaseRunt,
  selectGrupoSubcriterio,
  selectGrupoSoat,
  selectGrupoRequiereRevision,
  selectGrupoMotivo,
  setGrupoClaseRunt,
  setGrupoSubcriterio,
  setGrupoSoat,
} from '../../../store/cotizadorStore/cotizadorSlice';

// ─── Todas las clases RUNT del PDF ───

const CLASES_RUNT = [
  { codigo: 'AUTOMOVIL', nombre: 'Automóvil' },
  { codigo: 'STATION WAGON', nombre: 'Station Wagon' },
  { codigo: 'CAMIONETA', nombre: 'Camioneta' },
  { codigo: 'BUS', nombre: 'Bus' },
  { codigo: 'MICROBUS', nombre: 'Microbús' },
  { codigo: 'BUSETA', nombre: 'Buseta' },
  { codigo: 'MOTOCICLETA', nombre: 'Motocicleta' },
  { codigo: 'MOTOCARRO', nombre: 'Motocarro' },
  { codigo: 'MOTOTRICICLO', nombre: 'Mototriciclo' },
  { codigo: 'CICLOMOTOR', nombre: 'Ciclomotor' },
  { codigo: 'CUATRIMOTO', nombre: 'Cuatrimoto' },
  { codigo: 'CAMION', nombre: 'Camión' },
  { codigo: 'TRACTOCAMION', nombre: 'Tractocamión' },
  { codigo: 'VOLQUETA', nombre: 'Volqueta' },
  { codigo: 'FURGON', nombre: 'Furgón' },
  { codigo: 'CARROTANQUE', nombre: 'Carrotanque' },
  { codigo: 'REMOLQUE', nombre: 'Remolque' },
  { codigo: 'SEMIRREMOLQUE', nombre: 'Semirremolque' },
];

// ─── Árbol de decisión: qué subcriterio necesita cada clase ───

const CLASES_MOTOS = ['MOTOCICLETA', 'MOTOCARRO', 'MOTOTRICICLO', 'CICLOMOTOR', 'CUATRIMOTO'];
const CLASES_CARGA = ['CAMION', 'TRACTOCAMION', 'VOLQUETA', 'FURGON', 'CARROTANQUE', 'REMOLQUE', 'SEMIRREMOLQUE'];
const CLASES_BUS = ['BUS', 'MICROBUS', 'BUSETA'];
const CLASES_AUTO = ['AUTOMOVIL', 'STATION WAGON'];

// Tipo de subcriterio que necesita cada grupo de clases
function obtenerTipoSubcriterio(clase) {
  if (!clase) return null;
  if (CLASES_MOTOS.includes(clase)) return 'DIRECTO';   // No necesita subcriterio
  if (CLASES_CARGA.includes(clase)) return 'DIRECTO';   // No necesita subcriterio
  if (clase === 'CAMIONETA') return 'TIPO_SERVICIO';     // PARTICULAR / PUBLICO
  if (CLASES_AUTO.includes(clase)) return 'CLASIFICACION'; // PARTICULAR / PUBLICO / COLOR AMARILLO
  if (CLASES_BUS.includes(clase)) return 'TIPO_SERVICIO_BUS'; // URBANO / INTERMUNICIPAL
  return 'NO_MAPEADA';
}

// Opciones del segundo select según el tipo de subcriterio
const OPCIONES_SUBCRITERIO = {
  TIPO_SERVICIO: [
    { codigo: 'PARTICULAR', nombre: 'Particular' },
    { codigo: 'PUBLICO', nombre: 'Público' },
  ],
  CLASIFICACION: [
    { codigo: 'PARTICULAR', nombre: 'Particular' },
    { codigo: 'PUBLICO', nombre: 'Público' },
    { codigo: 'COLOR AMARILLO', nombre: 'Color Amarillo' },
  ],
  TIPO_SERVICIO_BUS: [
    { codigo: 'URBANO', nombre: 'Urbano' },
    { codigo: 'INTERMUNICIPAL', nombre: 'Intermunicipal' },
  ],
};

// Labels del segundo select
const LABEL_SUBCRITERIO = {
  TIPO_SERVICIO: 'Tipo de Servicio',
  CLASIFICACION: 'Clasificación',
  TIPO_SERVICIO_BUS: 'Tipo de Servicio',
};

// ─── Resolución del grupo según clase + subcriterio ───

function resolverGrupo(clase, subcriterio) {
  if (!clase) return null;

  // Mapeo directo
  if (CLASES_MOTOS.includes(clase)) return { grupo: 'MOTOS', requiereRevision: false };
  if (CLASES_CARGA.includes(clase)) return { grupo: 'CARGA', requiereRevision: false };

  if (!subcriterio) return null; // Aún no seleccionó subcriterio

  // Camioneta
  if (clase === 'CAMIONETA') {
    if (subcriterio === 'PARTICULAR') return { grupo: 'CAMPEROS', requiereRevision: false };
    if (subcriterio === 'PUBLICO') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
  }

  // Automóvil / Station Wagon
  if (CLASES_AUTO.includes(clase)) {
    if (subcriterio === 'PARTICULAR') return { grupo: 'FAMILIAR_5P', requiereRevision: false };
    if (subcriterio === 'PUBLICO') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
    if (subcriterio === 'COLOR AMARILLO') return { grupo: 'TAXI', requiereRevision: false };
  }

  // Bus / Microbus / Buseta
  if (CLASES_BUS.includes(clase)) {
    if (subcriterio === 'URBANO') return { grupo: 'BUS_URBANO', requiereRevision: false };
    if (subcriterio === 'INTERMUNICIPAL') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
  }

  return null;
}

// ─── Configuración visual por grupo ───

const GRUPO_CONFIG = {
  MOTOS:          { nombre: 'Motos',          color: 'warning', Icono: TwoWheelerIcon },
  CARGA:          { nombre: 'Carga',          color: 'info',    Icono: LocalShippingIcon },
  CAMPEROS:       { nombre: 'Camperos',       color: 'success', Icono: DirectionsCarIcon },
  FAMILIAR_5P:    { nombre: 'Familiar 5P',    color: 'success', Icono: DirectionsCarIcon },
  INTERMUNICIPAL: { nombre: 'Intermunicipal', color: 'primary', Icono: DirectionsBusIcon },
  TAXI:           { nombre: 'Taxi',           color: 'warning', Icono: LocalTaxiIcon },
  BUS_URBANO:     { nombre: 'Bus Urbano',     color: 'primary', Icono: DirectionsBusIcon },
};

const Step7_GrupoSoat = () => {
  const dispatch = useDispatch();

  const claseRunt = useSelector(selectGrupoClaseRunt);
  const subcriterio = useSelector(selectGrupoSubcriterio);
  const grupoSoat = useSelector(selectGrupoSoat);
  const requiereRevision = useSelector(selectGrupoRequiereRevision);
  const motivo = useSelector(selectGrupoMotivo);

  const tipoSubcriterio = obtenerTipoSubcriterio(claseRunt);
  const necesitaSubcriterio = tipoSubcriterio && tipoSubcriterio !== 'DIRECTO' && tipoSubcriterio !== 'NO_MAPEADA';

  // Resolver grupo automáticamente cuando cambian clase o subcriterio
  useEffect(() => {
    if (!claseRunt) return;

    // Clase no mapeada
    if (tipoSubcriterio === 'NO_MAPEADA') {
      dispatch(setGrupoSoat({
        grupo: null,
        requiereRevision: true,
        motivo: `Clase RUNT "${claseRunt}" no está mapeada en el sistema`,
      }));
      return;
    }

    const resultado = resolverGrupo(claseRunt, subcriterio);
    if (resultado) {
      dispatch(setGrupoSoat({ ...resultado, motivo: null }));
    } else {
      // Limpia grupo si aún no hay suficiente info
      dispatch(setGrupoSoat({ grupo: null, requiereRevision: false, motivo: null }));
    }
  }, [dispatch, claseRunt, subcriterio, tipoSubcriterio]);

  const handleClaseChange = (e) => {
    dispatch(setGrupoClaseRunt(e.target.value));
  };

  const handleSubcriterioChange = (e) => {
    dispatch(setGrupoSubcriterio(e.target.value));
  };

  const config = grupoSoat ? GRUPO_CONFIG[grupoSoat] : null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Grupo SOAT
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona la clase RUNT del vehículo para determinar el grupo tarifario del SOAT.
      </Typography>

      <Grid container spacing={3}>
        {/* ── Columna izquierda: Selects del árbol de decisión ── */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CategoryIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Clasificación del vehículo
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              {/* Select 1: Clase RUNT */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Clase RUNT</InputLabel>
                <Select
                  value={claseRunt || ''}
                  onChange={handleClaseChange}
                  label="Clase RUNT"
                >
                  {CLASES_RUNT.map((c) => (
                    <MenuItem key={c.codigo} value={c.codigo}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Select 2: Subcriterio (solo si la clase lo requiere) */}
              {necesitaSubcriterio && (
                <FormControl fullWidth>
                  <InputLabel>{LABEL_SUBCRITERIO[tipoSubcriterio]}</InputLabel>
                  <Select
                    value={subcriterio || ''}
                    onChange={handleSubcriterioChange}
                    label={LABEL_SUBCRITERIO[tipoSubcriterio]}
                  >
                    {OPCIONES_SUBCRITERIO[tipoSubcriterio].map((op) => (
                      <MenuItem key={op.codigo} value={op.codigo}>
                        {op.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Indicador de mapeo directo */}
              {claseRunt && tipoSubcriterio === 'DIRECTO' && (
                <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                  Esta clase se mapea directamente al grupo sin criterios adicionales.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Columna derecha: Resultado del grupo ── */}
        <Grid item xs={12} md={7}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderColor: requiereRevision
                ? 'warning.main'
                : grupoSoat
                  ? 'success.main'
                  : 'divider',
              borderWidth: grupoSoat || requiereRevision ? 2 : 1,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              {/* Sin selección aún */}
              {!claseRunt && (
                <>
                  <Avatar
                    sx={{ bgcolor: 'grey.300', width: 72, height: 72, mx: 'auto', mb: 2 }}
                  >
                    <CategoryIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Selecciona una clase RUNT
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    El grupo tarifario se determinará según el árbol de decisión.
                  </Typography>
                </>
              )}

              {/* Esperando subcriterio */}
              {claseRunt && necesitaSubcriterio && !subcriterio && !requiereRevision && (
                <>
                  <Avatar
                    sx={{ bgcolor: 'info.main', width: 72, height: 72, mx: 'auto', mb: 2 }}
                  >
                    <CategoryIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" color="info.main">
                    Selecciona {LABEL_SUBCRITERIO[tipoSubcriterio]?.toLowerCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    La clase <strong>{claseRunt}</strong> requiere un criterio adicional.
                  </Typography>
                </>
              )}

              {/* Revisión manual requerida */}
              {requiereRevision && (
                <>
                  <Avatar
                    sx={{ bgcolor: 'warning.main', width: 72, height: 72, mx: 'auto', mb: 2 }}
                  >
                    <WarningAmberIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="warning.main">
                    Revisión Manual Requerida
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No se pudo determinar el grupo automáticamente.
                  </Typography>
                </>
              )}

              {/* Grupo determinado */}
              {grupoSoat && !requiereRevision && (
                <>
                  <Avatar
                    sx={{
                      bgcolor: config ? `${config.color}.main` : 'grey.300',
                      width: 72,
                      height: 72,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {config ? <config.Icono sx={{ fontSize: 40 }} /> : <CategoryIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Grupo determinado"
                    color="success"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                    {config?.nombre || grupoSoat}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Código: <strong>{grupoSoat}</strong>
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerta de error controlado */}
      {requiereRevision && motivo && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>Error controlado</AlertTitle>
          {motivo}. Este vehículo requiere revisión manual para asignar el grupo tarifario correcto.
        </Alert>
      )}

      {/* Alerta de éxito */}
      {grupoSoat && !requiereRevision && (
        <Alert severity="success" sx={{ mt: 3 }}>
          La clase <strong>{claseRunt}</strong> fue clasificada en el grupo <strong>{config?.nombre || grupoSoat}</strong>.
        </Alert>
      )}
    </Box>
  );
};

export default Step7_GrupoSoat;
