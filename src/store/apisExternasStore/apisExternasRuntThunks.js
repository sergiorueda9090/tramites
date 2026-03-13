import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setVehiculo,
  setVinExtraido,
  setPersona,
} from './apisExternasRuntStore';

// URL del endpoint RUNT
const API_URL = '/api/cotizador/external/runt/';  
const API_URL_DATOS = '/api/cotizador/tarjeta_propiedad/';

const API_URL_VIN = '/api/cotizador/vin/';
const API_URL_RUNT_VIN = '/api/cotizador/runt_vin/';

const API_URL_FALABELLA = '/api/cotizador/api_falabella/';

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

/**
 * Extraer datos de tarjeta de propiedad con IA y luego consultar RUNT
 * @param {Object} params
 * @param {File} params.imagen - Imagen de la tarjeta de propiedad
 */
export const extraerDatosRuntThunk = ({ imagen }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Extrayendo datos de la tarjeta...'));

      // Paso 1: Enviar imagen al backend para extraer datos con IA
      const formData = new FormData();
      formData.append('imagen', imagen);

      const extractResponse = await api.post(API_URL_DATOS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      let { placa, tipo_documento, nro_documento } = extractResponse.data;

      if (!placa || !nro_documento) {
        dispatch(hideBackdrop());
        dispatch(setLoading(false));
        AlertService.error('Error', 'No se pudieron extraer los datos de la tarjeta de propiedad.');
        return null;
      }

      if(tipo_documento == 'C.C.'){
         tipo_documento = 'C';
      }

      // Paso 2: Consultar RUNT con los datos extraídos
      dispatch(showBackdrop('Consultando RUNT...'));

      const runtResponse = await api.get(API_URL, {
        params: { placa, tipo_documento, numero_documento: nro_documento },
      });

      dispatch(setVehiculo(runtResponse.data));
      dispatch(hideBackdrop());
      dispatch(setLoading(false));

      return runtResponse.data;

    } catch (error) {
      dispatch(hideBackdrop());
      dispatch(setLoading(false));

      const status = error.response?.status;
      const response = error.response?.data;

      let title = 'Error';
      if (status === 400) title = 'Error de validación';
      else if (status === 401) title = 'No autorizado';
      else if (status === 404) title = 'No encontrado';
      else if (status === 500) title = 'Error del servidor';
      else if (status === 502) title = 'Servicio no disponible';

      const message = response?.error || response?.detail || error.message || 'No se pudo procesar la tarjeta de propiedad';

      dispatch(setError(message));
      AlertService.error(title, message);

      return null;
    }
  };
};

export const extraerDatosFotoVinThunk = ({ imagen, numero_documento }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Extrayendo datos de la foto VIN...'));

      // Paso 1: Enviar imagen al backend para extraer datos con IA
      const formData = new FormData();
      formData.append('imagen', imagen);


      const extractResponse = await api.post(API_URL_VIN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { vin } = extractResponse.data;

      if (!vin) {
        dispatch(hideBackdrop());
        dispatch(setLoading(false));
        AlertService.error('Error', 'No se pudieron extraer los datos de la foto VIN.');
        return null;
      }

      // Guardar VIN extraído en el store
      dispatch(setVinExtraido(vin));

      // Paso 2: Consultar datos de persona con el documento
      dispatch(showBackdrop('Consultando datos del conductor...'));

      const vinRuntResponse = await api.post(API_URL_RUNT_VIN, { runt: numero_documento });

      // Guardar datos de persona en el store
      dispatch(setPersona(vinRuntResponse.data));

      let { placa, tipo_documento } = vinRuntResponse.data;

      if (!placa || !tipo_documento) {
        dispatch(hideBackdrop());
        dispatch(setLoading(false));
        AlertService.error('Error', 'No se pudieron extraer los datos del RUNT con el VIN proporcionado.');
        return null;
      }

      if(tipo_documento == 'C.C.'){
         tipo_documento = 'C';
      }

      // Paso 3: Consultar RUNT con los datos extraídos
      dispatch(showBackdrop('Consultando RUNT...'));

      const runtResponse = await api.get(API_URL, {params: { placa, tipo_documento, numero_documento },});

      dispatch(setVehiculo(runtResponse.data));

      dispatch(hideBackdrop());
      dispatch(setLoading(false));

      return extractResponse.data;

    } catch (error) {
      dispatch(hideBackdrop());
      dispatch(setLoading(false));

      const status = error.response?.status;
      const response = error.response?.data;

      let title = 'Error';
      if (status === 400) title = 'Error de validación';
      else if (status === 401) title = 'No autorizado';
      else if (status === 404) title = 'No encontrado';
      else if (status === 500) title = 'Error del servidor';
      else if (status === 502) title = 'Servicio no disponible';

      const message = response?.error || response?.detail || error.message || 'No se pudo procesar la tarjeta de propiedad';

      dispatch(setError(message));
      AlertService.error(title, message);

      return null;
    }
  };
};


export const extraerDatosAPIFalabellaThunk = ({ placa }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Consultando RUNT...'));

      const response = await api.get(API_URL_FALABELLA, {
        params: { placa },
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