import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de relaciones de gasto (transacciones financieras)
  gastosRelaciones: [],
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
    gasto: '',
    tarjeta: '',
    fecha_desde: '',
    fecha_hasta: '',
  },
  appliedFilters: {
    search: '',
    gasto: '',
    tarjeta: '',
    fecha_desde: '',
    fecha_hasta: '',
  },

  // Modal
  openModal: false,
  selectedGastoRelacion: null,

  // Formulario
  form: {
    id: null,
    gasto: '',
    tarjeta: '',
    valor: '',
    observacion: '',
    fecha: '',
  },

  // Datos auxiliares para selects
  gastos: [],     // Categorías de gasto
  tarjetas: [],   // Tarjetas de pago
};

export const gastosStore = createSlice({
  name: 'gastosStore',
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

    // Lista de relaciones de gasto
    setGastosRelaciones: (state, action) => {
      state.gastosRelaciones = action.payload;
      state.loading = false;
    },

    // Datos auxiliares
    setGastos: (state, action) => {
      state.gastos = action.payload;
    },
    setTarjetas: (state, action) => {
      state.tarjetas = action.payload;
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
      state.filters = { search: '', gasto: '', tarjeta: '', fecha_desde: '', fecha_hasta: '' };
      state.appliedFilters = { search: '', gasto: '', tarjeta: '', fecha_desde: '', fecha_hasta: '' };
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
      state.selectedGastoRelacion = null;
      state.form = {
        id: null,
        gasto: '',
        tarjeta: '',
        valor: '',
        observacion: '',
        fecha: new Date().toISOString().slice(0, 16),
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedGastoRelacion = action.payload;
      state.form = {
        id: action.payload.id,
        gasto: action.payload.gasto?.id || '',
        tarjeta: action.payload.tarjeta?.id || '',
        valor: action.payload.valor || '',
        observacion: action.payload.observacion || '',
        fecha: action.payload.fecha ? action.payload.fecha.slice(0, 16) : '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedGastoRelacion = null;
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
  setGastosRelaciones,
  setGastos,
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
} = gastosStore.actions;

// Selectores
export const selectGastosRelaciones = (state) => state.gastosStore.gastosRelaciones;
export const selectLoading = (state) => state.gastosStore.loading;
export const selectError = (state) => state.gastosStore.error;
export const selectGastos = (state) => state.gastosStore.gastos;
export const selectTarjetas = (state) => state.gastosStore.tarjetas;
export const selectPagination = (state) => state.gastosStore.pagination;
export const selectPage = (state) => state.gastosStore.pagination.page;
export const selectPageSize = (state) => state.gastosStore.pagination.pageSize;
export const selectTotalRows = (state) => state.gastosStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.gastosStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.gastosStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.gastosStore.pagination.previous !== null;
export const selectSortField = (state) => state.gastosStore.sortField;
export const selectSortOrder = (state) => state.gastosStore.sortOrder;
export const selectFilters = (state) => state.gastosStore.filters;
export const selectAppliedFilters = (state) => state.gastosStore.appliedFilters;
export const selectOpenModal = (state) => state.gastosStore.openModal;
export const selectSelectedGastoRelacion = (state) => state.gastosStore.selectedGastoRelacion;
export const selectForm = (state) => state.gastosStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.gastosStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredGastosRelaciones = (state) => {
  const { gastosRelaciones, appliedFilters } = state.gastosStore;
  const { search, gasto, tarjeta } = appliedFilters;

  if (!search && !gasto && !tarjeta) {
    return gastosRelaciones;
  }

  return gastosRelaciones.filter((relacion) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(relacion.gasto?.nombre || '').toLowerCase().includes(searchLower) &&
        !(relacion.tarjeta?.numero || '').toLowerCase().includes(searchLower) &&
        !(relacion.tarjeta?.titular || '').toLowerCase().includes(searchLower) &&
        !(relacion.observacion || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (gasto && relacion.gasto?.id !== parseInt(gasto)) {
      return false;
    }

    if (tarjeta && relacion.tarjeta?.id !== parseInt(tarjeta)) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedGastosRelaciones = (state) => {
  const filteredRelaciones = selectFilteredGastosRelaciones(state);
  const { sortField, sortOrder } = state.gastosStore;

  if (!sortField) return filteredRelaciones;

  return [...filteredRelaciones].sort((a, b) => {
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
export const selectPaginatedGastosRelaciones = (state) => {
  return selectSortedGastosRelaciones(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.gastosStore.pagination.count;
};

export default gastosStore.reducer;
