import { apiService } from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setUsers,
  addUser,
  updateUser,
  removeUser,
  closeModal,
} from './usersStore';

// Temporal: datos mock mientras no hay backend
import { users as mockUsers } from '../../data/mockData';

/**
 * Obtener todos los usuarios
 */
export const listAllThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // TODO: Descomentar cuando el backend esté listo
      // const response = await apiService.get('/users/');
      // dispatch(setUsers(response.data));

      // Temporal: usar datos mock
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(setUsers(mockUsers));

    } catch (error) {
      dispatch(setError(error.message));
      AlertService.error('Error', 'No se pudieron cargar los usuarios');
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

      // TODO: Descomentar cuando el backend esté listo
      // const response = await apiService.get(`/users/${userId}/`);
      // return response.data;

      // Temporal: buscar en datos mock
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = mockUsers.find(u => u.id === userId);

      dispatch(hideBackdrop());
      return user;

    } catch (error) {
      dispatch(hideBackdrop());
      AlertService.error('Error', 'No se pudo cargar el usuario');
      return null;
    }
  };
};

/**
 * Crear un nuevo usuario
 */
export const createThunk = (userData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando usuario...'));

      // TODO: Descomentar cuando el backend esté listo
      // const response = await apiService.post('/users/', userData);
      // dispatch(addUser(response.data));

      // Temporal: simular creación
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newUser = {
        ...userData,
        id: Date.now(),
        ultimoAcceso: new Date().toISOString(),
      };
      dispatch(addUser(newUser));
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Usuario creado!',
        'El nuevo usuario ha sido creado correctamente.',
        { timer: 3000 }
      );

      return newUser;

    } catch (error) {
      dispatch(hideBackdrop());
      AlertService.error('Error', 'No se pudo crear el usuario');
      return null;
    }
  };
};

/**
 * Actualizar un usuario existente
 */
export const updateThunk = (userId, userData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando usuario...'));

      // TODO: Descomentar cuando el backend esté listo
      // const response = await apiService.put(`/users/${userId}/`, userData);
      // dispatch(updateUser(response.data));

      // Temporal: simular actualización
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedUser = {
        ...userData,
        id: userId,
      };
      dispatch(updateUser(updatedUser));
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Usuario actualizado!',
        'Los datos del usuario han sido actualizados correctamente.',
        { timer: 3000 }
      );

      return updatedUser;

    } catch (error) {
      dispatch(hideBackdrop());
      AlertService.error('Error', 'No se pudo actualizar el usuario');
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
      const result = await AlertService.confirmDelete(user.nombre);

      if (!result.isConfirmed) {
        return false;
      }

      dispatch(showBackdrop('Eliminando usuario...'));

      // TODO: Descomentar cuando el backend esté listo
      // await apiService.delete(`/users/${user.id}/`);

      // Temporal: simular eliminación
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatch(removeUser(user.id));
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Usuario eliminado!',
        `El usuario <strong>${user.nombre}</strong> ha sido eliminado correctamente.`,
        { timer: 3000 }
      );

      return true;

    } catch (error) {
      dispatch(hideBackdrop());
      AlertService.error('Error', 'No se pudo eliminar el usuario');
      return false;
    }
  };
};

/**
 * Guardar usuario (crear o actualizar según si tiene ID)
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
 * Ver detalles de un usuario
 */
export const viewThunk = (user) => {
  return async () => {
    const { USER_ROLE_LABELS } = await import('../../utils/constants');
    const { formatDateTime } = await import('../../utils/helpers');

    await AlertService.info(
      user.nombre,
      `
        <div style="text-align: left;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Rol:</strong> ${USER_ROLE_LABELS[user.rol] || user.rol}</p>
          <p><strong>Estado:</strong> ${user.estado ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Último acceso:</strong> ${formatDateTime(user.ultimoAcceso)}</p>
        </div>
      `
    );
  };
};
