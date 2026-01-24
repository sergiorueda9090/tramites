import { useCallback } from 'react';
import AlertService from '../services/alertService';

/**
 * Hook personalizado para usar el servicio de alertas
 * Proporciona métodos convenientes para mostrar diferentes tipos de alertas
 */
const useAlert = () => {
  // Alertas principales
  const success = useCallback((title, message, options) => {
    return AlertService.success(title, message, options);
  }, []);

  const error = useCallback((title, message, options) => {
    return AlertService.error(title, message, options);
  }, []);

  const warning = useCallback((title, message, options) => {
    return AlertService.warning(title, message, options);
  }, []);

  const info = useCallback((title, message, options) => {
    return AlertService.info(title, message, options);
  }, []);

  // Confirmaciones
  const confirm = useCallback((title, message, options) => {
    return AlertService.confirm(title, message, options);
  }, []);

  const confirmDelete = useCallback((itemName, options) => {
    return AlertService.confirmDelete(itemName, options);
  }, []);

  // Utilidades
  const input = useCallback((title, options) => {
    return AlertService.input(title, options);
  }, []);

  const loading = useCallback((title, message) => {
    return AlertService.loading(title, message);
  }, []);

  const close = useCallback(() => {
    return AlertService.close();
  }, []);

  return {
    // Alertas principales
    success,
    error,
    warning,
    info,
    // Confirmaciones
    confirm,
    confirmDelete,
    // Utilidades
    input,
    loading,
    close,
  };
};

export default useAlert;
