import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { store } from '../store/store';
import { loginFail } from '../store/authStore/authStore';
import AlertService from './alertService';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Agregar token a cada petición
api.interceptors.request.use(
  (config) => {
    const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
    const token = infoUser.access;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Manejar errores y expiración de token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expirado o inválido
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
      const refreshToken = infoUser.refresh;

      // Intentar refrescar el token
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Actualizar token en localStorage
          const updatedInfo = { ...infoUser, access };
          localStorage.setItem('infoUser', JSON.stringify(updatedInfo));

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);

        } catch (refreshError) {
          // Refresh token también expiró - Cerrar sesión
          handleSessionExpired();
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token - Cerrar sesión
        handleSessionExpired();
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      AlertService.error(
        'Acceso denegado',
        'No tiene permisos para realizar esta acción.'
      );
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      AlertService.error(
        'Error del servidor',
        'Ha ocurrido un error en el servidor. Por favor, intente más tarde.'
      );
    }

    // Handle network errors
    if (!error.response) {
      AlertService.error(
        'Error de conexión',
        'No se pudo conectar al servidor. Verifique su conexión a internet.'
      );
    }

    // Extract error message
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      'Ha ocurrido un error';

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

/**
 * Manejar sesión expirada
 */
const handleSessionExpired = () => {
  // Limpiar estado de Redux
  store.dispatch(loginFail());

  // Mostrar alerta
  AlertService.warning(
    'Sesión expirada',
    'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
  ).then(() => {
    // Redirigir al login
    window.location.href = '/login';
  });
};

/**
 * Verificar si el token es válido (no expirado)
 */
export const isTokenValid = () => {
  const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
  const token = infoUser.access;

  if (!token) return false;

  try {
    // Decodificar el JWT para verificar expiración
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();

    // Verificar si el token expira en menos de 5 minutos
    const bufferTime = 5 * 60 * 1000; // 5 minutos
    return expirationTime > (currentTime + bufferTime);
  } catch (error) {
    return false;
  }
};

/**
 * Obtener tiempo restante del token en minutos
 */
export const getTokenRemainingTime = () => {
  const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
  const token = infoUser.access;

  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const remainingTime = expirationTime - currentTime;

    return Math.max(0, Math.floor(remainingTime / 60000)); // Retornar en minutos
  } catch (error) {
    return 0;
  }
};

// API methods
export const apiService = {
  get: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
  },

  post: async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
  },

  /**
   * POST con multipart/form-data (para endpoints que requieren FormParser)
   */
  postForm: async (url, data = {}) => {
    const formData = data instanceof FormData ? data : objectToFormData(data);
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  put: async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
  },

  /**
   * PUT con multipart/form-data (para endpoints que requieren FormParser)
   */
  putForm: async (url, data = {}) => {
    const formData = data instanceof FormData ? data : objectToFormData(data);
    const response = await api.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  patch: async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
  },

  /**
   * PATCH con multipart/form-data (para endpoints que requieren FormParser)
   */
  patchForm: async (url, data = {}) => {
    const formData = data instanceof FormData ? data : objectToFormData(data);
    const response = await api.patch(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (url) => {
    const response = await api.delete(url);
    return response.data;
  },

  upload: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },
};

/**
 * Convierte un objeto a FormData
 * @param {Object} obj - Objeto a convertir
 * @returns {FormData}
 */
const objectToFormData = (obj) => {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    // Ignorar valores null o undefined
    if (value === null || value === undefined) return;

    // Manejar archivos (File o Blob)
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    }
    // Manejar booleanos
    else if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false');
    }
    // Manejar arrays
    else if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    }
    // Manejar objetos (convertir a JSON string)
    else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    }
    // Manejar otros valores (string, number)
    else {
      formData.append(key, value);
    }
  });

  return formData;
};

export default api;
