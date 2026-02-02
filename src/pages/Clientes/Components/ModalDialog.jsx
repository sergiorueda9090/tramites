import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { MEDIO_COMUNICACION_OPTIONS } from './AdvancedFilters';

const ClienteDialog = ({
  open,
  onClose,
  onSave,
  selectedCliente,
  form,
  onFormChange,
  onAddPrecio,
  onUpdatePrecio,
  onRemovePrecio,
}) => {
  const isEditing = !!selectedCliente;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    onFormChange(field, value);
  };

  const handlePrecioChange = (index, field) => (event) => {
    if (onUpdatePrecio) {
      onUpdatePrecio(index, { [field]: event.target.value });
    }
  };

  const handleAddPrecio = () => {
    if (onAddPrecio) {
      onAddPrecio({
        descripcion: '',
        precio_lay: '',
        comision: '',
      });
    }
  };

  const handleRemovePrecio = (index) => {
    if (onRemovePrecio) {
      onRemovePrecio(index);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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

          <TextField
            fullWidth
            label="Nombre"
            value={form.nombre || ''}
            onChange={handleChange('nombre')}
            required
          />

          <TextField
            fullWidth
            label="Teléfono"
            value={form.telefono || ''}
            onChange={handleChange('telefono')}
          />

          <TextField
            fullWidth
            label="Dirección"
            value={form.direccion || ''}
            onChange={handleChange('direccion')}
            multiline
            rows={2}
          />

          <FormControl fullWidth>
            <InputLabel>Medio de comunicación</InputLabel>
            <Select
              label="Medio de comunicación"
              value={form.medio_comunicacion || 'email'}
              onChange={handleChange('medio_comunicacion')}
            >
              {MEDIO_COMUNICACION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sección de precios */}
          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={500}>
              Precios del cliente
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddPrecio}
              variant="outlined"
            >
              Agregar precio
            </Button>
          </Box>

          {form.precios && form.precios.length > 0 ? (
            form.precios.map((precio, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    label="Descripción"
                    value={precio.descripcion || ''}
                    onChange={handlePrecioChange(index, 'descripcion')}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    size="small"
                    label="Precio Ley"
                    type="number"
                    value={precio.precio_lay || ''}
                    onChange={handlePrecioChange(index, 'precio_lay')}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                  <TextField
                    size="small"
                    label="Comisión"
                    type="number"
                    value={precio.comision || ''}
                    onChange={handlePrecioChange(index, 'comision')}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemovePrecio(index)}
                    sx={{ mt: 0.5 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay precios configurados. Haz clic en "Agregar precio" para añadir uno.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteDialog;
