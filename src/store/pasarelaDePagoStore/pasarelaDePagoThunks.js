import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setPasarelas,
  setClientes,
  setEtiquetas,
  setTarifarios,
  setPagination,
  closeModal,
  openEditModal,
  setHistory,
} from './pasarelaDePagoStore';

// URLs del módulo pasarela de pago
const API_URLS = {
  list: '/api/pasarela_de_pago/list/',
  detail: (id) => `/api/pasarela_de_pago/${id}/`,
  create: '/api/pasarela_de_pago/create/',
  update: (id) => `/api/pasarela_de_pago/${id}/update/`,
  delete: (id) => `/api/pasarela_de_pago/${id}/delete/`,
  restore: (id) => `/api/pasarela_de_pago/${id}/restore/`,
  hardDelete: (id) => `/api/pasarela_de_pago/${id}/hard-delete/`,
  history: (id) => `/api/pasarela_de_pago/${id}/history/`,
  cambiarEstado: (id) => `/api/pasarela_de_pago/${id}/cambiar-estado/`,
  revertirEstado: (id) => `/api/pasarela_de_pago/${id}/revertir-estado/`,
  // Auxiliares para selects
  clientes: '/api/clientes/list/',
  etiquetas: '/api/etiquetas/list/',
  tarifarios: '/api/tarifario_soat/list/',
};

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
    tramite_origen: 'Trámite origen',
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
 * Obtener todos los registros de pasarela con paginación
 */
export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const { pagination } = getState().pasarelaDePagoStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const queryParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const response = await api.get(API_URLS.list, { params: queryParams });
      const { count, next, previous, results } = response.data;

      dispatch(setPasarelas(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));

    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

/** Cargar clientes para el select del formulario */
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

/** Cargar etiquetas para el select del formulario */
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

/** Cargar tarifarios SOAT para el select del formulario */
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

/** Cargar datos auxiliares para los formularios */
export const loadAuxDataThunk = () => {
  return async (dispatch) => {
    dispatch(loadClientesThunk());
    dispatch(loadEtiquetasThunk());
    dispatch(loadTarifariosThunk());
  };
};

/** Obtener un registro de pasarela por ID */
export const showThunk = (pasarelaId) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Cargando registro...'));

      const response = await api.get(API_URLS.detail(pasarelaId));

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

