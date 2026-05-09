import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialFilters = {
  search: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const initialState = {
  // Lista de registros de utilidad
  registros: [],
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
};

export const utilidadesStore = createSlice({
  name: 'utilidadesStore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setRegistros: (state, action) => {
      state.registros = action.payload;
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

    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setRegistros,
  setPagination,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  resetStore,
} = utilidadesStore.actions;

// Selectores
export const selectRegistros      = (state) => state.utilidadesStore.registros;
export const selectLoading        = (state) => state.utilidadesStore.loading;
export const selectError          = (state) => state.utilidadesStore.error;
export const selectPagination     = (state) => state.utilidadesStore.pagination;
export const selectPage           = (state) => state.utilidadesStore.pagination.page;
export const selectPageSize       = (state) => state.utilidadesStore.pagination.pageSize;
export const selectTotalRows      = (state) => state.utilidadesStore.pagination.count;
export const selectSortField      = (state) => state.utilidadesStore.sortField;
export const selectSortOrder      = (state) => state.utilidadesStore.sortOrder;
export const selectFilters        = (state) => state.utilidadesStore.filters;
export const selectAppliedFilters = (state) => state.utilidadesStore.appliedFilters;

export const selectActiveFilters = (state) => {
  const filters = state.utilidadesStore.appliedFilters;
  return Object.entries(filters)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// El backend ya entrega la página filtrada/ordenada
export const selectPaginatedRegistros = (state) => state.utilidadesStore.registros;
export const selectFilteredTotalRows  = (state) => state.utilidadesStore.pagination.count;

export default utilidadesStore.reducer;
