import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  AlertTitle,
  Avatar,
  CircularProgress,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import {
  selectPlaca,
  selectResultado,
  selectLoading,
  setPlaca,
  resetCotizadorRapido,
} from '../../store/cotizadorRapidoStore/cotizadorRapidoSlice';
import { cotizarRapidoThunk } from '../../store/cotizadorRapidoStore/cotizadorRapidoThunks';
import AlertService from '../../services/alertService';

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatFechaCorta = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const CotizadorRapidoPage = () => {
  const dispatch = useDispatch();
  const placa = useSelector(selectPlaca);
  const resultado = useSelector(selectResultado);
  const loading = useSelector(selectLoading);

  // Resetear al desmontar (cambio de módulo)
  useEffect(() => {
    return () => {
      dispatch(resetCotizadorRapido());
    };
  }, [dispatch]);

  const handleCotizar = async () => {
    const result = await dispatch(cotizarRapidoThunk(placa));
    if (!result) return;

    // Notificación informativa: precios no coinciden o caso especial.
    if (result.esCasoEspecial) {
      AlertService.warning(
        'Caso especial',
        'No se pudo validar el precio con la consulta normal por VIN. Verifica los datos manualmente antes de continuar.'
      );
    } else if (!result.coinciden) {
      AlertService.warning(
        'La tarifa no coincide',
        `La tarifa que aplicó Previsora (código ${result.previsoraTariffCode ?? '—'}) no coincide con la del SOAT vigente en el RUNT (código ${result.runtTariffCode ?? '—'}). Revisa antes de continuar.`
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleCotizar();
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <BoltIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Cotizador Rápido
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta el precio del SOAT por placa y valídalo automáticamente por VIN.
          </Typography>
        </Box>
      </Box>

      {/* Entrada de placa */}
      <Paper sx={{ p: { xs: 2, md: 3 }, my: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7} md={8}>
            <TextField
              fullWidth
              label="Placa del vehículo"
              value={placa}
              onChange={(e) => dispatch(setPlaca(e.target.value.toUpperCase()))}
              onKeyDown={handleKeyDown}
              placeholder="Ej: FYL23F"
              inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 1 } }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
              onClick={handleCotizar}
              disabled={loading || !placa.trim()}
              sx={{ height: 56, fontWeight: 600 }}
            >
              {loading ? 'Cotizando...' : 'Cotizar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Resultado */}
      {resultado && (
        <Grid container spacing={2.5}>
          {/* Precio principal (Previsora) */}
          <Grid item xs={12} md={5}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderColor: 'primary.main',
                borderWidth: 2,
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, #f0f7ff 0%, #f8fffe 100%)'
                    : 'linear-gradient(135deg, #1a1a2a 0%, #1a2a2a 100%)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                  <AttachMoneyIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="overline" color="text.secondary">
                  Precio SOAT (Previsora)
                </Typography>
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  {resultado.previsoraPrecioFmt || formatCurrency(resultado.previsoraPrecio)}
                </Typography>
                {resultado.placa && (
                  <Chip label={`Placa ${resultado.placa}`} color="primary" variant="outlined" sx={{ mt: 2, fontWeight: 600 }} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Validación y datos */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <DirectionsCarIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Validación por VIN
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Estado de la comparación */}
                {resultado.esCasoEspecial ? (
                  <Alert severity="warning" variant="outlined" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                    <AlertTitle>Caso especial</AlertTitle>
                    No fue posible validar la tarifa con la consulta normal por VIN.
                  </Alert>
                ) : resultado.coinciden ? (
                  <Alert severity="success" variant="outlined" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                    <AlertTitle>Tarifa validada</AlertTitle>
                    La tarifa de Previsora coincide con el SOAT vigente del RUNT (código {resultado.runtTariffCode || '—'}).
                  </Alert>
                ) : (
                  <Alert severity="warning" variant="outlined" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                    <AlertTitle>La tarifa no coincide</AlertTitle>
                    Revisa la cotización antes de continuar.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">VIN</Typography>
                  <Typography variant="body2" fontWeight={600}>{resultado.vin || '—'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Precio Previsora</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {formatCurrency(resultado.previsoraPrecio)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Código tarifa Previsora</Typography>
                  <Typography variant="body2" fontWeight={600}>{resultado.previsoraTariffCode || '—'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Código tarifa SOAT vigente (RUNT)</Typography>
                  <Typography variant="body2" fontWeight={600}>{resultado.runtTariffCode || '—'}</Typography>
                </Box>
                {resultado.runtSoatVigente && (
                  <>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">SOAT vigente</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right' }}>
                        {resultado.runtSoatVigente.razonSocialAsegur || '—'}
                        {resultado.runtSoatVigente.fechaVencimSoat
                          ? ` · vence ${formatFechaCorta(resultado.runtSoatVigente.fechaVencimSoat)}`
                          : ''}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CotizadorRapidoPage;
