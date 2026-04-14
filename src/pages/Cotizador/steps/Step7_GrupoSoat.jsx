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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';

import {
  selectGrupoClaseRunt,
  selectGrupoSubcriterio,
  selectGrupoSoat,
  selectGrupoRequiereRevision,
  selectGrupoMotivo,
  selectModuloPregunta1,
  selectModuloPregunta2,
  selectTarifaCodigo,
  selectTarifaDetalle,
  selectPreciosCliente,
  selectClienteSeleccionado,
  selectModoCliente,
  selectNuevoCliente,
  setGrupoClaseRunt,
  setGrupoSubcriterio,
  setGrupoSoat,
  setModuloPregunta1,
  setModuloPregunta2,
  setTarifaCodigo,
} from '../../../store/cotizadorStore/cotizadorSlice';

import {
  buscarTarifaPorCodigoThunk,
  obtenerPreciosClienteThunk,
} from '../../../store/cotizadorStore/cotizadorThunks';

import {
  selectClase,
  selectTipoServicio,
  selectClasificacion,
  selectModelo,
  selectCilindraje,
  selectPesoBruto,
  selectPasajerosSentados,
  selectCapacidadCarga,
  selectColor,
  selectPlaca,
  selectMarca,
  selectLinea,
} from '../../../store/apisExternasStore/apisExternasRuntStore';

// ═══════════════════════════════════════════════════════════
// PARTE 1: Árbol Clase RUNT → Grupo
// ═══════════════════════════════════════════════════════════

// Según mapa de clases del flujo SOAT:
// MOTOCICLETA → MOTOS (directo)
// MOTOCARRO   → MOTOCARROS (directo, grupo propio)
// CICLOMOTOR  → CICLOMOTORES (directo, grupo propio)
const CLASES_MOTOS = ['MOTOCICLETA', 'MOTOTRICICLO', 'CUATRIMOTO'];
const CLASES_MOTOCARRO = ['MOTOCARRO'];
const CLASES_CICLOMOTOR = ['CICLOMOTOR'];
const CLASES_CARGA = ['CAMION', 'TRACTOCAMION', 'VOLQUETA', 'FURGON', 'CARROTANQUE', 'REMOLQUE', 'SEMIRREMOLQUE'];
const CLASES_BUS = ['BUS', 'MICROBUS', 'BUSETA'];
const CLASES_AUTO = ['AUTOMOVIL', 'STATION WAGON'];

function obtenerTipoSubcriterio(clase) {
  if (!clase) return null;
  if (CLASES_MOTOS.includes(clase)) return 'DIRECTO';
  if (CLASES_MOTOCARRO.includes(clase)) return 'DIRECTO';
  if (CLASES_CICLOMOTOR.includes(clase)) return 'DIRECTO';
  if (CLASES_CARGA.includes(clase)) return 'DIRECTO';
  if (clase === 'CAMIONETA' || clase === 'CAMPERO') return 'TIPO_SERVICIO';
  if (CLASES_AUTO.includes(clase)) return 'CLASIFICACION';
  if (CLASES_BUS.includes(clase)) return 'TIPO_SERVICIO_BUS';
  return 'NO_MAPEADA';
}

