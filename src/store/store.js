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
import { gastosMainStore }          from './gastosMainStore/gastosMainStore';
import { gastosStore }              from './gastosStore/gastosStore';
import { tarifarioSoatStore }       from './tarifarioSoatStore/tarifarioSoatStore';
import { cotizadorStore }            from './cotizadorStore/cotizadorStore';
import { apisExternasRuntStore }    from './apisExternasStore/apisExternasRuntStore';

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
    gastosStore     : gastosStore.reducer,
    gastosMainStore : gastosMainStore.reducer,
    tarifarioSoatStore: tarifarioSoatStore.reducer,
    cotizadorStore: cotizadorStore.reducer,
    apisExternasRuntStore: apisExternasRuntStore.reducer,
  },
});
