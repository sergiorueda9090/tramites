import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const AjusteSaldoDialog = ({
  open,
  onClose,
  onSave,
  selectedAjusteSaldo,
  form,
  onFormChange,
  clientes = [],
  subCuentas = [],
}) => {
  const isEditing = !!selectedAjusteSaldo;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    onFormChange(field, value);
  };

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar ajuste de saldo' : 'Nuevo ajuste de saldo'}
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

          <Autocomplete
            fullWidth
            options={subCuentas}
            value={selectedSubCuenta}
            onChange={(_, newValue) => onFormChange('sub_cuenta', newValue ? newValue.id : '')}
            getOptionLabel={(option) =>
              option ? `${option.codigo} — ${option.nombre_sub_cuenta}` : ''
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sub-cuenta"
                required
                placeholder="Buscar por código o nombre..."
                helperText="Obligatoria y única: no se puede repetir entre registros"
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Débito"
              type="number"
              value={form.debito ?? '0'}
              onChange={handleChange('debito')}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ min: 0, step: '0.01' }}
            />
            <TextField
              fullWidth
              label="Crédito"
              type="number"
              value={form.credito ?? '0'}
              onChange={handleChange('credito')}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ min: 0, step: '0.01' }}
            />
          </Box>

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
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!form.cliente || !form.valor || !form.fecha || !form.sub_cuenta}
        >
          {isEditing ? 'Guardar cambios' : 'Crear ajuste'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AjusteSaldoDialog;
