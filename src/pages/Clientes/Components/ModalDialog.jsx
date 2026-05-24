import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  InputAdornment,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import * as XLSX from 'xlsx';
import { TIPO_CLIENTE_OPTIONS, MEDIO_COMUNICACION_OPTIONS } from './AdvancedFilters';
import { deletePrecioThunk } from '../../../store/clientesStore/clientesThunks';

// ============================================
// Columnas esperadas del Excel
// ============================================
const EXPECTED_COLUMNS = ['descripcion', 'codigo_tarifa'];

const COLUMN_ALIASES = {
  descripcion: ['descripcion', 'descripción', 'desc'],
  codigo_tarifa: ['codigo_tarifa', 'código tarifa', 'codigo tarifa', 'codigo', 'código', 'codigotarifa'],
};

/**
 * Normaliza nombre de columna: lowercase, trim, quita tildes
 */
const normalizeColumnName = (name) => {
  if (!name) return '';
  return name
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Encuentra la clave real del campo dado un header del Excel
 */
const matchColumn = (header) => {
  const normalized = normalizeColumnName(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((a) => normalizeColumnName(a) === normalized)) {
      return field;
    }
  }
  return null;
};

// ============================================
// ExcelPreviewDialog — muestra preview con validas e invalidas
// y pide confirmacion antes de importar las validas
// ============================================
const ExcelPreviewDialog = ({ open, onClose, onConfirm, validRows = [], errorRows = [] }) => {
  const totalRows = validRows.length + errorRows.length;
  const canImport = validRows.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Vista previa del archivo Excel
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${totalRows} fila${totalRows === 1 ? '' : 's'} en el archivo`}
            size="small"
            color="default"
          />
          <Chip
            label={`${validRows.length} valida${validRows.length === 1 ? '' : 's'}`}
            size="small"
            color="success"
          />
          <Chip
            label={`${errorRows.length} con error${errorRows.length === 1 ? '' : 'es'}`}
            size="small"
            color={errorRows.length > 0 ? 'error' : 'default'}
          />
        </Box>

        {!canImport && errorRows.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ninguna fila es valida. Corrige los errores y vuelve a subir el archivo.
          </Alert>
        )}
        {canImport && errorRows.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Al confirmar solo se importaran las <strong>{validRows.length}</strong> fila{validRows.length === 1 ? '' : 's'} valida{validRows.length === 1 ? '' : 's'}.
            Las {errorRows.length} con errores se descartaran.
          </Alert>
        )}
        {canImport && errorRows.length === 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Todas las filas son validas y listas para importar.
          </Alert>
        )}

        {validRows.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="success.main" sx={{ mt: 1, mb: 1 }}>
              Filas validas ({validRows.length})
            </Typography>
            <TableContainer sx={{ mb: 2, maxHeight: 250 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fila</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Descripcion</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Codigo tarifa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarifa SOAT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validRows.map((r, idx) => (
                    <TableRow key={idx} sx={{ bgcolor: 'success.50' }}>
                      <TableCell>{r.row}</TableCell>
                      <TableCell>{r.descripcion}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{r._codigoTexto}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {r._tarifaDescripcion} · ${Number(r._tarifaValor).toLocaleString('es-CO')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {errorRows.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="error.main" sx={{ mt: 2, mb: 1 }}>
              Filas con errores ({errorRows.length}) — no se importaran
            </Typography>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fila</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Descripcion</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Codigo tarifa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Errores</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorRows.map((err, idx) => (
                    <TableRow key={idx} sx={{ bgcolor: 'error.50' }}>
                      <TableCell>{err.row}</TableCell>
                      <TableCell>{err.descripcion || <em>(vacio)</em>}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{err.codigo_tarifa || <em>(vacio)</em>}</TableCell>
                      <TableCell>
                        {err.messages.map((msg, i) => (
                          <Chip key={i} label={msg} size="small" color="error" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="success"
          onClick={onConfirm}
          disabled={!canImport}
        >
          Importar {validRows.length} fila{validRows.length === 1 ? '' : 's'} valida{validRows.length === 1 ? '' : 's'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// CodigosValidosDialog — muestra los codigos del Tarifario SOAT
// ============================================
const CodigosValidosDialog = ({ open, onClose, tarifariosSoat = [] }) => {
  const [filtro, setFiltro] = useState('');
  const filtered = filtro
    ? tarifariosSoat.filter(
        (t) =>
          String(t.codigo_tarifa).toLowerCase().includes(filtro.toLowerCase()) ||
          String(t.descripcion).toLowerCase().includes(filtro.toLowerCase())
      )
    : tarifariosSoat;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Codigos de tarifa validos ({tarifariosSoat.length})
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Estos son los codigos disponibles del Tarifario SOAT. Usa el codigo exacto en la columna
          <code style={{ background: '#eee', padding: '0 4px', borderRadius: 2, margin: '0 4px' }}>codigo_tarifa</code>
          de tu Excel.
        </Alert>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por codigo o descripcion..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Codigo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripcion</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {tarifariosSoat.length === 0 ? 'No hay tarifarios cargados.' : 'Sin coincidencias.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.codigo_tarifa}</TableCell>
                    <TableCell>{t.descripcion}</TableCell>
                    <TableCell align="right">${Number(t.valor).toLocaleString('es-CO')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// ClienteDialog Component
// ============================================
const ClienteDialog = ({
  open,
  onClose,
  onSave,
  selectedCliente,
  form,
  onFormChange,
  onAddPrecio,
  onUpdatePrecio,
  onRemovePrecio,
  subCuentas = [],
  tarifariosSoat = [],
}) => {
  const isEditing = !!selectedCliente;
  const fileInputRef = useRef(null);
  const [excelPreview, setExcelPreview] = useState({ validRows: [], errorRows: [] });
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openCodigosDialog, setOpenCodigosDialog] = useState(false);

  const dispatch = useDispatch();

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(form.sub_cuenta)) || null;

  // Index para lookup rapido por id (Autocomplete) y por codigo (Excel upload)
  const tarifariosById = React.useMemo(
    () => Object.fromEntries(tarifariosSoat.map((t) => [String(t.id), t])),
    [tarifariosSoat]
  );
  const tarifariosByCodigo = React.useMemo(
    () => Object.fromEntries(
      tarifariosSoat.map((t) => [String(t.codigo_tarifa).trim().toLowerCase(), t])
    ),
    [tarifariosSoat]
  );

  // Calcular indices duplicados dentro del form.precios.
  // codigosDuplicados[index] = true si ese precio tiene un codigo_tarifa que tambien
  // esta usado en otro precio del mismo formulario.
  const { codigosDuplicados, hayDuplicados } = React.useMemo(() => {
    const counter = new Map();
    (form.precios || []).forEach((p) => {
      const ct = p.codigo_tarifa ? String(p.codigo_tarifa) : null;
      if (ct) counter.set(ct, (counter.get(ct) || 0) + 1);
    });
    const dups = (form.precios || []).map((p) => {
      const ct = p.codigo_tarifa ? String(p.codigo_tarifa) : null;
      return ct ? (counter.get(ct) || 0) > 1 : false;
    });
    return { codigosDuplicados: dups, hayDuplicados: dups.some(Boolean) };
  }, [form.precios]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    onFormChange(field, value);
  };

  const handlePrecioChange = (index, field) => (event) => {
    if (onUpdatePrecio) {
      onUpdatePrecio(index, { [field]: event.target.value });
    }
  };

  const handleAddPrecio = () => {
    if (onAddPrecio) {
      onAddPrecio({
        descripcion: '',
        codigo_tarifa: '',
      });
    }
  };
  const handleRemovePrecio = async (index) => {
    const precio = form.precios?.[index];
    const clienteId = selectedCliente?.id;

    // Si el precio ya existe en BD, eliminarlo via API
    if (clienteId && precio?.id) {
      const result = await dispatch(deletePrecioThunk(clienteId, precio.id));
      if (!result) return; // El usuario canceló o hubo error
    }

    // Remover del formulario
    if (onRemovePrecio) onRemovePrecio(index);
  };

  // ==========================================
  // Excel Upload
  // ==========================================
  const handleExcelUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setExcelPreview({
            validRows: [],
            errorRows: [{ row: '-', descripcion: '-', codigo_tarifa: '-', messages: ['El archivo esta vacio'] }],
          });
          setOpenPreviewDialog(true);
          return;
        }

        // Mapear headers del Excel a campos esperados
        const headers = Object.keys(jsonData[0]);
        const columnMap = {};
        headers.forEach((h) => {
          const matched = matchColumn(h);
          if (matched) columnMap[h] = matched;
        });

        // Verificar que las columnas esperadas esten presentes
        const mappedFields = Object.values(columnMap);
        const missingColumns = EXPECTED_COLUMNS.filter((c) => !mappedFields.includes(c));
        if (missingColumns.length > 0) {
          const labels = { descripcion: 'Descripcion', codigo_tarifa: 'Codigo tarifa' };
          setExcelPreview({
            validRows: [],
            errorRows: [{
              row: '-',
              descripcion: '-',
              codigo_tarifa: '-',
              messages: [`Columnas faltantes: ${missingColumns.map((c) => labels[c]).join(', ')}`],
            }],
          });
          setOpenPreviewDialog(true);
          return;
        }

        // Codigos YA presentes en el formulario (precios actuales del cliente).
        // Permite detectar duplicados entre Excel y los precios ya configurados.
        const codigosEnForm = new Map(); // codigo_tarifa_id (str) -> descripcion actual
        (form.precios || []).forEach((p) => {
          if (p.codigo_tarifa) {
            codigosEnForm.set(String(p.codigo_tarifa), p.descripcion || '(sin descripcion)');
          }
        });

        // Procesar filas con deteccion de duplicados:
        //   - intra-Excel: dos filas con el mismo codigo_tarifa
        //   - contra form.precios: codigo ya configurado en el cliente
        const validRows = [];
        const errorRows = [];
        const codigosVistosEnExcel = new Map(); // codigoLower -> {row, descripcion}

        jsonData.forEach((row, index) => {
          const mapped = {};
          Object.entries(columnMap).forEach(([excelHeader, field]) => {
            mapped[field] = row[excelHeader];
          });

          const messages = [];

          // Validar descripcion
          const desc = String(mapped.descripcion || '').trim();
          if (!desc) messages.push('Descripcion vacia');

          // Validar codigo_tarifa: tiene que existir en el tarifario SOAT
          const codigoRaw = String(mapped.codigo_tarifa || '').trim();
          let tarifa = null;
          if (!codigoRaw) {
            messages.push('Codigo tarifa vacio');
          } else {
            tarifa = tarifariosByCodigo[codigoRaw.toLowerCase()] || null;
            if (!tarifa) {
              messages.push(`Codigo "${codigoRaw}" no existe en el Tarifario SOAT`);
            }
          }

          // Validar duplicados solo si el codigo es valido
          if (tarifa) {
            const codigoKey = codigoRaw.toLowerCase();
            // 1) Duplicado intra-Excel
            const previo = codigosVistosEnExcel.get(codigoKey);
            if (previo) {
              messages.push(`Codigo "${tarifa.codigo_tarifa}" duplicado en el archivo (ya aparecio en la fila ${previo.row})`);
            }
            // 2) Duplicado contra precios ya configurados en el formulario
            const descActual = codigosEnForm.get(String(tarifa.id));
            if (descActual) {
              messages.push(`El cliente ya tiene el codigo "${tarifa.codigo_tarifa}" en el precio "${descActual}"`);
            }
          }

          if (messages.length > 0) {
            errorRows.push({
              row: index + 2,
              descripcion: mapped.descripcion ?? '',
              codigo_tarifa: mapped.codigo_tarifa ?? '',
              messages,
            });
          } else {
            // Marcar como visto para detectar duplicados en filas siguientes
            codigosVistosEnExcel.set(codigoRaw.toLowerCase(), { row: index + 2, descripcion: desc });
            validRows.push({
              row: index + 2,
              descripcion: desc,
              codigo_tarifa: tarifa.id,
              _codigoTexto: tarifa.codigo_tarifa,
              _tarifaDescripcion: tarifa.descripcion,
              _tarifaValor: tarifa.valor,
            });
          }
        });

        // Mostrar preview con validas + invalidas. El usuario decide si importar.
        setExcelPreview({ validRows, errorRows });
        setOpenPreviewDialog(true);
      } catch {
        setExcelPreview({
          validRows: [],
          errorRows: [{ row: '-', descripcion: '-', codigo_tarifa: '-', messages: ['No se pudo leer el archivo. Verifique que sea un Excel valido (.xlsx, .xls)'] }],
        });
        setOpenPreviewDialog(true);
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset para permitir subir el mismo archivo nuevamente
    event.target.value = '';
  };

  // Confirmar importacion: agrega las filas validas al formulario y cierra el preview
  const handleConfirmImport = () => {
    const { validRows } = excelPreview;
    validRows.forEach((row) => {
      if (onAddPrecio) {
        onAddPrecio({
          descripcion: row.descripcion,
          codigo_tarifa: row.codigo_tarifa,
        });
      }
    });
    setOpenPreviewDialog(false);
    setExcelPreview({ validRows: [], errorRows: [] });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Color picker */}
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={form.color || '#1976d2'}
              onChange={handleChange('color')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ColorLensIcon sx={{ color: form.color || '#1976d2' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& input[type="color"]': {
                  width: 50,
                  height: 30,
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                },
              }}
            />

            <TextField
              fullWidth
              label="Nombre"
              value={form.nombre || ''}
              onChange={handleChange('nombre')}
              required
            />

            <TextField
              fullWidth
              label="Telefono"
              value={form.telefono || ''}
              onChange={handleChange('telefono')}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email || ''}
              onChange={handleChange('email')}
            />

            <TextField
              fullWidth
              label="Direccion"
              value={form.direccion || ''}
              onChange={handleChange('direccion')}
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de cliente</InputLabel>
              <Select
                label="Tipo de cliente"
                value={form.tipo_cliente || 'particular'}
                onChange={handleChange('tipo_cliente')}
              >
                {TIPO_CLIENTE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Medio de comunicacion</InputLabel>
              <Select
                label="Medio de comunicacion"
                value={form.medio_comunicacion || 'email'}
                onChange={handleChange('medio_comunicacion')}
              >
                {MEDIO_COMUNICACION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              fullWidth
              options={subCuentas}
              value={selectedSubCuenta}
              onChange={(_, newValue) => onFormChange('sub_cuenta', newValue ? newValue.id : '')}
              getOptionLabel={(option) =>
                option ? `${option.codigo} — ${option.nombre_sub_cuenta}` : ''
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sub-cuenta"
                  required
                  placeholder="Buscar por código o nombre..."
                  helperText="Obligatoria: cada cliente debe estar asociado a una sub-cuenta contable"
                />
              )}
            />

            {/* Seccion de precios */}
            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Precios del cliente
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleExcelUpload}
                />
                <Tooltip title={`Ver los ${tarifariosSoat.length} codigos disponibles del Tarifario SOAT`}>
                  <Button
                    size="small"
                    onClick={() => setOpenCodigosDialog(true)}
                    variant="outlined"
                    color="info"
                  >
                    Ver codigos validos
                  </Button>
                </Tooltip>
                <Tooltip title="Cargar precios desde archivo Excel (.xlsx). Columnas: descripcion, codigo_tarifa. Veras un preview antes de importar.">
                  <Button
                    size="small"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    variant="outlined"
                    color="success"
                  >
                    Cargar Excel
                  </Button>
                </Tooltip>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddPrecio}
                  variant="outlined"
                >
                  Agregar precio
                </Button>
              </Box>
            </Box>

            {/* Instrucciones para subir el Excel — evita errores comunes */}
            <Alert
              severity="info"
              variant="outlined"
              icon={<UploadFileIcon fontSize="small" />}
              sx={{ '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Como subir el Excel de precios
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 0.3 } }}>
                <li>
                  Formato del archivo: <strong>.xlsx</strong> o <strong>.xls</strong>.
                </li>
                <li>
                  Columnas requeridas (en la primera fila, en cualquier orden):
                  <Box component="code" sx={{ mx: 0.5, px: 0.6, bgcolor: 'action.hover', borderRadius: 0.5, fontFamily: 'monospace' }}>
                    descripcion
                  </Box>
                  y
                  <Box component="code" sx={{ mx: 0.5, px: 0.6, bgcolor: 'action.hover', borderRadius: 0.5, fontFamily: 'monospace' }}>
                    codigo_tarifa
                  </Box>
                  .
                </li>
                <li>
                  <strong>descripcion</strong>: texto libre, no puede estar vacia.
                </li>
                <li>
                  <strong>codigo_tarifa</strong>: debe coincidir <em>exactamente</em> con un codigo
                  registrado en el Tarifario SOAT — pulsa "Ver codigos validos" para listarlos.
                </li>
                <li>
                  <strong>Sin duplicados</strong>: el mismo codigo no puede repetirse entre filas del Excel,
                  ni coincidir con un codigo ya configurado en este cliente.
                </li>
                <li>
                  Despues de subir veras un <strong>preview</strong> con las filas validas en verde y
                  los errores en rojo. Solo se importan las validas cuando confirmas.
                </li>
              </Box>
            </Alert>

            {hayDuplicados && (
              <Alert severity="error" sx={{ mb: 1 }}>
                Hay codigos de tarifa <strong>duplicados</strong> entre los precios.
                Cada cliente debe tener codigos unicos. Corrige los marcados en rojo antes de guardar.
              </Alert>
            )}

            {form.precios && form.precios.length > 0 ? (
              form.precios.map((precio, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                      size="small"
                      label="Descripcion"
                      value={precio.descripcion || ''}
                      onChange={handlePrecioChange(index, 'descripcion')}
                      sx={{ flex: 2 }}
                    />
                    <Autocomplete
                      size="small"
                      options={tarifariosSoat}
                      value={tarifariosById[String(precio.codigo_tarifa)] || null}
                      onChange={(_, newValue) =>
                        onUpdatePrecio && onUpdatePrecio(index, { codigo_tarifa: newValue ? newValue.id : '' })
                      }
                      getOptionLabel={(option) =>
                        option ? `${option.codigo_tarifa} — ${option.descripcion}` : ''
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {option.codigo_tarifa}
                            </Box>
                            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              {option.descripcion} · ${Number(option.valor).toLocaleString('es-CO')}
                            </Box>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Codigo tarifa"
                          required
                          placeholder="Buscar por codigo o descripcion..."
                          error={codigosDuplicados[index]}
                          helperText={codigosDuplicados[index] ? 'Codigo duplicado: ya esta en otro precio' : undefined}
                        />
                      )}
                      sx={{ flex: 2 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => handleRemovePrecio(index)}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No hay precios configurados. Agrega manualmente o carga un archivo Excel.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={!form.nombre || !form.sub_cuenta || hayDuplicados}
          >
            {isEditing ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de preview del Excel (validas + invalidas, pide confirmacion) */}
      <ExcelPreviewDialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        onConfirm={handleConfirmImport}
        validRows={excelPreview.validRows}
        errorRows={excelPreview.errorRows}
      />

      {/* Dialog con la lista de codigos de tarifa validos */}
      <CodigosValidosDialog
        open={openCodigosDialog}
        onClose={() => setOpenCodigosDialog(false)}
        tarifariosSoat={tarifariosSoat}
      />
    </>
  );
};

export default ClienteDialog;
