import React, { useMemo } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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
  config = {},
}) => {
  const isEditing = !!selectedUtilidad;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const selectedTarjeta = tarjetas.find((t) => String(t.id) === String(form.tarjeta)) || null;

  const tarjetaSubCuenta = selectedTarjeta
    ? {
        codigo: selectedTarjeta.sub_cuenta_codigo,
        nombre: selectedTarjeta.sub_cuenta_nombre,
      }
    : null;

  const tipo = form.tipo || 'ganancia';
  const esGanancia = tipo === 'ganancia';
  const esPerdida = tipo === 'perdida';

  // El valor siempre es positivo; el `tipo` decide la contracuenta (config global):
  //   ganancia -> sub-cuenta de positivos | pérdida -> sub-cuenta de negativos.
  const valorNum = Math.abs(Number(form.valor));
  const tieneValor = form.valor !== '' && form.valor !== null && !Number.isNaN(valorNum) && valorNum !== 0;
  const aplicableSubCuenta = esGanancia
    ? {
        codigo: config.sub_cuenta_positiva_codigo,
        nombre: config.sub_cuenta_positiva_nombre,
        configurada: !!config.sub_cuenta_positiva,
        etiqueta: 'Sub-cuenta para ganancia (positivos)',
      }
    : {
        codigo: config.sub_cuenta_negativa_codigo,
        nombre: config.sub_cuenta_negativa_nombre,
        configurada: !!config.sub_cuenta_negativa,
        etiqueta: 'Sub-cuenta para pérdida (negativos)',
      };

  // Preview en vivo del 4x1000 y total — replica el cálculo del backend (siempre positivo).
  const { aplica4x1000, montoBase, cuatroPorMilCalc, totalCalc } = useMemo(() => {
    const aplica = selectedTarjeta?.cuatro_por_mil === '1';
    const base = Math.abs(Number(form.valor || 0)) || 0;
    const cuatro = aplica ? (base * 4) / 1000 : 0;
    return {
      aplica4x1000: aplica,
      montoBase: base,
      cuatroPorMilCalc: cuatro,
      totalCalc: base + cuatro,
    };
  }, [form.valor, selectedTarjeta]);

  // Validaciones locales.
  const tarjetaSinSubCuenta = selectedTarjeta && !tarjetaSubCuenta?.codigo;
  const valorCero = form.valor !== '' && form.valor !== null && Number(form.valor) === 0;
  // La contracuenta del tipo actual debe estar configurada en la pantalla.
  const faltaConfig = tieneValor && !aplicableSubCuenta?.configurada;
  // La contracuenta no puede coincidir con la sub-cuenta de la tarjeta.
  const mismaSubCuenta =
    aplicableSubCuenta?.codigo && tarjetaSubCuenta?.codigo &&
    String(aplicableSubCuenta.codigo) === String(tarjetaSubCuenta.codigo);

  const canSave =
    form.tarjeta && form.valor && form.fecha &&
    !valorCero && !tarjetaSinSubCuenta && !faltaConfig && !mismaSubCuenta;

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

          {/* Tipo: ganancia o pérdida. El valor siempre se ingresa positivo. */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Tipo de utilidad
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              color={esGanancia ? 'success' : 'error'}
              value={tipo}
              onChange={(_, newTipo) => { if (newTipo) onFormChange('tipo', newTipo); }}
            >
              <ToggleButton value="ganancia">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Ganancia
              </ToggleButton>
              <ToggleButton value="perdida">
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Pérdida
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={form.valor || ''}
            onChange={(e) => {
              // El valor siempre se ingresa/almacena positivo (magnitud).
              const v = e.target.value;
              onFormChange('valor', v === '' ? '' : String(Math.abs(Number(v))));
            }}
            required
            placeholder="0"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon color="action" />
                </InputAdornment>
              ),
            }}
            inputProps={{ step: '0.01', min: 0 }}
            helperText="Ingresa el valor en positivo. El tipo (ganancia/pérdida), el 4×1000 y el total se calculan automáticamente."
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

          {/* Contracuenta automatica segun el tipo (configuracion global). */}
          {aplicableSubCuenta?.configurada && (
            <SubCuentaInfo
              icon={<AccountBalanceIcon fontSize="small" />}
              label={aplicableSubCuenta.etiqueta}
              codigo={aplicableSubCuenta.codigo}
              nombre={aplicableSubCuenta.nombre}
              color={esGanancia ? 'success' : 'error'}
            />
          )}

          {tarjetaSinSubCuenta && (
            <Alert severity="error">
              La tarjeta seleccionada no tiene sub-cuenta contable asignada. Asignala antes de continuar.
            </Alert>
          )}
          {faltaConfig && (
            <Alert severity="warning">
              No hay una sub-cuenta configurada para {esGanancia ? 'ganancia (positivos)' : 'pérdida (negativos)'}.
              Configurala en la pantalla de Utilidad Ocasional antes de registrar.
            </Alert>
          )}
          {mismaSubCuenta && (
            <Alert severity="error">
              La sub-cuenta configurada coincide con la de la tarjeta. El asiento contable no se puede registrar.
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
