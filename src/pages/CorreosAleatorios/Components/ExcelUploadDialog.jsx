import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Columnas esperadas en el Excel y sus posibles variantes
const COLUMN_ALIASES = {
  correo: ['correo', 'email', 'e-mail', 'correo electronico', 'correo electrónico', 'mail'],
  descripcion: ['descripcion', 'descripción', 'desc', 'nota', 'notas'],
  activo: ['activo', 'active', 'estado', 'habilitado'],
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Valores que se interpretan como "activo = true" en el Excel.
const ACTIVO_TRUE = ['1', 'true', 'si', 'sí', 'activo', 'x', 'yes', 'verdadero'];

const matchColumn = (header) => {
  const normalized = String(header).toLowerCase().trim();
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized)) return field;
  }
  return null;
};

const parseActivo = (valor) => {
  if (valor === '' || valor === null || valor === undefined) return true; // por defecto activo
  return ACTIVO_TRUE.includes(String(valor).toLowerCase().trim());
};

const ExcelUploadDialog = ({ open, onClose, onUpload }) => {
  const [parsedRows, setParsedRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'preview' | 'errors'
  const fileInputRef = useRef(null);

  const resetState = () => {
    setParsedRows([]);
    setErrors([]);
    setFileName('');
    setStep('select');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setErrors([{ fila: '-', correo: '-', mensajes: ['El archivo está vacío'] }]);
          setStep('errors');
          return;
        }

        // Mapear headers del Excel a campos esperados
        const headers = Object.keys(jsonData[0]);
        const columnMap = {};
        headers.forEach((h) => {
          const matched = matchColumn(h);
          if (matched) columnMap[h] = matched;
        });

        // Verificar columna obligatoria: correo
        const mappedFields = Object.values(columnMap);
        if (!mappedFields.includes('correo')) {
          setErrors([{
            fila: '-',
            correo: '-',
            mensajes: ['Columna obligatoria faltante: Correo (o Email)'],
          }]);
          setStep('errors');
          return;
        }

        // Procesar y validar filas
        const validRows = [];
        const errorRows = [];
        const vistos = new Set();

        jsonData.forEach((row, index) => {
          const mapped = {};
          Object.entries(columnMap).forEach(([excelHeader, field]) => {
            mapped[field] = row[excelHeader];
          });

          const mensajes = [];
          const correo = String(mapped.correo || '').trim().toLowerCase();

          if (!correo) {
            mensajes.push('Correo está vacío');
          } else if (!EMAIL_RE.test(correo)) {
            mensajes.push('Correo no tiene un formato válido');
          } else if (vistos.has(correo)) {
            mensajes.push('Correo duplicado dentro del archivo');
          }

          const descripcion = String(mapped.descripcion || '').trim();
          const activo = parseActivo(mapped.activo);

          if (mensajes.length > 0) {
            errorRows.push({
              fila: index + 2,
              correo: mapped.correo ?? '',
              mensajes,
            });
          } else {
            vistos.add(correo);
            validRows.push({ correo, descripcion, activo });
          }
        });

        if (errorRows.length > 0) {
          setErrors(errorRows);
          setStep('errors');
        } else {
          setParsedRows(validRows);
          setStep('preview');
        }
      } catch {
        setErrors([{
          fila: '-',
          correo: '-',
          mensajes: ['No se pudo leer el archivo. Verifique que sea un Excel válido (.xlsx, .xls)'],
        }]);
        setStep('errors');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleConfirmUpload = async () => {
    if (parsedRows.length === 0) return;

    const result = await onUpload(parsedRows);

    // Si el backend devolvió errores por fila
    if (result?.errores) {
      setErrors(result.errores);
      setStep('errors');
      return;
    }

    // Éxito
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Cargar correos desde Excel</DialogTitle>
      <DialogContent>
        {/* Paso 1: Seleccionar archivo */}
        {step === 'select' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
            <UploadFileIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Seleccione un archivo Excel (.xlsx, .xls) con las columnas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label="correo" color="primary" size="small" />
              <Chip label="descripcion (opcional)" variant="outlined" size="small" />
              <Chip label="activo (opcional)" variant="outlined" size="small" />
            </Box>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar archivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileSelect}
            />
          </Box>
        )}

        {/* Paso 2: Preview de datos válidos */}
        {step === 'preview' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="success" icon={<CheckCircleIcon />}>
              {parsedRows.length} correo{parsedRows.length !== 1 ? 's' : ''} válido{parsedRows.length !== 1 ? 's' : ''} encontrado{parsedRows.length !== 1 ? 's' : ''} en <strong>{fileName}</strong>
            </Alert>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Correo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Activo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.correo}</TableCell>
                      <TableCell>{row.descripcion || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={row.activo ? 'Sí' : 'No'} color={row.activo ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Paso 3: Errores de validación */}
        {step === 'errors' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="error" icon={<ErrorIcon />}>
              Se encontraron <strong>{errors.length}</strong> error{errors.length !== 1 ? 'es' : ''} en el archivo <strong>{fileName}</strong>.
              Corrija los datos en el archivo Excel y vuelva a cargarlo.
            </Alert>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fila</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Correo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell>{err.fila}</TableCell>
                      <TableCell>{err.correo}</TableCell>
                      <TableCell>
                        {err.mensajes.map((msg, j) => (
                          <Typography key={j} variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                            {msg}
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                setErrors([]);
                setStep('select');
              }}
            >
              Cargar otro archivo
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {step === 'preview' && (
          <Button variant="contained" onClick={handleConfirmUpload}>
            Cargar {parsedRows.length} correo{parsedRows.length !== 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExcelUploadDialog;
