import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialFilters = {
  search: '',
  activo: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const initialForm = { id: null, correo: '', descripcion: '', activo: true };

const initialState = {
  // Pool de correos (página actual del servidor)
  correos: [],
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

  // Modal/form CRUD del pool
  openModal: false,
  selectedCorreo: null,
  form: { ...initialForm },
};

export const correosAleatoriosStore = createSlice({
  name: 'correosAleatoriosStore',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; state.loading = false; },
    setCorreos: (state, action) => { state.correos = action.payload; state.loading = false; },

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
    setPage: (state, action) => { state.pagination.page = action.payload; },
    setPageSize: (state, action) => { state.pagination.pageSize = action.payload; state.pagination.page = 1; },

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

    // Modal/form CRUD
    openCreateModal: (state) => {
      state.openModal = true;
      state.selectedCorreo = null;
      state.form = { ...initialForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedCorreo = action.payload;
      state.form = {
        id: action.payload.id,
        correo: action.payload.correo || '',
        descripcion: action.payload.descripcion || '',
        activo: action.payload.activo ?? true,
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedCorreo = null;
      state.form = { ...initialForm };
    },
    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },

    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setCorreos,
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
  resetStore,
} = correosAleatoriosStore.actions;

// ===== Selectores (namespace propio) =====
export const selectCorreos        = (state) => state.correosAleatoriosStore.correos;
export const selectLoading        = (state) => state.correosAleatoriosStore.loading;
export const selectError          = (state) => state.correosAleatoriosStore.error;
export const selectPagination     = (state) => state.correosAleatoriosStore.pagination;
export const selectPage           = (state) => state.correosAleatoriosStore.pagination.page;
export const selectPageSize       = (state) => state.correosAleatoriosStore.pagination.pageSize;
export const selectTotalRows      = (state) => state.correosAleatoriosStore.pagination.count;
export const selectSortField      = (state) => state.correosAleatoriosStore.sortField;
export const selectSortOrder      = (state) => state.correosAleatoriosStore.sortOrder;
export const selectFilters        = (state) => state.correosAleatoriosStore.filters;
export const selectAppliedFilters = (state) => state.correosAleatoriosStore.appliedFilters;
export const selectOpenModal      = (state) => state.correosAleatoriosStore.openModal;
export const selectSelectedCorreo = (state) => state.correosAleatoriosStore.selectedCorreo;
export const selectForm           = (state) => state.correosAleatoriosStore.form;

export const selectActiveFilters = (state) => {
  const filters = state.correosAleatoriosStore.appliedFilters;
  return Object.entries(filters)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => ({ key, value }));
};

// El backend ya entrega la página filtrada/ordenada
export const selectPaginatedCorreos   = (state) => state.correosAleatoriosStore.correos;
export const selectFilteredTotalRows  = (state) => state.correosAleatoriosStore.pagination.count;

export default correosAleatoriosStore.reducer;
