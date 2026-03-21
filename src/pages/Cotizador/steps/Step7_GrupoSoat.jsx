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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

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

import {
  selectClase,
  selectTipoServicio,
  selectClasificacion,
  selectModelo,
  selectCilindraje,
  selectPesoBruto,
  selectPasajerosSentados,
  selectColor,
  selectPlaca,
  selectMarca,
  selectLinea,
} from '../../../store/apisExternasStore/apisExternasRuntStore';

// ═══════════════════════════════════════════════════════════
// PARTE 1: Árbol Clase RUNT → Grupo
// ═══════════════════════════════════════════════════════════

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
    pregunta2: null,
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
    pregunta1: null,
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
// Helpers para auto-resolución
// ═══════════════════════════════════════════════════════════

function resolverSubcriterioAuto(clase, tipoServicio, clasificacion, color) {
  const tipo = obtenerTipoSubcriterio(clase);
  if (!tipo || tipo === 'DIRECTO' || tipo === 'NO_MAPEADA') return null;

  const servicio = (tipoServicio || '').toUpperCase();
  const esPublico = servicio.includes('PÚBLIC') || servicio.includes('PUBLIC');

  if (tipo === 'TIPO_SERVICIO') {
    return esPublico ? 'PUBLICO' : 'PARTICULAR';
  }

  if (tipo === 'CLASIFICACION') {
    const colorUpper = (color || '').toUpperCase();
    const clasifUpper = (clasificacion || '').toUpperCase();
    if (colorUpper === 'AMARILLO' || clasifUpper.includes('TAXI')) {
      return 'COLOR AMARILLO';
    }
    return esPublico ? 'PUBLICO' : 'PARTICULAR';
  }

  if (tipo === 'TIPO_SERVICIO_BUS') {
    const clasifUpper = (clasificacion || '').toUpperCase();
    if (clasifUpper.includes('URBANO')) return 'URBANO';
    if (clasifUpper.includes('INTERMUNICIPAL')) return 'INTERMUNICIPAL';
    return 'URBANO';
  }

  return null;
}

function resolverPreguntasAuto(grupo, claseRunt, runtModelo, runtCilindraje, runtPesoBruto, runtPasajerosSentados) {
  const currentYear = new Date().getFullYear();
  const modeloNum = parseInt(runtModelo) || 0;
  const vehicleAge = modeloNum > 0 ? currentYear - modeloNum : 0;
  const cc = parseInt(runtCilindraje) || 0;
  const peso = parseFloat(runtPesoBruto) || 0;
  const pasajeros = parseInt(runtPasajerosSentados) || 0;

  switch (grupo) {
    case 'MOTOS': {
      if (claseRunt === 'CICLOMOTOR') return { p1: 'CICLOMOTOR', p2: null };
      if (cc < 100) return { p1: 'MENOS_100', p2: null };
      if (cc <= 200) return { p1: '100_200', p2: null };
      return { p1: 'MAS_200', p2: null };
    }
    case 'CAMPEROS':
    case 'FAMILIAR_5P':
    case 'TAXI': {
      const p1 = vehicleAge <= 9 ? 'HASTA_9' : '10_O_MAS';
      let p2;
      if (cc < 1500) p2 = 'MENOS_1500';
      else if (cc <= 2500) p2 = '1500_2500';
      else p2 = 'MAS_2500';
      return { p1, p2 };
    }
    case 'CARGA': {
      const toneladas = peso / 1000;
      if (toneladas < 5) return { p1: 'MENOS_5', p2: null };
      if (toneladas <= 15) return { p1: '5_15', p2: null };
      return { p1: 'MAS_15', p2: null };
    }
    case 'BUS_URBANO':
      return { p1: null, p2: null };
    case 'INTERMUNICIPAL':
      return { p1: pasajeros < 10 ? 'MENOS_10' : '10_O_MAS', p2: null };
    case '6_PASAJEROS': {
      const p1 = vehicleAge <= 9 ? 'HASTA_9' : '10_O_MAS';
      const p2 = cc < 2500 ? 'MENOS_2500' : '2500_O_MAS';
      return { p1, p2 };
    }
    default:
      return { p1: null, p2: null };
  }
}

function getOpcionLabel(modulo, preguntaKey, value) {
  if (!modulo || !modulo[preguntaKey] || !value) return null;
  const opcion = modulo[preguntaKey].opciones.find((o) => o.codigo === value);
  return opcion ? opcion.nombre : value;
}

