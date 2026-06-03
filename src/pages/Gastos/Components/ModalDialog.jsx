import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const GastoRelacionDialog = ({
  open,
  onClose,
  onSave,
  selectedGastoRelacion,
  form,
  onFormChange,
  gastos = [],
  tarjetas = [],
}) => {
  const isEditing = !!selectedGastoRelacion;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const selectedGasto = gastos.find((g) => String(g.id) === String(form.gasto)) || null;
  const selectedTarjeta = tarjetas.find((t) => String(t.id) === String(form.tarjeta)) || null;

  const gastoSubCuenta = selectedGasto
    ? {
        codigo: selectedGasto.sub_cuenta_codigo,
        nombre: selectedGasto.sub_cuenta_nombre,
      }
    : null;
  const tarjetaSubCuenta = selectedTarjeta
    ? {
        codigo: selectedTarjeta.sub_cuenta_codigo,
        nombre: selectedTarjeta.sub_cuenta_nombre,
      }
    : null;

  // Validacion local: para guardar tanto la categoria como la tarjeta deben tener sub-cuenta valida.
  const gastoSinSubCuenta = selectedGasto && !gastoSubCuenta?.codigo;
  const tarjetaSinSubCuenta = selectedTarjeta && !tarjetaSubCuenta?.codigo;
  const mismaSubCuenta =
    selectedGasto && selectedTarjeta &&
    selectedGasto.sub_cuenta &&
    selectedTarjeta.sub_cuenta &&
    selectedGasto.sub_cuenta === selectedTarjeta.sub_cuenta;

  const canSave =
    form.gasto && form.tarjeta && form.valor && form.fecha &&
    !gastoSinSubCuenta && !tarjetaSinSubCuenta && !mismaSubCuenta;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Categoría de gasto</InputLabel>
            <Select
              value={form.gasto || ''}
              label="Categoría de gasto"
              onChange={handleChange('gasto')}
            >
              {gastos.map((gasto) => (
                <MenuItem key={gasto.id} value={gasto.id}>
                  {gasto.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedGasto && (
            <SubCuentaInfo
              icon={<AccountBalanceIcon fontSize="small" />}
              label="Sub-cuenta de la categoría (DÉBITO)"
              codigo={gastoSubCuenta?.codigo}
              nombre={gastoSubCuenta?.nombre}
              color="primary"
            />
          )}

          <FormControl fullWidth required>
            <InputLabel>Tarjeta</InputLabel>
            <Select
              value={form.tarjeta || ''}
              label="Tarjeta"
              onChange={handleChange('tarjeta')}
            >
              {tarjetas.map((tarjeta) => (
                <MenuItem key={tarjeta.id} value={tarjeta.id}>
                  **** {(tarjeta.numero || '').slice(-4)} - {tarjeta.titular || ''}
                  {tarjeta.cuatro_por_mil === '1' ? ' (4x1000)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTarjeta && (
            <SubCuentaInfo
              icon={<CreditCardIcon fontSize="small" />}
              label="Sub-cuenta de la tarjeta (CRÉDITO)"
              codigo={tarjetaSubCuenta?.codigo}
              nombre={tarjetaSubCuenta?.nombre}
              color="secondary"
            />
          )}

          {gastoSinSubCuenta && (
            <Alert severity="error">
              La categoría seleccionada no tiene sub-cuenta contable asignada. Asignala antes de continuar.
            </Alert>
          )}
          {tarjetaSinSubCuenta && (
            <Alert severity="error">
              La tarjeta seleccionada no tiene sub-cuenta contable asignada. Asignala antes de continuar.
            </Alert>
          )}
          {mismaSubCuenta && (
            <Alert severity="error">
              La categoría y la tarjeta tienen la misma sub-cuenta. El asiento contable no se puede registrar.
            </Alert>
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
            inputProps={{
              min: 0,
              step: '0.01',
            }}
            helperText="El 4x1000 y total se calculan automáticamente"
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!canSave}
        >
          {isEditing ? 'Guardar cambios' : 'Crear gasto'}
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

export default GastoRelacionDialog;
