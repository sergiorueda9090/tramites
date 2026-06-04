import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

/**
 * Panel de configuración del módulo Cuatro por mil.
 * Define la sub-cuenta de DÉBITO por defecto. Todo asiento de 4x1000 se postea con:
 *   - Débito  → esta sub-cuenta
 *   - Crédito → sub-cuenta de la tarjeta del registro
 * Editable: muestra la actual y permite cambiarla.
 */
const ConfigPanel = ({ config = {}, subCuentas = [], saving = false, canEdit = true, onSave }) => {
  const findById = (id) => subCuentas.find((s) => String(s.id) === String(id)) || null;

  const [debito, setDebito] = useState(null);

  useEffect(() => {
    setDebito(findById(config.sub_cuenta_debito));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sub_cuenta_debito, subCuentas]);

  const debitoId = debito ? debito.id : null;
  const hayCambios = String(debitoId ?? '') !== String(config.sub_cuenta_debito ?? '');

  const handleGuardar = () => onSave({ sub_cuenta_debito: debitoId || '' });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <SettingsIcon color="action" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          Configuración contable del 4×1000
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada registro de 4×1000 genera un asiento contable:{' '}
        <strong>Débito</strong> a la sub-cuenta configurada aquí y{' '}
        <strong>Crédito</strong> a la sub-cuenta de la tarjeta del registro. Se puede cambiar cuando se requiera.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'flex-end' },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <AccountBalanceIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600}>
              Sub-cuenta de débito (por defecto)
            </Typography>
            {config.sub_cuenta_debito ? (
              <Chip size="small" color="success" label="Configurada" />
            ) : (
              <Chip size="small" variant="outlined" label="Sin configurar" />
            )}
          </Stack>
          <Autocomplete
            fullWidth
            size="small"
            disabled={!canEdit}
            options={subCuentas}
            value={debito}
            onChange={(_, newValue) => setDebito(newValue)}
            getOptionLabel={(option) =>
              option ? `${option.codigo} — ${option.nombre_sub_cuenta}` : ''
            }
            isOptionEqualToValue={(option, val) => option.id === val.id}
            renderInput={(params) => (
              <TextField {...params} placeholder="Buscar por código o nombre..." />
            )}
          />
          {config.sub_cuenta_debito_codigo && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Actual: {config.sub_cuenta_debito_codigo} — {config.sub_cuenta_debito_nombre}
            </Typography>
          )}
        </Box>

        {canEdit && (
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={saving || !hayCambios}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        )}
      </Box>

      {!config.sub_cuenta_debito && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1.5 }}>
          Mientras no haya una sub-cuenta de débito configurada, los nuevos 4×1000 se registran
          sin asiento contable.
        </Typography>
      )}
    </Paper>
  );
};

export default ConfigPanel;
