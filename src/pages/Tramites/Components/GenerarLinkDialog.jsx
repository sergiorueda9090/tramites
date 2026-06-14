import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Link as MuiLink,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

import {
  generarLinkPrevisoraThunk,
  generarLinkMundialThunk,
} from '../../../store/tamitesStore/tamitesThunks';
import AlertService from '../../../services/alertService';

// Tipo de documento Previsora usa código numérico; Mundial usa string.
const TIPOS_DOC_PREVISORA = [
  { codigo: 1, nombre: 'Cédula de Ciudadanía' },
  { codigo: 2, nombre: 'Cédula de Extranjería' },
  { codigo: 3, nombre: 'Tarjeta de Identidad' },
  { codigo: 4, nombre: 'Pasaporte' },
  { codigo: 5, nombre: 'NIT' },
];
const TIPOS_DOC_MUNDIAL = [
  { codigo: 'CC', nombre: 'Cédula de Ciudadanía' },
  { codigo: 'CE', nombre: 'Cédula de Extranjería' },
  { codigo: 'TI', nombre: 'Tarjeta de Identidad' },
  { codigo: 'PAS', nombre: 'Pasaporte' },
  { codigo: 'NIT', nombre: 'NIT' },
];

// Mapeo del tipo_documento del trámite (CC/CE/NIT/PAS) → código numérico Previsora.
const DOC_TRAMITE_A_PREVISORA = { CC: 1, CE: 2, TI: 3, PAS: 4, NIT: 5 };

// Determina si el trámite corresponde a una moto (regla de año/modelo aplica solo a motos).
const esMotoTramite = (t) => {
  const grupo = (t?.grupo_soat || '').toUpperCase();
  const clase = (t?.clase || '').toUpperCase();
  return grupo === 'MOTOS' || grupo === 'CICLOMOTORES' || clase.includes('MOTO');
};

// Partículas que en español forman parte del apellido y se unen al token
// siguiente ('de la cruz', 'del río'). Espejo de PARTICULAS_APELLIDO del backend.
const PARTICULAS_APELLIDO = new Set([
  'de', 'del', 'la', 'las', 'los', 'san', 'santa',
  'da', 'di', 'do', 'dos', 'van', 'von', 'mac', 'mc',
]);

// Agrupa los tokens en 'unidades': una partícula se une al token siguiente.
const agruparUnidades = (tokens) => {
  const unidades = [];
  let buffer = [];
  for (const tok of tokens) {
    buffer.push(tok);
    if (!PARTICULAS_APELLIDO.has(tok.toLowerCase())) {
      unidades.push(buffer.join(' '));
      buffer = [];
    }
  }
  if (buffer.length) {
    if (unidades.length) unidades[unidades.length - 1] += ` ${buffer.join(' ')}`;
    else unidades.push(buffer.join(' '));
  }
  return unidades;
};

