import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de cargos no registrados
  cargosNoRegistrados: [],
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
  selectedCargoNoRegistrado: null,

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

export const cargosNoRegistradosStore = createSlice({
  name: 'cargosNoRegistradosStore',
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

    // Lista de cargos no registrados
    setCargosNoRegistrados: (state, action) => {
      state.cargosNoRegistrados = action.payload;
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
      state.selectedCargoNoRegistrado = null;
      state.form = {
        id: null,
        cliente: '',
        tarjeta: '',
        valor: '',
        observacion: '',
        fecha: new Date().toISOString().slice(0, 16),
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedCargoNoRegistrado = action.payload;
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
      state.selectedCargoNoRegistrado = null;
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
  setCargosNoRegistrados,
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
} = cargosNoRegistradosStore.actions;

// Selectores
export const selectCargosNoRegistrados = (state) => state.cargosNoRegistradosStore.cargosNoRegistrados;
export const selectLoading = (state) => state.cargosNoRegistradosStore.loading;
export const selectError = (state) => state.cargosNoRegistradosStore.error;
export const selectClientes = (state) => state.cargosNoRegistradosStore.clientes;
export const selectTarjetas = (state) => state.cargosNoRegistradosStore.tarjetas;
export const selectPagination = (state) => state.cargosNoRegistradosStore.pagination;
export const selectPage = (state) => state.cargosNoRegistradosStore.pagination.page;
export const selectPageSize = (state) => state.cargosNoRegistradosStore.pagination.pageSize;
export const selectTotalRows = (state) => state.cargosNoRegistradosStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.cargosNoRegistradosStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.cargosNoRegistradosStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.cargosNoRegistradosStore.pagination.previous !== null;
export const selectSortField = (state) => state.cargosNoRegistradosStore.sortField;
export const selectSortOrder = (state) => state.cargosNoRegistradosStore.sortOrder;
export const selectFilters = (state) => state.cargosNoRegistradosStore.filters;
export const selectAppliedFilters = (state) => state.cargosNoRegistradosStore.appliedFilters;
export const selectOpenModal = (state) => state.cargosNoRegistradosStore.openModal;
export const selectSelectedCargoNoRegistrado = (state) => state.cargosNoRegistradosStore.selectedCargoNoRegistrado;
export const selectForm = (state) => state.cargosNoRegistradosStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.cargosNoRegistradosStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredCargosNoRegistrados = (state) => {
  const { cargosNoRegistrados, appliedFilters } = state.cargosNoRegistradosStore;
  const { search, cliente, tarjeta } = appliedFilters;

  if (!search && !cliente && !tarjeta) {
    return cargosNoRegistrados;
  }

  return cargosNoRegistrados.filter((cargo) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(cargo.cliente?.nombre || '').toLowerCase().includes(searchLower) &&
        !(cargo.tarjeta?.numero || '').toLowerCase().includes(searchLower) &&
        !(cargo.tarjeta?.titular || '').toLowerCase().includes(searchLower) &&
        !(cargo.observacion || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (cliente && cargo.cliente?.id !== parseInt(cliente)) {
      return false;
    }

    if (tarjeta && cargo.tarjeta?.id !== parseInt(tarjeta)) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedCargosNoRegistrados = (state) => {
  const filteredCargos = selectFilteredCargosNoRegistrados(state);
  const { sortField, sortOrder } = state.cargosNoRegistradosStore;

  if (!sortField) return filteredCargos;

  return [...filteredCargos].sort((a, b) => {
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
export const selectPaginatedCargosNoRegistrados = (state) => {
  return selectSortedCargosNoRegistrados(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.cargosNoRegistradosStore.pagination.count;
};

export default cargosNoRegistradosStore.reducer;
