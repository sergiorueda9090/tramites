import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import { selectMotivosCasoEspecial } from '../cotizadorStore/cotizadorSlice';
import {
  setLoading,
  setError,
  setCasosEspeciales,
  setClientes,
  setEtiquetas,
  setPagination,
  closeModal,
  openEditModal,
  setHistory,
} from './casosEspecialesStore';

// URLs del módulo casos especiales
const API_URLS = {
  list: '/api/casos_especiales/list/',
  detail: (id) => `/api/casos_especiales/${id}/`,
  create: '/api/casos_especiales/create/',
  update: (id) => `/api/casos_especiales/${id}/update/`,
  delete: (id) => `/api/casos_especiales/${id}/delete/`,
  restore: (id) => `/api/casos_especiales/${id}/restore/`,
  hardDelete: (id) => `/api/casos_especiales/${id}/hard-delete/`,
  history: (id) => `/api/casos_especiales/${id}/history/`,
  cambiarEstado: (id) => `/api/casos_especiales/${id}/cambiar-estado/`,
  revertirEstado: (id) => `/api/casos_especiales/${id}/revertir-estado/`,
  // URLs auxiliares para selects
  clientes: '/api/clientes/list/',
  etiquetas: '/api/etiquetas/list/',
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
    etiqueta: 'Etiqueta',
    precio_cliente: 'Precio cliente',
    descripcion: 'Descripción',
    precio_lay: 'Precio de ley',
    comision: 'Comisión',
    placa: 'Placa',
    clindraje: 'Cilindraje',
    modelo: 'Modelo',
    chasis: 'Chasis',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
    nombre_completo: 'Nombre completo',
    telefono: 'Teléfono',
    correo: 'Correo',
    direccion: 'Dirección',
    caso_especial_estado: 'Estado caso especial',
    tramite_estado: 'Estado trámite',
    confirmacion_estado: 'Estado confirmación',
    cargar_pdf_estado: 'Estado cargar PDF',
    detail: 'Detalle',
    non_field_errors: 'Error',
  };
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
};

/**
 * Obtener todos los casos especiales con paginación
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().casosEspecialesStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setCasosEspeciales(results));
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
 * Cargar datos auxiliares para los formularios
 */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadClientesThunk());
    dispatch(loadEtiquetasThunk());
  };
};

/**
 * Obtener un caso especial por ID
 */
