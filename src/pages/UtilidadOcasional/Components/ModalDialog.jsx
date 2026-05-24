import React, { useMemo } from 'react';
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
  Alert,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const UtilidadOcasionalDialog = ({
  open,
  onClose,
  onSave,
  selectedUtilidad,
  form,
  onFormChange,
  tarjetas = [],
  subCuentas = [],
}) => {
  const isEditing = !!selectedUtilidad;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;

  // Preview en vivo del 4x1000 y total — replica el cálculo del backend.
  const { tarjetaSeleccionada, aplica4x1000, cuatroPorMilCalc, totalCalc } = useMemo(() => {
    const tId = form.tarjeta ? Number(form.tarjeta) : null;
    const tarjeta = tarjetas.find((t) => t.id === tId) || null;
    const aplica = tarjeta?.cuatro_por_mil === '1';
    const valor = Number(form.valor || 0);
    const cuatro = aplica && !Number.isNaN(valor) ? (valor * 4) / 1000 : 0;
    const total = (Number.isNaN(valor) ? 0 : valor) + cuatro;
    return {
      tarjetaSeleccionada: tarjeta,
      aplica4x1000: aplica,
      cuatroPorMilCalc: cuatro,
      totalCalc: total,
    };
  }, [form.tarjeta, form.valor, tarjetas]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar utilidad ocasional' : 'Nueva utilidad ocasional'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Tarjeta</InputLabel>
            <Select
              value={form.tarjeta || ''}
              label="Tarjeta"
              onChange={handleChange('tarjeta')}
            >
              {tarjetas.map((tarjeta) => (
                <MenuItem key={tarjeta.id} value={tarjeta.id}>
                  **** {(tarjeta.numero || '').slice(-4)}
                  {tarjeta.titular ? ` - ${tarjeta.titular}` : ''}
                  {tarjeta.cuatro_por_mil === '1' ? ' (4x1000)' : ''}
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
            inputProps={{ min: 0, step: '0.01' }}
            helperText="El 4×1000 y el total se calculan automáticamente."
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

          <TextField
            fullWidth
            label="Observación"
            value={form.observacion || ''}
            onChange={handleChange('observacion')}
            placeholder="Observaciones adicionales..."
            multiline
            rows={3}
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

          {/* Preview del cálculo */}
          {tarjetaSeleccionada && (
            <Alert
              severity={aplica4x1000 ? 'warning' : 'info'}
              icon={false}
              sx={{ '& .MuiAlert-message': { width: '100%' } }}
            >
              <Stack spacing={0.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Cálculo automático
                  </Typography>
                  <Chip
                    size="small"
                    label={aplica4x1000 ? 'Aplica 4x1000' : 'No aplica 4x1000'}
                    color={aplica4x1000 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Valor:</Typography>
                  <Typography variant="body2">{formatCurrency(form.valor)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">4×1000:</Typography>
                  <Typography variant="body2">{formatCurrency(cuatroPorMilCalc)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider', pt: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>Total:</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {formatCurrency(totalCalc)}
                  </Typography>
                </Box>
              </Stack>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!form.tarjeta || !form.valor || !form.fecha || !form.sub_cuenta}
        >
          {isEditing ? 'Guardar cambios' : 'Crear utilidad'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UtilidadOcasionalDialog;
