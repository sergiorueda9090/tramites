import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer, Box, Typography, IconButton, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, TextField, MenuItem, Tooltip, Button, Divider,
  Skeleton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BalanceIcon from '@mui/icons-material/Balance';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

import {
  selectDrawerOpen,
  selectSelectedSubCuenta,
  selectSaldo,
  selectLoadingSaldo,
  selectMovimientos,
  selectLoadingMovimientos,
  selectMovimientosPagination,
  selectMovimientosFilters,
  closeMovimientosDrawer,
  setMovimientosPage,
  setMovimientosPageSize,
  updateMovimientosFilter,
  applyMovimientosFilters,
  clearMovimientosFilters,
} from '../../../store/dashboardContableStore/dashboardContableStore';
import {
  loadSaldoThunk,
  loadMovimientosThunk,
  fetchAsientoThunk,
} from '../../../store/dashboardContableStore/dashboardContableThunks';

const formatCOP = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(v || 0));

const MODULOS = [
  { value: '',                       label: 'Todos los modulos' },
  { value: 'recepcion_pago',         label: 'Recepcion de pago' },
  { value: 'devoluciones',           label: 'Devoluciones' },
  { value: 'cargos_no_registrados',  label: 'Cargos no registrados' },
  { value: 'gastos',                 label: 'Gastos' },
  { value: 'utilidad_ocasional',     label: 'Utilidad ocasional' },
  { value: 'utilidades',             label: 'Utilidades' },
  { value: 'ajuste_de_saldo',        label: 'Ajuste de saldo' },
];

const MODULO_LABEL = MODULOS.reduce((acc, m) => { acc[m.value] = m.label; return acc; }, {});

const TIPOS = [
  { value: '',        label: 'Todos' },
  { value: 'debito',  label: 'Debito' },
  { value: 'credito', label: 'Credito' },
];

