import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const RANDOM_COLORS = [
  '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab',
  '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047',
  '#7cb342', '#c0ca33', '#fdd835', '#ffb300', '#fb8c00',
  '#f4511e', '#6d4c41', '#546e7a', '#1976d2', '#388e3c',
];

const getRandomColor = () => RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

const initialState = {
  // Lista de clientes
  clientes: [],
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
    tipo_cliente: '',
    medio_comunicacion: '',
    usuario: '',
  },
  appliedFilters: {
    search: '',
    tipo_cliente: '',
    medio_comunicacion: '',
    usuario: '',
  },

  // Modal
  openModal: false,
  selectedCliente: null,

  // Formulario
  form: {
    id: null,
    color: '',
    nombre: '',
    telefono: '',
    direccion: '',
    tipo_cliente: 'particular',
    medio_comunicacion: 'email',
    precios: [],
  },
};

export const clientesStore = createSlice({
  name: 'clientesStore',
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

    // Lista de clientes
    setClientes: (state, action) => {
      state.clientes = action.payload;
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
      state.filters = { search: '', tipo_cliente: '', medio_comunicacion: '', usuario: '' };
      state.appliedFilters = { search: '', tipo_cliente: '', medio_comunicacion: '', usuario: '' };
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
      state.selectedCliente = null;
      state.form = {
        id: null,
        color: getRandomColor(),
        nombre: '',
        telefono: '',
        direccion: '',
        tipo_cliente: 'particular',
        medio_comunicacion: 'email',
        precios: [],
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedCliente = action.payload;
      state.form = {
        id: action.payload.id,
        color: action.payload.color || getRandomColor(),
        nombre: action.payload.nombre || '',
        telefono: action.payload.telefono || '',
        direccion: action.payload.direccion || '',
        tipo_cliente: action.payload.tipo_cliente || 'particular',
        medio_comunicacion: action.payload.medio_comunicacion || 'email',
        precios: action.payload.precios || [],
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedCliente = null;
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

    // Precios en el formulario
    addPrecio: (state, action) => {
      state.form.precios.push(action.payload);
    },
    updatePrecio: (state, action) => {
      const { index, data } = action.payload;
      if (state.form.precios[index]) {
        state.form.precios[index] = { ...state.form.precios[index], ...data };
      }
    },
    removePrecio: (state, action) => {
      const index = action.payload;
      state.form.precios.splice(index, 1);
    },

    // Reset
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
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
  addPrecio,
  updatePrecio,
  removePrecio,
  resetStore,
} = clientesStore.actions;

// Selectores
export const selectClientes = (state) => state.clientesStore.clientes;
export const selectLoading = (state) => state.clientesStore.loading;
export const selectError = (state) => state.clientesStore.error;
export const selectPagination = (state) => state.clientesStore.pagination;
export const selectPage = (state) => state.clientesStore.pagination.page;
export const selectPageSize = (state) => state.clientesStore.pagination.pageSize;
export const selectTotalRows = (state) => state.clientesStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.clientesStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.clientesStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.clientesStore.pagination.previous !== null;
export const selectSortField = (state) => state.clientesStore.sortField;
export const selectSortOrder = (state) => state.clientesStore.sortOrder;
export const selectFilters = (state) => state.clientesStore.filters;
export const selectAppliedFilters = (state) => state.clientesStore.appliedFilters;
export const selectOpenModal = (state) => state.clientesStore.openModal;
export const selectSelectedCliente = (state) => state.clientesStore.selectedCliente;
export const selectForm = (state) => state.clientesStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.clientesStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredClientes = (state) => {
  const { clientes, appliedFilters } = state.clientesStore;
  const { search, tipo_cliente, medio_comunicacion, usuario } = appliedFilters;

  if (!search && !tipo_cliente && !medio_comunicacion && !usuario) {
    return clientes;
  }

  return clientes.filter((cliente) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(cliente.nombre || '').toLowerCase().includes(searchLower) &&
        !(cliente.telefono || '').toLowerCase().includes(searchLower) &&
        !(cliente.direccion || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (tipo_cliente && cliente.tipo_cliente !== tipo_cliente) {
      return false;
    }

    if (medio_comunicacion && cliente.medio_comunicacion !== medio_comunicacion) {
      return false;
    }

    if (usuario && cliente.usuario !== parseInt(usuario)) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedClientes = (state) => {
  const filteredClientes = selectFilteredClientes(state);
  const { sortField, sortOrder } = state.clientesStore;

  if (!sortField) return filteredClientes;

  return [...filteredClientes].sort((a, b) => {
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
export const selectPaginatedClientes = (state) => {
  return selectSortedClientes(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.clientesStore.pagination.count;
};

export default clientesStore.reducer;