// Parte el nombre completo en nombre/nombre2/apellido/apellido2 detectando
// apellidos compuestos por partículas (heurística; el operario puede corregir).
// Misma lógica que el backend (partir_nombre).
const partirNombre = (nombreCompleto) => {
  const tokens = String(nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { nombre: '', nombre2: '', apellido: '', apellido2: '' };

  const unidades = agruparUnidades(tokens);
  const n = unidades.length;
  if (n === 1) return { nombre: unidades[0], nombre2: '', apellido: '', apellido2: '' };

  let idxParticula = -1;
  for (let i = 0; i < n; i += 1) {
    if (unidades[i].toLowerCase().split(/\s+/).some((p) => PARTICULAS_APELLIDO.has(p))) {
      idxParticula = i;
      break;
    }
  }

  let corte;
  if (idxParticula > 0 && idxParticula < n) corte = idxParticula;
  else if (n === 2) corte = 1;
  else corte = n - 2;

  let nombres = unidades.slice(0, corte);
  const apellidos = unidades.slice(corte);
  if (nombres.length === 0) nombres = apellidos.length ? [apellidos.shift()] : [''];

  return {
    nombre: nombres[0] || '',
    nombre2: nombres.slice(1).join(' '),
    apellido: apellidos[0] || '',
    apellido2: apellidos.slice(1).join(' '),
  };
};

/**
 * Calcula el proveedor recomendado:
 * - Motos: modelo ≤ 2021 → Mundial; modelo ≥ 2022 → Previsora.
 * - No motos: respeta la entidad del trámite si es MUNDIAL/PREVISORA; si no, Previsora.
 */
const proveedorRecomendado = (t) => {
  const moto = esMotoTramite(t);
  const anio = parseInt(t?.modelo, 10);
  if (moto && !Number.isNaN(anio)) {
    return anio >= 2022 ? 'previsora' : 'mundial';
  }
  const entidad = (t?.entidad || '').toUpperCase();
  if (entidad === 'MUNDIAL') return 'mundial';
  if (entidad === 'PREVISORA') return 'previsora';
  return 'previsora';
};

const GenerarLinkDialog = ({ open, onClose, tramite }) => {
  const dispatch = useDispatch();

  const [provider, setProvider] = useState('previsora');
  const [usarCorreoManual, setUsarCorreoManual] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [form, setForm] = useState({
    placa: '',
    telefono: '',
    // Previsora
    tipodocumento: 1,
    documento: '',
    nombre: '',
    nombre2: '',
    apellido: '',
    apellido2: '',
    // Mundial
    tipo_documento: 'CC',
    nro_documento: '',
    // Correo manual (opcional)
    correoManual: '',
  });

  const moto = useMemo(() => esMotoTramite(tramite), [tramite]);
  const anio = useMemo(() => parseInt(tramite?.modelo, 10), [tramite]);
  const recomendado = useMemo(() => proveedorRecomendado(tramite), [tramite]);

  // Prefill al abrir / cambiar de trámite.
  useEffect(() => {
    if (!open || !tramite) return;
    const partes = partirNombre(tramite.nombre_completo);
    setForm({
      placa: (tramite.placa || '').toUpperCase(),
      telefono: tramite.telefono || '',
      tipodocumento: DOC_TRAMITE_A_PREVISORA[tramite.tipo_documento] || 1,
      documento: tramite.numero_documento || '',
      nombre: partes.nombre,
      nombre2: partes.nombre2,
      apellido: partes.apellido,
      apellido2: partes.apellido2,
      tipo_documento: ['CC', 'CE', 'TI', 'PAS', 'NIT'].includes(tramite.tipo_documento) ? tramite.tipo_documento : 'CC',
      nro_documento: tramite.numero_documento || '',
      correoManual: '',
    });
    setProvider(recomendado);
    setUsarCorreoManual(false);
    setResultado(null);
  }, [open, tramite, recomendado]);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // Aviso si el proveedor elegido contradice la regla de motos.
  const contradiceReglaMoto =
    moto && !Number.isNaN(anio) &&
    ((anio >= 2022 && provider === 'mundial') || (anio <= 2021 && provider === 'previsora'));

  const handleGenerar = async () => {
    if (!form.placa) {
      AlertService.error('Placa requerida', 'El trámite no tiene placa.');
      return;
    }
    const correo = usarCorreoManual ? (form.correoManual || '').trim() : '';
    if (usarCorreoManual && !correo) {
      AlertService.error('Correo requerido', 'Activaste "correo manual": ingresa un correo o desactívalo para usar uno aleatorio del pool.');
      return;
    }

    let payload;
    let thunk;
    if (provider === 'previsora') {
      if (!form.documento) {
        AlertService.error('Documento requerido', 'Ingresa el número de documento.');
        return;
      }
      payload = {
        placa: form.placa,
        tipodocumento: form.tipodocumento,
        documento: form.documento,
        nombre: form.nombre,
        nombre2: form.nombre2 || undefined,
        apellido: form.apellido,
        apellido2: form.apellido2 || undefined,
        telefono: form.telefono,
      };
      if (correo) payload.correo = correo;
      thunk = generarLinkPrevisoraThunk;
    } else {
      if (!form.nro_documento) {
        AlertService.error('Documento requerido', 'Ingresa el número de documento.');
        return;
      }
      payload = {
        placa: form.placa,
        tipo_documento: form.tipo_documento,
        nro_documento: form.nro_documento,
        telefono: form.telefono,
      };
      if (correo) payload.email = correo;
      thunk = generarLinkMundialThunk;
    }

    setGenerando(true);
    const res = await dispatch(thunk(payload));
    setGenerando(false);
    if (res) setResultado(res);
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      AlertService.success('Copiado', 'El link se copió al portapapeles.', { timer: 1500 });
    } catch {
      AlertService.error('Error', 'No se pudo copiar el link.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Generar link de pago — Trámite #{tramite?.id} {tramite?.placa ? `· ${tramite.placa}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {/* Contexto del vehículo */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {tramite?.tipo_vehiculo && (
            <Chip size="small" label={tramite.tipo_vehiculo === 'CERO_KM' ? 'Cero KM' : 'Usado'} color={tramite.tipo_vehiculo === 'CERO_KM' ? 'success' : 'default'} variant="outlined" />
          )}
          {tramite?.grupo_soat && <Chip size="small" label={tramite.grupo_soat_display || tramite.grupo_soat} variant="outlined" />}
          {tramite?.modelo && <Chip size="small" label={`Modelo ${tramite.modelo}`} variant="outlined" />}
          {moto && <Chip size="small" label="Moto" color="primary" variant="outlined" />}
          {tramite?.tipo_tramite === 'SOAT_ESPECIAL' && <Chip size="small" label="Caso especial" color="warning" />}
        </Box>

        {/* Recomendación */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Proveedor recomendado: {recomendado === 'previsora' ? 'Previsora' : 'Mundial'}</AlertTitle>
          {moto && !Number.isNaN(anio)
            ? `Regla motos: modelo ${anio} ${anio >= 2022 ? '≥ 2022 → Previsora' : '≤ 2021 → Mundial'}.`
            : 'No es moto (o sin año): se toma la entidad del trámite. Puedes cambiarlo manualmente.'}
        </Alert>

        {/* Selección de proveedor (override manual) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <ToggleButtonGroup
            color="primary"
            exclusive
            value={provider}
            onChange={(_, v) => v && setProvider(v)}
            size="small"
          >
            <ToggleButton value="previsora">
              Previsora {recomendado === 'previsora' && '★'}
            </ToggleButton>
            <ToggleButton value="mundial">
              Mundial {recomendado === 'mundial' && '★'}
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={<Switch checked={usarCorreoManual} onChange={(e) => setUsarCorreoManual(e.target.checked)} />}
            label="Correo manual"
          />
        </Box>

        {contradiceReglaMoto && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            El proveedor seleccionado no coincide con la regla de motos para el modelo {anio}. Continúa solo si es un caso especial.
          </Alert>
        )}

        <Divider sx={{ mb: 2 }}>
          <Chip label={provider === 'previsora' ? 'Datos Previsora' : 'Datos Mundial'} size="small" />
        </Divider>

        {/* Campos comunes + específicos por proveedor */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Placa" value={form.placa}
              onChange={(e) => setField('placa', e.target.value.toUpperCase())}
              inputProps={{ style: { textTransform: 'uppercase' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Teléfono" value={form.telefono}
              onChange={(e) => setField('telefono', e.target.value)} />
          </Grid>

          {provider === 'previsora' ? (
            <>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de documento</InputLabel>
                  <Select label="Tipo de documento" value={form.tipodocumento}
                    onChange={(e) => setField('tipodocumento', e.target.value)}>
                    {TIPOS_DOC_PREVISORA.map((t) => <MenuItem key={t.codigo} value={t.codigo}>{t.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Documento" value={form.documento}
                  onChange={(e) => setField('documento', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Primer nombre" value={form.nombre}
                  onChange={(e) => setField('nombre', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Segundo nombre (opcional)" value={form.nombre2}
                  onChange={(e) => setField('nombre2', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Primer apellido" value={form.apellido}
                  onChange={(e) => setField('apellido', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Segundo apellido (opcional)" value={form.apellido2}
                  onChange={(e) => setField('apellido2', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Los nombres/apellidos compuestos (ej. "de la cruz") se concatenan automáticamente al generar (→ "delacruz").
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de documento</InputLabel>
                  <Select label="Tipo de documento" value={form.tipo_documento}
                    onChange={(e) => setField('tipo_documento', e.target.value)}>
                    {TIPOS_DOC_MUNDIAL.map((t) => <MenuItem key={t.codigo} value={t.codigo}>{t.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth label="Número de documento" value={form.nro_documento}
                  onChange={(e) => setField('nro_documento', e.target.value)} />
              </Grid>
            </>
          )}

          {usarCorreoManual && (
            <Grid item xs={12}>
              <TextField fullWidth label="Correo (manual)" type="email" value={form.correoManual}
                onChange={(e) => setField('correoManual', e.target.value)}
                placeholder="Si lo dejas vacío se usa un correo aleatorio del pool" />
            </Grid>
          )}
        </Grid>

        {/* Resultado */}
        {resultado && (
          <Card variant="outlined" sx={{ mt: 3, borderColor: resultado.url ? 'success.main' : 'warning.main', borderWidth: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Link generado ({resultado.proveedor})
              </Typography>
              {resultado.url ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <MuiLink href={resultado.url} target="_blank" rel="noopener" sx={{ wordBreak: 'break-all', flex: 1 }}>
                    {resultado.url}
                  </MuiLink>
                  <Tooltip title="Copiar"><IconButton onClick={() => handleCopy(resultado.url)} size="small"><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Abrir"><IconButton component="a" href={resultado.url} target="_blank" rel="noopener" size="small"><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              ) : (
                <Alert severity="warning" variant="outlined" sx={{ mt: 1 }}>
                  <AlertTitle>Sin URL en la respuesta</AlertTitle>
                  El servicio respondió pero no se encontró el campo de URL. Revisa la respuesta del proveedor.
                </Alert>
              )}
              {resultado.correo_usado && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <MarkEmailReadIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Correo usado: <strong>{resultado.correo_usado}</strong>
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" startIcon={<LinkIcon />} onClick={handleGenerar} disabled={generando}>
          {generando ? 'Generando...' : 'Generar link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerarLinkDialog;
