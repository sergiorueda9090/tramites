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
  FormControlLabel,
  Switch,
  Alert,
  Typography,
} from '@mui/material';

const ConmutadorIpDialog = ({
  open,
  onClose,
  onSave,
  selectedIp,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedIp;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const handleSwitchChange = (field) => (event) => {
    onFormChange(field, event.target.checked);
  };

  // Preview de la URL armada con los valores actuales del formulario
  const previewUrl = useMemo(() => {
    if (!form.ip) return '';
    const proto = form.protocolo || 'http';
    const port = form.puerto !== '' && form.puerto !== null && form.puerto !== undefined
      ? `:${form.puerto}`
      : '';
    return `${proto}://${form.ip}${port}`;
  }, [form.ip, form.puerto, form.protocolo]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar IP del conmutador' : 'Nueva IP del conmutador'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            required
            label="Nombre"
            value={form.nombre || ''}
            onChange={handleChange('nombre')}
            placeholder="Ej: Servidor RUNT principal"
          />

          <TextField
            fullWidth
            required
            label="Dirección IP"
            value={form.ip || ''}
            onChange={handleChange('ip')}
            placeholder="190.120.231.117"
            helperText="Acepta IPv4 o IPv6"
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Protocolo</InputLabel>
              <Select
                value={form.protocolo || 'http'}
                label="Protocolo"
                onChange={handleChange('protocolo')}
              >
                <MenuItem value="http">HTTP</MenuItem>
                <MenuItem value="https">HTTPS</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Puerto"
              type="number"
              value={form.puerto ?? ''}
              onChange={handleChange('puerto')}
              placeholder="8080"
              inputProps={{ min: 1, max: 65535, step: 1, style: { fontFamily: 'monospace' } }}
              helperText="1 - 65535 (opcional)"
            />
          </Box>

          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion || ''}
            onChange={handleChange('descripcion')}
            placeholder="Notas sobre el uso, propósito, etc."
            multiline
            rows={3}
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.activo)}
                onChange={handleSwitchChange('activo')}
                color="success"
              />
            }
            label={form.activo ? 'IP activa' : 'IP inactiva'}
          />

          {previewUrl && (
            <Alert severity="info" icon={false}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                URL final
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {previewUrl}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear IP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConmutadorIpDialog;
