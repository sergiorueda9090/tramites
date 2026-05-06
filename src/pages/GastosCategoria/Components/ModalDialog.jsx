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
import CategoryIcon from '@mui/icons-material/Category';

const CategoriaDialog = ({
  open,
  onClose,
  onSave,
  selectedCategoria,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedCategoria;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const canSave = (form?.nombre || '').trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar categoría de gasto' : 'Nueva categoría de gasto'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={form.nombre || ''}
            onChange={handleChange('nombre')}
            required
            placeholder="Ej: Combustible, Servicios públicos, Insumos..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon color="action" />
                </InputAdornment>
              ),
            }}
            autoFocus
          />
          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion || ''}
            onChange={handleChange('descripcion')}
            placeholder="Descripción opcional de la categoría..."
            multiline
            minRows={2}
            maxRows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave} disabled={!canSave}>
          {isEditing ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoriaDialog;
