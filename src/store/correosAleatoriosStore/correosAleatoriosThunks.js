import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setCorreos,
  setPagination,
  closeModal,
} from './correosAleatoriosStore';

const API_URLS = {
  list: '/api/correos_aleatorios/list/',
  detail: (id) => `/api/correos_aleatorios/${id}/`,
  create: '/api/correos_aleatorios/create/',
  update: (id) => `/api/correos_aleatorios/${id}/update/`,
  delete: (id) => `/api/correos_aleatorios/${id}/delete/`,
  restore: (id) => `/api/correos_aleatorios/${id}/restore/`,
  hardDelete: (id) => `/api/correos_aleatorios/${id}/hard-delete/`,
  history: (id) => `/api/correos_aleatorios/${id}/history/`,
  bulkCreate: '/api/correos_aleatorios/bulk-create/',
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
    case 502: title = 'Servicio no disponible'; break;
    default: title = 'Error';
  }
  if (!response) {
    return { title: 'Error de conexión', message: error.message || 'No se pudo conectar al servidor' };
  }
  const message = response.error || response.detail || 'Ha ocurrido un error';
  return { title, message };
};

// ==================== POOL DE CORREOS ====================

export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));
      const { pagination } = getState().correosAleatoriosStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;
      const response = await api.get(API_URLS.list, { params: { ...params, page, page_size: pageSize } });
      const { count, next, previous, results } = response.data;
      dispatch(setCorreos(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, message);
    }
  };
};

export const createThunk = (data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Guardando correo...'));
      const response = await api.post(API_URLS.create, data);
      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());
      await AlertService.success('¡Correo agregado!', 'El correo se agregó al pool correctamente.', { timer: 2500 });
      return response.data;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, message } = extractApiError(error);
      AlertService.error(title, message);
      return null;
    }
  };
};

export const updateThunk = (id, data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando correo...'));
      const response = await api.put(API_URLS.update(id), data);
      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());
      await AlertService.success('¡Correo actualizado!', 'Los cambios se guardaron correctamente.', { timer: 2500 });
      return response.data;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, message } = extractApiError(error);
      AlertService.error(title, message);
      return null;
    }
  };
};

export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) return dispatch(updateThunk(formData.id, formData));
    return dispatch(createThunk(formData));
  };
};

export const deleteThunk = (correo) => {
  return async (dispatch) => {
    try {
      const result = await AlertService.confirmDelete(correo.correo || 'este correo');
      if (!result.isConfirmed) return false;
      dispatch(showBackdrop('Eliminando correo...'));
      await api.delete(API_URLS.delete(correo.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());
      await AlertService.success('¡Correo eliminado!', 'El correo se eliminó correctamente.', { timer: 2500 });
      return true;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, message } = extractApiError(error);
      AlertService.error(title, message);
      return false;
    }
  };
};

/**
 * Carga masiva de correos al pool desde Excel.
 * El diálogo parsea el .xlsx y envía `registros` (array de {correo, descripcion, activo}).
 * Si el backend devuelve errores por fila, se retornan para mostrarlos en el diálogo.
 */
export const bulkCreateThunk = (registros) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando correos...'));
      const response = await api.post(API_URLS.bulkCreate, { registros });
      dispatch(listAllThunk());
      dispatch(hideBackdrop());
      await AlertService.success(
        '¡Carga exitosa!',
        response.data?.message || `Se cargaron ${response.data?.total_creados ?? 0} correo(s).`,
        { timer: 3000 }
      );
      return response.data;
    } catch (error) {
      dispatch(hideBackdrop());
      // Si el backend devuelve errores por fila, retornarlos para el diálogo.
      if (error.response?.status === 400 && error.response?.data?.errores) {
        return { errores: error.response.data.errores };
      }
      const { title, message } = extractApiError(error);
      AlertService.error(title, message);
      return null;
    }
  };
};

export const restoreThunk = (correo) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Restaurando correo...'));
      await api.post(API_URLS.restore(correo.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());
      await AlertService.success('¡Correo restaurado!', 'El correo se restauró correctamente.', { timer: 2500 });
      return true;
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, message } = extractApiError(error);
      AlertService.error(title, message);
      return false;
    }
  };
};

/**
 * Ver detalles (read-only) de un correo del pool.
 */
export const viewThunk = (correo) => {
  return async () => {
    const fmt = (v) => (v === null || v === undefined || v === '' ? '-' : v);
    const fecha = (v) => (v ? new Date(v).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '-');

    await AlertService.info(
      `Correo #${correo.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Correo:</strong> <code>${fmt(correo.correo)}</code></p>
          <p><strong>Descripción:</strong> ${fmt(correo.descripcion)}</p>
          <p><strong>Estado:</strong> ${correo.activo ? '<span style="color:#2e7d32">Activo</span>' : '<span style="color:#757575">Inactivo</span>'}</p>
          <p><strong>Veces usado:</strong> ${correo.veces_usado ?? 0}</p>
          <p><strong>Último uso:</strong> ${fecha(correo.ultimo_uso)}</p>
          <p><strong>Registrado por:</strong> ${fmt(correo.usuario?.name)}</p>
          <p><strong>Fecha de creación:</strong> ${fecha(correo.created_at)}</p>
        </div>
      `
    );
  };
};