const LABEL_SUBCRITERIO = {
  TIPO_SERVICIO: 'Tipo de Servicio',
  CLASIFICACION: 'Clasificación',
  TIPO_SERVICIO_BUS: 'Tipo de Servicio',
};

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

function getSubcriterioLabel(tipo, value) {
  if (!tipo || !value) return null;
  const opciones = OPCIONES_SUBCRITERIO[tipo];
  if (!opciones) return value;
  const opcion = opciones.find((o) => o.codigo === value);
  return opcion ? opcion.nombre : value;
}

// ═══════════════════════════════════════════════════════════
// Componente de fila informativa
// ═══════════════════════════════════════════════════════════

const InfoRow = ({ label, value, highlight }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={highlight ? 700 : 500} color={highlight ? 'primary.main' : 'text.primary'}>
      {value || '-'}
    </Typography>
  </Box>
);

// ═══════════════════════════════════════════════════════════
// Componente
// ═══════════════════════════════════════════════════════════

const Step7_GrupoSoat = () => {
  const dispatch = useDispatch();

  // Selectores del cotizador (grupo/tarifa)
  const claseRunt = useSelector(selectGrupoClaseRunt);
  const subcriterio = useSelector(selectGrupoSubcriterio);
  const grupoSoat = useSelector(selectGrupoSoat);
  const requiereRevision = useSelector(selectGrupoRequiereRevision);
  const motivo = useSelector(selectGrupoMotivo);
  const pregunta1 = useSelector(selectModuloPregunta1);
  const pregunta2 = useSelector(selectModuloPregunta2);
  const tarifaCodigo = useSelector(selectTarifaCodigo);

  // Datos RUNT del vehículo
  const runtPlaca = useSelector(selectPlaca);
  const runtClase = useSelector(selectClase);
  const runtTipoServicio = useSelector(selectTipoServicio);
  const runtClasificacion = useSelector(selectClasificacion);
  const runtModelo = useSelector(selectModelo);
  const runtCilindraje = useSelector(selectCilindraje);
  const runtPesoBruto = useSelector(selectPesoBruto);
  const runtPasajerosSentados = useSelector(selectPasajerosSentados);
  const runtColor = useSelector(selectColor);
  const runtMarca = useSelector(selectMarca);
  const runtLinea = useSelector(selectLinea);

  const tipoSubcriterio = obtenerTipoSubcriterio(claseRunt);
  const necesitaSubcriterio = tipoSubcriterio && tipoSubcriterio !== 'DIRECTO' && tipoSubcriterio !== 'NO_MAPEADA';

  const modulo = grupoSoat ? MODULOS[grupoSoat] : null;
  const config = grupoSoat ? GRUPO_CONFIG[grupoSoat] : null;
  const necesitaPregunta1 = modulo?.pregunta1 != null;
  const necesitaPregunta2 = modulo?.pregunta2 != null;

  // ── Auto-resolver clase RUNT desde datos del vehículo ──
  useEffect(() => {
    if (runtClase) {
      dispatch(setGrupoClaseRunt(runtClase.toUpperCase()));
    }
  }, [runtClase, dispatch]);

  // ── Auto-resolver subcriterio desde datos del vehículo ──
  useEffect(() => {
    if (!claseRunt) return;
    const sub = resolverSubcriterioAuto(claseRunt, runtTipoServicio, runtClasificacion, runtColor);
    if (sub) {
      dispatch(setGrupoSubcriterio(sub));
    }
  }, [claseRunt, runtTipoServicio, runtClasificacion, runtColor, dispatch]);

  // ── Resolver grupo cuando cambian clase o subcriterio ──
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

  // ── Auto-resolver preguntas del módulo desde datos del vehículo ──
  useEffect(() => {
    if (!grupoSoat || !modulo || requiereRevision) return;
    const { p1, p2 } = resolverPreguntasAuto(grupoSoat, claseRunt, runtModelo, runtCilindraje, runtPesoBruto, runtPasajerosSentados);
    if (p1 !== undefined) dispatch(setModuloPregunta1(p1));
    if (p2 !== undefined) dispatch(setModuloPregunta2(p2));
  }, [grupoSoat, modulo, requiereRevision, claseRunt, runtModelo, runtCilindraje, runtPesoBruto, runtPasajerosSentados, dispatch]);

  // ── Resolver tarifa cuando cambian grupo o preguntas del módulo ──
  useEffect(() => {
    if (!grupoSoat || !modulo) return;

    if (!necesitaPregunta1) {
      dispatch(setTarifaCodigo(modulo.resolverTarifa()));
      return;
    }

    if (!necesitaPregunta2 && pregunta1) {
      dispatch(setTarifaCodigo(modulo.resolverTarifa(pregunta1)));
      return;
    }

    if (necesitaPregunta2 && pregunta1 && pregunta2) {
      dispatch(setTarifaCodigo(modulo.resolverTarifa(pregunta1, pregunta2)));
      return;
    }

    dispatch(setTarifaCodigo(null));
  }, [dispatch, grupoSoat, modulo, pregunta1, pregunta2, necesitaPregunta1, necesitaPregunta2]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Grupo SOAT y Tarifa
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Determinación automática del grupo y tarifa a partir de los datos del vehículo consultado.
      </Typography>

      <Grid container spacing={3}>
        {/* ── Columna izquierda: Datos utilizados y resolución ── */}
        <Grid item xs={12} md={5}>
          {/* Card datos del vehículo utilizados */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DirectionsCarIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Datos del vehículo
                </Typography>
                {runtPlaca && (
                  <Chip label={runtPlaca} size="small" color="primary" variant="outlined" />
                )}
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <InfoRow label="Clase RUNT" value={runtClase} highlight />
              <InfoRow label="Servicio" value={runtTipoServicio} />
              <InfoRow label="Clasificación" value={runtClasificacion} />
              <InfoRow label="Marca / Línea" value={runtMarca && runtLinea ? `${runtMarca} ${runtLinea}` : runtMarca} />
              <InfoRow label="Modelo" value={runtModelo} />
              <InfoRow label="Cilindraje" value={runtCilindraje ? `${runtCilindraje} cc` : null} />
              <InfoRow label="Color" value={runtColor} />
              {runtPesoBruto && <InfoRow label="Peso Bruto" value={`${runtPesoBruto} kg`} />}
              {runtPasajerosSentados && <InfoRow label="Pasajeros" value={runtPasajerosSentados} />}
            </CardContent>
          </Card>

          {/* Card resolución automática */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoFixHighIcon color="secondary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Resolución automática
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />

              {/* Clase → Tipo de mapeo */}
              <InfoRow label="Clase detectada" value={claseRunt} highlight />
              {tipoSubcriterio === 'DIRECTO' && (
                <InfoRow label="Tipo mapeo" value="Directo (sin criterio adicional)" />
              )}

              {/* Subcriterio (si aplica) */}
              {necesitaSubcriterio && subcriterio && (
                <InfoRow
                  label={LABEL_SUBCRITERIO[tipoSubcriterio]}
                  value={getSubcriterioLabel(tipoSubcriterio, subcriterio)}
                  highlight
                />
              )}

              {/* Módulo y preguntas resueltas */}
              {grupoSoat && !requiereRevision && modulo && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <InfoRow label="Módulo" value={modulo.nombre} highlight />

                  {!necesitaPregunta1 && (
                    <InfoRow label="Resolución" value="Tarifa directa" />
                  )}

                  {necesitaPregunta1 && pregunta1 && (
                    <InfoRow
                      label={modulo.pregunta1.label.replace('¿', '').replace('?', '')}
                      value={getOpcionLabel(modulo, 'pregunta1', pregunta1)}
                    />
                  )}

                  {necesitaPregunta2 && pregunta2 && (
                    <InfoRow
                      label={modulo.pregunta2.label.replace('¿', '').replace('?', '')}
                      value={getOpcionLabel(modulo, 'pregunta2', pregunta2)}
                    />
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
                  {/* Sin datos del vehículo */}
                  {!runtClase && (
                    <>
                      <Avatar sx={{ bgcolor: 'grey.300', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="subtitle1" color="text.secondary">
                        No hay datos del vehículo para determinar el grupo
                      </Typography>
                    </>
                  )}

                  {/* Procesando */}
                  {runtClase && !grupoSoat && !requiereRevision && (
                    <>
                      <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="subtitle1" color="info.main">
                        Determinando grupo...
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
                          Determinando tarifa...
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
          {' — '}Determinada automáticamente desde los datos RUNT del vehículo {runtPlaca}.
        </Alert>
      )}
    </Box>
  );
};

export default Step7_GrupoSoat;
