import api from '../../services/api';
import AlertService from '../../services/alertService';
import {
  setLoading,
  setError,
  setRegistros,
  setPagination,
  setStats,
  setStatsLoading,
} from './cuatroPorMilStore';

const API_URLS = {
  list:    '/api/cuatro_por_mil/list/',
  stats:   '/api/cuatro_por_mil/stats/',
  detail:  (id) => `/api/cuatro_por_mil/${id}/`,
  history: (id) => `/api/cuatro_por_mil/${id}/history/`,
};

const MODULO_LABELS = {
  recepcion_pago:        'Recepción de pagos',
  devoluciones:          'Devoluciones',
  gastos:                'Gastos',
  cargos_no_registrados: 'Cargos no registrados',
  utilidad_ocasional:    'Utilidad ocasional',
  pasarela_de_pago:      'Pasarela de pago',
  finalizados_tramites:  'Trámites finalizados',
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const extractApiError = (error) => {
  const response = error.response?.data;
  const status = error.response?.status;

  let title = 'Error';
  switch (status) {
    case 400: title = 'Error de validación'; break;
    case 401: title = 'No autorizado'; break;
    case 403: title = 'Acceso denegado'; break;
    case 404: title = 'No encontrado'; break;
    case 500: title = 'Error del servidor'; break;
    default:  title = 'Error';
  }

  if (!response) {
    return {
      title: 'Error de conexión',
      message: error.message || 'No se pudo conectar al servidor',
      htmlMessage: `<p>${error.message || 'No se pudo conectar al servidor.'}</p>`,
    };
  }

  const mainMessage = response.error || response.detail || 'Ha ocurrido un error';
  return { title, message: mainMessage, htmlMessage: `<p>${mainMessage}</p>` };
};

/**
 * Listar registros 4x1000 con paginación y filtros del servidor.
 * Params soportados: page, page_size, modulo, registro_id, tarjeta_id,
 * search, start_date, end_date, ordering, include_deleted.
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().cuatroPorMilStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = { ...params, page, page_size: pageSize };
      const response = await api.get(API_URLS.list, { params: queryParams });

      const { count, next, previous, results } = response.data;

      dispatch(setRegistros(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Cargar estadísticas agregadas (panel de visualización).
 * Acepta los mismos filtros que listAllThunk excepto page/page_size/ordering.
 * Falla silenciosa: el panel se queda en su estado anterior y no spamea alertas.
 */
export const fetchStatsThunk = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setStatsLoading(true));
      const response = await api.get(API_URLS.stats, { params });
      dispatch(setStats(response.data));
    } catch (error) {
      dispatch(setStatsLoading(false));
      console.warn('[cuatro_por_mil] No se pudieron cargar estadísticas:', error?.message || error);
    }
  };
};

/**
 * Mostrar el detalle de un registro 4x1000 (read-only).
 */
export const viewThunk = (registro) => {
  return async () => {
    const moduloLabel = MODULO_LABELS[registro.modulo] || registro.modulo || '-';
    const tarjetaInfo = registro.tarjeta
      ? `${registro.tarjeta.titular || ''} ····${(registro.tarjeta.numero || '').slice(-4)}`
      : '-';
    const fmt = (v) => (v === null || v === undefined || v === '' ? '-' : v);

    await AlertService.info(
      `4x1000 #${registro.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Módulo origen:</strong> ${moduloLabel}</p>
          <p><strong>ID del registro origen:</strong> ${fmt(registro.registro_id)}</p>
          <p><strong>Valor base:</strong> ${formatMoney(registro.valor_base)}</p>
          <p><strong>Valor 4x1000:</strong> ${formatMoney(registro.valor)}</p>
          <p><strong>Tarjeta:</strong> ${tarjetaInfo}</p>
          <p><strong>Fecha:</strong> ${fmt(registro.fecha)}</p>
          <p><strong>Observación:</strong> ${fmt(registro.observacion)}</p>
          <p><strong>Registrado por:</strong> ${fmt(registro.usuario_name)}</p>
        </div>
      `
    );
  };
};
