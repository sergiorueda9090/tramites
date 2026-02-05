import { configureStore }           from '@reduxjs/toolkit';
import { authStore }                from './authStore/authStore';
import { uiStore }                  from './uiStore/uiStore';
import { usersStore }               from './usersStore/usersStore';
import { clientesStore }            from './clientesStore/clientesStore';
import { etiquetasStore }           from './etiquetasStore/etiquetasStore';
import { tarjetasStore }            from './tarjetasStore/tarjetasStore';
import { recepcionPagoStore }       from './recepcionPago/recepcionPagoStore';
import { devolucionesStore }        from './devolucionesStore/devolucionesStore';
import { cargosNoRegistradosStore } from './cargosNoRegistradosStore/cargosNoRegistradosStore';
import { ajusteSaldoStore }         from './ajusteSaldoStore/ajusteSaldoStore';

import presenceReducer    from './presenceStore/presenceStore';

export const store = configureStore({
  reducer: {
    authStore       : authStore.reducer,
    uiStore         : uiStore.reducer,
    usersStore      : usersStore.reducer,
    clientesStore   : clientesStore.reducer,
    presence        : presenceReducer,
    etiquetasStore  : etiquetasStore.reducer,
    tarjetasStore   : tarjetasStore.reducer,
    recepcionPagoStore: recepcionPagoStore.reducer,
    devolucionesStore: devolucionesStore.reducer,
    cargosNoRegistradosStore: cargosNoRegistradosStore.reducer,
    ajusteSaldoStore: ajusteSaldoStore.reducer,
  },
});
