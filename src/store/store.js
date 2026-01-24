import { configureStore } from '@reduxjs/toolkit';
import { authStore }      from './authStore/authStore';
import { uiStore }        from './uiStore/uiStore';
import { usersStore }     from './usersStore/usersStore';

export const store = configureStore({
  reducer: {
    authStore : authStore.reducer,
    uiStore   : uiStore.reducer,
    usersStore: usersStore.reducer,
  },
});
