import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialFilters = {
  search: '',
  protocolo: '',
  activo: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const initialForm = {
  id: null,
  nombre: '',
  ip: '',
  puerto: '',
  protocolo: 'http',
  descripcion: '',
  activo: false,
};

const initialState = {
  // Lista de IPs del conmutador
  ips: [],
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
  selectedIp: null,

  // Formulario
  form: { ...initialForm },
};

export const conmutadorIpsStore = createSlice({
  name: 'conmutadorIpsStore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setIps: (state, action) => {
      state.ips = action.payload;
      state.loading = false;
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
      state.selectedIp = null;
      state.form = { ...initialForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedIp = action.payload;
      state.form = {
        id:          action.payload.id,
        nombre:      action.payload.nombre || '',
        ip:          action.payload.ip || '',
        puerto:      action.payload.puerto ?? '',
        protocolo:   action.payload.protocolo || 'http',
        descripcion: action.payload.descripcion || '',
        activo:      Boolean(action.payload.activo),
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedIp = null;
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
  setIps,
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
} = conmutadorIpsStore.actions;

// Selectores
export const selectIps              = (state) => state.conmutadorIpsStore.ips;
export const selectLoading          = (state) => state.conmutadorIpsStore.loading;
export const selectError            = (state) => state.conmutadorIpsStore.error;
export const selectPagination       = (state) => state.conmutadorIpsStore.pagination;
export const selectPage             = (state) => state.conmutadorIpsStore.pagination.page;
export const selectPageSize         = (state) => state.conmutadorIpsStore.pagination.pageSize;
export const selectTotalRows        = (state) => state.conmutadorIpsStore.pagination.count;
export const selectSortField        = (state) => state.conmutadorIpsStore.sortField;
export const selectSortOrder        = (state) => state.conmutadorIpsStore.sortOrder;
export const selectFilters          = (state) => state.conmutadorIpsStore.filters;
export const selectAppliedFilters   = (state) => state.conmutadorIpsStore.appliedFilters;
export const selectOpenModal        = (state) => state.conmutadorIpsStore.openModal;
export const selectSelectedIp       = (state) => state.conmutadorIpsStore.selectedIp;
export const selectForm             = (state) => state.conmutadorIpsStore.form;

export const selectActiveFilters = (state) => {
  const filters = state.conmutadorIpsStore.appliedFilters;
  return Object.entries(filters)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => ({ key, value }));
};

// El backend ya entrega la página filtrada/ordenada
export const selectPaginatedIps      = (state) => state.conmutadorIpsStore.ips;
export const selectFilteredTotalRows = (state) => state.conmutadorIpsStore.pagination.count;

export default conmutadorIpsStore.reducer;
