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

const DevolucionDialog = ({
  open,
  onClose,
  onSave,
  selectedDevolucion,
  form,
  onFormChange,
  clientes = [],
  tarjetas = [],
}) => {
  const isEditing = !!selectedDevolucion;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const selectedCliente = clientes.find((c) => String(c.id) === String(form.cliente)) || null;
  const selectedTarjeta = tarjetas.find((t) => String(t.id) === String(form.tarjeta)) || null;

  const clienteSubCuenta = selectedCliente
    ? {
        codigo: selectedCliente.sub_cuenta_codigo,
        nombre: selectedCliente.sub_cuenta_nombre,
      }
    : null;
  const tarjetaSubCuenta = selectedTarjeta
    ? {
        codigo: selectedTarjeta.sub_cuenta_codigo,
        nombre: selectedTarjeta.sub_cuenta_nombre,
      }
    : null;

  // Validacion local: para guardar tanto cliente como tarjeta deben tener sub-cuenta valida.
  const clienteSinSubCuenta = selectedCliente && !clienteSubCuenta?.codigo;
  const tarjetaSinSubCuenta = selectedTarjeta && !tarjetaSubCuenta?.codigo;
  const mismaSubCuenta =
    selectedCliente && selectedTarjeta &&
    selectedCliente.sub_cuenta &&
    selectedTarjeta.sub_cuenta &&
    selectedCliente.sub_cuenta === selectedTarjeta.sub_cuenta;

  const canSave =
    form.cliente && form.tarjeta && form.valor && form.fecha &&
    !clienteSinSubCuenta && !tarjetaSinSubCuenta && !mismaSubCuenta;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar devolución' : 'Nueva devolución'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={form.cliente || ''}
              label="Cliente"
              onChange={handleChange('cliente')}
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCliente && (
            <SubCuentaInfo
              icon={<AccountBalanceIcon fontSize="small" />}
              label="Sub-cuenta del cliente (DÉBITO)"
              codigo={clienteSubCuenta?.codigo}
              nombre={clienteSubCuenta?.nombre}
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

          {clienteSinSubCuenta && (
            <Alert severity="error">
              El cliente seleccionado no tiene sub-cuenta contable asignada. Asignala antes de continuar.
            </Alert>
          )}
          {tarjetaSinSubCuenta && (
            <Alert severity="error">
              La tarjeta seleccionada no tiene sub-cuenta contable asignada. Asignala antes de continuar.
            </Alert>
          )}
          {mismaSubCuenta && (
            <Alert severity="error">
              El cliente y la tarjeta tienen la misma sub-cuenta. El asiento contable no se puede registrar.
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
            helperText="El 4x1000 y total se calculan automaticamente"
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
          {isEditing ? 'Guardar cambios' : 'Crear devolución'}
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

export default DevolucionDialog;
