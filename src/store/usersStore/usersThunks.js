import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setUsers,
  setPagination,
  closeModal,
  openEditModal,
} from './usersStore';

/**
 * Convierte un objeto a FormData
 */
const objectToFormData = (obj) => {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false');
    } else if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

// URLs del módulo de usuarios
const API_URLS = {
  list: '/api/user/list/',
  detail: (id) => `/api/user/${id}/`,
  create: '/api/user/create/',
  update: (id) => `/api/user/${id}/update/`,
  delete: (id) => `/api/user/${id}/delete/`,
  toggleStatus: (id) => `/api/user/${id}/toggle-status/`,
  resetPassword: (id) => `/api/user/${id}/reset-password/`,
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
    email: 'Correo electrónico',
    password: 'Contraseña',
    first_name: 'Nombre',
    last_name: 'Apellido',
    username: 'Usuario',
    idrol: 'Rol',
    is_active: 'Estado',
    user_id: 'Usuario',
    detail: 'Detalle',
    current_password: 'Contraseña actual',
    new_password: 'Nueva contraseña',
    confirm_password: 'Confirmar contraseña',
    image: 'Imagen',
    nombre: 'Nombre',
    rol: 'Rol',
    estado: 'Estado',
    non_field_errors: 'Error',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todos los usuarios con paginación
 * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering, role, is_active)
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().usersStore;
      const page     = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });

      // DRF PageNumberPagination devuelve: { count, next, previous, results }
      const { count, next, previous, results } = response.data;

      dispatch(setUsers(results));
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
 * Obtener un usuario por ID
 */
export const showThunk = (userId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando usuario...'));

      // DRF devuelve el objeto directamente
      const response = await api.get(API_URLS.detail(userId));

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
 * Crear un nuevo usuario
 * Usa multipart/form-data porque el backend usa MultiPartParser
 */
export const createThunk = (userData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando usuario...'));

      // Limpiar datos antes de enviar (remover campos vacíos/nulos)
      const cleanData = {};
      Object.entries(userData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      console.log(" ==== cleanData === ",cleanData);

      const formData = objectToFormData(cleanData);
      const response = await api.post(API_URLS.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Usuario creado!',
        'El nuevo usuario ha sido creado correctamente.',
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
 * Actualizar un usuario existente
 * Usa multipart/form-data porque el backend usa MultiPartParser
 */
export const updateThunk = (userId, userData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando usuario...'));

      // Limpiar datos antes de enviar
      const cleanData = {};
      Object.entries(userData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (key === 'password' && !value) return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const formData = objectToFormData(cleanData);
      const response = await api.put(API_URLS.update(userId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Usuario actualizado!',
        'Los datos del usuario han sido actualizados correctamente.',
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
 * Eliminar un usuario
 */
export const deleteThunk = (user) => {
  return async (dispatch) => {
    try {
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
      const result = await AlertService.confirmDelete(userName);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando usuario...'));

      await api.delete(API_URLS.delete(user.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Usuario eliminado!',
        `El usuario <strong>${userName}</strong> ha sido eliminado correctamente.`,
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
 * Guardar usuario (crear o actualizar según si tiene ID)
 */
export const saveThunk = (formData) => {
  return async (dispatch) => {
    console.log(" ==== formData === ",formData);
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    } else {
      return dispatch(createThunk(formData));
    }
  };
};

/**
 * Ver detalles de un usuario
 */
export const viewThunk = (user) => {
  return async () => {
    // Usar role_name del backend si está disponible
    const rolLabel = user.role_name || `Rol ${user.idrol}`;

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    await AlertService.info(
      userName,
      `
        <div style="text-align: left;">
          <p><strong>Usuario:</strong> ${user.username || '-'}</p>
          <p><strong>Email:</strong> ${user.email || '-'}</p>
          <p><strong>Rol:</strong> ${rolLabel}</p>
          <p><strong>Estado:</strong> ${user.is_active ? 'Activo' : 'Inactivo'}</p>
          ${user.image ? `<p><strong>Imagen:</strong> <a href="${user.image}" target="_blank">Ver imagen</a></p>` : ''}
        </div>
      `
    );
  };
};

/**
 * Cambiar estado de un usuario (activar/desactivar)
 */
export const toggleStatusThunk = (user) => {
  return async (dispatch) => {
    try {
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
      const newStatus = user.is_active ? 'desactivar' : 'activar';

      const result = await AlertService.confirm(
        `¿${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} usuario?`,
        `¿Está seguro que desea ${newStatus} al usuario <strong>${userName}</strong>?`
      );

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop(`${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}ndo usuario...`));

      await api.get(API_URLS.toggleStatus(user.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        `¡Usuario ${user.is_active ? 'desactivado' : 'activado'}!`,
        `El usuario <strong>${userName}</strong> ha sido ${user.is_active ? 'desactivado' : 'activado'} correctamente.`,
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
 * Resetear contraseña de un usuario
 */
export const resetPasswordThunk = (userId, newPassword) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Reseteando contraseña...'));

      await api.post(API_URLS.resetPassword(userId), { new_password: newPassword });

      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Contraseña reseteada!',
        'La contraseña del usuario ha sido reseteada correctamente.',
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
