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
import { cotizadorStore }           from './cotizadorStore/cotizadorStore';
import { apisExternasRuntStore }    from './apisExternasStore/apisExternasRuntStore';
import { baseDeDatosStore }         from './baseDeDatosStore/baseDeDatosStore';
import {apiAppStore}                from './apiAppStore/apiAppStore';
import { casosEspecialesStore }     from './casosEspecialesStore/casosEspecialesStore';
import { tramitesStore }            from './tamitesStore/tamitesStore';
import { pasarelaDePagoStore }       from './pasarelaDePagoStore/pasarelaDePagoStore';
import { finalizadosTamitesStore } from './finalizadosTamitesStore/finalizadosTamitesStore';
import { gastosCategoriaStore }     from './gastosCategoriaStore/gastosCategoriaStore';
import { cuatroPorMilStore }        from './cuatroPorMilStore/cuatroPorMilStore';
import { utilidadesStore }         from './utilidadesStore/utilidadesStore';
import { utilidadOcasionalStore }   from './utilidadOcasionalStore/utilidadOcasionalStore';
import { conmutadorIpsStore }      from './conmutadorIpsStore/conmutadorIpsStore';
import { planDeCuotasStore } from './planDeCuotasStore/planDeCuotasStore';
import { subCuentasStore } from './subCuentasStore/subCuentasStore';
import { proveedoresStore } from './proveedoresStore/proveedoresStore';
import { apiMetricsStore } from './apiMetricsStore/apiMetricsStore';
import { dashboardContableStore } from './dashboardContableStore/dashboardContableStore';

import presenceReducer    from './presenceStore/presenceStore';
import cellPresenceReducer from './cellPresenceStore/cellPresenceStore';


export const store = configureStore({
  reducer: {
    authStore       : authStore.reducer,
    uiStore         : uiStore.reducer,
    usersStore      : usersStore.reducer,
    clientesStore   : clientesStore.reducer,
    presence        : presenceReducer,
    cellPresence    : cellPresenceReducer,
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
    baseDeDatosStore: baseDeDatosStore.reducer,
    apiAppStore: apiAppStore.reducer,
    casosEspecialesStore: casosEspecialesStore.reducer,
    tramitesStore: tramitesStore.reducer,
    pasarelaDePagoStore: pasarelaDePagoStore.reducer,
    finalizadosTamitesStore: finalizadosTamitesStore.reducer,
    gastosCategoriaStore: gastosCategoriaStore.reducer,
    cuatroPorMilStore: cuatroPorMilStore.reducer,
    utilidadesStore: utilidadesStore.reducer,
    utilidadOcasionalStore: utilidadOcasionalStore.reducer,
    conmutadorIpsStore: conmutadorIpsStore.reducer,
    planDeCuotasStore: planDeCuotasStore.reducer,
    subCuentasStore: subCuentasStore.reducer,
    proveedoresStore: proveedoresStore.reducer,
    apiMetricsStore: apiMetricsStore.reducer,
    dashboardContableStore: dashboardContableStore.reducer,
  },
});
