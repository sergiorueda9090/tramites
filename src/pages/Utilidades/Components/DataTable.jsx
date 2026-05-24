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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
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
// Columnas del listado de Utilidades
// (los 6 campos del reporte: fecha, placa, comisión proveedor,
// cilindraje, modelo, N° chasis)
// ============================================
const columns = [
  {
    field: 'fecha',
    headerName: 'Fecha',
    minWidth: 160,
    renderCell: ({ value }) => formatDateTime(value),
  },
  {
    field: 'placa',
    headerName: 'Placa',
    minWidth: 110,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'comision_proveedor',
    headerName: 'Comisión proveedor',
    minWidth: 160,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} color="success.main">
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'cilindraje',
    headerName: 'Cilindraje',
    minWidth: 110,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'modelo',
    headerName: 'Modelo',
    minWidth: 100,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'chasis',
    headerName: 'N° Chasis',
    minWidth: 180,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'debito',
    headerName: 'Débito',
    minWidth: 120,
    align: 'right',
    renderCell: ({ value }) => {
      const num = parseFloat(value) || 0;
      return (
        <Typography variant="body2" fontWeight={500} color="primary.main">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)}
        </Typography>
      );
    },
  },
  {
    field: 'credito',
    headerName: 'Crédito',
    minWidth: 120,
    align: 'right',
    renderCell: ({ value }) => {
      const num = parseFloat(value) || 0;
      return (
        <Typography variant="body2" fontWeight={500} color="secondary.main">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)}
        </Typography>
      );
    },
  },
  {
    field: 'sub_cuenta',
    headerName: 'Sub-cuenta',
    minWidth: 200,
    sortable: false,
    renderCell: ({ row }) => {
      if (!row.sub_cuenta_codigo && !row.sub_cuenta_nombre) return '-';
      return (
        <Box>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {row.sub_cuenta_codigo || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.sub_cuenta_nombre || '-'}
          </Typography>
        </Box>
      );
    },
  },
];

// ============================================
// UtilidadesDataTable (read-only + soft-delete opcional)
// ============================================
const UtilidadesDataTable = ({
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
  onDelete,
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

  const hasRowActions = Boolean(onView || onDelete);

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableLoadingSkeleton
          rows={5}
          columns={columns.length + (showActions && hasRowActions ? 1 : 0)}
        />
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
              {showActions && hasRowActions && (
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
                  colSpan={columns.length + (showActions && hasRowActions ? 1 : 0)}
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
                  {showActions && hasRowActions && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {onView && (
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => onView(row)} color="info">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => onDelete(row)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
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
export default UtilidadesDataTable;
