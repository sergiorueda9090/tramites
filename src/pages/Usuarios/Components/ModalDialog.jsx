import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { USER_ROLE_LABELS } from '../../../utils/constants';

const UsuarioDialog = ({
  open,
  onClose,
  onSave,
  selectedUser,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedUser;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="username"
            value={form.username}
            onChange={handleChange('username')}
          />
          <TextField
            fullWidth
            label="Nombre"
            value={form.first_name}
            onChange={handleChange('first_name')}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={form.role}
              onChange={handleChange('role')}
            >
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isEditing && (
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
            />
          )}
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={handleChange('is_active')}
              />
            }
            label="Usuario activo"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsuarioDialog;
