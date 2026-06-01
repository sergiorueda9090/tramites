import React from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Typography, Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const formatCOP = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(v || 0));

// Map del tipo a color MUI semantico.
const TIPO_COLOR = {
  activo:     'success',
  pasivo:     'error',
  patrimonio: 'secondary',
  ingreso:    'success',
  gasto:      'warning',
};

const TableLoadingSkeleton = ({ rows = 6, columns = 7 }) => (
  <Box sx={{ width: '100%' }}>
    {[...Array(rows)].map((_, rowIndex) => (
      <Box
        key={rowIndex}
        sx={{
          display: 'flex', gap: 2, p: 2,
          borderBottom: '1px solid', borderColor: 'divider',
        }}
      >
        {[...Array(columns)].map((_, colIndex) => (
          <Box
            key={colIndex}
            sx={{
              flex: 1, height: 20, bgcolor: 'action.hover', borderRadius: 1,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%':   { opacity: 1 },
                '50%':  { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

const BalanceTable = ({
  rows = [],
  loading = false,
  onOpenMovimientos,
  emptyMessage = 'No se encontraron sub-cuentas con los filtros aplicados',
  stickyHeader = true,
  maxHeight = 600,
}) => {
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableLoadingSkeleton rows={6} columns={7} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>Cuenta PUC</TableCell>
              <TableCell sx={headerSx}>Sub-cuenta</TableCell>
              <TableCell sx={headerSx}>Tipo</TableCell>
              <TableCell sx={headerSx} align="right">Debito total</TableCell>
              <TableCell sx={headerSx} align="right">Credito total</TableCell>
              <TableCell sx={headerSx} align="right">Acumulado</TableCell>
              <TableCell sx={headerSx} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const acumulado = Number(r.acumulado || 0);
                const negativo = acumulado < 0;
                return (
                  <TableRow
                    hover
                    key={r.sub_cuenta}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.cuenta_codigo_puc || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {r.cuenta_nombre || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.codigo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {r.nombre_sub_cuenta}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.cuenta_tipo_display || r.cuenta_tipo || '-'}
                        color={TIPO_COLOR[r.cuenta_tipo] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                        {formatCOP(r.debito_total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 500 }}>
                        {formatCOP(r.credito_total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: negativo ? 'error.main' : 'text.primary',
                        }}
                      >
                        {formatCOP(acumulado)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver movimientos">
                        <IconButton size="small" onClick={() => onOpenMovimientos(r)} color="info">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const headerSx = {
  fontWeight: 600,
  bgcolor: 'background.paper',
};

export default BalanceTable;
