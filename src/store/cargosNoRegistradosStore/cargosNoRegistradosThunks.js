import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setCargosNoRegistrados,
  setClientes,
  setTarjetas,
  setPagination,
  closeModal,
  openEditModal,
} from './cargosNoRegistradosStore';

// URLs del módulo de cargos no registrados
const API_URLS = {
  list: '/api/cargos_no_registrados/list/',
  detail: (id) => `/api/cargos_no_registrados/${id}/`,
  create: '/api/cargos_no_registrados/create/',
  update: (id) => `/api/cargos_no_registrados/${id}/update/`,
  delete: (id) => `/api/cargos_no_registrados/${id}/delete/`,
  restore: (id) => `/api/cargos_no_registrados/${id}/restore/`,
  hardDelete: (id) => `/api/cargos_no_registrados/${id}/hard-delete/`,
  history: (id) => `/api/cargos_no_registrados/${id}/history/`,
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
 * Obtener todos los cargos no registrados con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering, cliente, tarjeta)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().cargosNoRegistradosStore;
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

      dispatch(setCargosNoRegistrados(results));
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
 * Obtener un cargo no registrado por ID
 */
export const showThunk = (cargoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando cargo no registrado...'));

      const response = await api.get(API_URLS.detail(cargoId));

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
 * Crear un nuevo cargo no registrado
 */
export const createThunk = (cargoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando cargo no registrado...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(cargoData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cargo no registrado creado!',
        'El nuevo cargo no registrado ha sido registrado correctamente.',
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
 * Actualizar un cargo no registrado existente
 */
export const updateThunk = (cargoId, cargoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando cargo no registrado...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(cargoData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(cargoId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cargo no registrado actualizado!',
        'Los datos del cargo no registrado han sido actualizados correctamente.',
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
 * Eliminar un cargo no registrado (soft delete)
 */
export const deleteThunk = (cargo) => {
  return async (dispatch) => {
    try {
      const cargoName = `Cargo #${cargo.id} - ${cargo.cliente?.nombre || 'Cliente'}`;
      const result = await AlertService.confirmDelete(cargoName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando cargo no registrado...'));

      await api.delete(API_URLS.delete(cargo.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cargo no registrado eliminado!',
        'El cargo no registrado ha sido eliminado correctamente.',
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
 * Restaurar un cargo no registrado eliminado
 */
export const restoreThunk = (cargo) => {
  return async (dispatch) => {
    try {
      const cargoName = `Cargo #${cargo.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar cargo no registrado?',
        `¿Está seguro que desea restaurar el <strong>${cargoName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Restaurando cargo no registrado...'));

      await api.post(API_URLS.restore(cargo.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cargo no registrado restaurado!',
        'El cargo no registrado ha sido restaurado correctamente.',
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
 * Eliminar permanentemente un cargo no registrado
 */
export const hardDeleteThunk = (cargo) => {
  return async (dispatch) => {
    try {
      const cargoName = `Cargo #${cargo.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${cargoName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(cargo.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cargo eliminado permanentemente!',
        'El cargo no registrado ha sido eliminado permanentemente.',
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
 * Guardar cargo no registrado (crear o actualizar según si tiene ID)
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
 * Ver detalles de un cargo no registrado
 */
export const viewThunk = (cargo) => {
  return async () => {
    const fechaFormateada = cargo.fecha
      ? new Date(cargo.fecha).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    const tarjetaNumero = cargo.tarjeta?.numero;

    await AlertService.info(
      `Cargo No Registrado #${cargo.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Cliente:</strong> ${cargo.cliente?.nombre || '-'}</p>
          <p><strong>Tarjeta:</strong> ${tarjetaNumero ? `**** ${tarjetaNumero.slice(-4)}` : '-'}</p>
          <p><strong>Valor:</strong> ${formatCurrency(cargo.valor)}</p>
          <p><strong>4x1000:</strong> ${formatCurrency(cargo.cuatro_por_mil)}</p>
          <p><strong>Total:</strong> ${formatCurrency(cargo.total)}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p><strong>Observación:</strong> ${cargo.observacion || '-'}</p>
          <p><strong>Registrado por:</strong> ${cargo.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${cargo.created_at ? new Date(cargo.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un cargo no registrado
 */
export const getHistoryThunk = (cargoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(cargoId));

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
