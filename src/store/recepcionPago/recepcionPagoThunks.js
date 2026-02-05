import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setRecepcionesPago,
  setClientes,
  setTarjetas,
  setPagination,
  closeModal,
  openEditModal,
} from './recepcionPagoStore';

// URLs del módulo de recepción de pagos
const API_URLS = {
  list: '/api/recepcion_pago/list/',
  detail: (id) => `/api/recepcion_pago/${id}/`,
  create: '/api/recepcion_pago/create/',
  update: (id) => `/api/recepcion_pago/${id}/update/`,
  delete: (id) => `/api/recepcion_pago/${id}/delete/`,
  restore: (id) => `/api/recepcion_pago/${id}/restore/`,
  hardDelete: (id) => `/api/recepcion_pago/${id}/hard-delete/`,
  history: (id) => `/api/recepcion_pago/${id}/history/`,
  // URLs auxiliares para cargar datos de selects
  clientes: '/api/clientes/list/',
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
    cliente: 'Cliente',
    tarjeta: 'Tarjeta',
    valor: 'Valor',
    observacion: 'Observación',
    fecha: 'Fecha',
    cuatro_por_mil: '4x1000',
    total: 'Total',
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
 * Obtener todas las recepciones de pago con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering, cliente, tarjeta)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().recepcionPagoStore;
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

      dispatch(setRecepcionesPago(results));
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
 * Cargar clientes para el select del formulario
 */
export const loadClientesThunk = () => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.clientes, { params: { page_size: 1000 } });
      const clientes = response.data.results || response.data;
      dispatch(setClientes(clientes));
    } catch (error) {
      console.error('Error cargando clientes:', error);
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
 * Cargar datos auxiliares (clientes y tarjetas) para los formularios
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadClientesThunk());
    dispatch(loadTarjetasThunk());
  };
};

/**
 * Obtener una recepción de pago por ID
 */
export const showThunk = (recepcionPagoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando recepción de pago...'));

      const response = await api.get(API_URLS.detail(recepcionPagoId));

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
 * Crear una nueva recepción de pago
 */
export const createThunk = (recepcionPagoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando recepción de pago...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(recepcionPagoData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Recepción de pago creada!',
        'La nueva recepción de pago ha sido registrada correctamente.',
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
 * Actualizar una recepción de pago existente
 */
export const updateThunk = (recepcionPagoId, recepcionPagoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando recepción de pago...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(recepcionPagoData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(recepcionPagoId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Recepción de pago actualizada!',
        'Los datos de la recepción de pago han sido actualizados correctamente.',
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
 * Eliminar una recepción de pago (soft delete)
 */
export const deleteThunk = (recepcionPago) => {
  return async (dispatch) => {
    try {
      const recepcionName = `Recepción #${recepcionPago.id} - ${recepcionPago.cliente?.nombre || 'Cliente'}`;
      const result = await AlertService.confirmDelete(recepcionName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando recepción de pago...'));

      await api.delete(API_URLS.delete(recepcionPago.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Recepción de pago eliminada!',
        `La recepción de pago ha sido eliminada correctamente.`,
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
 * Restaurar una recepción de pago eliminada
 */
export const restoreThunk = (recepcionPago) => {
  return async (dispatch) => {
    try {
      const recepcionName = `Recepción #${recepcionPago.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar recepción de pago?',
        `¿Está seguro que desea restaurar la <strong>${recepcionName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando recepción de pago...'));

      await api.post(API_URLS.restore(recepcionPago.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Recepción de pago restaurada!',
        `La recepción de pago ha sido restaurada correctamente.`,
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
 * Eliminar permanentemente una recepción de pago
 */
export const hardDeleteThunk = (recepcionPago) => {
  return async (dispatch) => {
    try {
      const recepcionName = `Recepción #${recepcionPago.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la <strong>${recepcionName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(recepcionPago.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Recepción de pago eliminada permanentemente!',
        `La recepción de pago ha sido eliminada permanentemente.`,
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
 * Guardar recepción de pago (crear o actualizar según si tiene ID)
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
 * Ver detalles de una recepción de pago
 */
export const viewThunk = (recepcionPago) => {
  return async () => {
    const fechaFormateada = recepcionPago.fecha
      ? new Date(recepcionPago.fecha).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    const tarjetaNumero = recepcionPago.tarjeta?.numero;

    await AlertService.info(
      `Recepción de Pago #${recepcionPago.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Cliente:</strong> ${recepcionPago.cliente?.nombre || '-'}</p>
          <p><strong>Tarjeta:</strong> ${tarjetaNumero ? `**** ${tarjetaNumero.slice(-4)}` : '-'}</p>
          <p><strong>Valor:</strong> ${formatCurrency(recepcionPago.valor)}</p>
          <p><strong>4x1000:</strong> ${formatCurrency(recepcionPago.cuatro_por_mil)}</p>
          <p><strong>Total:</strong> ${formatCurrency(recepcionPago.total)}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p><strong>Observación:</strong> ${recepcionPago.observacion || '-'}</p>
          <p><strong>Registrado por:</strong> ${recepcionPago.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${recepcionPago.created_at ? new Date(recepcionPago.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de una recepción de pago
 */
export const getHistoryThunk = (recepcionPagoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(recepcionPagoId));

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
