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
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Badge from '@mui/material/Badge';
import { formatDateTime } from '../../../utils/helpers';
import Pagination from './Pagination';
import CellPresenceOverlay from '../../../components/common/CellPresenceOverlay';

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

const GRUPO_SOAT_COLORS = {
  MOTOS: 'primary',
  MOTOCARROS: 'primary',
  CICLOMOTORES: 'primary',
  CARGA: 'info',
  CAMPEROS: 'success',
  FAMILIAR_5P: 'success',
  INTERMUNICIPAL: 'warning',
  TAXI: 'warning',
  BUS_URBANO: 'secondary',
  '6_PASAJEROS': 'secondary',
};

// ============================================
// Columns Configuration
// ============================================
const buildColumns = ({ onOpenPdfs } = {}) => [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'pdfs',
    headerName: 'PDFs',
    width: 70,
    align: 'center',
    sortable: false,
    renderCell: ({ row }) =>
      onOpenPdfs ? (
        <Tooltip title="PDFs adjuntos">
          <IconButton size="small" onClick={() => onOpenPdfs(row)} color="error">
            <Badge
              badgeContent={row.pdfs_count || 0}
              color="error"
              showZero={false}
              overlap="circular"
              sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
      ) : (
        '-'
      ),
  },
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
    field: 'tipo_tramite',
    headerName: 'Tipo',
    minWidth: 100,
    renderCell: ({ row }) => row.tipo_tramite_display || row.tipo_tramite || '-',
  },
  {
    field: 'grupo_soat',
    headerName: 'Grupo SOAT',
    minWidth: 140,
    renderCell: ({ row }) =>
      row.grupo_soat ? (
        <Chip
          label={row.grupo_soat_display || row.grupo_soat}
          size="small"
          color={GRUPO_SOAT_COLORS[row.grupo_soat] || 'default'}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ) : (
        '-'
      ),
  },
  {
    field: 'tarifa_codigo',
    headerName: 'Tarifa',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Typography variant="body2" fontWeight={600} color="info.main">
        {value || '-'}
      </Typography>
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
    field: 'tarjeta',
    headerName: 'Tarjeta',
    minWidth: 180,
    sortable: false,
    renderCell: ({ row }) => {
      const t = row.tarjeta;
      if (!t) {
        return (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Sin tarjeta
          </Typography>
        );
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CreditCardIcon fontSize="small" color="action" />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Typography variant="body2" fontWeight={600}>
              {t.numero || '-'}
            </Typography>
            {t.titular && (
              <Typography variant="caption" color="text.secondary">
                {t.titular}
              </Typography>
            )}
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'cuatro_por_mil',
    headerName: '4×1000',
    minWidth: 140,
    align: 'right',
    sortable: false,
    renderCell: ({ row }) => {
      if (!row.tarjeta) return '-';
      const aplica = row.tarjeta.cuatro_por_mil === '1' || row.tarjeta.cuatro_por_mil === 1 || row.tarjeta.cuatro_por_mil === true;
      if (!aplica) {
        return (
          <Chip
            size="small"
            label="No aplica"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        );
      }
      // Preferimos el snapshot persistido en BD; si por alguna razón viene
      // vacío (registros viejos), recalculamos con (precio_lay + comision)*4/1000.
      const snapshot = Number(row.cuatro_por_mil_valor);
      const monto = Number.isFinite(snapshot) && snapshot > 0
        ? snapshot
        : ((Number(row.precio_lay || 0) + Number(row.comision || 0)) * 4) / 1000;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
          <Chip
            size="small"
            label="4×1000"
            color="warning"
            sx={{ fontWeight: 600, height: 20 }}
          />
          <Typography variant="body2" fontWeight={600} color="warning.main">
            {formatCurrency(monto)}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'estados',
    headerName: 'Estados',
    minWidth: 200,
    sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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

const columns = buildColumns();

// ============================================
// TramitesDataTable Component
// ============================================
const TramitesDataTable = ({
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
  onEnviarAPasarela,
  onOpenPdfs,
  emptyMessage = 'No se encontraron trámites',
  stickyHeader = true,
  maxHeight = 600,
  showActions = true,
  // Presencia colaborativa por celda (opcional)
  getOccupant,
  getRowOccupants,
  onCellFocus,
  onCellBlur,
}) => {
  const tableColumns = React.useMemo(() => buildColumns({ onOpenPdfs }), [onOpenPdfs]);
  const hasPresence = typeof onCellFocus === 'function' && typeof getOccupant === 'function';

  const handleCellClick = (rowId, column) => {
    if (hasPresence) onCellFocus(rowId, column);
  };

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
        <TableLoadingSkeleton rows={5} columns={tableColumns.length + (showActions ? 1 : 0)} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: maxHeight }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => (
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
              {showActions && (onView || onEdit || onHistory || onDelete || onEnviarAPasarela) && (
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
                  colSpan={tableColumns.length + (showActions ? 1 : 0)}
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
                  {tableColumns.map((column) => {
                    const cellContent = renderCellContent(column, row);
                    return (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                        onClick={() => handleCellClick(row.id, column.field)}
                        sx={hasPresence ? { cursor: 'cell', position: 'relative', overflow: 'visible' } : undefined}
                      >
                        {hasPresence ? (
                          <CellPresenceOverlay
                            getOccupant={getOccupant}
                            rowId={row.id}
                            column={column.field}
                          >
                            {cellContent}
                          </CellPresenceOverlay>
                        ) : (
                          cellContent
                        )}
                      </TableCell>
                    );
                  })}
                  {showActions && (onView || onEdit || onHistory || onDelete || onEnviarAPasarela) && (
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
                        {onEnviarAPasarela && (
                          <Tooltip title="Enviar a Pasarela de Pago">
                            <IconButton size="small" onClick={() => onEnviarAPasarela(row)} color="success">
                              <PaymentIcon fontSize="small" />
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
export default TramitesDataTable;
