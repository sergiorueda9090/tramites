import api, { apiService } from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setTramites,
  setClientes,
  setEtiquetas,
  setTarifarios,
  setPagination,
  closeModal,
  openEditModal,
  setHistory,
  prependTramite,
  updateLinkPagoEstado,
} from './tamitesStore';

// URLs del módulo tramites
const API_URLS = {
  list: '/api/tramites/list/',
  detail: (id) => `/api/tramites/${id}/`,
  create: '/api/tramites/create/',
  update: (id) => `/api/tramites/${id}/update/`,
  delete: (id) => `/api/tramites/${id}/delete/`,
  restore: (id) => `/api/tramites/${id}/restore/`,
  hardDelete: (id) => `/api/tramites/${id}/hard-delete/`,
  history: (id) => `/api/tramites/${id}/history/`,
  cambiarEstado: (id) => `/api/tramites/${id}/cambiar-estado/`,
  revertirEstado: (id) => `/api/tramites/${id}/revertir-estado/`,
  // URL de pasarela de pago (para "Enviar a Pasarela" desde un trámite)
  pasarelaCreate: '/api/pasarela_de_pago/create/',
  pasarelaConfirmarPago: (id) => `/api/pasarela_de_pago/${id}/confirmar-pago/`,
  // Generadores de links de pago (usan un correo aleatorio del pool)
  generarLinkPrevisora: '/api/tramites/generar-link/previsora/',
  generarLinkMundial: '/api/tramites/generar-link/mundial/',
  // Reintento de la generación automática (asíncrona) del link de pago
  reintentarLinkPago: (id) => `/api/tramites/${id}/link-pago/reintentar/`,
  // URLs auxiliares para selects
  clientes: '/api/clientes/list/',
  etiquetas: '/api/etiquetas/list/',
  tarifarios: '/api/tarifario_soat/list/',
};

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/**
 * Extrae la causa legible desde el campo `detalle` que reenvían las vistas que
 * consumen servicios externos (Previsora / Mundial / RUNT). El cuerpo del
 * servicio externo suele venir como JSON string (a veces anidado), p.ej.:
 *   { "error": "Error del servicio externo: 400",
 *     "detalle": "{\"detail\":\"En estos momentos no se ha logrado...\"}" }
 * Devuelve el texto de la causa o null si no se puede extraer.
 */
const extraerCausaDetalle = (detalle) => {
  if (!detalle) return null;
  let d = detalle;
  if (typeof d === 'string') {
    const txt = d.trim();
    if (!txt) return null;
    try { d = JSON.parse(txt); } catch { return txt; } // no es JSON: mostrar el texto crudo
  }
  if (d && typeof d === 'object') {
    return d.detail || d.descripcionRespuesta || d.message || d.error || null;
  }
  return null;
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
    case 502: title = 'Servicio no disponible'; break;
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

  // Causa real reenviada por un servicio externo en `detalle`: se muestra de
  // forma prominente para que el usuario sepa exactamente qué pasó.
  // Si la vista adjuntó el correo aleatorio usado, lo mostramos para que el
  // usuario confirme que sí se envió un correo del pool.
  const correoLine = response.correo_usado
    ? `<p style="margin:8px 0 0;font-size:0.85rem;color:#555;">Correo usado: <strong>${escapeHtml(response.correo_usado)}</strong></p>`
    : '';

  const causa = extraerCausaDetalle(response.detalle);
  if (causa) {
    const statusTag = status ? ` <span style="color:#999;">(HTTP ${status})</span>` : '';
    const htmlMessage =
      `<p style="margin:0 0 8px;font-weight:600;color:#d32f2f;">${escapeHtml(causa)}</p>` +
      `<p style="margin:0;font-size:0.85rem;color:#666;">${escapeHtml(mainMessage)}${statusTag}</p>` +
      correoLine;
    return { title, message: causa, htmlMessage };
  }

  let htmlMessage = `<p style="margin-bottom: 12px;">${mainMessage}</p>${correoLine}`;

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
    etiqueta: 'Etiqueta',
    precio_cliente: 'Precio cliente',
    tarifario_soat: 'Tarifario SOAT',
    tipo_tramite: 'Tipo de trámite',
    tipo_vehiculo: 'Tipo de vehículo',
    grupo_soat: 'Grupo SOAT',
    grupo_clase_runt: 'Clase RUNT',
    grupo_subcriterio: 'Subcriterio',
    modulo_pregunta1: 'Pregunta 1',
    modulo_pregunta2: 'Pregunta 2',
    tarifa_codigo: 'Código de tarifa',
    tarifa_manual: 'Tarifa manual',
    precio_lay: 'Precio de ley',
    comision: 'Comisión',
    placa: 'Placa',
    clase: 'Clase',
    tipo_servicio: 'Tipo de servicio',
    marca: 'Marca',
    linea: 'Línea',
    modelo: 'Modelo',
    color: 'Color',
    cilindraje: 'Cilindraje',
    pasajeros_sentados: 'Pasajeros sentados',
    capacidad_carga: 'Capacidad de carga',
    peso_bruto: 'Peso bruto',
    chasis: 'Chasis',
    vin: 'VIN',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
    nombre_completo: 'Nombre completo',
    telefono: 'Teléfono',
    correo: 'Correo',
    direccion: 'Dirección',
    tramite_estado: 'Estado trámite',
    confirmacion_estado: 'Estado confirmación',
    cargar_pdf_estado: 'Estado cargar PDF',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todos los trámites con paginación
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().tramitesStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setTramites(results));
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
 * Cargar etiquetas para el select del formulario
 */
