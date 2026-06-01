import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const initialBalanceFilters = {
  search: '',
  tipo: '',           // activo / pasivo / patrimonio / ingreso / gasto
  cuenta: '',         // FK PlanDeCuentas id
};

const initialMovimientosFilters = {
  modulo_origen: '',  // devoluciones / recepcion_pago / ...
  tipo_movimiento: '', // debito / credito
  fecha_start: '',
  fecha_end: '',
};

const initialState = {
  // KPIs agregados por tipo de cuenta
  resumen: null,           // { activo: {...}, pasivo: {...}, ... }
  totalSubCuentas: 0,
  loadingResumen: false,

  // Vista 1: balance (lista de sub-cuentas con sus saldos)
  balance: [],
  loadingBalance: false,
  balancePagination: {
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    next: null,
    previous: null,
  },
  balanceFilters: { ...initialBalanceFilters },
  appliedBalanceFilters: { ...initialBalanceFilters },

  // Vista 2: drill-down de movimientos de UNA sub-cuenta
  drawerOpen: false,
  selectedSubCuenta: null,    // objeto del balance + saldo expandido
  saldo: null,                // { debito_total, credito_total, acumulado, ... }
  loadingSaldo: false,
  movimientos: [],
  loadingMovimientos: false,
  movimientosPagination: {
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    next: null,
    previous: null,
  },
  movimientosFilters: { ...initialMovimientosFilters },
  appliedMovimientosFilters: { ...initialMovimientosFilters },

  // Dialog del asiento contable (los 2 lados de la partida doble)
  asientoDialogOpen: false,
  asientoLoading: false,
  asientoData: null,   // { asiento_id, movimientos: [debito, credito] }

  error: null,
};

export const dashboardContableStore = createSlice({
  name: 'dashboardContableStore',
  initialState,
  reducers: {
    setError: (state, action) => { state.error = action.payload; },

    // ---------- RESUMEN (KPIs) ----------
    setLoadingResumen: (state, action) => { state.loadingResumen = action.payload; },
    setResumen: (state, action) => {
      state.resumen = action.payload.resumen;
      state.totalSubCuentas = action.payload.total_sub_cuentas || 0;
      state.loadingResumen = false;
    },

    // ---------- BALANCE ----------
    setLoadingBalance: (state, action) => { state.loadingBalance = action.payload; },
    setBalance: (state, action) => {
      state.balance = action.payload;
      state.loadingBalance = false;
    },
    setBalancePagination: (state, action) => {
      const { count, next, previous, page, pageSize } = action.payload;
      state.balancePagination = {
        count: count ?? 0,
        next: next ?? null,
        previous: previous ?? null,
        page: page ?? state.balancePagination.page,
        pageSize: pageSize ?? state.balancePagination.pageSize,
      };
    },
    setBalancePage: (state, action) => { state.balancePagination.page = action.payload; },
    setBalancePageSize: (state, action) => {
      state.balancePagination.pageSize = action.payload;
      state.balancePagination.page = 1;
    },
    updateBalanceFilter: (state, action) => {
      const { field, value } = action.payload;
      state.balanceFilters[field] = value;
    },
    applyBalanceFilters: (state) => {
      state.appliedBalanceFilters = { ...state.balanceFilters };
      state.balancePagination.page = 1;
    },
    clearBalanceFilters: (state) => {
      state.balanceFilters = { ...initialBalanceFilters };
      state.appliedBalanceFilters = { ...initialBalanceFilters };
      state.balancePagination.page = 1;
    },

    // ---------- DRILL-DOWN ----------
    openMovimientosDrawer: (state, action) => {
      state.drawerOpen = true;
      state.selectedSubCuenta = action.payload;
      state.saldo = null;
      state.movimientos = [];
      state.movimientosPagination = initialState.movimientosPagination;
      state.movimientosFilters = { ...initialMovimientosFilters };
      state.appliedMovimientosFilters = { ...initialMovimientosFilters };
    },
    closeMovimientosDrawer: (state) => {
      state.drawerOpen = false;
      state.selectedSubCuenta = null;
      state.saldo = null;
      state.movimientos = [];
    },
    setLoadingSaldo: (state, action) => { state.loadingSaldo = action.payload; },
    setSaldo: (state, action) => {
      state.saldo = action.payload;
      state.loadingSaldo = false;
    },
    setLoadingMovimientos: (state, action) => { state.loadingMovimientos = action.payload; },
    setMovimientos: (state, action) => {
      state.movimientos = action.payload;
      state.loadingMovimientos = false;
    },
    setMovimientosPagination: (state, action) => {
      const { count, next, previous, page, pageSize } = action.payload;
      state.movimientosPagination = {
        count: count ?? 0,
        next: next ?? null,
        previous: previous ?? null,
        page: page ?? state.movimientosPagination.page,
        pageSize: pageSize ?? state.movimientosPagination.pageSize,
      };
    },
    setMovimientosPage: (state, action) => { state.movimientosPagination.page = action.payload; },
    setMovimientosPageSize: (state, action) => {
      state.movimientosPagination.pageSize = action.payload;
      state.movimientosPagination.page = 1;
    },
    updateMovimientosFilter: (state, action) => {
      const { field, value } = action.payload;
      state.movimientosFilters[field] = value;
    },
    applyMovimientosFilters: (state) => {
      state.appliedMovimientosFilters = { ...state.movimientosFilters };
      state.movimientosPagination.page = 1;
    },
    clearMovimientosFilters: (state) => {
      state.movimientosFilters = { ...initialMovimientosFilters };
      state.appliedMovimientosFilters = { ...initialMovimientosFilters };
      state.movimientosPagination.page = 1;
    },

    // ---------- ASIENTO DIALOG ----------
    openAsientoDialog: (state) => {
      state.asientoDialogOpen = true;
      state.asientoData = null;
      state.asientoLoading = true;
    },
    setAsientoData: (state, action) => {
      state.asientoData = action.payload;
      state.asientoLoading = false;
    },
    closeAsientoDialog: (state) => {
      state.asientoDialogOpen = false;
      state.asientoData = null;
      state.asientoLoading = false;
    },

    resetStore: () => initialState,
  },
});

