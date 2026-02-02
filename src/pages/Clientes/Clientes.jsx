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
  selectPaginatedClientes,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedCliente,
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
  addPrecio,
  updatePrecio,
  removePrecio,
} from '../../store/clientesStore/clientesStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/clientesStore/clientesThunks';

import {
  ClientesFilters,
  ClientesDataTable,
  ClienteDialog,
} from './Components';

const Clientes = () => {
  const dispatch = useDispatch();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedClientes);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedCliente = useSelector(selectSelectedCliente);
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

    // Agregar filtro de medio de comunicación si existe
    if (appliedFilters.medio_comunicacion) {
      params.medio_comunicacion = appliedFilters.medio_comunicacion;
    }

    // Agregar filtro de usuario si existe
    if (appliedFilters.usuario) {
      params.usuario = appliedFilters.usuario;
    }

    // Agregar ordenamiento si existe
    if (sortField) {
      // El backend usa formato: 'field' para asc, '-field' para desc
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar clientes del backend
   */
  const fetchClientes = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar clientes al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Handlers de paginación
  // El componente Pagination usa base 0, pero el store/backend usa base 1
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1)); // Convertir de base 0 a base 1
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  // Convertir página de base 1 (store) a base 0 (componente)
  const pageForComponent = page - 1;

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
  const handleView = (cliente) => {
    dispatch(viewThunk(cliente));
  };

  const handleEdit = (cliente) => {
    dispatch(showThunk(cliente.id));
  };

  const handleDelete = (cliente) => {
    dispatch(deleteThunk(cliente));
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

  // Handlers de precios
  const handleAddPrecio = (precioData) => {
    dispatch(addPrecio(precioData));
  };

  const handleUpdatePrecio = (index, data) => {
    dispatch(updatePrecio({ index, data }));
  };

  const handleRemovePrecio = (index) => {
    dispatch(removePrecio(index));
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
            Clientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de clientes del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo cliente
        </Button>
      </Box>

      {/* Filters */}
      <ClientesFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <ClientesDataTable
        data={paginatedData}
        loading={loading}
        page={pageForComponent}
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
      />

      {/* Create/Edit Dialog */}
      <ClienteDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedCliente={selectedCliente}
        form={form}
        onFormChange={handleFormChange}
        onAddPrecio={handleAddPrecio}
        onUpdatePrecio={handleUpdatePrecio}
        onRemovePrecio={handleRemovePrecio}
      />
    </Box>
  );
};

export default Clientes;
