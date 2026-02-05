import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setAjustesSaldo,
  setClientes,
  setPagination,
  closeModal,
  openEditModal,
} from './ajusteSaldoStore';

// URLs del módulo de ajustes de saldo
const API_URLS = {
  list: '/api/ajuste_de_saldo/list/',
  detail: (id) => `/api/ajuste_de_saldo/${id}/`,
  create: '/api/ajuste_de_saldo/create/',
  update: (id) => `/api/ajuste_de_saldo/${id}/update/`,
  delete: (id) => `/api/ajuste_de_saldo/${id}/delete/`,
  restore: (id) => `/api/ajuste_de_saldo/${id}/restore/`,
  hardDelete: (id) => `/api/ajuste_de_saldo/${id}/hard-delete/`,
  history: (id) => `/api/ajuste_de_saldo/${id}/history/`,
  // URLs auxiliares para cargar datos de selects
  clientes: '/api/clientes/list/',
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
    valor: 'Valor',
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
 * Obtener todos los ajustes de saldo con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering, cliente)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().ajusteSaldoStore;
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

      dispatch(setAjustesSaldo(results));
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
 * Cargar datos auxiliares (clientes) para los formularios
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadClientesThunk());
  };
};

/**
 * Obtener un ajuste de saldo por ID
 */
export const showThunk = (ajusteId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando ajuste de saldo...'));

      const response = await api.get(API_URLS.detail(ajusteId));

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
 * Crear un nuevo ajuste de saldo
 */
export const createThunk = (ajusteData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando ajuste de saldo...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(ajusteData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Ajuste de saldo creado!',
        'El nuevo ajuste de saldo ha sido registrado correctamente.',
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
 * Actualizar un ajuste de saldo existente
 */
export const updateThunk = (ajusteId, ajusteData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando ajuste de saldo...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(ajusteData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(ajusteId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Ajuste de saldo actualizado!',
        'Los datos del ajuste de saldo han sido actualizados correctamente.',
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
 * Eliminar un ajuste de saldo (soft delete)
 */
export const deleteThunk = (ajuste) => {
  return async (dispatch) => {
    try {
      const ajusteName = `Ajuste #${ajuste.id} - ${ajuste.cliente?.nombre || 'Cliente'}`;
      const result = await AlertService.confirmDelete(ajusteName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando ajuste de saldo...'));

      await api.delete(API_URLS.delete(ajuste.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Ajuste de saldo eliminado!',
        'El ajuste de saldo ha sido eliminado correctamente.',
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
 * Restaurar un ajuste de saldo eliminado
 */
export const restoreThunk = (ajuste) => {
  return async (dispatch) => {
    try {
      const ajusteName = `Ajuste #${ajuste.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar ajuste de saldo?',
        `¿Está seguro que desea restaurar el <strong>${ajusteName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando ajuste de saldo...'));

      await api.post(API_URLS.restore(ajuste.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Ajuste de saldo restaurado!',
        'El ajuste de saldo ha sido restaurado correctamente.',
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
 * Eliminar permanentemente un ajuste de saldo
 */
export const hardDeleteThunk = (ajuste) => {
  return async (dispatch) => {
    try {
      const ajusteName = `Ajuste #${ajuste.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${ajusteName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(ajuste.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Ajuste eliminado permanentemente!',
        'El ajuste de saldo ha sido eliminado permanentemente.',
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
 * Guardar ajuste de saldo (crear o actualizar según si tiene ID)
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
 * Ver detalles de un ajuste de saldo
 */
export const viewThunk = (ajuste) => {
  return async () => {
    const fechaFormateada = ajuste.fecha
      ? new Date(ajuste.fecha).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    await AlertService.info(
      `Ajuste de Saldo #${ajuste.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Cliente:</strong> ${ajuste.cliente?.nombre || '-'}</p>
          <p><strong>Valor:</strong> ${formatCurrency(ajuste.valor)}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p><strong>Observación:</strong> ${ajuste.observacion || '-'}</p>
          <p><strong>Registrado por:</strong> ${ajuste.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${ajuste.created_at ? new Date(ajuste.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un ajuste de saldo
 */
export const getHistoryThunk = (ajusteId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(ajusteId));

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
