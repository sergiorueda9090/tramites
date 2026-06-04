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
} from '@mui/material';

const SubCuentaDialog = ({
  open,
  onClose,
  onSave,
  selectedSubCuenta,
  form,
  onFormChange,
  cuentas = [],
}) => {
  const isEditing = !!selectedSubCuenta;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  // ID manual: 3 letras (forzadas a mayuscula) + 3 digitos
  const handleCodigoChange = (event) => {
    let raw = event.target.value.toUpperCase();
    // Permite construir paso a paso: letras al inicio, luego digitos. Eliminamos caracteres invalidos.
    let letters = '';
    let digits = '';
    for (const ch of raw) {
      if (letters.length < 3 && /[A-Z]/.test(ch)) {
        letters += ch;
      } else if (digits.length < 3 && /\d/.test(ch)) {
        digits += ch;
      }
    }
    onFormChange('codigo', letters + digits);
  };

  const codigoInvalido = form.codigo !== '' && !/^[A-Z]{3}\d{3}$/.test(form.codigo);

  // Encontrar la cuenta seleccionada para el Autocomplete
  const selectedCuenta = cuentas.find((c) => String(c.id) === String(form.cuenta)) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar sub-cuenta' : 'Nueva sub-cuenta'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            fullWidth
            options={cuentas}
            value={selectedCuenta}
            onChange={(_, newValue) => onFormChange('cuenta', newValue ? newValue.id : '')}
            getOptionLabel={(option) =>
              option ? `${option.codigo_puc} — ${option.nombre_cuenta}` : ''
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cuenta (Plan de cuentas)"
                required
                placeholder="Buscar por código o nombre..."
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {option.codigo_puc} — {option.nombre_cuenta}
                  </Box>
                  <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {option.tipo_display || option.tipo}
                  </Box>
                </Box>
              </li>
            )}
          />

          <TextField
            fullWidth
            label="Nombre sub-cuenta"
            value={form.nombre_sub_cuenta || ''}
            onChange={handleChange('nombre_sub_cuenta')}
            required
            placeholder="Ej: BANCOLCP"
          />

          <TextField
            fullWidth
            label="ID"
            value={form.codigo || ''}
            onChange={handleCodigoChange}
            required
            placeholder="Ej: ABC123"
            inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
            error={codigoInvalido}
            helperText={
              codigoInvalido
                ? 'Debe ser 3 letras mayúsculas seguidas de 3 dígitos'
                : 'ID manual único: 3 letras + 3 dígitos (ej: ABC123)'
            }
          />

          {/* Los saldos contables (débito/crédito/acumulado) no se capturan ni se editan
              aquí: una sub-cuenta arranca en 0 y los movimientos los registra el libro
              mayor. Se consultan en la tabla / Dashboard Contable. */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={
            !form.cuenta ||
            !form.nombre_sub_cuenta ||
            !/^[A-Z]{3}\d{3}$/.test(form.codigo || '')
          }
        >
          {isEditing ? 'Guardar cambios' : 'Crear sub-cuenta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCuentaDialog;
