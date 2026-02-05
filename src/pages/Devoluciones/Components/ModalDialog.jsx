import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const DevolucionDialog = ({
  open,
  onClose,
  onSave,
  selectedDevolucion,
  form,
  onFormChange,
  clientes = [],
  tarjetas = [],
}) => {
  const isEditing = !!selectedDevolucion;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar devolución' : 'Nueva devolución'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={form.cliente || ''}
              label="Cliente"
              onChange={handleChange('cliente')}
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Tarjeta</InputLabel>
            <Select
              value={form.tarjeta || ''}
              label="Tarjeta"
              onChange={handleChange('tarjeta')}
            >
              {tarjetas.map((tarjeta) => (
                <MenuItem key={tarjeta.id} value={tarjeta.id}>
                  **** {(tarjeta.numero || '').slice(-4)} - {tarjeta.titular || ''}
                  {tarjeta.cuatro_por_mil === '1' ? ' (4x1000)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={form.valor || ''}
            onChange={handleChange('valor')}
            required
            placeholder="0"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon color="action" />
                </InputAdornment>
              ),
            }}
            inputProps={{
              min: 0,
              step: '0.01',
            }}
            helperText="El 4x1000 y total se calculan automáticamente"
          />

          <TextField
            fullWidth
            label="Fecha"
            type="datetime-local"
            value={form.fecha || ''}
            onChange={handleChange('fecha')}
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Observación"
            value={form.observacion || ''}
            onChange={handleChange('observacion')}
            placeholder="Observaciones adicionales..."
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear devolución'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DevolucionDialog;
