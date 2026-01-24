import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  themeMode: localStorage.getItem('themeMode') || 'light',
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifications: [],
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  loading: {
    global: false,
    message: '',
    operations: {},
  },
  breadcrumbs: [],
};

export const uiStore = createSlice({
  name: 'uiStore',
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.themeMode);
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    setGlobalLoading: (state, action) => {
      if (typeof action.payload === 'boolean') {
        state.loading.global = action.payload;
        if (!action.payload) state.loading.message = '';
      } else {
        state.loading.global = action.payload.loading;
        state.loading.message = action.payload.message || '';
      }
    },
    showBackdrop: (state, action) => {
      state.loading.global = true;
      state.loading.message = action.payload || 'Procesando...';
    },
    hideBackdrop: (state) => {
      state.loading.global = false;
      state.loading.message = '';
    },
    setOperationLoading: (state, action) => {
      const { operation, isLoading } = action.payload;
      if (isLoading) {
        state.loading.operations[operation] = true;
      } else {
        delete state.loading.operations[operation];
      }
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const {
  toggleThemeMode,
  setThemeMode,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  showSnackbar,
  hideSnackbar,
  setGlobalLoading,
  showBackdrop,
  hideBackdrop,
  setOperationLoading,
  setBreadcrumbs,
} = uiStore.actions;

// Selectors
export const selectThemeMode = (state) => state.uiStore.themeMode;
export const selectSidebarOpen = (state) => state.uiStore.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.uiStore.sidebarCollapsed;
export const selectNotifications = (state) => state.uiStore.notifications;
export const selectUnreadNotificationsCount = (state) =>
  state.uiStore.notifications.filter((n) => !n.read).length;
export const selectSnackbar = (state) => state.uiStore.snackbar;
export const selectGlobalLoading = (state) => state.uiStore.loading.global;
export const selectLoadingMessage = (state) => state.uiStore.loading.message;
export const selectOperationLoading = (operation) => (state) =>
  state.uiStore.loading.operations[operation] || false;
export const selectBreadcrumbs = (state) => state.uiStore.breadcrumbs;
