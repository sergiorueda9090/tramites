import React, { useRef, useEffect, useState } from 'react';
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
  AlertTitle,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PhoneIcon from '@mui/icons-material/Phone';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
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
import { setVehiculo, setPersona } from '../../../store/apisExternasStore/apisExternasRuntStore';
import MetodoConsultaCard from '../Components/MetodoConsultaCard';
import { consultarRuntThunk, extraerDatosRuntThunk, extraerDatosFotoVinThunk, extraerDatosPorPlacaThunk, consultarNombreTitularThunk } from '../../../store/apisExternasStore/apisExternasRuntThunks';

const TIPOS_DOCUMENTO = [
  { codigo: 'C', nombre: 'Cédula de Ciudadanía' },
  { codigo: 'E', nombre: 'Cédula de Extranjería' },
  { codigo: 'T', nombre: 'Tarjeta de Identidad' },
  { codigo: 'P', nombre: 'Pasaporte' },
  { codigo: 'D', nombre: 'Carné / Carnet Diplomático' },
  { codigo: 'R', nombre: 'Registro Civil' },
  { codigo: 'Y', nombre: 'Permiso por Protección Temporal (PPT)' },
];

/**
 * Bloque reutilizable para resolver el nombre del titular en el flujo Cero KM.
 *
 * - modo="verificar": botón que consulta el nombre en RUNT por documento. Si la
 *   persona está inscrita muestra el nombre; si no, avisa "no está inscrita en
 *   RUNT" y habilita un campo para escribirlo manualmente.
 * - modo="manual": no hay consulta externa (método de ingreso manual), siempre
 *   muestra el campo de nombre completo.
 *
 * En ambos casos el nombre resultante se persiste en el store del RUNT
 * (setPersona → nombres/apellidos), que es de donde lo leen los thunks que
 * guardan en base_de_datos / trámites / casos especiales.
 *
 * Además de su botón manual, en modo "verificar" expone una función `resolver()`
 * al padre (vía `titularRef`) para que la verificación se dispare automáticamente
 * al pulsar "Siguiente": devuelve `true` si el titular quedó resuelto (inscrito o
 * con nombre manual ya escrito) y `false` si falta que el usuario lo ingrese.
 */
