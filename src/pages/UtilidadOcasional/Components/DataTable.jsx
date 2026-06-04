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
import EditIcon from '@mui/icons-material/Edit';
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
// Columnas del listado de Utilidad Ocasional
// ============================================
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'tarjeta',
    headerName: 'Tarjeta',
    minWidth: 220,
    sortable: false,
    renderCell: ({ row }) => {
      const tarjeta = row.tarjeta;
      if (!tarjeta) return '-';
      const aplica4x1000 = tarjeta.cuatro_por_mil === '1';
      return (
        <Box>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            **** {(tarjeta.numero || '').slice(-4)}
            {aplica4x1000 && (
              <Chip
                label="4x1000"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ ml: 1, height: 18, '& .MuiChip-label': { px: 0.75, fontSize: '0.65rem' } }}
              />
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {tarjeta.titular || ''}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'tipo',
    headerName: 'Tipo',
    minWidth: 110,
    renderCell: ({ row }) => {
      const esPerdida = row.tipo === 'perdida';
      return (
        <Chip
          label={row.tipo_display || (esPerdida ? 'Pérdida' : 'Ganancia')}
          size="small"
          color={esPerdida ? 'error' : 'success'}
          variant="outlined"
        />
      );
    },
  },
  {
    field: 'valor',
    headerName: 'Valor',
    minWidth: 130,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={500}>
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'cuatro_por_mil',
    headerName: '4x1000',
    minWidth: 110,
    align: 'right',
    renderCell: ({ value }) => (
      <Chip
        label={formatCurrency(value)}
        size="small"
        color={parseFloat(value) > 0 ? 'warning' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'total',
    headerName: 'Total',
    minWidth: 130,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} color="primary">
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'debito',
    headerName: 'Débito',
    minWidth: 120,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={500} color="primary.main">
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'credito',
    headerName: 'Crédito',
    minWidth: 120,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={500} color="secondary.main">
        {formatCurrency(value)}
      </Typography>
    ),
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
  {
    field: 'fecha',
    headerName: 'Fecha',
    minWidth: 160,
    renderCell: ({ value }) => formatDateTime(value),
  },
  {
    field: 'observacion',
    headerName: 'Observación',
    minWidth: 180,
    sortable: false,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ maxWidth: 240 }} noWrap title={value || ''}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'usuario',
    headerName: 'Registrado por',
    minWidth: 150,
    sortable: false,
    renderCell: ({ row }) => row.usuario?.name || '-',
  },
];

// ============================================
// UtilidadOcasionalDataTable
// ============================================
const UtilidadOcasionalDataTable = ({
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
  onEdit,
  onDelete,
  emptyMessage = 'No se encontraron utilidades ocasionales',
  stickyHeader = true,
  maxHeight = 600,
  showActions = true,
}) => {
  const renderCellContent = (column, row) => {
    const value = row[column.field];
    if (column.renderCell) return column.renderCell({ row, value });
    return value ?? '-';
  };

  const hasRowActions = Boolean(onView || onEdit || onDelete);

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
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEdit(row)} color="primary">
                              <EditIcon fontSize="small" />
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
export default UtilidadOcasionalDataTable;
