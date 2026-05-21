import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import {
  TIPO_CUENTA_OPTIONS,
  ACUMULADO_LABELS,
  ACUMULADO_POR_TIPO,
} from '../../../store/planDeCuotasStore/planDeCuotasStore';

const PlanDeCuentasDialog = ({
  open,
  onClose,
  onSave,
  selectedCuenta,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedCuenta;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  // Limita el codigo a 4 digitos numericos durante el ingreso manual
  const handleCodigoPucChange = (event) => {
    const raw = event.target.value.replace(/\D/g, '').slice(0, 4);
    onFormChange('codigo_puc', raw);
  };

  const codigoInvalido = form.codigo_puc !== '' && !/^\d{4}$/.test(form.codigo_puc);

  // Acumulado se deriva del tipo (regla contable). Lo mostramos pero no se edita.
  const acumuladoDerivado = form.tipo ? ACUMULADO_POR_TIPO[form.tipo] : '';
  const acumuladoLabel = acumuladoDerivado ? ACUMULADO_LABELS[acumuladoDerivado] : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar cuenta del PUC' : 'Nueva cuenta del PUC'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            fullWidth
            label="Tipo"
            value={form.tipo || ''}
            onChange={handleChange('tipo')}
            required
          >
            <MenuItem value="">
              <em>Seleccione un tipo</em>
            </MenuItem>
            {TIPO_CUENTA_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Acumulado: se deriva automaticamente del tipo (regla contable) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
              Acumulado:
            </Typography>
            {acumuladoLabel ? (
              <Chip
                label={acumuladoLabel}
                size="small"
                color="info"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            ) : (
              <Typography variant="caption" color="text.disabled" fontStyle="italic">
                Seleccione un tipo para calcular el acumulado
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Código PUC"
            value={form.codigo_puc || ''}
            onChange={handleCodigoPucChange}
            required
            placeholder="Ej: 1105"
            inputProps={{
              inputMode: 'numeric',
              pattern: '\\d{4}',
              maxLength: 4,
            }}
            error={codigoInvalido}
            helperText={
              codigoInvalido
                ? 'Debe ser numérico de 4 dígitos'
                : 'Numérico de 4 dígitos, único, ingreso manual'
            }
          />

          <TextField
            fullWidth
            label="Nombre de cuenta"
            value={form.nombre_cuenta || ''}
            onChange={handleChange('nombre_cuenta')}
            required
            placeholder="Ej: Caja general"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={
            !form.tipo ||
            !form.nombre_cuenta ||
            !/^\d{4}$/.test(form.codigo_puc || '')
          }
        >
          {isEditing ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanDeCuentasDialog;
