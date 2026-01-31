import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de usuarios
  users: [],
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
    role: '',
    estado: '',
    is_active: '',
  },
  appliedFilters: {
    search: '',
    role: '',
    estado: '',
    is_active: '',
  },

  // Modal
  openModal: false,
  selectedUser: null,

  // Formulario
  form: {
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    role: '',
    password: '',
    is_active: false,
    image: null,
  },
};

export const usersStore = createSlice({
  name: 'usersStore',
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

    // Lista de usuarios
    setUsers: (state, action) => {
      state.users = action.payload;
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
      state.filters = { search: '', role: '', estado: '', is_active: '' };
      state.appliedFilters = { search: '', role: '', estado: '', is_active: '' };
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
      state.selectedUser = null;
      state.form = {
        id: null,
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        password: '',
        is_active: false,
        image: null,
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedUser = action.payload;
      state.form = {
        id: action.payload.id,
        first_name: action.payload.first_name || '',
        username: action.payload.username || '',
        last_name: action.payload.last_name || '',
        email: action.payload.email || '',
        role: action.payload.role || '',
        password: '',
        is_active: action.payload.is_active ?? false,
        image: action.payload.image || null,
      };
    },
    closeModal: (state) => {
      state.openModal = false;
      state.selectedUser = null;
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
  setUsers,
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
} = usersStore.actions;

// Selectores
export const selectUsers = (state) => state.usersStore.users;
export const selectLoading = (state) => state.usersStore.loading;
export const selectError = (state) => state.usersStore.error;
export const selectPagination = (state) => state.usersStore.pagination;
export const selectPage = (state) => state.usersStore.pagination.page;
export const selectPageSize = (state) => state.usersStore.pagination.pageSize;
export const selectTotalRows = (state) => state.usersStore.pagination.count;
export const selectTotalPages = (state) => {
  const { count, pageSize } = state.usersStore.pagination;
  return Math.ceil(count / pageSize) || 1;
};
export const selectHasNext = (state) => state.usersStore.pagination.next !== null;
export const selectHasPrevious = (state) => state.usersStore.pagination.previous !== null;
export const selectSortField = (state) => state.usersStore.sortField;
export const selectSortOrder = (state) => state.usersStore.sortOrder;
export const selectFilters = (state) => state.usersStore.filters;
export const selectAppliedFilters = (state) => state.usersStore.appliedFilters;
export const selectOpenModal = (state) => state.usersStore.openModal;
export const selectSelectedUser = (state) => state.usersStore.selectedUser;
export const selectForm = (state) => state.usersStore.form;

// Selector para filtros activos (para mostrar chips)
export const selectActiveFilters = (state) => {
  const filters = state.usersStore.appliedFilters;
  return Object.entries(filters)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));
};

// Selector para filtrado local (dentro de la página actual)
export const selectFilteredUsers = (state) => {
  const { users, appliedFilters } = state.usersStore;
  const { search, rol, estado } = appliedFilters;

  if (!search && !rol && estado === '') {
    return users;
  }

  return users.filter((user) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      if (
        !fullName.includes(searchLower) &&
        !(user.email || '').toLowerCase().includes(searchLower) &&
        !(user.username || '').toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (rol && user.idrol !== parseInt(rol)) {
      return false;
    }

    if (estado !== '') {
      const estadoBool = estado === 'true';
      if (user.is_active !== estadoBool) {
        return false;
      }
    }

    return true;
  });
};

// Selector para datos ordenados localmente
export const selectSortedUsers = (state) => {
  const filteredUsers = selectFilteredUsers(state);
  const { sortField, sortOrder } = state.usersStore;

  if (!sortField) return filteredUsers;

  return [...filteredUsers].sort((a, b) => {
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
export const selectPaginatedUsers = (state) => {
  return selectSortedUsers(state);
};

// Selector para total de filas (del servidor)
export const selectFilteredTotalRows = (state) => {
  return state.usersStore.pagination.count;
};

export default usersStore.reducer;
