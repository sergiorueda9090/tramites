import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import {
  setLoading,
  setError,
  setFinalizados,
  setClientes,
  setEtiquetas,
  setTarjetas,
  setPagination,
  closeModal,
  openEditModal,
  setHistory,
  setPdfsLoading,
  setPdfsSaving,
  setExistingPdfs,
  closePdfsManager,
  prependFinalizado,
} from './finalizadosTamitesStore';

// Cache de File objects fuera de Redux (no son serializables).
// Indexado por tempId que sí está en el store.
const NEW_PDF_FILES = new Map();

export const cachePdfFile = (tempId, file) => {
  NEW_PDF_FILES.set(tempId, file);
};
export const getCachedPdfFile = (tempId) => NEW_PDF_FILES.get(tempId);
export const clearPdfFileCache = (tempId) => {
  if (tempId) NEW_PDF_FILES.delete(tempId);
  else NEW_PDF_FILES.clear();
};

const API_URLS = {
  list: '/api/finalizados_tramites/list/',
  detail: (id) => `/api/finalizados_tramites/${id}/`,
  update: (id) => `/api/finalizados_tramites/${id}/update/`,
  delete: (id) => `/api/finalizados_tramites/${id}/delete/`,
  restore: (id) => `/api/finalizados_tramites/${id}/restore/`,
  hardDelete: (id) => `/api/finalizados_tramites/${id}/hard-delete/`,
  history: (id) => `/api/finalizados_tramites/${id}/history/`,
  comprobanteUrl: (id) => `/api/finalizados_tramites/${id}/comprobante-url/`,
  comprobante: (id) => `/api/finalizados_tramites/${id}/comprobante/`,
  // PDFs
  pdfsList: (id) => `/api/finalizados_tramites/${id}/pdfs/`,
  pdfsUpload: (id) => `/api/finalizados_tramites/${id}/pdfs/upload/`,
  pdfUpdate: (id, pdfId) => `/api/finalizados_tramites/${id}/pdfs/${pdfId}/update/`,
  pdfDelete: (id, pdfId) => `/api/finalizados_tramites/${id}/pdfs/${pdfId}/delete/`,
  pdfDownload: (id, pdfId) => `/api/finalizados_tramites/${id}/pdfs/${pdfId}/download/`,
  pdfDescargarPrevisora: (id) => `/api/finalizados_tramites/${id}/pdfs/descargar/previsora/`,
  pdfDescargarMundial: (id) => `/api/finalizados_tramites/${id}/pdfs/descargar/mundial/`,
  // Auxiliares
  clientes: '/api/clientes/list/',
  etiquetas: '/api/etiquetas/list/',
  tarjetas: '/api/tarjetas/list/',
};

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Extrae la causa legible del campo `detalle` reenviado por servicios externos
// (Previsora PDF / S3), que puede venir como JSON string o texto plano.
const extraerCausaDetalle = (detalle) => {
  if (!detalle) return null;
  let d = detalle;
  if (typeof d === 'string') {
    const txt = d.trim();
    if (!txt) return null;
    try { d = JSON.parse(txt); } catch { return txt; }
  }
  if (d && typeof d === 'object') {
    return d.detail || d.descripcionRespuesta || d.message || d.error || null;
  }
  return null;
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
    case 502: title = 'Servicio no disponible'; break;
    case 503: title = 'Servicio no disponible'; break;
    default: title = 'Error';
  }

  if (!response) {
    return {
      title: 'Error de conexión',
      message: error.message || 'No se pudo conectar al servidor',
      htmlMessage: `<p>${error.message || 'No se pudo conectar al servidor.'}</p>`,
    };
  }

  const mainMessage = response.error || response.detail || 'Ha ocurrido un error';

  // Causa real reenviada por un servicio externo en `detalle`.
  const causa = extraerCausaDetalle(response.detalle);
  if (causa) {
    const statusTag = status ? ` <span style="color:#999;">(HTTP ${status})</span>` : '';
    const htmlMessage =
      `<p style="margin:0 0 8px;font-weight:600;color:#d32f2f;">${escapeHtml(causa)}</p>` +
      `<p style="margin:0;font-size:0.85rem;color:#666;">${escapeHtml(mainMessage)}${statusTag}</p>`;
    return { title, message: causa, htmlMessage };
  }

  let htmlMessage = `<p style="margin-bottom: 12px;">${mainMessage}</p>`;

  if (typeof response === 'object' && !response.error && !response.detail) {
    const entries = Object.entries(response);
    if (entries.length > 0) {
      htmlMessage = '<div style="text-align:left; background:#fff3f3; padding:12px; border-radius:8px;">';
      htmlMessage += '<ul style="margin:0; padding-left:20px; color:#d32f2f;">';
      entries.forEach(([field, messages]) => {
        const list = Array.isArray(messages) ? messages : [messages];
        list.forEach((msg) => {
          htmlMessage += `<li><strong>${field}:</strong> ${msg}</li>`;
        });
      });
      htmlMessage += '</ul></div>';
    }
  }

  return { title, message: mainMessage, htmlMessage };
};

