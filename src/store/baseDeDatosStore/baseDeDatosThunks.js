import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setRegistros,
  setClientes,
  setPagination,
  closeModal,
  openEditModal,
} from './baseDeDatosStore';
import {
  setRegistroBaseDeDatosId,
  setRegistroBaseDeDatosActualizado,
} from '../cotizadorStore/cotizadorSlice';

// URLs del módulo base de datos
const API_URLS = {
  list: '/api/base_de_datos/list/',
  exportExcel: '/api/base_de_datos/export-excel/',
  detail: (id) => `/api/base_de_datos/${id}/`,
  create: '/api/base_de_datos/create/',
  update: (id) => `/api/base_de_datos/${id}/update/`,
  delete: (id) => `/api/base_de_datos/${id}/delete/`,
  restore: (id) => `/api/base_de_datos/${id}/restore/`,
  hardDelete: (id) => `/api/base_de_datos/${id}/hard-delete/`,
  history: (id) => `/api/base_de_datos/${id}/history/`,
  // URLs auxiliares para cargar datos de selects
  clientes: '/api/clientes/list/',
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
    default: title = 'Error';
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
    cliente: 'Cliente',
    tipo_tramite: 'Tipo de trámite',
    tipo_vehiculo: 'Tipo de vehículo',
    es_propietario: 'Es propietario',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
    nombre_completo: 'Nombre completo',
    telefono: 'Teléfono',
    placa: 'Placa',
    clase: 'Clase',
    clasificacion: 'Clasificación',
    tipo_servicio: 'Tipo de servicio',
    tipo_carroceria: 'Tipo de carrocería',
    vin: 'VIN',
    num_motor: 'No. Motor',
    num_chasis: 'No. Chasis',
    marca: 'Marca',
    linea: 'Línea',
    modelo: 'Modelo',
    cilindraje: 'Cilindraje',
    color: 'Color',
    organismo_transito: 'Organismo de tránsito',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todos los registros con paginación
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().baseDeDatosStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setRegistros(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));

    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Cargar clientes para el select del formulario
 */
export const loadClientesThunk = () => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.clientes, { params: { page_size: 1000 } });
      const clientes = response.data.results || response.data;
      dispatch(setClientes(clientes));
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };
};

/**
 * Cargar datos auxiliares para los formularios
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadClientesThunk());
  };
};

/**
 * Obtener un registro por ID
 */
