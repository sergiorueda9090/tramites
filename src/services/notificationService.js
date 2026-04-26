/**
 * Servicio de notificaciones tipo toast/snackbar.
 *
 * Cualquier parte de la app puede llamar a `notificationService.show(...)`
 * y el componente `<RealtimeToastHost />` (montado una sola vez en el
 * layout) escuchara y renderizara el snackbar.
 *
 * Pensado para eventos de tiempo real (WebSocket): no bloquea la UI,
 * autocierra en unos segundos, y permite acumular varias notificaciones.
 */
class NotificationService {
  constructor() {
    this.listeners = new Set();
  }

  /**
   * Dispara una notificacion.
   * @param {Object} payload
   * @param {string} payload.message - Texto principal.
   * @param {('info'|'success'|'warning'|'error')} [payload.severity='info']
   * @param {number} [payload.duration=4000] - ms hasta autocierre.
   * @param {string} [payload.title] - Titulo opcional.
   */
  show({ message, severity = 'info', duration = 4000, title }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const notification = { id, message, severity, duration, title };
    this.listeners.forEach((cb) => {
      try {
        cb(notification);
      } catch (e) {
        // ignorar
      }
    });
    return id;
  }

  /**
   * Suscribe un callback que recibe cada notificacion nueva.
   * Devuelve la funcion para desuscribirse.
   */
  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

const notificationService = new NotificationService();
export default notificationService;
