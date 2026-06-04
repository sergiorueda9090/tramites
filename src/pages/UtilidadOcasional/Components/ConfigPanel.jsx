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
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * Panel de configuración global de sub-cuentas para Utilidad Ocasional.
 * Define qué sub-cuenta (contracuenta) se usa según el signo del valor:
 *   - Positivos (ganancia)  → sub_cuenta_positiva
 *   - Negativos (pérdida)   → sub_cuenta_negativa
 * Editable: muestra la actual y permite cambiarla. Ambas deben ser distintas.
 */
const ConfigPanel = ({ config = {}, subCuentas = [], saving = false, canEdit = true, onSave }) => {
  const findById = (id) =>
    subCuentas.find((s) => String(s.id) === String(id)) || null;

  const [positiva, setPositiva] = useState(null);
  const [negativa, setNegativa] = useState(null);

  // Sincronizar con la config cargada / actualizada del backend.
  useEffect(() => {
    setPositiva(findById(config.sub_cuenta_positiva));
    setNegativa(findById(config.sub_cuenta_negativa));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sub_cuenta_positiva, config.sub_cuenta_negativa, subCuentas]);

  const positivaId = positiva ? positiva.id : null;
  const negativaId = negativa ? negativa.id : null;

  const mismaCuenta = positivaId && negativaId && String(positivaId) === String(negativaId);
  const hayCambios =
    String(positivaId ?? '') !== String(config.sub_cuenta_positiva ?? '') ||
    String(negativaId ?? '') !== String(config.sub_cuenta_negativa ?? '');

  const handleGuardar = () => {
    onSave({
      sub_cuenta_positiva: positivaId || '',
      sub_cuenta_negativa: negativaId || '',
    });
  };

  const renderAutocomplete = (value, setValue, otherId) => (
    <Autocomplete
      fullWidth
      size="small"
      disabled={!canEdit}
      options={subCuentas}
      value={value}
      onChange={(_, newValue) => setValue(newValue)}
      getOptionLabel={(option) =>
        option ? `${option.codigo} — ${option.nombre_sub_cuenta}` : ''
      }
      isOptionEqualToValue={(option, val) => option.id === val.id}
      getOptionDisabled={(option) => otherId && String(option.id) === String(otherId)}
      renderInput={(params) => (
        <TextField {...params} placeholder="Buscar por código o nombre..." />
      )}
    />
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <SettingsIcon color="action" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          Configuración de sub-cuentas
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Define la contracuenta contable que se usará automáticamente según el signo del valor
        al registrar una utilidad ocasional. Se puede cambiar cuando se requiera.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'flex-start' },
        }}
      >
        {/* Positivos */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <TrendingUpIcon fontSize="small" color="success" />
            <Typography variant="body2" fontWeight={600}>
              Valores positivos (ganancia)
            </Typography>
            {config.sub_cuenta_positiva ? (
              <Chip size="small" color="success" label="Configurada" />
            ) : (
              <Chip size="small" variant="outlined" label="Sin configurar" />
            )}
          </Stack>
          {renderAutocomplete(positiva, setPositiva, negativaId)}
          {config.sub_cuenta_positiva_codigo && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Actual: {config.sub_cuenta_positiva_codigo} — {config.sub_cuenta_positiva_nombre}
            </Typography>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Negativos */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <TrendingDownIcon fontSize="small" color="error" />
            <Typography variant="body2" fontWeight={600}>
              Valores negativos (pérdida)
            </Typography>
            {config.sub_cuenta_negativa ? (
              <Chip size="small" color="error" label="Configurada" />
            ) : (
              <Chip size="small" variant="outlined" label="Sin configurar" />
            )}
          </Stack>
          {renderAutocomplete(negativa, setNegativa, positivaId)}
          {config.sub_cuenta_negativa_codigo && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Actual: {config.sub_cuenta_negativa_codigo} — {config.sub_cuenta_negativa_nombre}
            </Typography>
          )}
        </Box>
      </Box>

      {mismaCuenta && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.5 }}>
          La sub-cuenta de positivos y la de negativos deben ser distintas.
        </Typography>
      )}

      {canEdit && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={saving || mismaCuenta || !hayCambios}
          >
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ConfigPanel;
