import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import websocketService from '../services/websocketService';
import { fetchFinalizadoSilentThunk } from '../store/finalizadosTamitesStore/finalizadosTamitesThunks';
import notificationService from '../services/notificationService';

const VIEW_ID = 'finalizados_tramites_list';

/**
 * Hook que escucha eventos de tiempo real sobre el listado de Trámites
 * Finalizados.
 *
 * Eventos manejados:
 *   - finalizado_added: aparece un nuevo finalizado (ej. alguien marcó
 *     "Pago exitoso" en el modal de Pasarela) → fetch SILENCIOSO y
 *     prepend al store. Sin spinner ni reload de la lista.
 *
 * Suscripción: además de escuchar el WS, este hook se encarga de enviar
 * `subscribe_view` al backend con el view_id correspondiente (el módulo
 * de Finalizados no usa useCellPresence todavía).
 */
export const useFinalizadosRealtime = () => {
  const dispatch = useDispatch();
  const isWsConnected = useSelector((state) => state.presence?.isConnected);
  const handlerRef = useRef(null);

  handlerRef.current = (data) => {
    if (!data || !data.type) return;

    if (data.type === 'finalizado_added' && data.finalizado_id != null) {
      console.log('[useFinalizadosRealtime] finalizado_added (silencioso)', data);
      dispatch(fetchFinalizadoSilentThunk(data.finalizado_id)).then((item) => {
        const placa = item?.placa ? ` — Placa ${item.placa}` : '';
        const idTxt = item?.id ?? data.finalizado_id;
        notificationService.show({
          severity: 'success',
          title: 'Nuevo trámite finalizado',
          message: `Se agregó el registro #${idTxt}${placa}`,
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

    if (websocketService.isConnected()) {
      websocketService.subscribeView(VIEW_ID);
    }

    return () => {
      try {
        websocketService.unsubscribeView(VIEW_ID);
      } catch {
        /* ignorar */
      }
      unsubscribe();
    };
  }, []);

  // Si el WS se conecta después, reenviar subscribe_view.
  useEffect(() => {
    if (isWsConnected) {
      websocketService.subscribeView(VIEW_ID);
    }
  }, [isWsConnected]);
};

export default useFinalizadosRealtime;
