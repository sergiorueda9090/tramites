import Swal from 'sweetalert2';

// Colores del tema Movilidad2A
const colors = {
  primary: '#1976d2',
  primaryDark: '#1565c0',
  secondary: '#00897b',
  success: '#4caf50',
  successDark: '#388e3c',
  error: '#f44336',
  errorDark: '#d32f2f',
  warning: '#ff9800',
  warningDark: '#f57c00',
  info: '#2196f3',
  infoDark: '#1976d2',
  dark: '#212121',
  light: '#fafafa',
};

// Configuración base para todos los alerts
const baseConfig = {
  customClass: {
    container: 'swal2-container-custom',
    popup: 'swal2-popup-custom',
    title: 'swal2-title-custom',
    htmlContainer: 'swal2-html-custom',
    confirmButton: 'swal2-confirm-custom',
    cancelButton: 'swal2-cancel-custom',
    denyButton: 'swal2-deny-custom',
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeInDown animate__faster',
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp animate__faster',
  },
};

// Inyectar estilos personalizados
const injectStyles = () => {
  if (document.getElementById('swal-custom-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'swal-custom-styles';
  styles.innerHTML = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

    .swal2-popup-custom {
      font-family: 'Roboto', sans-serif !important;
      border-radius: 16px !important;
      padding: 2rem !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    }

    .swal2-title-custom {
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      color: ${colors.dark} !important;
      margin-bottom: 0.5rem !important;
    }

    .swal2-html-custom {
      font-size: 1rem !important;
      color: #666 !important;
      line-height: 1.6 !important;
    }

    .swal2-confirm-custom {
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 32px !important;
      font-size: 0.95rem !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3) !important;
    }

    .swal2-confirm-custom:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
    }

    .swal2-confirm-custom:focus {
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.3) !important;
    }

    .swal2-cancel-custom {
      background: transparent !important;
      color: ${colors.dark} !important;
      border: 2px solid #e0e0e0 !important;
      border-radius: 8px !important;
      padding: 10px 28px !important;
      font-size: 0.95rem !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      margin-right: 12px !important;
    }

    .swal2-cancel-custom:hover {
      background: #f5f5f5 !important;
      border-color: #bdbdbd !important;
    }

    .swal2-deny-custom {
      background: linear-gradient(135deg, ${colors.error} 0%, ${colors.errorDark} 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 32px !important;
      font-size: 0.95rem !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      margin-right: 12px !important;
    }

    .swal2-deny-custom:hover {
      transform: translateY(-2px) !important;
    }

    .swal2-actions {
      margin-top: 1.5rem !important;
    }

    .swal2-icon {
      margin: 1rem auto 1.5rem !important;
      border-width: 3px !important;
    }

    .swal2-success {
      border-color: ${colors.success} !important;
    }

    .swal2-success .swal2-success-ring {
      border-color: rgba(76, 175, 80, 0.3) !important;
    }

    .swal2-success [class^=swal2-success-line] {
      background-color: ${colors.success} !important;
    }

    .swal2-error {
      border-color: ${colors.error} !important;
    }

    .swal2-error .swal2-x-mark-line-left,
    .swal2-error .swal2-x-mark-line-right {
      background-color: ${colors.error} !important;
    }

    .swal2-warning {
      border-color: ${colors.warning} !important;
      color: ${colors.warning} !important;
    }

    .swal2-info {
      border-color: ${colors.info} !important;
      color: ${colors.info} !important;
    }

    .swal2-question {
      border-color: ${colors.secondary} !important;
      color: ${colors.secondary} !important;
    }

    /* Backdrop */
    .swal2-container-custom {
      backdrop-filter: blur(4px) !important;
    }

    .swal2-backdrop-show {
      background: rgba(0, 0, 0, 0.6) !important;
    }

    /* Timer progress bar */
    .swal2-timer-progress-bar {
      background: ${colors.primary} !important;
    }

    /* Input styles */
    .swal2-input, .swal2-textarea, .swal2-select {
      border-radius: 8px !important;
      border: 2px solid #e0e0e0 !important;
      padding: 12px 16px !important;
      font-size: 1rem !important;
      transition: border-color 0.3s ease !important;
    }

    .swal2-input:focus, .swal2-textarea:focus, .swal2-select:focus {
      border-color: ${colors.primary} !important;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
    }
  `;
  document.head.appendChild(styles);
};

// Inicializar estilos al cargar
injectStyles();

/**
 * Servicio de alertas dinámicas para Movilidad2A
 */
const AlertService = {
  /**
   * Alerta de éxito
   */
  success: (title, message, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title: title || '¡Éxito!',
      html: message || 'La operación se completó correctamente.',
      confirmButtonText: options.confirmText || 'Aceptar',
      timer: options.timer,
      timerProgressBar: !!options.timer,
      ...options,
    });
  },

  /**
   * Alerta de error
   */
  error: (title, message, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title: title || '¡Error!',
      html: message || 'Ha ocurrido un error inesperado.',
      confirmButtonText: options.confirmText || 'Entendido',
      ...options,
    });
  },

  /**
   * Alerta de advertencia
   */
  warning: (title, message, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title: title || '¡Advertencia!',
      html: message || 'Por favor, revise la información.',
      confirmButtonText: options.confirmText || 'Entendido',
      ...options,
    });
  },

  /**
   * Alerta informativa
   */
  info: (title, message, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title: title || 'Información',
      html: message || '',
      confirmButtonText: options.confirmText || 'Aceptar',
      ...options,
    });
  },

  /**
   * Confirmación de acción
   */
  confirm: (title, message, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      icon: options.icon || 'question',
      title: title || '¿Está seguro?',
      html: message || '¿Desea continuar con esta acción?',
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Sí, continuar',
      cancelButtonText: options.cancelText || 'Cancelar',
      reverseButtons: true,
      ...options,
    });
  },

  /**
   * Confirmación de eliminación
   */
  confirmDelete: (itemName, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title: '¿Eliminar registro?',
      html: `
        <p>Está a punto de eliminar <strong>${itemName || 'este registro'}</strong>.</p>
        <p style="color: ${colors.error}; margin-top: 12px; font-size: 0.9rem;">
          <strong>Esta acción no se puede deshacer.</strong>
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Sí, eliminar',
      cancelButtonText: options.cancelText || 'Cancelar',
      reverseButtons: true,
      customClass: {
        ...baseConfig.customClass,
        confirmButton: 'swal2-deny-custom',
      },
      ...options,
    });
  },

  /**
   * Input dialog
   */
  input: (title, options = {}) => {
    return Swal.fire({
      ...baseConfig,
      title: title || 'Ingrese el valor',
      input: options.inputType || 'text',
      inputLabel: options.label || '',
      inputPlaceholder: options.placeholder || '',
      inputValue: options.defaultValue || '',
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Aceptar',
      cancelButtonText: options.cancelText || 'Cancelar',
      reverseButtons: true,
      inputValidator: options.validator,
      ...options,
    });
  },

  /**
   * Loading alert (sin botones, se cierra programáticamente)
   */
  loading: (title, message) => {
    return Swal.fire({
      ...baseConfig,
      title: title || 'Procesando...',
      html: message || 'Por favor espere un momento.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  /**
   * Cerrar cualquier alert abierto
   */
  close: () => {
    Swal.close();
  },

  /**
   * Verificar si hay un alert abierto
   */
  isVisible: () => {
    return Swal.isVisible();
  },
};

export default AlertService;
