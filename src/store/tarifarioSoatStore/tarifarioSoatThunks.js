import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setTarifarios,
  setPagination,
  closeModal,
  openEditModal,
  setHistory,
} from './tarifarioSoatStore';

// URLs del módulo de tarifario SOAT
const API_URLS = {
  list: '/api/tarifario_soat/list/',
  detail: (id) => `/api/tarifario_soat/${id}/`,
  create: '/api/tarifario_soat/create/',
  update: (id) => `/api/tarifario_soat/${id}/update/`,
  delete: (id) => `/api/tarifario_soat/${id}/delete/`,
  restore: (id) => `/api/tarifario_soat/${id}/restore/`,
  hardDelete: (id) => `/api/tarifario_soat/${id}/hard-delete/`,
  history: (id) => `/api/tarifario_soat/${id}/history/`,
};

/**
 * Extrae y formatea los errores de la respuesta de la API (formato DRF)
 */
const extractApiError = (error) => {
  const response = error.response?.data;
  const status = error.response?.status;

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

  if (!response) {
    return {
      title: 'Error de conexión',
      message: error.message || 'No se pudo conectar al servidor',
      htmlMessage: `<p>${error.message || 'No se pudo conectar al servidor. Verifique su conexión a internet.'}</p>`,
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

  return {
    title,
    message: mainMessage,
    htmlMessage,
  };
};

/**
 * Formatea el nombre del campo para mostrar
 */
const formatFieldName = (field) => {
  const fieldNames = {
    codigo_tarifa: 'Código tarifa',
    descripcion: 'Descripción',
    valor: 'Valor',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Formatear valor como moneda colombiana
 */
const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Obtener todos los tarifarios SOAT con paginación
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().tarifarioSoatStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });

      const { count, next, previous, results } = response.data;

      dispatch(setTarifarios(results));
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
 * Obtener un tarifario SOAT por ID
 */
export const showThunk = (tarifarioId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando tarifario...'));

      const response = await api.get(API_URLS.detail(tarifarioId));

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
 * Crear un nuevo tarifario SOAT
 */
export const createThunk = (tarifarioData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando tarifario...'));

      const cleanData = {};
      Object.entries(tarifarioData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarifario creado!',
        'El nuevo tarifario SOAT ha sido registrado correctamente.',
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
 * Actualizar un tarifario SOAT existente
 */
export const updateThunk = (tarifarioId, tarifarioData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando tarifario...'));

      const cleanData = {};
      Object.entries(tarifarioData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(tarifarioId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarifario actualizado!',
        'Los datos del tarifario SOAT han sido actualizados correctamente.',
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
 * Eliminar un tarifario SOAT (soft delete)
 */
export const deleteThunk = (tarifario) => {
  return async (dispatch) => {
    try {
      const tarifarioName = `Tarifario #${tarifario.id} - ${tarifario.codigo_tarifa}`;
      const result = await AlertService.confirmDelete(tarifarioName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando tarifario...'));

      await api.delete(API_URLS.delete(tarifario.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarifario eliminado!',
        'El tarifario SOAT ha sido eliminado correctamente.',
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
 * Restaurar un tarifario SOAT eliminado
 */
export const restoreThunk = (tarifario) => {
  return async (dispatch) => {
    try {
      const tarifarioName = `Tarifario #${tarifario.id} - ${tarifario.codigo_tarifa}`;
      const result = await AlertService.confirm(
        '¿Restaurar tarifario?',
        `¿Está seguro que desea restaurar el <strong>${tarifarioName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando tarifario...'));

      await api.post(API_URLS.restore(tarifario.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarifario restaurado!',
        'El tarifario SOAT ha sido restaurado correctamente.',
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
 * Eliminar permanentemente un tarifario SOAT
 */
export const hardDeleteThunk = (tarifario) => {
  return async (dispatch) => {
    try {
      const tarifarioName = `Tarifario #${tarifario.id} - ${tarifario.codigo_tarifa}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${tarifarioName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(tarifario.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarifario eliminado permanentemente!',
        'El tarifario SOAT ha sido eliminado permanentemente.',
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
 * Guardar tarifario SOAT (crear o actualizar según si tiene ID)
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
 * Ver detalles de un tarifario SOAT
 */
export const viewThunk = (tarifario) => {
  return async () => {
    await AlertService.info(
      `Tarifario #${tarifario.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Código tarifa:</strong> ${tarifario.codigo_tarifa || '-'}</p>
          <p><strong>Descripción:</strong> ${tarifario.descripcion || '-'}</p>
          <p><strong>Valor:</strong> ${formatCurrency(tarifario.valor)}</p>
          <p><strong>Registrado por:</strong> ${tarifario.user?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${tarifario.created_at ? new Date(tarifario.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un tarifario SOAT
 */
export const getHistoryThunk = (tarifarioId, params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const { historyPagination } = getState().tarifarioSoatStore;
      const page = params.page || historyPagination.page;
      const pageSize = params.page_size || historyPagination.pageSize;

      const response = await api.get(API_URLS.history(tarifarioId), {
        params: { page, page_size: pageSize },
      });

      const { count, results } = response.data;

      dispatch(setHistory({
        history_data: results || [],
        count,
        page,
        pageSize,
      }));

      dispatch(hideBackdrop());

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};
