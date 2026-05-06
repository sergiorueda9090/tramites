import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const emptyFilters = {
  search: '',
  cliente: '',
  etiqueta: '',
  pasarela: '',
  tarjeta: '',
  tipo_tramite: '',
  grupo_soat: '',
  tarifa_codigo: '',
  fecha_desde: '',
  fecha_hasta: '',
  pago_confirmado_desde: '',
  pago_confirmado_hasta: '',
};

// Form mínimo para correcciones puntuales sobre un finalizado.
// El backend acepta solo un subconjunto editable (titular, observación,
// estados snapshot y datos del vehículo).
const emptyForm = {
  id: null,
  observacion: '',
  tarjeta: '',

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

  tramite_estado: '0',
  confirmacion_estado: '0',
  cargar_pdf_estado: '1',
};

const initialState = {
  finalizados: [],
  loading: false,
  error: null,

  pagination: {
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    next: null,
    previous: null,
  },

  sortField: null,
  sortOrder: 'asc',

  filters: { ...emptyFilters },
  appliedFilters: { ...emptyFilters },

  // Modal de edición
  openModal: false,
  selectedFinalizado: null,
  form: { ...emptyForm },

  // History
  history_data: [],
  historyPagination: { count: 0, page: 1, pageSize: 10 },
  openHistoryModal: false,
  selectedHistoryFinalizado: null,

  // Datos auxiliares para selects (compartidos con tamitesStore semánticamente)
  clientes: [],
  etiquetas: [],
  tarjetas: [],

  // Manager de PDFs (staging cliente-side)
  pdfsManager: {
    open: false,
    finalizado: null,           // referencia al finalizado activo
    loading: false,             // cargando lista existente
    saving: false,              // ejecutando commit
    existing: [],               // PDFs leídos del backend (incluye los marcados para borrar)
    pendingDelete: [],          // [id]
    pendingMetaUpdates: {},     // { [id]: { descripcion } }
    newFiles: [],               // [{ tempId, file, descripcion }]
  },
};

export const finalizadosTamitesStore = createSlice({
  name: 'finalizadosTamitesStore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setFinalizados: (state, action) => {
      state.finalizados = action.payload;
      state.loading = false;
    },

    // Datos auxiliares
    setClientes: (state, action) => { state.clientes = action.payload; },
    setEtiquetas: (state, action) => { state.etiquetas = action.payload; },
    setTarjetas: (state, action) => { state.tarjetas = action.payload; },

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
    setPage: (state, action) => { state.pagination.page = action.payload; },
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

    // Modal de edición
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedFinalizado = action.payload;
      const t = action.payload || {};
      state.form = {
        id: t.id || null,
        observacion: t.observacion || '',
        tarjeta: t.tarjeta?.id || '',

        placa: t.placa || '',
        clase: t.clase || '',
        tipo_servicio: t.tipo_servicio || '',
        marca: t.marca || '',
        linea: t.linea || '',
        modelo: t.modelo || '',
        color: t.color || '',
        cilindraje: t.cilindraje || '',
        pasajeros_sentados: t.pasajeros_sentados || '',
        capacidad_carga: t.capacidad_carga || '',
        peso_bruto: t.peso_bruto || '',
        chasis: t.chasis || '',
        vin: t.vin || '',

        tipo_documento: t.tipo_documento || 'CC',
        numero_documento: t.numero_documento || '',
        nombre_completo: t.nombre_completo || '',
        telefono: t.telefono || '',
        correo: t.correo || '',
        direccion: t.direccion || '',

        tramite_estado: t.tramite_estado || '0',
        confirmacion_estado: t.confirmacion_estado || '0',
        cargar_pdf_estado: t.cargar_pdf_estado || '1',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedFinalizado = null;
      state.form = { ...emptyForm };
    },
    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => { state.form = { ...emptyForm }; },

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
      state.selectedHistoryFinalizado = action.payload;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    closeHistoryDialog: (state) => {
      state.openHistoryModal = false;
      state.selectedHistoryFinalizado = null;
      state.history_data = [];
      state.historyPagination = { count: 0, page: 1, pageSize: 10 };
    },
    setHistoryPage: (state, action) => { state.historyPagination.page = action.payload; },
    setHistoryPageSize: (state, action) => {
      state.historyPagination.pageSize = action.payload;
      state.historyPagination.page = 1;
    },

    // ========== PDFs Manager ==========
    openPdfsManager: (state, action) => {
      state.pdfsManager = {
        open: true,
        finalizado: action.payload,
        loading: false,
        saving: false,
        existing: [],
        pendingDelete: [],
        pendingMetaUpdates: {},
        newFiles: [],
      };
    },
    closePdfsManager: (state) => {
      state.pdfsManager = {
        open: false,
        finalizado: null,
        loading: false,
        saving: false,
        existing: [],
        pendingDelete: [],
        pendingMetaUpdates: {},
        newFiles: [],
      };
    },
    setPdfsLoading: (state, action) => {
      state.pdfsManager.loading = action.payload;
    },
    setPdfsSaving: (state, action) => {
      state.pdfsManager.saving = action.payload;
    },
    setExistingPdfs: (state, action) => {
      state.pdfsManager.existing = action.payload || [];
      state.pdfsManager.loading = false;
    },
    markPdfForDelete: (state, action) => {
      const id = action.payload;
      if (!state.pdfsManager.pendingDelete.includes(id)) {
        state.pdfsManager.pendingDelete.push(id);
      }
      // Si tenía cambios de metadata pendientes, descartarlos
      delete state.pdfsManager.pendingMetaUpdates[id];
    },
    unmarkPdfForDelete: (state, action) => {
      const id = action.payload;
      state.pdfsManager.pendingDelete = state.pdfsManager.pendingDelete.filter((x) => x !== id);
    },
    setPendingMeta: (state, action) => {
      const { id, descripcion } = action.payload;
      // Solo marcar como pending si difiere del original
      const original = state.pdfsManager.existing.find((p) => p.id === id);
      if (original && original.descripcion === descripcion) {
        delete state.pdfsManager.pendingMetaUpdates[id];
      } else {
        state.pdfsManager.pendingMetaUpdates[id] = { descripcion };
      }
    },
    addNewFile: (state, action) => {
      // payload: { tempId, name, size, descripcion }
      // El File real vive en NEW_PDF_FILES (módulo) — aquí solo metadata serializable.
      const { tempId, name, size, descripcion } = action.payload;
      state.pdfsManager.newFiles.push({
        tempId,
        name,
        size: size || 0,
        descripcion: descripcion || '',
      });
    },
    updateNewFile: (state, action) => {
      const { tempId, descripcion } = action.payload;
      const idx = state.pdfsManager.newFiles.findIndex((f) => f.tempId === tempId);
      if (idx >= 0) {
        state.pdfsManager.newFiles[idx] = { ...state.pdfsManager.newFiles[idx], descripcion: descripcion || '' };
      }
    },
    removeNewFile: (state, action) => {
      const tempId = action.payload;
      state.pdfsManager.newFiles = state.pdfsManager.newFiles.filter((f) => f.tempId !== tempId);
    },

    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setFinalizados,
  setClientes,
  setEtiquetas,
  setTarjetas,
  setPagination,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  openEditModal,
  closeModal,
  updateForm,
  resetForm,
  setHistory,
  openHistoryDialog,
  closeHistoryDialog,
  setHistoryPage,
  setHistoryPageSize,
  // PDFs manager
  openPdfsManager,
  closePdfsManager,
  setPdfsLoading,
  setPdfsSaving,
  setExistingPdfs,
  markPdfForDelete,
  unmarkPdfForDelete,
  setPendingMeta,
  addNewFile,
  updateNewFile,
  removeNewFile,
  resetStore,
} = finalizadosTamitesStore.actions;

