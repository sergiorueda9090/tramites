import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import {
  login as loginAction,
  logout as logoutAction,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import { ROUTES } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const login = useCallback(
    async (credentials) => {
      try {
        const result = await dispatch(loginAction(credentials)).unwrap();
        dispatch(
          showSnackbar({
            message: 'Inicio de sesión exitoso',
            severity: 'success',
          })
        );
        navigate(ROUTES.DASHBOARD);
        return result;
      } catch (err) {
        dispatch(
          showSnackbar({
            message: err || 'Error al iniciar sesión',
            severity: 'error',
          })
        );
        throw err;
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAction());
    dispatch(
      showSnackbar({
        message: 'Sesión cerrada correctamente',
        severity: 'info',
      })
    );
    navigate(ROUTES.LOGIN);
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.rol === 'admin') return true;
      // Add more permission logic as needed
      return user.permissions?.includes(permission) || false;
    },
    [user]
  );

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.rol);
    },
    [user]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError: clearAuthError,
    hasPermission,
    hasRole,
  };
};

export default useAuth;
