import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const emptyFilters = {
  search: '',
  cliente: '',
  etiqueta: '',
  tramite_origen: '',
  tipo_tramite: '',
  grupo_soat: '',
  tarifa_codigo: '',
  tramite_estado: '',
  confirmacion_estado: '',
  cargar_pdf_estado: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const emptyForm = {
  id: null,
  tramite_origen: '',
  cliente: '',
  etiqueta: '',
  precio_cliente: '',
  tarifario_soat: '',

  tipo_tramite: 'SOAT',
  tipo_vehiculo: '',

  grupo_soat: '',
  grupo_clase_runt: '',
  grupo_subcriterio: '',
  modulo_pregunta1: '',
  modulo_pregunta2: '',
  tarifa_codigo: '',
  tarifa_manual: false,

  precio_lay: '',
  comision: '',

  placa: '',
  clase: '',
  tipo_servicio: '',
  marca: '',
  linea: '',
  modelo: '',
  color: '',
  cilindraje: '',
  pasajeros_sentados: '',
  capacidad_carga: '',
  peso_bruto: '',
  chasis: '',
  vin: '',

  tipo_documento: 'CC',
  numero_documento: '',
  nombre_completo: '',
  telefono: '',
  correo: '',
  direccion: '',

  tramite_estado: '1',
  confirmacion_estado: '0',
  cargar_pdf_estado: '0',
};

const initialState = {
  // Lista de registros de pasarela
  pasarelas: [],
  history_data: [],
  historyPagination: {
    count: 0,
    page: 1,
    pageSize: 10,
  },
  openHistoryModal: false,
  selectedHistoryPasarela: null,
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
  filters: { ...emptyFilters },
  appliedFilters: { ...emptyFilters },

  // Modal
  openModal: false,
  selectedPasarela: null,

  // Formulario
  form: { ...emptyForm },

  // Datos auxiliares para selects
  clientes: [],
  etiquetas: [],
  tarifarios: [],
};

export const pasarelaDePagoStore = createSlice({
  name: 'pasarelaDePagoStore',
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

    // Lista de pasarelas
    setPasarelas: (state, action) => {
      state.pasarelas = action.payload;
      state.loading = false;
    },

    /**
     * Elimina una pasarela del listado en el cliente (sin tocar el backend).
     * Lo dispara el hook de tiempo real cuando otro usuario la borra/devuelve.
     */
    removePasarelaById: (state, action) => {
      const id = action.payload;
      const before = state.pasarelas.length;
      state.pasarelas = state.pasarelas.filter((p) => p.id !== id);
      if (state.pasarelas.length < before && state.pagination.count > 0) {
        state.pagination.count -= 1;
      }
    },

    /**
     * Inserta una pasarela al inicio del listado SIN tocar `loading` ni
     * borrar el resto. Usado por el hook de tiempo real cuando otro usuario
     * crea/restaura un registro: aparece directo, sin spinner.
     * Si ya existe (por id), no duplica.
     */
    prependPasarela: (state, action) => {
      const item = action.payload;
      if (!item || item.id == null) return;
      if (state.pasarelas.some((p) => p.id === item.id)) return;
      state.pasarelas = [item, ...state.pasarelas];
      state.pagination.count = (state.pagination.count || 0) + 1;
    },

    // Datos auxiliares
    setClientes: (state, action) => {
      state.clientes = action.payload;
    },
    setEtiquetas: (state, action) => {
      state.etiquetas = action.payload;
    },
    setTarifarios: (state, action) => {
      state.tarifarios = action.payload;
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
      state.selectedPasarela = null;
      state.form = { ...emptyForm };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedPasarela = action.payload;
      const p = action.payload;
      state.form = {
        id: p.id,
        tramite_origen: p.tramite_origen || '',
        cliente: p.cliente?.id || '',
        etiqueta: p.etiqueta?.id || '',
        precio_cliente: p.precio_cliente?.id || '',
        tarifario_soat: p.tarifario_soat?.id || '',

        tipo_tramite: p.tipo_tramite || 'SOAT',
        tipo_vehiculo: p.tipo_vehiculo || '',

        grupo_soat: p.grupo_soat || '',
        grupo_clase_runt: p.grupo_clase_runt || '',
        grupo_subcriterio: p.grupo_subcriterio || '',
        modulo_pregunta1: p.modulo_pregunta1 || '',
        modulo_pregunta2: p.modulo_pregunta2 || '',
        tarifa_codigo: p.tarifa_codigo || '',
        tarifa_manual: !!p.tarifa_manual,

        precio_lay: p.precio_lay || '',
        comision: p.comision || '',

        placa: p.placa || '',
        clase: p.clase || '',
        tipo_servicio: p.tipo_servicio || '',
        marca: p.marca || '',
        linea: p.linea || '',
        modelo: p.modelo || '',
        color: p.color || '',
        cilindraje: p.cilindraje || '',
        pasajeros_sentados: p.pasajeros_sentados || '',
        capacidad_carga: p.capacidad_carga || '',
        peso_bruto: p.peso_bruto || '',
        chasis: p.chasis || '',
        vin: p.vin || '',

        tipo_documento: p.tipo_documento || 'CC',
        numero_documento: p.numero_documento || '',
        nombre_completo: p.nombre_completo || '',
        telefono: p.telefono || '',
        correo: p.correo || '',
        direccion: p.direccion || '',

        tramite_estado: p.tramite_estado || '1',
        confirmacion_estado: p.confirmacion_estado || '0',
        cargar_pdf_estado: p.cargar_pdf_estado || '0',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedPasarela = null;
      state.form = { ...emptyForm };
    },

    // History
    setHistory: (state, action) => {
      const { history_data, count, page, pageSize } = action.payload;
      state.history_data = history_data;
      if (count !== undefined) state.historyPagination.count = count;
      if (page !== undefined) state.historyPagination.page = page;
      if (pageSize !== undefined) state.historyPagination.pageSize = pageSize;
    },
    openHistoryDialog: (state, action) => {
      state.openHistoryModal = true;
      state.selectedHistoryPasarela = action.payload;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    closeHistoryDialog: (state) => {
      state.openHistoryModal = false;
      state.selectedHistoryPasarela = null;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    setHistoryPage: (state, action) => {
      state.historyPagination.page = action.payload;
    },
    setHistoryPageSize: (state, action) => {
      state.historyPagination.pageSize = action.payload;
      state.historyPagination.page = 1;
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
  setPasarelas,
  removePasarelaById,
  prependPasarela,
  setClientes,
  setEtiquetas,
  setTarifarios,
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
  setHistory,
  openHistoryDialog,
  closeHistoryDialog,
  setHistoryPage,
  setHistoryPageSize,
} = pasarelaDePagoStore.actions;

// Selectores
export const selectPasarelas = (state) => state.pasarelaDePagoStore.pasarelas;
export const selectLoading = (state) => state.pasarelaDePagoStore.loading;
export const selectError = (state) => state.pasarelaDePagoStore.error;
export const selectClientes = (state) => state.pasarelaDePagoStore.clientes;
export const selectEtiquetas = (state) => state.pasarelaDePagoStore.etiquetas;
export const selectTarifarios = (state) => state.pasarelaDePagoStore.tarifarios;
export const selectPagination = (state) => state.pasarelaDePagoStore.pagination;
export const selectPage = (state) => state.pasarelaDePagoStore.pagination.page;
export const selectPageSize = (state) => state.pasarelaDePagoStore.pagination.pageSize;
export const selectTotalRows = (state) => state.pasarelaDePagoStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.pasarelaDePagoStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.pasarelaDePagoStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.pasarelaDePagoStore.pagination.previous !== null;
export const selectSortField = (state) => state.pasarelaDePagoStore.sortField;
export const selectSortOrder = (state) => state.pasarelaDePagoStore.sortOrder;
export const selectFilters = (state) => state.pasarelaDePagoStore.filters;
export const selectAppliedFilters = (state) => state.pasarelaDePagoStore.appliedFilters;
export const selectOpenModal = (state) => state.pasarelaDePagoStore.openModal;
export const selectSelectedPasarela = (state) => state.pasarelaDePagoStore.selectedPasarela;
export const selectForm = (state) => state.pasarelaDePagoStore.form;

// Filtros activos (chips)
export const selectActiveFilters = (state) => {
  const filters = state.pasarelaDePagoStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Filtrado local
export const selectFilteredPasarelas = (state) => {
  const { pasarelas, appliedFilters } = state.pasarelaDePagoStore;
  const { search } = appliedFilters;

  if (!search) {
    return pasarelas;
  }

  return pasarelas.filter((p) => {
    const searchLower = search.toLowerCase();
    if (
      !(p.placa || '').toLowerCase().includes(searchLower) &&
      !(p.nombre_completo || '').toLowerCase().includes(searchLower) &&
      !(p.numero_documento || '').toLowerCase().includes(searchLower) &&
      !(p.chasis || '').toLowerCase().includes(searchLower) &&
      !(p.vin || '').toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });
};

// Datos ordenados localmente
export const selectSortedPasarelas = (state) => {
  const filtered = selectFilteredPasarelas(state);
  const { sortField, sortOrder } = state.pasarelaDePagoStore;

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

// Paginación del servidor: el selector de paginados sólo aplica el ordenamiento local
export const selectPaginatedPasarelas = (state) => {
  return selectSortedPasarelas(state);
};

export const selectFilteredTotalRows = (state) => {
  return state.pasarelaDePagoStore.pagination.count;
};

// History selectors
export const selectHistoryData = (state) => state.pasarelaDePagoStore.history_data;
export const selectHistoryPagination = (state) => state.pasarelaDePagoStore.historyPagination;
export const selectOpenHistoryModal = (state) => state.pasarelaDePagoStore.openHistoryModal;
export const selectSelectedHistoryPasarela = (state) => state.pasarelaDePagoStore.selectedHistoryPasarela;

export default pasarelaDePagoStore.reducer;
