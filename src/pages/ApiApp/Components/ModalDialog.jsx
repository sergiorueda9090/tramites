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
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';

const EndpointDialog = ({
  open,
  onClose,
  onSave,
  selectedEndpoint,
  form,
  onFormChange,
}) => {
  const isEditing = !!selectedEndpoint;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar endpoint' : 'Nuevo endpoint'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Nombre"
                value={form.nombre || ''}
                onChange={handleChange('nombre')}
                required
                placeholder="Ej: RUNT Vehiculo por Placa"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Codigo"
                value={form.codigo || ''}
                onChange={handleChange('codigo')}
                required
                placeholder="Ej: RUNT_VEHICULO"
                inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="URL Base"
            value={form.url_base || ''}
            onChange={handleChange('url_base')}
            required
            placeholder="http://190.120.231.117:8080/api/..."
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Metodo HTTP</InputLabel>
                <Select
                  value={form.metodo_http || 'GET'}
                  label="Metodo HTTP"
                  onChange={handleChange('metodo_http')}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Timeout (segundos)"
                type="number"
                value={form.timeout || 30}
                onChange={handleChange('timeout')}
                inputProps={{ min: 5, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.activo ?? true}
                    onChange={handleChange('activo')}
                  />
                }
                label="Activo"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Descripcion"
            value={form.descripcion || ''}
            onChange={handleChange('descripcion')}
            placeholder="Descripcion del proposito del endpoint..."
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear endpoint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndpointDialog;
