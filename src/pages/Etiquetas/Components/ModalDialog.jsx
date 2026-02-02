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
  Chip,
} from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LabelIcon from '@mui/icons-material/Label';

const EtiquetaDialog = ({
  open,
  onClose,
  onSave,
  selectedEtiqueta,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedEtiqueta;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar etiqueta' : 'Nueva etiqueta'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Preview de la etiqueta */}
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Chip
              icon={<LabelIcon />}
              label={form.nombre || 'Vista previa'}
              sx={{
                bgcolor: form.color || '#1976d2',
                color: '#fff',
                fontSize: '1rem',
                py: 2,
                '& .MuiChip-icon': {
                  color: '#fff',
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Nombre"
            value={form.nombre || ''}
            onChange={handleChange('nombre')}
            required
            placeholder="Ej: Urgente, Importante, Pendiente..."
          />

          {/* Color picker */}
          <TextField
            fullWidth
            label="Color"
            type="color"
            value={form.color || '#1976d2'}
            onChange={handleChange('color')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ColorLensIcon sx={{ color: form.color || '#1976d2' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& input[type="color"]': {
                width: 50,
                height: 30,
                padding: 0,
                border: 'none',
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear etiqueta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EtiquetaDialog;