function resolverGrupo(clase, subcriterio) {
  if (!clase) return null;
  if (CLASES_MOTOS.includes(clase)) return { grupo: 'MOTOS', requiereRevision: false };
  if (CLASES_MOTOCARRO.includes(clase)) return { grupo: 'MOTOCARROS', requiereRevision: false };
  if (CLASES_CICLOMOTOR.includes(clase)) return { grupo: 'CICLOMOTORES', requiereRevision: false };
  if (CLASES_CARGA.includes(clase)) return { grupo: 'CARGA', requiereRevision: false };
  if (!subcriterio) return null;
  if (clase === 'CAMIONETA' || clase === 'CAMPERO') {
    // PARTICULAR: subdividido por capacidad de pasajeros (≤5 o ≥6)
    if (subcriterio === 'PARTICULAR_HASTA_5') return { grupo: 'CAMPEROS', requiereRevision: false };
    if (subcriterio === 'PARTICULAR_6_MAS') return { grupo: '6_PASAJEROS', requiereRevision: false };
    // PUBLICO: subdividido por capacidad de carga (≤1000 o >1000)
    if (subcriterio === 'PUBLICO_CARGA_MENOR_IGUAL_1000') return { grupo: 'INTERMUNICIPAL', requiereRevision: false };
    if (subcriterio === 'PUBLICO_CARGA_MAYOR_1000') return { grupo: 'CARGA', requiereRevision: false };
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
        { codigo: 'MENOS_100', nombre: 'Menos de 100 cc' },
        { codigo: '100_200', nombre: '100 - 200 cc' },
        { codigo: 'MAS_200', nombre: 'Más de 200 cc' },
      ],
    },
    pregunta2: null,
    resolverTarifa: (p1) => {
      const mapa = { MENOS_100: 110, '100_200': 120, MAS_200: 130 };
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

  MOTOCARROS: {
    nombre: 'Módulo Motocarros',
    pregunta1: null,
    pregunta2: null,
    resolverTarifa: () => 140,
  },

  CICLOMOTORES: {
    nombre: 'Módulo Ciclomotores',
    pregunta1: null,
    pregunta2: null,
    resolverTarifa: () => 100,
  },
};

// ═══════════════════════════════════════════════════════════
// Configuración visual por grupo
// ═══════════════════════════════════════════════════════════

const GRUPO_CONFIG = {
  MOTOS:          { nombre: 'Motos',             color: 'warning',   Icono: TwoWheelerIcon },
  MOTOCARROS:     { nombre: 'Motocarros',        color: 'warning',   Icono: TwoWheelerIcon },
  CICLOMOTORES:   { nombre: 'Ciclomotores',      color: 'warning',   Icono: TwoWheelerIcon },
  CARGA:          { nombre: 'Carga',             color: 'info',      Icono: LocalShippingIcon },
  CAMPEROS:       { nombre: 'Camionetas y Camperos', color: 'success', Icono: DirectionsCarIcon },
  FAMILIAR_5P:    { nombre: 'Familiar 5P',       color: 'success',   Icono: DirectionsCarIcon },
  INTERMUNICIPAL: { nombre: 'Intermunicipal',    color: 'primary',   Icono: DirectionsBusIcon },
  TAXI:           { nombre: 'Taxi',              color: 'warning',   Icono: LocalTaxiIcon },
  BUS_URBANO:     { nombre: 'Bus Urbano',        color: 'primary',   Icono: DirectionsBusIcon },
  '6_PASAJEROS':  { nombre: '6+ Pasajeros',      color: 'secondary', Icono: DirectionsBusIcon },
};

// ═══════════════════════════════════════════════════════════
// Helpers para auto-resolución
// ═══════════════════════════════════════════════════════════