export const {
  setError,
  setLoadingResumen,
  setResumen,
  setLoadingBalance,
  setBalance,
  setBalancePagination,
  setBalancePage,
  setBalancePageSize,
  updateBalanceFilter,
  applyBalanceFilters,
  clearBalanceFilters,
  openMovimientosDrawer,
  closeMovimientosDrawer,
  setLoadingSaldo,
  setSaldo,
  setLoadingMovimientos,
  setMovimientos,
  setMovimientosPagination,
  setMovimientosPage,
  setMovimientosPageSize,
  updateMovimientosFilter,
  applyMovimientosFilters,
  clearMovimientosFilters,
  openAsientoDialog,
  setAsientoData,
  closeAsientoDialog,
  resetStore,
} = dashboardContableStore.actions;

// ---------- Selectores ----------
export const selectResumen = (state) => state.dashboardContableStore.resumen;
export const selectTotalSubCuentas = (state) => state.dashboardContableStore.totalSubCuentas;
export const selectLoadingResumen = (state) => state.dashboardContableStore.loadingResumen;

export const selectAsientoDialogOpen = (state) => state.dashboardContableStore.asientoDialogOpen;
export const selectAsientoLoading = (state) => state.dashboardContableStore.asientoLoading;
export const selectAsientoData = (state) => state.dashboardContableStore.asientoData;

export const selectBalance = (state) => state.dashboardContableStore.balance;
export const selectLoadingBalance = (state) => state.dashboardContableStore.loadingBalance;
export const selectBalancePagination = (state) => state.dashboardContableStore.balancePagination;
export const selectBalanceFilters = (state) => state.dashboardContableStore.balanceFilters;
export const selectAppliedBalanceFilters = (state) => state.dashboardContableStore.appliedBalanceFilters;

export const selectDrawerOpen = (state) => state.dashboardContableStore.drawerOpen;
export const selectSelectedSubCuenta = (state) => state.dashboardContableStore.selectedSubCuenta;
export const selectSaldo = (state) => state.dashboardContableStore.saldo;
export const selectLoadingSaldo = (state) => state.dashboardContableStore.loadingSaldo;
export const selectMovimientos = (state) => state.dashboardContableStore.movimientos;
export const selectLoadingMovimientos = (state) => state.dashboardContableStore.loadingMovimientos;
export const selectMovimientosPagination = (state) => state.dashboardContableStore.movimientosPagination;
export const selectMovimientosFilters = (state) => state.dashboardContableStore.movimientosFilters;
export const selectAppliedMovimientosFilters = (state) => state.dashboardContableStore.appliedMovimientosFilters;

export const selectError = (state) => state.dashboardContableStore.error;

export default dashboardContableStore.reducer;
