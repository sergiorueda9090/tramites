import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedUsers,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedUser,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  openCreateModal,
  closeModal,
  updateForm,
} from '../../store/usersStore/usersStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  toggleStatusThunk,
} from '../../store/usersStore/usersThunks';

import {
  UsuariosFilters,
  UsuariosDataTable,
  UsuarioDialog,
} from './Components';

const Usuarios = () => {
  const dispatch = useDispatch();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedUsers);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedUser = useSelector(selectSelectedUser);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);

  /**
   * Construye los parámetros de consulta para el backend
   */
  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
    };

    // Agregar búsqueda si existe
    if (appliedFilters.search) {
      params.search = appliedFilters.search;
    }

    // Agregar filtro de role si existe
    if (appliedFilters.role) {
      params.role = appliedFilters.role;
    }

    // Agregar filtro de estado si existe
    if (appliedFilters.is_active !== '') {
      params.is_active = appliedFilters.is_active;
    }

    // Agregar ordenamiento si existe
    if (sortField) {
      // El backend usa formato: 'field' para asc, '-field' para desc
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar usuarios del backend
   */
  const fetchUsers = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar usuarios al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers de paginación
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  // Handler de ordenamiento
  const handleSort = (field) => {
    dispatch(setSort({ field }));
  };

  // Handlers de filtros
  const handleFilterChange = (field, value) => {
    dispatch(updateFilter({ field, value }));
  };

  const handleApplyFilters = () => {
    dispatch(applyFilters());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleClearFilter = (field) => {
    dispatch(clearFilter(field));
  };

  // Handlers de CRUD
  const handleView = (user) => {
    dispatch(viewThunk(user));
  };

  const handleEdit = (user) => {
    dispatch(showThunk(user.id));
  };

  const handleDelete = (user) => {
    dispatch(deleteThunk(user));
  };

  const handleToggleStatus = (user) => {
    dispatch(toggleStatusThunk(user));
  };

  const handleCreate = () => {
    dispatch(openCreateModal());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleFormChange = (field, value) => {
    dispatch(updateForm({ field, value }));
  };

  const handleSave = () => {
    dispatch(saveThunk(form));
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de usuarios del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo usuario
        </Button>
      </Box>

      {/* Filters */}
      <UsuariosFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <UsuariosDataTable
        data={paginatedData}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        sortField={sortField}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create/Edit Dialog */}
      <UsuarioDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedUser={selectedUser}
        form={form}
        onFormChange={handleFormChange}
      />
    </Box>
  );
};

export default Usuarios;
