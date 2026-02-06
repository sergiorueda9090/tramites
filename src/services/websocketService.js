/**
 * Servicio de WebSocket para manejar conexiones en tiempo real
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.pingInterval = null;
    this.userData = null;
  }

  /**
   * Conecta al servidor WebSocket
   * @param {Object} userData - Datos del usuario actual
   */
  connect(userData) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya esta conectado');
      return;
    }

    this.userData = userData;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Usar la URL del API o el puerto 8000 por defecto para el backend 
    const apiUrl = 'https://tramitesbackend.movilidad2a.com' //process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const wsUrl = `${protocol}//${wsHost}/ws/presence/`;

    console.log('=== WEBSOCKET DEBUG ===');
    console.log('API URL:', process.env.REACT_APP_API_URL);
    console.log('WS Host:', wsHost);
    console.log('WS URL completa:', wsUrl);
    console.log('Usuario:', userData);
    console.log('=======================');

    try {
      this.socket = new WebSocket(wsUrl);
      console.log('WebSocket creado, estado:', this.socket.readyState);

      this.socket.onopen = () => {
        console.log('=== WEBSOCKET CONECTADO ===');
        console.log('Estado:', this.socket.readyState);
        this.reconnectAttempts = 0;

        // Enviar datos del usuario al conectarse
        const joinData = {
          action: 'join',
          user_id: userData.id,
          name: userData.name,
          avatar: userData.avatar,
          color: userData.color,
        };
        console.log('Enviando JOIN:', joinData);
        this.send(joinData);

        // Iniciar ping para mantener conexion viva
        this.startPing();

        // Notificar a los listeners
        this.notifyListeners({ type: 'connection_status', connected: true });
      };

      this.socket.onmessage = (event) => {
        console.log('=== MENSAJE RECIBIDO ===');
        console.log('Raw data:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed data:', data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('=== WEBSOCKET CERRADO ===');
        console.log('Codigo:', event.code);
        console.log('Razon:', event.reason);
        console.log('Clean:', event.wasClean);
        this.stopPing();
        this.notifyListeners({ type: 'connection_status', connected: false });
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('=== WEBSOCKET ERROR ===');
        console.error('Error:', error);
        console.error('Estado:', this.socket?.readyState);
      };
    } catch (error) {
      console.error('Error creando WebSocket:', error);
    }
  }

  /**
   * Intenta reconectar al servidor
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userData) {
      this.reconnectAttempts++;
      console.log(
        `Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect(this.userData);
      }, this.reconnectDelay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximo de intentos de reconexion alcanzado');
      this.notifyListeners({ type: 'reconnect_failed' });
    }
  }

  /**
   * Inicia el intervalo de ping para mantener la conexion
   */
  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ action: 'ping' });
    }, 30000); // Ping cada 30 segundos
  }

  /**
   * Detiene el intervalo de ping
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Envia datos al servidor WebSocket
   * @param {Object} data - Datos a enviar
   */
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no esta conectado, no se puede enviar:', data);
    }
  }

  /**
   * Suscribe un callback para recibir mensajes
   * @param {Function} callback - Funcion a llamar cuando llegue un mensaje
   * @returns {Function} - Funcion para cancelar la suscripcion
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Notifica a todos los listeners
   * @param {Object} data - Datos recibidos
   */
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
   * Desconecta del servidor WebSocket
   */
  disconnect() {
    this.stopPing();
    if (this.socket) {
      this.socket.close(1000, 'User disconnect');
      this.socket = null;
    }
    this.userData = null;
    this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexion
  }

  /**
   * Verifica si esta conectado
   * @returns {boolean}
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Singleton
const websocketService = new WebSocketService();
export default websocketService;
