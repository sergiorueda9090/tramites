import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de categorías de gasto
  gastosMain: [],
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
  },
  appliedFilters: {
    search: '',
  },

  // Modal
  openModal: false,
  selectedGastoMain: null,

  // Formulario
  form: {
    id: null,
    nombre: '',
    descripcion: '',
  },
};

export const gastosMainStore = createSlice({
  name: 'gastosMainStore',
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

    // Lista de categorías de gasto
    setGastosMain: (state, action) => {
      state.gastosMain = action.payload;
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
      state.filters = { search: '' };
      state.appliedFilters = { search: '' };
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
      state.selectedGastoMain = null;
      state.form = {
        id: null,
        nombre: '',
        descripcion: '',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedGastoMain = action.payload;
      state.form = {
        id: action.payload.id,
        nombre: action.payload.nombre || '',
        descripcion: action.payload.descripcion || '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedGastoMain = null;
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
  setGastosMain,
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
} = gastosMainStore.actions;

// Selectores
export const selectGastosMain = (state) => state.gastosMainStore.gastosMain;
export const selectLoading = (state) => state.gastosMainStore.loading;
export const selectError = (state) => state.gastosMainStore.error;
export const selectPagination = (state) => state.gastosMainStore.pagination;
export const selectPage = (state) => state.gastosMainStore.pagination.page;
export const selectPageSize = (state) => state.gastosMainStore.pagination.pageSize;
export const selectTotalRows = (state) => state.gastosMainStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.gastosMainStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.gastosMainStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.gastosMainStore.pagination.previous !== null;
export const selectSortField = (state) => state.gastosMainStore.sortField;
export const selectSortOrder = (state) => state.gastosMainStore.sortOrder;
export const selectFilters = (state) => state.gastosMainStore.filters;
export const selectAppliedFilters = (state) => state.gastosMainStore.appliedFilters;
export const selectOpenModal = (state) => state.gastosMainStore.openModal;
export const selectSelectedGastoMain = (state) => state.gastosMainStore.selectedGastoMain;
export const selectForm = (state) => state.gastosMainStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.gastosMainStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredGastosMain = (state) => {
  const { gastosMain, appliedFilters } = state.gastosMainStore;
  const { search } = appliedFilters;

  if (!search) {
    return gastosMain;
  }

  return gastosMain.filter((gasto) => {
    const searchLower = search.toLowerCase();
    if (
      !(gasto.nombre || '').toLowerCase().includes(searchLower) &&
      !(gasto.descripcion || '').toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedGastosMain = (state) => {
  const filteredGastos = selectFilteredGastosMain(state);
  const { sortField, sortOrder } = state.gastosMainStore;

  if (!sortField) return filteredGastos;

  return [...filteredGastos].sort((a, b) => {
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
export const selectPaginatedGastosMain = (state) => {
  return selectSortedGastosMain(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.gastosMainStore.pagination.count;
};

export default gastosMainStore.reducer;
