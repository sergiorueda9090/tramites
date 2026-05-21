import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setCuentas,
  setPagination,
  closeModal,
  openEditModal,
  TIPO_CUENTA_LABELS,
  ACUMULADO_LABELS,
} from './planDeCuotasStore';

// URLs del modulo Plan de Cuentas (backend: tramitesbackend/plan_de_cuentas)
const API_URLS = {
  list: '/api/plan_de_cuentas/list/',
  detail: (id) => `/api/plan_de_cuentas/${id}/`,
  create: '/api/plan_de_cuentas/create/',
  update: (id) => `/api/plan_de_cuentas/${id}/update/`,
  delete: (id) => `/api/plan_de_cuentas/${id}/delete/`,
  restore: (id) => `/api/plan_de_cuentas/${id}/restore/`,
  hardDelete: (id) => `/api/plan_de_cuentas/${id}/hard-delete/`,
  history: (id) => `/api/plan_de_cuentas/${id}/history/`,
};

/**
 * Extrae y formatea los errores de la respuesta de la API (formato DRF)
 */
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
    tipo: 'Tipo',
    codigo_puc: 'Código PUC',
    nombre_cuenta: 'Nombre de cuenta',
    acumulado: 'Acumulado',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener cuentas del PUC con paginación
 * @param {Object} params - page, page_size, search, tipo, acumulado, start_date, end_date, ordering
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().planDeCuotasStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setCuentas(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));

    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

export const showThunk = (cuentaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando cuenta...'));
      const response = await api.get(API_URLS.detail(cuentaId));
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

export const createThunk = (cuentaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando cuenta...'));

      const cleanData = {};
      Object.entries(cuentaData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cuenta creada!',
        'La cuenta del PUC ha sido creada correctamente.',
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

export const updateThunk = (cuentaId, cuentaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando cuenta...'));

      const cleanData = {};
      Object.entries(cuentaData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(cuentaId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cuenta actualizada!',
        'Los datos de la cuenta han sido actualizados correctamente.',
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

export const deleteThunk = (cuenta) => {
  return async (dispatch) => {
    try {
      const cuentaName = `${cuenta.codigo_puc} - ${cuenta.nombre_cuenta || 'Cuenta'}`;
      const result = await AlertService.confirmDelete(cuentaName);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando cuenta...'));
      await api.delete(API_URLS.delete(cuenta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cuenta eliminada!',
        `La cuenta <strong>${cuentaName}</strong> ha sido eliminada correctamente.`,
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

export const restoreThunk = (cuenta) => {
  return async (dispatch) => {
    try {
      const cuentaName = `${cuenta.codigo_puc} - ${cuenta.nombre_cuenta || 'Cuenta'}`;
      const result = await AlertService.confirm(
        '¿Restaurar cuenta?',
        `¿Está seguro que desea restaurar la cuenta <strong>${cuentaName}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando cuenta...'));
      await api.post(API_URLS.restore(cuenta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cuenta restaurada!',
        `La cuenta <strong>${cuentaName}</strong> ha sido restaurada correctamente.`,
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

export const hardDeleteThunk = (cuenta) => {
  return async (dispatch) => {
    try {
      const cuentaName = `${cuenta.codigo_puc} - ${cuenta.nombre_cuenta || 'Cuenta'}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la cuenta <strong>${cuentaName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(cuenta.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Cuenta eliminada permanentemente!',
        `La cuenta <strong>${cuentaName}</strong> ha sido eliminada permanentemente.`,
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

export const viewThunk = (cuenta) => {
  return async () => {
    const tipoLabel = TIPO_CUENTA_LABELS[cuenta.tipo] || cuenta.tipo_display || cuenta.tipo || '-';
    const acumuladoLabel = ACUMULADO_LABELS[cuenta.acumulado] || cuenta.acumulado_display || cuenta.acumulado || '-';

    await AlertService.info(
      `${cuenta.codigo_puc} — ${cuenta.nombre_cuenta || 'Cuenta'}`,
      `
        <div style="text-align: left;">
          <p><strong>Tipo:</strong> ${tipoLabel}</p>
          <p><strong>Código PUC:</strong> ${cuenta.codigo_puc || '-'}</p>
          <p><strong>Nombre:</strong> ${cuenta.nombre_cuenta || '-'}</p>
          <p><strong>Acumulado:</strong> ${acumuladoLabel}</p>
          <p><strong>Creado por:</strong> ${cuenta.user_name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${cuenta.created_at ? new Date(cuenta.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

export const getHistoryThunk = (cuentaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(cuentaId));
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
