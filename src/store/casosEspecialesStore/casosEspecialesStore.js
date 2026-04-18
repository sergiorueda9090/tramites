import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const emptyFilters = {
  search: '',
  cliente: '',
  etiqueta: '',
  caso_especial_estado: '',
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
  descripcion: '',
  precio_lay: '',
  comision: '',
  placa: '',
  clindraje: '',
  modelo: '',
  chasis: '',
  tipo_documento: 'CC',
  numero_documento: '',
  nombre_completo: '',
  telefono: '',
  correo: '',
  direccion: '',
  caso_especial_estado: '1',
  tramite_estado: '0',
  confirmacion_estado: '0',
  cargar_pdf_estado: '0',
};

const initialState = {
  // Lista de casos especiales
  casosEspeciales: [],
  history_data: [],
  historyPagination: {
    count: 0,
    page: 1,
    pageSize: 10,
  },
  openHistoryModal: false,
  selectedHistoryCaso: null,
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
  selectedCaso: null,

  // Formulario
  form: { ...emptyForm },

  // Datos auxiliares para selects
  clientes: [],
  etiquetas: [],
};

export const casosEspecialesStore = createSlice({
  name: 'casosEspecialesStore',
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

    // Lista de casos especiales
    setCasosEspeciales: (state, action) => {
      state.casosEspeciales = action.payload;
      state.loading = false;
    },

    // Datos auxiliares
    setClientes: (state, action) => {
      state.clientes = action.payload;
    },
    setEtiquetas: (state, action) => {
      state.etiquetas = action.payload;
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
      state.selectedCaso = null;
      state.form = { ...emptyForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedCaso = action.payload;
      const c = action.payload;
      state.form = {
        id: c.id,
        cliente: c.cliente?.id || '',
        etiqueta: c.etiqueta?.id || '',
        precio_cliente: c.precio_cliente?.id || '',
        descripcion: c.descripcion || '',
        precio_lay: c.precio_lay || '',
        comision: c.comision || '',
        placa: c.placa || '',
        clindraje: c.clindraje || '',
        modelo: c.modelo || '',
        chasis: c.chasis || '',
        tipo_documento: c.tipo_documento || 'CC',
        numero_documento: c.numero_documento || '',
        nombre_completo: c.nombre_completo || '',
        telefono: c.telefono || '',
        correo: c.correo || '',
        direccion: c.direccion || '',
        caso_especial_estado: c.caso_especial_estado || '1',
        tramite_estado: c.tramite_estado || '0',
        confirmacion_estado: c.confirmacion_estado || '0',
        cargar_pdf_estado: c.cargar_pdf_estado || '0',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedCaso = null;
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
      state.selectedHistoryCaso = action.payload;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    closeHistoryDialog: (state) => {
      state.openHistoryModal = false;
      state.selectedHistoryCaso = null;
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
  setCasosEspeciales,
  setClientes,
  setEtiquetas,
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
} = casosEspecialesStore.actions;

// Selectores
export const selectCasosEspeciales = (state) => state.casosEspecialesStore.casosEspeciales;
export const selectLoading = (state) => state.casosEspecialesStore.loading;
export const selectError = (state) => state.casosEspecialesStore.error;
export const selectClientes = (state) => state.casosEspecialesStore.clientes;
export const selectEtiquetas = (state) => state.casosEspecialesStore.etiquetas;
export const selectPagination = (state) => state.casosEspecialesStore.pagination;
export const selectPage = (state) => state.casosEspecialesStore.pagination.page;
export const selectPageSize = (state) => state.casosEspecialesStore.pagination.pageSize;
export const selectTotalRows = (state) => state.casosEspecialesStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.casosEspecialesStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.casosEspecialesStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.casosEspecialesStore.pagination.previous !== null;
export const selectSortField = (state) => state.casosEspecialesStore.sortField;
export const selectSortOrder = (state) => state.casosEspecialesStore.sortOrder;
export const selectFilters = (state) => state.casosEspecialesStore.filters;
export const selectAppliedFilters = (state) => state.casosEspecialesStore.appliedFilters;
export const selectOpenModal = (state) => state.casosEspecialesStore.openModal;
export const selectSelectedCaso = (state) => state.casosEspecialesStore.selectedCaso;
export const selectForm = (state) => state.casosEspecialesStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.casosEspecialesStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredCasosEspeciales = (state) => {
  const { casosEspeciales, appliedFilters } = state.casosEspecialesStore;
  const { search } = appliedFilters;

  if (!search) {
    return casosEspeciales;
  }

  return casosEspeciales.filter((caso) => {
    const searchLower = search.toLowerCase();
    if (
      !(caso.placa || '').toLowerCase().includes(searchLower) &&
      !(caso.nombre_completo || '').toLowerCase().includes(searchLower) &&
      !(caso.numero_documento || '').toLowerCase().includes(searchLower) &&
      !(caso.chasis || '').toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedCasosEspeciales = (state) => {
  const filtered = selectFilteredCasosEspeciales(state);
  const { sortField, sortOrder } = state.casosEspecialesStore;

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
export const selectPaginatedCasosEspeciales = (state) => {
  return selectSortedCasosEspeciales(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.casosEspecialesStore.pagination.count;
};

// History selectors
export const selectHistoryData = (state) => state.casosEspecialesStore.history_data;
export const selectHistoryPagination = (state) => state.casosEspecialesStore.historyPagination;
export const selectOpenHistoryModal = (state) => state.casosEspecialesStore.openHistoryModal;
export const selectSelectedHistoryCaso = (state) => state.casosEspecialesStore.selectedHistoryCaso;

export default casosEspecialesStore.reducer;