const TitularNombre = ({ modo, titularRef }) => {
  const dispatch = useDispatch();
  const tipoDocumento = useSelector(selectTipoDocumento);
  const numeroDocumento = useSelector(selectConsultaDocumento);

  const [resultado, setResultado] = useState(null); // { inscrito, nombre }
  const [nombreManual, setNombreManual] = useState('');

  // Al cambiar el documento (o su tipo) se invalida una verificación previa.
  useEffect(() => {
    if (modo !== 'verificar') return;
    setResultado(null);
    setNombreManual('');
    dispatch(setPersona(null));
  }, [tipoDocumento, numeroDocumento, modo, dispatch]);

  const handleNombreManual = (value) => {
    setNombreManual(value);
    dispatch(setPersona({ nombres: value, apellidos: '' }));
  };

  // Exponer la resolución del titular al padre para integrarla en "Siguiente".
  // Solo aplica al modo verificar (en modo manual el nombre ya se persiste al
  // escribirlo, así que no hay nada que disparar).
  useEffect(() => {
    if (modo !== 'verificar' || !titularRef) return undefined;
    titularRef.current = {
      resolver: async () => {
        // Si ya hay un nombre manual escrito (caso "no inscrito"), se conserva.
        if (resultado && !resultado.inscrito && nombreManual.trim()) return true;
        // Si una verificación previa confirmó al titular, listo.
        if (resultado?.inscrito) return true;
        if (!numeroDocumento) return false;
        const res = await dispatch(
          consultarNombreTitularThunk({ tipo_documento: tipoDocumento, numero_documento: numeroDocumento })
        );
        setResultado(res || { inscrito: false, nombre: '' });
        if (res?.inscrito) return true;
        // No inscrito: se muestra el campo manual y se bloquea el avance hasta
        // que el usuario escriba el nombre y vuelva a pulsar "Siguiente".
        return false;
      },
    };
    return () => {
      if (titularRef) titularRef.current = null;
    };
  }, [modo, titularRef, resultado, nombreManual, numeroDocumento, tipoDocumento, dispatch]);

  // ── Modo manual: siempre campo de nombre ──
  if (modo === 'manual') {
    return (
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nombre completo del titular"
          value={nombreManual}
          onChange={(e) => handleNombreManual(e.target.value)}
          placeholder="Ej: Juan Pérez Gómez"
        />
      </Grid>
    );
  }

  // ── Modo verificar ──
  return (
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {resultado?.inscrito ? (
          <Chip
            icon={<CheckCircleIcon />}
            color="success"
            variant="outlined"
            label={`Titular: ${resultado.nombre}`}
            sx={{ fontWeight: 600 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PersonSearchIcon fontSize="small" />
            El nombre del titular se verificará automáticamente en RUNT al pulsar "Siguiente".
          </Typography>
        )}
      </Box>

      {resultado && !resultado.inscrito && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            <AlertTitle>La persona no está inscrita en RUNT</AlertTitle>
            Ingresa el nombre completo del titular manualmente.
          </Alert>
          <TextField
            fullWidth
            label="Nombre completo del titular"
            value={nombreManual}
            onChange={(e) => handleNombreManual(e.target.value)}
            placeholder="Ej: Juan Pérez Gómez"
          />
        </Box>
      )}
    </Grid>
  );
};

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
    nombre: 'Placa escrita + documento en RUNT',
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
    codigo: 'IA_VIN_RUNT',
    nombre: 'IA Foto VIN + Documento en RUNT',
    descripcion: 'Escanear VIN con IA y verificar en RUNT con documento',
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

  // Estado local para la imagen (File objects no se pueden serializar en Redux)
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const fileInputRef = useRef(null);

  // Handle imperativo que expone el bloque TitularNombre (modo verificar) para
  // poder disparar la verificación del nombre en RUNT desde el botón "Siguiente".
  const titularRef = useRef(null);

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

  // Rota la imagen (en grados; positivo = horario, negativo = antihorario)
  // y reemplaza tanto el preview como el File que se enviará al backend.
  const rotateImage = (degrees) => {
    if (!imagenFile || !imagenPreview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const isQuarterTurn = Math.abs(degrees) % 180 === 90;
      canvas.width = isQuarterTurn ? img.height : img.width;
      canvas.height = isQuarterTurn ? img.width : img.height;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const mime = imagenFile.type || 'image/png';
      canvas.toBlob((blob) => {
        if (!blob) return;
        const newFile = new File([blob], imagenFile.name, { type: mime, lastModified: Date.now() });
        setImagenFile(newFile);
        setImagenPreview(canvas.toDataURL(mime));
      }, mime, 0.95);
    };
    img.src = imagenPreview;
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
    consultarRef.current = async () => {
      switch (metodoConsulta) {
        case 'PLACA_RUNT':
          return dispatch(consultarRuntThunk({ placa: consultaPlaca, tipo_documento: tipoDocumento, numero_documento: consultaDocumento }));
        case 'IA_FOTO_TARJETA':
          return dispatch(extraerDatosRuntThunk({ imagen: imagenFile }));
        case 'IA_VIN_RUNT': {
          // Cero KM: verificar primero el nombre del titular en RUNT. Si no está
          // inscrito y aún no se escribió el nombre, no se avanza.
          if (titularRef.current) {
            const titularOk = await titularRef.current.resolver();
            if (!titularOk) return null;
          }
          return dispatch(extraerDatosFotoVinThunk({ imagen: imagenFile }));
        }
        case 'PLACA_FALABELLA': {
          if (titularRef.current) {
            const titularOk = await titularRef.current.resolver();
            if (!titularOk) return null;
          }
          return dispatch(extraerDatosPorPlacaThunk({ placa: consultaPlaca }));
        }
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
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                <IconButton
                  onClick={() => rotateImage(-90)}
                  size="small"
                  title="Rotar a la izquierda"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <RotateLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => rotateImage(90)}
                  size="small"
                  title="Rotar a la derecha"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <RotateRightIcon />
                </IconButton>
                <IconButton
                  onClick={handleRemoveImage}
                  color="error"
                  size="small"
                  title="Eliminar imagen"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.50' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
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
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                <IconButton
                  onClick={() => rotateImage(-90)}
                  size="small"
                  title="Rotar a la izquierda"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <RotateLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => rotateImage(90)}
                  size="small"
                  title="Rotar a la derecha"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <RotateRightIcon />
                </IconButton>
                <IconButton
                  onClick={handleRemoveImage}
                  color="error"
                  size="small"
                  title="Eliminar imagen"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.50' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
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
                      <Button
                        onClick={generarTelefonoColombia}
                        size="small"
                        variant="contained"
                        startIcon={<ShuffleIcon fontSize="small" />}
                        title="Generar teléfono aleatorio"
                        sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, px: 1.5, ml: 0.5 }}
                      >
                        Generar
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {tipoVehiculo === 'CERO_KM' && <TitularNombre modo="verificar" titularRef={titularRef} />}
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
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Número de documento"
                value={consultaDocumento}
                onChange={(e) => dispatch(setConsultaDocumento(e.target.value))}
                placeholder="Ej: 1098765432"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                      <Button
                        onClick={generarTelefonoColombia}
                        size="small"
                        variant="contained"
                        startIcon={<ShuffleIcon fontSize="small" />}
                        title="Generar teléfono aleatorio"
                        sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, px: 1.5, ml: 0.5 }}
                      >
                        Generar
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <TitularNombre modo="verificar" titularRef={titularRef} />
          </Grid>
        </Paper>
      )}

      {/* ===== INGRESO DATOS MANUALES ===== */}
      {metodoConsulta === 'MANUAL' && (
        <>
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

        {/* Sección: Datos del titular (solo Cero KM) */}
        {tipoVehiculo === 'CERO_KM' && (
          <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Datos del titular
            </Typography>
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
                        <Button
                          onClick={generarTelefonoColombia}
                          size="small"
                          variant="contained"
                          startIcon={<ShuffleIcon fontSize="small" />}
                          title="Generar teléfono aleatorio"
                          sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, px: 1.5, ml: 0.5 }}
                        >
                          Generar
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <TitularNombre modo="manual" />
            </Grid>
          </Paper>
        )}
        </>
      )}
    </Box>
  );
};

export default Step4_MetodoConsulta;
