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
  Typography,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { USER_ROLE_LABELS } from '../../../utils/constants';

const UsuarioDialog = ({
  open,
  onClose,
  onSave,
  selectedUser,
  form,
  onFormChange,
  modules = [],
  permissions = [],
  onPermissionChange,
  onToggleModule,
}) => {
  const isEditing = !!selectedUser;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    onFormChange(field, value);
  };

  const getPermission = (moduleCode) => {
    return permissions.find((p) => p.module === moduleCode) || {
      can_view: false, can_create: false, can_edit: false, can_delete: false,
    };
  };

  const isModuleEnabled = (moduleCode) => {
    const perm = getPermission(moduleCode);
    return perm.can_view || perm.can_create || perm.can_edit || perm.can_delete;
  };

  const areAllSelected = (moduleCode) => {
    const perm = getPermission(moduleCode);
    return perm.can_view && perm.can_create && perm.can_edit && perm.can_delete;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

          {/* Sección de Permisos por Módulo */}
          {modules.length > 0 && (
            <>
              <Divider sx={{ mt: 1 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Permisos por Módulo
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Módulo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Todos</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Ver</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Crear</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Editar</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Eliminar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modules.map((mod) => {
                      const perm = getPermission(mod.code);
                      const enabled = isModuleEnabled(mod.code);
                      const allChecked = areAllSelected(mod.code);

                      return (
                        <TableRow key={mod.code} hover>
                          <TableCell>{mod.name}</TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={allChecked}
                              indeterminate={enabled && !allChecked}
                              onChange={(e) => onToggleModule(mod.code, e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.can_view}
                              onChange={(e) => onPermissionChange(mod.code, 'can_view', e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.can_create}
                              onChange={(e) => onPermissionChange(mod.code, 'can_create', e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.can_edit}
                              onChange={(e) => onPermissionChange(mod.code, 'can_edit', e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={perm.can_delete}
                              onChange={(e) => onPermissionChange(mod.code, 'can_delete', e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
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