export const listAllThunk = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));
      const { pagination } = getState().finalizadosTamitesStore;
      const page = params.page || 1;
      const pageSize = params.page_size || pagination.pageSize;

      const response = await api.get(API_URLS.list, {
        params: { ...params, page, page_size: pageSize },
      });
      const { count, next, previous, results } = response.data;
      dispatch(setFinalizados(results));
      dispatch(setPagination({ count, next, previous, page, pageSize }));
    } catch (error) {
      const { title, message, htmlMessage } = extractApiError(error);
      dispatch(setError(message));
      AlertService.error(title, htmlMessage);
    }
  };
};

export const loadClientesThunk = () => async (dispatch) => {
  try {
    const response = await api.get(API_URLS.clientes, { params: { page_size: 1000 } });
    dispatch(setClientes(response.data.results || response.data));
  } catch (error) {
    console.error('Error cargando clientes:', error);
  }
};

export const loadEtiquetasThunk = () => async (dispatch) => {
  try {
    const response = await api.get(API_URLS.etiquetas, { params: { page_size: 1000 } });
    dispatch(setEtiquetas(response.data.results || response.data));
  } catch (error) {
    console.error('Error cargando etiquetas:', error);
  }
};

export const loadTarjetasThunk = () => async (dispatch) => {
  try {
    const response = await api.get(API_URLS.tarjetas, { params: { page_size: 1000 } });
    dispatch(setTarjetas(response.data.results || response.data));
  } catch (error) {
    console.error('Error cargando tarjetas:', error);
  }
};

export const loadAuxDataThunk = () => async (dispatch) => {
  dispatch(loadClientesThunk());
  dispatch(loadEtiquetasThunk());
  dispatch(loadTarjetasThunk());
};

export const showThunk = (id) => async (dispatch) => {
  try {
    dispatch(showBackdrop('Cargando finalizado...'));
    const response = await api.get(API_URLS.detail(id));
    dispatch(hideBackdrop());
    dispatch(openEditModal(response.data));
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return null;
  }
};

