import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de proveedores
  proveedores: [],
  loading: false,
  error: null,

  // Datos auxiliares para selects
  subCuentas: [],
  loadingSubCuentas: false,

  // Paginación (formato DRF)
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
    sub_cuenta: '',
  },
  appliedFilters: {
    search: '',
    sub_cuenta: '',
  },

  // Modal
  openModal: false,
  selectedProveedor: null,

  // Formulario
  form: {
    id: null,
    nombre: '',
    color: '#1976d2',
    sub_cuenta: '',
  },
};

export const proveedoresStore = createSlice({
  name: 'proveedoresStore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setProveedores: (state, action) => {
      state.proveedores = action.payload;
      state.loading = false;
    },

    // Auxiliares
    setLoadingSubCuentas: (state, action) => {
      state.loadingSubCuentas = action.payload;
    },
    setSubCuentas: (state, action) => {
      state.subCuentas = action.payload;
      state.loadingSubCuentas = false;
    },

    // Paginación
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
      state.filters = { search: '', sub_cuenta: '' };
      state.appliedFilters = { search: '', sub_cuenta: '' };
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
      state.selectedProveedor = null;
      state.form = {
        id: null,
        nombre: '',
        color: '#1976d2',
        sub_cuenta: '',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedProveedor = action.payload;
      state.form = {
        id: action.payload.id,
        nombre: action.payload.nombre || '',
        color: action.payload.color || '#1976d2',
        sub_cuenta: action.payload.sub_cuenta || '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedProveedor = null;
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

    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setProveedores,
  setLoadingSubCuentas,
  setSubCuentas,
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
} = proveedoresStore.actions;

// Selectores
export const selectProveedores = (state) => state.proveedoresStore.proveedores;
export const selectLoading = (state) => state.proveedoresStore.loading;
export const selectError = (state) => state.proveedoresStore.error;
export const selectSubCuentas = (state) => state.proveedoresStore.subCuentas;
export const selectPagination = (state) => state.proveedoresStore.pagination;
export const selectPage = (state) => state.proveedoresStore.pagination.page;
export const selectPageSize = (state) => state.proveedoresStore.pagination.pageSize;
export const selectTotalRows = (state) => state.proveedoresStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.proveedoresStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectSortField = (state) => state.proveedoresStore.sortField;
export const selectSortOrder = (state) => state.proveedoresStore.sortOrder;
export const selectFilters = (state) => state.proveedoresStore.filters;
export const selectAppliedFilters = (state) => state.proveedoresStore.appliedFilters;
export const selectOpenModal = (state) => state.proveedoresStore.openModal;
export const selectSelectedProveedor = (state) => state.proveedoresStore.selectedProveedor;
export const selectForm = (state) => state.proveedoresStore.form;

// Filtros activos (para chips)
export const selectActiveFilters = (state) => {
  const filters = state.proveedoresStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Filtrado local sobre la página actual (complemento al filtrado del servidor)
export const selectFilteredProveedores = (state) => {
  const { proveedores, appliedFilters } = state.proveedoresStore;
  const { search, sub_cuenta } = appliedFilters;

  if (!search && !sub_cuenta) {
    return proveedores;
  }

  return proveedores.filter((p) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !(p.nombre || '').toLowerCase().includes(s) &&
        !(p.sub_cuenta_codigo || '').toLowerCase().includes(s) &&
        !(p.sub_cuenta_nombre || '').toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    if (sub_cuenta && String(p.sub_cuenta) !== String(sub_cuenta)) return false;
    return true;
  });
};

export const selectSortedProveedores = (state) => {
  const filtered = selectFilteredProveedores(state);
  const { sortField, sortOrder } = state.proveedoresStore;

  if (!sortField) return filtered;

  return [...filtered].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number') {
      comparison = aValue - bValue;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const selectPaginatedProveedores = (state) => selectSortedProveedores(state);
export const selectFilteredTotalRows = (state) => state.proveedoresStore.pagination.count;

export default proveedoresStore.reducer;
