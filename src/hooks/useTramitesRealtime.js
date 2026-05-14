import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import websocketService from '../services/websocketService';
import { removeTramiteById } from '../store/tamitesStore/tamitesStore';
import { fetchTramiteSilentThunk } from '../store/tamitesStore/tamitesThunks';
import notificationService from '../services/notificationService';

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

    if (data.type === 'tramite_added' && data.tramite_id != null) {
      console.log('[useTramitesRealtime] tramite_added (silencioso)', data);
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
    const stable = (data) => {
      if (handlerRef.current) handlerRef.current(data);
    };
    const unsubscribe = websocketService.subscribe(stable);
    return () => unsubscribe();
  }, []);
};

export default useTramitesRealtime;
