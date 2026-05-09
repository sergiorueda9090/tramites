import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setRegistros,
  setPagination,
} from './utilidadesStore';

const API_URLS = {
  list:       '/api/utilidades/list/',
  detail:     (id) => `/api/utilidades/${id}/`,
  delete:     (id) => `/api/utilidades/${id}/delete/`,
  restore:    (id) => `/api/utilidades/${id}/restore/`,
  hardDelete: (id) => `/api/utilidades/${id}/hard-delete/`,
  history:    (id) => `/api/utilidades/${id}/history/`,
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

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('es-CO');
  } catch {
    return value;
  }
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
 * Listar utilidades con paginación y filtros del servidor.
 * Params soportados: page, page_size, search, start_date, end_date, ordering, include_deleted.
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().utilidadesStore;
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
 * Mostrar el detalle de un registro de utilidad (read-only).
 * Backend solo devuelve los 6 campos del reporte.
 */
export const viewThunk = (registro) => {
  return async () => {
    const fmt = (v) => (v === null || v === undefined || v === '' ? '-' : v);

    await AlertService.info(
      `Utilidad #${registro.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Fecha:</strong> ${formatDate(registro.fecha)}</p>
          <p><strong>Placa:</strong> ${fmt(registro.placa)}</p>
          <p><strong>Comisión proveedor:</strong> ${formatMoney(registro.comision_proveedor)}</p>
          <p><strong>Cilindraje:</strong> ${fmt(registro.cilindraje)}</p>
          <p><strong>Modelo:</strong> ${fmt(registro.modelo)}</p>
          <p><strong>N° Chasis:</strong> ${fmt(registro.chasis)}</p>
        </div>
      `
    );
  };
};

/**
 * Eliminar (soft delete) un registro de utilidad.
 */
export const deleteThunk = (registro) => {
  return async (dispatch) => {
    try {
      const label = `Utilidad #${registro.id}${registro.placa ? ` — ${registro.placa}` : ''}`;
      const result = await AlertService.confirmDelete(label);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando utilidad...'));
      await api.delete(API_URLS.delete(registro.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad eliminada!',
        `El registro <strong>${label}</strong> ha sido eliminado correctamente.`,
        { timer: 3000 }
      );
      return true;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return false;
    }
  };
};

/**
 * Restaurar un registro de utilidad eliminado.
 */
export const restoreThunk = (registro) => {
  return async (dispatch) => {
    try {
      const label = `Utilidad #${registro.id}${registro.placa ? ` — ${registro.placa}` : ''}`;
      const result = await AlertService.confirm(
        '¿Restaurar utilidad?',
        `¿Está seguro que desea restaurar <strong>${label}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando utilidad...'));
      await api.post(API_URLS.restore(registro.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad restaurada!',
        `El registro <strong>${label}</strong> ha sido restaurado correctamente.`,
        { timer: 3000 }
      );
      return true;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return false;
    }
  };
};

/**
 * Eliminar permanentemente un registro de utilidad.
 */
export const hardDeleteThunk = (registro) => {
  return async (dispatch) => {
    try {
      const label = `Utilidad #${registro.id}${registro.placa ? ` — ${registro.placa}` : ''}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente <strong>${label}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(registro.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad eliminada permanentemente!',
        `El registro <strong>${label}</strong> ha sido eliminado permanentemente.`,
        { timer: 3000 }
      );
      return true;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return false;
    }
  };
};

/**
 * Obtener historial de cambios de una utilidad.
 */
export const getHistoryThunk = (registroId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(registroId));
      dispatch(hideBackdrop());
      return response.data;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};
