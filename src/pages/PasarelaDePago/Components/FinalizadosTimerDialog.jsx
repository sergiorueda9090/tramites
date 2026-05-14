import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NotesIcon from '@mui/icons-material/Notes';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

const TOTAL_SECONDS = 180; // 3 minutos

const formatTime = (s) => {
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const formatCurrency = (value) =>
  value
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
    : '-';

/**
 * Modal con cuenta regresiva de 3 minutos previo a enviar una pasarela
 * a Trámites Finalizados. Solo si el usuario marca "Pago exitoso" se
 * dispara el envío.
 *
 * Props:
 *  - open: boolean
 *  - pasarela: objeto de pasarela (para mostrar resumen)
 *  - tarjetas: lista para el select opcional
 *  - onResult: ({ exitoso, observacion, tarjeta }) => void
 */
const FinalizadosTimerDialog = ({ open, pasarela, tarjetas = [], onResult }) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [observacion, setObservacion] = useState('');
  const [tarjetaId, setTarjetaId] = useState('');
  const intervalRef = useRef(null);
  const onResultRef = useRef(onResult);
  const observacionRef = useRef('');
  const tarjetaIdRef = useRef('');
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { observacionRef.current = observacion; }, [observacion]);
  useEffect(() => { tarjetaIdRef.current = tarjetaId; }, [tarjetaId]);

  useEffect(() => {
    if (!open) return undefined;
    setSecondsLeft(TOTAL_SECONDS);
    setObservacion('');
    setTarjetaId(pasarela?.tarjeta?.id ? String(pasarela.tarjeta.id) : '');
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onResultRef.current?.({
            exitoso: false,
            observacion: observacionRef.current.trim(),
            tarjeta: tarjetaIdRef.current || null,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleExitoso = () => {
    clearInterval(intervalRef.current);
    onResult?.({ exitoso: true, observacion: observacion.trim(), tarjeta: tarjetaId || null });
  };

  const handleNoExito = () => {
    clearInterval(intervalRef.current);
    onResult?.({ exitoso: false, observacion: observacion.trim(), tarjeta: tarjetaId || null });
  };

  const placa = pasarela?.placa || '(sin placa)';
  const clienteNombre = pasarela?.cliente?.nombre || '(sin cliente)';
  const tarifaCod = pasarela?.tarifa_codigo || '-';
  const tarifaValor = formatCurrency(pasarela?.precio_lay);

  const progress = (secondsLeft / TOTAL_SECONDS) * 100;
  const timerColor = secondsLeft > 60 ? 'success' : secondsLeft > 30 ? 'warning' : 'error';

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        handleNoExito();
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HourglassBottomIcon color={timerColor} />
        Enviar a Trámites Finalizados
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              fontWeight={700}
              color={`${timerColor}.main`}
              sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}
            >
              {formatTime(secondsLeft)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tiempo restante para confirmar el resultado del pago
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={timerColor}
              sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Resumen de la pasarela
              </Typography>
            </Box>
            <Stack divider={<Divider />}>
              {[
                { icon: <ReceiptLongIcon sx={{ fontSize: 16 }} color="action" />, label: 'Pasarela', value: `#${pasarela?.id ?? '-'}` },
                { icon: <PersonIcon sx={{ fontSize: 16 }} color="action" />, label: 'Cliente', value: clienteNombre },
                { icon: <DirectionsCarIcon sx={{ fontSize: 16 }} color="action" />, label: 'Placa', value: placa, mono: true },
                { icon: <LocalOfferIcon sx={{ fontSize: 16 }} color="action" />, label: 'Tarifa', chip: tarifaCod },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '20px 80px 1fr',
                    alignItems: 'center',
                    px: 1.5,
                    py: 0.6,
                    gap: 1,
                  }}
                >
                  {row.icon}
                  <Typography variant="caption" color="text.secondary">
                    {row.label}
                  </Typography>
                  {row.chip ? (
                    <Box>
                      <Chip
                        label={row.chip}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={row.mono ? { fontFamily: 'monospace', letterSpacing: 1 } : undefined}
                    >
                      {row.value}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              border: '3px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
              bgcolor: 'primary.50',
              textAlign: 'center',
              boxShadow: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                display: 'block',
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                mb: 1,
              }}
            >
              Valor a cobrar
            </Typography>
            <Typography
              fontWeight={900}
              color="primary.main"
              sx={{
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem' },
                letterSpacing: 1,
              }}
            >
              {tarifaValor}
            </Typography>
          </Box>

          <TextField
            select
            label="Tarjeta utilizada (opcional)"
            value={tarjetaId}
            onChange={(e) => setTarjetaId(e.target.value)}
            fullWidth
            helperText={tarjetas.length === 0 ? 'No hay tarjetas registradas' : 'Selecciona la tarjeta con la que se realizó el pago'}
            InputProps={{
              startAdornment: (
                <Box sx={{ pr: 1, color: 'action.active', display: 'flex' }}>
                  <CreditCardIcon fontSize="small" />
                </Box>
              ),
            }}
          >
            <MenuItem value="">
              <em>Sin especificar</em>
            </MenuItem>
            {tarjetas.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {t.numero}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    — {t.titular}
                  </Typography>
                  {t.cuatro_por_mil === '1' && (
                    <Chip label="4×1000" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  )}
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observación (opcional)"
            placeholder="Notas sobre el pago, número de aprobación, banco, etc."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            inputProps={{ maxLength: 500 }}
            helperText={`${observacion.length}/500 — campo opcional`}
            InputProps={{
              startAdornment: (
                <Box sx={{ alignSelf: 'flex-start', pt: 1, pr: 1, color: 'action.active' }}>
                  <NotesIcon fontSize="small" />
                </Box>
              ),
            }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Solo si marcas <strong>Pago exitoso</strong> la pasarela pasará a Trámites Finalizados.
            Si marcas <strong>No éxito</strong> o el tiempo se agota, la pasarela queda igual.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleNoExito}
          color="error"
          variant="outlined"
          startIcon={<CancelIcon />}
          fullWidth
        >
          No éxito
        </Button>
        <Button
          onClick={handleExitoso}
          color="success"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          fullWidth
        >
          Pago exitoso
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinalizadosTimerDialog;
