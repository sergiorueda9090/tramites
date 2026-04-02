import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PhoneIcon from '@mui/icons-material/Phone';
import InputAdornment from '@mui/material/InputAdornment';

import {
  selectTipoVehiculo,
  selectTitularCotizacion,
  selectMetodoConsulta,
  selectConsultaPlaca,
  selectConsultaDocumento,
  selectTipoDocumento,
  selectConsultaTelefono,
  selectDatosManual,
  setMetodoConsulta,
  setConsultaPlaca,
  setConsultaDocumento,
  setTipoDocumento,
  setConsultaTelefono,
  setImagenLista,
  setDatosManual,
} from '../../../store/cotizadorStore/cotizadorSlice';
import { setVehiculo, selectNombres, selectApellidos } from '../../../store/apisExternasStore/apisExternasRuntStore';
import MetodoConsultaCard from '../Components/MetodoConsultaCard';
import { consultarRuntThunk, extraerDatosRuntThunk, extraerDatosFotoVinThunk, extraerDatosAPIFalabellaThunk, consultarNombreClienteThunk } from '../../../store/apisExternasStore/apisExternasRuntThunks';

const TIPOS_DOCUMENTO = [
  { codigo: 'C', nombre: 'Cédula de Ciudadanía' },
  { codigo: 'E', nombre: 'Cédula de Extranjería' },
  { codigo: 'N', nombre: 'NIT' },
  { codigo: 'P', nombre: 'Pasaporte' },
  { codigo: 'T', nombre: 'Tarjeta de Identidad' },
  { codigo: 'R', nombre: 'Registro Civil' },
  { codigo: 'D', nombre: 'Documento de Identificación Extranjero' },
  { codigo: 'S', nombre: 'Salvoconducto' },
  { codigo: 'L', nombre: 'Licencia de Conducción' },
  { codigo: 'PE', nombre: 'Permiso Especial de Permanencia (PEP)' },
  { codigo: 'PT', nombre: 'Permiso por Protección Temporal (PPT)' },
];

const METODOS_USADO = [
  {
    codigo: 'PLACA_RUNT',
    nombre: 'Placa + Documento en RUNT',
    descripcion: 'Consulta con número de placa y documento del propietario en el RUNT',
    Icono: SearchIcon,
  },
  {
    codigo: 'IA_FOTO_TARJETA',
    nombre: 'IA Foto Tarjeta de Propiedad',
    descripcion: 'Escanear tarjeta de propiedad con inteligencia artificial',
    Icono: PhotoCameraIcon,
  },
  {
    codigo: 'IA_VIN_RUNT',
    nombre: 'IA Foto VIN+ Documento en RUNT',
    descripcion: 'Escanear foto con IA y verificar en RUNT con documento',
    Icono: PhotoCameraIcon,
  },
  {
    codigo: 'MANUAL',
    nombre: 'Ingreso datos manuales',
    descripcion: 'Ingresar los datos del vehículo manualmente',
    Icono: EditNoteIcon,
  },
];

const METODOS_CERO_KM = [
  {
    codigo: 'IA_VIN_RUNT',
    nombre: 'IA Foto VIN + Documento en RUNT',
    descripcion: 'Escanear VIN con IA y verificar en RUNT con documento',
    Icono: PhotoCameraIcon,
  },
  {
    codigo: 'PLACA_FALABELLA',
    nombre: 'Placa en Falabella + Documento en RUNT',
    descripcion: 'Consultar placa en Falabella y verificar en RUNT',
    Icono: StorefrontIcon,
  },
  {
    codigo: 'MANUAL',
    nombre: 'Ingreso datos manuales',
    descripcion: 'Ingresar los datos del vehículo manualmente',
    Icono: EditNoteIcon,
  },
];

const METODOS_TERCERO = [
  {
    codigo: 'IA_FOTO_TARJETA',
    nombre: 'IA Foto Tarjeta de Propiedad',
    descripcion: 'Escanear tarjeta de propiedad con inteligencia artificial',
    Icono: PhotoCameraIcon,
  },
  {
    codigo: 'MANUAL',
    nombre: 'Ingreso datos manuales',
    descripcion: 'Ingresar los datos del vehículo manualmente',
    Icono: EditNoteIcon,
  },
];

