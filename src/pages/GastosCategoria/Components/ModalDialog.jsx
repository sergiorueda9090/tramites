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
  subCuentas = [],
}) => {
  const isEditing = !!selectedCategoria;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;
  const canSave = (form?.nombre || '').trim().length > 0 && !!form?.sub_cuenta;

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
