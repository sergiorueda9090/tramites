import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setGastosMain,
  setPagination,
  closeModal,
  openEditModal,
} from './gastosMainStore';

// URLs del módulo de categorías de gasto
const API_URLS = {
  list: '/api/gastos/list/',
  detail: (id) => `/api/gastos/${id}/`,
  create: '/api/gastos/create/',
  update: (id) => `/api/gastos/${id}/update/`,
  delete: (id) => `/api/gastos/${id}/delete/`,
  restore: (id) => `/api/gastos/${id}/restore/`,
  hardDelete: (id) => `/api/gastos/${id}/hard-delete/`,
  history: (id) => `/api/gastos/${id}/history/`,
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
    descripcion: 'Descripción',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todas las categorías de gasto con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().gastosMainStore;
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

      dispatch(setGastosMain(results));
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
 * Obtener una categoría de gasto por ID
 */
export const showThunk = (gastoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando categoría de gasto...'));

      const response = await api.get(API_URLS.detail(gastoId));

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
 * Crear una nueva categoría de gasto
 */
export const createThunk = (gastoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando categoría de gasto...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(gastoData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Categoría de gasto creada!',
        'La nueva categoría de gasto ha sido registrada correctamente.',
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
 * Actualizar una categoría de gasto existente
 */
export const updateThunk = (gastoId, gastoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando categoría de gasto...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(gastoData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(gastoId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Categoría de gasto actualizada!',
        'Los datos de la categoría de gasto han sido actualizados correctamente.',
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
 * Eliminar una categoría de gasto (soft delete)
 */
export const deleteThunk = (gasto) => {
  return async (dispatch) => {
    try {
      const gastoName = gasto.nombre || `Categoría #${gasto.id}`;
      const result = await AlertService.confirmDelete(gastoName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando categoría de gasto...'));

      await api.delete(API_URLS.delete(gasto.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Categoría de gasto eliminada!',
        'La categoría de gasto ha sido eliminada correctamente.',
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
 * Restaurar una categoría de gasto eliminada
 */
export const restoreThunk = (gasto) => {
  return async (dispatch) => {
    try {
      const gastoName = gasto.nombre || `Categoría #${gasto.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar categoría de gasto?',
        `¿Está seguro que desea restaurar <strong>${gastoName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando categoría de gasto...'));

      await api.post(API_URLS.restore(gasto.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Categoría de gasto restaurada!',
        'La categoría de gasto ha sido restaurada correctamente.',
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
 * Eliminar permanentemente una categoría de gasto
 */
export const hardDeleteThunk = (gasto) => {
  return async (dispatch) => {
    try {
      const gastoName = gasto.nombre || `Categoría #${gasto.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente <strong>${gastoName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(gasto.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Categoría eliminada permanentemente!',
        'La categoría de gasto ha sido eliminada permanentemente.',
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
 * Guardar categoría de gasto (crear o actualizar según si tiene ID)
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
 * Ver detalles de una categoría de gasto
 */
export const viewThunk = (gasto) => {
  return async () => {
    await AlertService.info(
      `Categoría de Gasto #${gasto.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${gasto.nombre || '-'}</p>
          <p><strong>Descripción:</strong> ${gasto.descripcion || '-'}</p>
          <p><strong>Creado por:</strong> ${gasto.user?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${gasto.created_at ? new Date(gasto.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de una categoría de gasto
 */
export const getHistoryThunk = (gastoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(gastoId));

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
