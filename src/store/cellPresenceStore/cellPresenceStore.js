import { createSlice } from '@reduxjs/toolkit';

/**
 * Store de presencia por celda (estilo Google Sheets).
 *
 * Estructura:
 *   byView: {
 *     [viewId]: {
 *       byCellKey: { 'row<id>:<col>': { userId, user } },
 *       byUserId:  { [userId]: { rowId, column, user } },
 *     }
 *   }
 *
 * - byCellKey permite responder en O(1): "¿hay alguien en esta celda?".
 * - byUserId permite limpiar/sobrescribir cuando el usuario cambia de celda.
 */
const initialState = {
  byView: {},
};

const ensureView = (state, viewId) => {
  if (!state.byView[viewId]) {
    state.byView[viewId] = { byCellKey: {}, byUserId: {} };
  }
  return state.byView[viewId];
};

const cellKey = (rowId, column) => `${rowId}:${column}`;

const removeUserFromView = (view, userId) => {
  const previous = view.byUserId[userId];
  if (!previous) return null;
  const key = cellKey(previous.rowId, previous.column);
  // Solo borrar si el usuario sigue siendo el ocupante (defensa contra carreras)
  if (view.byCellKey[key] && view.byCellKey[key].userId === userId) {
    delete view.byCellKey[key];
  }
  delete view.byUserId[userId];
  return previous;
};

export const cellPresenceStore = createSlice({
  name: 'cellPresence',
  initialState,
  reducers: {
    /**
     * Establece el snapshot inicial de celdas para una vista (al suscribirse).
     * payload: { viewId, cells: [{user_id, row_id, column, user}, ...] }
     */
    setViewCells: (state, action) => {
      const { viewId, cells } = action.payload;
      const view = ensureView(state, viewId);
      view.byCellKey = {};
      view.byUserId = {};
      for (const cell of cells || []) {
        const userId = String(cell.user_id);
        const entry = { userId, user: cell.user, rowId: cell.row_id, column: cell.column };
        view.byCellKey[cellKey(cell.row_id, cell.column)] = entry;
        view.byUserId[userId] = entry;
      }
    },

    /**
     * Marca una celda como enfocada por un usuario. Si el usuario ya tenia
     * otra celda enfocada en la misma vista, se libera primero.
     * payload: { viewId, userId, rowId, column, user }
     */
    setCellFocus: (state, action) => {
      const { viewId, userId, rowId, column, user } = action.payload;
      const view = ensureView(state, viewId);
      const uid = String(userId);
      removeUserFromView(view, uid);
      const entry = { userId: uid, user, rowId, column };
      view.byCellKey[cellKey(rowId, column)] = entry;
      view.byUserId[uid] = entry;
    },

    /**
     * Libera la celda enfocada por un usuario en una vista.
     * payload: { viewId, userId }
     */
    clearCellFocus: (state, action) => {
      const { viewId, userId } = action.payload;
      const view = state.byView[viewId];
      if (!view) return;
      removeUserFromView(view, String(userId));
    },

    /**
     * Borra el estado completo de una vista (al desuscribirse).
     */
    clearView: (state, action) => {
      const { viewId } = action.payload;
      delete state.byView[viewId];
    },

    /**
     * Borra el estado de TODAS las vistas (al cerrar sesion / logout).
     */
    clearAllPresence: () => initialState,
  },
});

export const {
  setViewCells,
  setCellFocus,
  clearCellFocus,
  clearView,
  clearAllPresence,
} = cellPresenceStore.actions;

// ---- Selectores -------------------------------------------------------------------

const EMPTY_VIEW = { byCellKey: {}, byUserId: {} };

const getView = (state, viewId) => state.cellPresence.byView[viewId] || EMPTY_VIEW;

/**
 * Devuelve el ocupante de una celda concreta o null si no hay nadie.
 */
export const selectCellOccupant = (viewId, rowId, column) => (state) => {
  const view = getView(state, viewId);
  return view.byCellKey[cellKey(rowId, column)] || null;
};

/**
 * Devuelve la lista de ocupantes (todos los usuarios) en una vista.
 */
export const selectViewOccupants = (viewId) => (state) => {
  const view = getView(state, viewId);
  return Object.values(view.byUserId);
};

/**
 * Devuelve los ocupantes de una fila completa (sin importar la columna).
 */
export const selectRowOccupants = (viewId, rowId) => (state) => {
  const view = getView(state, viewId);
  return Object.values(view.byUserId).filter((entry) => entry.rowId === rowId);
};

export default cellPresenceStore.reducer;
