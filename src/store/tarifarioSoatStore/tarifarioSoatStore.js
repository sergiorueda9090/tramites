import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de tarifarios SOAT
  tarifarios      : [],
  history_data    : [],
  historyPagination: {
    count: 0,
    page: 1,
    pageSize: 10,
  },
  openHistoryModal: false,
  selectedHistoryTarifario: null,
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
    fecha_desde: '',
    fecha_hasta: '',
  },
  appliedFilters: {
    search: '',
    fecha_desde: '',
    fecha_hasta: '',
  },

  // Modal
  openModal: false,
  selectedTarifario: null,

  // Formulario
  form: {
    id: null,
    codigo_tarifa: '',
    descripcion: '',
    valor: '',
  },
};

export const tarifarioSoatStore = createSlice({
  name: 'tarifarioSoatStore',
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

    // Lista de tarifarios
    setTarifarios: (state, action) => {
      state.tarifarios = action.payload;
      state.loading = false;
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
      state.filters = { search: '', fecha_desde: '', fecha_hasta: '' };
      state.appliedFilters = { search: '', fecha_desde: '', fecha_hasta: '' };
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
      state.selectedTarifario = null;
      state.form = {
        id: null,
        codigo_tarifa: '',
        descripcion: '',
        valor: '',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedTarifario = action.payload;
      state.form = {
        id: action.payload.id,
        codigo_tarifa: action.payload.codigo_tarifa || '',
        descripcion: action.payload.descripcion || '',
        valor: action.payload.valor || '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedTarifario = null;
      state.form = initialState.form;
    },
    // history
    setHistory: (state, action) => {
      const { history_data, count, page, pageSize } = action.payload;
      state.history_data = history_data;
      if (count !== undefined) state.historyPagination.count = count;
      if (page !== undefined) state.historyPagination.page = page;
      if (pageSize !== undefined) state.historyPagination.pageSize = pageSize;
    },
    openHistoryDialog: (state, action) => {
      state.openHistoryModal = true;
      state.selectedHistoryTarifario = action.payload;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    closeHistoryDialog: (state) => {
      state.openHistoryModal = false;
      state.selectedHistoryTarifario = null;
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
      state.form = initialState.form;
    },

    // Reset
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
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
} = tarifarioSoatStore.actions;

// Selectores
export const selectTarifarios = (state) => state.tarifarioSoatStore.tarifarios;
export const selectLoading = (state) => state.tarifarioSoatStore.loading;
export const selectError = (state) => state.tarifarioSoatStore.error;
export const selectPagination = (state) => state.tarifarioSoatStore.pagination;
export const selectPage = (state) => state.tarifarioSoatStore.pagination.page;
export const selectPageSize = (state) => state.tarifarioSoatStore.pagination.pageSize;
export const selectTotalRows = (state) => state.tarifarioSoatStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.tarifarioSoatStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.tarifarioSoatStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.tarifarioSoatStore.pagination.previous !== null;
export const selectSortField = (state) => state.tarifarioSoatStore.sortField;
export const selectSortOrder = (state) => state.tarifarioSoatStore.sortOrder;
export const selectFilters = (state) => state.tarifarioSoatStore.filters;
export const selectAppliedFilters = (state) => state.tarifarioSoatStore.appliedFilters;
export const selectOpenModal = (state) => state.tarifarioSoatStore.openModal;
export const selectSelectedTarifario = (state) => state.tarifarioSoatStore.selectedTarifario;
export const selectForm = (state) => state.tarifarioSoatStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.tarifarioSoatStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredTarifarios = (state) => {
  const { tarifarios, appliedFilters } = state.tarifarioSoatStore;
  const { search } = appliedFilters;

  if (!search) {
    return tarifarios;
  }

  return tarifarios.filter((tarifario) => {
    const searchLower = search.toLowerCase();
    if (
      !(tarifario.codigo_tarifa || '').toLowerCase().includes(searchLower) &&
      !(tarifario.descripcion || '').toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedTarifarios = (state) => {
  const filteredTarifarios = selectFilteredTarifarios(state);
  const { sortField, sortOrder } = state.tarifarioSoatStore;

  if (!sortField) return filteredTarifarios;

  return [...filteredTarifarios].sort((a, b) => {
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
export const selectPaginatedTarifarios = (state) => {
  return selectSortedTarifarios(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.tarifarioSoatStore.pagination.count;
};

// History selectors
export const selectHistoryData = (state) => state.tarifarioSoatStore.history_data;
export const selectHistoryPagination = (state) => state.tarifarioSoatStore.historyPagination;
export const selectOpenHistoryModal = (state) => state.tarifarioSoatStore.openHistoryModal;
export const selectSelectedHistoryTarifario = (state) => state.tarifarioSoatStore.selectedHistoryTarifario;

export default tarifarioSoatStore.reducer;
