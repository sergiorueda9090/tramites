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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  selectTipoVehiculo,
  selectMetodoConsulta,
  selectConsultaPlaca,
  selectConsultaDocumento,
  selectTipoDocumento,
  setMetodoConsulta,
  setConsultaPlaca,
  setConsultaDocumento,
  setTipoDocumento,
  setImagenLista,
} from '../../../store/cotizadorStore/cotizadorSlice';
import MetodoConsultaCard from '../Components/MetodoConsultaCard';
import { consultarRuntThunk, extraerDatosRuntThunk, extraerDatosFotoVinThunk, extraerDatosAPIFalabellaThunk } from '../../../store/apisExternasStore/apisExternasRuntThunks';

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
    nombre: 'IA Foto + Documento en RUNT',
    descripcion: 'Escanear foto con IA y verificar en RUNT con documento',
    Icono: PhotoCameraIcon,
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
];

const Step4_MetodoConsulta = ({ consultarRef }) => {
  const dispatch = useDispatch();
  const tipoVehiculo = useSelector(selectTipoVehiculo);
  const metodoConsulta = useSelector(selectMetodoConsulta);
  const consultaPlaca = useSelector(selectConsultaPlaca);
  const consultaDocumento = useSelector(selectConsultaDocumento);
  const tipoDocumento = useSelector(selectTipoDocumento);

  // Estado local para la imagen (File objects no se pueden serializar en Redux)
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const fileInputRef = useRef(null);

  const metodos = tipoVehiculo === 'CERO_KM' ? METODOS_CERO_KM : METODOS_USADO;

  const handleSelect = (codigo) => {
    dispatch(setMetodoConsulta(codigo));
    // Limpiar imagen al cambiar método
    setImagenPreview(null);
    setImagenFile(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagenFile(file);
    dispatch(setImagenLista(true));
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    // Reset para permitir subir el mismo archivo
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    setImagenPreview(null);
    setImagenFile(null);
    dispatch(setImagenLista(false));
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
          return dispatch(extraerDatosFotoVinThunk({ imagen: imagenFile, numero_documento: consultaDocumento }));
        case 'PLACA_FALABELLA':
          return dispatch(extraerDatosAPIFalabellaThunk({ placa: consultaPlaca }));
        default:
          return Promise.resolve(null);
      }
    };
  }, [consultarRef, metodoConsulta, consultaPlaca, consultaDocumento, tipoDocumento, imagenFile, dispatch]);

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
                JPG, PNG o WEBP
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

      {/* ===== IA FOTO + DOCUMENTO RUNT ===== */}
      {metodoConsulta === 'IA_VIN_RUNT' && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Sube una imagen y proporciona el documento RUNT
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
                JPG, PNG o WEBP
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, position: 'relative', textAlign: 'center' }}>
              <Box
                component="img"
                src={imagenPreview}
                alt="Imagen del vehículo"
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

          <TextField
            fullWidth
            label="Documento RUNT"
            value={consultaDocumento}
            onChange={(e) => dispatch(setConsultaDocumento(e.target.value))}
            placeholder="Ej: 1098765432"
            sx={{ mt: 2 }}
          />
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
    </Box>
  );
};

export default Step4_MetodoConsulta;
