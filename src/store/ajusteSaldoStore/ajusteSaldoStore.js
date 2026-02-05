import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de ajustes de saldo
  ajustesSaldo: [],
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
    cliente: '',
    fecha_desde: '',
    fecha_hasta: '',
  },
  appliedFilters: {
    search: '',
    cliente: '',
    fecha_desde: '',
    fecha_hasta: '',
  },

  // Modal
  openModal: false,
  selectedAjusteSaldo: null,

  // Formulario
  form: {
    id: null,
    cliente: '',
    valor: '',
    observacion: '',
    fecha: '',
  },

  // Datos auxiliares para selects
  clientes: [],
};

export const ajusteSaldoStore = createSlice({
  name: 'ajusteSaldoStore',
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

    // Lista de ajustes de saldo
    setAjustesSaldo: (state, action) => {
      state.ajustesSaldo = action.payload;
      state.loading = false;
    },

    // Datos auxiliares
    setClientes: (state, action) => {
      state.clientes = action.payload;
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
      state.filters = { search: '', cliente: '', fecha_desde: '', fecha_hasta: '' };
      state.appliedFilters = { search: '', cliente: '', fecha_desde: '', fecha_hasta: '' };
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
      state.selectedAjusteSaldo = null;
      state.form = {
        id: null,
        cliente: '',
        valor: '',
        observacion: '',
        fecha: new Date().toISOString().slice(0, 16),
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedAjusteSaldo = action.payload;
      state.form = {
        id: action.payload.id,
        cliente: action.payload.cliente?.id || '',
        valor: action.payload.valor || '',
        observacion: action.payload.observacion || '',
        fecha: action.payload.fecha ? action.payload.fecha.slice(0, 16) : '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedAjusteSaldo = null;
      state.form = initialState.form;
    },

    // Formulario
    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => {
      state.form = initialState.form;
    },

    // Reset
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setAjustesSaldo,
  setClientes,
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
} = ajusteSaldoStore.actions;

// Selectores
export const selectAjustesSaldo = (state) => state.ajusteSaldoStore.ajustesSaldo;
export const selectLoading = (state) => state.ajusteSaldoStore.loading;
export const selectError = (state) => state.ajusteSaldoStore.error;
export const selectClientes = (state) => state.ajusteSaldoStore.clientes;
export const selectPagination = (state) => state.ajusteSaldoStore.pagination;
export const selectPage = (state) => state.ajusteSaldoStore.pagination.page;
export const selectPageSize = (state) => state.ajusteSaldoStore.pagination.pageSize;
export const selectTotalRows = (state) => state.ajusteSaldoStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.ajusteSaldoStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.ajusteSaldoStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.ajusteSaldoStore.pagination.previous !== null;
export const selectSortField = (state) => state.ajusteSaldoStore.sortField;
export const selectSortOrder = (state) => state.ajusteSaldoStore.sortOrder;
export const selectFilters = (state) => state.ajusteSaldoStore.filters;
export const selectAppliedFilters = (state) => state.ajusteSaldoStore.appliedFilters;
export const selectOpenModal = (state) => state.ajusteSaldoStore.openModal;
export const selectSelectedAjusteSaldo = (state) => state.ajusteSaldoStore.selectedAjusteSaldo;
export const selectForm = (state) => state.ajusteSaldoStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.ajusteSaldoStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredAjustesSaldo = (state) => {
  const { ajustesSaldo, appliedFilters } = state.ajusteSaldoStore;
  const { search, cliente } = appliedFilters;

  if (!search && !cliente) {
    return ajustesSaldo;
  }

  return ajustesSaldo.filter((ajuste) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(ajuste.cliente?.nombre || '').toLowerCase().includes(searchLower) &&
        !(ajuste.observacion || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (cliente && ajuste.cliente?.id !== parseInt(cliente)) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedAjustesSaldo = (state) => {
  const filteredAjustes = selectFilteredAjustesSaldo(state);
  const { sortField, sortOrder } = state.ajusteSaldoStore;

  if (!sortField) return filteredAjustes;

  return [...filteredAjustes].sort((a, b) => {
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
export const selectPaginatedAjustesSaldo = (state) => {
  return selectSortedAjustesSaldo(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.ajusteSaldoStore.pagination.count;
};

export default ajusteSaldoStore.reducer;
