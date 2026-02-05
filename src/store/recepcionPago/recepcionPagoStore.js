import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de recepciones de pago
  recepcionesPago: [],
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
    tarjeta: '',
    fecha_desde: '',
    fecha_hasta: '',
  },
  appliedFilters: {
    search: '',
    cliente: '',
    tarjeta: '',
    fecha_desde: '',
    fecha_hasta: '',
  },

  // Modal
  openModal: false,
  selectedRecepcionPago: null,

  // Formulario
  form: {
    id: null,
    cliente: '',
    tarjeta: '',
    valor: '',
    observacion: '',
    fecha: '',
  },

  // Datos auxiliares para selects
  clientes: [],
  tarjetas: [],
};

export const recepcionPagoStore = createSlice({
  name: 'recepcionPagoStore',
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

    // Lista de recepciones de pago
    setRecepcionesPago: (state, action) => {
      state.recepcionesPago = action.payload;
      state.loading = false;
    },

    // Datos auxiliares
    setClientes: (state, action) => {
      state.clientes = action.payload;
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
      state.filters = { search: '', cliente: '', tarjeta: '', fecha_desde: '', fecha_hasta: '' };
      state.appliedFilters = { search: '', cliente: '', tarjeta: '', fecha_desde: '', fecha_hasta: '' };
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
      state.selectedRecepcionPago = null;
      state.form = {
        id: null,
        cliente: '',
        tarjeta: '',
        valor: '',
        observacion: '',
        fecha: new Date().toISOString().slice(0, 16), // Fecha actual por defecto
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedRecepcionPago = action.payload;
      state.form = {
        id: action.payload.id,
        cliente: action.payload.cliente?.id || '',
        tarjeta: action.payload.tarjeta?.id || '',
        valor: action.payload.valor || '',
        observacion: action.payload.observacion || '',
        fecha: action.payload.fecha ? action.payload.fecha.slice(0, 16) : '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedRecepcionPago = null;
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
  setRecepcionesPago,
  setClientes,
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
} = recepcionPagoStore.actions;

// Selectores
export const selectRecepcionesPago = (state) => state.recepcionPagoStore.recepcionesPago;
export const selectLoading = (state) => state.recepcionPagoStore.loading;
export const selectError = (state) => state.recepcionPagoStore.error;
export const selectClientes = (state) => state.recepcionPagoStore.clientes;
export const selectTarjetas = (state) => state.recepcionPagoStore.tarjetas;
export const selectPagination = (state) => state.recepcionPagoStore.pagination;
export const selectPage = (state) => state.recepcionPagoStore.pagination.page;
export const selectPageSize = (state) => state.recepcionPagoStore.pagination.pageSize;
export const selectTotalRows = (state) => state.recepcionPagoStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.recepcionPagoStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.recepcionPagoStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.recepcionPagoStore.pagination.previous !== null;
export const selectSortField = (state) => state.recepcionPagoStore.sortField;
export const selectSortOrder = (state) => state.recepcionPagoStore.sortOrder;
export const selectFilters = (state) => state.recepcionPagoStore.filters;
export const selectAppliedFilters = (state) => state.recepcionPagoStore.appliedFilters;
export const selectOpenModal = (state) => state.recepcionPagoStore.openModal;
export const selectSelectedRecepcionPago = (state) => state.recepcionPagoStore.selectedRecepcionPago;
export const selectForm = (state) => state.recepcionPagoStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.recepcionPagoStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredRecepcionesPago = (state) => {
  const { recepcionesPago, appliedFilters } = state.recepcionPagoStore;
  const { search, cliente, tarjeta } = appliedFilters;

  if (!search && !cliente && !tarjeta) {
    return recepcionesPago;
  }

  return recepcionesPago.filter((recepcion) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(recepcion.cliente?.nombre || '').toLowerCase().includes(searchLower) &&
        !(recepcion.tarjeta?.numero || '').toLowerCase().includes(searchLower) &&
        !(recepcion.tarjeta?.titular || '').toLowerCase().includes(searchLower) &&
        !(recepcion.observacion || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (cliente && recepcion.cliente?.id !== parseInt(cliente)) {
      return false;
    }

    if (tarjeta && recepcion.tarjeta?.id !== parseInt(tarjeta)) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedRecepcionesPago = (state) => {
  const filteredRecepcionesPago = selectFilteredRecepcionesPago(state);
  const { sortField, sortOrder } = state.recepcionPagoStore;

  if (!sortField) return filteredRecepcionesPago;

  return [...filteredRecepcionesPago].sort((a, b) => {
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
export const selectPaginatedRecepcionesPago = (state) => {
  return selectSortedRecepcionesPago(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.recepcionPagoStore.pagination.count;
};

export default recepcionPagoStore.reducer;
