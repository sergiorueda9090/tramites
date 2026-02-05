import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setGastosRelaciones,
  setGastos,
  setTarjetas,
  setPagination,
  closeModal,
  openEditModal,
} from './gastosStore';

// URLs del módulo de gastos (relaciones)
const API_URLS = {
  list: '/api/gastos/relaciones/list/',
  detail: (id) => `/api/gastos/relaciones/${id}/`,
  create: '/api/gastos/relaciones/create/',
  update: (id) => `/api/gastos/relaciones/${id}/update/`,
  delete: (id) => `/api/gastos/relaciones/${id}/delete/`,
  restore: (id) => `/api/gastos/relaciones/${id}/restore/`,
  hardDelete: (id) => `/api/gastos/relaciones/${id}/hard-delete/`,
  history: (id) => `/api/gastos/relaciones/${id}/history/`,
  // URLs auxiliares para cargar datos de selects
  gastos: '/api/gastos/list/',
  tarjetas: '/api/tarjetas/list/',
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
    gasto: 'Gasto',
    tarjeta: 'Tarjeta',
    valor: 'Valor',
    cuatro_por_mil: '4x1000',
    total: 'Total',
    observacion: 'Observación',
    fecha: 'Fecha',
    usuario: 'Usuario',
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
 * Obtener todas las relaciones de gasto con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering, gasto, tarjeta)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().gastosStore;
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

      dispatch(setGastosRelaciones(results));
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
 * Cargar categorías de gasto para el select del formulario
 */
export const loadGastosThunk = () => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.gastos, { params: { page_size: 1000 } });
      const gastos = response.data.results || response.data;
      dispatch(setGastos(gastos));
    } catch (error) {
      console.error('Error cargando gastos:', error);
    }
  };
};

/**
 * Cargar tarjetas para el select del formulario
 */
export const loadTarjetasThunk = () => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.tarjetas, { params: { page_size: 1000 } });
      const tarjetas = response.data.results || response.data;
      dispatch(setTarjetas(tarjetas));
    } catch (error) {
      console.error('Error cargando tarjetas:', error);
    }
  };
};

/**
 * Cargar datos auxiliares (gastos y tarjetas) para los formularios
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadGastosThunk());
    dispatch(loadTarjetasThunk());
  };
};

/**
 * Obtener una relación de gasto por ID
 */
export const showThunk = (relacionId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando gasto...'));

      const response = await api.get(API_URLS.detail(relacionId));

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
 * Crear una nueva relación de gasto
 */
export const createThunk = (relacionData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando gasto...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(relacionData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Gasto creado!',
        'El nuevo gasto ha sido registrado correctamente.',
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
 * Actualizar una relación de gasto existente
 */
export const updateThunk = (relacionId, relacionData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando gasto...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(relacionData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(relacionId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Gasto actualizado!',
        'Los datos del gasto han sido actualizados correctamente.',
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
 * Eliminar una relación de gasto (soft delete)
 */
export const deleteThunk = (relacion) => {
  return async (dispatch) => {
    try {
      const relacionName = `Gasto #${relacion.id} - ${relacion.gasto?.nombre || 'Gasto'}`;
      const result = await AlertService.confirmDelete(relacionName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando gasto...'));

      await api.delete(API_URLS.delete(relacion.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Gasto eliminado!',
        'El gasto ha sido eliminado correctamente.',
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
 * Restaurar una relación de gasto eliminada
 */
export const restoreThunk = (relacion) => {
  return async (dispatch) => {
    try {
      const relacionName = `Gasto #${relacion.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar gasto?',
        `¿Está seguro que desea restaurar el <strong>${relacionName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando gasto...'));

      await api.post(API_URLS.restore(relacion.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Gasto restaurado!',
        'El gasto ha sido restaurado correctamente.',
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
 * Eliminar permanentemente una relación de gasto
 */
export const hardDeleteThunk = (relacion) => {
  return async (dispatch) => {
    try {
      const relacionName = `Gasto #${relacion.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${relacionName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(relacion.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Gasto eliminado permanentemente!',
        'El gasto ha sido eliminado permanentemente.',
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
 * Guardar relación de gasto (crear o actualizar según si tiene ID)
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
 * Ver detalles de una relación de gasto
 */
export const viewThunk = (relacion) => {
  return async () => {
    const fechaFormateada = relacion.fecha
      ? new Date(relacion.fecha).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    const tarjetaInfo = relacion.tarjeta
      ? `**** ${(relacion.tarjeta.numero || '').slice(-4)} - ${relacion.tarjeta.titular || ''}`
      : '-';

    await AlertService.info(
      `Gasto #${relacion.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Categoría:</strong> ${relacion.gasto?.nombre || '-'}</p>
          <p><strong>Tarjeta:</strong> ${tarjetaInfo}</p>
          <p><strong>Valor:</strong> ${formatCurrency(relacion.valor)}</p>
          <p><strong>4x1000:</strong> ${formatCurrency(relacion.cuatro_por_mil)}</p>
          <p><strong>Total:</strong> ${formatCurrency(relacion.total)}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p><strong>Observación:</strong> ${relacion.observacion || '-'}</p>
          <p><strong>Registrado por:</strong> ${relacion.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${relacion.created_at ? new Date(relacion.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de una relación de gasto
 */
export const getHistoryThunk = (relacionId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(relacionId));

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
