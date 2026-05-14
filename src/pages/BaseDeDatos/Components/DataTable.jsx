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
import SendIcon from '@mui/icons-material/Send';
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
// BaseDeDatos Columns Configuration
// ============================================
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'placa',
    headerName: 'Placa',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'nombre_completo',
    headerName: 'Titular',
    minWidth: 180,
    renderCell: ({ row }) => (
      <Box>
        <Typography variant="body2">{row.nombre_completo || '-'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.numero_documento || ''}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'marca',
    headerName: 'Vehículo',
    minWidth: 160,
    renderCell: ({ row }) => (
      <Box>
        <Typography variant="body2">{row.marca || '-'} {row.linea || ''}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.modelo || ''}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'clase',
    headerName: 'Clase',
    minWidth: 120,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'tipo_servicio',
    headerName: 'Servicio',
    minWidth: 120,
    renderCell: ({ value }) => value || '-',
  },
  {
    field: 'tipo_tramite',
    headerName: 'Trámite',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Chip label={value || '-'} size="small" color="primary" variant="outlined" />
    ),
  },
  {
    field: 'tipo_vehiculo',
    headerName: 'Tipo',
    minWidth: 110,
    renderCell: ({ value }) => (
      <Chip
        label={value === 'CERO_KM' ? '0 KM' : value || '-'}
        size="small"
        color={value === 'CERO_KM' ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'es_propietario',
    headerName: 'Propietario',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Chip
        label={value ? 'Sí' : 'No'}
        size="small"
        color={value ? 'success' : 'warning'}
      />
    ),
  },
  {
    field: 'created_at',
    headerName: 'Fecha registro',
    minWidth: 160,
    renderCell: ({ value }) => formatDateTime(value),
  },
  {
    field: 'usuario',
    headerName: 'Registrado por',
    minWidth: 150,
    renderCell: ({ row }) => row.usuario?.name || '-',
  },
];

// ============================================
// BaseDeDatosDataTable Component
// ============================================
const BaseDeDatosDataTable = ({
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
  onEnviarATramites,
  emptyMessage = 'No se encontraron registros',
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
              {showActions && (onView || onEdit || onDelete || onEnviarATramites) && (
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
                  {showActions && (onView || onEdit || onDelete || onEnviarATramites) && (
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
                        {onEnviarATramites && (
                          <Tooltip title="Enviar a Trámites">
                            <IconButton size="small" onClick={() => onEnviarATramites(row)} color="success">
                              <SendIcon fontSize="small" />
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
export default BaseDeDatosDataTable;
