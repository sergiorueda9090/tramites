import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de tarjetas
  tarjetas: [],
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
    cuatro_por_mil: '',
    usuario: '',
  },
  appliedFilters: {
    search: '',
    cuatro_por_mil: '',
    usuario: '',
  },

  // Modal
  openModal: false,
  selectedTarjeta: null,

  // Formulario
  form: {
    id: null,
    usuario: '',
    numero: '',
    titular: '',
    descripcion: '',
    cuatro_por_mil: '0',
  },
};

export const tarjetasStore = createSlice({
  name: 'tarjetasStore',
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

    // Lista de tarjetas
    setTarjetas: (state, action) => {
      state.tarjetas = action.payload;
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
      state.filters = { search: '', cuatro_por_mil: '', usuario: '' };
      state.appliedFilters = { search: '', cuatro_por_mil: '', usuario: '' };
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
      state.selectedTarjeta = null;
      state.form = {
        id: null,
        usuario: '',
        numero: '',
        titular: '',
        descripcion: '',
        cuatro_por_mil: '0',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedTarjeta = action.payload;
      state.form = {
        id: action.payload.id,
        usuario: action.payload.usuario || '',
        numero: action.payload.numero || '',
        titular: action.payload.titular || '',
        descripcion: action.payload.descripcion || '',
        cuatro_por_mil: action.payload.cuatro_por_mil || '0',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedTarjeta = null;
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
} = tarjetasStore.actions;

// Selectores
export const selectTarjetas = (state) => state.tarjetasStore.tarjetas;
export const selectLoading = (state) => state.tarjetasStore.loading;
export const selectError = (state) => state.tarjetasStore.error;
export const selectPagination = (state) => state.tarjetasStore.pagination;
export const selectPage = (state) => state.tarjetasStore.pagination.page;
export const selectPageSize = (state) => state.tarjetasStore.pagination.pageSize;
export const selectTotalRows = (state) => state.tarjetasStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.tarjetasStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.tarjetasStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.tarjetasStore.pagination.previous !== null;
export const selectSortField = (state) => state.tarjetasStore.sortField;
export const selectSortOrder = (state) => state.tarjetasStore.sortOrder;
export const selectFilters = (state) => state.tarjetasStore.filters;
export const selectAppliedFilters = (state) => state.tarjetasStore.appliedFilters;
export const selectOpenModal = (state) => state.tarjetasStore.openModal;
export const selectSelectedTarjeta = (state) => state.tarjetasStore.selectedTarjeta;
export const selectForm = (state) => state.tarjetasStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.tarjetasStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredTarjetas = (state) => {
  const { tarjetas, appliedFilters } = state.tarjetasStore;
  const { search, cuatro_por_mil } = appliedFilters;

  if (!search && !cuatro_por_mil) {
    return tarjetas;
  }

  return tarjetas.filter((tarjeta) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(tarjeta.numero || '').toLowerCase().includes(searchLower) &&
        !(tarjeta.titular || '').toLowerCase().includes(searchLower) &&
        !(tarjeta.descripcion || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (cuatro_por_mil && tarjeta.cuatro_por_mil !== cuatro_por_mil) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedTarjetas = (state) => {
  const filteredTarjetas = selectFilteredTarjetas(state);
  const { sortField, sortOrder } = state.tarjetasStore;

  if (!sortField) return filteredTarjetas;

  return [...filteredTarjetas].sort((a, b) => {
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
export const selectPaginatedTarjetas = (state) => {
  return selectSortedTarjetas(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.tarjetasStore.pagination.count;
};

export default tarjetasStore.reducer;
