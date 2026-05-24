import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setProveedores,
  setLoadingSubCuentas,
  setSubCuentas,
  setPagination,
  closeModal,
  openEditModal,
} from './proveedoresStore';

// URLs del modulo Proveedores (backend: tramitesbackend/proveedores)
const API_URLS = {
  list: '/api/proveedores/list/',
  detail: (id) => `/api/proveedores/${id}/`,
  create: '/api/proveedores/create/',
  update: (id) => `/api/proveedores/${id}/update/`,
  delete: (id) => `/api/proveedores/${id}/delete/`,
  restore: (id) => `/api/proveedores/${id}/restore/`,
  hardDelete: (id) => `/api/proveedores/${id}/hard-delete/`,
  history: (id) => `/api/proveedores/${id}/history/`,
  // Auxiliares para los selects del formulario y de los filtros
  subCuentas: '/api/sub_cuentas/list/',
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

  return { title, message: mainMessage, htmlMessage };
};

const formatFieldName = (field) => {
  const fieldNames = {
    nombre: 'Nombre',
    color: 'Color',
    sub_cuenta: 'Sub-cuenta',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Listar proveedores con paginación y filtros del servidor
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().proveedoresStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = { ...params, page, page_size: pageSize };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setProveedores(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Cargar sub-cuentas para el select del formulario y del filtro
 */
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

export const showThunk = (proveedorId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando proveedor...'));
      const response = await api.get(API_URLS.detail(proveedorId));
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

export const createThunk = (data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando proveedor...'));

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
        '¡Proveedor creado!',
        'El proveedor ha sido creado correctamente.',
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

export const updateThunk = (proveedorId, data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando proveedor...'));

      const cleanData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(proveedorId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Proveedor actualizado!',
        'Los datos del proveedor han sido actualizados correctamente.',
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

export const deleteThunk = (proveedor) => {
  return async (dispatch) => {
    try {
      const nombre = `${proveedor.nombre || 'Proveedor'} #${proveedor.id}`;
      const result = await AlertService.confirmDelete(nombre);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando proveedor...'));
      await api.delete(API_URLS.delete(proveedor.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Proveedor eliminado!',
        `El proveedor <strong>${nombre}</strong> ha sido eliminado correctamente.`,
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

export const restoreThunk = (proveedor) => {
  return async (dispatch) => {
    try {
      const nombre = `${proveedor.nombre || 'Proveedor'} #${proveedor.id}`;
      const result = await AlertService.confirm(
        '¿Restaurar proveedor?',
        `¿Está seguro que desea restaurar el proveedor <strong>${nombre}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando proveedor...'));
      await api.post(API_URLS.restore(proveedor.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Proveedor restaurado!',
        `El proveedor <strong>${nombre}</strong> ha sido restaurado correctamente.`,
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

export const hardDeleteThunk = (proveedor) => {
  return async (dispatch) => {
    try {
      const nombre = `${proveedor.nombre || 'Proveedor'} #${proveedor.id}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el proveedor <strong>${nombre}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(proveedor.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Proveedor eliminado permanentemente!',
        `El proveedor <strong>${nombre}</strong> ha sido eliminado permanentemente.`,
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

export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    }
    return dispatch(createThunk(formData));
  };
};

export const viewThunk = (proveedor) => {
  return async () => {
    const subCuentaInfo = proveedor.sub_cuenta_codigo
      ? `${proveedor.sub_cuenta_codigo} — ${proveedor.sub_cuenta_nombre || ''}`
      : '-';

    await AlertService.info(
      proveedor.nombre || `Proveedor #${proveedor.id}`,
      `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${proveedor.nombre || '-'}</p>
          <p><strong>Color:</strong> <span style="display:inline-block;width:18px;height:18px;background:${proveedor.color};border-radius:4px;border:1px solid #ccc;vertical-align:middle;"></span> <code>${proveedor.color || '-'}</code></p>
          <p><strong>Sub-cuenta:</strong> ${subCuentaInfo}</p>
          <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
          <p><strong>Creado por:</strong> ${proveedor.user_name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${proveedor.created_at ? new Date(proveedor.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

export const getHistoryThunk = (proveedorId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(proveedorId));
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
