import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setClientes,
  setPagination,
  closeModal,
  openEditModal,
} from './clientesStore';

// URLs del módulo de clientes
const API_URLS = {
  list: '/api/clientes/list/',
  detail: (id) => `/api/clientes/${id}/`,
  create: '/api/clientes/create/',
  update: (id) => `/api/clientes/${id}/update/`,
  delete: (id) => `/api/clientes/${id}/delete/`,
  restore: (id) => `/api/clientes/${id}/restore/`,
  hardDelete: (id) => `/api/clientes/${id}/hard-delete/`,
  history: (id) => `/api/clientes/${id}/history/`,
  // Precios
  addPrecio: (id) => `/api/clientes/${id}/precios/add/`,
  listPrecios: (id) => `/api/clientes/${id}/precios/`,
  updatePrecio: (id, precioId) => `/api/clientes/${id}/precios/${precioId}/update/`,
  deletePrecio: (id, precioId) => `/api/clientes/${id}/precios/${precioId}/delete/`,
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
    telefono: 'Teléfono',
    direccion: 'Dirección',
    color: 'Color',
    medio_comunicacion: 'Medio de comunicación',
    usuario: 'Usuario asignado',
    precios: 'Precios',
    descripcion: 'Descripción',
    precio_lay: 'Precio ley',
    comision: 'Comisión',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todos los clientes con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, medio_comunicacion, usuario)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().clientesStore;
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

      dispatch(setClientes(results));
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
 * Obtener un cliente por ID
 */
export const showThunk = (clienteId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando cliente...'));

      const response = await api.get(API_URLS.detail(clienteId));

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
 * Crear un nuevo cliente
 */
export const createThunk = (clienteData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando cliente...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(clienteData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        // Mantener arrays aunque estén vacíos si es precios
        if (key === 'precios' && Array.isArray(value)) {
          cleanData[key] = value;
          return;
        }
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cliente creado!',
        'El nuevo cliente ha sido creado correctamente.',
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
 * Actualizar un cliente existente
 */
export const updateThunk = (clienteId, clienteData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando cliente...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(clienteData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        // Mantener arrays aunque estén vacíos si es precios
        if (key === 'precios' && Array.isArray(value)) {
          cleanData[key] = value;
          return;
        }
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(clienteId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cliente actualizado!',
        'Los datos del cliente han sido actualizados correctamente.',
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
 * Eliminar un cliente (soft delete)
 */
export const deleteThunk = (cliente) => {
  return async (dispatch) => {
    try {
      const clienteName = cliente.nombre || 'Cliente';
      const result = await AlertService.confirmDelete(clienteName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando cliente...'));

      await api.delete(API_URLS.delete(cliente.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cliente eliminado!',
        `El cliente <strong>${clienteName}</strong> ha sido eliminado correctamente.`,
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
 * Restaurar un cliente eliminado
 */
export const restoreThunk = (cliente) => {
  return async (dispatch) => {
    try {
      const clienteName = cliente.nombre || 'Cliente';
      const result = await AlertService.confirm(
        '¿Restaurar cliente?',
        `¿Está seguro que desea restaurar al cliente <strong>${clienteName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando cliente...'));

      await api.post(API_URLS.restore(cliente.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cliente restaurado!',
        `El cliente <strong>${clienteName}</strong> ha sido restaurado correctamente.`,
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
 * Eliminar permanentemente un cliente
 */
export const hardDeleteThunk = (cliente) => {
  return async (dispatch) => {
    try {
      const clienteName = cliente.nombre || 'Cliente';
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente al cliente <strong>${clienteName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(cliente.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cliente eliminado permanentemente!',
        `El cliente <strong>${clienteName}</strong> ha sido eliminado permanentemente.`,
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
 * Guardar cliente (crear o actualizar según si tiene ID)
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
 * Ver detalles de un cliente
 */
export const viewThunk = (cliente) => {
  return async () => {
    const medioComunicacionLabel = {
      email: 'Email',
      whatsapp: 'WhatsApp',
    };

    await AlertService.info(
      cliente.nombre || 'Cliente',
      `
        <div style="text-align: left;">
          <p><strong>Teléfono:</strong> ${cliente.telefono || '-'}</p>
          <p><strong>Dirección:</strong> ${cliente.direccion || '-'}</p>
          <p><strong>Medio de comunicación:</strong> ${medioComunicacionLabel[cliente.medio_comunicacion] || cliente.medio_comunicacion || '-'}</p>
          <p><strong>Usuario asignado:</strong> ${cliente.usuario_name || '-'}</p>
          <p><strong>Creado por:</strong> ${cliente.created_by_name || '-'}</p>
          ${cliente.precios_count !== undefined ? `<p><strong>Precios configurados:</strong> ${cliente.precios_count}</p>` : ''}
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un cliente
 */
export const getHistoryThunk = (clienteId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(clienteId));

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

// ==================== PRECIOS ====================

/**
 * Agregar un precio a un cliente
 */
export const addPrecioThunk = (clienteId, precioData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Agregando precio...'));

      const response = await api.post(API_URLS.addPrecio(clienteId), precioData);

      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Precio agregado!',
        'El precio ha sido agregado correctamente.',
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
 * Listar precios de un cliente
 */
export const listPreciosThunk = (clienteId) => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.listPrecios(clienteId));
      return response.data;

    } catch (error) {
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Actualizar un precio de un cliente
 */
export const updatePrecioThunk = (clienteId, precioId, precioData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando precio...'));

      const response = await api.put(API_URLS.updatePrecio(clienteId, precioId), precioData);

      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Precio actualizado!',
        'El precio ha sido actualizado correctamente.',
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
 * Eliminar un precio de un cliente
 */
export const deletePrecioThunk = (clienteId, precioId) => {
  return async (dispatch) => {
    try {
      const result = await AlertService.confirm(
        '¿Eliminar precio?',
        '¿Está seguro que desea eliminar este precio?'
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando precio...'));

      await api.delete(API_URLS.deletePrecio(clienteId, precioId));

      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Precio eliminado!',
        'El precio ha sido eliminado correctamente.',
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
