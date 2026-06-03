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
import CreditCardIcon from '@mui/icons-material/CreditCard';

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

  const selectedTarjeta = tarjetas.find((t) => String(t.id) === String(form.tarjeta)) || null;
  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;

  const tarjetaSubCuenta = selectedTarjeta
    ? {
        codigo: selectedTarjeta.sub_cuenta_codigo,
        nombre: selectedTarjeta.sub_cuenta_nombre,
      }
    : null;

  // Preview en vivo del 4x1000 y total — replica el cálculo del backend.
  const { aplica4x1000, montoBase, cuatroPorMilCalc, totalCalc, esGanancia, esPerdida } = useMemo(() => {
    const aplica = selectedTarjeta?.cuatro_por_mil === '1';
    const valor = Number(form.valor || 0);
    const safeValor = Number.isNaN(valor) ? 0 : valor;
    const base = Math.abs(safeValor);
    const cuatro = aplica ? (base * 4) / 1000 : 0;
    const totalMagnitud = base + cuatro;
    return {
      aplica4x1000: aplica,
      montoBase: base,
      cuatroPorMilCalc: cuatro,
      totalCalc: safeValor > 0 ? totalMagnitud : -totalMagnitud,
      esGanancia: safeValor > 0,
      esPerdida: safeValor < 0,
    };
  }, [form.valor, selectedTarjeta]);

  // Validaciones locales.
  const tarjetaSinSubCuenta = selectedTarjeta && !tarjetaSubCuenta?.codigo;
  const mismaSubCuenta =
    selectedTarjeta && form.sub_cuenta &&
    selectedTarjeta.sub_cuenta &&
    String(selectedTarjeta.sub_cuenta) === String(form.sub_cuenta);
  const valorCero = form.valor !== '' && form.valor !== null && Number(form.valor) === 0;

  const canSave =
    form.tarjeta && form.valor && form.fecha && form.sub_cuenta &&
    !valorCero && !tarjetaSinSubCuenta && !mismaSubCuenta;

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

          {selectedTarjeta && (
            <SubCuentaInfo
              icon={<CreditCardIcon fontSize="small" />}
              label="Sub-cuenta de la tarjeta (banco)"
              codigo={tarjetaSubCuenta?.codigo}
              nombre={tarjetaSubCuenta?.nombre}
              color="secondary"
            />
          )}

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
            inputProps={{ step: '0.01' }}
            helperText="Positivo = ganancia, negativo = pérdida. El 4×1000 y el total se calculan automáticamente."
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
                label="Sub-cuenta de ingreso / utilidad"
                required
                placeholder="Buscar por código o nombre..."
                helperText="Contracuenta del banco en el asiento (no puede ser la misma de la tarjeta)"
              />
            )}
          />

          {tarjetaSinSubCuenta && (
            <Alert severity="error">
              La tarjeta seleccionada no tiene sub-cuenta contable asignada. Asignala antes de continuar.
            </Alert>
          )}
          {mismaSubCuenta && (
            <Alert severity="error">
              La sub-cuenta de ingreso no puede ser la misma que la de la tarjeta. El asiento contable no se puede registrar.
            </Alert>
          )}
          {valorCero && (
            <Alert severity="error">
              El valor no puede ser 0.
            </Alert>
          )}

          {/* Preview del cálculo */}
          {selectedTarjeta && form.valor !== '' && !valorCero && (
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
                  {esGanancia && <Chip size="small" label="Ganancia" color="success" variant="outlined" />}
                  {esPerdida && <Chip size="small" label="Pérdida" color="error" variant="outlined" />}
                  <Chip
                    size="small"
                    label={aplica4x1000 ? 'Aplica 4x1000' : 'No aplica 4x1000'}
                    color={aplica4x1000 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Base (|valor|):</Typography>
                  <Typography variant="body2">{formatCurrency(montoBase)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">4×1000:</Typography>
                  <Typography variant="body2">{formatCurrency(cuatroPorMilCalc)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider', pt: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>Total:</Typography>
                  <Typography variant="body2" fontWeight={600} color={esPerdida ? 'error' : 'primary'}>
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
          disabled={!canSave}
        >
          {isEditing ? 'Guardar cambios' : 'Crear utilidad'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SubCuentaInfo = ({ icon, label, codigo, nombre, color = 'default' }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      border: 1,
      borderColor: 'divider',
      bgcolor: 'action.hover',
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      {icon}
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Stack>
    {codigo ? (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip size="small" label={codigo} color={color} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {nombre || '-'}
        </Typography>
      </Stack>
    ) : (
      <Typography variant="body2" color="error">
        Sin sub-cuenta asignada
      </Typography>
    )}
  </Box>
);

export default UtilidadOcasionalDialog;
