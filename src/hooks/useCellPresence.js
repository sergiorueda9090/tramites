import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import websocketService from '../services/websocketService';
import {
  setViewCells,
  setCellFocus,
  clearCellFocus,
  clearView,
  selectCellOccupant,
  selectRowOccupants,
} from '../store/cellPresenceStore/cellPresenceStore';

/**
 * Hook de presencia colaborativa por celda (estilo Google Sheets).
 *
 * Uso tipico:
 *   const { focusCell, blurCell, getOccupant } = useCellPresence('tramites_list');
 *   <td onClick={() => focusCell(row.id, 'placa')}> ... </td>
 *
 * Al montar:
 *   - se suscribe al `viewId` (envia subscribe_view).
 *   - escucha cells_snapshot, cell_focus y cell_blur de ese viewId.
 *   - despacha al cellPresenceStore.
 *
 * Al desmontar (cambio de pagina, logout, etc):
 *   - libera la celda enfocada (clearCellFocus).
 *   - desuscribe la vista (unsubscribe_view).
 *   - limpia el estado local.
 */
export const useCellPresence = (viewId) => {
  const dispatch = useDispatch();
  const isWsConnected = useSelector((state) => state.presence?.isConnected);

  const handlerRef = useRef(null);

  const handleMessage = useCallback(
    (data) => {
      if (!data || !data.type) return;
      // Filtrar mensajes que no pertenecen a esta vista
      if (data.view_id && data.view_id !== viewId) return;

      switch (data.type) {
        case 'cells_snapshot':
          console.log('[useCellPresence] cells_snapshot', viewId, data.cells);
          dispatch(setViewCells({ viewId, cells: data.cells || [] }));
          break;
        case 'cell_focus':
          console.log('[useCellPresence] cell_focus recibido', data);
          dispatch(setCellFocus({
            viewId,
            userId: data.user_id,
            rowId: data.row_id,
            column: data.column,
            user: data.user,
          }));
          break;
        case 'cell_blur':
          console.log('[useCellPresence] cell_blur recibido', data);
          dispatch(clearCellFocus({ viewId, userId: data.user_id }));
          break;
        default:
          break;
      }
    },
    [dispatch, viewId],
  );

  // Mantener el ultimo handler en una ref para no re-suscribir cuando cambia
  handlerRef.current = handleMessage;

  // Suscripcion al WS y al viewId
  useEffect(() => {
    if (!viewId) return undefined;

    const stableHandler = (data) => {
      if (handlerRef.current) handlerRef.current(data);
    };

    const unsubscribe = websocketService.subscribe(stableHandler);

    // Solo intentar suscribirse al servidor si el WS esta abierto.
    // Si todavia no esta conectado, el siguiente effect lo hara cuando cambie isWsConnected.
    console.log('[useCellPresence] mount viewId=', viewId, 'wsConnected=', websocketService.isConnected());
    if (websocketService.isConnected()) {
      websocketService.subscribeView(viewId);
    }

    return () => {
      // Liberar celda y desuscribirse en el server
      try {
        websocketService.clearCellFocus(viewId);
        websocketService.unsubscribeView(viewId);
      } catch {
        /* ignorar */
      }
      unsubscribe();
      dispatch(clearView({ viewId }));
    };
  }, [viewId, dispatch]);

  // Si el WS se conecta despues, hacer subscribe_view
  useEffect(() => {
    if (viewId && isWsConnected) {
      websocketService.subscribeView(viewId);
    }
  }, [viewId, isWsConnected]);

  // Beforeunload: best-effort para liberar la celda al cerrar la pestania
  useEffect(() => {
    if (!viewId) return undefined;
    const onBeforeUnload = () => {
      try {
        websocketService.clearCellFocus(viewId);
      } catch {
        /* ignorar */
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [viewId]);

  // API publica del hook
  const focusCell = useCallback(
    (rowId, column) => {
      console.log('[useCellPresence] focusCell', viewId, rowId, column);
      websocketService.setCellFocus(viewId, rowId, column);
    },
    [viewId],
  );

  const blurCell = useCallback(
    () => websocketService.clearCellFocus(viewId),
    [viewId],
  );

  /**
   * Retorna el ocupante de una celda o null. NO filtra al usuario actual:
   * el usuario debe ver su propio foco igual que los demas (el componente
   * de overlay marca "Tu" cuando coincide con el id actual).
   */
  const getOccupant = (rowId, column) => (state) =>
    selectCellOccupant(viewId, rowId, column)(state);

  /**
   * Retorna los ocupantes de una fila completa, incluyendo al usuario actual.
   */
  const getRowOccupants = (rowId) => (state) =>
    selectRowOccupants(viewId, rowId)(state);

  return {
    focusCell,
    blurCell,
    getOccupant,
    getRowOccupants,
  };
};

export default useCellPresence;
