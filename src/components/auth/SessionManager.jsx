import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginFail } from '../../store/authStore/authStore';
import { isTokenValid, getTokenRemainingTime } from '../../services/api';
import AlertService from '../../services/alertService';
import { ROUTES } from '../../utils/constants';

/**
 * Componente para gestionar la sesión del usuario
 * - Verifica periódicamente si el token es válido
 * - Muestra advertencia cuando la sesión está por expirar
 * - Cierra sesión automáticamente cuando el token expira
 */
const SessionManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogin } = useSelector((state) => state.authStore);

  const handleLogout = useCallback(() => {
    dispatch(loginFail());
    navigate(ROUTES.LOGIN);
  }, [dispatch, navigate]);

  const checkSession = useCallback(async () => {
    if (!isLogin) return;

    const remainingTime = getTokenRemainingTime();

    // Si el token ya expiró
    if (!isTokenValid()) {
      AlertService.warning(
        'Sesión expirada',
        'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
      ).then(() => {
        handleLogout();
      });
      return;
    }

    // Si quedan menos de 5 minutos, mostrar advertencia
    if (remainingTime <= 5 && remainingTime > 0) {
      const result = await AlertService.confirm(
        'Sesión por expirar',
        `Su sesión expirará en <strong>${remainingTime} minuto(s)</strong>.<br/>¿Desea continuar trabajando?`,
        {
          confirmText: 'Continuar',
          cancelText: 'Cerrar sesión',
          icon: 'warning',
        }
      );

      if (!result.isConfirmed) {
        handleLogout();
      }
      // TODO: Si confirma, llamar al endpoint de refresh token
    }
  }, [isLogin, handleLogout]);

  useEffect(() => {
    if (!isLogin) return;

    // Verificar inmediatamente al montar
    checkSession();

    // Verificar cada 60 segundos
    const interval = setInterval(checkSession, 60000);

    // Verificar cuando la ventana vuelve a estar activa
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLogin, checkSession]);

  // Este componente no renderiza nada
  return null;
};

export default SessionManager;
