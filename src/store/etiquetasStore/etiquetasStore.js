import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de etiquetas
  etiquetas: [],
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
  selectedEtiqueta: null,

  // Formulario
  form: {
    id: null,
    nombre: '',
    color: '#1976d2',
  },
};

export const etiquetasStore = createSlice({
  name: 'etiquetasStore',
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

    // Lista de etiquetas
    setEtiquetas: (state, action) => {
      state.etiquetas = action.payload;
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
      state.selectedEtiqueta = null;
      state.form = {
        id: null,
        nombre: '',
        color: '#1976d2',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedEtiqueta = action.payload;
      state.form = {
        id: action.payload.id,
        nombre: action.payload.nombre || '',
        color: action.payload.color || '#1976d2',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedEtiqueta = null;
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
} = etiquetasStore.actions;

// Selectores
export const selectEtiquetas = (state) => state.etiquetasStore.etiquetas;
export const selectLoading = (state) => state.etiquetasStore.loading;
export const selectError = (state) => state.etiquetasStore.error;
export const selectPagination = (state) => state.etiquetasStore.pagination;
export const selectPage = (state) => state.etiquetasStore.pagination.page;
export const selectPageSize = (state) => state.etiquetasStore.pagination.pageSize;
export const selectTotalRows = (state) => state.etiquetasStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.etiquetasStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.etiquetasStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.etiquetasStore.pagination.previous !== null;
export const selectSortField = (state) => state.etiquetasStore.sortField;
export const selectSortOrder = (state) => state.etiquetasStore.sortOrder;
export const selectFilters = (state) => state.etiquetasStore.filters;
export const selectAppliedFilters = (state) => state.etiquetasStore.appliedFilters;
export const selectOpenModal = (state) => state.etiquetasStore.openModal;
export const selectSelectedEtiqueta = (state) => state.etiquetasStore.selectedEtiqueta;
export const selectForm = (state) => state.etiquetasStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.etiquetasStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredEtiquetas = (state) => {
  const { etiquetas, appliedFilters } = state.etiquetasStore;
  const { search } = appliedFilters;

  if (!search) {
    return etiquetas;
  }

  return etiquetas.filter((etiqueta) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (!(etiqueta.nombre || '').toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedEtiquetas = (state) => {
  const filteredEtiquetas = selectFilteredEtiquetas(state);
  const { sortField, sortOrder } = state.etiquetasStore;

  if (!sortField) return filteredEtiquetas;

  return [...filteredEtiquetas].sort((a, b) => {
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
export const selectPaginatedEtiquetas = (state) => {
  return selectSortedEtiquetas(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.etiquetasStore.pagination.count;
};

export default etiquetasStore.reducer;
