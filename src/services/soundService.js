/**
 * Servicio de sonido para notificaciones de tiempo real.
 *
 * Sintetiza un "ding" corto con la Web Audio API — sin archivos de audio:
 * no hay assets que servir ni cargar, funciona offline.
 *
 * Nota de navegador: el audio solo suena tras la primera interacción del
 * usuario con la página (política de autoplay). Como el operario navega la
 * app antes de recibir notificaciones, en la práctica siempre suena.
 */
class SoundService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.unlockInstalled = false;
  }

  /** Activa / desactiva globalmente el sonido (ej. preferencia de usuario). */
  setEnabled(value) {
    this.enabled = !!value;
  }

  _getContext() {
    if (this.ctx) return this.ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    this.ctx = new AudioCtx();
    return this.ctx;
  }

  /**
   * Crea y "desbloquea" el AudioContext en el primer gesto del usuario
   * (clic/tecla/touch). Sin esto, un AudioContext creado dentro de un callback
   * de WebSocket nace suspendido y `resume()` queda bloqueado por la política
   * de autoplay → la primera notificación no suena. Idempotente.
   */
  installUnlockOnFirstGesture() {
    if (this.unlockInstalled || typeof window === 'undefined') return;
    this.unlockInstalled = true;

    const unlock = () => {
      const ctx = this._getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  /**
   * Reproduce un "ding" de notificación (dos tonos ascendentes, ~0.3s).
   */
  async playNotification() {
    if (!this.enabled) return;
    const ctx = this._getContext();
    if (!ctx) {
      console.warn('[soundService] Web Audio API no disponible en este navegador.');
      return;
    }

    // IMPORTANTE: reanudar y ESPERAR antes de leer currentTime / programar.
    // Si se programa con el contexto suspendido, los tiempos quedan "en el
    // pasado" tras el resume y las notas no suenan.
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('[soundService] resume() falló:', e);
      }
    }
    if (ctx.state !== 'running') {
      console.warn(
        `[soundService] AudioContext en estado "${ctx.state}". ` +
        'Haz clic en la página (pestaña de Trámites) una vez para habilitar el sonido.'
      );
      return;
    }

    const now = ctx.currentTime;
    // Dos notas tipo campana: La5 (880Hz) → Do#6 (1108Hz).
    const notas = [
      { freq: 880.0, start: 0.0, dur: 0.18 },
      { freq: 1108.73, start: 0.12, dur: 0.22 },
    ];

    notas.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const t0 = now + start;
      const t1 = t0 + dur;
      // Envolvente: ataque rápido y caída suave para que suene a "campana".
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t1 + 0.02);
    });
    console.log('[soundService] ding reproducido (state=running)');
  }
}

const soundService = new SoundService();
export default soundService;
