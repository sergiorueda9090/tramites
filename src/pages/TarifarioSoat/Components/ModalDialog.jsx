import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  InputAdornment,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const TarifarioSoatDialog = ({
  open,
  onClose,
  onSave,
  selectedTarifario,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedTarifario;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    onFormChange(field, value);
  };

  const handleValorChange = (event) => {
    // Remover todo lo que no sea dígito para obtener el valor numérico puro
    const raw = event.target.value.replace(/\D/g, '');
    onFormChange('valor', raw);
  };

  const formatThousands = (value) => {
    if (!value && value !== 0) return '';
    const num = Math.round(Number(value));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-CO').format(num);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar tarifario SOAT' : 'Nuevo tarifario SOAT'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Código tarifa"
            value={form.codigo_tarifa || ''}
            onChange={handleChange('codigo_tarifa')}
            required
            placeholder="Ej: T001"
          />

          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion || ''}
            onChange={handleChange('descripcion')}
            required
            placeholder="Descripción del tarifario..."
          />

          <TextField
            fullWidth
            label="Valor"
            value={formatThousands(form.valor)}
            onChange={handleValorChange}
            required
            placeholder="0"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear tarifario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TarifarioSoatDialog;
