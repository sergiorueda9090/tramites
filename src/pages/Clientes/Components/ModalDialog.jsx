import React, { useRef, useState } from 'react';
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
const EXPECTED_COLUMNS = ['descripcion', 'precio_lay', 'comision'];

const COLUMN_ALIASES = {
  descripcion: ['descripcion', 'descripción', 'desc'],
  precio_lay: ['precio_lay', 'precio_ley', 'precio ley', 'precio lay', 'precioley', 'preciolay', 'precio'],
  comision: ['comision', 'comisión', 'commission'],
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
// ErrorDialog — muestra filas con errores
// ============================================
const ExcelErrorsDialog = ({ open, onClose, errors }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" fontWeight={600}>
        Errores en el archivo Excel
      </Typography>
      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Las siguientes filas no se pudieron importar porque contienen datos invalidos.
        Las filas validas ya fueron agregadas.
      </Alert>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Fila</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Descripcion</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Precio Ley</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Comision</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Errores</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errors.map((err, idx) => (
              <TableRow key={idx} sx={{ bgcolor: 'error.50' }}>
                <TableCell>{err.row}</TableCell>
                <TableCell>{err.descripcion ?? '-'}</TableCell>
                <TableCell>{err.precio_lay ?? '-'}</TableCell>
                <TableCell>{err.comision ?? '-'}</TableCell>
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
    </DialogContent>
    <DialogActions>
      <Button variant="contained" onClick={onClose}>Entendido</Button>
    </DialogActions>
  </Dialog>
);

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
}) => {
  const isEditing = !!selectedCliente;
  const fileInputRef = useRef(null);
  const [excelErrors, setExcelErrors] = useState([]);
  const [openErrorsDialog, setOpenErrorsDialog] = useState(false);

  const dispatch = useDispatch();


  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    onFormChange(field, value);
  };

  const formatThousands = (value) => {
    if (!value && value !== 0) return '';
    const num = Math.round(Number(value));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const handlePrecioChange = (index, field) => (event) => {
    if (onUpdatePrecio) {
      onUpdatePrecio(index, { [field]: event.target.value });
    }
  };

  const handlePrecioCurrencyChange = (index, field) => (event) => {
    if (onUpdatePrecio) {
      const raw = event.target.value.replace(/\D/g, '');
      onUpdatePrecio(index, { [field]: raw });
    }
  };

  const handleAddPrecio = () => {
    if (onAddPrecio) {
      onAddPrecio({
        descripcion: '',
        precio_lay: '',
        comision: '',
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
          setExcelErrors([{ row: '-', descripcion: '-', precio_lay: '-', comision: '-', messages: ['El archivo esta vacio'] }]);
          setOpenErrorsDialog(true);
          return;
        }

        // Mapear headers del Excel a campos esperados
        const headers = Object.keys(jsonData[0]);
        const columnMap = {};
        headers.forEach((h) => {
          const matched = matchColumn(h);
          if (matched) columnMap[h] = matched;
        });

        // Verificar que las 3 columnas esperadas esten presentes
        const mappedFields = Object.values(columnMap);
        const missingColumns = EXPECTED_COLUMNS.filter((c) => !mappedFields.includes(c));
        if (missingColumns.length > 0) {
          const labels = { descripcion: 'Descripcion', precio_lay: 'Precio Ley', comision: 'Comision' };
          setExcelErrors([{
            row: '-',
            descripcion: '-',
            precio_lay: '-',
            comision: '-',
            messages: [`Columnas faltantes: ${missingColumns.map((c) => labels[c]).join(', ')}`],
          }]);
          setOpenErrorsDialog(true);
          return;
        }

        // Procesar filas
        const validRows = [];
        const errorRows = [];

        jsonData.forEach((row, index) => {
          const mapped = {};
          Object.entries(columnMap).forEach(([excelHeader, field]) => {
            mapped[field] = row[excelHeader];
          });

          const messages = [];

          // Validar descripcion
          const desc = String(mapped.descripcion || '').trim();
          if (!desc) messages.push('Descripcion vacia');

          // Validar precio_lay
          const precioRaw = String(mapped.precio_lay || '').replace(/[^0-9.,]/g, '').replace(',', '.');
          const precioNum = Number(precioRaw);
          if (!precioRaw || isNaN(precioNum) || precioNum < 0) {
            messages.push('Precio Ley invalido');
          }

          // Validar comision
          const comisionRaw = String(mapped.comision || '').replace(/[^0-9.,]/g, '').replace(',', '.');
          const comisionNum = Number(comisionRaw);
          if (!comisionRaw || isNaN(comisionNum) || comisionNum < 0) {
            messages.push('Comision invalida');
          }

          if (messages.length > 0) {
            errorRows.push({
              row: index + 2, // +2 = header + base-1
              descripcion: mapped.descripcion ?? '',
              precio_lay: mapped.precio_lay ?? '',
              comision: mapped.comision ?? '',
              messages,
            });
          } else {
            validRows.push({
              descripcion: desc,
              precio_lay: String(Math.round(precioNum)),
              comision: String(Math.round(comisionNum)),
            });
          }
        });

        // Agregar filas validas al formulario
        validRows.forEach((precio) => {
          if (onAddPrecio) onAddPrecio(precio);
        });

        // Mostrar errores si los hay
        if (errorRows.length > 0) {
          setExcelErrors(errorRows);
          setOpenErrorsDialog(true);
        }
      } catch {
        setExcelErrors([{ row: '-', descripcion: '-', precio_lay: '-', comision: '-', messages: ['No se pudo leer el archivo. Verifique que sea un Excel valido (.xlsx, .xls)'] }]);
        setOpenErrorsDialog(true);
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset para permitir subir el mismo archivo nuevamente
    event.target.value = '';
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
                <Tooltip title="Cargar precios desde archivo Excel (.xlsx). Columnas: descripcion, precio_lay, comision">
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
                    <TextField
                      size="small"
                      label="Precio Ley"
                      value={formatThousands(precio.precio_lay)}
                      onChange={handlePrecioCurrencyChange(index, 'precio_lay')}
                      sx={{ flex: 1 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                    <TextField
                      size="small"
                      label="Comision"
                      value={formatThousands(precio.comision)}
                      onChange={handlePrecioCurrencyChange(index, 'comision')}
                      sx={{ flex: 1 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
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
          <Button variant="contained" onClick={onSave}>
            {isEditing ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de errores de Excel */}
      <ExcelErrorsDialog
        open={openErrorsDialog}
        onClose={() => setOpenErrorsDialog(false)}
        errors={excelErrors}
      />
    </>
  );
};

export default ClienteDialog;
