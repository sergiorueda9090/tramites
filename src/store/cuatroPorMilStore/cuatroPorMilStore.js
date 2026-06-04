import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialFilters = {
  search: '',
  modulo: '',
  tarjeta_id: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const initialState = {
  // Lista de registros 4x1000
  registros: [],
  loading: false,
  error: null,

  // Estadísticas agregadas (panel de visualización)
  stats: null,
  statsLoading: false,

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

  // Sub-cuentas auxiliares (para la configuración)
  subCuentas: [],
  loadingSubCuentas: false,

  // Configuración: sub-cuenta de débito por defecto
  config: {
    sub_cuenta_debito: null,
    sub_cuenta_debito_codigo: null,
    sub_cuenta_debito_nombre: null,
    updated_at: null,
  },
  loadingConfig: false,
  savingConfig: false,
};

export const cuatroPorMilStore = createSlice({
  name: 'cuatroPorMilStore',
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

    setStats: (state, action) => {
      state.stats = action.payload;
      state.statsLoading = false;
    },
    setStatsLoading: (state, action) => {
      state.statsLoading = action.payload;
    },

    setSubCuentas: (state, action) => {
      state.subCuentas = action.payload;
      state.loadingSubCuentas = false;
    },
    setLoadingSubCuentas: (state, action) => {
      state.loadingSubCuentas = action.payload;
    },

    setConfig: (state, action) => {
      state.config = { ...state.config, ...action.payload };
      state.loadingConfig = false;
    },
    setLoadingConfig: (state, action) => {
      state.loadingConfig = action.payload;
    },
    setSavingConfig: (state, action) => {
      state.savingConfig = action.payload;
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
  setStats,
  setStatsLoading,
  setSubCuentas,
  setLoadingSubCuentas,
  setConfig,
  setLoadingConfig,
  setSavingConfig,
  setPagination,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  resetStore,
} = cuatroPorMilStore.actions;

// Selectores
export const selectRegistros     = (state) => state.cuatroPorMilStore.registros;
export const selectLoading       = (state) => state.cuatroPorMilStore.loading;
export const selectError         = (state) => state.cuatroPorMilStore.error;
export const selectStats         = (state) => state.cuatroPorMilStore.stats;
export const selectStatsLoading  = (state) => state.cuatroPorMilStore.statsLoading;
export const selectSubCuentas    = (state) => state.cuatroPorMilStore.subCuentas;
export const selectConfig        = (state) => state.cuatroPorMilStore.config;
export const selectSavingConfig  = (state) => state.cuatroPorMilStore.savingConfig;
export const selectPagination    = (state) => state.cuatroPorMilStore.pagination;
export const selectPage          = (state) => state.cuatroPorMilStore.pagination.page;
export const selectPageSize      = (state) => state.cuatroPorMilStore.pagination.pageSize;
export const selectTotalRows     = (state) => state.cuatroPorMilStore.pagination.count;
export const selectSortField     = (state) => state.cuatroPorMilStore.sortField;
export const selectSortOrder     = (state) => state.cuatroPorMilStore.sortOrder;
export const selectFilters       = (state) => state.cuatroPorMilStore.filters;
export const selectAppliedFilters = (state) => state.cuatroPorMilStore.appliedFilters;

export const selectActiveFilters = (state) => {
  const filters = state.cuatroPorMilStore.appliedFilters;
  return Object.entries(filters)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// El backend ya entrega la página filtrada/ordenada
export const selectPaginatedRegistros = (state) => state.cuatroPorMilStore.registros;
export const selectFilteredTotalRows  = (state) => state.cuatroPorMilStore.pagination.count;

export default cuatroPorMilStore.reducer;
