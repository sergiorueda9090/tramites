import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista
  categorias: [],
  loading: false,
  error: null,

  // Paginación servidor
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
  filters: { search: '' },
  appliedFilters: { search: '' },

  // Modal
  openModal: false,
  selectedCategoria: null,

  // Form
  form: {
    id: null,
    nombre: '',
    descripcion: '',
  },
};

export const gastosCategoriaStore = createSlice({
  name: 'gastosCategoriaStore',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setCategorias: (state, action) => {
      state.categorias = action.payload;
      state.loading = false;
    },

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

    setSort: (state, action) => {
      const { field } = action.payload;
      if (state.sortField === field) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortOrder = 'asc';
      }
    },

    updateFilter: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
    },
    applyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { search: '' };
      state.appliedFilters = { search: '' };
      state.pagination.page = 1;
    },
    clearFilter: (state, action) => {
      const field = action.payload;
      state.filters[field] = '';
      state.appliedFilters[field] = '';
    },

    openCreateModal: (state) => {
      state.openModal = true;
      state.selectedCategoria = null;
      state.form = { id: null, nombre: '', descripcion: '' };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedCategoria = action.payload;
      state.form = {
        id: action.payload.id,
        nombre: action.payload.nombre || '',
        descripcion: action.payload.descripcion || '',
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedCategoria = null;
      state.form = initialState.form;
    },

    updateForm: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => { state.form = initialState.form; },

    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setCategorias,
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
} = gastosCategoriaStore.actions;

// Selectores
export const selectCategorias = (state) => state.gastosCategoriaStore.categorias;
export const selectLoading = (state) => state.gastosCategoriaStore.loading;
export const selectError = (state) => state.gastosCategoriaStore.error;
export const selectPagination = (state) => state.gastosCategoriaStore.pagination;
export const selectPage = (state) => state.gastosCategoriaStore.pagination.page;
export const selectPageSize = (state) => state.gastosCategoriaStore.pagination.pageSize;
export const selectTotalRows = (state) => state.gastosCategoriaStore.pagination.count;
export const selectSortField = (state) => state.gastosCategoriaStore.sortField;
export const selectSortOrder = (state) => state.gastosCategoriaStore.sortOrder;
export const selectFilters = (state) => state.gastosCategoriaStore.filters;
export const selectAppliedFilters = (state) => state.gastosCategoriaStore.appliedFilters;
export const selectOpenModal = (state) => state.gastosCategoriaStore.openModal;
export const selectSelectedCategoria = (state) => state.gastosCategoriaStore.selectedCategoria;
export const selectForm = (state) => state.gastosCategoriaStore.form;

export const selectActiveFilters = (state) => {
  const filters = state.gastosCategoriaStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// La paginación es de servidor, así que retornamos directo lo que llegó
export const selectPaginatedCategorias = (state) => state.gastosCategoriaStore.categorias;
export const selectFilteredTotalRows = (state) => state.gastosCategoriaStore.pagination.count;

export default gastosCategoriaStore.reducer;