const Step4_MetodoConsulta = ({ consultarRef }) => {
  const dispatch = useDispatch();
  const tipoVehiculo = useSelector(selectTipoVehiculo);
  const titularCotizacion = useSelector(selectTitularCotizacion);
  const metodoConsulta = useSelector(selectMetodoConsulta);
  const consultaPlaca = useSelector(selectConsultaPlaca);
  const consultaDocumento = useSelector(selectConsultaDocumento);
  const tipoDocumento = useSelector(selectTipoDocumento);
  const consultaTelefono = useSelector(selectConsultaTelefono);
  const datosManual = useSelector(selectDatosManual);
  const nombres = useSelector(selectNombres);
  const apellidos = useSelector(selectApellidos);

  // Estado local para documento manual
  const [manualTipoDoc, setManualTipoDoc] = useState('C');
  const [manualNumeroDoc, setManualNumeroDoc] = useState('');
  const [personaConsultada, setPersonaConsultada] = useState(false);

  // Estado local para la imagen (File objects no se pueden serializar en Redux)
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const fileInputRef = useRef(null);

  // Listener para pegar imágenes con Ctrl+V
  useEffect(() => {
    if (metodoConsulta !== 'IA_FOTO_TARJETA' && metodoConsulta !== 'IA_VIN_RUNT') return;

    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) processImageFile(file);
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [metodoConsulta, dispatch]);

  // Determinar métodos disponibles según tipo de vehículo y titular
  const getMetodos = () => {
    if (tipoVehiculo === 'USADO' && titularCotizacion === 'TERCERO') return METODOS_TERCERO;
    if (tipoVehiculo === 'CERO_KM') return METODOS_CERO_KM;
    return METODOS_USADO;
  };

  const metodos = getMetodos();

  const handleSelect = (codigo) => {
    dispatch(setMetodoConsulta(codigo));
    // Limpiar imagen al cambiar método
    setImagenPreview(null);
    setImagenFile(null);
    // Limpiar estado de consulta de persona
    setPersonaConsultada(false);
    setManualNumeroDoc('');
  };

  const handleConsultarPersona = async () => {
    if (!manualNumeroDoc.trim()) return;
    const result = await dispatch(consultarNombreClienteThunk({ numero_documento: manualNumeroDoc.trim() }));
    if (result) {
      setPersonaConsultada(true);
    }
  };

  const processImageFile = (file) => {
    setImagenFile(file);
    dispatch(setImagenLista(true));
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    // Reset para permitir subir el mismo archivo
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    setImagenPreview(null);
    setImagenFile(null);
    dispatch(setImagenLista(false));
  };

  const generarTelefonoColombia = () => {
    const prefijos = ['300', '301', '302', '303', '304', '305', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '350', '351'];
    const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const numero = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
    dispatch(setConsultaTelefono(prefijo + numero));
  };

  // Exponer función de consulta al componente padre via ref
  useEffect(() => {
    if (!consultarRef) return;
    consultarRef.current = () => {
      switch (metodoConsulta) {
        case 'PLACA_RUNT':
          return dispatch(consultarRuntThunk({ placa: consultaPlaca, tipo_documento: tipoDocumento, numero_documento: consultaDocumento }));
        case 'IA_FOTO_TARJETA':
          return dispatch(extraerDatosRuntThunk({ imagen: imagenFile }));
        case 'IA_VIN_RUNT':
          return dispatch(extraerDatosFotoVinThunk({ imagen: imagenFile }));
        case 'PLACA_FALABELLA':
          return dispatch(extraerDatosAPIFalabellaThunk({ placa: consultaPlaca }));
        case 'MANUAL':
          // Poblar el runtStore con los datos manuales y avanzar
          dispatch(setVehiculo({
            placa: datosManual.placa,
            clase: datosManual.clase,
            tipo_servicio: datosManual.tipoServicio,
            cilindraje: datosManual.cilindraje,
            modelo: datosManual.modelo,
            marca: datosManual.marca,
            linea: datosManual.linea,
          }));
          return Promise.resolve(true);
        default:
          return Promise.resolve(null);
      }
    };
  }, [consultarRef, metodoConsulta, consultaPlaca, consultaDocumento, tipoDocumento, consultaTelefono, imagenFile, datosManual, dispatch]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Método de consulta del vehículo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona cómo deseas consultar los datos del vehículo.
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {metodos.map((metodo) => (
          <Grid item xs={12} sm={6} md={4} key={metodo.codigo}>
            <MetodoConsultaCard
              codigo={metodo.codigo}
              nombre={metodo.nombre}
              descripcion={metodo.descripcion}
              Icono={metodo.Icono}
              seleccionado={metodoConsulta === metodo.codigo}
              onClick={() => handleSelect(metodo.codigo)}
            />
          </Grid>
        ))}
      </Grid>

      {/* ===== PLACA + DOCUMENTO RUNT ===== */}
      {metodoConsulta === 'PLACA_RUNT' && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Ingrese los datos para consultar en RUNT
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Placa"
                value={consultaPlaca}
                onChange={(e) => dispatch(setConsultaPlaca(e.target.value.toUpperCase()))}
                placeholder="ABC123"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de documento</InputLabel>
                <Select
                  value={tipoDocumento}
                  label="Tipo de documento"
                  onChange={(e) => dispatch(setTipoDocumento(e.target.value))}
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <MenuItem key={tipo.codigo} value={tipo.codigo}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Documento del propietario"
                value={consultaDocumento}
                onChange={(e) => dispatch(setConsultaDocumento(e.target.value))}
                placeholder="Ej: 1098765432"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ===== IA FOTO TARJETA DE PROPIEDAD ===== */}
      {metodoConsulta === 'IA_FOTO_TARJETA' && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Sube la foto de la tarjeta de propiedad
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />

          {!imagenPreview ? (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                mt: 2,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Haz clic para cargar una imagen
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG o WEBP — o pega una imagen con Ctrl+V
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, position: 'relative', textAlign: 'center' }}>
              <Box
                component="img"
                src={imagenPreview}
                alt="Tarjeta de propiedad"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 350,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  objectFit: 'contain',
                }}
              />
              <IconButton
                onClick={handleRemoveImage}
                color="error"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'error.50' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Paper>
      )}

      {/* ===== IA FOTO VIN + DOCUMENTO RUNT ===== */}
      {metodoConsulta === 'IA_VIN_RUNT' && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Sube la foto del VIN e ingresa los datos del propietario
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />

          {!imagenPreview ? (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                mt: 2,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Haz clic para cargar una imagen del VIN
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG o WEBP — o pega una imagen con Ctrl+V
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, position: 'relative', textAlign: 'center' }}>
              <Box
                component="img"
                src={imagenPreview}
                alt="Imagen del VIN"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 350,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  objectFit: 'contain',
                }}
              />
              <IconButton
                onClick={handleRemoveImage}
                color="error"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'error.50' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de documento</InputLabel>
                <Select
                  value={tipoDocumento}
                  label="Tipo de documento"
                  onChange={(e) => dispatch(setTipoDocumento(e.target.value))}
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <MenuItem key={tipo.codigo} value={tipo.codigo}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número de documento"
                value={consultaDocumento}
                onChange={(e) => dispatch(setConsultaDocumento(e.target.value))}
                placeholder="Ej: 1098765432"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Teléfono"
                value={consultaTelefono}
                onChange={(e) => dispatch(setConsultaTelefono(e.target.value))}
                placeholder="Ej: 3001234567"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={generarTelefonoColombia}
                        size="small"
                        title="Generar teléfono aleatorio"
                        color="primary"
                      >
                        <ShuffleIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ===== PLACA FALABELLA + DOCUMENTO RUNT ===== */}
      {metodoConsulta === 'PLACA_FALABELLA' && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Consultar placa en Falabella y verificar en RUNT
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Placa"
                value={consultaPlaca}
                onChange={(e) => dispatch(setConsultaPlaca(e.target.value.toUpperCase()))}
                placeholder="ABC123"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Documento RUNT"
                value={consultaDocumento}
                onChange={(e) => dispatch(setConsultaDocumento(e.target.value))}
                placeholder="Ej: 1098765432"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ===== INGRESO DATOS MANUALES ===== */}
      {metodoConsulta === 'MANUAL' && (
        <>
        {/* Sección: Documento del tercero */}
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Documento del tercero
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa el tipo y número de documento de la persona a nombre de quien se cotiza.
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de documento</InputLabel>
                <Select
                  value={manualTipoDoc}
                  label="Tipo de documento"
                  onChange={(e) => setManualTipoDoc(e.target.value)}
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <MenuItem key={tipo.codigo} value={tipo.codigo}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número de documento"
                value={manualNumeroDoc}
                onChange={(e) => {
                  setManualNumeroDoc(e.target.value);
                  setPersonaConsultada(false);
                }}
                placeholder="Ej: 1098765432"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                startIcon={<PersonSearchIcon />}
                onClick={handleConsultarPersona}
                disabled={!manualNumeroDoc.trim()}
                fullWidth
                sx={{ height: 56 }}
              >
                Consultar
              </Button>
            </Grid>
          </Grid>
          {personaConsultada && nombres && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Persona encontrada: <strong>{nombres} {apellidos}</strong>
            </Alert>
          )}
        </Paper>

        {/* Sección: Datos del vehículo */}
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Ingrese los datos del vehículo manualmente
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Placa"
                value={datosManual.placa}
                onChange={(e) => dispatch(setDatosManual({ placa: e.target.value.toUpperCase() }))}
                placeholder="ABC123"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clase"
                value={datosManual.clase}
                onChange={(e) => dispatch(setDatosManual({ clase: e.target.value }))}
                placeholder="Ej: Automóvil, Motocicleta"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tipo de servicio"
                value={datosManual.tipoServicio}
                onChange={(e) => dispatch(setDatosManual({ tipoServicio: e.target.value }))}
                placeholder="Ej: Particular, Público"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Cilindraje"
                value={datosManual.cilindraje}
                onChange={(e) => dispatch(setDatosManual({ cilindraje: e.target.value }))}
                placeholder="Ej: 1600"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Modelo (año)"
                value={datosManual.modelo}
                onChange={(e) => dispatch(setDatosManual({ modelo: e.target.value }))}
                placeholder="Ej: 2023"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Marca"
                value={datosManual.marca}
                onChange={(e) => dispatch(setDatosManual({ marca: e.target.value }))}
                placeholder="Ej: Chevrolet"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Línea"
                value={datosManual.linea}
                onChange={(e) => dispatch(setDatosManual({ linea: e.target.value }))}
                placeholder="Ej: Onix"
              />
            </Grid>
          </Grid>
        </Paper>
        </>
      )}
    </Box>
  );
};

export default Step4_MetodoConsulta;
