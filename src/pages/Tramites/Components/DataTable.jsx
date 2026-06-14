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
  LinearProgress,
  Button,
  Link as MuiLink,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
// Entidad — catálogos y sub-componente de celda
// (mirror de tramites/Components/ModalDialog.jsx)
// ============================================
const ENTIDAD_LABELS = {
  MUNDIAL: 'Mundial',
  PREVISORA: 'Previsora',
  SOLIDARIA: 'Solidaria',
  MANUAL: 'Manual',
};
const ENTIDADES_POR_TIPO_VEHICULO = {
  USADO:   ['MUNDIAL', 'PREVISORA', 'MANUAL'],
  CERO_KM: ['PREVISORA', 'SOLIDARIA', 'MANUAL'],
};
const ENTIDAD_COLOR = {
  MUNDIAL:   'primary',
  PREVISORA: 'info',
  SOLIDARIA: 'secondary',
  MANUAL:    'warning',
};

// Solo lectura por el momento: la entidad no se puede cambiar desde el listado;
// se muestra como un Chip estático (sin Select).
const EntidadSelectCell = ({ row }) => {
  const opciones = ENTIDADES_POR_TIPO_VEHICULO[row.tipo_vehiculo] || [];
  // Valor a mostrar: el del backend si pertenece al catálogo del tipo_vehiculo,
  // o el primero (default) si no, o '' cuando el tipo_vehiculo no resuelve.
  const value =
    row.entidad && opciones.includes(row.entidad)
      ? row.entidad
      : opciones[0] || '';

  if (!value) {
    return <Typography variant="body2" color="text.secondary">-</Typography>;
  }

  return (
    <Chip
      label={ENTIDAD_LABELS[value] || value}
      size="small"
      color={ENTIDAD_COLOR[value] || 'default'}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
};

// ============================================
// Link de pago — celda con barra de progreso / link / error
// El estado lo genera un job asíncrono (Celery) y llega por WebSocket.
// ============================================
const LinkPagoCell = ({ row, onReintentar }) => {
  const lp = row.link_pago;
  if (!lp || !lp.estado) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  if (lp.estado === 'pendiente' || lp.estado === 'en_proceso') {
    return (
      <Box sx={{ minWidth: 120 }} onClick={(e) => e.stopPropagation()}>
        <Typography variant="caption" color="text.secondary">
          Generando… {lp.proveedor ? `(${lp.proveedor})` : ''}
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (lp.estado === 'exitoso' && lp.url_pago) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
        <MuiLink
          href={lp.url_pago}
          target="_blank"
          rel="noopener"
          sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {lp.proveedor || 'link'}
        </MuiLink>
        <Tooltip title="Copiar">
          <IconButton size="small" onClick={() => navigator.clipboard.writeText(lp.url_pago)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Abrir">
          <IconButton size="small" component="a" href={lp.url_pago} target="_blank" rel="noopener">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  // error (o exitoso sin URL)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
      <Tooltip title={lp.error_mensaje || 'Error'}>
        <Chip size="small" color="error" variant="outlined" label={`Error (${lp.intentos ?? 0})`} />
      </Tooltip>
      {onReintentar && (
        <Button size="small" onClick={() => onReintentar(row.id)}>Reintentar</Button>
      )}
    </Box>
  );
};

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
    field: 'tipo_tramite',
    headerName: 'Trámite',
    minWidth: 100,
    renderCell: ({ row }) => row.tipo_tramite_display || row.tipo_tramite || '-',
  },
  {
    field: 'tipo_vehiculo',
    headerName: 'Tipo',
    minWidth: 110,
    renderCell: ({ row }) => {
      const value = row.tipo_vehiculo;
      if (!value) return '-';
      const label = value === 'CERO_KM' ? '0 KM' : (row.tipo_vehiculo_display || value);
      return (
        <Chip
          label={label}
          size="small"
          color={value === 'CERO_KM' ? 'success' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      );
    },
  },
  {
    field: 'entidad',
    headerName: 'Entidad',
    minWidth: 160,
    sortable: false,
    renderCell: ({ row }) => <EntidadSelectCell row={row} />,
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
    field: 'link_pago',
    headerName: 'Link de pago',
    minWidth: 180,
    sortable: false,
    renderCell: ({ row, onReintentarLink }) => (
      <LinkPagoCell row={row} onReintentar={onReintentarLink} />
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
  onReintentarLink,
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
  const hasPresence = typeof onCellFocus === 'function' && typeof getOccupant === 'function';

  const handleCellClick = (rowId, column) => {
    if (hasPresence) onCellFocus(rowId, column);
  };

  const renderCellContent = (column, row) => {
    const value = row[column.field];
    if (column.renderCell) {
      return column.renderCell({ row, value, onReintentarLink });
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
                  {columns.map((column) => {
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
