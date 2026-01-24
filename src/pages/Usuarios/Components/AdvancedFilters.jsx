import React from 'react';
import AdvancedFiltersBase from '../../../components/common/AdvancedFilters';
import { USER_ROLE_LABELS } from '../../../utils/constants';

const filterConfig = [
  {
    field: 'search',
    type: 'text',
    label: 'Buscar',
    placeholder: 'Nombre o email...',
    showSearchIcon: true,
    width: 4,
  },
  {
    field: 'rol',
    type: 'select',
    label: 'Rol',
    options: Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
    width: 4,
  },
  {
    field: 'estado',
    type: 'select',
    label: 'Estado',
    options: [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
    ],
    width: 4,
  },
];

const UsuariosFilters = ({
  filters,
  activeFilters,
  onFilterChange,
  onApply,
  onClear,
  onClearFilter,
}) => {
  return (
    <AdvancedFiltersBase
      filters={filters}
      filterConfig={filterConfig}
      activeFilters={activeFilters}
      onFilterChange={onFilterChange}
      onApply={onApply}
      onClear={onClear}
      onClearFilter={onClearFilter}
    />
  );
};

export { filterConfig };
export default UsuariosFilters;
