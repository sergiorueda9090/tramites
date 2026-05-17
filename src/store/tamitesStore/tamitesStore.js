import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const emptyFilters = {
  search: '',
  cliente: '',
  etiqueta: '',
  tipo_tramite: '',
  grupo_soat: '',
  tarifa_codigo: '',
  tramite_estado: '',
  confirmacion_estado: '',
  cargar_pdf_estado: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const emptyForm = {
  id: null,
  cliente: '',
  etiqueta: '',
  precio_cliente: '',
  tarifario_soat: '',

  tipo_tramite: 'SOAT',
  tipo_vehiculo: '',
  entidad: '',

  grupo_soat: '',
  grupo_clase_runt: '',
  grupo_subcriterio: '',
  modulo_pregunta1: '',
  modulo_pregunta2: '',
  tarifa_codigo: '',
  tarifa_manual: false,

  precio_lay: '',
  comision: '',

  placa: '',
  clase: '',
  tipo_servicio: '',
  marca: '',
  linea: '',
  modelo: '',
  color: '',
  cilindraje: '',
  pasajeros_sentados: '',
  capacidad_carga: '',
  peso_bruto: '',
  chasis: '',
  vin: '',

  tipo_documento: 'CC',
  numero_documento: '',
  nombre_completo: '',
  telefono: '',
  correo: '',
  direccion: '',

  tramite_estado: '1',
  confirmacion_estado: '0',
  cargar_pdf_estado: '0',
};

const initialState = {
  // Lista de trámites
  tramites: [],
  history_data: [],
  historyPagination: {
    count: 0,
    page: 1,
    pageSize: 10,
  },
  openHistoryModal: false,
  selectedHistoryTramite: null,
  loading: false,
  error: null,

  // Paginación (del servidor - formato DRF)
  pagination: {
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    next: null,
    previous: null,
  },

  // Ordenamiento
  sortField: null,
  sortOrder: 'asc',

  // Filtros
  filters: { ...emptyFilters },
  appliedFilters: { ...emptyFilters },

  // Modal
  openModal: false,
  selectedTramite: null,

  // Formulario
  form: { ...emptyForm },

  // Datos auxiliares para selects
  clientes: [],
  etiquetas: [],
  tarifarios: [],
};

export const tramitesStore = createSlice({
  name: 'tramitesStore',
  initialState,
  reducers: {
    // Loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Lista de trámites
    setTramites: (state, action) => {
      state.tramites = action.payload;
      state.loading = false;
    },

    /**
     * Elimina un tramite del listado en el cliente (sin tocar el backend).
     * Se usa cuando llega un evento WS de que el tramite ya no debe aparecer
     * (ej: fue enviado a pasarela por otro usuario).
     */
    removeTramiteById: (state, action) => {
      const id = action.payload;
      const before = state.tramites.length;
      state.tramites = state.tramites.filter((t) => t.id !== id);
      if (state.tramites.length < before && state.pagination.count > 0) {
        state.pagination.count -= 1;
      }
    },

    /**
     * Inserta un tramite al inicio del listado SIN tocar `loading`. Usado por
     * el hook de tiempo real cuando otro usuario devuelve una pasarela y el
     * tramite vuelve al listado.
     */
    prependTramite: (state, action) => {
      const item = action.payload;
      if (!item || item.id == null) return;
      if (state.tramites.some((t) => t.id === item.id)) return;
      state.tramites = [item, ...state.tramites];
      state.pagination.count = (state.pagination.count || 0) + 1;
    },

    // Datos auxiliares
    setClientes: (state, action) => {
      state.clientes = action.payload;
    },
    setEtiquetas: (state, action) => {
      state.etiquetas = action.payload;
    },
    setTarifarios: (state, action) => {
      state.tarifarios = action.payload;
    },

    // Paginación (formato DRF: count, next, previous)
    setPagination: (state, action) => {
      const { count, next, previous, page, pageSize } = action.payload;
      state.pagination = {
        count: count || 0,
        page: page || state.pagination.page,
        pageSize: pageSize || state.pagination.pageSize,
        next: next || null,
        previous: previous || null,
      };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },

    // Ordenamiento
    setSort: (state, action) => {
      const { field } = action.payload;
      if (state.sortField === field) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortOrder = 'asc';
      }
    },

    // Filtros
    updateFilter: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
    },
    applyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { ...emptyFilters };
      state.appliedFilters = { ...emptyFilters };
      state.pagination.page = 1;
    },
    clearFilter: (state, action) => {
      const field = action.payload;
      state.filters[field] = '';
      state.appliedFilters[field] = '';
    },

    // Modal
    openCreateModal: (state) => {
      state.openModal = true;
      state.selectedTramite = null;
      state.form = { ...emptyForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedTramite = action.payload;
      const t = action.payload;
      state.form = {
        id: t.id,
        cliente: t.cliente?.id || '',
        etiqueta: t.etiqueta?.id || '',
        precio_cliente: t.precio_cliente?.id || '',
        tarifario_soat: t.tarifario_soat?.id || '',

        tipo_tramite: t.tipo_tramite || 'SOAT',
        tipo_vehiculo: t.tipo_vehiculo || '',
        entidad: t.entidad || '',

        grupo_soat: t.grupo_soat || '',
        grupo_clase_runt: t.grupo_clase_runt || '',
        grupo_subcriterio: t.grupo_subcriterio || '',
        modulo_pregunta1: t.modulo_pregunta1 || '',
        modulo_pregunta2: t.modulo_pregunta2 || '',
        tarifa_codigo: t.tarifa_codigo || '',
        tarifa_manual: !!t.tarifa_manual,

        precio_lay: t.precio_lay || '',
        comision: t.comision || '',

        placa: t.placa || '',
        clase: t.clase || '',
        tipo_servicio: t.tipo_servicio || '',
        marca: t.marca || '',
        linea: t.linea || '',
        modelo: t.modelo || '',
        color: t.color || '',
        cilindraje: t.cilindraje || '',
        pasajeros_sentados: t.pasajeros_sentados || '',
        capacidad_carga: t.capacidad_carga || '',
        peso_bruto: t.peso_bruto || '',
        chasis: t.chasis || '',
        vin: t.vin || '',

        tipo_documento: t.tipo_documento || 'CC',
        numero_documento: t.numero_documento || '',
        nombre_completo: t.nombre_completo || '',
        telefono: t.telefono || '',
        correo: t.correo || '',
        direccion: t.direccion || '',

        tramite_estado: t.tramite_estado || '1',
        confirmacion_estado: t.confirmacion_estado || '0',
        cargar_pdf_estado: t.cargar_pdf_estado || '0',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedTramite = null;
      state.form = { ...emptyForm };
    },

    // History
    setHistory: (state, action) => {
      const { history_data, count, page, pageSize } = action.payload;
      state.history_data = history_data;
      if (count !== undefined) state.historyPagination.count = count;
      if (page !== undefined) state.historyPagination.page = page;
      if (pageSize !== undefined) state.historyPagination.pageSize = pageSize;
    },
    openHistoryDialog: (state, action) => {
      state.openHistoryModal = true;
      state.selectedHistoryTramite = action.payload;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    closeHistoryDialog: (state) => {
      state.openHistoryModal = false;
      state.selectedHistoryTramite = null;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    setHistoryPage: (state, action) => {
      state.historyPagination.page = action.payload;
    },
    setHistoryPageSize: (state, action) => {
      state.historyPagination.pageSize = action.payload;
      state.historyPagination.page = 1;
    },

    // Formulario
    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => {
      state.form = { ...emptyForm };
    },

    // Reset
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setTramites,
  removeTramiteById,
  prependTramite,
  setClientes,
  setEtiquetas,
  setTarifarios,
  setPagination,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  openCreateModal,
  openEditModal,
  closeModal,
  updateForm,
  resetForm,
  resetStore,
  setHistory,
  openHistoryDialog,
  closeHistoryDialog,
  setHistoryPage,
  setHistoryPageSize,
} = tramitesStore.actions;

// Selectores
export const selectTramites = (state) => state.tramitesStore.tramites;
export const selectLoading = (state) => state.tramitesStore.loading;
export const selectError = (state) => state.tramitesStore.error;
export const selectClientes = (state) => state.tramitesStore.clientes;
export const selectEtiquetas = (state) => state.tramitesStore.etiquetas;
export const selectTarifarios = (state) => state.tramitesStore.tarifarios;
export const selectPagination = (state) => state.tramitesStore.pagination;
export const selectPage = (state) => state.tramitesStore.pagination.page;
export const selectPageSize = (state) => state.tramitesStore.pagination.pageSize;
export const selectTotalRows = (state) => state.tramitesStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.tramitesStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.tramitesStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.tramitesStore.pagination.previous !== null;
export const selectSortField = (state) => state.tramitesStore.sortField;
export const selectSortOrder = (state) => state.tramitesStore.sortOrder;
export const selectFilters = (state) => state.tramitesStore.filters;
export const selectAppliedFilters = (state) => state.tramitesStore.appliedFilters;
export const selectOpenModal = (state) => state.tramitesStore.openModal;
export const selectSelectedTramite = (state) => state.tramitesStore.selectedTramite;
export const selectForm = (state) => state.tramitesStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.tramitesStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredTramites = (state) => {
  const { tramites, appliedFilters } = state.tramitesStore;
  const { search } = appliedFilters;

  if (!search) {
    return tramites;
  }

  return tramites.filter((t) => {
    const searchLower = search.toLowerCase();
    if (
      !(t.placa || '').toLowerCase().includes(searchLower) &&
      !(t.nombre_completo || '').toLowerCase().includes(searchLower) &&
      !(t.numero_documento || '').toLowerCase().includes(searchLower) &&
      !(t.chasis || '').toLowerCase().includes(searchLower) &&
      !(t.vin || '').toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedTramites = (state) => {
  const filtered = selectFilteredTramites(state);
  const { sortField, sortOrder } = state.tramitesStore;

  if (!sortField) return filtered;

  return [...filtered].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number') {
      comparison = aValue - bValue;
    } else if (typeof aValue === 'boolean') {
      comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Selector para datos paginados (la paginación es del servidor)
export const selectPaginatedTramites = (state) => {
  return selectSortedTramites(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.tramitesStore.pagination.count;
};

// History selectors
export const selectHistoryData = (state) => state.tramitesStore.history_data;
export const selectHistoryPagination = (state) => state.tramitesStore.historyPagination;
export const selectOpenHistoryModal = (state) => state.tramitesStore.openHistoryModal;
export const selectSelectedHistoryTramite = (state) => state.tramitesStore.selectedHistoryTramite;

export default tramitesStore.reducer;