const MovimientosDrawer = () => {
  const dispatch = useDispatch();
  const open = useSelector(selectDrawerOpen);
  const sub = useSelector(selectSelectedSubCuenta);
  const saldo = useSelector(selectSaldo);
  const loadingSaldo = useSelector(selectLoadingSaldo);
  const movimientos = useSelector(selectMovimientos);
  const loadingMovs = useSelector(selectLoadingMovimientos);
  const pagination = useSelector(selectMovimientosPagination);
  const filters = useSelector(selectMovimientosFilters);

  useEffect(() => {
    if (open && sub?.sub_cuenta) {
      dispatch(loadSaldoThunk(sub.sub_cuenta));
      dispatch(loadMovimientosThunk(sub.sub_cuenta, { page: 1 }));
    }
  }, [open, sub?.sub_cuenta, dispatch]);

  if (!sub) return null;

  const handleClose = () => dispatch(closeMovimientosDrawer());
  const handleRefresh = () => {
    dispatch(loadSaldoThunk(sub.sub_cuenta));
    dispatch(loadMovimientosThunk(sub.sub_cuenta));
  };
  const handleApply = () => {
    dispatch(applyMovimientosFilters());
    dispatch(loadMovimientosThunk(sub.sub_cuenta, { page: 1 }));
  };
  const handleClear = () => {
    dispatch(clearMovimientosFilters());
    dispatch(loadMovimientosThunk(sub.sub_cuenta, { page: 1 }));
  };
  const handlePage = (_e, page) => {
    dispatch(setMovimientosPage(page));
    dispatch(loadMovimientosThunk(sub.sub_cuenta, { page }));
  };
  const handlePageSize = (e) => {
    const n = Number(e.target.value);
    dispatch(setMovimientosPageSize(n));
    dispatch(loadMovimientosThunk(sub.sub_cuenta, { page: 1, page_size: n }));
  };
  const handleVerAsiento = (asientoUuid) => {
    if (asientoUuid) dispatch(fetchAsientoThunk(asientoUuid));
  };

  const totalPages = Math.max(1, Math.ceil((pagination.count || 0) / pagination.pageSize));
  const acumulado = Number(saldo?.acumulado || 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: '90%', md: '75%', lg: '65%' } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
        {/* Header con gradient */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                  SUB-CUENTA
                </Typography>
                <Chip
                  size="small"
                  label={sub.cuenta_tipo_display || sub.cuenta_tipo}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {sub.codigo}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                {sub.nombre_sub_cuenta}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {sub.cuenta_codigo_puc} · {sub.cuenta_nombre}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Refrescar">
                <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Cards de saldo dentro del header */}
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <SaldoCard
              icon={<TrendingUpIcon />}
              label="Debito total"
              value={saldo?.debito_total}
              loading={loadingSaldo}
            />
            <SaldoCard
              icon={<TrendingDownIcon />}
              label="Credito total"
              value={saldo?.credito_total}
              loading={loadingSaldo}
            />
            <SaldoCard
              icon={<BalanceIcon />}
              label="Acumulado"
              value={saldo?.acumulado}
              loading={loadingSaldo}
              emphasized
              negative={acumulado < 0}
            />
          </Box>
        </Box>

        {/* Filtros */}
        <Paper square sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <FilterListIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>Filtros de movimientos</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select size="small" label="Modulo origen" sx={{ minWidth: 200 }}
              value={filters.modulo_origen}
              onChange={(e) => dispatch(updateMovimientosFilter({ field: 'modulo_origen', value: e.target.value }))}
            >
              {MODULOS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>
            <TextField
              select size="small" label="Tipo" sx={{ minWidth: 150 }}
              value={filters.tipo_movimiento}
              onChange={(e) => dispatch(updateMovimientosFilter({ field: 'tipo_movimiento', value: e.target.value }))}
            >
              {TIPOS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField
              type="date" size="small" label="Desde" InputLabelProps={{ shrink: true }}
              value={filters.fecha_start}
              onChange={(e) => dispatch(updateMovimientosFilter({ field: 'fecha_start', value: e.target.value }))}
            />
            <TextField
              type="date" size="small" label="Hasta" InputLabelProps={{ shrink: true }}
              value={filters.fecha_end}
              onChange={(e) => dispatch(updateMovimientosFilter({ field: 'fecha_end', value: e.target.value }))}
            />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button size="small" variant="outlined" onClick={handleClear} startIcon={<ClearIcon />}>
                Limpiar
              </Button>
              <Button size="small" variant="contained" onClick={handleApply}>
                Aplicar
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Tabla de movimientos */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 460px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerSx}>Fecha</TableCell>
                    <TableCell sx={headerSx}>Modulo</TableCell>
                    <TableCell sx={headerSx} align="right">Origen #</TableCell>
                    <TableCell sx={headerSx}>Tipo</TableCell>
                    <TableCell sx={headerSx} align="right">Valor</TableCell>
                    <TableCell sx={headerSx}>Descripcion</TableCell>
                    <TableCell sx={headerSx} align="center">Asiento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingMovs ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        <TableCell colSpan={7}>
                          <Skeleton variant="rectangular" height={28} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : movimientos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          No hay movimientos para esta sub-cuenta con los filtros aplicados.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimientos.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>
                          <Typography variant="caption">
                            {m.fecha
                              ? new Date(m.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={MODULO_LABEL[m.modulo_origen] || m.modulo_origen} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            #{m.origen_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={m.tipo_movimiento_display || m.tipo_movimiento}
                            color={m.tipo_movimiento === 'debito' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: m.tipo_movimiento === 'debito' ? 'primary.main' : 'secondary.main',
                            }}
                          >
                            {formatCOP(m.valor)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'inline-block' }}>
                            {m.descripcion || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver asiento (debito + credito)">
                            <IconButton size="small" color="info" onClick={() => handleVerAsiento(m.asiento_id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Paginacion */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="caption" color="text.secondary">
            {pagination.count} movimientos
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select size="small" label="Por pagina"
              value={pagination.pageSize}
              onChange={handlePageSize}
              sx={{ width: 110 }}
            >
              {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
            <Pagination
              count={totalPages}
              page={pagination.page}
              onChange={handlePage}
              size="small"
              color="primary"
            />
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

const SaldoCard = ({ icon, label, value, loading, emphasized = false, negative = false }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1.5,
      bgcolor: emphasized ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
      border: emphasized ? '1.5px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
    }}
  >
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5, color: 'rgba(255,255,255,0.85)' }}>
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 500, letterSpacing: 0.4 }}>
        {label}
      </Typography>
    </Stack>
    {loading ? (
      <Skeleton variant="text" width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
    ) : (
      <Typography
        variant="h6"
        sx={{
          fontWeight: emphasized ? 700 : 500,
          color: negative ? '#ffcdd2' : 'white',
        }}
      >
        {formatCOP(value)}
      </Typography>
    )}
  </Box>
);

const headerSx = {
  fontWeight: 600,
  bgcolor: 'background.paper',
};

export default MovimientosDrawer;
