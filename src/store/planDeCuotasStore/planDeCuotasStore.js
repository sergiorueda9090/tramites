import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

// Catalogos (mismos valores que el backend: plan_de_cuentas.models.TipoCuenta y AcumuladoTipo)
export const TIPO_CUENTA_OPTIONS = [
  { value: 'activo',     label: 'Activo' },
  { value: 'pasivo',     label: 'Pasivo' },
  { value: 'patrimonio', label: 'Patrimonio' },
  { value: 'ingreso',    label: 'Ingreso' },
  { value: 'gasto',      label: 'Gasto' },
];

export const ACUMULADO_OPTIONS = [
  { value: 'debito_credito', label: 'Débito (-) Crédito' },
  { value: 'credito_debito', label: 'Crédito (-) Débito' },
];

// Naturaleza acumulada tipica por tipo de cuenta (Activo y Gasto: Debito-Credito; resto: Credito-Debito).
// Se usa como sugerencia al cambiar el tipo en el formulario; el usuario puede sobreescribir.
export const ACUMULADO_POR_TIPO = {
  activo:     'debito_credito',
  pasivo:     'credito_debito',
  patrimonio: 'credito_debito',
  ingreso:    'credito_debito',
  gasto:      'debito_credito',
};

// Mapas para mostrar etiquetas y colores en chips (DataTable y filtros)
export const TIPO_CUENTA_LABELS = TIPO_CUENTA_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

export const ACUMULADO_LABELS = ACUMULADO_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

export const TIPO_CUENTA_COLORS = {
  activo:     'primary',
  pasivo:     'error',
  patrimonio: 'secondary',
  ingreso:    'success',
  gasto:      'warning',
};

const initialState = {
  // Lista de cuentas del PUC
  cuentas: [],
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
    tipo: '',
    acumulado: '',
  },
  appliedFilters: {
    search: '',
    tipo: '',
    acumulado: '',
  },

  // Modal
  openModal: false,
  selectedCuenta: null,

  // Formulario
  form: {
    id: null,
    tipo: '',
    codigo_puc: '',
    nombre_cuenta: '',
    acumulado: '',
  },
};

export const planDeCuotasStore = createSlice({
  name: 'planDeCuotasStore',
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

    // Lista de cuentas
    setCuentas: (state, action) => {
      state.cuentas = action.payload;
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
      state.filters = { search: '', tipo: '', acumulado: '' };
      state.appliedFilters = { search: '', tipo: '', acumulado: '' };
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
      state.selectedCuenta = null;
      state.form = {
        id: null,
        tipo: '',
        codigo_puc: '',
        nombre_cuenta: '',
        acumulado: '',
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedCuenta = action.payload;
      state.form = {
        id: action.payload.id,
        tipo: action.payload.tipo || '',
        codigo_puc: action.payload.codigo_puc || '',
        nombre_cuenta: action.payload.nombre_cuenta || '',
        acumulado: action.payload.acumulado || '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedCuenta = null;
      state.form = initialState.form;
    },

    // Formulario
    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
      // 'acumulado' se deriva siempre del 'tipo' (regla contable: Activo/Gasto
      // acumulan debito-credito; Pasivo/Patrimonio/Ingreso acumulan credito-debito).
      // El backend tambien lo enforce en save(), aqui lo mostramos al usuario.
      if (field === 'tipo') {
        state.form.acumulado = ACUMULADO_POR_TIPO[value] || '';
      }
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
} = planDeCuotasStore.actions;

// Selectores
export const selectCuentas = (state) => state.planDeCuotasStore.cuentas;
export const selectLoading = (state) => state.planDeCuotasStore.loading;
export const selectError = (state) => state.planDeCuotasStore.error;
export const selectPagination = (state) => state.planDeCuotasStore.pagination;
export const selectPage = (state) => state.planDeCuotasStore.pagination.page;
export const selectPageSize = (state) => state.planDeCuotasStore.pagination.pageSize;
export const selectTotalRows = (state) => state.planDeCuotasStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.planDeCuotasStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.planDeCuotasStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.planDeCuotasStore.pagination.previous !== null;
export const selectSortField = (state) => state.planDeCuotasStore.sortField;
export const selectSortOrder = (state) => state.planDeCuotasStore.sortOrder;
export const selectFilters = (state) => state.planDeCuotasStore.filters;
export const selectAppliedFilters = (state) => state.planDeCuotasStore.appliedFilters;
export const selectOpenModal = (state) => state.planDeCuotasStore.openModal;
export const selectSelectedCuenta = (state) => state.planDeCuotasStore.selectedCuenta;
export const selectForm = (state) => state.planDeCuotasStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.planDeCuotasStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual, complementa al servidor)
export const selectFilteredCuentas = (state) => {
  const { cuentas, appliedFilters } = state.planDeCuotasStore;
  const { search, tipo, acumulado } = appliedFilters;

  if (!search && !tipo && !acumulado) {
    return cuentas;
  }

  return cuentas.filter((cuenta) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(cuenta.codigo_puc || '').toLowerCase().includes(searchLower) &&
        !(cuenta.nombre_cuenta || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (tipo && cuenta.tipo !== tipo) {
      return false;
    }
    if (acumulado && cuenta.acumulado !== acumulado) {
      return false;
    }
    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedCuentas = (state) => {
  const filtered = selectFilteredCuentas(state);
  const { sortField, sortOrder } = state.planDeCuotasStore;

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
    } else if (typeof aValue === 'boolean') {
      comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Selector para datos paginados (la paginación es del servidor)
export const selectPaginatedCuentas = (state) => selectSortedCuentas(state);

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => state.planDeCuotasStore.pagination.count;

export default planDeCuotasStore.reducer;
