import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import websocketService from '../services/websocketService';
import { removePasarelaById } from '../store/pasarelaDePagoStore/pasarelaDePagoStore';
import {
  fetchPasarelaSilentThunk,
  refetchPasarelaSilentThunk,
} from '../store/pasarelaDePagoStore/pasarelaDePagoThunks';
import notificationService from '../services/notificationService';

/**
 * Hook que escucha eventos de tiempo real sobre cambios de datos en el
 * listado de Pasarela de Pago.
 *
 * Eventos manejados:
 *   - pasarela_added: aparece un nuevo registro -> fetch SILENCIOSO del
 *     registro individual y prepend al store. NO se muestra spinner ni se
 *     recarga la lista entera.
 *   - pasarela_removed: el registro ya no debe aparecer (devuelto a tramites
 *     o eliminado por otro usuario) -> remueve del store sin refetch.
 *   - pasarela_updated: un campo del registro cambió (ej. pago_estado tras
 *     el modal de timer) -> refetch silencioso y reemplazo del item en el
 *     store.
 */
export const usePasarelaRealtime = () => {
  const dispatch = useDispatch();
  const handlerRef = useRef(null);

  handlerRef.current = (data) => {
    if (!data || !data.type) return;

    if (data.type === 'pasarela_removed' && data.pasarela_id != null) {
      console.log('[usePasarelaRealtime] pasarela_removed', data);
      dispatch(removePasarelaById(data.pasarela_id));
      return;
    }

    if (data.type === 'pasarela_added' && data.pasarela_id != null) {
      console.log('[usePasarelaRealtime] pasarela_added (silencioso)', data);
      dispatch(fetchPasarelaSilentThunk(data.pasarela_id)).then((item) => {
        const placa = item?.placa ? ` — Placa ${item.placa}` : '';
        const idTxt = item?.id ?? data.pasarela_id;
        notificationService.show({
          severity: 'info',
          title: 'Nuevo registro en Pasarela',
          message: `Se agregó el registro #${idTxt}${placa}`,
          duration: 5000,
        });
      });
      return;
    }

    if (data.type === 'pasarela_updated' && data.pasarela_id != null) {
      console.log('[usePasarelaRealtime] pasarela_updated (silencioso)', data);
      dispatch(refetchPasarelaSilentThunk(data.pasarela_id));
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

export default usePasarelaRealtime;
