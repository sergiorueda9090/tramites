import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de endpoints externos
  endpoints: [],
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
  filters: {
    search: '',
    metodo_http: '',
    activo: '',
    fecha_desde: '',
    fecha_hasta: '',
  },
  appliedFilters: {
    search: '',
    metodo_http: '',
    activo: '',
    fecha_desde: '',
    fecha_hasta: '',
  },

  // Modal
  openModal: false,
  selectedEndpoint: null,

  // Formulario
  form: {
    id: null,
    nombre: '',
    codigo: '',
    url_base: '',
    metodo_http: 'GET',
    descripcion: '',
    activo: true,
    timeout: 30,
  },
};

const emptyFilters = {
  search: '',
  metodo_http: '',
  activo: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const emptyForm = {
  id: null,
  nombre: '',
  codigo: '',
  url_base: '',
  metodo_http: 'GET',
  descripcion: '',
  activo: true,
  timeout: 30,
};

export const apiAppStore = createSlice({
  name: 'apiAppStore',
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

    // Lista
    setEndpoints: (state, action) => {
      state.endpoints = action.payload;
      state.loading = false;
    },

    // Paginación
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
      state.selectedEndpoint = null;
      state.form = { ...emptyForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedEndpoint = action.payload;
      const ep = action.payload;
      state.form = {
        id: ep.id,
        nombre: ep.nombre || '',
        codigo: ep.codigo || '',
        url_base: ep.url_base || '',
        metodo_http: ep.metodo_http || 'GET',
        descripcion: ep.descripcion || '',
        activo: ep.activo ?? true,
        timeout: ep.timeout || 30,
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedEndpoint = null;
      state.form = { ...emptyForm };
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
  setEndpoints,
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
} = apiAppStore.actions;

// Selectores
export const selectEndpoints = (state) => state.apiAppStore.endpoints;
export const selectLoading = (state) => state.apiAppStore.loading;
export const selectError = (state) => state.apiAppStore.error;
export const selectPagination = (state) => state.apiAppStore.pagination;
export const selectPage = (state) => state.apiAppStore.pagination.page;
export const selectPageSize = (state) => state.apiAppStore.pagination.pageSize;
export const selectTotalRows = (state) => state.apiAppStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.apiAppStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.apiAppStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.apiAppStore.pagination.previous !== null;
export const selectSortField = (state) => state.apiAppStore.sortField;
export const selectSortOrder = (state) => state.apiAppStore.sortOrder;
export const selectFilters = (state) => state.apiAppStore.filters;
export const selectAppliedFilters = (state) => state.apiAppStore.appliedFilters;
export const selectOpenModal = (state) => state.apiAppStore.openModal;
export const selectSelectedEndpoint = (state) => state.apiAppStore.selectedEndpoint;
export const selectForm = (state) => state.apiAppStore.form;

export const selectActiveFilters = (state) => {
  const filters = state.apiAppStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

export const selectFilteredEndpoints = (state) => {
  const { endpoints, appliedFilters } = state.apiAppStore;
  const { search, metodo_http, activo } = appliedFilters;

  if (!search && !metodo_http && !activo) return endpoints;

  return endpoints.filter((ep) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !(ep.nombre || '').toLowerCase().includes(s) &&
        !(ep.codigo || '').toLowerCase().includes(s) &&
        !(ep.url_base || '').toLowerCase().includes(s) &&
        !(ep.descripcion || '').toLowerCase().includes(s)
      ) return false;
    }
    if (metodo_http && ep.metodo_http !== metodo_http) return false;
    if (activo && String(ep.activo) !== (activo === '1' ? 'true' : 'false')) return false;
    return true;
  });
};

export const selectSortedEndpoints = (state) => {
  const filtered = selectFilteredEndpoints(state);
  const { sortField, sortOrder } = state.apiAppStore;
  if (!sortField) return filtered;

  return [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    let cmp = 0;
    if (typeof aVal === 'string') cmp = aVal.localeCompare(bVal);
    else if (typeof aVal === 'number') cmp = aVal - bVal;
    else if (typeof aVal === 'boolean') cmp = aVal === bVal ? 0 : aVal ? -1 : 1;
    return sortOrder === 'asc' ? cmp : -cmp;
  });
};

export const selectPaginatedEndpoints = (state) => selectSortedEndpoints(state);
export const selectFilteredTotalRows = (state) => state.apiAppStore.pagination.count;

export default apiAppStore.reducer;
