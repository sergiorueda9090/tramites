import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setCategorias,
  setSubCuentas,
  setLoadingSubCuentas,
  setPagination,
  closeModal,
  openEditModal,
} from './gastosCategoriaStore';

const API_URLS = {
  list: '/api/gastos_categoria/list/',
  detail: (id) => `/api/gastos_categoria/${id}/`,
  create: '/api/gastos_categoria/create/',
  update: (id) => `/api/gastos_categoria/${id}/update/`,
  delete: (id) => `/api/gastos_categoria/${id}/delete/`,
  restore: (id) => `/api/gastos_categoria/${id}/restore/`,
  hardDelete: (id) => `/api/gastos_categoria/${id}/hard-delete/`,
  history: (id) => `/api/gastos_categoria/${id}/history/`,
  subCuentas: '/api/sub_cuentas/list/',
};

export const loadSubCuentasThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoadingSubCuentas(true));
      const response = await api.get(API_URLS.subCuentas, { params: { page_size: 1000 } });
      const subCuentas = response.data.results || response.data;
      dispatch(setSubCuentas(subCuentas));
    } catch (error) {
      console.error('Error cargando sub-cuentas:', error);
      dispatch(setLoadingSubCuentas(false));
    }
  };
};

const formatFieldName = (field) => {
  const map = {
    nombre: 'Nombre',
    descripcion: 'Descripción',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return map[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
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
    default: title = 'Error';
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
    const entries = Object.entries(response);
    if (entries.length > 0) {
      htmlMessage = '<div style="text-align:left; background:#fff3f3; padding:12px; border-radius:8px;">';
      htmlMessage += '<ul style="margin:0; padding-left:20px; color:#d32f2f;">';
      entries.forEach(([field, messages]) => {
        const list = Array.isArray(messages) ? messages : [messages];
        list.forEach((msg) => {
          htmlMessage += `<li><strong>${formatFieldName(field)}:</strong> ${msg}</li>`;
        });
      });
      htmlMessage += '</ul></div>';
    }
  }

  return { title, message: mainMessage, htmlMessage };
};

export const listAllThunk = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { pagination } = getState().gastosCategoriaStore;
    const page = params.page || 1;
    const pageSize = params.page_size || pagination.pageSize;

    const response = await api.get(API_URLS.list, {
      params: { ...params, page, page_size: pageSize },
    });
    const { count, next, previous, results } = response.data;
    dispatch(setCategorias(results));
    dispatch(setPagination({ count, next, previous, page, pageSize }));
  } catch (error) {
    const { title, message, htmlMessage } = extractApiError(error);
    dispatch(setError(message));
    AlertService.error(title, htmlMessage);
  }
};

export const showThunk = (id) => async (dispatch) => {
  try {
    dispatch(showBackdrop('Cargando categoría...'));
    const response = await api.get(API_URLS.detail(id));
    dispatch(hideBackdrop());
    dispatch(openEditModal(response.data));
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
  }
};

export const createThunk = (data) => async (dispatch) => {
  try {
    dispatch(showBackdrop('Creando categoría...'));
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
      '¡Categoría creada!',
      'La nueva categoría fue creada correctamente.',
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

export const updateThunk = (id, data) => async (dispatch) => {
  try {
    dispatch(showBackdrop('Actualizando categoría...'));
    const cleanData = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'id') return;
      if (value === null || value === undefined) return;
      cleanData[key] = value;
    });

    const response = await api.put(API_URLS.update(id), cleanData);
    dispatch(listAllThunk());
    dispatch(closeModal());
    dispatch(hideBackdrop());

    await AlertService.success(
      '¡Categoría actualizada!',
      'Los datos de la categoría se actualizaron correctamente.',
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

export const deleteThunk = (categoria) => async (dispatch) => {
  try {
    const name = categoria.nombre || `Categoría #${categoria.id}`;
    const result = await AlertService.confirmDelete(name);
    if (!result.isConfirmed) return false;

    dispatch(showBackdrop('Eliminando categoría...'));
    await api.delete(API_URLS.delete(categoria.id));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());

    await AlertService.success(
      '¡Categoría eliminada!',
      'La categoría fue eliminada correctamente.',
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

export const restoreThunk = (categoria) => async (dispatch) => {
  try {
    const name = categoria.nombre || `Categoría #${categoria.id}`;
    const result = await AlertService.confirm('¿Restaurar categoría?', `¿Restaurar <strong>${name}</strong>?`);
    if (!result.isConfirmed) return false;

    dispatch(showBackdrop('Restaurando...'));
    await api.post(API_URLS.restore(categoria.id));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());

    await AlertService.success('¡Restaurada!', 'La categoría fue restaurada correctamente.', { timer: 3000 });
    return true;
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return false;
  }
};

export const hardDeleteThunk = (categoria) => async (dispatch) => {
  try {
    const name = categoria.nombre || `Categoría #${categoria.id}`;
    const result = await AlertService.confirm(
      '¿Eliminar permanentemente?',
      `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Eliminar permanentemente <strong>${name}</strong>?`,
      { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
    );
    if (!result.isConfirmed) return false;

    dispatch(showBackdrop('Eliminando permanentemente...'));
    await api.delete(API_URLS.hardDelete(categoria.id));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());

    await AlertService.success('¡Eliminada!', 'La categoría fue eliminada permanentemente.', { timer: 3000 });
    return true;
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return false;
  }
};

export const saveThunk = (formData) => async (dispatch) => {
  if (formData.id) return dispatch(updateThunk(formData.id, formData));
  return dispatch(createThunk(formData));
};

export const viewThunk = (categoria) => async () => {
  const fecha = categoria.created_at
    ? new Date(categoria.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
    : '-';

  await AlertService.info(
    categoria.nombre || `Categoría #${categoria.id}`,
    `
      <div style="text-align:left;">
        <p><strong>Nombre:</strong> ${categoria.nombre || '-'}</p>
        <p><strong>Descripción:</strong> ${categoria.descripcion || '-'}</p>
        <p><strong>Creada por:</strong> ${categoria.user?.name || categoria.user?.username || '-'}</p>
        <p><strong>Fecha de creación:</strong> ${fecha}</p>
      </div>
    `
  );
};

export const getHistoryThunk = (id) => async (dispatch) => {
  try {
    dispatch(showBackdrop('Cargando historial...'));
    const response = await api.get(API_URLS.history(id));
    dispatch(hideBackdrop());
    return response.data;
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return null;
  }
};
