import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setUtilidades,
  setTarjetas,
  setPagination,
  closeModal,
  openEditModal,
} from './utilidadOcasionalStore';

const API_URLS = {
  list:       '/api/utilidad_ocasional/list/',
  detail:     (id) => `/api/utilidad_ocasional/${id}/`,
  create:     '/api/utilidad_ocasional/create/',
  update:     (id) => `/api/utilidad_ocasional/${id}/update/`,
  delete:     (id) => `/api/utilidad_ocasional/${id}/delete/`,
  restore:    (id) => `/api/utilidad_ocasional/${id}/restore/`,
  hardDelete: (id) => `/api/utilidad_ocasional/${id}/hard-delete/`,
  history:    (id) => `/api/utilidad_ocasional/${id}/history/`,
  // Auxiliares
  tarjetas:   '/api/tarjetas/list/',
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '$0';
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const formatFieldName = (field) => {
  const fieldNames = {
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
    default:  title = 'Error';
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
        const fieldName = formatFieldName(field);
        const errorMessages = Array.isArray(messages) ? messages : [messages];
        errorMessages.forEach((msg) => {
          htmlMessage += `<li style="margin-bottom: 4px;"><strong>${fieldName}:</strong> ${msg}</li>`;
        });
      });
      htmlMessage += '</ul></div>';
    }
  }

  return { title, message: mainMessage, htmlMessage };
};

/**
 * Listar utilidades ocasionales con paginación y filtros del servidor.
 * Params soportados: page, page_size, search, tarjeta, fecha_start, fecha_end, ordering, include_deleted.
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().utilidadOcasionalStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = { ...params, page, page_size: pageSize };
      const response = await api.get(API_URLS.list, { params: queryParams });

      const { count, next, previous, results } = response.data;

      dispatch(setUtilidades(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Cargar tarjetas (para el select del formulario y filtros).
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
 * Cargar datos auxiliares (tarjetas) para el formulario.
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadTarjetasThunk());
  };
};

/**
 * Obtener una utilidad ocasional por ID y abrir el modal en modo edición.
 */
export const showThunk = (utilidadId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando utilidad ocasional...'));
      const response = await api.get(API_URLS.detail(utilidadId));
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
 * Crear una nueva utilidad ocasional.
 */
export const createThunk = (data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando utilidad ocasional...'));

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

      await AlertService.success(
        '¡Utilidad ocasional creada!',
        'La nueva utilidad ocasional ha sido registrada correctamente.',
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
 * Actualizar una utilidad ocasional existente.
 */
export const updateThunk = (utilidadId, data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando utilidad ocasional...'));

      const cleanData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(utilidadId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad ocasional actualizada!',
        'Los datos de la utilidad ocasional han sido actualizados correctamente.',
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
 * Guardar (crea o actualiza según si tiene id).
 */
export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    }
    return dispatch(createThunk(formData));
  };
};

/**
 * Eliminar (soft delete) una utilidad ocasional.
 */
export const deleteThunk = (utilidad) => {
  return async (dispatch) => {
    try {
      const label = `Utilidad #${utilidad.id} - ${formatCurrency(utilidad.valor)}`;
      const result = await AlertService.confirmDelete(label);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando utilidad ocasional...'));
      await api.delete(API_URLS.delete(utilidad.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad ocasional eliminada!',
        'La utilidad ocasional ha sido eliminada correctamente.',
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
 * Restaurar una utilidad ocasional eliminada.
 */
export const restoreThunk = (utilidad) => {
  return async (dispatch) => {
    try {
      const label = `Utilidad #${utilidad.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar utilidad ocasional?',
        `¿Está seguro que desea restaurar la <strong>${label}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando utilidad ocasional...'));
      await api.post(API_URLS.restore(utilidad.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad ocasional restaurada!',
        'La utilidad ocasional ha sido restaurada correctamente.',
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
 * Eliminar permanentemente una utilidad ocasional.
 */
export const hardDeleteThunk = (utilidad) => {
  return async (dispatch) => {
    try {
      const label = `Utilidad #${utilidad.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la <strong>${label}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(utilidad.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Utilidad ocasional eliminada permanentemente!',
        'La utilidad ocasional ha sido eliminada permanentemente.',
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
 * Ver detalles (read-only) de una utilidad ocasional.
 */
export const viewThunk = (utilidad) => {
  return async () => {
    const fechaFormateada = utilidad.fecha
      ? new Date(utilidad.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
      : '-';
    const tarjetaNumero = utilidad.tarjeta?.numero;
    const aplica4x1000  = utilidad.tarjeta?.cuatro_por_mil === '1';

    await AlertService.info(
      `Utilidad ocasional #${utilidad.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Tarjeta:</strong> ${tarjetaNumero ? `**** ${tarjetaNumero.slice(-4)}` : '-'}${utilidad.tarjeta?.titular ? ` - ${utilidad.tarjeta.titular}` : ''}${aplica4x1000 ? ' <span style="color:#ed6c02">(aplica 4x1000)</span>' : ''}</p>
          <p><strong>Valor:</strong> ${formatCurrency(utilidad.valor)}</p>
          <p><strong>4x1000:</strong> ${formatCurrency(utilidad.cuatro_por_mil)}</p>
          <p><strong>Total:</strong> ${formatCurrency(utilidad.total)}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <p><strong>Observación:</strong> ${utilidad.observacion || '-'}</p>
          <p><strong>Registrado por:</strong> ${utilidad.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${utilidad.created_at ? new Date(utilidad.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios.
 */
export const getHistoryThunk = (utilidadId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(utilidadId));
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
