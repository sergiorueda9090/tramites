import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setSubCuentas,
  setLoadingCuentas,
  setCuentas,
  setPagination,
  closeModal,
  openEditModal,
  TIPO_CUENTA_LABELS,
} from './subCuentasStore';

// URLs del modulo Sub-cuentas (backend: tramitesbackend/sub_cuentas)
const API_URLS = {
  list: '/api/sub_cuentas/list/',
  detail: (id) => `/api/sub_cuentas/${id}/`,
  create: '/api/sub_cuentas/create/',
  update: (id) => `/api/sub_cuentas/${id}/update/`,
  delete: (id) => `/api/sub_cuentas/${id}/delete/`,
  restore: (id) => `/api/sub_cuentas/${id}/restore/`,
  hardDelete: (id) => `/api/sub_cuentas/${id}/hard-delete/`,
  history: (id) => `/api/sub_cuentas/${id}/history/`,
  // Auxiliar: listar Plan de cuentas para el select de "Cuenta"
  cuentas: '/api/plan_de_cuentas/list/',
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
    codigo: 'ID',
    cuenta: 'Cuenta',
    nombre_sub_cuenta: 'Nombre de sub-cuenta',
    debito: 'Débito',
    credito: 'Crédito',
    acumulado: 'Acumulado',
    user: 'Usuario',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

// Formato moneda colombiana (para vista de detalles)
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Listar sub-cuentas con paginación
 * @param {Object} params - page, page_size, search, cuenta, tipo, start_date, end_date, ordering
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().subCuentasStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = { ...params, page, page_size: pageSize };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setSubCuentas(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Cargar cuentas del PUC (para el select de "Cuenta" del formulario)
 */
export const loadCuentasThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoadingCuentas(true));
      const response = await api.get(API_URLS.cuentas, { params: { page_size: 1000 } });
      const cuentas = response.data.results || response.data;
      dispatch(setCuentas(cuentas));
    } catch (error) {
      console.error('Error cargando Plan de cuentas:', error);
      dispatch(setLoadingCuentas(false));
    }
  };
};

export const showThunk = (subId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando sub-cuenta...'));
      const response = await api.get(API_URLS.detail(subId));
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
      dispatch(showBackdrop('Creando sub-cuenta...'));

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
        '¡Sub-cuenta creada!',
        'La sub-cuenta ha sido creada correctamente.',
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

export const updateThunk = (subId, data) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando sub-cuenta...'));

      const cleanData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(subId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Sub-cuenta actualizada!',
        'Los datos de la sub-cuenta han sido actualizados correctamente.',
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

export const deleteThunk = (sub) => {
  return async (dispatch) => {
    try {
      const subName = `${sub.codigo} - ${sub.nombre_sub_cuenta || 'Sub-cuenta'}`;
      const result = await AlertService.confirmDelete(subName);
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando sub-cuenta...'));
      await api.delete(API_URLS.delete(sub.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Sub-cuenta eliminada!',
        `La sub-cuenta <strong>${subName}</strong> ha sido eliminada correctamente.`,
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

export const restoreThunk = (sub) => {
  return async (dispatch) => {
    try {
      const subName = `${sub.codigo} - ${sub.nombre_sub_cuenta || 'Sub-cuenta'}`;
      const result = await AlertService.confirm(
        '¿Restaurar sub-cuenta?',
        `¿Está seguro que desea restaurar la sub-cuenta <strong>${subName}</strong>?`
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando sub-cuenta...'));
      await api.post(API_URLS.restore(sub.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Sub-cuenta restaurada!',
        `La sub-cuenta <strong>${subName}</strong> ha sido restaurada correctamente.`,
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

export const hardDeleteThunk = (sub) => {
  return async (dispatch) => {
    try {
      const subName = `${sub.codigo} - ${sub.nombre_sub_cuenta || 'Sub-cuenta'}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente la sub-cuenta <strong>${subName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );
      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));
      await api.delete(API_URLS.hardDelete(sub.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Sub-cuenta eliminada permanentemente!',
        `La sub-cuenta <strong>${subName}</strong> ha sido eliminada permanentemente.`,
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

export const viewThunk = (sub) => {
  return async () => {
    const tipoLabel = TIPO_CUENTA_LABELS[sub.cuenta_tipo] || sub.cuenta_tipo_display || sub.cuenta_tipo || '-';

    await AlertService.info(
      `${sub.codigo} — ${sub.nombre_sub_cuenta || 'Sub-cuenta'}`,
      `
        <div style="text-align: left;">
          <p><strong>ID:</strong> ${sub.codigo || '-'}</p>
          <p><strong>Nombre sub-cuenta:</strong> ${sub.nombre_sub_cuenta || '-'}</p>
          <p><strong>Cuenta PUC:</strong> ${sub.cuenta_codigo_puc || '-'} — ${sub.cuenta_nombre || '-'}</p>
          <p><strong>Tipo:</strong> ${tipoLabel}</p>
          <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
          <p><strong>Débito:</strong> ${formatCurrency(sub.debito)}</p>
          <p><strong>Crédito:</strong> ${formatCurrency(sub.credito)}</p>
          <p><strong>Acumulado:</strong> ${formatCurrency(sub.acumulado)}</p>
          <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
          <p><strong>Creado por:</strong> ${sub.user_name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${sub.created_at ? new Date(sub.created_at).toLocaleString('es-CO') : '-'}</p>
        </div>
      `
    );
  };
};

export const getHistoryThunk = (subId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));
      const response = await api.get(API_URLS.history(subId));
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
