import { useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';

/**
 * Hook para verificar permisos de módulo del usuario autenticado.
 * SuperAdmin tiene acceso total.
 *
 * Uso:
 *   const { canView, canCreate, canEdit, canDelete, getModulePermissions } = usePermissions();
 *   if (canView('clientes')) { ... }
 */
export const usePermissions = () => {
  const { permissions, idrol } = useSelector((state) => state.authStore);

  const isSuperAdmin = idrol === 'SuperAdmin';

  const getModulePermissions = useCallback(
    (moduleCode) => {
      if (isSuperAdmin) {
        return { can_view: true, can_create: true, can_edit: true, can_delete: true };
      }
      const perm = permissions.find((p) => p.module === moduleCode);
      return perm || { can_view: false, can_create: false, can_edit: false, can_delete: false };
    },
    [permissions, isSuperAdmin]
  );

  const canView = useCallback(
    (moduleCode) => getModulePermissions(moduleCode).can_view,
    [getModulePermissions]
  );

  const canCreate = useCallback(
    (moduleCode) => getModulePermissions(moduleCode).can_create,
    [getModulePermissions]
  );

  const canEdit = useCallback(
    (moduleCode) => getModulePermissions(moduleCode).can_edit,
    [getModulePermissions]
  );

  const canDelete = useCallback(
    (moduleCode) => getModulePermissions(moduleCode).can_delete,
    [getModulePermissions]
  );

  return { canView, canCreate, canEdit, canDelete, getModulePermissions, isSuperAdmin };
};

export default usePermissions;