export const showThunk = (registroId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando registro...'));

      const response = await api.get(API_URLS.detail(registroId));

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
 * Crear un nuevo registro de vehículo
 */
export const createThunk = (registroData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando registro...'));

      const cleanData = {};
      Object.entries(registroData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Registro creado!',
        'El nuevo registro de vehículo ha sido guardado correctamente.',
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
 * Actualizar un registro de vehículo existente
 */
export const updateThunk = (registroId, registroData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando registro...'));

      const cleanData = {};
      Object.entries(registroData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(registroId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Registro actualizado!',
        'Los datos del registro han sido actualizados correctamente.',
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
 * Eliminar un registro (soft delete)
 */
export const deleteThunk = (registro) => {
  return async (dispatch) => {
    try {
      const registroName = `${registro.placa || 'Sin placa'} - ${registro.nombre_completo || 'Sin nombre'}`;
      const result = await AlertService.confirmDelete(registroName);

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando registro...'));

      await api.delete(API_URLS.delete(registro.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Registro eliminado!',
        'El registro ha sido eliminado correctamente.',
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
 * Restaurar un registro eliminado
 */
export const restoreThunk = (registro) => {
  return async (dispatch) => {
    try {
      const registroName = `${registro.placa || 'Sin placa'} - ${registro.nombre_completo || ''}`;
      const result = await AlertService.confirm(
        '¿Restaurar registro?',
        `¿Está seguro que desea restaurar el registro <strong>${registroName}</strong>?`
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando registro...'));

      await api.post(API_URLS.restore(registro.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Registro restaurado!',
        'El registro ha sido restaurado correctamente.',
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
 * Eliminar permanentemente un registro
 */
export const hardDeleteThunk = (registro) => {
  return async (dispatch) => {
    try {
      const registroName = `${registro.placa || 'Sin placa'} - ${registro.nombre_completo || ''}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el registro <strong>${registroName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(registro.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Registro eliminado permanentemente!',
        'El registro ha sido eliminado permanentemente.',
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
 * Guardar registro (crear o actualizar según si tiene ID)
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
 * Ver detalles de un registro
 */
export const viewThunk = (registro) => {
  return async () => {
    const fechaCreacion = registro.created_at
      ? new Date(registro.created_at).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    await AlertService.info(
      `Registro #${registro.id} - ${registro.placa || 'Sin placa'}`,
      `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h4 style="margin: 0 0 8px; color: #1976d2;">Datos del trámite</h4>
          <p><strong>Tipo de trámite:</strong> ${registro.tipo_tramite || '-'}</p>
          <p><strong>Tipo de vehículo:</strong> ${registro.tipo_vehiculo || '-'}</p>
          <p><strong>Cliente:</strong> ${registro.cliente?.nombre || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del titular</h4>
          <p><strong>Es propietario:</strong> ${registro.es_propietario ? 'Sí' : 'No'}</p>
          <p><strong>Tipo documento:</strong> ${registro.tipo_documento || '-'}</p>
          <p><strong>No. documento:</strong> ${registro.numero_documento || '-'}</p>
          <p><strong>Nombre completo:</strong> ${registro.nombre_completo || '-'}</p>
          <p><strong>Teléfono:</strong> ${registro.telefono || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del vehículo</h4>
          <p><strong>Placa:</strong> ${registro.placa || '-'}</p>
          <p><strong>Clase:</strong> ${registro.clase || '-'}</p>
          <p><strong>Clasificación:</strong> ${registro.clasificacion || '-'}</p>
          <p><strong>Tipo servicio:</strong> ${registro.tipo_servicio || '-'}</p>
          <p><strong>Tipo carrocería:</strong> ${registro.tipo_carroceria || '-'}</p>
          <p><strong>VIN:</strong> ${registro.vin || '-'}</p>
          <p><strong>No. Motor:</strong> ${registro.num_motor || '-'}</p>
          <p><strong>No. Chasis:</strong> ${registro.num_chasis || '-'}</p>
          <p><strong>Marca:</strong> ${registro.marca || '-'}</p>
          <p><strong>Línea:</strong> ${registro.linea || '-'}</p>
          <p><strong>Modelo:</strong> ${registro.modelo || '-'}</p>
          <p><strong>Cilindraje:</strong> ${registro.cilindraje || '-'}</p>
          <p><strong>Color:</strong> ${registro.color || '-'}</p>
          <p><strong>Organismo de tránsito:</strong> ${registro.organismo_transito || '-'}</p>

          <hr style="margin: 12px 0; border-color: #eee;" />
          <p><strong>Registrado por:</strong> ${registro.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${fechaCreacion}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un registro
 */
export const getHistoryThunk = (registroId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const response = await api.get(API_URLS.history(registroId));

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

/**
 * Exportar registros a Excel con los filtros actuales aplicados
 */
export const exportExcelThunk = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Generando archivo Excel...'));

      const response = await api.get(API_URLS.exportExcel, {
        params,
        responseType: 'blob',
      });

      // Extraer nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'base_de_datos_registros.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match) filename = match[1];
      }

      // Crear descarga del archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Excel generado!',
        'El archivo se ha descargado correctamente.',
        { timer: 3000 }
      );

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
    }
  };
};

/**
 * Guardar registro automáticamente desde el flujo del Cotizador.
 * Lee los datos de cotizadorStore y apisExternasRuntStore y los envía a base_de_datos.
 */
export const guardarRegistroDesdeCotizadorThunk = () => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const cotizador = state.cotizadorStore;
      const runt = state.apisExternasRuntStore;

      // Determinar el cliente_id
      const clienteId = cotizador.clienteSeleccionado?.id || null;
      if (!clienteId) {
        console.warn('BaseDeDatos: No se pudo guardar, no hay cliente seleccionado.');
        return null;
      }

      // Determinar si es propietario
      const esPropietario = cotizador.titularCotizacion !== 'TERCERO';

      // Determinar tipo y número de documento del titular
      let tipoDocumento = cotizador.tipoDocumento || 'C';
      let numeroDocumento = cotizador.consultaDocumento || '';
      let nombreCompleto = '';
      let telefono = cotizador.consultaTelefono || '';

      if (cotizador.titularCotizacion === 'TERCERO') {
        tipoDocumento = cotizador.terceroTipoDocumento || 'C';
        numeroDocumento = cotizador.terceroDocumento || '';
      }

      // Nombre completo desde RUNT (nombres + apellidos)
      if (runt.nombres || runt.apellidos) {
        nombreCompleto = `${runt.nombres || ''} ${runt.apellidos || ''}`.trim();
      }

      // Si no hay nombre del RUNT, usar el del cliente
      if (!nombreCompleto && cotizador.clienteSeleccionado?.nombre) {
        nombreCompleto = cotizador.clienteSeleccionado.nombre;
      }

      // Si no hay documento, intentar del RUNT
      if (!numeroDocumento && runt.numero_documento_persona) {
        numeroDocumento = runt.numero_documento_persona;
      }

      const payload = {
        cliente: clienteId,
        tipo_tramite: cotizador.tipoTramite || 'SOAT',
        tipo_vehiculo: cotizador.tipoVehiculo || 'USADO',
        es_propietario: esPropietario,
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        nombre_completo: nombreCompleto,
        telefono: telefono,
        // Datos del vehículo desde RUNT
        placa: runt.placa || cotizador.datosManual?.placa || '',
        clase: runt.clase || cotizador.datosManual?.clase || '',
        clasificacion: runt.clasificacion || '',
        tipo_servicio: runt.tipo_servicio || cotizador.datosManual?.tipoServicio || '',
        tipo_carroceria: runt.tipo_carroceria || '',
        vin: runt.vin || '',
        num_motor: runt.num_motor || '',
        num_chasis: runt.num_chasis || '',
        marca: runt.marca || cotizador.datosManual?.marca || '',
        linea: runt.linea || cotizador.datosManual?.linea || '',
        modelo: runt.modelo || cotizador.datosManual?.modelo || '',
        cilindraje: runt.cilindraje || cotizador.datosManual?.cilindraje || '',
        color: runt.color || '',
        organismo_transito: runt.organismo_transito || '',
      };

      const response = await api.post(API_URLS.create, payload);
      const registroId = response?.data?.id || null;
      if (registroId) {
        dispatch(setRegistroBaseDeDatosId(registroId));
      }
      console.log('BaseDeDatos: Registro guardado automáticamente desde Cotizador. ID:', registroId);

      return registroId;

    } catch (error) {
      // No bloquear el flujo del cotizador si falla el guardado en base_de_datos
      console.error('BaseDeDatos: Error al guardar registro desde Cotizador:', error);
      return null;
    }
  };
};

/**
 * Actualizar el registro de base_de_datos creado durante el flujo del Cotizador
 * con el precio (precio_lay) y la comisión, una vez Step7 resolvió la tarifa
 * y el caso NO es especial (sin anomalías).
 *
 * Se controla con el flag `registroBaseDeDatosActualizado` para evitar dobles
 * envíos. Si falla, no se bloquea el flujo: el registro queda sin precio.
 */
export const actualizarPrecioComisionRegistroBaseDeDatosThunk = () => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const cotizador = state.cotizadorStore;

      const registroId = cotizador.registroBaseDeDatosId;
      if (!registroId) return null;
      if (cotizador.registroBaseDeDatosActualizado) return null;

      const precioCliente = Array.isArray(cotizador.preciosCliente) && cotizador.preciosCliente.length > 0
        ? cotizador.preciosCliente[0]
        : null;

      const precioLay = cotizador.tarifaDetalle?.valor || precioCliente?.precio_lay || null;
      const comision = precioCliente?.comision || null;

      if (precioLay === null && comision === null) return null;

      await api.put(API_URLS.update(registroId), {
        precio_lay: precioLay,
        comision: comision,
      });

      dispatch(setRegistroBaseDeDatosActualizado(true));
      console.log('BaseDeDatos: Precio y comisión actualizados para registro', registroId);
      return true;
    } catch (error) {
      console.error('BaseDeDatos: Error al actualizar precio/comisión:', error);
      return null;
    }
  };
};

/**
 * Enviar un registro de Base de Datos a Trámites.
 *
 * Doble confirmación → POST a /api/tramites/crear-desde-base-de-datos/.
 * El backend copia titular+vehículo, deja vacíos los campos SOAT/financieros
 * (los completa el usuario después en Trámites) y emite `tramite_added` por
 * WS para que el listado de Trámites se refresque en tiempo real en todas
 * las sesiones. El registro en Base de Datos queda intacto (es base maestra).
 */
const TRAMITES_API = {
  crearDesdeBaseDeDatos: '/api/tramites/crear-desde-base-de-datos/',
};

export const enviarATramitesDesdeBaseDeDatosThunk = (registro) => {
  return async (dispatch) => {
    if (!registro?.id) {
      AlertService.error('Registro inválido', 'No se pudo identificar el registro.');
      return null;
    }

    const placa = registro.placa || '(sin placa)';
    const clienteNombre = registro.cliente?.nombre || '(sin cliente)';
    const titular = registro.nombre_completo || '(sin titular)';
    const documento = registro.numero_documento || '-';

    try {
      const primera = await AlertService.confirm(
        '¿Enviar este registro a Trámites?',
        `
          <div style="text-align: left; background: #f5f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #1976d2;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #1976d2;">Se creará un trámite con titular y vehículo. Los campos de tarifa y precio quedarán vacíos para completarlos en el módulo de Trámites:</p>
            <p style="margin: 4px 0;"><strong>Registro:</strong> #${registro.id}</p>
            <p style="margin: 4px 0;"><strong>Cliente:</strong> ${clienteNombre}</p>
            <p style="margin: 4px 0;"><strong>Titular:</strong> ${titular}</p>
            <p style="margin: 4px 0;"><strong>Documento:</strong> ${documento}</p>
            <p style="margin: 4px 0;"><strong>Placa:</strong> ${placa}</p>
          </div>
        `,
        { icon: 'question', confirmText: 'Sí, continuar', cancelText: 'Cancelar' }
      );
      if (!primera.isConfirmed) return null;

      const segunda = await AlertService.confirm(
        '¿Confirmar creación del trámite?',
        `
          <div style="text-align: left; background: #fff8e1; padding: 16px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #e65100;">⚠ El trámite aparecerá inmediatamente en el listado para todos los usuarios</p>
            <p style="margin: 4px 0;">Recuerda completar después <strong>grupo SOAT, tarifa y precio</strong> en el módulo de Trámites.</p>
          </div>
        `,
        { icon: 'warning', confirmText: 'Sí, crear trámite', cancelText: 'Revisar nuevamente' }
      );
      if (!segunda.isConfirmed) return null;

      dispatch(showBackdrop('Enviando a Trámites...'));
      const response = await api.post(TRAMITES_API.crearDesdeBaseDeDatos, {
        registro_id: registro.id,
      });
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite creado!',
        `Se creó el trámite #${response.data?.id} para la placa <strong>${response.data?.placa || '-'}</strong>. Completa la tarifa y el precio en el módulo de Trámites.`,
        { timer: 3500 }
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
