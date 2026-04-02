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
  Typography,
  Divider,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';

const TIPO_TRAMITE_OPTIONS = [
  { value: 'SOAT', label: 'SOAT' },
  { value: 'SOAT_ESPECIAL', label: 'SOAT Especial' },
];

const TIPO_VEHICULO_OPTIONS = [
  { value: 'USADO', label: 'Usado' },
  { value: 'CERO_KM', label: 'Cero Kilómetros' },
];

const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'C', label: 'Cédula de Ciudadanía' },
  { value: 'E', label: 'Cédula de Extranjería' },
  { value: 'N', label: 'NIT' },
  { value: 'P', label: 'Pasaporte' },
  { value: 'T', label: 'Tarjeta de Identidad' },
  { value: 'R', label: 'Registro Civil' },
  { value: 'D', label: 'Doc. Identificación Extranjero' },
  { value: 'S', label: 'Salvoconducto' },
  { value: 'L', label: 'Licencia de Conducción' },
  { value: 'PE', label: 'PEP' },
  { value: 'PT', label: 'PPT' },
];

const RegistroVehiculoDialog = ({
  open,
  onClose,
  onSave,
  selectedRegistro,
  form,
  onFormChange,
  clientes = [],
}) => {
  const isEditing = !!selectedRegistro;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar registro de vehiculo' : 'Nuevo registro de vehiculo'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

          {/* Sección: Datos del trámite */}
          <Typography variant="subtitle2" color="primary" fontWeight={600}>
            Datos del tramite
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={form.cliente || ''}
                  label="Cliente"
                  onChange={handleChange('cliente')}
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de tramite</InputLabel>
                <Select
                  value={form.tipo_tramite || 'SOAT'}
                  label="Tipo de tramite"
                  onChange={handleChange('tipo_tramite')}
                >
                  {TIPO_TRAMITE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de vehiculo</InputLabel>
                <Select
                  value={form.tipo_vehiculo || 'USADO'}
                  label="Tipo de vehiculo"
                  onChange={handleChange('tipo_vehiculo')}
                >
                  {TIPO_VEHICULO_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          {/* Sección: Datos del titular */}
          <Typography variant="subtitle2" color="primary" fontWeight={600}>
            Datos del titular
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.es_propietario ?? true}
                    onChange={handleChange('es_propietario')}
                  />
                }
                label="Es propietario"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo documento</InputLabel>
                <Select
                  value={form.tipo_documento || 'C'}
                  label="Tipo documento"
                  onChange={handleChange('tipo_documento')}
                >
                  {TIPO_DOCUMENTO_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="No. documento"
                value={form.numero_documento || ''}
                onChange={handleChange('numero_documento')}
                required
                placeholder="Ej: 1098765432"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Telefono"
                value={form.telefono || ''}
                onChange={handleChange('telefono')}
                placeholder="Ej: 3001234567"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={form.nombre_completo || ''}
                onChange={handleChange('nombre_completo')}
                required
                placeholder="Nombre completo del titular"
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Sección: Datos del vehículo */}
          <Typography variant="subtitle2" color="primary" fontWeight={600}>
            Datos del vehiculo
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Placa"
                value={form.placa || ''}
                onChange={handleChange('placa')}
                placeholder="ABC123"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Clase"
                value={form.clase || ''}
                onChange={handleChange('clase')}
                placeholder="Ej: Automovil"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Clasificacion"
                value={form.clasificacion || ''}
                onChange={handleChange('clasificacion')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tipo de servicio"
                value={form.tipo_servicio || ''}
                onChange={handleChange('tipo_servicio')}
                placeholder="Ej: Particular"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tipo carroceria"
                value={form.tipo_carroceria || ''}
                onChange={handleChange('tipo_carroceria')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="VIN"
                value={form.vin || ''}
                onChange={handleChange('vin')}
                placeholder="17 digitos"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="No. Motor"
                value={form.num_motor || ''}
                onChange={handleChange('num_motor')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="No. Chasis"
                value={form.num_chasis || ''}
                onChange={handleChange('num_chasis')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Marca"
                value={form.marca || ''}
                onChange={handleChange('marca')}
                placeholder="Ej: Chevrolet"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Linea"
                value={form.linea || ''}
                onChange={handleChange('linea')}
                placeholder="Ej: Onix"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Modelo (año)"
                value={form.modelo || ''}
                onChange={handleChange('modelo')}
                placeholder="Ej: 2023"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Cilindraje"
                value={form.cilindraje || ''}
                onChange={handleChange('cilindraje')}
                placeholder="Ej: 1600"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Color"
                value={form.color || ''}
                onChange={handleChange('color')}
                placeholder="Ej: Blanco"
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Organismo de transito"
                value={form.organismo_transito || ''}
                onChange={handleChange('organismo_transito')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear registro'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistroVehiculoDialog;
