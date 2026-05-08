import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Typography,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatDateTime, formatCurrency } from '../../../utils/helpers';
import Pagination from './Pagination';

// ============================================
// TableLoadingSkeleton
// ============================================
const TableLoadingSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {[...Array(rows)].map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <Box
              key={colIndex}
              sx={{
                flex: 1,
                height: 20,
                bgcolor: 'action.hover',
                borderRadius: 1,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

// ============================================
// Columnas del listado de 4x1000
// ============================================
const MODULO_COLOR = {
  recepcion_pago:        'primary',
  devoluciones:          'warning',
  gastos:                'error',
  cargos_no_registrados: 'default',
  utilidad_ocasional:    'success',
  pasarela_de_pago:      'info',
  finalizados_tramites:  'secondary',
};

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'modulo',
    headerName: 'Módulo origen',
    minWidth: 170,
    renderCell: ({ row }) => (
      <Chip
        label={row.modulo_display || row.modulo || '-'}
        size="small"
        color={MODULO_COLOR[row.modulo] || 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'registro_id',
    headerName: 'ID origen',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {value ?? '-'}
      </Typography>
    ),
  },
  {
    field: 'valor_base',
    headerName: 'Valor base',
    minWidth: 130,
    align: 'right',
    renderCell: ({ value }) => formatCurrency(value),
  },
  {
    field: 'valor',
    headerName: 'Valor 4x1000',
    minWidth: 130,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} color="error.main">
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'tarjeta',
    headerName: 'Tarjeta',
    minWidth: 180,
    sortable: false,
    renderCell: ({ row }) => {
      if (!row.tarjeta) return '-';
      const last4 = (row.tarjeta.numero || '').slice(-4);
      return (
        <Box>
          <Typography variant="body2">{row.tarjeta.titular || '-'}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            ····{last4}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'fecha',
    headerName: 'Fecha origen',
    minWidth: 160,
    renderCell: ({ value }) => formatDateTime(value),
  },
  {
    field: 'usuario_name',
    headerName: 'Registrado por',
    minWidth: 150,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'created_at',
    headerName: 'Creado',
    minWidth: 160,
    renderCell: ({ value }) => formatDateTime(value),
  },
];

// ============================================
// CuatroPorMilDataTable (read-only)
// ============================================
const CuatroPorMilDataTable = ({
  data,
  loading = false,
  page = 0,
  pageSize = 25,
  totalRows = 0,
  sortField = null,
  sortOrder = 'asc',
  onPageChange,
  onPageSizeChange,
  onSort,
  onView,
  emptyMessage = 'No se encontraron registros',
  stickyHeader = true,
  maxHeight = 600,
  showActions = true,
}) => {
  const renderCellContent = (column, row) => {
    const value = row[column.field];
    if (column.renderCell) return column.renderCell({ row, value });
    return value ?? '-';
  };

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableLoadingSkeleton rows={5} columns={columns.length + (showActions ? 1 : 0)} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    width: column.width,
                    fontWeight: 600,
                    bgcolor: 'background.paper',
                  }}
                  sortDirection={sortField === column.field ? sortOrder : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortField === column.field ? sortOrder : 'asc'}
                      onClick={() => onSort && onSort(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
              {showActions && onView && (
                <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions && onView ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align || 'left'}>
                      {renderCellContent(column, row)}
                    </TableCell>
                  ))}
                  {showActions && onView && (
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => onView(row)} color="info">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Paper>
  );
};

export { columns };
export default CuatroPorMilDataTable;
