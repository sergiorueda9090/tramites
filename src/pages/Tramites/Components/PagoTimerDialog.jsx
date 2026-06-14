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
  IconButton,
  Tooltip,
  Link as MuiLink,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NotesIcon from '@mui/icons-material/Notes';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
 * Modal con cuenta regresiva de 3 minutos previa al envío a Pasarela de Pago.
 * El usuario debe indicar si el pago fue exitoso o no.
 *
 * Props:
 *  - open: boolean
 *  - tramite: objeto del trámite (para mostrar resumen)
 *  - onResult: (boolean) => void  // true = pago exitoso, false = no éxito / timeout
 */
const PagoTimerDialog = ({ open, tramite, tarjetas = [], onResult }) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [observacion, setObservacion] = useState('');
  const [tarjetaId, setTarjetaId] = useState('');
  // Comprobante de pago (imagen). OBLIGATORIO para habilitar "Pago exitoso".
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);
  const onResultRef = useRef(onResult);
  const observacionRef = useRef('');
  const tarjetaIdRef = useRef('');
  // Mantener la referencia más reciente al callback / observación / tarjeta sin reiniciar el timer.
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { observacionRef.current = observacion; }, [observacion]);
  useEffect(() => { tarjetaIdRef.current = tarjetaId; }, [tarjetaId]);

  // Asignar/quitar la imagen del comprobante (solo imágenes).
  const setArchivo = (file) => {
    if (!file || !file.type?.startsWith('image/')) return;
    setComprobante(file);
    setComprobantePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };
  const quitarArchivo = () => {
    setComprobante(null);
    setComprobantePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  };

  // Pegar imagen con Ctrl+V mientras el modal está abierto.
  useEffect(() => {
    if (!open) return undefined;
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].type?.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setArchivo(file);
            e.preventDefault();
            break;
          }
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    setSecondsLeft(TOTAL_SECONDS);
    setObservacion('');
    setTarjetaId('');
    setComprobante(null);
    setComprobantePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // Timeout = considerar como "no éxito"; conserva lo que el usuario alcanzó a ingresar.
          onResultRef.current?.(false, observacionRef.current.trim(), tarjetaIdRef.current || null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [open]);

  const handleExitoso = () => {
    clearInterval(intervalRef.current);
    onResult?.(true, observacion.trim(), tarjetaId || null, comprobante);
  };

  const handleNoExito = () => {
    clearInterval(intervalRef.current);
    onResult?.(false, observacion.trim(), tarjetaId || null);
  };

  const placa = tramite?.placa || '(sin placa)';
  const clienteNombre = tramite?.cliente?.nombre || '(sin cliente)';
  const tarifaCod = tramite?.tarifa_codigo || '-';
  const tarifaValor = formatCurrency(tramite?.precio_lay);

  // Link de pago generado automáticamente (job asíncrono). El cajero lo usa
  // para procesar el pago en la pasarela externa.
  const linkPago = tramite?.link_pago?.url_pago || '';
  const linkProveedor = tramite?.link_pago?.proveedor || '';
  const [linkCopiado, setLinkCopiado] = useState(false);
  const handleCopyLink = () => {
    if (!linkPago) return;
    navigator.clipboard.writeText(linkPago);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 1500);
  };

  const progress = (secondsLeft / TOTAL_SECONDS) * 100;
  // Color del cronómetro: verde > 60s, amarillo 30-60s, rojo < 30s.
  const timerColor = secondsLeft > 60 ? 'success' : secondsLeft > 30 ? 'warning' : 'error';

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      // No permitir cerrar haciendo clic fuera: el usuario debe elegir explícitamente.
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        handleNoExito();
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HourglassBottomIcon color={timerColor} />
        Esperando confirmación del pago
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

          {/* Placa destacada: tipografía grande para que el cajero la lea sin
              equivocarse al digitarla en la pasarela. */}
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              border: '2px solid',
              borderColor: 'info.main',
              borderRadius: 2,
              bgcolor: 'info.50',
              backgroundColor: 'rgba(2, 136, 209, 0.06)',
              textAlign: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <DirectionsCarIcon sx={{ fontSize: 20, color: 'info.main' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'info.main',
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                Placa
              </Typography>
            </Box>
            <Typography
              fontWeight={900}
              sx={{
                fontFamily: 'monospace',
                color: 'info.dark',
                lineHeight: 1,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                letterSpacing: { xs: 2, sm: 4 },
              }}
            >
              {placa}
            </Typography>
          </Box>

          {/* Link de pago: lo que el cajero abre/copia para procesar el pago. */}
          {linkPago ? (
            <Box
              sx={{
                p: 1.5,
                border: '2px solid',
                borderColor: 'success.main',
                borderRadius: 2,
                backgroundColor: 'rgba(46, 125, 50, 0.06)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <LinkIcon sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography
                  variant="caption"
                  sx={{ color: 'success.main', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}
                >
                  Link de pago{linkProveedor ? ` · ${linkProveedor}` : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MuiLink
                  href={linkPago}
                  target="_blank"
                  rel="noopener"
                  sx={{ flex: 1, wordBreak: 'break-all', fontSize: '0.8rem' }}
                >
                  {linkPago}
                </MuiLink>
                <Tooltip title={linkCopiado ? '¡Copiado!' : 'Copiar'}>
                  <IconButton size="small" color={linkCopiado ? 'success' : 'default'} onClick={handleCopyLink}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Abrir">
                  <IconButton size="small" component="a" href={linkPago} target="_blank" rel="noopener">
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 1.25, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Link de pago aún no disponible (generándose o falló su generación).
              </Typography>
            </Box>
          )}

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
                Resumen del trámite
              </Typography>
            </Box>
            <Stack divider={<Divider />}>
              {[
                { icon: <ReceiptLongIcon sx={{ fontSize: 16 }} color="action" />, label: 'Trámite', value: `#${tramite?.id ?? '-'}` },
                { icon: <PersonIcon sx={{ fontSize: 16 }} color="action" />, label: 'Cliente', value: clienteNombre },
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

          {/* Valor destacado: tipografía MUY grande para evitar errores de cobro. */}
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
              Valor a pagar en (PSE)
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
            {/* Aviso de validación: el cajero debe confirmar que la pasarela PSE
                muestra exactamente este mismo valor antes de continuar. */}
            <Box
              sx={{
                mt: 2,
                px: 1.5,
                py: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.main',
                backgroundColor: 'rgba(237, 108, 2, 0.10)',
              }}
            >
              <WarningAmberIcon sx={{ color: 'warning.dark', fontSize: 22, mt: 0.2 }} />
              <Typography
                variant="body2"
                sx={{ color: 'warning.dark', fontWeight: 700, textAlign: 'left' }}
              >
                Validar que el valor a pagar en PSE coincida con este valor a pagar.
              </Typography>
            </Box>
          </Box>

          {/* Selección de tarjeta usada para el pago (opcional). Lista todas las tarjetas
              registradas en el módulo /tarjetas. */}
          <TextField
            select
            required
            error={!tarjetaId}
            label="Tarjeta utilizada"
            value={tarjetaId}
            onChange={(e) => setTarjetaId(e.target.value)}
            fullWidth
            helperText={
              tarjetas.length === 0
                ? 'No hay tarjetas registradas'
                : !tarjetaId
                  ? 'Obligatorio para marcar el pago como exitoso'
                  : 'Selecciona la tarjeta con la que se realizó el pago'
            }
            InputProps={{
              startAdornment: (
                <Box sx={{ pr: 1, color: 'action.active', display: 'flex' }}>
                  <CreditCardIcon fontSize="small" />
                </Box>
              ),
            }}
          >
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

          {/* Observación opcional: el usuario puede dejar vacío. */}
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

          {/* Comprobante de pago (OBLIGATORIO para "Pago exitoso"): arrastrar o pegar (Ctrl+V). */}
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: comprobante ? 'success.main' : 'error.main' }}
            >
              {comprobante ? 'Comprobante de pago ✓' : 'Comprobante de pago (obligatorio para “Pago exitoso”)'}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setArchivo(f);
                e.target.value = '';
              }}
            />
            {comprobantePreview ? (
              <Box
                sx={{
                  mt: 0.5,
                  p: 1,
                  border: '2px solid',
                  borderColor: 'success.main',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  backgroundColor: 'rgba(46,125,50,0.06)',
                }}
              >
                <Box
                  component="img"
                  src={comprobantePreview}
                  alt="Comprobante de pago"
                  sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {comprobante?.name || 'comprobante'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comprobante ? `${Math.round(comprobante.size / 1024)} KB` : ''}
                  </Typography>
                </Box>
                <Tooltip title="Quitar">
                  <IconButton size="small" color="error" onClick={quitarArchivo}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setArchivo(f);
                }}
                sx={{
                  mt: 0.5,
                  p: 2,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  backgroundColor: dragOver ? 'rgba(25,118,210,0.08)' : 'transparent',
                  transition: 'all .15s',
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 32, color: dragOver ? 'primary.main' : 'action.active' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Arrastra la imagen aquí, pégala con Ctrl+V, o haz click para elegir
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Solo imágenes (captura/foto del comprobante de pago)
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Realiza el pago en la pasarela externa. Cuando termines, indica si fue
            exitoso o no. Si el tiempo se agota, se considerará como <strong>no exitoso</strong>.
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
          disabled={!tarjetaId || !comprobante}
        >
          Pago exitoso
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PagoTimerDialog;
