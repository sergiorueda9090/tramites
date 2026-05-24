import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SpeedIcon from '@mui/icons-material/Speed';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import {
  selectApiMetrics,
  selectApiMetricsResumen,
  clearMetrics,
} from '../../../store/apiMetricsStore/apiMetricsStore';

// Color del chip de duracion segun rango: verde rapido, amarillo moderado, rojo lento.
const colorDuracion = (ms) => {
  if (ms < 500) return 'success';
  if (ms < 2000) return 'warning';
  return 'error';
};

// Color del chip de status HTTP.
const colorStatus = (status) => {
  if (status === 0) return 'default';
  if (status >= 500) return 'error';
  if (status >= 400) return 'warning';
  if (status >= 200 && status < 300) return 'success';
  return 'default';
};

// Recorta la URL para mostrar solo el path. Si es URL absoluta de otro host,
// muestra el host como prefijo en gris.
const formatUrl = (url, baseURL) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    try {
      const u = new URL(url);
      return { host: u.host, path: u.pathname + u.search };
    } catch (_) {
      return { host: '', path: url };
    }
  }
  // URL relativa: muestra solo el path con un host derivado del baseURL si existe
  let host = '';
  if (baseURL) {
    try {
      host = new URL(baseURL).host;
    } catch (_) {
      host = '';
    }
  }
  return { host, path: url };
};

const formatTimestamp = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-CO', { hour12: false });
};

const StatCard = ({ label, value, unit = 'ms', color = 'text.primary' }) => (
  <Paper variant="outlined" sx={{ p: 1.2, flex: 1, minWidth: 110 }}>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1.1 }}>
      {value}
      {unit && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>{unit}</Typography>}
    </Typography>
  </Paper>
);

const ApiMetricsPanel = () => {
  const dispatch = useDispatch();
  const metrics = useSelector(selectApiMetrics);
  const resumen = useSelector(selectApiMetricsResumen);

  return (
    <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <SpeedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Tiempos de respuesta de APIs
          </Typography>
          {resumen.count > 0 && (
            <>
              <Chip
                label={`${resumen.count} call${resumen.count === 1 ? '' : 's'}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
              <Chip
                label={`prom: ${resumen.avg} ms`}
                size="small"
                color={colorDuracion(resumen.avg)}
                variant="outlined"
              />
              {resumen.errores > 0 && (
                <Chip
                  label={`${resumen.errores} error${resumen.errores === 1 ? '' : 'es'}`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {metrics.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Aun no se han registrado llamadas. Interactua con los pasos del cotizador para ver las metricas.
          </Typography>
        ) : (
          <>
            {/* Resumen */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <StatCard label="Total" value={resumen.count} unit="" color="primary.main" />
              <StatCard label="Promedio" value={resumen.avg} color={`${colorDuracion(resumen.avg)}.main`} />
              <StatCard label="Min" value={resumen.min} color="success.main" />
              <StatCard label="Max" value={resumen.max} color={`${colorDuracion(resumen.max)}.main`} />
              <StatCard label="Errores" value={resumen.errores} unit="" color={resumen.errores > 0 ? 'error.main' : 'text.primary'} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  size="small"
                  startIcon={<ClearAllIcon />}
                  onClick={() => dispatch(clearMetrics())}
                  variant="outlined"
                  color="error"
                >
                  Limpiar
                </Button>
              </Box>
            </Box>

            {/* Tabla */}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Metodo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Duracion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.map((m) => {
                    const { host, path } = formatUrl(m.url, m.baseURL);
                    return (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {formatTimestamp(m.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={m.method}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {host && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                              {host}
                            </Typography>
                          )}
                          <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            {path}
                          </Typography>
                          {m.error && (
                            <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                              {m.error}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={m.status === 0 ? 'ERR' : m.status}
                            size="small"
                            color={colorStatus(m.status)}
                            variant="filled"
                            sx={{ fontWeight: 600, minWidth: 50 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${m.duration_ms} ms`}
                            size="small"
                            color={colorDuracion(m.duration_ms)}
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Leyenda */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">Velocidad:</Typography>
              <Chip label="< 500 ms (rapida)" size="small" color="success" variant="outlined" />
              <Chip label="500-2000 ms (moderada)" size="small" color="warning" variant="outlined" />
              <Chip label="> 2000 ms (lenta)" size="small" color="error" variant="outlined" />
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ApiMetricsPanel;
