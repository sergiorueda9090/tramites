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

const TIPOS_TRAMITE = [
  { value: 'SOAT', label: 'SOAT' },
  { value: 'SOAT_ESPECIAL', label: 'SOAT Especial' },
];

const TIPOS_VEHICULO = [
  { value: '', label: 'Sin especificar' },
  { value: 'USADO', label: 'Usado' },
  { value: 'CERO_KM', label: 'Cero Kilómetros' },
];

// Catálogo de entidades por tipo de vehículo. La primera opción es el default
// que se aplica al cambiar `tipo_vehiculo` (mirror del backend en
// tramites/models.py → ENTIDAD_POR_TIPO_VEHICULO).
const ENTIDAD_LABELS = {
  MUNDIAL: 'Mundial',
  PREVISORA: 'Previsora',
  SOLIDARIA: 'Solidaria',
  MANUAL: 'Manual',
};
const ENTIDADES_POR_TIPO_VEHICULO = {
  USADO:   ['MUNDIAL', 'PREVISORA', 'MANUAL'],
  CERO_KM: ['PREVISORA', 'SOLIDARIA', 'MANUAL'],
};

const GRUPOS_SOAT = [
  { value: '', label: 'Sin especificar' },
  { value: 'MOTOS', label: 'Motos' },
  { value: 'MOTOCARROS', label: 'Motocarros' },
  { value: 'CICLOMOTORES', label: 'Ciclomotores' },
  { value: 'CARGA', label: 'Carga' },
  { value: 'CAMPEROS', label: 'Camperos' },
  { value: 'FAMILIAR_5P', label: 'Familiares 5P' },
  { value: 'INTERMUNICIPAL', label: 'Intermunicipal' },
  { value: 'TAXI', label: 'Taxi' },
  { value: 'BUS_URBANO', label: 'Bus Urbano' },
  { value: '6_PASAJEROS', label: '6+ Pasajeros' },
];

const ESTADO_OPTIONS = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

const TramiteDialog = ({
  open,
  onClose,
  onSave,
  selectedTramite,
  form,
  clientes = [],
  etiquetas = [],
  tarifarios = [],
  onFormChange,
}) => {
  const isEditing = !!selectedTramite;

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
      <DialogTitle>{isEditing ? 'Editar trámite' : 'Nuevo trámite'}</DialogTitle>
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
              label="Tipo de trámite"
              value={form.tipo_tramite || 'SOAT'}
              onChange={handleChange('tipo_tramite')}
            >
              {TIPOS_TRAMITE.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tipo de vehículo"
              value={form.tipo_vehiculo || ''}
              onChange={(event) => {
                const nuevoTipo = event.target.value;
                onFormChange('tipo_vehiculo', nuevoTipo);
                // Al cambiar tipo_vehiculo, alinear `entidad` con su default si
                // la actual no aplica al nuevo tipo.
                const opciones = ENTIDADES_POR_TIPO_VEHICULO[nuevoTipo] || [];
                if (!opciones.includes(form.entidad)) {
                  onFormChange('entidad', opciones[0] || '');
                }
              }}
            >
              {TIPOS_VEHICULO.map((t) => (
                <MenuItem key={t.value || 'none'} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Entidad"
              value={form.entidad || ''}
              onChange={handleChange('entidad')}
              helperText={form.tipo_vehiculo ? '' : 'Sin tipo de vehículo: opciones generales'}
            >
              {/* Si hay tipo_vehiculo, mostrar solo sus opciones permitidas;
                  si no, mostrar la unión de todas (4 entidades) para que el
                  usuario pueda elegir antes de definir tipo. */}
              {(form.tipo_vehiculo
                ? (ENTIDADES_POR_TIPO_VEHICULO[form.tipo_vehiculo] || [])
                : Object.keys(ENTIDAD_LABELS)
              ).map((value) => (
                <MenuItem key={value} value={value}>
                  {ENTIDAD_LABELS[value]}
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
              disabled={!form.cliente || preciosCliente.length === 0}
              helperText={!form.cliente ? 'Selecciona primero un cliente' : preciosCliente.length === 0 ? 'Este cliente no tiene precios configurados' : ''}
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              {preciosCliente.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.descripcion}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tarifario SOAT"
              value={form.tarifario_soat || ''}
              onChange={handleChange('tarifario_soat')}
            >
              <MenuItem value="">Seleccionar...</MenuItem>
              {tarifarios.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {`${t.codigo_tarifa} — ${t.descripcion}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sección: Grupo SOAT y Tarifa */}
          <Grid item xs={12}>
            <SectionHeader>Grupo SOAT y tarifa</SectionHeader>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Grupo SOAT"
              value={form.grupo_soat || ''}
              onChange={handleChange('grupo_soat')}
            >
              {GRUPOS_SOAT.map((g) => (
                <MenuItem key={g.value || 'none'} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Código de tarifa"
              value={form.tarifa_codigo || ''}
              onChange={handleChange('tarifa_codigo')}
              placeholder="Ej: 110"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tarifa manual"
              value={form.tarifa_manual ? '1' : '0'}
              onChange={(e) => onFormChange('tarifa_manual', e.target.value === '1')}
            >
              <MenuItem value="0">No (automática)</MenuItem>
              <MenuItem value="1">Sí (manual)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Precio de ley"
              value={form.precio_lay || ''}
              onChange={handleNumericChange('precio_lay')}
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
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Clase"
              value={form.clase || ''}
              onChange={handleChange('clase')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Tipo de servicio"
              value={form.tipo_servicio || ''}
              onChange={handleChange('tipo_servicio')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Color"
              value={form.color || ''}
              onChange={handleChange('color')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Marca"
              value={form.marca || ''}
              onChange={handleChange('marca')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Línea"
              value={form.linea || ''}
              onChange={handleChange('linea')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Modelo (año)"
              value={form.modelo || ''}
              onChange={handleChange('modelo')}
              inputProps={{ maxLength: 4 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Cilindraje"
              value={form.cilindraje || ''}
              onChange={handleChange('cilindraje')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Pasajeros sentados"
              value={form.pasajeros_sentados || ''}
              onChange={handleChange('pasajeros_sentados')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Capacidad de carga (kg)"
              value={form.capacidad_carga || ''}
              onChange={handleChange('capacidad_carga')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Peso bruto"
              value={form.peso_bruto || ''}
              onChange={handleChange('peso_bruto')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Chasis"
              value={form.chasis || ''}
              onChange={handleChange('chasis')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="VIN"
              value={form.vin || ''}
              onChange={handleChange('vin')}
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
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Nombre completo"
              value={form.nombre_completo || ''}
              onChange={handleChange('nombre_completo')}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Teléfono"
              value={form.telefono || ''}
              onChange={handleChange('telefono')}
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
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Dirección"
              value={form.direccion || ''}
              onChange={handleChange('direccion')}
            />
          </Grid>

          {/* Sección: Estados (solo al editar) */}
          {isEditing && (
            <>
              <Grid item xs={12}>
                <SectionHeader>Estados</SectionHeader>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Trámite"
                  value={form.tramite_estado || '1'}
                  onChange={handleChange('tramite_estado')}
                >
                  {ESTADO_OPTIONS.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
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

              <Grid item xs={12} sm={4}>
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
          {isEditing ? 'Guardar cambios' : 'Crear trámite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TramiteDialog;
