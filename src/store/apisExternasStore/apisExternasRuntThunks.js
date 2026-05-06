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

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/**
 * Construye el contenido HTML de la alerta a partir del error de axios.
 * - Intenta extraer "descripcionRespuesta" desde response.detalle (puede venir
 *   stringificado y anidado, p.ej. el RUNT envuelve el payload original tras "raw:").
 * - Siempre incluye un <details> con el JSON completo del backend para diagnostico.
 */
const buildBackendErrorHtml = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const fallback = error?.message || 'No se pudo completar la solicitud';

  let descripcion = null;
  try {
    let detalle = data?.detalle;
    if (typeof detalle === 'string') {
      try { detalle = JSON.parse(detalle); } catch { /* dejarlo como string */ }
    }
    if (detalle && typeof detalle === 'object') {
      if (typeof detalle.descripcionRespuesta === 'string') {
        descripcion = detalle.descripcionRespuesta;
      } else if (typeof detalle.error === 'string') {
        const m = detalle.error.match(/raw:\s*(\{[\s\S]+\})\s*$/);
        if (m) {
          try {
            const raw = JSON.parse(m[1]);
            if (typeof raw?.descripcionRespuesta === 'string') {
              descripcion = raw.descripcionRespuesta;
            }
          } catch { /* ignorar */ }
        }
      }
    }
  } catch { /* ignorar */ }

  const principal = data?.error || data?.detail || fallback;
  const statusTag = status ? ` <span style="color:#999;">(HTTP ${status})</span>` : '';

  const partes = [];
  if (descripcion) {
    partes.push(
      `<p style="margin:0 0 8px 0; font-weight:600; color:#d32f2f;">${escapeHtml(descripcion)}</p>`,
      `<p style="margin:0 0 12px 0; font-size:0.85rem; color:#666;">${escapeHtml(principal)}${statusTag}</p>`
    );
  } else {
    partes.push(
      `<p style="margin:0 0 12px 0; font-weight:600;">${escapeHtml(principal)}${statusTag}</p>`
    );
  }

  if (data !== undefined) {
    let payload;
    try { payload = JSON.stringify(data, null, 2); } catch { payload = String(data); }
    partes.push(
      `<details style="margin-top:8px; text-align:left;">`,
      `<summary style="cursor:pointer; color:#1976d2; font-size:0.9rem;">Ver respuesta completa del backend</summary>`,
      `<pre style="background:#f5f5f5; padding:12px; border-radius:6px; font-size:0.78rem; overflow:auto; max-height:320px; margin-top:8px; text-align:left; white-space:pre-wrap; word-break:break-word;">${escapeHtml(payload)}</pre>`,
      `</details>`
    );
  }

  return partes.join('');
};

const titleForStatus = (status) => {
  if (status === 400) return 'Error de validación';
  if (status === 401) return 'No autorizado';
  if (status === 403) return 'Acceso denegado';
  if (status === 404) return 'No encontrado';
  if (status === 500) return 'Error del servidor';
  if (status === 502) return 'Servicio no disponible';
  return 'Error';
};

// URL del endpoint RUNT
const API_URL               = '/api/cotizador/external/runt/';
const API_GET_INFO_EXTERNAL = '/api/cotizador/get_user_info_external/';


const API_URL_DATOS          = '/api/cotizador/tarjeta_propiedad/';
const API_URL_VIN            = '/api/cotizador/vin/';
const API_URL_RUNT_VIN       = '/api/cotizador/runt_vin/';
const API_URL_RUNT_VEHICULO_VIN = '/api/cotizador/runt_vehiculo_vin/';
const API_URL_FALABELLA      = '/api/cotizador/api_falabella/';


// API CEDULAS
const API_URL_CEDULAS = '/api/cotizador/get_nombre_cliente/';


/**
 * Consultar nombre de persona por número de documento
 * Primero consulta RUNT, si no existe cae a API judicial
 * @param {Object} params
 * @param {string} params.numero_documento - Número de documento
 */
