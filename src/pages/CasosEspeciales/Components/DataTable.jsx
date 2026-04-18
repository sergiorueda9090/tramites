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
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
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
// Helpers
// ============================================
const formatCurrency = (value) => {
  if (!value) return '$0';
  const num = Number(value);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const ESTADO_LABELS = {
  caso_especial_estado: 'Caso',
  tramite_estado: 'Trámite',
  confirmacion_estado: 'Confirmación',
  cargar_pdf_estado: 'PDF',
};

const EstadoChip = ({ field, value }) => (
  <Chip
    size="small"
    label={ESTADO_LABELS[field]}
    color={value === '1' ? 'success' : 'default'}
    variant={value === '1' ? 'filled' : 'outlined'}
    sx={{ fontWeight: 500 }}
  />
);

// ============================================
// Columns Configuration
// ============================================
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'placa',
    headerName: 'Placa',
    minWidth: 110,
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600}>
        {value || '-'}
      </Typography>
    ),
  },
  {
    field: 'cliente',
    headerName: 'Cliente',
    minWidth: 180,
    sortable: false,
    renderCell: ({ row }) => row.cliente?.nombre || '-',
  },
  {
    field: 'etiqueta',
    headerName: 'Etiqueta',
    minWidth: 140,
    sortable: false,
    renderCell: ({ row }) =>
      row.etiqueta ? (
        <Chip
          label={row.etiqueta.nombre}
          size="small"
          sx={{
            bgcolor: row.etiqueta.color || 'primary.main',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      ) : (
        '-'
      ),
  },
  {
    field: 'nombre_completo',
    headerName: 'Titular',
    minWidth: 180,
  },
  {
    field: 'numero_documento',
    headerName: 'Documento',
    minWidth: 140,
  },
  {
    field: 'precio_lay',
    headerName: 'Precio',
    minWidth: 120,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} color="primary">
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'comision',
    headerName: 'Comisión',
    minWidth: 120,
    align: 'right',
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} color="secondary">
        {formatCurrency(value)}
      </Typography>
    ),
  },
  {
    field: 'estados',
    headerName: 'Estados',
    minWidth: 220,
    sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <EstadoChip field="caso_especial_estado" value={row.caso_especial_estado} />
        <EstadoChip field="tramite_estado" value={row.tramite_estado} />
        <EstadoChip field="confirmacion_estado" value={row.confirmacion_estado} />
        <EstadoChip field="cargar_pdf_estado" value={row.cargar_pdf_estado} />
      </Box>
    ),
  },
  {
    field: 'usuario',
    headerName: 'Registrado por',
    minWidth: 150,
    sortable: false,
    renderCell: ({ row }) => row.usuario?.name || '-',
  },
  {
    field: 'created_at',
    headerName: 'Fecha de creación',
    minWidth: 160,
    renderCell: ({ value }) => formatDateTime(value),
  },
];

// ============================================
// CasosEspecialesDataTable Component
// ============================================
const CasosEspecialesDataTable = ({
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
  onHistory,
  onDelete,
  emptyMessage = 'No se encontraron casos especiales',
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
              {showActions && (onView || onEdit || onHistory || onDelete) && (
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
                  {showActions && (onView || onEdit || onHistory || onDelete) && (
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
                        {onHistory && (
                          <Tooltip title="Ver historial">
                            <IconButton size="small" onClick={() => onHistory(row)} color="warning">
                              <HistoryIcon fontSize="small" />
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
export default CasosEspecialesDataTable;
