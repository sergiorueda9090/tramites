import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import usePermissions from '../../hooks/usePermissions';

import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedAjustesSaldo,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedAjusteSaldo,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectClientes,
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
} from '../../store/ajusteSaldoStore/ajusteSaldoStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  loadAuxDataThunk,
} from '../../store/ajusteSaldoStore/ajusteSaldoThunks';

import {
  AjusteSaldoFilters,
  AjusteSaldoDataTable,
  AjusteSaldoDialog,
} from './Components';

const AjusteSaldo = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedAjustesSaldo);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedAjusteSaldo = useSelector(selectSelectedAjusteSaldo);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const clientes = useSelector(selectClientes);

  /**
   * Construye los parámetros de consulta para el backend
   */
  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
    };

    if (appliedFilters.search) {
      params.search = appliedFilters.search;
    }

    if (appliedFilters.cliente) {
      params.cliente = appliedFilters.cliente;
    }

    if (appliedFilters.fecha_desde) {
      params.fecha_start = appliedFilters.fecha_desde;
    }

    if (appliedFilters.fecha_hasta) {
      params.fecha_end = appliedFilters.fecha_hasta;
    }

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar ajustes de saldo del backend
   */
  const fetchAjustesSaldo = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar datos auxiliares al montar
  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

  // Cargar ajustes al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchAjustesSaldo();
  }, [fetchAjustesSaldo]);

  // Handlers de paginación
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

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
  const handleView = (ajuste) => {
    dispatch(viewThunk(ajuste));
  };

  const handleEdit = (ajuste) => {
    dispatch(showThunk(ajuste.id));
  };

  const handleDelete = (ajuste) => {
    dispatch(deleteThunk(ajuste));
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
            Ajustes de Saldo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de ajustes de saldo del sistema
          </Typography>
        </Box>
        {canCreate('ajuste_saldo') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nuevo ajuste
          </Button>
        )}
      </Box>

      {/* Filters */}
      <AjusteSaldoFilters
        filters={filters}
        activeFilters={activeFilters}
        clientes={clientes}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <AjusteSaldoDataTable
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
        onEdit={canEdit('ajuste_saldo') ? handleEdit : undefined}
        onDelete={canDelete('ajuste_saldo') ? handleDelete : undefined}
      />

      {/* Create/Edit Dialog */}
      <AjusteSaldoDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedAjusteSaldo={selectedAjusteSaldo}
        form={form}
        onFormChange={handleFormChange}
        clientes={clientes}
      />
    </Box>
  );
};

export default AjusteSaldo;