export const consultarNombreClienteThunk = ({ numero_documento }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Consultando datos de la persona...'));

      const response = await api.get(API_URL_CEDULAS, {
        params: { numero_documento },
      });

      dispatch(setPersona(response.data));
      dispatch(hideBackdrop());

      return response.data;

    } catch (error) {
      dispatch(hideBackdrop());
      const title = titleForStatus(error?.response?.status);
      const html = buildBackendErrorHtml(error);
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo consultar los datos de la persona';
      dispatch(setError(message));
      AlertService.error(title, html);
      return null;
    }
  };
};

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

      // Solo consultamos el titular cuando el documento es CC: la API externa
      // de get_user_info_external no resuelve otros tipos y dispara error.
      // Para no-CC dejamos el titular en blanco y avanzamos.
      if (tipo_documento === 'C') {
        await dispatch(consultarInformacionUsuarioThunk({ numero_documento }));
      } else {
        dispatch(setPersona(null));
      }

      dispatch(hideBackdrop());

      return response.data;

    } catch (error) {
      dispatch(hideBackdrop());
      const title = titleForStatus(error?.response?.status);
      const html = buildBackendErrorHtml(error);
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo consultar el RUNT';
      dispatch(setError(message));
      AlertService.error(title, html);
      return null;
    }
  };
};


export const consultarInformacionUsuarioThunk = ({ numero_documento }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Consultando información del usuario...'));

      const response = await api.get(API_GET_INFO_EXTERNAL, {
        params: { numero_documento },
      });

      dispatch(setPersona(response.data));
      dispatch(hideBackdrop());

      return response.data;

    } catch (error) {
      dispatch(hideBackdrop());
      const title = titleForStatus(error?.response?.status);
      const html = buildBackendErrorHtml(error);
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo consultar la información del usuario';
      dispatch(setError(message));
      AlertService.error(title, html);
      return null;
    }
  };
};


/**
 * Extraer datos de tarjeta de propiedad con IA y luego consultar RUNT
 * Paso 1: Envía imagen a /api/tarjeta_propiedad → extrae placa, tipo_documento, nro_documento
 * Paso 2: Consulta RUNT vehículo con placa + documento
 * Paso 3: Consulta información del usuario con el documento
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

      // Paso 3: Consultar información del usuario solo si es CC.
      // Para otros tipos (CE/NIT/PAS/etc.) la API externa falla; dejamos
      // el titular en blanco y avanzamos sin mostrar error.
      if (tipo_documento === 'C') {
        await dispatch(consultarInformacionUsuarioThunk({ numero_documento: nro_documento }));
      } else {
        dispatch(setPersona(null));
      }

      dispatch(hideBackdrop());
      dispatch(setLoading(false));

      return runtResponse.data;

    } catch (error) {
      dispatch(hideBackdrop());
      dispatch(setLoading(false));
      const title = titleForStatus(error?.response?.status);
      const html = buildBackendErrorHtml(error);
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo procesar la tarjeta de propiedad';
      dispatch(setError(message));
      AlertService.error(title, html);
      return null;
    }
  };
};

export const extraerDatosFotoVinThunk = ({ imagen }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(showBackdrop('Extrayendo VIN de la foto...'));

      // Paso 1: Enviar imagen al backend para extraer VIN con IA
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

      // Paso 2: Consultar RUNT con el VIN de 17 dígitos
      dispatch(showBackdrop('Consultando vehículo en RUNT por VIN...'));

      const runtVinResponse = await api.get(API_URL_RUNT_VEHICULO_VIN, { params: { vin } });

      dispatch(setVehiculo(runtVinResponse.data));

      dispatch(hideBackdrop());
      dispatch(setLoading(false));

      return runtVinResponse.data;

    } catch (error) {
      dispatch(hideBackdrop());
      dispatch(setLoading(false));
      const title = titleForStatus(error?.response?.status);
      const html = buildBackendErrorHtml(error);
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo procesar la foto del VIN';
      dispatch(setError(message));
      AlertService.error(title, html);
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
      const title = titleForStatus(error?.response?.status);
      const html = buildBackendErrorHtml(error);
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo consultar el RUNT';
      dispatch(setError(message));
      AlertService.error(title, html);
      return null;
    }
  };
};