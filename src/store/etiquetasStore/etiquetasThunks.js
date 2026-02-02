import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setEtiquetas,
  setPagination,
  closeModal,
  openEditModal,
} from './etiquetasStore';

// URLs del módulo de etiquetas
const API_URLS = {
  list: '/api/etiquetas/list/',
  detail: (id) => `/api/etiquetas/${id}/`,
  create: '/api/etiquetas/create/',
  update: (id) => `/api/etiquetas/${id}/update/`,
  delete: (id) => `/api/etiquetas/${id}/delete/`,
  restore: (id) => `/api/etiquetas/${id}/restore/`,
  hardDelete: (id) => `/api/etiquetas/${id}/hard-delete/`,
  history: (id) => `/api/etiquetas/${id}/history/`,
};

/**
 * Extrae y formatea los errores de la respuesta de la API (formato DRF)
 * @param {Error} error - Error de axios
 * @returns {Object} { title, message, htmlMessage }
 */
const extractApiError = (error) => {
  const response = error.response?.data;
  const status = error.response?.status;

  // Título según el código de estado
  let title = 'Error';
  switch (status) {
    case 400:
      title = 'Error de validación';
      break;
    case 401:
      title = 'No autorizado';
      break;
    case 403:
      title = 'Acceso denegado';
      break;
    case 404:
      title = 'No encontrado';
      break;
    case 500:
      title = 'Error del servidor';
      break;
    default:
      title = 'Error';
  }

  // Si no hay respuesta del servidor (error de red)
  if (!response) {
    return {
      title: 'Error de conexión',
      message: error.message || 'No se pudo conectar al servidor',
      htmlMessage: `<p>${error.message || 'No se pudo conectar al servidor. Verifique su conexión a internet.'}</p>`,
    };
  }

  // Mensaje principal - DRF puede devolver 'error', 'detail' o errores de campo directamente
  const mainMessage = response.error || response.detail || 'Ha ocurrido un error';

  // Construir HTML con errores detallados
  let htmlMessage = `<p style="margin-bottom: 12px;">${mainMessage}</p>`;

  // Si hay errores de campo (validación DRF devuelve los campos directamente)
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

  return {
    title,
    message: mainMessage,
    htmlMessage,
  };
};

/**
 * Formatea el nombre del campo para mostrar
 * @param {string} field - Nombre del campo
 * @returns {string} Nombre formateado
 */
const formatFieldName = (field) => {
  const fieldNames = {
    nombre: 'Nombre',
    color: 'Color',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todas las etiquetas con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().etiquetasStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });

      // DRF PageNumberPagination devuelve: { count, next, previous, results }
      const { count, next, previous, results } = response.data;

      dispatch(setEtiquetas(results));
      dispatch(setPagination({
        count,
        next,
        previous,
        page,
        pageSize,
      }));

    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Obtener una etiqueta por ID
 */
export const showThunk = (etiquetaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando etiqueta...'));

      const response = await api.get(API_URLS.detail(etiquetaId));

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
 * Crear una nueva etiqueta
 */
export const createThunk = (etiquetaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando etiqueta...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(etiquetaData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Etiqueta creada!',
        'La nueva etiqueta ha sido creada correctamente.',
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
 * Actualizar una etiqueta existente
 */
export const updateThunk = (etiquetaId, etiquetaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando etiqueta...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(etiquetaData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(etiquetaId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Etiqueta actualizada!',
        'Los datos de la etiqueta han sido actualizados correctamente.',
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
 * Eliminar una etiqueta (soft delete)
 */
export const deleteThunk = (etiqueta) => {
  return async (dispatch) => {
    try {
      const etiquetaName = etiqueta.nombre || 'Etiqueta';
      const result = await AlertService.confirmDelete(etiquetaName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando etiqueta...'));

      await api.delete(API_URLS.delete(etiqueta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Etiqueta eliminada!',
        `La etiqueta <strong>${etiquetaName}</strong> ha sido eliminada correctamente.`,
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
 * Restaurar una etiqueta eliminada
 */
export const restoreThunk = (etiqueta) => {
  return async (dispatch) => {
    try {
      const etiquetaName = etiqueta.nombre || 'Etiqueta';
      const result = await AlertService.confirm(
        '¿Restaurar etiqueta?',
        `¿Está seguro que desea restaurar la etiqueta <strong>${etiquetaName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando etiqueta...'));

      await api.post(API_URLS.restore(etiqueta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Etiqueta restaurada!',
        `La etiqueta <strong>${etiquetaName}</strong> ha sido restaurada correctamente.`,
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
 * Eliminar permanentemente una etiqueta
 */
export const hardDeleteThunk = (etiqueta) => {
  return async (dispatch) => {
    try {
      const etiquetaName = etiqueta.nombre || 'Etiqueta';
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la etiqueta <strong>${etiquetaName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(etiqueta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Etiqueta eliminada permanentemente!',
        `La etiqueta <strong>${etiquetaName}</strong> ha sido eliminada permanentemente.`,
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
 * Guardar etiqueta (crear o actualizar según si tiene ID)
 */
export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    } else {
      return dispatch(createThunk(formData));
    }
  };
};

/**
 * Ver detalles de una etiqueta
 */
export const viewThunk = (etiqueta) => {
  return async () => {
    await AlertService.info(
      etiqueta.nombre || 'Etiqueta',
      `
        <div style="text-align: left;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="width: 24px; height: 24px; border-radius: 4px; background-color: ${etiqueta.color || '#1976d2'};"></div>
            <strong>Color:</strong> ${etiqueta.color || '#1976d2'}
          </div>
          <p><strong>Creado por:</strong> ${etiqueta.user_name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${etiqueta.created_at ? new Date(etiqueta.created_at).toLocaleString('es-ES') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de una etiqueta
 */
export const getHistoryThunk = (etiquetaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(etiquetaId));

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
