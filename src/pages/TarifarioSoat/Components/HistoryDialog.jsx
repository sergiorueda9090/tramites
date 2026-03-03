import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDateTime } from '../../../utils/helpers';
import Pagination from './Pagination';

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const typeConfig = {
  '+': { label: 'Creado', color: 'success' },
  '~': { label: 'Modificado', color: 'warning' },
  '-': { label: 'Eliminado', color: 'error' },
};

const HistoryDialog = ({
  open,
  onClose,
  tarifario,
  historyData,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Historial — Tarifario #{tarifario?.id}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {historyData.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No se encontraron cambios registrados para este tarifario.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Detalles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData.map((entry) => {
                    const type = typeConfig[entry.history_type] || { label: entry.history_type, color: 'default' };
                    return (
                      <TableRow key={entry.history_id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDateTime(entry.history_date)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={type.label} color={type.color} size="small" />
                        </TableCell>
                        <TableCell>
                          {entry.history_user?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Código:</strong> {entry.codigo_tarifa || '-'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Descripción:</strong> {entry.descripcion || '-'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Valor:</strong> {formatCurrency(entry.valor)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalRows={totalRows}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              rowsPerPageOptions={[5, 10, 25]}
              compact
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
