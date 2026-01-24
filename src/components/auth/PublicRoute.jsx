import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils/constants';

/**
 * Componente para rutas públicas (login, registro, etc.)
 * Redirige al dashboard si ya está autenticado
 */
const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { isLogin, token } = useSelector((state) => state.authStore);

  // Si ya está autenticado, redirigir al dashboard o a la ruta guardada
  if (isLogin && token) {
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
