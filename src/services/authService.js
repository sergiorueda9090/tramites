import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio de autenticación
 */
const AuthService = {
  /**
   * Iniciar sesión
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise} Datos del usuario y tokens
   */
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('infoUser');
    localStorage.clear();
  },

  /**
   * Refrescar token de acceso
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise} Nuevo token de acceso
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
    return !!(infoUser.access && infoUser.isLogin);
  },

  /**
   * Obtener token actual
   * @returns {string|null}
   */
  getToken: () => {
    const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
    return infoUser.access || null;
  },

  /**
   * Obtener información del usuario desde el token
   * @returns {object|null}
   */
  getUserFromToken: () => {
    const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
    const token = infoUser.access;

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id,
        email: payload.email,
        exp: payload.exp,
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Verificar si el token está expirado
   * @returns {boolean}
   */
  isTokenExpired: () => {
    const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
    const token = infoUser.access;

    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * Guardar datos de autenticación
   * @param {object} data - Datos a guardar
   */
  saveAuthData: (data) => {
    const infoUser = {
      access: data.access,
      refresh: data.refresh,
      isLogin: true,
      idrol: data.idrol || data.user?.rol,
      user: data.user,
    };
    localStorage.setItem('infoUser', JSON.stringify(infoUser));
  },
};

export default AuthService;
