import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';

// Genera un correo aleatorio en el cliente (para prellenar el campo).
const DOMINIOS_CORREO = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.es'];
const generarCorreoLocal = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const len = 8 + Math.floor(Math.random() * 7);
  let local = '';
  for (let i = 0; i < len; i++) local += chars[Math.floor(Math.random() * chars.length)];
  return `${local}@${DOMINIOS_CORREO[Math.floor(Math.random() * DOMINIOS_CORREO.length)]}`;
};

const CorreoDialog = ({ open, onClose, onSave, selectedCorreo, form, onFormChange }) => {
  const isEditing = !!selectedCorreo;

  const handleChange = (field) => (event) => onFormChange(field, event.target.value);
  const handleSwitchChange = (field) => (event) => onFormChange(field, event.target.checked);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar correo' : 'Agregar correo'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            required
            type="email"
            label="Correo"
            value={form.correo || ''}
            onChange={handleChange('correo')}
            placeholder="ejemplo@dominio.com"
            inputProps={{ style: { fontFamily: 'monospace' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Generar correo aleatorio">
                    <IconButton onClick={() => onFormChange('correo', generarCorreoLocal())} edge="end">
                      <CasinoIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion || ''}
            onChange={handleChange('descripcion')}
            placeholder="Notas opcionales sobre este correo"
            multiline
            rows={2}
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.activo)}
                onChange={handleSwitchChange('activo')}
                color="success"
              />
            }
            label={form.activo ? 'Activo (entra en la selección aleatoria)' : 'Inactivo'}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorreoDialog;
