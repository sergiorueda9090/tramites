import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialState = {
  // Lista de usuarios
  users: [],
  loading: false,
  error: null,

  // Paginación
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  totalRows: 0,

  // Ordenamiento
  sortField: null,
  sortOrder: 'asc',

  // Filtros
  filters: {
    search: '',
    rol: '',
    estado: '',
  },
  appliedFilters: {
    search: '',
    rol: '',
    estado: '',
  },

  // Modal
  openModal: false,
  selectedUser: null,

  // Formulario
  form: {
    id: null,
    nombre: '',
    email: '',
    rol: '',
    password: '',
    estado: true,
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
      state.totalRows = action.payload.length;
      state.loading = false;
    },

    // Paginación
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.page = 0;
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
      state.page = 0;
    },
    clearFilters: (state) => {
      state.filters = { search: '', rol: '', estado: '' };
      state.appliedFilters = { search: '', rol: '', estado: '' };
      state.page = 0;
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
        nombre: '',
        email: '',
        rol: '',
        password: '',
        estado: true,
      };
    },
    openEditModal: (state, action) => {
      state.openModal = true;
      state.selectedUser = action.payload;
      state.form = {
        id: action.payload.id,
        nombre: action.payload.nombre,
        email: action.payload.email,
        rol: action.payload.rol,
        password: '',
        estado: action.payload.estado,
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

    // CRUD
    addUser: (state, action) => {
      state.users.unshift(action.payload);
      state.totalRows = state.users.length;
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action) => {
      state.users = state.users.filter(u => u.id !== action.payload);
      state.totalRows = state.users.length;
    },

    // Reset
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setUsers,
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
  addUser,
  updateUser,
  removeUser,
  resetStore,
} = usersStore.actions;

// Selectores
export const selectUsers = (state) => state.usersStore.users;
export const selectLoading = (state) => state.usersStore.loading;
export const selectError = (state) => state.usersStore.error;
export const selectPage = (state) => state.usersStore.page;
export const selectPageSize = (state) => state.usersStore.pageSize;
export const selectTotalRows = (state) => state.usersStore.totalRows;
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

// Selector para datos filtrados
export const selectFilteredUsers = (state) => {
  const { users, appliedFilters } = state.usersStore;
  const { search, rol, estado } = appliedFilters;

  return users.filter((user) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !user.nombre.toLowerCase().includes(searchLower) &&
        !user.email.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (rol && user.rol !== rol) {
      return false;
    }

    if (estado !== '') {
      const estadoBool = estado === 'true';
      if (user.estado !== estadoBool) {
        return false;
      }
    }

    return true;
  });
};

// Selector para datos ordenados
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

// Selector para datos paginados
export const selectPaginatedUsers = (state) => {
  const sortedUsers = selectSortedUsers(state);
  const { page, pageSize } = state.usersStore;
  const start = page * pageSize;
  const end = start + pageSize;
  return sortedUsers.slice(start, end);
};

// Selector para total de filas filtradas
export const selectFilteredTotalRows = (state) => {
  return selectFilteredUsers(state).length;
};

export default usersStore.reducer;
