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
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { formatDateTime } from '../../../utils/helpers';
import Pagination from './Pagination';

// ============================================
// TableLoadingSkeleton Component
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
// Tarjetas Columns Configuration
// ============================================
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'numero',
    headerName: 'Número de Tarjeta',
    minWidth: 180,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CreditCardIcon color="primary" fontSize="small" />
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          **** {row.numero?.slice(-4) || '----'}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'titular',
    headerName: 'Titular',
    minWidth: 180,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'descripcion',
    headerName: 'Descripción',
    minWidth: 200,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'cuatro_por_mil',
    headerName: '4x1000',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Chip
        label={value === '1' ? 'Activo' : 'Exento'}
        size="small"
        color={value === '1' ? 'warning' : 'success'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'usuario_name',
    headerName: 'Usuario Asociado',
    minWidth: 150,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'created_at',
    headerName: 'Fecha de Creación',
    minWidth: 180,
    renderCell: ({ value }) => formatDateTime(value),
  },
];

// ============================================
// TarjetasDataTable Component
// ============================================
const TarjetasDataTable = ({
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
  emptyMessage = 'No se encontraron tarjetas',
  stickyHeader = true,
  maxHeight = 600,
  showActions = true,
}) => {
  const renderCellContent = (column, row) => {
    const value = row[column.field];

    if (column.renderCell) {
      return column.renderCell({ row, value });
    }

    if (column.type === 'chip' && value) {
      return (
        <Chip
          label={value}
          size="small"
          color={column.getChipColor ? column.getChipColor(value) : 'default'}
        />
      );
    }

    if (column.type === 'boolean') {
      return (
        <Chip
          label={value ? 'Sí' : 'No'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      );
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
export default TarjetasDataTable;
