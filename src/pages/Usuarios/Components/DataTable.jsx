import React from 'react';
import { Chip } from '@mui/material';
import DataTableBase from '../../../components/common/DataTable';
import { USER_ROLES, USER_ROLE_LABELS } from '../../../utils/constants';
import { formatDateTime } from '../../../utils/helpers';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'nombre', headerName: 'Nombre', minWidth: 150 },
  { field: 'email', headerName: 'Email', minWidth: 200 },
  {
    field: 'rol',
    headerName: 'Rol',
    minWidth: 130,
    renderCell: ({ value }) => (
      <Chip
        label={USER_ROLE_LABELS[value] || value}
        size="small"
        color={value === USER_ROLES.ADMIN ? 'primary' : 'default'}
        variant={value === USER_ROLES.ADMIN ? 'filled' : 'outlined'}
      />
    ),
  },
  {
    field: 'estado',
    headerName: 'Estado',
    minWidth: 100,
    renderCell: ({ value }) => (
      <Chip
        label={value ? 'Activo' : 'Inactivo'}
        size="small"
        color={value ? 'success' : 'default'}
      />
    ),
  },
  {
    field: 'ultimoAcceso',
    headerName: 'Último acceso',
    minWidth: 150,
    renderCell: ({ value }) => formatDateTime(value),
  },
];

const UsuariosDataTable = ({
  data,
  loading,
  page,
  pageSize,
  totalRows,
  sortField,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <DataTableBase
      columns={columns}
      data={data}
      loading={loading}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      sortField={sortField}
      sortOrder={sortOrder}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSort={onSort}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="No se encontraron usuarios"
    />
  );
};

export { columns };
export default UsuariosDataTable;