function resolverSubcriterioAuto(clase, tipoServicio, clasificacion, color, pasajerosSentados, capacidadCarga) {
  const tipo = obtenerTipoSubcriterio(clase);
  if (!tipo || tipo === 'DIRECTO' || tipo === 'NO_MAPEADA') return null;

  const servicio = (tipoServicio || '').toUpperCase();
  const esPublico = servicio.includes('PÚBLIC') || servicio.includes('PUBLIC');

  if (tipo === 'TIPO_SERVICIO') {
    // CAMIONETA / CAMPERO: subdividir según el mapa de clases
    if (esPublico) {
      const cargaNum = parseFloat(capacidadCarga);
      if (!isNaN(cargaNum) && cargaNum > 1000) return 'PUBLICO_CARGA_MAYOR_1000';
      return 'PUBLICO_CARGA_MENOR_IGUAL_1000';
    }
    const pasajerosNum = parseInt(pasajerosSentados) || 0;
    if (pasajerosNum >= 6) return 'PARTICULAR_6_MAS';
    return 'PARTICULAR_HASTA_5';
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
      if (cc < 100) return { p1: 'MENOS_100', p2: null };
      if (cc <= 200) return { p1: '100_200', p2: null };
      return { p1: 'MAS_200', p2: null };
    }
    case 'MOTOCARROS':
    case 'CICLOMOTORES':
      return { p1: null, p2: null };
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
    { codigo: 'PARTICULAR_HASTA_5', nombre: 'Particular · Hasta 5 pasajeros' },
    { codigo: 'PARTICULAR_6_MAS', nombre: 'Particular · 6 o más pasajeros' },
    { codigo: 'PUBLICO_CARGA_MENOR_IGUAL_1000', nombre: 'Público · Carga ≤ 1000 kg' },
    { codigo: 'PUBLICO_CARGA_MAYOR_1000', nombre: 'Público · Carga > 1000 kg' },
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
// Componentes de UI reutilizables
// ═══════════════════════════════════════════════════════════

const InfoRow = ({ label, value, highlight, bold }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6, px: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={highlight || bold ? 700 : 500}
      color={highlight ? 'primary.main' : 'text.primary'}
      sx={{ textAlign: 'right' }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

const SectionHeader = ({ icon, title, chip, color = 'primary' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    {React.cloneElement(icon, { color, fontSize: 'small' })}
    <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
      {title}
    </Typography>
    {chip}
  </Box>
);

const ResultCard = ({ icon, label, value, color, subtitle }) => (
  <Box sx={{ textAlign: 'center', py: 2 }}>
    <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48, mx: 'auto', mb: 1 }}>
      {icon}
    </Avatar>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={700} color={`${color}.main`}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        {subtitle}
      </Typography>
    )}
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
  const tarifaDetalle = useSelector(selectTarifaDetalle);
  const preciosCliente = useSelector(selectPreciosCliente);

  // Datos del cliente
  const clienteSeleccionado = useSelector(selectClienteSeleccionado);
  const modoCliente = useSelector(selectModoCliente);
  const nuevoCliente = useSelector(selectNuevoCliente);
  const cliente = modoCliente === 'seleccionado' ? clienteSeleccionado : nuevoCliente;

  // Datos RUNT del vehículo
  const runtPlaca = useSelector(selectPlaca);
  const runtClase = useSelector(selectClase);
  const runtTipoServicio = useSelector(selectTipoServicio);
  const runtClasificacion = useSelector(selectClasificacion);
  const runtModelo = useSelector(selectModelo);
  const runtCilindraje = useSelector(selectCilindraje);
  const runtPesoBruto = useSelector(selectPesoBruto);
  const runtPasajerosSentados = useSelector(selectPasajerosSentados);
  const runtCapacidadCarga = useSelector(selectCapacidadCarga);
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
    const sub = resolverSubcriterioAuto(
      claseRunt,
      runtTipoServicio,
      runtClasificacion,
      runtColor,
      runtPasajerosSentados,
      runtCapacidadCarga,
    );
    if (sub) {
      dispatch(setGrupoSubcriterio(sub));
    }
  }, [claseRunt, runtTipoServicio, runtClasificacion, runtColor, runtPasajerosSentados, runtCapacidadCarga, dispatch]);

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

  // ── Buscar detalle de tarifa cuando se determina el código ──
  useEffect(() => {
    if (tarifaCodigo) {
      dispatch(buscarTarifaPorCodigoThunk(tarifaCodigo));
    }
  }, [tarifaCodigo, dispatch]);

  // ── Obtener precios del cliente seleccionado ──
  useEffect(() => {
    if (cliente?.id) {
      dispatch(obtenerPreciosClienteThunk(cliente.id));
    }
  }, [cliente?.id, dispatch]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      {/* ═══ Encabezado ═══ */}
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Grupo SOAT y Tarifa
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Determinación automática del grupo y tarifa a partir de los datos del vehículo consultado.
      </Typography>

      {/* ═══ Alerta de revisión manual (arriba, visible de inmediato) ═══ */}
      {requiereRevision && motivo && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
          <AlertTitle>Revisión manual requerida</AlertTitle>
          {motivo}. Este vehículo requiere revisión manual para asignar el grupo tarifario correcto.
        </Alert>
      )}

      {/* ═══ SECCIÓN 1: Resumen de resultados (banner horizontal) ═══ */}
      {(grupoSoat || requiereRevision) && !requiereRevision && (
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderColor: tarifaCodigo ? 'success.main' : 'divider',
            borderWidth: tarifaCodigo ? 2 : 1,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #f8fffe 0%, #f0f7ff 100%)'
                : 'linear-gradient(135deg, #1a2a1a 0%, #1a1a2a 100%)',
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <Grid container spacing={0} alignItems="center" justifyContent="center">
              {/* Grupo */}
              <Grid item xs={12} sm={4}>
                <ResultCard
                  icon={config ? <config.Icono sx={{ fontSize: 28 }} /> : <CategoryIcon sx={{ fontSize: 28 }} />}
                  label="Grupo SOAT"
                  value={config?.nombre || grupoSoat || 'Determinando...'}
                  color={config?.color || 'info'}
                />
              </Grid>

              {/* Separador visual */}
              <Grid item xs={12} sm={0} sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Divider />
              </Grid>

              {/* Tarifa */}
              <Grid item xs={12} sm={4} sx={{ borderLeft: { sm: 1 }, borderRight: { sm: 1 }, borderColor: { sm: 'divider' } }}>
                <ResultCard
                  icon={<ReceiptLongIcon sx={{ fontSize: 28 }} />}
                  label="Tarifa"
                  value={tarifaCodigo ? `Tarifa ${tarifaCodigo}` : 'Determinando...'}
                  color="secondary"
                  subtitle={tarifaDetalle?.descripcion || null}
                />
              </Grid>

              {/* Separador visual */}
              <Grid item xs={12} sm={0} sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Divider />
              </Grid>

              {/* Valor */}
              <Grid item xs={12} sm={4}>
                <ResultCard
                  icon={<AttachMoneyIcon sx={{ fontSize: 28 }} />}
                  label="Valor de Tarifa"
                  value={tarifaDetalle ? formatCurrency(tarifaDetalle.valor) : '—'}
                  color="primary"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ═══ Sin datos del vehículo ═══ */}
      {!runtClase && !requiereRevision && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Avatar sx={{ bgcolor: 'grey.200', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <CategoryIcon sx={{ fontSize: 32, color: 'grey.500' }} />
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">
              No hay datos del vehículo para determinar el grupo
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Regresa al paso anterior para consultar los datos del vehículo.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ═══ SECCIÓN 2: Detalle (dos columnas) ═══ */}
      <Grid container spacing={2.5}>

        {/* ── Columna izquierda: Datos del vehículo y resolución ── */}
        <Grid item xs={12} md={6}>
          {/* Card: Datos del vehículo */}
          <Card
            variant="outlined"
            sx={{
              mb: 2,
              borderLeft: 4,
              borderLeftColor: 'primary.main',
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <SectionHeader
                icon={<DirectionsCarIcon />}
                title="Datos del vehículo"
                color="primary"
                chip={runtPlaca ? <Chip label={runtPlaca} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} /> : null}
              />
              <Divider sx={{ mb: 1 }} />
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

          {/* Card: Resolución automática */}
          <Card
            variant="outlined"
            sx={{
              borderLeft: 4,
              borderLeftColor: 'secondary.main',
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <SectionHeader
                icon={<AutoFixHighIcon />}
                title="Resolución automática"
                color="secondary"
              />
              <Divider sx={{ mb: 1 }} />

              <InfoRow label="Clase detectada" value={claseRunt} highlight />
              {tipoSubcriterio === 'DIRECTO' && (
                <InfoRow label="Tipo mapeo" value="Directo (sin criterio adicional)" />
              )}

              {necesitaSubcriterio && subcriterio && (
                <InfoRow
                  label={LABEL_SUBCRITERIO[tipoSubcriterio]}
                  value={getSubcriterioLabel(tipoSubcriterio, subcriterio)}
                  highlight
                />
              )}

              {grupoSoat && !requiereRevision && modulo && (
                <>
                  <Divider sx={{ my: 1 }} />
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

        {/* ── Columna derecha: Detalle de tarifa y precios del cliente ── */}
        <Grid item xs={12} md={6}>
          {/* Card: Detalle de la tarifa */}
          {tarifaCodigo && tarifaDetalle && (
            <Card
              variant="outlined"
              sx={{
                mb: 2,
                borderLeft: 4,
                borderLeftColor: 'info.main',
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <SectionHeader
                  icon={<ReceiptLongIcon />}
                  title="Detalle de la tarifa"
                  color="info"
                  chip={<Chip icon={<CheckCircleIcon />} label={`Tarifa ${tarifaDetalle.codigo_tarifa}`} size="small" color="info" variant="outlined" sx={{ fontWeight: 600 }} />}
                />
                <Divider sx={{ mb: 1 }} />
                <InfoRow label="Código" value={tarifaDetalle.codigo_tarifa} highlight />
                <InfoRow label="Descripción" value={tarifaDetalle.descripcion} />
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Valor de Tarifa
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(tarifaDetalle.valor)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Card: Tarifa no encontrada */}
          {tarifaCodigo && !tarifaDetalle && (
            <Card
              variant="outlined"
              sx={{
                mb: 2,
                borderLeft: 4,
                borderLeftColor: 'warning.main',
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <SectionHeader
                  icon={<ReceiptLongIcon />}
                  title="Detalle de la tarifa"
                  color="warning"
                />
                <Divider sx={{ mb: 1 }} />
                <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                  Buscando información de la Tarifa {tarifaCodigo} en el tarifario...
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Card: Precios del cliente */}
          {cliente && (
            <Card
              variant="outlined"
              sx={{
                borderLeft: 4,
                borderLeftColor: 'success.main',
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <SectionHeader
                  icon={<PersonIcon />}
                  title="Precios del cliente"
                  color="success"
                  chip={cliente.nombre ? <Chip label={cliente.nombre} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} /> : null}
                />
                <Divider sx={{ mb: 1 }} />
                {preciosCliente.length > 0 ? (
                  preciosCliente.map((precio, index) => (
                    <Box
                      key={precio.id}
                      sx={{
                        mt: index > 0 ? 1.5 : 0.5,
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                        {precio.descripcion}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                            Precio de Ley
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {formatCurrency(precio.precio_lay)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                            Comisión
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="secondary.main">
                            {formatCurrency(precio.comision)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Este cliente no tiene precios configurados.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* ═══ Alerta resumen final ═══ */}
      {tarifaCodigo && !requiereRevision && (
        <Alert
          severity="success"
          variant="outlined"
          icon={<CheckCircleIcon />}
          sx={{ mt: 3 }}
        >
          <strong>{config?.nombre || grupoSoat}</strong> → <strong>Tarifa {tarifaCodigo}</strong>
          {tarifaDetalle && <> — {tarifaDetalle.descripcion} — <strong>{formatCurrency(tarifaDetalle.valor)}</strong></>}
          {' — '}Determinada automáticamente desde los datos RUNT del vehículo <strong>{runtPlaca}</strong>.
        </Alert>
      )}
    </Box>
  );
};

export default Step7_GrupoSoat;
