import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialFilters = {
  search: '',
  tarjeta: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const initialForm = {
  id: null,
  tarjeta: '',
  valor: '',
  observacion: '',
  fecha: '',
};

const initialState = {
  // Lista de utilidades ocasionales
  utilidades: [],
  loading: false,
  error: null,

  // Paginación (servidor - formato DRF)
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
  filters: { ...initialFilters },
  appliedFilters: { ...initialFilters },

  // Modal
  openModal: false,
  selectedUtilidad: null,

  // Formulario
  form: { ...initialForm },

  // Datos auxiliares para selects
  tarjetas: [],
};

export const utilidadOcasionalStore = createSlice({
  name: 'utilidadOcasionalStore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setUtilidades: (state, action) => {
      state.utilidades = action.payload;
      state.loading = false;
    },

    setTarjetas: (state, action) => {
      state.tarjetas = action.payload;
    },

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

    setSort: (state, action) => {
      const { field } = action.payload;
      if (state.sortField === field) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortOrder = 'asc';
      }
    },

    updateFilter: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
    },
    applyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { ...initialFilters };
      state.appliedFilters = { ...initialFilters };
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
      state.selectedUtilidad = null;
      state.form = {
        ...initialForm,
        fecha: new Date().toISOString().slice(0, 16),
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedUtilidad = action.payload;
      state.form = {
        id: action.payload.id,
        tarjeta: action.payload.tarjeta?.id || '',
        valor: action.payload.valor || '',
        observacion: action.payload.observacion || '',
        fecha: action.payload.fecha ? action.payload.fecha.slice(0, 16) : '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedUtilidad = null;
      state.form = { ...initialForm };
    },

    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => {
      state.form = { ...initialForm };
    },

    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setUtilidades,
  setTarjetas,
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
} = utilidadOcasionalStore.actions;

// Selectores
export const selectUtilidades       = (state) => state.utilidadOcasionalStore.utilidades;
export const selectLoading          = (state) => state.utilidadOcasionalStore.loading;
export const selectError            = (state) => state.utilidadOcasionalStore.error;
export const selectTarjetas         = (state) => state.utilidadOcasionalStore.tarjetas;
export const selectPagination       = (state) => state.utilidadOcasionalStore.pagination;
export const selectPage             = (state) => state.utilidadOcasionalStore.pagination.page;
export const selectPageSize         = (state) => state.utilidadOcasionalStore.pagination.pageSize;
export const selectTotalRows        = (state) => state.utilidadOcasionalStore.pagination.count;
export const selectSortField        = (state) => state.utilidadOcasionalStore.sortField;
export const selectSortOrder        = (state) => state.utilidadOcasionalStore.sortOrder;
export const selectFilters          = (state) => state.utilidadOcasionalStore.filters;
export const selectAppliedFilters   = (state) => state.utilidadOcasionalStore.appliedFilters;
export const selectOpenModal        = (state) => state.utilidadOcasionalStore.openModal;
export const selectSelectedUtilidad = (state) => state.utilidadOcasionalStore.selectedUtilidad;
export const selectForm             = (state) => state.utilidadOcasionalStore.form;

export const selectActiveFilters = (state) => {
  const filters = state.utilidadOcasionalStore.appliedFilters;
  return Object.entries(filters)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// El backend ya entrega la página filtrada/ordenada
export const selectPaginatedUtilidades = (state) => state.utilidadOcasionalStore.utilidades;
export const selectFilteredTotalRows   = (state) => state.utilidadOcasionalStore.pagination.count;

export default utilidadOcasionalStore.reducer;
