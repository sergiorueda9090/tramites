import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils/constants';
import usePermissions from '../../hooks/usePermissions';

/**
 * Protege una ruta de módulo verificando que el usuario tenga permiso can_view.
 * Si no tiene permiso, redirige al dashboard.
 */
const ProtectedModule = ({ moduleCode, children }) => {
  const { canView } = usePermissions();

  if (!canView(moduleCode)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedModule;
