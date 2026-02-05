import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setTarjetas,
  setPagination,
  closeModal,
  openEditModal,
} from './tarjetasStore';

// URLs del módulo de tarjetas
const API_URLS = {
  list: '/api/tarjetas/list/',
  detail: (id) => `/api/tarjetas/${id}/`,
  create: '/api/tarjetas/create/',
  update: (id) => `/api/tarjetas/${id}/update/`,
  delete: (id) => `/api/tarjetas/${id}/delete/`,
  restore: (id) => `/api/tarjetas/${id}/restore/`,
  hardDelete: (id) => `/api/tarjetas/${id}/hard-delete/`,
  history: (id) => `/api/tarjetas/${id}/history/`,
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
    numero: 'Número de tarjeta',
    titular: 'Titular',
    descripcion: 'Descripción',
    cuatro_por_mil: '4x1000',
    usuario: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todas las tarjetas con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering, cuatro_por_mil)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().tarjetasStore;
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

      dispatch(setTarjetas(results));
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
 * Obtener una tarjeta por ID
 */
export const showThunk = (tarjetaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando tarjeta...'));

      const response = await api.get(API_URLS.detail(tarjetaId));

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
 * Crear una nueva tarjeta
 */
export const createThunk = (tarjetaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando tarjeta...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(tarjetaData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarjeta creada!',
        'La nueva tarjeta ha sido creada correctamente.',
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
 * Actualizar una tarjeta existente
 */
export const updateThunk = (tarjetaId, tarjetaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando tarjeta...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(tarjetaData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(tarjetaId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarjeta actualizada!',
        'Los datos de la tarjeta han sido actualizados correctamente.',
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
 * Eliminar una tarjeta (soft delete)
 */
export const deleteThunk = (tarjeta) => {
  return async (dispatch) => {
    try {
      const tarjetaName = tarjeta.titular || `Tarjeta ${tarjeta.numero?.slice(-4) || ''}`;
      const result = await AlertService.confirmDelete(tarjetaName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando tarjeta...'));

      await api.delete(API_URLS.delete(tarjeta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarjeta eliminada!',
        `La tarjeta <strong>${tarjetaName}</strong> ha sido eliminada correctamente.`,
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
 * Restaurar una tarjeta eliminada
 */
export const restoreThunk = (tarjeta) => {
  return async (dispatch) => {
    try {
      const tarjetaName = tarjeta.titular || `Tarjeta ${tarjeta.numero?.slice(-4) || ''}`;
      const result = await AlertService.confirm(
        '¿Restaurar tarjeta?',
        `¿Está seguro que desea restaurar la tarjeta <strong>${tarjetaName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando tarjeta...'));

      await api.post(API_URLS.restore(tarjeta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarjeta restaurada!',
        `La tarjeta <strong>${tarjetaName}</strong> ha sido restaurada correctamente.`,
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
 * Eliminar permanentemente una tarjeta
 */
export const hardDeleteThunk = (tarjeta) => {
  return async (dispatch) => {
    try {
      const tarjetaName = tarjeta.titular || `Tarjeta ${tarjeta.numero?.slice(-4) || ''}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la tarjeta <strong>${tarjetaName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(tarjeta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Tarjeta eliminada permanentemente!',
        `La tarjeta <strong>${tarjetaName}</strong> ha sido eliminada permanentemente.`,
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
 * Guardar tarjeta (crear o actualizar según si tiene ID)
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
 * Ver detalles de una tarjeta
 */
export const viewThunk = (tarjeta) => {
  return async () => {
    const cuatroPorMilLabel = tarjeta.cuatro_por_mil === '1' ? 'Activo' : 'Exento';
    const numeroOculto = tarjeta.numero ? `**** **** **** ${tarjeta.numero.slice(-4)}` : '-';

    await AlertService.info(
      tarjeta.titular || 'Tarjeta',
      `
        <div style="text-align: left;">
          <p><strong>Número:</strong> ${numeroOculto}</p>
          <p><strong>Titular:</strong> ${tarjeta.titular || '-'}</p>
          <p><strong>Descripción:</strong> ${tarjeta.descripcion || '-'}</p>
          <p><strong>4x1000:</strong> ${cuatroPorMilLabel}</p>
          <p><strong>Usuario asociado:</strong> ${tarjeta.usuario_name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${tarjeta.created_at ? new Date(tarjeta.created_at).toLocaleString('es-ES') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de una tarjeta
 */
export const getHistoryThunk = (tarjetaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(tarjetaId));

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
