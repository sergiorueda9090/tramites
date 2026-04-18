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

const typeConfig = {
  '+': { label: 'Creado', color: 'success' },
  '~': { label: 'Modificado', color: 'warning' },
  '-': { label: 'Eliminado', color: 'error' },
};

const ESTADO_LABEL = (v) => (v === '1' ? 'Activo' : v === '0' ? 'Inactivo' : '-');

const HistoryDialog = ({
  open,
  onClose,
  caso,
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
          Historial — Caso especial #{caso?.id}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {historyData.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No se encontraron cambios registrados para este caso especial.
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
                        <TableCell>{entry.history_user?.name || '-'}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Placa:</strong> {entry.placa || '-'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Titular:</strong> {entry.nombre_completo || '-'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Estados:</strong> Caso {ESTADO_LABEL(entry.caso_especial_estado)} · Trámite {ESTADO_LABEL(entry.tramite_estado)} · Confirmación {ESTADO_LABEL(entry.confirmacion_estado)} · PDF {ESTADO_LABEL(entry.cargar_pdf_estado)}
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
