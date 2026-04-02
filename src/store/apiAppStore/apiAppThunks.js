import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setEndpoints,
  setPagination,
  closeModal,
  openEditModal,
} from './apiAppStore';

// URLs del módulo api_app
const API_URLS = {
  list: '/api/api_app/endpoints/list/',
  detail: (id) => `/api/api_app/endpoints/${id}/`,
  create: '/api/api_app/endpoints/create/',
  update: (id) => `/api/api_app/endpoints/${id}/update/`,
  delete: (id) => `/api/api_app/endpoints/${id}/delete/`,
  restore: (id) => `/api/api_app/endpoints/${id}/restore/`,
  hardDelete: (id) => `/api/api_app/endpoints/${id}/hard-delete/`,
  history: (id) => `/api/api_app/endpoints/${id}/history/`,
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
    default: title = 'Error';
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
        const name = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
        const msgs = Array.isArray(messages) ? messages : [messages];
        msgs.forEach((msg) => {
          htmlMessage += `<li style="margin-bottom: 4px;"><strong>${name}:</strong> ${msg}</li>`;
        });
      });
      htmlMessage += '</ul></div>';
    }
  }

  return { title, message: mainMessage, htmlMessage };
};

export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().apiAppStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = { ...params, page, page_size: pageSize };
      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setEndpoints(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));

    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

export const showThunk = (endpointId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando endpoint...'));
      const response = await api.get(API_URLS.detail(endpointId));
      dispatch(hideBackdrop());
      dispatch(openEditModal(response.data));
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
    }
  };
};

export const createThunk = (data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando endpoint...'));

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

      await AlertService.success('¡Endpoint creado!', 'El endpoint ha sido registrado correctamente.', { timer: 3000 });
      return response.data;

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

export const updateThunk = (endpointId, data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando endpoint...'));

      const cleanData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(endpointId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success('¡Endpoint actualizado!', 'Los datos han sido actualizados correctamente.', { timer: 3000 });
      return response.data;

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

export const deleteThunk = (endpoint) => {
  return async (dispatch) => {
    try {
      const name = `${endpoint.nombre} (${endpoint.codigo})`;
      const result = await AlertService.confirmDelete(name);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando endpoint...'));
      await api.delete(API_URLS.delete(endpoint.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success('¡Endpoint eliminado!', 'El endpoint ha sido eliminado correctamente.', { timer: 3000 });
      return true;

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return false;
    }
  };
};

export const restoreThunk = (endpoint) => {
  return async (dispatch) => {
    try {
      const result = await AlertService.confirm(
        '¿Restaurar endpoint?',
        `¿Está seguro que desea restaurar <strong>${endpoint.nombre}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando endpoint...'));
      await api.post(API_URLS.restore(endpoint.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success('¡Endpoint restaurado!', 'El endpoint ha sido restaurado correctamente.', { timer: 3000 });
      return true;

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return false;
    }
  };
};

export const hardDeleteThunk = (endpoint) => {
  return async (dispatch) => {
    try {
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Eliminar permanentemente <strong>${endpoint.nombre}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(endpoint.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success('¡Eliminado permanentemente!', 'El endpoint ha sido eliminado permanentemente.', { timer: 3000 });
      return true;

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return false;
    }
  };
};

export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    } else {
      return dispatch(createThunk(formData));
    }
  };
};

export const viewThunk = (endpoint) => {
  return async () => {
    const createdAt = endpoint.created_at
      ? new Date(endpoint.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
      : '-';

    await AlertService.info(
      `${endpoint.nombre}`,
      `
        <div style="text-align: left;">
          <p><strong>Código:</strong> <code>${endpoint.codigo || '-'}</code></p>
          <p><strong>URL Base:</strong> <code style="word-break: break-all;">${endpoint.url_base || '-'}</code></p>
          <p><strong>Método:</strong> ${endpoint.metodo_http || '-'}</p>
          <p><strong>Activo:</strong> ${endpoint.activo ? 'Sí' : 'No'}</p>
          <p><strong>Timeout:</strong> ${endpoint.timeout || 30}s</p>
          <p><strong>Descripción:</strong> ${endpoint.descripcion || '-'}</p>
          <hr style="margin: 12px 0; border-color: #eee;" />
          <p><strong>Fecha de creación:</strong> ${createdAt}</p>
        </div>
      `
    );
  };
};

export const getHistoryThunk = (endpointId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(endpointId));
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
