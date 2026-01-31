import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Palette as PaletteIcon,
  RestartAlt as RestartAltIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  ViewSidebar as ViewSidebarIcon,
  FormatColorFill as FormatColorFillIcon,
} from '@mui/icons-material';
import {
  selectThemeMode,
  selectCustomColors,
  selectLayoutStyle,
  setThemeMode,
  setCustomColors,
  resetCustomColors,
  setLayoutStyle,
} from '../../store/uiStore/uiStore';
import { themeDefaultColors } from '../../theme/theme';

const COLOR_PRESETS = [
  {
    name: 'Azul (Por defecto)',
    colors: {
      light: {
        primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
        secondary: { main: '#00897b', light: '#4db6ac', dark: '#00695c' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      },
      dark: {
        primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
        secondary: { main: '#80cbc4', light: '#b2dfdb', dark: '#4db6ac' },
        success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
        warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
        error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
        info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
      },
    },
  },
  {
    name: 'Verde Esmeralda',
    colors: {
      light: {
        primary: { main: '#2e7d32', light: '#60ad5e', dark: '#005005' },
        secondary: { main: '#7b1fa2', light: '#ae52d4', dark: '#4a0072' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      },
      dark: {
        primary: { main: '#81c784', light: '#b2fab4', dark: '#519657' },
        secondary: { main: '#ce93d8', light: '#ffc4ff', dark: '#9c64a6' },
        success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
        warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
        error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
        info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
      },
    },
  },
  {
    name: 'Morado Real',
    colors: {
      light: {
        primary: { main: '#7b1fa2', light: '#ae52d4', dark: '#4a0072' },
        secondary: { main: '#ff6f00', light: '#ffa040', dark: '#c43e00' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      },
      dark: {
        primary: { main: '#ce93d8', light: '#ffc4ff', dark: '#9c64a6' },
        secondary: { main: '#ffb74d', light: '#ffe97d', dark: '#c88719' },
        success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
        warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
        error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
        info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
      },
    },
  },
  {
    name: 'Naranja Vibrante',
    colors: {
      light: {
        primary: { main: '#e65100', light: '#ff833a', dark: '#ac1900' },
        secondary: { main: '#00695c', light: '#439889', dark: '#003d33' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      },
      dark: {
        primary: { main: '#ffab91', light: '#ffddc1', dark: '#c97b63' },
        secondary: { main: '#80cbc4', light: '#b2fef7', dark: '#4f9a94' },
        success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
        warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
        error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
        info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
      },
    },
  },
  {
    name: 'Rojo Elegante',
    colors: {
      light: {
        primary: { main: '#c62828', light: '#ff5f52', dark: '#8e0000' },
        secondary: { main: '#283593', light: '#5f5fc4', dark: '#001064' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      },
      dark: {
        primary: { main: '#ef9a9a', light: '#ffcccb', dark: '#ba6b6c' },
        secondary: { main: '#9fa8da', light: '#d1d9ff', dark: '#6f79a8' },
        success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
        warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
        error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
        info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
      },
    },
  },
  {
    name: 'Cyan Moderno',
    colors: {
      light: {
        primary: { main: '#00838f', light: '#4fb3bf', dark: '#005662' },
        secondary: { main: '#6d4c41', light: '#9c786c', dark: '#40241a' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      },
      dark: {
        primary: { main: '#80deea', light: '#b4ffff', dark: '#4bacb8' },
        secondary: { main: '#bcaaa4', light: '#efdcd5', dark: '#8c7b75' },
        success: { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' },
        warning: { main: '#ffb74d', light: '#ffcc80', dark: '#ffa726' },
        error: { main: '#e57373', light: '#ef9a9a', dark: '#ef5350' },
        info: { main: '#64b5f6', light: '#90caf9', dark: '#42a5f5' },
      },
    },
  },
];

const ColorSwatch = ({ color, label, size = 40 }) => (
  <Tooltip title={`${label}: ${color}`}>
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: 1,
        border: '2px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    />
  </Tooltip>
);

const ColorPresetCard = ({ preset, isSelected, onSelect, themeMode }) => {
  const colors = preset.colors[themeMode];

  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onSelect}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            {preset.name}
          </Typography>
          {isSelected && <CheckIcon color="primary" fontSize="small" />}
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          <ColorSwatch color={colors.primary.main} label="Primary" size={28} />
          <ColorSwatch color={colors.secondary.main} label="Secondary" size={28} />
          <ColorSwatch color={colors.success.main} label="Success" size={28} />
          <ColorSwatch color={colors.warning.main} label="Warning" size={28} />
          <ColorSwatch color={colors.error.main} label="Error" size={28} />
          <ColorSwatch color={colors.info.main} label="Info" size={28} />
        </Stack>
      </CardContent>
    </Card>
  );
};

const Configuraciones = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const customColors = useSelector(selectCustomColors);
  const layoutStyle = useSelector(selectLayoutStyle);
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('userProfileImage') || null;
  });
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [localSnackbar, setLocalSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (customColors) {
      const index = COLOR_PRESETS.findIndex(
        (preset) => JSON.stringify(preset.colors) === JSON.stringify(customColors)
      );
      setSelectedPreset(index >= 0 ? index : -1);
    } else {
      setSelectedPreset(0);
    }
  }, [customColors]);

  const handleThemeModeToggle = () => {
    dispatch(setThemeMode(themeMode === 'light' ? 'dark' : 'light'));
  };

  const handleLayoutStyleChange = (style) => {
    dispatch(setLayoutStyle(style));
    setLocalSnackbar({
      open: true,
      message: style === 'colored' ? 'Estilo colorido aplicado' : 'Estilo clásico aplicado',
      severity: 'success',
    });
  };

  const handlePresetSelect = (index) => {
    setSelectedPreset(index);
    if (index === 0) {
      dispatch(resetCustomColors());
    } else {
      dispatch(setCustomColors(COLOR_PRESETS[index].colors));
    }
    setLocalSnackbar({
      open: true,
      message: `Tema "${COLOR_PRESETS[index].name}" aplicado correctamente`,
      severity: 'success',
    });
  };

  const handleResetColors = () => {
    dispatch(resetCustomColors());
    setSelectedPreset(0);
    setLocalSnackbar({
      open: true,
      message: 'Colores restaurados a los valores por defecto',
      severity: 'info',
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalSnackbar({
        open: true,
        message: 'Por favor selecciona un archivo de imagen',
        severity: 'error',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalSnackbar({
        open: true,
        message: 'La imagen no debe superar los 5MB',
        severity: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfileImage(base64String);
      localStorage.setItem('userProfileImage', base64String);
      setLocalSnackbar({
        open: true,
        message: 'Foto de perfil actualizada correctamente',
        severity: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('userProfileImage');
    setLocalSnackbar({
      open: true,
      message: 'Foto de perfil eliminada',
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setLocalSnackbar({ ...localSnackbar, open: false });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Configuraciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personaliza la apariencia del sistema y tu perfil
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Image Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Foto de Perfil"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              avatar={<PhotoCameraIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Stack alignItems="center" spacing={3}>
                <Avatar
                  src={profileImage}
                  sx={{
                    width: 150,
                    height: 150,
                    fontSize: '3rem',
                    border: '4px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  {!profileImage && 'U'}
                </Avatar>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar foto
                  </Button>
                  {profileImage && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveImage}
                    >
                      Eliminar
                    </Button>
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Layout Style Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Estilo del Layout"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              avatar={<ViewSidebarIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selecciona como quieres que se vea el sidebar, navbar y footer:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: layoutStyle === 'default' ? 2 : 1,
                      borderColor: layoutStyle === 'default' ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 4 },
                    }}
                    onClick={() => handleLayoutStyleChange('default')}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Clasico
                        </Typography>
                        {layoutStyle === 'default' && <CheckIcon color="primary" />}
                      </Stack>
                      <Box
                        sx={{
                          display: 'flex',
                          height: 80,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ width: 40, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ height: 16, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }} />
                          <Box sx={{ flex: 1, bgcolor: 'grey.100' }} />
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Fondo blanco tradicional
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: layoutStyle === 'colored' ? 2 : 1,
                      borderColor: layoutStyle === 'colored' ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 4 },
                    }}
                    onClick={() => handleLayoutStyleChange('colored')}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Colorido
                        </Typography>
                        {layoutStyle === 'colored' && <CheckIcon color="primary" />}
                      </Stack>
                      <Box
                        sx={{
                          display: 'flex',
                          height: 80,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ width: 40, bgcolor: 'primary.main' }} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ height: 16, bgcolor: 'primary.main' }} />
                          <Box sx={{ flex: 1, bgcolor: 'grey.100' }} />
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Usa los colores del tema seleccionado
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Theme Settings Section */}
          <Card>
            <CardHeader
              title="Colores del Tema"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              avatar={<PaletteIcon color="primary" />}
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={themeMode === 'dark'}
                        onChange={handleThemeModeToggle}
                      />
                    }
                    label={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {themeMode === 'light' ? (
                          <LightModeIcon fontSize="small" />
                        ) : (
                          <DarkModeIcon fontSize="small" />
                        )}
                        <Typography variant="body2">
                          {themeMode === 'light' ? 'Claro' : 'Oscuro'}
                        </Typography>
                      </Stack>
                    }
                  />
                </Stack>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Selecciona un esquema de colores:
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {COLOR_PRESETS.map((preset, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <ColorPresetCard
                      preset={preset}
                      isSelected={selectedPreset === index}
                      onSelect={() => handlePresetSelect(index)}
                      themeMode={themeMode}
                    />
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Current Colors Preview */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Vista previa de colores actuales:
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
                  <Stack alignItems="center" spacing={0.5}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="primary.contrastText">
                        Primary
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'secondary.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="secondary.contrastText">
                        Secondary
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'success.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="white">
                        Success
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'warning.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="white">
                        Warning
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'error.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="white">
                        Error
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'info.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="white">
                        Info
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Reset Button */}
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetColors}
                  disabled={selectedPreset === 0}
                >
                  Restaurar colores por defecto
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sample Components Preview */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Vista previa de componentes"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Asi se veran los componentes del sistema con los colores seleccionados:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                <Button variant="contained" color="primary">
                  Primary
                </Button>
                <Button variant="contained" color="secondary">
                  Secondary
                </Button>
                <Button variant="contained" color="success">
                  Success
                </Button>
                <Button variant="contained" color="warning">
                  Warning
                </Button>
                <Button variant="contained" color="error">
                  Error
                </Button>
                <Button variant="contained" color="info">
                  Info
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                <Button variant="outlined" color="primary">
                  Primary
                </Button>
                <Button variant="outlined" color="secondary">
                  Secondary
                </Button>
                <Button variant="outlined" color="success">
                  Success
                </Button>
                <Button variant="outlined" color="warning">
                  Warning
                </Button>
                <Button variant="outlined" color="error">
                  Error
                </Button>
                <Button variant="outlined" color="info">
                  Info
                </Button>
              </Stack>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Alert severity="success">
                  Este es un mensaje de exito con los colores personalizados.
                </Alert>
                <Alert severity="warning">
                  Este es un mensaje de advertencia con los colores personalizados.
                </Alert>
                <Alert severity="error">
                  Este es un mensaje de error con los colores personalizados.
                </Alert>
                <Alert severity="info">
                  Este es un mensaje informativo con los colores personalizados.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Local Snackbar */}
      <Snackbar
        open={localSnackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={localSnackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {localSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Configuraciones;
