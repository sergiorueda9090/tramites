import api from '../../services/api';
import AlertService from '../../services/alertService';
import {
  setError,
  setLoadingResumen,
  setResumen,
  setLoadingBalance,
  setBalance,
  setBalancePagination,
  setLoadingSaldo,
  setSaldo,
  setLoadingMovimientos,
  setMovimientos,
  setMovimientosPagination,
  openAsientoDialog,
  setAsientoData,
  closeAsientoDialog,
} from './dashboardContableStore';

const API_URLS = {
  balance:        '/api/sub_cuentas/balance/',
  balanceResumen: '/api/sub_cuentas/balance/resumen/',
  saldo:          (id) => `/api/sub_cuentas/${id}/saldo/`,
  movimientos:    (id) => `/api/sub_cuentas/${id}/movimientos/`,
  asiento:        (uuid) => `/api/movimiento_contable/asiento/${uuid}/`,
};

const extractApiError = (error) => {
  const response = error.response?.data;
  const status = error.response?.status;
  let title = 'Error';
  switch (status) {
    case 400: title = 'Error de validacion'; break;
    case 401: title = 'No autorizado'; break;
    case 403: title = 'Acceso denegado'; break;
    case 404: title = 'No encontrado'; break;
    case 500: title = 'Error del servidor'; break;
    default:  title = 'Error';
  }
  if (!response) {
    return { title: 'Error de conexion', message: error.message, htmlMessage: `<p>${error.message}</p>` };
  }
  const mainMessage = response.error || response.detail || 'Ha ocurrido un error';
  return { title, message: mainMessage, htmlMessage: `<p>${mainMessage}</p>` };
};

const cleanParams = (obj) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) out[k] = v;
  });
  return out;
};

// -------------------- RESUMEN (KPIs) --------------------

export const loadResumenThunk = () => async (dispatch) => {
  try {
    dispatch(setLoadingResumen(true));
    const response = await api.get(API_URLS.balanceResumen);
    dispatch(setResumen(response.data));
  } catch (error) {
    const { title, message, htmlMessage } = extractApiError(error);
    dispatch(setError(message));
    dispatch(setLoadingResumen(false));
    AlertService.error(title, htmlMessage);
  }
};

// -------------------- BALANCE --------------------

export const loadBalanceThunk = (overrides = {}) => async (dispatch, getState) => {
  try {
    dispatch(setLoadingBalance(true));
    const { balancePagination, appliedBalanceFilters } = getState().dashboardContableStore;

    const page = overrides.page || balancePagination.page;
    const pageSize = overrides.page_size || balancePagination.pageSize;

    const params = cleanParams({
      ...appliedBalanceFilters,
      page,
      page_size: pageSize,
    });

    const response = await api.get(API_URLS.balance, { params });
    const { count, next, previous, results } = response.data;
    dispatch(setBalance(results));
    dispatch(setBalancePagination({ count, next, previous, page, pageSize }));
  } catch (error) {
    const { title, message, htmlMessage } = extractApiError(error);
    dispatch(setError(message));
    dispatch(setLoadingBalance(false));
    AlertService.error(title, htmlMessage);
  }
};

// -------------------- DRILL-DOWN: saldo + movimientos --------------------

export const loadSaldoThunk = (subCuentaId) => async (dispatch) => {
  try {
    dispatch(setLoadingSaldo(true));
    const response = await api.get(API_URLS.saldo(subCuentaId));
    dispatch(setSaldo(response.data));
  } catch (error) {
    const { title, htmlMessage } = extractApiError(error);
    dispatch(setLoadingSaldo(false));
    AlertService.error(title, htmlMessage);
  }
};

export const loadMovimientosThunk = (subCuentaId, overrides = {}) => async (dispatch, getState) => {
  try {
    dispatch(setLoadingMovimientos(true));
    const { movimientosPagination, appliedMovimientosFilters } = getState().dashboardContableStore;

    const page = overrides.page || movimientosPagination.page;
    const pageSize = overrides.page_size || movimientosPagination.pageSize;

    const params = cleanParams({
      ...appliedMovimientosFilters,
      page,
      page_size: pageSize,
    });

    const response = await api.get(API_URLS.movimientos(subCuentaId), { params });
    const { count, next, previous, results } = response.data;
    dispatch(setMovimientos(results));
    dispatch(setMovimientosPagination({ count, next, previous, page, pageSize }));
  } catch (error) {
    const { title, htmlMessage } = extractApiError(error);
    dispatch(setLoadingMovimientos(false));
    AlertService.error(title, htmlMessage);
  }
};

// Cargar el asiento completo (los 2 movimientos: debito + credito) por UUID.
// Abre el dialog y carga la data dentro.
export const fetchAsientoThunk = (asientoUuid) => async (dispatch) => {
  try {
    dispatch(openAsientoDialog());
    const response = await api.get(API_URLS.asiento(asientoUuid));
    dispatch(setAsientoData(response.data));
    return response.data;
  } catch (error) {
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    dispatch(closeAsientoDialog());
    return null;
  }
};
