import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setIps,
  setPagination,
  closeModal,
  openEditModal,
} from './conmutadorIpsStore';

const API_URLS = {
  list:       '/api/computador_ips/list/',
  detail:     (id) => `/api/computador_ips/${id}/`,
  create:     '/api/computador_ips/create/',
  update:     (id) => `/api/computador_ips/${id}/update/`,
  delete:     (id) => `/api/computador_ips/${id}/delete/`,
  restore:    (id) => `/api/computador_ips/${id}/restore/`,
  hardDelete: (id) => `/api/computador_ips/${id}/hard-delete/`,
  history:    (id) => `/api/computador_ips/${id}/history/`,
};

const formatFieldName = (field) => {
  const fieldNames = {
    nombre: 'Nombre',
    ip: 'IP',
    puerto: 'Puerto',
    protocolo: 'Protocolo',
    descripcion: 'Descripción',
    activo: 'Activo',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
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
  let htmlMessage = `<p style="margin-bottom: 12px;">${mainMessage}</p>`;

  if (typeof response === 'object' && !response.error && !response.detail) {
    const errorEntries = Object.entries(response);
    if (errorEntries.length > 0) {
      htmlMessage = '<div style="text-align: left; background: #fff3f3; padding: 12px; border-radius: 8px;">';
      htmlMessage += '<ul style="margin: 0; padding-left: 20px; color: #d32f2f;">';
      errorEntries.forEach(([field, messages]) => {
        const fieldName = formatFieldName(field);
        const errorMessages = Array.isArray(messages) ? messages : [messages];
        errorMessages.forEach((msg) => {
          htmlMessage += `<li style="margin-bottom: 4px;"><strong>${fieldName}:</strong> ${msg}</li>`;
        });
      });
      htmlMessage += '</ul></div>';
    }
  }

  return { title, message: mainMessage, htmlMessage };
};

/**
 * Listar IPs del conmutador con paginación y filtros del servidor.
 * Params: page, page_size, search, protocolo, activo (1/0), start_date, end_date,
 * ordering, include_deleted.
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().conmutadorIpsStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = { ...params, page, page_size: pageSize };
      const response = await api.get(API_URLS.list, { params: queryParams });

      const { count, next, previous, results } = response.data;

      dispatch(setIps(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Obtener una IP por ID y abrir el modal en modo edición.
 */
export const showThunk = (ipId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando IP...'));
      const response = await api.get(API_URLS.detail(ipId));
      dispatch(hideBackdrop());
      dispatch(openEditModal(response.data));
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Crear una nueva IP en el conmutador.
 */
export const createThunk = (data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando IP...'));

      const cleanData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡IP registrada!',
        'La IP ha sido registrada correctamente en el conmutador.',
        { timer: 3000 }
      );
      return response.data;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Actualizar una IP existente.
 */
export const updateThunk = (ipId, data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando IP...'));

      // Para update mantenemos null/'' para permitir limpiar campos opcionales,
      // excepto el id (no se envía).
      const cleanData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(ipId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡IP actualizada!',
        'Los datos de la IP han sido actualizados correctamente.',
        { timer: 3000 }
      );
      return response.data;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Guardar (crea o actualiza según si tiene id).
 */
export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    }
    return dispatch(createThunk(formData));
  };
};

/**
 * Eliminar (soft delete) una IP.
 */
export const deleteThunk = (ip) => {
  return async (dispatch) => {
    try {
      const label = `IP ${ip.nombre || ''} (${ip.ip || `#${ip.id}`})`;
      const result = await AlertService.confirmDelete(label);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando IP...'));
      await api.delete(API_URLS.delete(ip.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡IP eliminada!',
        `La <strong>${label}</strong> ha sido eliminada correctamente.`,
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
 * Restaurar una IP eliminada.
 */
export const restoreThunk = (ip) => {
  return async (dispatch) => {
    try {
      const label = `IP ${ip.nombre || ''} (${ip.ip || `#${ip.id}`})`;
      const result = await AlertService.confirm(
        '¿Restaurar IP?',
        `¿Está seguro que desea restaurar la <strong>${label}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando IP...'));
      await api.post(API_URLS.restore(ip.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡IP restaurada!',
        `La <strong>${label}</strong> ha sido restaurada correctamente.`,
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
 * Eliminar permanentemente una IP.
 */
export const hardDeleteThunk = (ip) => {
  return async (dispatch) => {
    try {
      const label = `IP ${ip.nombre || ''} (${ip.ip || `#${ip.id}`})`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la <strong>${label}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(ip.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡IP eliminada permanentemente!',
        `La <strong>${label}</strong> ha sido eliminada permanentemente.`,
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
 * Ver detalles (read-only) de una IP.
 */
export const viewThunk = (ip) => {
  return async () => {
    const fmt = (v) => (v === null || v === undefined || v === '' ? '-' : v);
    const fechaFormateada = ip.created_at
      ? new Date(ip.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
      : '-';

    await AlertService.info(
      `IP #${ip.id} - ${ip.nombre || ''}`,
      `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${fmt(ip.nombre)}</p>
          <p><strong>URL:</strong> <code>${fmt(ip.url)}</code></p>
          <p><strong>IP:</strong> <code>${fmt(ip.ip)}</code></p>
          <p><strong>Puerto:</strong> ${fmt(ip.puerto)}</p>
          <p><strong>Protocolo:</strong> ${(ip.protocolo || '').toUpperCase() || '-'}</p>
          <p><strong>Estado:</strong> ${ip.activo ? '<span style="color:#2e7d32">Activa</span>' : '<span style="color:#757575">Inactiva</span>'}</p>
          <p><strong>Descripción:</strong> ${fmt(ip.descripcion)}</p>
          <p><strong>Registrada por:</strong> ${fmt(ip.user_name)}</p>
          <p><strong>Fecha de creación:</strong> ${fechaFormateada}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios.
 */
export const getHistoryThunk = (ipId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(ipId));
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
