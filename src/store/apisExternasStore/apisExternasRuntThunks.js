import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setVehiculo,
} from './apisExternasRuntStore';

// URL del endpoint RUNT
const API_URL = '/api/cotizador/external/runt/';

/**
 * Consultar información de un vehículo en el RUNT
 * @param {Object} params - Parámetros de consulta
 * @param {string} params.placa - Placa del vehículo
 * @param {string} params.tipo_documento - Tipo de documento del propietario
 * @param {string} params.numero_documento - Número de documento del propietario
 */
export const consultarRuntThunk = ({ placa, tipo_documento, numero_documento }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Consultando RUNT...'));

      const response = await api.get(API_URL, {
        params: { placa, tipo_documento, numero_documento },
      });

      dispatch(setVehiculo(response.data));
      dispatch(hideBackdrop());

      return response.data;

    } catch (error) {
      dispatch(hideBackdrop());

      const status = error.response?.status;
      const response = error.response?.data;

      let title = 'Error';
      if (status === 400) title = 'Error de validación';
      else if (status === 401) title = 'No autorizado';
      else if (status === 404) title = 'No encontrado';
      else if (status === 500) title = 'Error del servidor';

      const message = response?.error || response?.detail || error.message || 'No se pudo consultar el RUNT';

      dispatch(setError(message));
      AlertService.error(title, message);

      return null;
    }
  };
};
