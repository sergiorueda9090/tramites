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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import {
  selectGrupoClaseRunt,
  selectGrupoSubcriterio,
  selectGrupoSoat,
  selectGrupoRequiereRevision,
  selectGrupoMotivo,
  selectModuloPregunta1,
  selectModuloPregunta2,
  selectTarifaCodigo,
  setGrupoClaseRunt,
  setGrupoSubcriterio,
  setGrupoSoat,
  setModuloPregunta1,
  setModuloPregunta2,
  setTarifaCodigo,
} from '../../../store/cotizadorStore/cotizadorSlice';

// ═══════════════════════════════════════════════════════════
// PARTE 1: Árbol Clase RUNT → Grupo
// ═══════════════════════════════════════════════════════════

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

const CLASES_MOTOS = ['MOTOCICLETA', 'MOTOCARRO', 'MOTOTRICICLO', 'CICLOMOTOR', 'CUATRIMOTO'];
const CLASES_CARGA = ['CAMION', 'TRACTOCAMION', 'VOLQUETA', 'FURGON', 'CARROTANQUE', 'REMOLQUE', 'SEMIRREMOLQUE'];
const CLASES_BUS = ['BUS', 'MICROBUS', 'BUSETA'];
const CLASES_AUTO = ['AUTOMOVIL', 'STATION WAGON'];

function obtenerTipoSubcriterio(clase) {
  if (!clase) return null;
  if (CLASES_MOTOS.includes(clase)) return 'DIRECTO';
  if (CLASES_CARGA.includes(clase)) return 'DIRECTO';
  if (clase === 'CAMIONETA') return 'TIPO_SERVICIO';
  if (CLASES_AUTO.includes(clase)) return 'CLASIFICACION';
  if (CLASES_BUS.includes(clase)) return 'TIPO_SERVICIO_BUS';
  return 'NO_MAPEADA';
}

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

const LABEL_SUBCRITERIO = {
  TIPO_SERVICIO: 'Tipo de Servicio',
  CLASIFICACION: 'Clasificación',
  TIPO_SERVICIO_BUS: 'Tipo de Servicio',
};

