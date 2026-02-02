import { configureStore } from '@reduxjs/toolkit';
import { authStore }      from './authStore/authStore';
import { uiStore }        from './uiStore/uiStore';
import { usersStore }     from './usersStore/usersStore';
import { clientesStore } from './clientesStore/clientesStore';
import { etiquetasStore } from './etiquetasStore/etiquetasStore';
import presenceReducer    from './presenceStore/presenceStore';

export const store = configureStore({
  reducer: {
    authStore       : authStore.reducer,
    uiStore         : uiStore.reducer,
    usersStore      : usersStore.reducer,
    clientesStore   : clientesStore.reducer,
    presence        : presenceReducer,
    etiquetasStore  : etiquetasStore.reducer,
  },
});
