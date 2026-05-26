import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  Divider,
  InputAdornment,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'Número de Identificación Tributaria' },
  { value: 'PAS', label: 'Pasaporte' },
];

const ESTADO_OPTIONS = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

const CasoEspecialDialog = ({
  open,
  onClose,
  onSave,
  selectedCaso,
  form,
  clientes = [],
  etiquetas = [],
  onFormChange,
}) => {
  const isEditing = !!selectedCaso;

  const handleChange = (field) => (event) => {
    onFormChange(field, event.target.value);
  };

  const handleNumericChange = (field) => (event) => {
    const raw = event.target.value.replace(/[^\d.]/g, '');
    onFormChange(field, raw);
  };

  // Precios del cliente seleccionado (para el select de precio_cliente)
  const preciosCliente = useMemo(() => {
    const cliente = clientes.find((c) => String(c.id) === String(form.cliente));
    return cliente?.precios || [];
  }, [clientes, form.cliente]);

  const SectionHeader = ({ children }) => (
    <Box sx={{ mt: 1, mb: 0.5 }}>
      <Typography variant="subtitle2" fontWeight={700} color="primary">
        {children}
      </Typography>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Editar caso especial' : 'Nuevo caso especial'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Sección: Datos generales */}
          <Grid item xs={12}>
            <SectionHeader>Datos generales</SectionHeader>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Cliente"
              value={form.cliente || ''}
              onChange={handleChange('cliente')}
              required
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Etiqueta"
              value={form.etiqueta || ''}
              onChange={handleChange('etiqueta')}
              required
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              {etiquetas.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Precio cliente"
              value={form.precio_cliente || ''}
              onChange={handleChange('precio_cliente')}
              required
              disabled={!form.cliente || preciosCliente.length === 0}
              helperText={!form.cliente ? 'Selecciona primero un cliente' : preciosCliente.length === 0 ? 'Este cliente no tiene precios configurados' : ''}
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              {preciosCliente.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {`${p.codigo_tarifa_codigo || ''} — ${p.codigo_tarifa_descripcion || ''}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Descripción"
              value={form.descripcion || ''}
              onChange={handleChange('descripcion')}
              required
              multiline
              rows={1}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Precio de ley"
              value={form.precio_lay || ''}
              onChange={handleNumericChange('precio_lay')}
              required
              placeholder="0"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Comisión"
              value={form.comision || ''}
              onChange={handleNumericChange('comision')}
              required
              placeholder="0"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Sección: Datos del vehículo */}
          <Grid item xs={12}>
            <SectionHeader>Datos del vehículo</SectionHeader>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Placa"
              value={form.placa || ''}
              onChange={handleChange('placa')}
              required
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Cilindraje"
              value={form.clindraje || ''}
              onChange={handleChange('clindraje')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Modelo (año)"
              value={form.modelo || ''}
              onChange={handleChange('modelo')}
              required
              inputProps={{ maxLength: 4 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Chasis"
              value={form.chasis || ''}
              onChange={handleChange('chasis')}
              required
            />
          </Grid>

          {/* Sección: Datos del titular */}
          <Grid item xs={12}>
            <SectionHeader>Datos del titular</SectionHeader>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tipo documento"
              value={form.tipo_documento || 'CC'}
              onChange={handleChange('tipo_documento')}
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Número documento"
              value={form.numero_documento || ''}
              onChange={handleChange('numero_documento')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Nombre completo"
              value={form.nombre_completo || ''}
              onChange={handleChange('nombre_completo')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Teléfono"
              value={form.telefono || ''}
              onChange={handleChange('telefono')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Correo"
              type="email"
              value={form.correo || ''}
              onChange={handleChange('correo')}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Dirección"
              value={form.direccion || ''}
              onChange={handleChange('direccion')}
              required
            />
          </Grid>

          {/* Sección: Estados (solo al editar) */}
          {isEditing && (
            <>
              <Grid item xs={12}>
                <SectionHeader>Estados</SectionHeader>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Caso especial"
                  value={form.caso_especial_estado || '1'}
                  onChange={handleChange('caso_especial_estado')}
                >
                  {ESTADO_OPTIONS.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Trámite"
                  value={form.tramite_estado || '0'}
                  onChange={handleChange('tramite_estado')}
                >
                  {ESTADO_OPTIONS.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Confirmación"
                  value={form.confirmacion_estado || '0'}
                  onChange={handleChange('confirmacion_estado')}
                >
                  {ESTADO_OPTIONS.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Cargar PDF"
                  value={form.cargar_pdf_estado || '0'}
                  onChange={handleChange('cargar_pdf_estado')}
                >
                  {ESTADO_OPTIONS.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          {isEditing ? 'Guardar cambios' : 'Crear caso especial'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CasoEspecialDialog;
