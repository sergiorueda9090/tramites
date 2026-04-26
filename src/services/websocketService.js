import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const RECONNECT_BASE_MS = 1000;       // 1s inicial
const RECONNECT_MAX_MS = 30000;       // tope 30s
const RECONNECT_JITTER_MS = 500;      // jitter aleatorio
const PING_INTERVAL_MS = 30000;       // ping cada 30s
const HIDDEN_MAX_ATTEMPTS = 3;        // intentos cuando la pestania esta oculta
const CELL_FOCUS_THROTTLE_MS = 150;   // throttle para cell_focus repetidos

/**
 * Servicio de WebSocket para manejar conexiones en tiempo real.
 * - Reconexion con backoff exponencial + jitter, sin tope mientras la pestania esta visible.
 * - Pausa la reconexion cuando la pestania esta oculta y la reanuda al volver.
 * - Si el servidor cierra con codigo 4001 (token invalido), intenta refresh JWT y reconecta.
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.pingInterval = null;
    this.userData = null;
    this.token = null;
    this.reconnectTimer = null;
    this.intentionalClose = false;

    // Listener de visibilidad: si la pestania vuelve y no estamos conectados, reconectar ya
    if (typeof document !== 'undefined') {
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  /**
   * Conecta al servidor WebSocket
   * @param {Object} userData - Datos del usuario actual
   * @param {string} [token] - Access token JWT (opcional, retrocompatible)
   */
  connect(userData, token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya esta conectado');
      return;
    }

    this.userData = userData;
    this.token = token || null;
    this.intentionalClose = false;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiUrl = API_BASE_URL;
    const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const tokenQuery = this.token ? `?token=${encodeURIComponent(this.token)}` : '';
    const wsUrl = `${protocol}//${wsHost}/ws/presence/${tokenQuery}`;

    console.log('=== WEBSOCKET DEBUG ===');
    console.log('WS URL:', wsUrl);
    console.log('Usuario:', userData);
    console.log('=======================');

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('=== WEBSOCKET CONECTADO ===');
        this.reconnectAttempts = 0;

        const joinData = {
          action: 'join',
          user_id: userData.id,
          name: userData.name,
          avatar: userData.avatar,
          color: userData.color,
        };
        this.send(joinData);
        this.startPing();
        this.notifyListeners({ type: 'connection_status', connected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('=== WEBSOCKET CERRADO ===');
        console.log('Codigo:', event.code, 'Razon:', event.reason, 'Clean:', event.wasClean);
        this.stopPing();
        this.notifyListeners({ type: 'connection_status', connected: false });

        // Cierre por desconexion explicita: no reconectar
        if (this.intentionalClose) {
          return;
        }

        // 4001: token invalido o vencido -> intentar refresh y reconectar
        if (event.code === 4001) {
          this.handleAuthFailure();
          return;
        }

        // Cualquier otro cierre: backoff exponencial
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('=== WEBSOCKET ERROR ===', error);
      };
    } catch (error) {
      console.error('Error creando WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Programa el siguiente intento de reconexion con backoff exponencial + jitter.
   * Si la pestania esta oculta, limita los intentos a HIDDEN_MAX_ATTEMPTS.
   */
  scheduleReconnect() {
    if (!this.userData) return;
    this.clearReconnectTimer();

    const isHidden = typeof document !== 'undefined' && document.hidden;
    if (isHidden && this.reconnectAttempts >= HIDDEN_MAX_ATTEMPTS) {
      console.log('Pestania oculta y maximo de intentos alcanzado, esperando visibilitychange');
      this.notifyListeners({ type: 'reconnect_paused' });
      return;
    }

    const exponential = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** this.reconnectAttempts);
    const jitter = Math.floor(Math.random() * RECONNECT_JITTER_MS);
    const delay = exponential + jitter;

    this.reconnectAttempts++;
    console.log(`Reintento ${this.reconnectAttempts} en ${delay}ms (visible=${!isHidden})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.userData, this.token);
    }, delay);
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Reaccion al cambio de visibilidad de la pestania:
   * - oculta: cancelar reconexion pendiente.
   * - visible: si no esta conectado, reconectar inmediatamente (resetea backoff).
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('Pestania oculta: cancelando reconexion pendiente');
      this.clearReconnectTimer();
    } else {
      console.log('Pestania visible: reanudando si hace falta');
      const notConnected = !this.socket || this.socket.readyState !== WebSocket.OPEN;
      if (notConnected && this.userData && !this.intentionalClose) {
        this.reconnectAttempts = 0; // resetear backoff al volver
        this.clearReconnectTimer();
        this.connect(this.userData, this.token);
      }
    }
  }

  /**
   * Maneja un cierre con codigo 4001 (token invalido):
   * intenta refresh y reconecta con el nuevo access token.
   */
  async handleAuthFailure() {
    console.log('WS cerrado por auth (4001), intentando refresh JWT...');
    try {
      const infoUser = JSON.parse(localStorage.getItem('infoUser')) || {};
      const refresh = infoUser.refresh;
      if (!refresh) throw new Error('No hay refresh token');

      const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, { refresh });
      const newAccess = response.data?.access;
      if (!newAccess) throw new Error('Respuesta de refresh invalida');

      // Persistir el nuevo access en localStorage para alinear con apiService
      localStorage.setItem('infoUser', JSON.stringify({ ...infoUser, access: newAccess }));
      this.token = newAccess;
      this.reconnectAttempts = 0;
      console.log('Refresh OK, reconectando WS con nuevo token');
      this.notifyListeners({ type: 'token_refreshed', access: newAccess });
      this.connect(this.userData, newAccess);
    } catch (error) {
      console.error('Refresh JWT fallido, abandonando reconexion:', error);
      this.notifyListeners({ type: 'reconnect_failed' });
    }
  }

  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ action: 'ping' });
    }, PING_INTERVAL_MS);
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no esta conectado, no se puede enviar:', data);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error en listener de WebSocket:', error);
      }
    });
  }

  /**
   * Desconexion explicita (logout o cleanup del hook).
   * Cancela cualquier reintento pendiente y NO programa reconexion.
   */
  disconnect() {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    this.stopPing();
    if (this.socket) {
      this.socket.close(1000, 'User disconnect');
      this.socket = null;
    }
    this.userData = null;
    this.token = null;
    this.reconnectAttempts = 0;
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // ---- Presencia por vista / celda --------------------------------------------------

  /**
   * Suscribe el canal a una vista (modulo). El servidor responde con
   * cells_snapshot y a partir de ahi llegan eventos cell_focus / cell_blur.
   */
  subscribeView(viewId) {
    if (!viewId) return;
    this.send({ action: 'subscribe_view', view_id: viewId });
  }

  /**
   * Desuscribe el canal de una vista. Libera la celda en esa vista si la habia.
   */
  unsubscribeView(viewId) {
    if (!viewId) return;
    this.send({ action: 'unsubscribe_view', view_id: viewId });
  }

  /**
   * Reporta que el usuario esta enfocado en una celda (row_id, column).
   * Throttled a CELL_FOCUS_THROTTLE_MS para evitar saturar el WS al navegar
   * entre celdas con el teclado.
   */
  setCellFocus(viewId, rowId, column) {
    if (!viewId || rowId == null || !column) return;
    const now = Date.now();
    const last = this._lastFocus || {};
    const sameCell = last.viewId === viewId && last.rowId === rowId && last.column === column;
    if (sameCell && now - (last.ts || 0) < CELL_FOCUS_THROTTLE_MS) {
      return;
    }
    this._lastFocus = { viewId, rowId, column, ts: now };
    this.send({ action: 'cell_focus', view_id: viewId, row_id: rowId, column });
  }

  /**
   * Libera la celda que el usuario tenia enfocada en una vista.
   */
  clearCellFocus(viewId) {
    if (!viewId) return;
    this._lastFocus = null;
    this.send({ action: 'cell_blur', view_id: viewId });
  }
}

const websocketService = new WebSocketService();
export default websocketService;