/** Crear un nuevo registro de pasarela */
export const createThunk = (pasarelaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Creando registro...'));

      const cleanData = {};
      Object.entries(pasarelaData).forEach(([key, value]) => {
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
        'El registro de pasarela ha sido creado correctamente.',
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

/** Actualizar un registro existente */
export const updateThunk = (pasarelaId, pasarelaData) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando registro...'));

      const cleanData = {};
      Object.entries(pasarelaData).forEach(([key, value]) => {
        if (key === 'id') return;
        if (value === null || value === undefined) return;
        cleanData[key] = value;
      });

      const response = await api.put(API_URLS.update(pasarelaId), cleanData);

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

/** Eliminar un registro (soft delete) */
export const deleteThunk = (pasarela) => {
  return async (dispatch) => {
    try {
      const nombre = `Registro #${pasarela.id} - ${pasarela.placa || 'Sin placa'}`;
      const result = await AlertService.confirmDelete(nombre);

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando registro...'));

      await api.delete(API_URLS.delete(pasarela.id));
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
 * Devolver un registro a Trámites.
 *
 * Semánticamente es lo mismo que un soft-delete de la pasarela: llama al endpoint
 * DELETE /api/pasarela_de_pago/<id>/delete/ que marca `deleted_at`. El backend de
 * Tramites tiene un filtro `exclude(pasarela_pagos__deleted_at__isnull=True)` que
 * hace reaparecer el trámite origen en el listado de Trámites automáticamente.
 */
export const devolverATramitesThunk = (pasarela) => {
  return async (dispatch) => {
    try {
      const placa = pasarela.placa || '(sin placa)';
      const tramiteOrigen = pasarela.tramite_origen ? `#${pasarela.tramite_origen}` : '(sin trámite origen)';

      const primera = await AlertService.confirm(
        '¿Devolver este registro a Trámites?',
        `
          <div style="text-align: left; background: #fff8e1; padding: 16px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #e65100;">El registro saldrá de Pasarela de Pago</p>
            <p style="margin: 4px 0;"><strong>Registro:</strong> #${pasarela.id} — ${placa}</p>
            <p style="margin: 4px 0;"><strong>Trámite origen:</strong> ${tramiteOrigen}</p>
            <p style="margin: 8px 0 0;">El trámite original volverá a aparecer en el módulo de Trámites y podrá ser re-enviado si es necesario.</p>
          </div>
        `,
        {
          icon: 'question',
          confirmText: 'Sí, devolver a Trámites',
          cancelText: 'Cancelar',
        }
      );
      if (!primera.isConfirmed) return false;

      dispatch(showBackdrop('Devolviendo a Trámites...'));

      await api.delete(API_URLS.delete(pasarela.id));
      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Registro devuelto a Trámites!',
        `El trámite ${tramiteOrigen} volverá a estar disponible en el módulo de Trámites.`,
        { timer: 3500 }
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

/** Restaurar un registro eliminado */
export const restoreThunk = (pasarela) => {
  return async (dispatch) => {
    try {
      const nombre = `Registro #${pasarela.id} - ${pasarela.placa || 'Sin placa'}`;
      const result = await AlertService.confirm(
        '¿Restaurar registro?',
        `¿Está seguro que desea restaurar el <strong>${nombre}</strong>?`
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Restaurando registro...'));

      await api.post(API_URLS.restore(pasarela.id));
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

/** Eliminar permanentemente */
export const hardDeleteThunk = (pasarela) => {
  return async (dispatch) => {
    try {
      const nombre = `Registro #${pasarela.id} - ${pasarela.placa || 'Sin placa'}`;
      const result = await AlertService.confirm(
        '¿Eliminar permanentemente?',
        `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Está seguro que desea eliminar permanentemente el <strong>${nombre}</strong>?`,
        { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
      );

      if (!result.isConfirmed) return false;

      dispatch(showBackdrop('Eliminando permanentemente...'));

      await api.delete(API_URLS.hardDelete(pasarela.id));
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

/** Guardar (create o update) */
export const saveThunk = (formData) => {
  return async (dispatch) => {
    if (formData.id) {
      return dispatch(updateThunk(formData.id, formData));
    } else {
      return dispatch(createThunk(formData));
    }
  };
};

/** Ver detalles */
export const viewThunk = (pasarela) => {
  return async () => {
    const fechaCreacion = pasarela.created_at
      ? new Date(pasarela.created_at).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    await AlertService.info(
      `Pasarela #${pasarela.id} - ${pasarela.placa || 'Sin placa'}`,
      `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h4 style="margin: 0 0 8px; color: #1976d2;">Datos generales</h4>
          <p><strong>Trámite origen:</strong> ${pasarela.tramite_origen ? '#' + pasarela.tramite_origen : '-'}</p>
          <p><strong>Cliente:</strong> ${pasarela.cliente?.nombre || '-'}</p>
          <p><strong>Etiqueta:</strong> ${pasarela.etiqueta?.nombre || '-'}</p>
          <p><strong>Tipo de trámite:</strong> ${pasarela.tipo_tramite_display || pasarela.tipo_tramite || '-'}</p>
          <p><strong>Tipo de vehículo:</strong> ${pasarela.tipo_vehiculo_display || pasarela.tipo_vehiculo || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Tarifa SOAT</h4>
          <p><strong>Grupo SOAT:</strong> ${pasarela.grupo_soat_display || pasarela.grupo_soat || '-'}</p>
          <p><strong>Código de tarifa:</strong> ${pasarela.tarifa_codigo || '-'}</p>
          <p><strong>Tarifa manual:</strong> ${pasarela.tarifa_manual ? 'Sí' : 'No'}</p>
          <p><strong>Precio de ley:</strong> ${pasarela.precio_lay || '-'}</p>
          <p><strong>Comisión:</strong> ${pasarela.comision || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del titular</h4>
          <p><strong>Tipo documento:</strong> ${pasarela.tipo_documento_display || pasarela.tipo_documento || '-'}</p>
          <p><strong>No. documento:</strong> ${pasarela.numero_documento || '-'}</p>
          <p><strong>Nombre completo:</strong> ${pasarela.nombre_completo || '-'}</p>
          <p><strong>Teléfono:</strong> ${pasarela.telefono || '-'}</p>
          <p><strong>Correo:</strong> ${pasarela.correo || '-'}</p>
          <p><strong>Dirección:</strong> ${pasarela.direccion || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Datos del vehículo</h4>
          <p><strong>Placa:</strong> ${pasarela.placa || '-'}</p>
          <p><strong>Clase:</strong> ${pasarela.clase || '-'}</p>
          <p><strong>Marca / Línea:</strong> ${pasarela.marca || '-'} / ${pasarela.linea || '-'}</p>
          <p><strong>Modelo:</strong> ${pasarela.modelo || '-'}</p>
          <p><strong>Cilindraje:</strong> ${pasarela.cilindraje || '-'}</p>
          <p><strong>Capacidad de carga:</strong> ${pasarela.capacidad_carga || '-'}</p>
          <p><strong>Chasis:</strong> ${pasarela.chasis || '-'}</p>
          <p><strong>VIN:</strong> ${pasarela.vin || '-'}</p>

          <h4 style="margin: 16px 0 8px; color: #1976d2;">Estados</h4>
          <p><strong>Trámite:</strong> ${pasarela.tramite_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Confirmación:</strong> ${pasarela.confirmacion_estado === '1' ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Cargar PDF:</strong> ${pasarela.cargar_pdf_estado === '1' ? 'Activo' : 'Inactivo'}</p>

          <hr style="margin: 12px 0; border-color: #eee;" />
          <p><strong>Registrado por:</strong> ${pasarela.usuario?.name || '-'}</p>
          <p><strong>Fecha de creación:</strong> ${fechaCreacion}</p>
        </div>
      `
    );
  };
};

/** Obtener historial */
export const getHistoryThunk = (pasarelaId, params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(showBackdrop('Cargando historial...'));

      const { historyPagination } = getState().pasarelaDePagoStore;
      const page = params.page || historyPagination.page;
      const pageSize = params.page_size || historyPagination.pageSize;

      const response = await api.get(API_URLS.history(pasarelaId), {
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

/** Cambiar estado al siguiente paso. paso: 'confirmacion' | 'cargaro' */
export const cambiarEstadoThunk = (pasarelaId, paso) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Actualizando estado...'));

      const response = await api.post(API_URLS.cambiarEstado(pasarelaId), { paso });

      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Estado actualizado!',
        response.data?.message || 'El estado ha sido actualizado.',
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

/** Revertir estado al paso anterior. paso: 'tramite' | 'confirmacion' */
export const revertirEstadoThunk = (pasarelaId, paso) => {
  return async (dispatch) => {
    try {
      dispatch(showBackdrop('Revirtiendo estado...'));

      const response = await api.post(API_URLS.revertirEstado(pasarelaId), { paso });

      dispatch(listAllThunk());
      dispatch(hideBackdrop());

      await AlertService.success(
        '¡Estado revertido!',
        response.data?.message || 'El estado ha sido revertido.',
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
