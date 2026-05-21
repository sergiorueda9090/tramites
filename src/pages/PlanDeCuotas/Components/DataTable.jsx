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
import { formatDateTime } from '../../../utils/helpers';
import Pagination from './Pagination';
import {
  TIPO_CUENTA_LABELS,
  TIPO_CUENTA_COLORS,
  ACUMULADO_LABELS,
} from '../../../store/planDeCuotasStore/planDeCuotasStore';

// ============================================
// TableLoadingSkeleton Component
// ============================================
const TableLoadingSkeleton = ({ rows = 5, columns = 5 }) => (
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

// ============================================
// Plan de Cuentas Columns Configuration
// ============================================
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'codigo_puc',
    headerName: 'Código PUC',
    minWidth: 120,
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'tipo',
    headerName: 'Tipo',
    minWidth: 140,
    renderCell: ({ row }) => {
      const label = row.tipo_display || TIPO_CUENTA_LABELS[row.tipo] || row.tipo || '-';
      const color = TIPO_CUENTA_COLORS[row.tipo] || 'default';
      return (
        <Chip
          label={label}
          size="small"
          color={color}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      );
    },
  },
  {
    field: 'nombre_cuenta',
    headerName: 'Nombre de cuenta',
    minWidth: 280,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'acumulado',
    headerName: 'Acumulado',
    minWidth: 200,
    renderCell: ({ row }) => {
      const label = row.acumulado_display || ACUMULADO_LABELS[row.acumulado] || row.acumulado || '-';
      return (
        <Chip
          label={label}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      );
    },
  },
  {
    field: 'user_name',
    headerName: 'Creado por',
    minWidth: 150,
    sortable: false,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'created_at',
    headerName: 'Fecha de creación',
    minWidth: 180,
    renderCell: ({ value }) => formatDateTime(value),
  },
];

// ============================================
// PlanDeCuentasDataTable Component
// ============================================
const PlanDeCuentasDataTable = ({
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
  emptyMessage = 'No se encontraron cuentas',
  stickyHeader = true,
  maxHeight = 600,
  showActions = true,
}) => {
  const renderCellContent = (column, row) => {
    const value = row[column.field];
    if (column.renderCell) {
      return column.renderCell({ row, value });
    }
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
      <TableContainer sx={{ maxHeight: maxHeight }}>
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
              {showActions && (onView || onEdit || onDelete) && (
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
                  colSpan={columns.length + (showActions ? 1 : 0)}
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
                  {showActions && (onView || onEdit || onDelete) && (
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
export default PlanDeCuentasDataTable;
