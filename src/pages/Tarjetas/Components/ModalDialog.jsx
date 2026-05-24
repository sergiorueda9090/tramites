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
  Typography,
  InputAdornment,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';

const TarjetaDialog = ({
  open,
  onClose,
  onSave,
  selectedTarjeta,
  form,
  onFormChange,
  subCuentas = [],
}) => {
  const isEditing = !!selectedTarjeta;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    onFormChange(field, value);
  };

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar tarjeta' : 'Nueva tarjeta'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Preview de la tarjeta */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <CreditCardIcon sx={{ fontSize: 32 }} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {form.cuatro_por_mil === '1' ? '4x1000 Activo' : '4x1000 Exento'}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 2, mb: 1 }}>
              {form.numero ? `**** **** **** ${form.numero.slice(-4)}` : '**** **** **** ****'}
            </Typography>
            <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
              {form.titular || 'NOMBRE DEL TITULAR'}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Número de tarjeta"
            value={form.numero || ''}
            onChange={handleChange('numero')}
            required
            placeholder="1234567890123456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon color="action" />
                </InputAdornment>
              ),
            }}
            inputProps={{
              maxLength: 32,
            }}
            helperText="Ingrese el número completo de la tarjeta"
          />

          <TextField
            fullWidth
            label="Titular"
            value={form.titular || ''}
            onChange={handleChange('titular')}
            required
            placeholder="Nombre del titular"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion || ''}
            onChange={handleChange('descripcion')}
            placeholder="Ej: Tarjeta principal, Cuenta de ahorros..."
            multiline
            rows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>4x1000 (Cuatro por mil)</InputLabel>
            <Select
              value={form.cuatro_por_mil || '0'}
              label="4x1000 (Cuatro por mil)"
              onChange={handleChange('cuatro_por_mil')}
            >
              <MenuItem value="0">Exento - No aplica impuesto</MenuItem>
              <MenuItem value="1">Activo - Aplica impuesto del 4x1000</MenuItem>
            </Select>
          </FormControl>

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
                helperText="Obligatoria y única: no se puede repetir entre tarjetas"
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!form.numero || !form.titular || !form.descripcion || !form.sub_cuenta}
        >
          {isEditing ? 'Guardar cambios' : 'Crear tarjeta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TarjetaDialog;
