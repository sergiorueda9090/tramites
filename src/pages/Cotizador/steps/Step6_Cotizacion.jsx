import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import SearchIcon from '@mui/icons-material/Search';

import {
  selectClienteSeleccionado,
  selectNuevoCliente,
  selectModoCliente,
  selectTipoTramite,
  selectTipoVehiculo,
  selectMetodoConsulta,
  selectEsFlujoSoat,
  selectCotizacion,
  selectCotizacionGuardada,
  selectLoading,
  setCotizacion,
} from '../../../store/cotizadorStore/cotizadorSlice';
import {
  selectPlaca,
  selectEstadoAutomotor,
  selectTipoServicio,
  selectClase,
  selectMarca,
  selectLinea,
  selectModelo,
  selectColor,
  selectVin,
  selectCilindraje,
  selectTipoCombustible,
  selectPesoBruto,
  selectClasificacion,
  selectOrganismoTransito,
  selectSoat,
  selectRtms,
} from '../../../store/apisExternasStore/apisExternasRuntStore';
import { guardarCotizacionThunk } from '../../../store/cotizadorStore/cotizadorThunks';
import CotizacionResumen from '../Components/CotizacionResumen';

const NOMBRES_TRAMITE = {
  SOAT: 'SOAT',
  SOAT_ESPECIAL: 'SOAT Tarifa Especial',
  TECNO: 'Técnico Mecánica',
  COMBO: 'Combo SOAT + Tecno',
  ORGANISMO: 'Trámite en Organismo de Tránsito',
  IMPUESTOS: 'Pago de Impuestos',
  MULTAS: 'Gestión de Multas',
  CURSO_VIAL: 'Curso Vial 50% Descuento',
  LIC_RENOVACION: 'Licencia Renovación',
  LIC_PRIMERA: 'Licencia Primera Vez',
  IMPRONTAS: 'Toma de Improntas',
};

const NOMBRES_TIPO_VEHICULO = {
  USADO: 'Vehículo Usado',
  CERO_KM: 'Vehículo 0 KM',
};

const NOMBRES_METODO_CONSULTA = {
  PLACA_RUNT: 'Placa + Documento en RUNT',
  IA_FOTO_TARJETA: 'IA Foto Tarjeta de Propiedad',
  IA_VIN_RUNT: 'IA Foto + Documento en RUNT',
  PLACA_FALABELLA: 'Placa en Falabella + Documento en RUNT',
};

const InfoRow = ({ label, value }) => (
  <Typography variant="body2" sx={{ py: 0.3 }}>
    <strong>{label}:</strong> {value || '-'}
  </Typography>
);

const formatFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-CO', { dateStyle: 'medium' });
};

