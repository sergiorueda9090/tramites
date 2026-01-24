import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils/constants';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige al login si no hay token válido
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLogin, token } = useSelector((state) => state.authStore);

  // Verificar si hay token y está autenticado
  if (!isLogin || !token) {
    // Guardar la ubicación intentada para redirigir después del login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
