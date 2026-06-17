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
import LockIcon from '@mui/icons-material/Lock';
import { formatDateTime } from '../../../utils/helpers';
import Pagination from './Pagination';

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

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  {
    field: 'nombre',
    headerName: 'Nombre',
    minWidth: 200,
    renderCell: ({ row, value }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: row.color || '#1976d2',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" fontWeight={500}>
          {value || '-'}
        </Typography>
        {row.protegido && (
          <Tooltip title="Proveedor del sistema: no se puede editar ni eliminar">
            <Chip
              icon={<LockIcon sx={{ fontSize: 14 }} />}
              label="Sistema"
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Tooltip>
        )}
      </Box>
    ),
  },
  {
    field: 'sub_cuenta',
    headerName: 'Sub-cuenta',
    minWidth: 260,
    sortable: false,
    renderCell: ({ row }) => {
      if (!row.sub_cuenta_codigo && !row.sub_cuenta_nombre) return '-';
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

const ProveedoresDataTable = ({
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
  emptyMessage = 'No se encontraron proveedores',
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
                        {row.protegido ? (
                          <Tooltip title="Proveedor del sistema: no se puede editar ni eliminar">
                            <span>
                              <IconButton size="small" disabled>
                                <LockIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <>
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
                          </>
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
export default ProveedoresDataTable;
