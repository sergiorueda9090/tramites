import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import websocketService from '../services/websocketService';
import { removeTramiteById, updateLinkPagoEstado } from '../store/tamitesStore/tamitesStore';
import { fetchTramiteSilentThunk } from '../store/tamitesStore/tamitesThunks';
import notificationService from '../services/notificationService';
import soundService from '../services/soundService';

/**
 * Hook que escucha eventos de tiempo real sobre cambios de datos en el
 * listado de tramites y actualiza el store del cliente.
 *
 * Eventos manejados:
 *   - tramite_removed: el tramite ya no debe aparecer (enviado a pasarela
 *     por otro usuario). Se elimina del store sin recargar la lista entera.
 *   - tramite_restored: el tramite vuelve a aparecer (la pasarela asociada
 *     fue devuelta o eliminada). Fetch SILENCIOSO del registro y prepend
 *     al store. NO se muestra spinner.
 *   - tramite_added: un nuevo tramite fue creado (ej. desde Base de Datos).
 *     Fetch SILENCIOSO del registro y prepend al store.
 */
export const useTramitesRealtime = () => {
  const dispatch = useDispatch();
  const handlerRef = useRef(null);

  handlerRef.current = (data) => {
    if (!data || !data.type) return;

    if (data.type === 'tramite_removed' && data.tramite_id != null) {
      console.log('[useTramitesRealtime] tramite_removed', data);
      dispatch(removeTramiteById(data.tramite_id));
      return;
    }

    if (data.type === 'tramite_restored' && data.tramite_id != null) {
      console.log('[useTramitesRealtime] tramite_restored (silencioso)', data);
      dispatch(fetchTramiteSilentThunk(data.tramite_id)).then((item) => {
        const placa = item?.placa ? ` — Placa ${item.placa}` : '';
        const idTxt = item?.id ?? data.tramite_id;
        notificationService.show({
          severity: 'info',
          title: 'Trámite devuelto',
          message: `El trámite #${idTxt}${placa} volvió al listado`,
          duration: 5000,
        });
      });
      return;
    }

    // Generación automática del link de pago (job asíncrono): patch silencioso
    // de la fila + toast/sonido al terminar. No recarga la lista.
    if ((data.type === 'link_pago_started' || data.type === 'link_pago_done')
        && data.tramite_id != null) {
      dispatch(updateLinkPagoEstado({ tramite_id: data.tramite_id, link_pago: data.link_pago }));
      if (data.type === 'link_pago_done' && data.link_pago?.estado === 'exitoso') {
        soundService.playNotification();
        notificationService.show({
          severity: 'success',
          title: 'Link de pago listo',
          message: `Trámite #${data.tramite_id}: link ${data.link_pago.proveedor || ''} generado`,
          duration: 5000,
        });
      }
      if (data.type === 'link_pago_done' && data.link_pago?.estado === 'error') {
        notificationService.show({
          severity: 'warning',
          title: 'Link de pago falló',
          message: `Trámite #${data.tramite_id}: ${data.link_pago.error_mensaje || 'error'}`,
          duration: 7000,
        });
      }
      return;
    }

    if (data.type === 'tramite_added' && data.tramite_id != null) {
      console.log('[useTramitesRealtime] tramite_added (silencioso)', data);
      soundService.playNotification();
      dispatch(fetchTramiteSilentThunk(data.tramite_id)).then((item) => {
        const placa = item?.placa ? ` — Placa ${item.placa}` : '';
        const idTxt = item?.id ?? data.tramite_id;
        notificationService.show({
          severity: 'success',
          title: 'Nuevo trámite',
          message: `Se agregó el trámite #${idTxt}${placa}`,
          duration: 5000,
        });
      });
    }
  };

  useEffect(() => {
    // Desbloquea el audio en el primer gesto del usuario para que la primera
    // notificación de tiempo real pueda sonar (política de autoplay).
    soundService.installUnlockOnFirstGesture();

    const stable = (data) => {
      if (handlerRef.current) handlerRef.current(data);
    };
    const unsubscribe = websocketService.subscribe(stable);
    return () => unsubscribe();
  }, []);
};

export default useTramitesRealtime;