export const updateThunk = (id, data) => async (dispatch) => {
  try {
    dispatch(showBackdrop('Actualizando finalizado...'));

    const cleanData = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'id') return;
      if (value === null || value === undefined) return;
      cleanData[key] = value;
    });

    const response = await api.put(API_URLS.update(id), cleanData);
    dispatch(listAllThunk());
    dispatch(closeModal());
    dispatch(hideBackdrop());

    await AlertService.success(
      '¡Finalizado actualizado!',
      'Los datos del trámite finalizado se actualizaron correctamente.',
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

export const saveThunk = (formData) => async (dispatch) => {
  if (!formData.id) {
    AlertService.error('No permitido', 'Los trámites finalizados se generan automáticamente al confirmar el pago. No se pueden crear manualmente.');
    return null;
  }
  return dispatch(updateThunk(formData.id, formData));
};

export const deleteThunk = (finalizado) => async (dispatch) => {
  try {
    const name = `Finalizado #${finalizado.id} - ${finalizado.placa || 'Sin placa'}`;
    const result = await AlertService.confirmDelete(name);
    if (!result.isConfirmed) return false;

    dispatch(showBackdrop('Eliminando finalizado...'));
    await api.delete(API_URLS.delete(finalizado.id));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());

    await AlertService.success(
      '¡Eliminado!',
      'El finalizado fue eliminado correctamente.',
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

export const restoreThunk = (finalizado) => async (dispatch) => {
  try {
    const name = `Finalizado #${finalizado.id} - ${finalizado.placa || 'Sin placa'}`;
    const result = await AlertService.confirm('¿Restaurar finalizado?', `¿Restaurar el <strong>${name}</strong>?`);
    if (!result.isConfirmed) return false;

    dispatch(showBackdrop('Restaurando finalizado...'));
    await api.post(API_URLS.restore(finalizado.id));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());

    await AlertService.success('¡Restaurado!', 'El finalizado fue restaurado correctamente.', { timer: 3000 });
    return true;
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return false;
  }
};

export const hardDeleteThunk = (finalizado) => async (dispatch) => {
  try {
    const name = `Finalizado #${finalizado.id} - ${finalizado.placa || 'Sin placa'}`;
    const result = await AlertService.confirm(
      '¿Eliminar permanentemente?',
      `<strong>Esta acción no se puede deshacer.</strong><br><br>¿Eliminar permanentemente el <strong>${name}</strong>?`,
      { confirmButtonText: 'Eliminar permanentemente', confirmButtonColor: '#d33' }
    );
    if (!result.isConfirmed) return false;

    dispatch(showBackdrop('Eliminando permanentemente...'));
    await api.delete(API_URLS.hardDelete(finalizado.id));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());

    await AlertService.success('¡Eliminado permanentemente!', 'El finalizado fue eliminado de forma permanente.', { timer: 3000 });
    return true;
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return false;
  }
};

export const viewThunk = (t) => async () => {
  const fmtFecha = (v) => v ? new Date(v).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
  const fmtMoney = (v) => v != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
    : '-';

  const aplica4x1000 = t.tarjeta && (t.tarjeta.cuatro_por_mil === '1' || t.tarjeta.cuatro_por_mil === 1 || t.tarjeta.cuatro_por_mil === true);
  const snapshot4x1000 = Number(t.cuatro_por_mil_valor);
  const monto4x1000 = Number.isFinite(snapshot4x1000) && snapshot4x1000 > 0
    ? snapshot4x1000
    : (aplica4x1000 ? ((Number(t.precio_lay || 0) + Number(t.comision || 0)) * 4) / 1000 : 0);

  await AlertService.info(
    `Finalizado #${t.id} - ${t.placa || 'Sin placa'}`,
    `
      <div style="text-align:left; max-height:420px; overflow-y:auto;">
        <h4 style="margin:0 0 8px; color:#1976d2;">Cierre</h4>
        <p><strong>Pago confirmado:</strong> ${fmtFecha(t.pago_confirmado_at)}</p>
        <p><strong>Confirmó:</strong> ${t.usuario_que_confirma?.name || '-'}</p>
        <p><strong>Tarjeta:</strong> ${t.tarjeta?.numero || '-'}${t.tarjeta?.titular ? ` (${t.tarjeta.titular})` : ''}</p>
        <p><strong>4×1000:</strong> ${aplica4x1000 ? `Aplica — ${fmtMoney(monto4x1000)}` : 'No aplica'}</p>
        <p><strong>Pasarela origen:</strong> ${t.pasarela ? `#${t.pasarela}` : '-'}</p>
        <p><strong>Trámite origen:</strong> ${t.tramite_origen_id_snapshot ? `#${t.tramite_origen_id_snapshot}` : '-'}</p>
        <p><strong>Observación:</strong> ${t.observacion || '-'}</p>

        <h4 style="margin:16px 0 8px; color:#1976d2;">Datos generales</h4>
        <p><strong>Cliente:</strong> ${t.cliente?.nombre || '-'}</p>
        <p><strong>Tipo de trámite:</strong> ${t.tipo_tramite_display || t.tipo_tramite || '-'}</p>
        <p><strong>Tipo de vehículo:</strong> ${t.tipo_vehiculo_display || t.tipo_vehiculo || '-'}</p>

        <h4 style="margin:16px 0 8px; color:#1976d2;">Tarifa SOAT</h4>
        <p><strong>Grupo SOAT:</strong> ${t.grupo_soat_display || t.grupo_soat || '-'}</p>
        <p><strong>Código de tarifa:</strong> ${t.tarifa_codigo || '-'}</p>
        <p><strong>Precio de ley:</strong> ${fmtMoney(t.precio_lay)}</p>
        <p><strong>Comisión:</strong> ${fmtMoney(t.comision)}</p>

        <h4 style="margin:16px 0 8px; color:#1976d2;">Titular</h4>
        <p><strong>${t.tipo_documento_display || t.tipo_documento || '-'}:</strong> ${t.numero_documento || '-'}</p>
        <p><strong>Nombre:</strong> ${t.nombre_completo || '-'}</p>
        <p><strong>Teléfono:</strong> ${t.telefono || '-'}</p>
        <p><strong>Correo:</strong> ${t.correo || '-'}</p>
        <p><strong>Dirección:</strong> ${t.direccion || '-'}</p>

        <h4 style="margin:16px 0 8px; color:#1976d2;">Vehículo</h4>
        <p><strong>Placa:</strong> ${t.placa || '-'}</p>
        <p><strong>Marca / Línea:</strong> ${t.marca || '-'} / ${t.linea || '-'}</p>
        <p><strong>Modelo:</strong> ${t.modelo || '-'}</p>
        <p><strong>Cilindraje:</strong> ${t.cilindraje || '-'}</p>
        <p><strong>Chasis:</strong> ${t.chasis || '-'}</p>
        <p><strong>VIN:</strong> ${t.vin || '-'}</p>
      </div>
    `
  );
};

/**
 * Abre el comprobante de pago (almacenado en S3, bucket privado) en una pestaña
 * nueva. El backend hace de proxy y entrega la imagen por streaming; aquí se
 * descarga como blob (con el JWT que inyecta el cliente axios) y se abre como
 * object URL. Así el navegador nunca ve credenciales AWS ni la URL de S3.
 *
 * `ventana` se abre sincrónicamente en el gesto del click para no ser bloqueada
 * por el navegador. Si no se pasa, intenta abrir una nueva.
 */
export const verComprobanteThunk = (finalizadoId, ventana = null) => async () => {
  let blobUrl = null;
  try {
    const response = await api.get(API_URLS.comprobante(finalizadoId), { responseType: 'blob' });
    blobUrl = URL.createObjectURL(response.data);
    if (ventana) ventana.location.href = blobUrl;
    else window.open(blobUrl, '_blank', 'noopener');
    // Liberar el object URL una vez la pestaña ya lo cargó.
    setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) { /* noop */ } }, 60000);
  } catch (error) {
    if (blobUrl) { try { URL.revokeObjectURL(blobUrl); } catch (e) { /* noop */ } }
    if (ventana) { try { ventana.close(); } catch (e) { /* noop */ } }
    AlertService.error('Comprobante de pago', 'No se pudo abrir el comprobante de pago.');
  }
};

export const getHistoryThunk = (id, params = {}) => async (dispatch, getState) => {
  try {
    dispatch(showBackdrop('Cargando historial...'));
    const { historyPagination } = getState().finalizadosTamitesStore;
    const page = params.page || historyPagination.page;
    const pageSize = params.page_size || historyPagination.pageSize;

    const response = await api.get(API_URLS.history(id), {
      params: { page, page_size: pageSize },
    });
    const { count, results } = response.data;

    dispatch(setHistory({ history_data: results || [], count, page, pageSize }));
    dispatch(hideBackdrop());
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return null;
  }
};

// ==================== PDFs ====================

/**
 * Carga la lista de PDFs existentes para un finalizado.
 */
export const loadPdfsThunk = (finalizadoId) => async (dispatch) => {
  if (!finalizadoId) return;
  try {
    dispatch(setPdfsLoading(true));
    const response = await api.get(API_URLS.pdfsList(finalizadoId));
    dispatch(setExistingPdfs(Array.isArray(response.data) ? response.data : []));
  } catch (error) {
    dispatch(setPdfsLoading(false));
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
  }
};

/**
 * Aplica todos los cambios pendientes en una sola operación:
 *   1) PUT por cada cambio de descripción.
 *   2) DELETE por cada PDF marcado.
 *   3) POST multipart con los nuevos.
 *
 * Si todo va bien: refresca la lista, refresca la tabla principal (para que
 * `pdfs_count` se actualice) y cierra el manager.
 */
export const commitPdfsChangesThunk = () => async (dispatch, getState) => {
  const { pdfsManager } = getState().finalizadosTamitesStore;
  const finalizado = pdfsManager.finalizado;
  if (!finalizado?.id) {
    AlertService.error('Error', 'No hay finalizado activo.');
    return false;
  }

  const id = finalizado.id;
  const { pendingMetaUpdates, pendingDelete, newFiles } = pdfsManager;

  const tieneCambios =
    Object.keys(pendingMetaUpdates).length > 0 ||
    pendingDelete.length > 0 ||
    newFiles.length > 0;

  if (!tieneCambios) {
    dispatch(closePdfsManager());
    clearPdfFileCache();
    return true;
  }

  try {
    dispatch(setPdfsSaving(true));
    dispatch(showBackdrop('Guardando PDFs...'));

    // 1) Actualizar metadata (en paralelo)
    const metaPromises = Object.entries(pendingMetaUpdates).map(([pdfId, data]) =>
      api.put(API_URLS.pdfUpdate(id, pdfId), data)
    );

    // 2) Eliminar (en paralelo)
    const deletePromises = pendingDelete.map((pdfId) =>
      api.delete(API_URLS.pdfDelete(id, pdfId))
    );

    await Promise.all([...metaPromises, ...deletePromises]);

    // 3) Subir nuevos en una sola petición multipart
    if (newFiles.length > 0) {
      const formData = new FormData();
      const descripciones = [];
      for (const meta of newFiles) {
        const file = getCachedPdfFile(meta.tempId);
        if (!file) continue;
        formData.append('archivos', file, meta.name);
        descripciones.push(meta.descripcion || '');
      }
      formData.append('descripciones', JSON.stringify(descripciones));

      await api.post(API_URLS.pdfsUpload(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    dispatch(hideBackdrop());
    dispatch(setPdfsSaving(false));

    // Refrescar tabla principal para que pdfs_count se actualice
    dispatch(listAllThunk());

    clearPdfFileCache();
    dispatch(closePdfsManager());

    await AlertService.success(
      'PDFs guardados',
      'Los cambios en los archivos se guardaron correctamente.',
      { timer: 2500 }
    );

    return true;
  } catch (error) {
    dispatch(hideBackdrop());
    dispatch(setPdfsSaving(false));
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return false;
  }
};

/**
 * Trae el PDF como Blob para previsualizarlo. NO dispara descarga.
 * Devuelve un object URL (`URL.createObjectURL`) que el caller debe revocar
 * con `URL.revokeObjectURL` cuando deje de usarlo.
 */
export const fetchPdfBlobUrlThunk = (finalizadoId, pdfId) => async () => {
  try {
    const response = await api.get(API_URLS.pdfDownload(finalizadoId, pdfId), {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: response.headers?.['content-type'] || 'application/pdf',
    });
    return window.URL.createObjectURL(blob);
  } catch (error) {
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return null;
  }
};

/**
 * Descargar un PDF (autenticado). Usa axios + blob para preservar el header
 * de auth y forzar el download con el nombre original.
 */
export const downloadPdfThunk = (finalizadoId, pdfId, filename) => async () => {
  try {
    const response = await api.get(API_URLS.pdfDownload(finalizadoId, pdfId), {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'documento.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (error) {
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
  }
};

/**
 * Trae UN finalizado por id y lo inserta al inicio del listado SIN tocar
 * `loading` ni mostrar backdrop. Usado por el hook de tiempo real cuando
 * llega `finalizado_added`: evita el spinner del listado completo.
 */
export const fetchFinalizadoSilentThunk = (finalizadoId) => {
  return async (dispatch) => {
    if (finalizadoId == null) return null;
    try {
      const response = await api.get(API_URLS.detail(finalizadoId));
      dispatch(prependFinalizado(response.data));
      return response.data;
    } catch (error) {
      console.warn('[fetchFinalizadoSilentThunk] error:', error?.response?.status, finalizadoId);
      return null;
    }
  };
};

// ==================== DESCARGA AUTOMÁTICA DE PDF (por aseguradora) ====================

/**
 * Descarga el PDF de la aseguradora indicada ('previsora' | 'mundial') y lo
 * adjunta al finalizado. Solo válido dentro de la ventana de 5 min (el backend
 * la valida). Tras éxito, refresca la lista de PDFs del manager y la tabla.
 */
export const descargarPdfAseguradoraThunk = (finalizadoId, aseguradora) => async (dispatch) => {
  if (!finalizadoId) return null;
  const url = aseguradora === 'mundial'
    ? API_URLS.pdfDescargarMundial(finalizadoId)
    : API_URLS.pdfDescargarPrevisora(finalizadoId);
  const nombre = aseguradora === 'mundial' ? 'Mundial' : 'Previsora';
  try {
    dispatch(showBackdrop(`Descargando PDF de ${nombre}...`));
    const response = await api.post(url);
    // Refrescar la lista de PDFs del manager y el conteo en la tabla.
    dispatch(loadPdfsThunk(finalizadoId));
    dispatch(listAllThunk());
    dispatch(hideBackdrop());
    await AlertService.success(
      'PDF descargado',
      `El PDF de ${nombre} se adjuntó correctamente al trámite finalizado.`,
      { timer: 2500 }
    );
    return response.data;
  } catch (error) {
    dispatch(hideBackdrop());
    const { title, htmlMessage } = extractApiError(error);
    AlertService.error(title, htmlMessage);
    return null;
  }
};