export const showThunk = (casoId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando caso especial...'));

      const response = await api.get(API_URLS.detail(casoId));

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
 * Crear un nuevo caso especial
 */
export const createThunk = (casoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando caso especial...'));

      const cleanData = {};
      Object.entries(casoData).forEach(([key, value]) => {
        if (key === 'id' && !value) return;
        if (value === '' || value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.post(API_URLS.create, cleanData);

      dispatch(closeModal());
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Caso especial creado!',
        'El nuevo caso especial ha sido registrado correctamente.',
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
 * Actualizar un caso especial existente
 */
export const updateThunk = (casoId, casoData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando caso especial...'));

      const cleanData = {};
      Object.entries(casoData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(casoId), cleanData);

      dispatch(listAllThunk());
      dispatch(closeModal());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Caso especial actualizado!',
        'Los datos del caso especial han sido actualizados correctamente.',
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
 * Eliminar un caso especial (soft delete)
 */
export const deleteThunk = (caso) => {
  return async (dispatch) => {
    try {
      const casoName = `Caso #${caso.id} - ${caso.placa || 'Sin placa'}`;
      const result = await AlertService.confirmDelete(casoName);

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando caso especial...'));

      await api.delete(API_URLS.delete(caso.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Caso especial eliminado!',
        'El caso especial ha sido eliminado correctamente.',
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
 * Restaurar un caso especial eliminado
 */
export const restoreThunk = (caso) => {
  return async (dispatch) => {
    try {
      const casoName = `Caso #${caso.id} - ${caso.placa || 'Sin placa'}`;
      const result = await AlertService.confirm(
        '¿Restaurar caso especial?',
        `¿Está seguro que desea restaurar el <strong>${casoName}</strong>?`
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando caso especial...'));

      await api.post(API_URLS.restore(caso.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Caso especial restaurado!',
        'El caso especial ha sido restaurado correctamente.',
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
 * Eliminar permanentemente un caso especial
 */
export const hardDeleteThunk = (caso) => {
  return async (dispatch) => {
    try {
      const casoName = `Caso #${caso.id} - ${caso.placa || 'Sin placa'}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${casoName}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(caso.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Caso especial eliminado permanentemente!',
        'El caso especial ha sido eliminado permanentemente.',
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
 * Guardar caso especial (crear o actualizar según si tiene ID)
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
 * Ver detalles de un caso especial
 */
export const viewThunk = (caso) => {
  return async () => {
    const fechaCreacion = caso.created_at
      ? new Date(caso.created_at).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    await AlertService.info(
      `Caso especial #${caso.id} - ${caso.placa || 'Sin placa'}`,
      `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h4 style="margin: 0 0 8px; color: #1976d2;">Datos generales</h4>
          <p><strong>Cliente:</strong> ${caso.cliente?.nombre || '-'}</p>
          <p><strong>Etiqueta:</strong> ${caso.etiqueta?.nombre || '-'}</p>
          <p><strong>Descripción:</strong> ${caso.descripcion || '-'}</p>
          <p><strong>Precio de ley:</strong> ${caso.precio_lay || '-'}</p>
          <p><strong>Comisión:</strong> ${caso.comision || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del titular</h4>
          <p><strong>Tipo documento:</strong> ${caso.tipo_documento_display || caso.tipo_documento || '-'}</p>
          <p><strong>No. documento:</strong> ${caso.numero_documento || '-'}</p>
          <p><strong>Nombre completo:</strong> ${caso.nombre_completo || '-'}</p>
          <p><strong>Teléfono:</strong> ${caso.telefono || '-'}</p>
          <p><strong>Correo:</strong> ${caso.correo || '-'}</p>
          <p><strong>Dirección:</strong> ${caso.direccion || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del vehículo</h4>
          <p><strong>Placa:</strong> ${caso.placa || '-'}</p>
          <p><strong>Cilindraje:</strong> ${caso.clindraje || '-'}</p>
          <p><strong>Modelo:</strong> ${caso.modelo || '-'}</p>
          <p><strong>Chasis:</strong> ${caso.chasis || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Estados</h4>
          <p><strong>Caso especial:</strong> ${caso.caso_especial_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Trámite:</strong> ${caso.tramite_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Confirmación:</strong> ${caso.confirmacion_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Cargar PDF:</strong> ${caso.cargar_pdf_estado === '1' ? 'Activo' : 'Inactivo'}</p>

          <hr style="margin: 12px 0; border-color: #eee;" />
          <p><strong>Registrado por:</strong> ${caso.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${fechaCreacion}</p>
        </div>
      `
    );
  };
};

/**
 * Obtener historial de cambios de un caso especial
 */
export const getHistoryThunk = (casoId, params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const { historyPagination } = getState().casosEspecialesStore;
      const page = params.page || historyPagination.page;
      const pageSize = params.page_size || historyPagination.pageSize;

      const response = await api.get(API_URLS.history(casoId), {
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
 * Cambiar estado del caso especial al siguiente paso
 * paso: 'tramite' | 'confirmacion' | 'cargaro'
 */
export const cambiarEstadoThunk = (casoId, paso) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando estado...'));

      const response = await api.post(API_URLS.cambiarEstado(casoId), { paso });

      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Estado actualizado!',
        response.data?.message || 'El estado del caso especial ha sido actualizado.',
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
 * Construye una descripción amigable explicando el motivo por el cual
 * este vehículo fue clasificado como caso especial, reutilizando la lista
 * de motivos calculada por el selector del cotizador.
 */
const construirDescripcionCasoEspecial = (motivos) => {
  if (!Array.isArray(motivos) || motivos.length === 0) {
    return 'Caso especial detectado desde Cotizador.';
  }
  return `Caso especial detectado: ${motivos.join('; ')}.`;
};

/**
 * Guardar caso especial automáticamente desde el flujo del Cotizador.
 * Se dispara cuando se detecta que el vehículo cumple criterios de caso especial.
 * Lee cotizadorStore + apisExternasRuntStore y envía a /api/casos_especiales/create/.
 * Errores son silenciosos (no bloquean el flujo del cotizador).
 */
export const guardarCasoEspecialDesdeCotizadorThunk = () => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const cotizador = state.cotizadorStore;
      const runt = state.apisExternasRuntStore;

      // Cliente es obligatorio para guardar
      const clienteId = cotizador.clienteSeleccionado?.id || null;
      if (!clienteId) {
        console.warn('CasosEspeciales: No se guardó, no hay cliente seleccionado.');
        return null;
      }

      // Datos del titular
      let tipoDocumento = cotizador.tipoDocumento || 'CC';
      let numeroDocumento = cotizador.consultaDocumento || '';
      if (cotizador.titularCotizacion === 'TERCERO') {
        tipoDocumento = cotizador.terceroTipoDocumento || 'CC';
        numeroDocumento = cotizador.terceroDocumento || '';
      }

      let nombreCompleto = '';
      if (runt.nombres || runt.apellidos) {
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

      // Primer precio del cliente (si existe) para asociar
      const precioCliente = Array.isArray(cotizador.preciosCliente) && cotizador.preciosCliente.length > 0
        ? cotizador.preciosCliente[0]
        : null;

      const motivos = selectMotivosCasoEspecial(state);

      const payload = {
        cliente: clienteId,
        etiqueta: null,
        precio_cliente: precioCliente?.id || null,
        descripcion: construirDescripcionCasoEspecial(motivos),
        precio_lay: cotizador.tarifaDetalle?.valor || precioCliente?.precio_lay || null,
        comision: precioCliente?.comision || null,

        placa: runt.placa || cotizador.datosManual?.placa || '',
        clindraje: String(runt.cilindraje || cotizador.datosManual?.cilindraje || '').slice(0, 10),
        modelo: String(runt.modelo || cotizador.datosManual?.modelo || '').slice(0, 4),
        chasis: String(runt.num_chasis || '').slice(0, 50),

        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        nombre_completo: nombreCompleto,
        telefono: telefono,
        correo: '',
        direccion: direccion,
      };

      await api.post(API_URLS.create, payload);
      console.log('CasosEspeciales: Registro guardado automáticamente desde Cotizador.');

      return true;

    } catch (error) {
      // No bloquear el flujo del cotizador si falla
      console.error('CasosEspeciales: Error al guardar desde Cotizador:', error);
      return null;
    }
  };
};

/**
 * Revertir estado del caso especial al paso anterior
 * paso: 'caso_especial' | 'tramite' | 'confirmacion'
 */
export const revertirEstadoThunk = (casoId, paso) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Revirtiendo estado...'));

      const response = await api.post(API_URLS.revertirEstado(casoId), { paso });

      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Estado revertido!',
        response.data?.message || 'El estado del caso especial ha sido revertido.',
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
