import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de registros de vehículos
  registros: [],
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
    tipo_tramite: '',
    tipo_vehiculo: '',
    tipo_documento: '',
    es_propietario: '',
    fecha_desde: '',
    fecha_hasta: '',
  },
  appliedFilters: {
    search: '',
    tipo_tramite: '',
    tipo_vehiculo: '',
    tipo_documento: '',
    es_propietario: '',
    fecha_desde: '',
    fecha_hasta: '',
  },

  // Modal
  openModal: false,
  selectedRegistro: null,

  // Formulario
  form: {
    id: null,
    cliente: '',
    tipo_tramite: 'SOAT',
    tipo_vehiculo: 'USADO',
    es_propietario: true,
    tipo_documento: 'C',
    numero_documento: '',
    nombre_completo: '',
    telefono: '',
    placa: '',
    clase: '',
    clasificacion: '',
    tipo_servicio: '',
    tipo_carroceria: '',
    vin: '',
    num_motor: '',
    num_chasis: '',
    marca: '',
    linea: '',
    modelo: '',
    cilindraje: '',
    color: '',
    organismo_transito: '',
    precio_lay: '',
    comision: '',
  },

  // Datos auxiliares para selects
  clientes: [],
};

const emptyFilters = {
  search: '',
  tipo_tramite: '',
  tipo_vehiculo: '',
  tipo_documento: '',
  es_propietario: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const emptyForm = {
  id: null,
  cliente: '',
  tipo_tramite: 'SOAT',
  tipo_vehiculo: 'USADO',
  es_propietario: true,
  tipo_documento: 'C',
  numero_documento: '',
  nombre_completo: '',
  telefono: '',
  placa: '',
  clase: '',
  clasificacion: '',
  tipo_servicio: '',
  tipo_carroceria: '',
  vin: '',
  num_motor: '',
  num_chasis: '',
  marca: '',
  linea: '',
  modelo: '',
  cilindraje: '',
  color: '',
  organismo_transito: '',
  precio_lay: '',
  comision: '',
};

export const baseDeDatosStore = createSlice({
  name: 'baseDeDatosStore',
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

    // Lista de registros
    setRegistros: (state, action) => {
      state.registros = action.payload;
      state.loading = false;
    },

    // Datos auxiliares
    setClientes: (state, action) => {
      state.clientes = action.payload;
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
      state.filters = { ...emptyFilters };
      state.appliedFilters = { ...emptyFilters };
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
      state.selectedRegistro = null;
      state.form = { ...emptyForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedRegistro = action.payload;
      const r = action.payload;
      state.form = {
        id: r.id,
        cliente: r.cliente?.id || '',
        tipo_tramite: r.tipo_tramite || 'SOAT',
        tipo_vehiculo: r.tipo_vehiculo || 'USADO',
        es_propietario: r.es_propietario ?? true,
        tipo_documento: r.tipo_documento || 'C',
        numero_documento: r.numero_documento || '',
        nombre_completo: r.nombre_completo || '',
        telefono: r.telefono || '',
        placa: r.placa || '',
        clase: r.clase || '',
        clasificacion: r.clasificacion || '',
        tipo_servicio: r.tipo_servicio || '',
        tipo_carroceria: r.tipo_carroceria || '',
        vin: r.vin || '',
        num_motor: r.num_motor || '',
        num_chasis: r.num_chasis || '',
        marca: r.marca || '',
        linea: r.linea || '',
        modelo: r.modelo || '',
        cilindraje: r.cilindraje || '',
        color: r.color || '',
        organismo_transito: r.organismo_transito || '',
        precio_lay: r.precio_lay ?? '',
        comision: r.comision ?? '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedRegistro = null;
      state.form = { ...emptyForm };
    },

    // Formulario
    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => {
      state.form = { ...emptyForm };
    },

    // Reset
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setRegistros,
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
  resetStore,
} = baseDeDatosStore.actions;

// Selectores
export const selectRegistros = (state) => state.baseDeDatosStore.registros;
export const selectLoading = (state) => state.baseDeDatosStore.loading;
export const selectError = (state) => state.baseDeDatosStore.error;
export const selectClientes = (state) => state.baseDeDatosStore.clientes;
export const selectPagination = (state) => state.baseDeDatosStore.pagination;
export const selectPage = (state) => state.baseDeDatosStore.pagination.page;
export const selectPageSize = (state) => state.baseDeDatosStore.pagination.pageSize;
export const selectTotalRows = (state) => state.baseDeDatosStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.baseDeDatosStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.baseDeDatosStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.baseDeDatosStore.pagination.previous !== null;
export const selectSortField = (state) => state.baseDeDatosStore.sortField;
export const selectSortOrder = (state) => state.baseDeDatosStore.sortOrder;
export const selectFilters = (state) => state.baseDeDatosStore.filters;
export const selectAppliedFilters = (state) => state.baseDeDatosStore.appliedFilters;
export const selectOpenModal = (state) => state.baseDeDatosStore.openModal;
export const selectSelectedRegistro = (state) => state.baseDeDatosStore.selectedRegistro;
export const selectForm = (state) => state.baseDeDatosStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.baseDeDatosStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredRegistros = (state) => {
  const { registros, appliedFilters } = state.baseDeDatosStore;
  const { search, tipo_tramite, tipo_vehiculo } = appliedFilters;

  if (!search && !tipo_tramite && !tipo_vehiculo) {
    return registros;
  }

  return registros.filter((registro) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !(registro.placa || '').toLowerCase().includes(searchLower) &&
        !(registro.nombre_completo || '').toLowerCase().includes(searchLower) &&
        !(registro.numero_documento || '').toLowerCase().includes(searchLower) &&
        !(registro.marca || '').toLowerCase().includes(searchLower) &&
        !(registro.linea || '').toLowerCase().includes(searchLower) &&
        !(registro.vin || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (tipo_tramite && registro.tipo_tramite !== tipo_tramite) {
      return false;
    }

    if (tipo_vehiculo && registro.tipo_vehiculo !== tipo_vehiculo) {
      return false;
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedRegistros = (state) => {
  const filteredRegistros = selectFilteredRegistros(state);
  const { sortField, sortOrder } = state.baseDeDatosStore;

  if (!sortField) return filteredRegistros;

  return [...filteredRegistros].sort((a, b) => {
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
export const selectPaginatedRegistros = (state) => {
  return selectSortedRegistros(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.baseDeDatosStore.pagination.count;
};

export default baseDeDatosStore.reducer;