function resolverGrupo(clase, subcriterio) {
  if (!clase) return null;
  if (CLASES_MOTOS.includes(clase)) return { grupo: 'MOTOS', requiereRevision: false };
  if (CLASES_CARGA.includes(clase)) return { grupo: 'CARGA', requiereRevision: false };
  if (!subcriterio) return null;
  if (clase === 'CAMIONETA') {
    if (subcriterio === 'PARTICULAR') return { grupo: 'CAMPEROS', requiereRevision: false };
    if (subcriterio === 'PUBLICO') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
  }
  if (CLASES_AUTO.includes(clase)) {
    if (subcriterio === 'PARTICULAR') return { grupo: 'FAMILIAR_5P', requiereRevision: false };
    if (subcriterio === 'PUBLICO') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
    if (subcriterio === 'COLOR AMARILLO') return { grupo: 'TAXI', requiereRevision: false };
  }
  if (CLASES_BUS.includes(clase)) {
    if (subcriterio === 'URBANO') return { grupo: 'BUS_URBANO', requiereRevision: false };
    if (subcriterio === 'INTERMUNICIPAL') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
// PARTE 2: Módulos → Tarifa (segundo nivel del árbol)
// ═══════════════════════════════════════════════════════════

// Configuración de cada módulo: preguntas y resolución de tarifa
const MODULOS = {
  MOTOS: {
    nombre: 'Módulo Motos',
    pregunta1: {
      label: '¿Cilindraje?',
      opciones: [
        { codigo: 'CICLOMOTOR', nombre: 'Ciclomotor' },
        { codigo: 'MENOS_100', nombre: 'Menos de 100 cc' },
        { codigo: '100_200', nombre: '100 - 200 cc' },
        { codigo: 'MAS_200', nombre: 'Más de 200 cc' },
      ],
    },
    pregunta2: null, // No tiene segunda pregunta
    resolverTarifa: (p1) => {
      const mapa = { CICLOMOTOR: 100, MENOS_100: 110, '100_200': 120, MAS_200: 130 };
      return mapa[p1] || null;
    },
  },

  CAMPEROS: {
    nombre: 'Módulo Camperos',
    pregunta1: {
      label: '¿Modelo?',
      opciones: [
        { codigo: 'HASTA_9', nombre: 'Hasta 9 años' },
        { codigo: '10_O_MAS', nombre: '10 años o más' },
      ],
    },
    pregunta2: {
      label: '¿Cilindraje?',
      opciones: [
        { codigo: 'MENOS_1500', nombre: 'Menos de 1500 cc' },
        { codigo: '1500_2500', nombre: '1500 - 2500 cc' },
        { codigo: 'MAS_2500', nombre: 'Más de 2500 cc' },
      ],
    },
    resolverTarifa: (p1, p2) => {
      const mapa = {
        'HASTA_9|MENOS_1500': 211, 'HASTA_9|1500_2500': 221, 'HASTA_9|MAS_2500': 231,
        '10_O_MAS|MENOS_1500': 212, '10_O_MAS|1500_2500': 222, '10_O_MAS|MAS_2500': 232,
      };
      return mapa[`${p1}|${p2}`] || null;
    },
  },

  FAMILIAR_5P: {
    nombre: 'Módulo Familiares 5P',
    pregunta1: {
      label: '¿Modelo?',
      opciones: [
        { codigo: 'HASTA_9', nombre: 'Hasta 9 años' },
        { codigo: '10_O_MAS', nombre: '10 años o más' },
      ],
    },
    pregunta2: {
      label: '¿Cilindraje?',
      opciones: [
        { codigo: 'MENOS_1500', nombre: 'Menos de 1500 cc' },
        { codigo: '1500_2500', nombre: '1500 - 2500 cc' },
        { codigo: 'MAS_2500', nombre: 'Más de 2500 cc' },
      ],
    },
    resolverTarifa: (p1, p2) => {
      const mapa = {
        'HASTA_9|MENOS_1500': 511, 'HASTA_9|1500_2500': 521, 'HASTA_9|MAS_2500': 531,
        '10_O_MAS|MENOS_1500': 512, '10_O_MAS|1500_2500': 522, '10_O_MAS|MAS_2500': 532,
      };
      return mapa[`${p1}|${p2}`] || null;
    },
  },

  TAXI: {
    nombre: 'Módulo Taxi',
    pregunta1: {
      label: '¿Modelo?',
      opciones: [
        { codigo: 'HASTA_9', nombre: 'Hasta 9 años' },
        { codigo: '10_O_MAS', nombre: '10 años o más' },
      ],
    },
    pregunta2: {
      label: '¿Cilindraje?',
      opciones: [
        { codigo: 'MENOS_1500', nombre: 'Menos de 1500 cc' },
        { codigo: '1500_2500', nombre: '1500 - 2500 cc' },
        { codigo: 'MAS_2500', nombre: 'Más de 2500 cc' },
      ],
    },
    resolverTarifa: (p1, p2) => {
      const mapa = {
        'HASTA_9|MENOS_1500': 711, 'HASTA_9|1500_2500': 721, 'HASTA_9|MAS_2500': 731,
        '10_O_MAS|MENOS_1500': 712, '10_O_MAS|1500_2500': 722, '10_O_MAS|MAS_2500': 732,
      };
      return mapa[`${p1}|${p2}`] || null;
    },
  },

  CARGA: {
    nombre: 'Módulo Carga',
    pregunta1: {
      label: '¿Toneladas?',
      opciones: [
        { codigo: 'MENOS_5', nombre: 'Menos de 5 Ton' },
        { codigo: '5_15', nombre: '5 - 15 Ton' },
        { codigo: 'MAS_15', nombre: 'Más de 15 Ton' },
      ],
    },
    pregunta2: null,
    resolverTarifa: (p1) => {
      const mapa = { MENOS_5: 310, '5_15': 320, MAS_15: 330 };
      return mapa[p1] || null;
    },
  },

  BUS_URBANO: {
    nombre: 'Módulo Bus Urbano',
    pregunta1: null, // Tarifa directa
    pregunta2: null,
    resolverTarifa: () => 810,
  },

  INTERMUNICIPAL: {
    nombre: 'Módulo Intermunicipal',
    pregunta1: {
      label: '¿Pasajeros?',
      opciones: [
        { codigo: 'MENOS_10', nombre: 'Menos de 10' },
        { codigo: '10_O_MAS', nombre: '10 o más' },
      ],
    },
    pregunta2: null,
    resolverTarifa: (p1) => {
      const mapa = { MENOS_10: 910, '10_O_MAS': 920 };
      return mapa[p1] || null;
    },
  },

  '6_PASAJEROS': {
    nombre: 'Módulo 6+ Pasajeros',
    pregunta1: {
      label: '¿Modelo?',
      opciones: [
        { codigo: 'HASTA_9', nombre: 'Hasta 9 años' },
        { codigo: '10_O_MAS', nombre: '10 años o más' },
      ],
    },
    pregunta2: {
      label: '¿Cilindraje?',
      opciones: [
        { codigo: 'MENOS_2500', nombre: 'Menos de 2500 cc' },
        { codigo: '2500_O_MAS', nombre: '2500 cc o más' },
      ],
    },
    resolverTarifa: (p1, p2) => {
      const mapa = {
        'HASTA_9|MENOS_2500': 611, 'HASTA_9|2500_O_MAS': 621,
        '10_O_MAS|MENOS_2500': 612, '10_O_MAS|2500_O_MAS': 622,
      };
      return mapa[`${p1}|${p2}`] || null;
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Configuración visual por grupo
// ═══════════════════════════════════════════════════════════

const GRUPO_CONFIG = {
  MOTOS:          { nombre: 'Motos',          color: 'warning', Icono: TwoWheelerIcon },
  CARGA:          { nombre: 'Carga',          color: 'info',    Icono: LocalShippingIcon },
  CAMPEROS:       { nombre: 'Camperos',       color: 'success', Icono: DirectionsCarIcon },
  FAMILIAR_5P:    { nombre: 'Familiar 5P',    color: 'success', Icono: DirectionsCarIcon },
  INTERMUNICIPAL: { nombre: 'Intermunicipal', color: 'primary', Icono: DirectionsBusIcon },
  TAXI:           { nombre: 'Taxi',           color: 'warning', Icono: LocalTaxiIcon },
  BUS_URBANO:     { nombre: 'Bus Urbano',     color: 'primary', Icono: DirectionsBusIcon },
  '6_PASAJEROS':  { nombre: '6+ Pasajeros',   color: 'secondary', Icono: DirectionsBusIcon },
};

// ═══════════════════════════════════════════════════════════
// Componente
// ═══════════════════════════════════════════════════════════

const Step7_GrupoSoat = () => {
  const dispatch = useDispatch();

  const claseRunt = useSelector(selectGrupoClaseRunt);
  const subcriterio = useSelector(selectGrupoSubcriterio);
  const grupoSoat = useSelector(selectGrupoSoat);
  const requiereRevision = useSelector(selectGrupoRequiereRevision);
  const motivo = useSelector(selectGrupoMotivo);
  const pregunta1 = useSelector(selectModuloPregunta1);
  const pregunta2 = useSelector(selectModuloPregunta2);
  const tarifaCodigo = useSelector(selectTarifaCodigo);

  const tipoSubcriterio = obtenerTipoSubcriterio(claseRunt);
  const necesitaSubcriterio = tipoSubcriterio && tipoSubcriterio !== 'DIRECTO' && tipoSubcriterio !== 'NO_MAPEADA';

  const modulo = grupoSoat ? MODULOS[grupoSoat] : null;
  const config = grupoSoat ? GRUPO_CONFIG[grupoSoat] : null;
  const necesitaPregunta1 = modulo?.pregunta1 != null;
  const necesitaPregunta2 = modulo?.pregunta2 != null;

  // Resolver grupo cuando cambian clase o subcriterio
  useEffect(() => {
    if (!claseRunt) return;
    if (tipoSubcriterio === 'NO_MAPEADA') {
      dispatch(setGrupoSoat({ grupo: null, requiereRevision: true, motivo: `Clase RUNT "${claseRunt}" no está mapeada en el sistema` }));
      return;
    }
    const resultado = resolverGrupo(claseRunt, subcriterio);
    if (resultado) {
      dispatch(setGrupoSoat({ ...resultado, motivo: null }));
    } else {
      dispatch(setGrupoSoat({ grupo: null, requiereRevision: false, motivo: null }));
    }
  }, [dispatch, claseRunt, subcriterio, tipoSubcriterio]);

  // Resolver tarifa cuando cambian grupo o preguntas del módulo
  useEffect(() => {
    if (!grupoSoat || !modulo) return;

    // Módulos con tarifa directa (sin preguntas)
    if (!necesitaPregunta1) {
      dispatch(setTarifaCodigo(modulo.resolverTarifa()));
      return;
    }

    // Solo pregunta 1
    if (!necesitaPregunta2 && pregunta1) {
      dispatch(setTarifaCodigo(modulo.resolverTarifa(pregunta1)));
      return;
    }

    // Pregunta 1 + Pregunta 2
    if (necesitaPregunta2 && pregunta1 && pregunta2) {
      dispatch(setTarifaCodigo(modulo.resolverTarifa(pregunta1, pregunta2)));
      return;
    }

    // Aún no hay suficiente info
    dispatch(setTarifaCodigo(null));
  }, [dispatch, grupoSoat, modulo, pregunta1, pregunta2, necesitaPregunta1, necesitaPregunta2]);

  const handleClaseChange = (e) => dispatch(setGrupoClaseRunt(e.target.value));
  const handleSubcriterioChange = (e) => dispatch(setGrupoSubcriterio(e.target.value));
  const handlePregunta1Change = (e) => dispatch(setModuloPregunta1(e.target.value));
  const handlePregunta2Change = (e) => dispatch(setModuloPregunta2(e.target.value));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Grupo SOAT y Tarifa
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona la clase RUNT y sigue el árbol de decisión para determinar el grupo y la tarifa.
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
                    <MenuItem key={c.codigo} value={c.codigo}>{c.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Select 2: Subcriterio (tipo servicio / clasificación) */}
              {necesitaSubcriterio && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>{LABEL_SUBCRITERIO[tipoSubcriterio]}</InputLabel>
                  <Select
                    value={subcriterio || ''}
                    onChange={handleSubcriterioChange}
                    label={LABEL_SUBCRITERIO[tipoSubcriterio]}
                  >
                    {OPCIONES_SUBCRITERIO[tipoSubcriterio].map((op) => (
                      <MenuItem key={op.codigo} value={op.codigo}>{op.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Indicador de mapeo directo de clase */}
              {claseRunt && tipoSubcriterio === 'DIRECTO' && (
                <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
                  Esta clase se mapea directamente al grupo sin criterios adicionales.
                </Alert>
              )}

              {/* ── Sección Módulo (aparece cuando el grupo está determinado) ── */}
              {grupoSoat && !requiereRevision && modulo && (
                <>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ReceiptLongIcon color="secondary" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {modulo.nombre}
                    </Typography>
                  </Box>

                  {/* Módulo sin preguntas (tarifa directa) */}
                  {!necesitaPregunta1 && (
                    <Alert severity="info" variant="outlined">
                      Este módulo asigna la tarifa directamente sin criterios adicionales.
                    </Alert>
                  )}

                  {/* Pregunta 1 del módulo */}
                  {necesitaPregunta1 && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>{modulo.pregunta1.label}</InputLabel>
                      <Select
                        value={pregunta1 || ''}
                        onChange={handlePregunta1Change}
                        label={modulo.pregunta1.label}
                      >
                        {modulo.pregunta1.opciones.map((op) => (
                          <MenuItem key={op.codigo} value={op.codigo}>{op.nombre}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Pregunta 2 del módulo (solo si pregunta 1 fue respondida) */}
                  {necesitaPregunta2 && pregunta1 && (
                    <FormControl fullWidth>
                      <InputLabel>{modulo.pregunta2.label}</InputLabel>
                      <Select
                        value={pregunta2 || ''}
                        onChange={handlePregunta2Change}
                        label={modulo.pregunta2.label}
                      >
                        {modulo.pregunta2.opciones.map((op) => (
                          <MenuItem key={op.codigo} value={op.codigo}>{op.nombre}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Columna derecha: Resultado ── */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {/* Card Grupo */}
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: requiereRevision ? 'warning.main' : grupoSoat ? 'success.main' : 'divider',
                  borderWidth: grupoSoat || requiereRevision ? 2 : 1,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  {/* Sin selección */}
                  {!claseRunt && (
                    <>
                      <Avatar sx={{ bgcolor: 'grey.300', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="subtitle1" color="text.secondary">
                        Selecciona una clase RUNT
                      </Typography>
                    </>
                  )}

                  {/* Esperando subcriterio */}
                  {claseRunt && necesitaSubcriterio && !subcriterio && !requiereRevision && (
                    <>
                      <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="subtitle1" color="info.main">
                        Selecciona {LABEL_SUBCRITERIO[tipoSubcriterio]?.toLowerCase()}
                      </Typography>
                    </>
                  )}

                  {/* Revisión manual */}
                  {requiereRevision && (
                    <>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                        <WarningAmberIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                        Revisión Manual Requerida
                      </Typography>
                    </>
                  )}

                  {/* Grupo determinado */}
                  {grupoSoat && !requiereRevision && (
                    <>
                      <Avatar
                        sx={{ bgcolor: config ? `${config.color}.main` : 'grey.300', width: 56, height: 56, mx: 'auto', mb: 1 }}
                      >
                        {config ? <config.Icono sx={{ fontSize: 32 }} /> : <CategoryIcon sx={{ fontSize: 32 }} />}
                      </Avatar>
                      <Chip icon={<CheckCircleIcon />} label="Grupo determinado" color="success" size="small" sx={{ mb: 0.5 }} />
                      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                        {config?.nombre || grupoSoat}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Card Tarifa */}
            {grupoSoat && !requiereRevision && (
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    borderColor: tarifaCodigo ? 'secondary.main' : 'divider',
                    borderWidth: tarifaCodigo ? 2 : 1,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {tarifaCodigo ? (
                      <>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                          <ReceiptLongIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Chip icon={<CheckCircleIcon />} label="Tarifa determinada" color="secondary" size="small" sx={{ mb: 0.5 }} />
                        <Typography variant="h3" fontWeight={700} sx={{ mt: 0.5 }}>
                          Tarifa {tarifaCodigo}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Avatar sx={{ bgcolor: 'grey.300', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                          <ReceiptLongIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="subtitle1" color="text.secondary">
                          Completa las preguntas del módulo para determinar la tarifa
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Alerta error controlado */}
      {requiereRevision && motivo && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>Error controlado</AlertTitle>
          {motivo}. Este vehículo requiere revisión manual para asignar el grupo tarifario correcto.
        </Alert>
      )}

      {/* Alerta tarifa resuelta */}
      {tarifaCodigo && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <strong>{config?.nombre || grupoSoat}</strong> → <strong>Tarifa {tarifaCodigo}</strong>
        </Alert>
      )}
    </Box>
  );
};

export default Step7_GrupoSoat;