const Step6_Cotizacion = ({ onReset }) => {
  const dispatch = useDispatch();

  // Datos del cotizador
  const clienteSeleccionado = useSelector(selectClienteSeleccionado);
  const nuevoCliente        = useSelector(selectNuevoCliente);
  const modoCliente         = useSelector(selectModoCliente);
  const tipoTramite = useSelector(selectTipoTramite);
  const tipoVehiculo = useSelector(selectTipoVehiculo);
  const metodoConsulta = useSelector(selectMetodoConsulta);
  const esFlujoSoat = useSelector(selectEsFlujoSoat);
  const cotizacion = useSelector(selectCotizacion);
  const cotizacionGuardada = useSelector(selectCotizacionGuardada);
  const loading = useSelector(selectLoading);

  // Datos RUNT del vehículo
  const placa = useSelector(selectPlaca);
  const estadoAutomotor = useSelector(selectEstadoAutomotor);
  const tipoServicio = useSelector(selectTipoServicio);
  const clase = useSelector(selectClase);
  const marca = useSelector(selectMarca);
  const linea = useSelector(selectLinea);
  const modelo = useSelector(selectModelo);
  const color = useSelector(selectColor);
  const vin = useSelector(selectVin);
  const cilindraje = useSelector(selectCilindraje);
  const tipoCombustible = useSelector(selectTipoCombustible);
  const pesoBruto = useSelector(selectPesoBruto);
  const clasificacion = useSelector(selectClasificacion);
  const organismoTransito = useSelector(selectOrganismoTransito);
  const soat = useSelector(selectSoat);
  const rtms = useSelector(selectRtms);

  // Cliente a mostrar (seleccionado o nuevo)
  const cliente = modoCliente === 'seleccionado' ? clienteSeleccionado : nuevoCliente;

  const handleCotizacionChange = (field) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    const newCotizacion = { ...cotizacion, [field]: value };
    newCotizacion.total = newCotizacion.tarifa + newCotizacion.comision;
    dispatch(setCotizacion(newCotizacion));
  };

  const handleGuardar = () => {
    const data = {
      cliente,
      tipoTramite,
      datosVehiculo: esFlujoSoat ? { placa, marca, linea, modelo, clase, cilindraje, color, vin } : null,
      cotizacion,
    };
    dispatch(guardarCotizacionThunk(data));
  };

  const handleImprimir = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // SOAT vigente
  const soatVigente = soat.find((s) => s.estado === 'VIGENTE');
  // RTM vigente
  const rtmVigente = rtms?.revisiones?.find((r) => r.vigente === 'SI');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Resumen de cotización
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revisa los datos y ajusta la tarifa y comisión antes de guardar.
      </Typography>

      <Grid container spacing={2}>
        {/* Card Cliente */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Cliente
                </Typography>
                {modoCliente === 'nuevo' && (
                  <Chip label="Nuevo" size="small" color="info" variant="outlined" />
                )}
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              {cliente ? (
                <>
                  <InfoRow label="Nombre" value={cliente.nombre} />
                  <InfoRow label="Teléfono" value={cliente.telefono} />
                  <InfoRow label="Documento" value={cliente.documento} />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Sin cliente seleccionado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Card Tipo de Trámite + Configuración */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Configuración del Trámite
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <InfoRow label="Tipo de Trámite" value={NOMBRES_TRAMITE[tipoTramite] || tipoTramite} />
              {esFlujoSoat && (
                <>
                  <InfoRow label="Tipo de Vehículo" value={NOMBRES_TIPO_VEHICULO[tipoVehiculo] || tipoVehiculo} />
                  <InfoRow label="Método de Consulta" value={NOMBRES_METODO_CONSULTA[metodoConsulta] || metodoConsulta} />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Card Datos del Vehículo (solo flujo SOAT) */}
        {esFlujoSoat && placa && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DirectionsCarIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Datos del Vehículo
                  </Typography>
                  <Chip
                    label={estadoAutomotor || 'Sin estado'}
                    size="small"
                    color={estadoAutomotor === 'ACTIVO' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Divider sx={{ mb: 1.5 }} />

                <Grid container spacing={1}>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Placa" value={placa} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Clase" value={clase} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Clasificación" value={clasificacion} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Servicio" value={tipoServicio} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Marca" value={marca} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Línea" value={linea} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Modelo" value={modelo} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Color" value={color} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Cilindraje" value={cilindraje ? `${cilindraje} cc` : null} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Combustible" value={tipoCombustible} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="Peso Bruto" value={pesoBruto ? `${pesoBruto} kg` : null} />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <InfoRow label="VIN" value={vin} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Organismo de Tránsito" value={organismoTransito} />
                  </Grid>
                </Grid>

                {/* SOAT vigente */}
                {soatVigente && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>SOAT Vigente</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <InfoRow label="No." value={soatVigente.numSoat} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <InfoRow label="Estado" value={soatVigente.estado} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <InfoRow label="Vence" value={formatFecha(soatVigente.fechaVencimSoat)} />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <InfoRow label="Aseguradora" value={soatVigente.razonSocialAsegur} />
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* RTM vigente */}
                {rtmVigente && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>RTM Vigente</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <InfoRow label="Certificado" value={rtmVigente.numeCerti} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <InfoRow label="Estado" value={rtmVigente.estadoRvt} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <InfoRow label="Vence" value={formatFecha(rtmVigente.fechaVencimientoRvt)} />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <InfoRow label="CDA" value={rtmVigente.nombreCda} />
                      </Grid>
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Card Cotización */}
        <Grid item xs={12}>
          <CotizacionResumen
            cotizacion={cotizacion}
            onTarifaChange={handleCotizacionChange('tarifa')}
            onComisionChange={handleCotizacionChange('comision')}
            formatCurrency={formatCurrency}
          />
        </Grid>
      </Grid>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleGuardar}
          disabled={loading || cotizacionGuardada}
          size="large"
        >
          {cotizacionGuardada ? 'Cotización guardada' : 'Guardar cotización'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          size="large"
        >
          Nueva cotización
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handleImprimir}
          size="large"
        >
          Imprimir
        </Button>
      </Box>
    </Box>
  );
};

export default Step6_Cotizacion;
