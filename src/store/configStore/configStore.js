import { createSlice } from '@reduxjs/toolkit';

// Paletas de colores predefinidas
export const COLOR_PALETTES = {
  default: {
    id: 'default',
    name: 'Azul Corporativo',
    primary: '#1976d2',
    secondary: '#00897b',
    preview: ['#1976d2', '#00897b', '#4caf50', '#ff9800'],
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Elegante',
    primary: '#7c4dff',
    secondary: '#ff4081',
    preview: ['#7c4dff', '#ff4081', '#69f0ae', '#ffab40'],
  },
  green: {
    id: 'green',
    name: 'Verde Natural',
    primary: '#2e7d32',
    secondary: '#ff6f00',
    preview: ['#2e7d32', '#ff6f00', '#00acc1', '#ab47bc'],
  },
  orange: {
    id: 'orange',
    name: 'Naranja Energético',
    primary: '#ef6c00',
    secondary: '#0097a7',
    preview: ['#ef6c00', '#0097a7', '#8bc34a', '#e91e63'],
  },
  red: {
    id: 'red',
    name: 'Rojo Intenso',
    primary: '#c62828',
    secondary: '#00838f',
    preview: ['#c62828', '#00838f', '#43a047', '#ffa000'],
  },
  teal: {
    id: 'teal',
    name: 'Teal Moderno',
    primary: '#00796b',
    secondary: '#e65100',
    preview: ['#00796b', '#e65100', '#7b1fa2', '#fbc02d'],
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Profesional',
    primary: '#303f9f',
    secondary: '#c2185b',
    preview: ['#303f9f', '#c2185b', '#00796b', '#f57c00'],
  },
  pink: {
    id: 'pink',
    name: 'Rosa Suave',
    primary: '#ad1457',
    secondary: '#00695c',
    preview: ['#ad1457', '#00695c', '#1565c0', '#ff8f00'],
  },
};

// Cargar configuración desde localStorage
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('userConfig');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading config from localStorage:', error);
  }
  return null;
};

// Guardar configuración en localStorage
const saveToLocalStorage = (config) => {
  try {
    localStorage.setItem('userConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving config to localStorage:', error);
  }
};

const savedConfig = loadFromLocalStorage();

const initialState = {
  // Imagen de perfil (base64 o URL)
  profileImage: savedConfig?.profileImage || null,

  // Paleta de colores seleccionada
  selectedPalette: savedConfig?.selectedPalette || 'default',

  // Colores personalizados (si el usuario quiere colores custom)
  customColors: savedConfig?.customColors || {
    primary: '#1976d2',
    secondary: '#00897b',
  },

  // Usar colores personalizados o paleta predefinida
  useCustomColors: savedConfig?.useCustomColors || false,
};

export const configStore = createSlice({
  name: 'configStore',
  initialState,
  reducers: {
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
      saveToLocalStorage(state);
    },

    setSelectedPalette: (state, action) => {
      state.selectedPalette = action.payload;
      state.useCustomColors = false;
      saveToLocalStorage(state);
    },

    setCustomColors: (state, action) => {
      state.customColors = { ...state.customColors, ...action.payload };
      state.useCustomColors = true;
      saveToLocalStorage(state);
    },

    setUseCustomColors: (state, action) => {
      state.useCustomColors = action.payload;
      saveToLocalStorage(state);
    },

    resetConfig: (state) => {
      state.profileImage = null;
      state.selectedPalette = 'default';
      state.customColors = { primary: '#1976d2', secondary: '#00897b' };
      state.useCustomColors = false;
      saveToLocalStorage(state);
    },
  },
});

export const {
  setProfileImage,
  setSelectedPalette,
  setCustomColors,
  setUseCustomColors,
  resetConfig,
} = configStore.actions;

// Selectores
export const selectProfileImage = (state) => state.configStore.profileImage;
export const selectSelectedPalette = (state) => state.configStore.selectedPalette;
export const selectCustomColors = (state) => state.configStore.customColors;
export const selectUseCustomColors = (state) => state.configStore.useCustomColors;

// Selector para obtener los colores actuales
export const selectCurrentColors = (state) => {
  const { selectedPalette, customColors, useCustomColors } = state.configStore;

  if (useCustomColors) {
    return customColors;
  }

  const palette = COLOR_PALETTES[selectedPalette] || COLOR_PALETTES.default;
  return {
    primary: palette.primary,
    secondary: palette.secondary,
  };
};

export default configStore.reducer;
