import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

// Re-export para conveniencia del frontend (mismos catalogos que el modulo padre Plan de cuentas)
export {
  TIPO_CUENTA_OPTIONS,
  TIPO_CUENTA_LABELS,
  TIPO_CUENTA_COLORS,
} from '../planDeCuotasStore/planDeCuotasStore';

const initialState = {
  // Lista de sub-cuentas
  subCuentas: [],
  loading: false,
  error: null,

  // Cuentas del PUC para el select (datos auxiliares)
  cuentas: [],
  loadingCuentas: false,

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
    cuenta: '',
    tipo: '',
  },
  appliedFilters: {
    search: '',
    cuenta: '',
    tipo: '',
  },

  // Modal
  openModal: false,
  selectedSubCuenta: null,

  // Formulario
  form: {
    id: null,
    codigo: '',
    cuenta: '',
    nombre_sub_cuenta: '',
    debito: '0',
    credito: '0',
    acumulado: '0',
  },
};

export const subCuentasStore = createSlice({
  name: 'subCuentasStore',
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

    // Lista de sub-cuentas
    setSubCuentas: (state, action) => {
      state.subCuentas = action.payload;
      state.loading = false;
    },

    // Cuentas auxiliares (Plan de cuentas)
    setLoadingCuentas: (state, action) => {
      state.loadingCuentas = action.payload;
    },
    setCuentas: (state, action) => {
      state.cuentas = action.payload;
      state.loadingCuentas = false;
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
      state.filters = { search: '', cuenta: '', tipo: '' };
      state.appliedFilters = { search: '', cuenta: '', tipo: '' };
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
      state.selectedSubCuenta = null;
      state.form = {
        id: null,
        codigo: '',
        cuenta: '',
        nombre_sub_cuenta: '',
        debito: '0',
        credito: '0',
        acumulado: '0',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedSubCuenta = action.payload;
      state.form = {
        id: action.payload.id,
        codigo: action.payload.codigo || '',
        cuenta: action.payload.cuenta || '',
        nombre_sub_cuenta: action.payload.nombre_sub_cuenta || '',
        debito: action.payload.debito ?? '0',
        credito: action.payload.credito ?? '0',
        acumulado: action.payload.acumulado ?? '0',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedSubCuenta = null;
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
  setSubCuentas,
  setLoadingCuentas,
  setCuentas,
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
} = subCuentasStore.actions;

// Selectores
export const selectSubCuentas = (state) => state.subCuentasStore.subCuentas;
export const selectLoading = (state) => state.subCuentasStore.loading;
export const selectError = (state) => state.subCuentasStore.error;
export const selectCuentas = (state) => state.subCuentasStore.cuentas;
export const selectLoadingCuentas = (state) => state.subCuentasStore.loadingCuentas;
export const selectPagination = (state) => state.subCuentasStore.pagination;
export const selectPage = (state) => state.subCuentasStore.pagination.page;
export const selectPageSize = (state) => state.subCuentasStore.pagination.pageSize;
export const selectTotalRows = (state) => state.subCuentasStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.subCuentasStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.subCuentasStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.subCuentasStore.pagination.previous !== null;
export const selectSortField = (state) => state.subCuentasStore.sortField;
export const selectSortOrder = (state) => state.subCuentasStore.sortOrder;
export const selectFilters = (state) => state.subCuentasStore.filters;
export const selectAppliedFilters = (state) => state.subCuentasStore.appliedFilters;
export const selectOpenModal = (state) => state.subCuentasStore.openModal;
export const selectSelectedSubCuenta = (state) => state.subCuentasStore.selectedSubCuenta;
export const selectForm = (state) => state.subCuentasStore.form;

// Filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.subCuentasStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Filtrado local (complemento al servidor)
export const selectFilteredSubCuentas = (state) => {
  const { subCuentas, appliedFilters } = state.subCuentasStore;
  const { search, cuenta, tipo } = appliedFilters;

  if (!search && !cuenta && !tipo) {
    return subCuentas;
  }

  return subCuentas.filter((sub) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(sub.codigo || '').toLowerCase().includes(searchLower) &&
        !(sub.nombre_sub_cuenta || '').toLowerCase().includes(searchLower) &&
        !(sub.cuenta_codigo_puc || '').toLowerCase().includes(searchLower) &&
        !(sub.cuenta_nombre || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (cuenta && String(sub.cuenta) !== String(cuenta)) {
      return false;
    }
    if (tipo && sub.cuenta_tipo !== tipo) {
      return false;
    }
    return true;
  });
};

// Ordenado local
export const selectSortedSubCuentas = (state) => {
  const filtered = selectFilteredSubCuentas(state);
  const { sortField, sortOrder } = state.subCuentasStore;

  if (!sortField) return filtered;

  return [...filtered].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // debito/credito/acumulado vienen como string desde la API -> parsear a numero
    if (['debito', 'credito', 'acumulado'].includes(sortField)) {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

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

export const selectPaginatedSubCuentas = (state) => selectSortedSubCuentas(state);
export const selectFilteredTotalRows = (state) => state.subCuentasStore.pagination.count;

export default subCuentasStore.reducer;
