import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BuildIcon from '@mui/icons-material/Build';
import PaymentsIcon from '@mui/icons-material/Payments';
import GavelIcon from '@mui/icons-material/Gavel';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';

import { selectTipoTramite, setTipoTramite } from '../../../store/cotizadorStore/cotizadorSlice';
import TipoTramiteCard from '../Components/TipoTramiteCard';

const TIPOS_TRAMITE = [
  { codigo: 'SOAT', nombre: 'SOAT', icono: ReceiptLongIcon, descripcion: 'Seguro obligatorio de accidentes de tránsito' },
  { codigo: 'SOAT_ESPECIAL', nombre: 'SOAT Tarifa Especial', icono: StarIcon, descripcion: 'SOAT con tarifa especial' },
  { codigo: 'TECNO', nombre: 'Técnico Mecánica', icono: BuildIcon, descripcion: 'Revisión técnico mecánica' },
  { codigo: 'COMBO', nombre: 'Combo SOAT + Tecno', icono: AssignmentIcon, descripcion: 'SOAT más revisión técnico mecánica' },
  { codigo: 'ORGANISMO', nombre: 'Trámite en Organismo de Tránsito', icono: AssignmentIcon, descripcion: 'Trámites ante organismos de tránsito' },
  { codigo: 'IMPUESTOS', nombre: 'Pago de Impuestos', icono: PaymentsIcon, descripcion: 'Gestión y pago de impuestos vehiculares' },
  { codigo: 'MULTAS', nombre: 'Gestión de Multas', icono: GavelIcon, descripcion: 'Gestión y pago de multas de tránsito' },
  { codigo: 'CURSO_VIAL', nombre: 'Curso Vial 50% Descuento', icono: SchoolIcon, descripcion: 'Curso vial para obtener el 50% de descuento' },
  { codigo: 'LIC_RENOVACION', nombre: 'Licencia Renovación', icono: BadgeIcon, descripcion: 'Renovación de licencia de conducción' },
  { codigo: 'LIC_PRIMERA', nombre: 'Licencia Primera Vez', icono: BadgeIcon, descripcion: 'Licencia de conducción por primera vez' },
  { codigo: 'IMPRONTAS', nombre: 'Toma de Improntas', icono: FingerprintIcon, descripcion: 'Servicio de toma de improntas vehiculares' },
];

const Step2_TipoTramite = () => {
  const dispatch = useDispatch();
  const tipoTramite = useSelector(selectTipoTramite);

  const handleSelect = (codigo) => {
    dispatch(setTipoTramite(codigo));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecciona el tipo de trámite
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Elige el trámite que deseas cotizar para tu cliente.
      </Typography>

      <Grid container spacing={2}>
        {TIPOS_TRAMITE.map((tipo) => (
          <Grid item xs={12} sm={6} md={4} key={tipo.codigo}>
            <TipoTramiteCard
              codigo={tipo.codigo}
              nombre={tipo.nombre}
              descripcion={tipo.descripcion}
              Icono={tipo.icono}
              seleccionado={tipoTramite === tipo.codigo}
              onClick={() => handleSelect(tipo.codigo)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Step2_TipoTramite;
