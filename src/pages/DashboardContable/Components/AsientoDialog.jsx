import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Chip, Stack, Divider, Paper, Skeleton, IconButton, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import {
  selectAsientoDialogOpen,
  selectAsientoLoading,
  selectAsientoData,
  closeAsientoDialog,
} from '../../../store/dashboardContableStore/dashboardContableStore';

const formatCOP = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(v || 0));

const MODULO_LABEL = {
  recepcion_pago:        'Recepcion de pago',
  devoluciones:          'Devoluciones',
  cargos_no_registrados: 'Cargos no registrados',
  gastos:                'Gastos',
  utilidad_ocasional:    'Utilidad ocasional',
  utilidades:            'Utilidades',
  ajuste_de_saldo:       'Ajuste de saldo',
};

const AsientoDialog = () => {
  const dispatch = useDispatch();
  const open = useSelector(selectAsientoDialogOpen);
  const loading = useSelector(selectAsientoLoading);
  const data = useSelector(selectAsientoData);

  const handleClose = () => dispatch(closeAsientoDialog());

  const debito  = data?.movimientos?.find((m) => m.tipo_movimiento === 'debito');
  const credito = data?.movimientos?.find((m) => m.tipo_movimiento === 'credito');
  const valor   = debito?.valor || credito?.valor || 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SwapHorizIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Asiento contable (Partida doble)
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={120} />
          </Stack>
        ) : !data ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No se pudo cargar el asiento.
          </Typography>
        ) : (
          <Box>
            {/* Resumen */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">UUID del asiento</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {data.asiento_id}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Valor del asiento</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatCOP(valor)}
                  </Typography>
                </Box>
              </Stack>
              {debito?.modulo_origen && (
                <Box sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    label={`Origen: ${MODULO_LABEL[debito.modulo_origen] || debito.modulo_origen} #${debito.origen_id}`}
                    variant="outlined"
                  />
                </Box>
              )}
            </Paper>

            {/* Lado debito y credito */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' }, gap: 2, alignItems: 'stretch' }}>
              <LadoCard
                tipo="debito"
                color="#1976d2"
                bg="#e3f2fd"
                icon={<TrendingUpIcon />}
                mov={debito}
              />
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: '50%', bgcolor: 'action.selected',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <SwapHorizIcon color="action" />
                </Box>
              </Box>
              <LadoCard
                tipo="credito"
                color="#9c27b0"
                bg="#f3e5f5"
                icon={<TrendingDownIcon />}
                mov={credito}
              />
            </Box>

            {/* Descripcion */}
            {(debito?.descripcion || credito?.descripcion) && (
              <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  DESCRIPCION
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {debito?.descripcion || credito?.descripcion}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

const LadoCard = ({ tipo, color, bg, icon, mov }) => {
  if (!mov) {
    return (
      <Paper variant="outlined" sx={{ p: 2, opacity: 0.5 }}>
        <Typography variant="caption">Sin {tipo}</Typography>
      </Paper>
    );
  }
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: color,
        borderWidth: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: color,
        }}
      />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, mt: 0.5 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '50%', bgcolor: bg,
            color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Chip
          label={tipo === 'debito' ? 'DEBITO' : 'CREDITO'}
          sx={{ bgcolor: color, color: 'white', fontWeight: 700 }}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary">Sub-cuenta</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
        {mov.sub_cuenta_codigo}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {mov.sub_cuenta_nombre}
      </Typography>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="caption" color="text.secondary">Valor</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color }}>
        {formatCOP(mov.valor)}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        {mov.fecha ? new Date(mov.fecha).toLocaleString('es-CO') : ''}
      </Typography>
    </Paper>
  );
};

export default AsientoDialog;