export const loadEtiquetasThunk = () => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.etiquetas, { params: { page_size: 1000 } });
      const etiquetas = response.data.results || response.data;
      dispatch(setEtiquetas(etiquetas));
    } catch (error) {
      console.error('Error cargando etiquetas:', error);
    }
  };
};

/**
 * Cargar tarifarios SOAT para el select del formulario
 */
export const loadTarifariosThunk = () => {
  return async (dispatch) => {
    try {
      const response = await api.get(API_URLS.tarifarios, { params: { page_size: 1000 } });
      const tarifarios = response.data.results || response.data;
      dispatch(setTarifarios(tarifarios));
    } catch (error) {
      console.error('Error cargando tarifarios:', error);
    }
  };
};

/**
 * Cargar datos auxiliares para los formularios
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadClientesThunk());
    dispatch(loadEtiquetasThunk());
    dispatch(loadTarifariosThunk());
  };
};

/**
 * Obtener un trámite por ID
 */
export const showThunk = (tramiteId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando trámite...'));

      const response = await api.get(API_URLS.detail(tramiteId));

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
 * Crear un nuevo trámite
 */
export const createThunk = (tramiteData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando trámite...'));

      const cleanData = {};
      Object.entries(tramiteData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite creado!',
        'El nuevo trámite ha sido registrado correctamente.',
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
 * Actualizar un trámite existente
 */
export const updateThunk = (tramiteId, tramiteData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando trámite...'));

      const cleanData = {};
      Object.entries(tramiteData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(tramiteId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite actualizado!',
        'Los datos del trámite han sido actualizados correctamente.',
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
 * Eliminar un trámite (soft delete)
 */
export const deleteThunk = (tramite) => {
  return async (dispatch) => {
    try {
      const tramiteName = `Trámite #${tramite.id} - ${tramite.placa || 'Sin placa'}`;
      const result = await AlertService.confirmDelete(tramiteName);

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando trámite...'));

      await api.delete(API_URLS.delete(tramite.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite eliminado!',
        'El trámite ha sido eliminado correctamente.',
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
 * Restaurar un trámite eliminado
 */
export const restoreThunk = (tramite) => {
  return async (dispatch) => {
    try {
      const tramiteName = `Trámite #${tramite.id} - ${tramite.placa || 'Sin placa'}`;
      const result = await AlertService.confirm(
        '¿Restaurar trámite?',
        `¿Está seguro que desea restaurar el <strong>${tramiteName}</strong>?`
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando trámite...'));

      await api.post(API_URLS.restore(tramite.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite restaurado!',
        'El trámite ha sido restaurado correctamente.',
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
 * Eliminar permanentemente un trámite
 */
export const hardDeleteThunk = (tramite) => {
  return async (dispatch) => {
    try {
      const tramiteName = `Trámite #${tramite.id} - ${tramite.placa || 'Sin placa'}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${tramiteName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(tramite.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite eliminado permanentemente!',
        'El trámite ha sido eliminado permanentemente.',
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
 * Guardar trámite (crear o actualizar según si tiene ID)
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
 * Ver detalles de un trámite
 */
export const viewThunk = (tramite) => {
  return async () => {
    const fechaCreacion = tramite.created_at
      ? new Date(tramite.created_at).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    await AlertService.info(
      `Trámite #${tramite.id} - ${tramite.placa || 'Sin placa'}`,
      `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h4 style="margin: 0 0 8px; color: #1976d2;">Datos generales</h4>
          <p><strong>Cliente:</strong> ${tramite.cliente?.nombre || '-'}</p>
          <p><strong>Etiqueta:</strong> ${tramite.etiqueta?.nombre || '-'}</p>
          <p><strong>Tipo de trámite:</strong> ${tramite.tipo_tramite_display || tramite.tipo_tramite || '-'}</p>
          <p><strong>Tipo de vehículo:</strong> ${tramite.tipo_vehiculo_display || tramite.tipo_vehiculo || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Tarifa SOAT</h4>
          <p><strong>Grupo SOAT:</strong> ${tramite.grupo_soat_display || tramite.grupo_soat || '-'}</p>
          <p><strong>Código de tarifa:</strong> ${tramite.tarifa_codigo || '-'}</p>
          <p><strong>Tarifa manual:</strong> ${tramite.tarifa_manual ? 'Sí' : 'No'}</p>
          <p><strong>Precio de ley:</strong> ${tramite.precio_lay || '-'}</p>
          <p><strong>Comisión:</strong> ${tramite.comision || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del titular</h4>
          <p><strong>Tipo documento:</strong> ${tramite.tipo_documento_display || tramite.tipo_documento || '-'}</p>
          <p><strong>No. documento:</strong> ${tramite.numero_documento || '-'}</p>
          <p><strong>Nombre completo:</strong> ${tramite.nombre_completo || '-'}</p>
          <p><strong>Teléfono:</strong> ${tramite.telefono || '-'}</p>
          <p><strong>Correo:</strong> ${tramite.correo || '-'}</p>
          <p><strong>Dirección:</strong> ${tramite.direccion || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del vehículo</h4>
          <p><strong>Placa:</strong> ${tramite.placa || '-'}</p>
          <p><strong>Clase:</strong> ${tramite.clase || '-'}</p>
          <p><strong>Marca / Línea:</strong> ${tramite.marca || '-'} / ${tramite.linea || '-'}</p>
          <p><strong>Modelo:</strong> ${tramite.modelo || '-'}</p>
          <p><strong>Cilindraje:</strong> ${tramite.cilindraje || '-'}</p>
          <p><strong>Capacidad de carga:</strong> ${tramite.capacidad_carga || '-'}</p>
          <p><strong>Chasis:</strong> ${tramite.chasis || '-'}</p>
          <p><strong>VIN:</strong> ${tramite.vin || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Estados</h4>
          <p><strong>Trámite:</strong> ${tramite.tramite_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Confirmación:</strong> ${tramite.confirmacion_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Cargar PDF:</strong> ${tramite.cargar_pdf_estado === '1' ? 'Activo' : 'Inactivo'}</p>

          <hr style="margin: 12px 0; border-color: #eee;" />
          <p><strong>Registrado por:</strong> ${tramite.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${fechaCreacion}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un trámite
 */
export const getHistoryThunk = (tramiteId, params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const { historyPagination } = getState().tramitesStore;
      const page = params.page || historyPagination.page;
      const pageSize = params.page_size || historyPagination.pageSize;

      const response = await api.get(API_URLS.history(tramiteId), {
        params: { page, page_size: pageSize },
      });

      const { count, results } = response.data;

      dispatch(setHistory({
        history_data: results || [],
        count,
        page,
        pageSize,
      }));

      dispatch(hideBackdrop());

    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Cambiar estado del trámite al siguiente paso
 * paso: 'confirmacion' | 'cargaro'
 */
export const cambiarEstadoThunk = (tramiteId, paso) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando estado...'));

      const response = await api.post(API_URLS.cambiarEstado(tramiteId), { paso });

      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Estado actualizado!',
        response.data?.message || 'El estado del trámite ha sido actualizado.',
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
 * Revertir estado del trámite al paso anterior
 * paso: 'tramite' | 'confirmacion'
 */
export const revertirEstadoThunk = (tramiteId, paso) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Revirtiendo estado...'));

      const response = await api.post(API_URLS.revertirEstado(tramiteId), { paso });

      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Estado revertido!',
        response.data?.message || 'El estado del trámite ha sido revertido.',
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
 * Construye el payload para crear un trámite a partir del estado actual del
 * Cotizador (Step 7) + datos RUNT.
 */
const construirPayloadTramite = (cotizador, runt) => {
  const clienteId = cotizador.clienteSeleccionado?.id || null;

  let tipoDocumento = cotizador.tipoDocumento || 'CC';
  let numeroDocumento = cotizador.consultaDocumento || '';
  if (cotizador.titularCotizacion === 'TERCERO') {
    tipoDocumento = cotizador.terceroTipoDocumento || 'CC';
    numeroDocumento = cotizador.terceroDocumento || '';
  }

  let nombreCompleto = '';
  if (runt?.nombres || runt?.apellidos) {
    nombreCompleto = `${runt.nombres || ''} ${runt.apellidos || ''}`.trim();
  }
  if (!nombreCompleto && cotizador.clienteSeleccionado?.nombre) {
    nombreCompleto = cotizador.clienteSeleccionado.nombre;
  }

  const telefono = cotizador.celularCotizacion
    || cotizador.consultaTelefono
    || cotizador.clienteSeleccionado?.telefono
    || '';
  const direccion = cotizador.clienteSeleccionado?.direccion || '';

  // Precio del cliente que COINCIDE con la tarifa resuelta (cruce por codigo_tarifa),
  // no el primero de la lista. De ahí sale la comisión que se envía al trámite.
  const objetivoTarifa = cotizador.tarifaCodigo !== null && cotizador.tarifaCodigo !== undefined && cotizador.tarifaCodigo !== ''
    ? String(cotizador.tarifaCodigo).trim()
    : null;
  const precioCliente = objetivoTarifa
    ? (cotizador.preciosCliente || []).find(
        (p) => String(p.codigo_tarifa_codigo ?? '').trim() === objetivoTarifa
      ) || null
    : null;

  return {
    cliente: clienteId,
    etiqueta: null,
    precio_cliente: precioCliente?.id || null,
    tarifario_soat: cotizador.tarifaDetalle?.id || null,

    tipo_tramite: cotizador.tipoTramite || 'SOAT',
    tipo_vehiculo: cotizador.tipoVehiculo || '',
    // El backend deriva la entidad por defecto del tipo_vehiculo si no se envía
    // (USADO → MUNDIAL, CERO_KM → PREVISORA).

    grupo_soat: cotizador.grupoSoat || '',
    grupo_clase_runt: cotizador.grupoClaseRunt || '',
    grupo_subcriterio: cotizador.grupoSubcriterio || '',
    modulo_pregunta1: cotizador.moduloPregunta1 || '',
    modulo_pregunta2: cotizador.moduloPregunta2 || '',
    tarifa_codigo: cotizador.tarifaCodigo ? String(cotizador.tarifaCodigo) : '',
    tarifa_manual: !!cotizador.tarifaManual,

    precio_lay: cotizador.tarifaDetalle?.valor || null,
    comision: precioCliente?.comision ?? null,

    placa: runt?.placa || cotizador.datosManual?.placa || '',
    clase: runt?.clase || cotizador.datosManual?.clase || '',
    tipo_servicio: runt?.tipo_servicio || cotizador.datosManual?.tipoServicio || '',
    marca: runt?.marca || cotizador.datosManual?.marca || '',
    linea: runt?.linea || cotizador.datosManual?.linea || '',
    modelo: String(runt?.modelo || cotizador.datosManual?.modelo || '').slice(0, 4),
    color: runt?.color || '',
    cilindraje: String(runt?.cilindraje || cotizador.datosManual?.cilindraje || '').slice(0, 10),
    pasajeros_sentados: String(runt?.pasajeros_sentados || '').slice(0, 10),
    capacidad_carga: String(runt?.capacidad_carga || '').slice(0, 20),
    peso_bruto: String(runt?.peso_bruto || '').slice(0, 20),
    chasis: String(runt?.num_chasis || '').slice(0, 50),
    vin: String(runt?.vin || '').slice(0, 50),

    tipo_documento: tipoDocumento,
    numero_documento: numeroDocumento,
    nombre_completo: nombreCompleto,
    telefono: telefono,
    correo: '',
    direccion: direccion,
  };
};

/**
 * Enviar trámite desde el flujo del Cotizador (Step 7 → "Enviar a Trámites").
 * Lee cotizadorStore + apisExternasRuntStore, construye payload y hace POST a
 * /api/tramites/create/. Muestra alerta de éxito/error.
 */
export const enviarTramiteDesdeCotizadorThunk = () => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const cotizador = state.cotizadorStore;
      const runt = state.apisExternasRuntStore;

      const clienteId = cotizador.clienteSeleccionado?.id || null;
      if (!clienteId) {
        AlertService.error(
          'Cliente requerido',
          'Debes seleccionar un cliente antes de enviar a trámites.'
        );
        return null;
      }

      if (!cotizador.tarifaCodigo) {
        AlertService.error(
          'Tarifa requerida',
          'Debes resolver el grupo SOAT y la tarifa antes de enviar a trámites.'
        );
        return null;
      }

      // ═══ Primera confirmación: resumen del trámite a enviar ═══
      const placa = runt?.placa || cotizador.datosManual?.placa || '(sin placa)';
      const clienteNombre = cotizador.clienteSeleccionado?.nombre || '(sin cliente)';
      const grupo = cotizador.grupoSoat || '-';
      const tarifaCod = cotizador.tarifaCodigo || '-';
      const tarifaDescr = cotizador.tarifaDetalle?.descripcion || '';
      const tarifaValor = cotizador.tarifaDetalle?.valor
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cotizador.tarifaDetalle.valor)
        : '-';

      const primera = await AlertService.confirm(
        '¿Enviar este trámite?',
        `
          <div style="text-align: left; background: #f5f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #1976d2;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #1976d2;">Se registrará el siguiente trámite:</p>
            <p style="margin: 4px 0;"><strong>Cliente:</strong> ${clienteNombre}</p>
            <p style="margin: 4px 0;"><strong>Placa:</strong> ${placa}</p>
            <p style="margin: 4px 0;"><strong>Grupo SOAT:</strong> ${grupo}</p>
            <p style="margin: 4px 0;"><strong>Tarifa:</strong> ${tarifaCod}${tarifaDescr ? ` — ${tarifaDescr}` : ''}</p>
            <p style="margin: 4px 0;"><strong>Valor:</strong> ${tarifaValor}</p>
          </div>
          <p style="margin-top: 12px;">Verifica que los datos sean correctos antes de continuar.</p>
        `,
        {
          icon: 'question',
          confirmText: 'Sí, revisar datos',
          cancelText: 'Cancelar',
        }
      );
      if (!primera.isConfirmed) return null;

      // ═══ Segunda confirmación: advertencia final ═══
      const segunda = await AlertService.confirm(
        '¿Confirmar envío definitivo?',
        `
          <div style="text-align: left; background: #fff8e1; padding: 16px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #e65100;">⚠ Esta acción es definitiva</p>
            <p style="margin: 4px 0;">Al confirmar, se creará un registro permanente en el módulo de Trámites asociado a <strong>${placa}</strong>.</p>
            <p style="margin: 4px 0;">El trámite quedará en estado activo y aparecerá en el listado de trámites para seguimiento.</p>
          </div>
          <p style="margin-top: 12px; font-weight: 500;">¿Deseas continuar?</p>
        `,
        {
          icon: 'warning',
          confirmText: 'Sí, enviar a Trámites',
          cancelText: 'Revisar nuevamente',
        }
      );
      if (!segunda.isConfirmed) return null;

      dispatch(showBackdrop('Enviando a trámites...'));

      const payload = construirPayloadTramite(cotizador, runt);
      const response = await api.post(API_URLS.create, payload);

      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Trámite enviado!',
        `El trámite #${response.data?.id} fue registrado correctamente para la placa <strong>${response.data?.placa || '-'}</strong>.`,
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

/**
 * Construye el payload para crear un registro de pasarela a partir de un trámite
 * existente. Copia todos los campos de snapshot y referencia el tramite_origen.
 */
const construirPayloadPasarela = (tramite) => ({
  tramite_origen: tramite.id,
  cliente: tramite.cliente?.id || null,
  etiqueta: tramite.etiqueta?.id || null,
  precio_cliente: tramite.precio_cliente?.id || null,
  tarifario_soat: tramite.tarifario_soat?.id || null,

  tipo_tramite: tramite.tipo_tramite || 'SOAT',
  tipo_vehiculo: tramite.tipo_vehiculo || '',
  entidad: tramite.entidad || '',

  grupo_soat: tramite.grupo_soat || '',
  grupo_clase_runt: tramite.grupo_clase_runt || '',
  grupo_subcriterio: tramite.grupo_subcriterio || '',
  modulo_pregunta1: tramite.modulo_pregunta1 || '',
  modulo_pregunta2: tramite.modulo_pregunta2 || '',
  tarifa_codigo: tramite.tarifa_codigo || '',
  tarifa_manual: !!tramite.tarifa_manual,

  precio_lay: tramite.precio_lay || null,
  comision: tramite.comision || null,

  placa: tramite.placa || '',
  clase: tramite.clase || '',
  tipo_servicio: tramite.tipo_servicio || '',
  marca: tramite.marca || '',
  linea: tramite.linea || '',
  modelo: tramite.modelo || '',
  color: tramite.color || '',
  cilindraje: tramite.cilindraje || '',
  pasajeros_sentados: tramite.pasajeros_sentados || '',
  capacidad_carga: tramite.capacidad_carga || '',
  peso_bruto: tramite.peso_bruto || '',
  chasis: tramite.chasis || '',
  vin: tramite.vin || '',

  tipo_documento: tramite.tipo_documento || 'CC',
  numero_documento: tramite.numero_documento || '',
  nombre_completo: tramite.nombre_completo || '',
  telefono: tramite.telefono || '',
  correo: tramite.correo || '',
  direccion: tramite.direccion || '',

  // Snapshot del link de pago generado (para que viaje a Pasarela → Finalizados).
  link_pago: tramite.link_pago?.url_pago || '',
});

/**
 * Enviar trámite a Pasarela de Pago.
 *
 * Flujo:
 *   1. Click en el icono → POST inmediato a /pasarela_de_pago/create/ con
 *      pago_estado='pendiente'. El registro aparece en tiempo real para todas
 *      las sesiones que estén viendo Pasarela; el trámite sale del listado de
 *      Trámites para todos. El operario que disparó el envío sigue con los
 *      modales abiertos.
 *   2. Dos confirmaciones SweetAlert (revisar datos / confirmar definitivo).
 *      Cancelar cualquiera marca la pasarela como `no_exitoso`.
 *   3. Modal de timer (3 min). 'Pago exitoso' → pago_estado='exitoso'.
 *      'No éxito' o expiración → pago_estado='no_exitoso'.
 *
 * El registro nunca se borra: queda en Pasarela con su estado de pago final
 * como evidencia auditable del intento.
 *
 * `esperarConfirmacionPago` (opcional): callback async que abre el modal
 * de timer. Resuelve `{ exitoso, observacion, tarjeta }`.
 */
export const enviarAPasarelaDesdeTramiteThunk = (tramite, { esperarConfirmacionPago } = {}) => {
  return async (dispatch) => {
    if (!tramite?.id) {
      AlertService.error('Trámite inválido', 'No se pudo identificar el trámite a enviar.');
      return null;
    }

    const placa = tramite.placa || '(sin placa)';
    const clienteNombre = tramite.cliente?.nombre || '(sin cliente)';
    const tarifaCod = tramite.tarifa_codigo || '-';
    const tarifaValor = tramite.precio_lay
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(tramite.precio_lay)
      : '-';

    // Link de pago generado automáticamente: bloque HTML reutilizable para las
    // alertas (con botones Copiar/Abrir) y handler para cablear el botón Copiar.
    const urlPago = tramite.link_pago?.url_pago || '';
    const urlPagoEsc = escapeHtml(urlPago);
    const linkProveedor = tramite.link_pago?.proveedor ? ` · ${escapeHtml(tramite.link_pago.proveedor)}` : '';
    const linkPagoHtml = urlPago
      ? `<div style="margin-top:12px; padding:10px 12px; border:1px solid #2e7d32; border-radius:8px; background:#e8f5e9; text-align:left;">
           <p style="margin:0 0 6px; font-weight:600; color:#2e7d32;">Link de pago${linkProveedor}</p>
           <a href="${urlPagoEsc}" target="_blank" rel="noopener" style="word-break:break-all; font-size:0.8rem; color:#1565c0;">${urlPagoEsc}</a>
           <div style="margin-top:10px; display:flex; gap:8px;">
             <button id="swal-copiar-link" type="button" style="cursor:pointer; padding:6px 12px; border:1px solid #2e7d32; border-radius:6px; background:#fff; color:#2e7d32; font-weight:600;">Copiar</button>
             <a href="${urlPagoEsc}" target="_blank" rel="noopener" style="padding:6px 12px; border:1px solid #1565c0; border-radius:6px; background:#fff; color:#1565c0; font-weight:600; text-decoration:none;">Abrir</a>
           </div>
         </div>`
      : `<p style="margin-top:12px; color:#888; font-size:0.85rem;">Link de pago aún no disponible (generándose o falló su generación).</p>`;
    const wireCopiarLink = () => {
      const btn = document.getElementById('swal-copiar-link');
      if (btn && urlPago) {
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(urlPago);
          btn.textContent = 'Copiado ✓';
        });
      }
    };

    // ─── 1) POST inmediato al click ───
    let response;
    let pasarelaId = null;
    try {
      dispatch(showBackdrop('Enviando a pasarela...'));
      const payload = construirPayloadPasarela(tramite);
      payload.pago_estado = 'pendiente';
      response = await api.post(API_URLS.pasarelaCreate, payload);
      pasarelaId = response.data?.id || null;
      // El trámite ya tiene pasarela activa → el backend lo excluye del listado.
      dispatch(listAllThunk());
    } catch (error) {
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    } finally {
      dispatch(hideBackdrop());
    }

    // Helper interno: marca la pasarela con un estado final. Best-effort,
    // si falla no rompe el flujo (el registro ya existe en Pasarela).
    const marcarPago = async ({ pago_estado, observacion = '', tarjeta = null, comprobante = null }) => {
      if (!pasarelaId) return;
      try {
        if (comprobante) {
          // Con comprobante → multipart/form-data (el backend lo lee de request.FILES).
          const fd = new FormData();
          fd.append('pago_estado', pago_estado);
          fd.append('observacion', observacion || '');
          if (tarjeta) fd.append('tarjeta', tarjeta);
          fd.append('comprobante_pago', comprobante);
          await apiService.postForm(API_URLS.pasarelaConfirmarPago(pasarelaId), fd);
        } else {
          await api.post(API_URLS.pasarelaConfirmarPago(pasarelaId), {
            pago_estado,
            observacion,
            tarjeta,
          });
        }
      } catch (err) {
        console.warn('[enviarAPasarelaDesdeTramiteThunk] confirmar-pago falló:', err);
      }
    };

    try {
      // ─── 2) Confirmación 1 (revisar datos) ───
      const primera = await AlertService.confirm(
        '¿Enviar este trámite a Pasarela de Pago?',
        `
          <div style="text-align: left; background: #f5f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #1976d2;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #1976d2;">El registro ya está visible en Pasarela de Pago (estado: pendiente). Verifica los datos:</p>
            <p style="margin: 4px 0;"><strong>Pasarela:</strong> #${pasarelaId ?? '-'}</p>
            <p style="margin: 4px 0;"><strong>Trámite origen:</strong> #${tramite.id}</p>
            <p style="margin: 4px 0;"><strong>Cliente:</strong> ${clienteNombre}</p>
            <p style="margin: 4px 0;"><strong>Placa:</strong> ${placa}</p>
            <p style="margin: 4px 0;"><strong>Tarifa:</strong> ${tarifaCod}</p>
            <p style="margin: 4px 0;"><strong>Valor:</strong> ${tarifaValor}</p>
          </div>
          ${linkPagoHtml}
        `,
        {
          icon: 'question',
          confirmText: 'Sí, continuar',
          cancelText: 'Cancelar (marcar no exitoso)',
          didOpen: wireCopiarLink,
        }
      );
      if (!primera.isConfirmed) {
        await marcarPago({ pago_estado: 'no_exitoso', observacion: 'Cancelado en confirmación 1' });
        return response.data;
      }

      // ─── Confirmación 2 (envío definitivo) ───
      const segunda = await AlertService.confirm(
        '¿Confirmar envío definitivo?',
        `
          <div style="text-align: left; background: #fff8e1; padding: 16px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #e65100;">⚠ Esta acción procede al paso de cobro</p>
            <p style="margin: 4px 0;">El trámite <strong>#${tramite.id} - ${placa}</strong> está en Pasarela como pendiente. A continuación se abrirá el cronómetro de pago.</p>
          </div>
          <p style="margin-top: 12px; font-weight: 500;">¿Deseas continuar?</p>
        `,
        {
          icon: 'warning',
          confirmText: 'Sí, abrir cronómetro',
          cancelText: 'Cancelar (marcar no exitoso)',
        }
      );
      if (!segunda.isConfirmed) {
        await marcarPago({ pago_estado: 'no_exitoso', observacion: 'Cancelado en confirmación 2' });
        return response.data;
      }

      // ─── 3) Modal de timer (3 min) ───
      if (typeof esperarConfirmacionPago === 'function') {
        // Re-traer el trámite fresco (con sub-cuentas de cliente / proveedor /
        // ingresos) por si el row del listado quedó obsoleto respecto al
        // serializer del backend. Si falla, se usa el row capturado.
        let tramiteModal = tramite;
        try {
          const fresco = await api.get(API_URLS.detail(tramite.id));
          if (fresco?.data) tramiteModal = fresco.data;
        } catch (_) {
          /* sin conexión / detalle no disponible: usamos el row original */
        }
        const resultado = await esperarConfirmacionPago(tramiteModal);
        const esObjeto = typeof resultado === 'object' && resultado !== null;
        const exitoso = esObjeto ? Boolean(resultado.exitoso) : Boolean(resultado);
        const observacionPago = esObjeto && resultado.observacion
          ? String(resultado.observacion).trim()
          : '';
        const tarjetaPago = esObjeto && resultado.tarjeta ? resultado.tarjeta : null;
        const comprobantePago = esObjeto && resultado.comprobante ? resultado.comprobante : null;

        await marcarPago({
          pago_estado: exitoso ? 'exitoso' : 'no_exitoso',
          observacion: observacionPago,
          tarjeta: tarjetaPago,
          comprobante: comprobantePago,
        });

        await AlertService.success(
          exitoso ? '¡Pago confirmado!' : 'Pago marcado como no exitoso',
          exitoso
            ? `El pago de la placa <strong>${response.data?.placa || '-'}</strong> fue confirmado. El trámite pasó directo a <strong>Trámites Finalizados</strong> y salió de Pasarela.`
            : `El registro de pasarela #${pasarelaId} se conservó marcado como pago no exitoso. Revisa la observación si necesitas dar seguimiento.`,
          { timer: 3500 }
        );
      } else {
        // Sin callback de UI: dejamos el registro en 'pendiente'.
        await AlertService.success(
          '¡Enviado a Pasarela!',
          `El registro de pasarela #${pasarelaId} fue creado correctamente para la placa <strong>${response.data?.placa || '-'}</strong>. El trámite fue retirado del listado.`,
          { timer: 3500 }
        );
      }

      return response.data;
    } catch (error) {
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Trae UN tramite por id y lo inserta al inicio del listado SIN tocar
 * `loading` ni mostrar backdrop. Usado por el hook de tiempo real cuando
 * llega `tramite_restored`: evita el spinner del listado completo.
 */
export const fetchTramiteSilentThunk = (tramiteId) => {
  return async (dispatch) => {
    if (tramiteId == null) return null;
    try {
      const response = await api.get(API_URLS.detail(tramiteId));
      dispatch(prependTramite(response.data));
      return response.data;
    } catch (error) {
      console.warn('[fetchTramiteSilentThunk] error:', error?.response?.status, tramiteId);
      return null;
    }
  };
};

/**
 * Extrae la URL del link de pago desde la respuesta del servicio externo,
 * probando los nombres de campo conocidos (la forma exacta depende del proveedor).
 */
const extraerUrlPago = (data) =>
  data?.data?.urlPago || data?.data?.url || data?.data?.link || data?.data?.urlpago ||
  data?.data?.linkPago || data?.urlPago || data?.url || data?.link || null;

/**
 * Genera el link de pago de Previsora para un trámite.
 * payload: { placa, tipodocumento, documento, nombre, nombre2?, apellido, apellido2?, telefono, correo? }
 * El backend toma un correo aleatorio del pool si no se envía `correo`.
 * Devuelve { proveedor, url, correo_usado, raw, payload } o null si falla.
 */
export const generarLinkPrevisoraThunk = (payload) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Generando link de Previsora...'));
      const response = await api.post(API_URLS.generarLinkPrevisora, payload);
      const data = response.data || {};
      dispatch(hideBackdrop());
      return {
        proveedor: 'previsora',
        url: extraerUrlPago(data),
        correo_usado: data.correo_usado || null,
        raw: data.data,
        payload: data.payload || payload,
      };
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Genera el link de pago de Mundial para un trámite.
 * payload: { placa, tipo_documento, nro_documento, telefono, email? }
 * El backend toma un correo aleatorio del pool si no se envía `email`.
 * Devuelve { proveedor, url, correo_usado, raw, payload } o null si falla.
 */
export const generarLinkMundialThunk = (payload) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Generando link de Mundial...'));
      const response = await api.post(API_URLS.generarLinkMundial, payload);
      const data = response.data || {};
      dispatch(hideBackdrop());
      return {
        proveedor: 'mundial',
        url: extraerUrlPago(data),
        correo_usado: data.correo_usado || null,
        raw: data.data,
        payload: data.payload || payload,
      };
    } catch (error) {
      dispatch(hideBackdrop());
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
      return null;
    }
  };
};

/**
 * Reintenta la generación automática (asíncrona) del link de pago de un trámite.
 * El backend re-encola la tarea Celery; el estado real llega luego por WebSocket
 * (link_pago_started/done). Aquí solo marcamos la fila como 'pendiente' de
 * inmediato para feedback óptimista (la barra indeterminada vuelve a aparecer).
 */
export const reintentarLinkPagoThunk = (tramiteId) => {
  return async (dispatch) => {
    try {
      await api.post(API_URLS.reintentarLinkPago(tramiteId));
      dispatch(updateLinkPagoEstado({ tramite_id: tramiteId, link_pago: { estado: 'pendiente', error_mensaje: '' } }));
    } catch (error) {
      const { title, htmlMessage } = extractApiError(error);
      AlertService.error(title, htmlMessage);
    }
  };
};
