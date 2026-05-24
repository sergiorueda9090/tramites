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
  Typography,
} from '@mui/material';

const ProveedorDialog = ({
  open,
  onClose,
  onSave,
  selectedProveedor,
  form,
  onFormChange,
  subCuentas = [],
}) => {
  const isEditing = !!selectedProveedor;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;

  const colorInvalido = form.color !== '' && !/^#[0-9A-Fa-f]{6}$/.test(form.color || '');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={form.nombre || ''}
            onChange={handleChange('nombre')}
            required
            placeholder="Nombre del proveedor"
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
                helperText="Obligatoria: cada proveedor debe estar asociado a una sub-cuenta contable"
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {option.codigo} — {option.nombre_sub_cuenta}
                  </Box>
                  {option.cuenta_codigo_puc && (
                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      Cuenta PUC: {option.cuenta_codigo_puc}
                    </Box>
                  )}
                </Box>
              </li>
            )}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Color"
              value={form.color || ''}
              onChange={handleChange('color')}
              placeholder="#1976d2"
              error={colorInvalido}
              helperText={colorInvalido ? 'Debe ser HEX (#RRGGBB)' : undefined}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        bgcolor: /^#[0-9A-Fa-f]{6}$/.test(form.color || '') ? form.color : '#ccc',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(form.color || '') ? form.color : '#1976d2'}
              onChange={(e) => onFormChange('color', e.target.value)}
              style={{
                width: 48,
                height: 40,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              title="Selector de color"
            />
          </Box>

          {isEditing && (
            <Typography variant="caption" color="text.secondary">
              Creado: {selectedProveedor?.created_at ? new Date(selectedProveedor.created_at).toLocaleString('es-CO') : '-'}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!form.nombre || !form.sub_cuenta || colorInvalido}
        >
          {isEditing ? 'Guardar cambios' : 'Crear proveedor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProveedorDialog;