// Selectores
export const selectFinalizados = (state) => state.finalizadosTamitesStore.finalizados;
export const selectLoading = (state) => state.finalizadosTamitesStore.loading;
export const selectError = (state) => state.finalizadosTamitesStore.error;
export const selectClientes = (state) => state.finalizadosTamitesStore.clientes;
export const selectEtiquetas = (state) => state.finalizadosTamitesStore.etiquetas;
export const selectTarjetas = (state) => state.finalizadosTamitesStore.tarjetas;
export const selectPagination = (state) => state.finalizadosTamitesStore.pagination;
export const selectPage = (state) => state.finalizadosTamitesStore.pagination.page;
export const selectPageSize = (state) => state.finalizadosTamitesStore.pagination.pageSize;
export const selectTotalRows = (state) => state.finalizadosTamitesStore.pagination.count;
export const selectSortField = (state) => state.finalizadosTamitesStore.sortField;
export const selectSortOrder = (state) => state.finalizadosTamitesStore.sortOrder;
export const selectFilters = (state) => state.finalizadosTamitesStore.filters;
export const selectAppliedFilters = (state) => state.finalizadosTamitesStore.appliedFilters;
export const selectOpenModal = (state) => state.finalizadosTamitesStore.openModal;
export const selectSelectedFinalizado = (state) => state.finalizadosTamitesStore.selectedFinalizado;
export const selectForm = (state) => state.finalizadosTamitesStore.form;

export const selectActiveFilters = (state) => {
  const filters = state.finalizadosTamitesStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// La paginación es de servidor: `selectPaginatedFinalizados` simplemente
// devuelve la página actual ya recibida.
export const selectPaginatedFinalizados = (state) => state.finalizadosTamitesStore.finalizados;
export const selectFilteredTotalRows = (state) => state.finalizadosTamitesStore.pagination.count;

// PDFs manager selectors
export const selectPdfsManager = (state) => state.finalizadosTamitesStore.pdfsManager;
export const selectPdfsManagerOpen = (state) => state.finalizadosTamitesStore.pdfsManager.open;
export const selectPdfsHasChanges = (state) => {
  const m = state.finalizadosTamitesStore.pdfsManager;
  return (m.newFiles.length > 0)
    || (m.pendingDelete.length > 0)
    || (Object.keys(m.pendingMetaUpdates).length > 0);
};

// History selectors
export const selectHistoryData = (state) => state.finalizadosTamitesStore.history_data;
export const selectHistoryPagination = (state) => state.finalizadosTamitesStore.historyPagination;
export const selectOpenHistoryModal = (state) => state.finalizadosTamitesStore.openHistoryModal;
export const selectSelectedHistoryFinalizado = (state) => state.finalizadosTamitesStore.selectedHistoryFinalizado;

export default finalizadosTamitesStore.reducer;
