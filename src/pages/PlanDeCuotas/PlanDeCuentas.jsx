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
  selectPaginatedCuentas,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedCuenta,
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
} from '../../store/planDeCuotasStore/planDeCuotasStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/planDeCuotasStore/planDeCuotasThunks';

import {
  PlanDeCuentasFilters,
  PlanDeCuentasDataTable,
  PlanDeCuentasDialog,
} from './Components';

const PlanDeCuentas = () => {
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
  const paginatedData = useSelector(selectPaginatedCuentas);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedCuenta = useSelector(selectSelectedCuenta);
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

    if (appliedFilters.search) {
      params.search = appliedFilters.search;
    }
    if (appliedFilters.tipo) {
      params.tipo = appliedFilters.tipo;
    }
    if (appliedFilters.acumulado) {
      params.acumulado = appliedFilters.acumulado;
    }
    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchCuentas = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchCuentas();
  }, [fetchCuentas]);

  // Handlers de paginación (componente base 0, store/backend base 1)
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1));
  };
  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };
  const pageForComponent = page - 1;

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
  const handleView = (cuenta) => {
    dispatch(viewThunk(cuenta));
  };
  const handleEdit = (cuenta) => {
    dispatch(showThunk(cuenta.id));
  };
  const handleDelete = (cuenta) => {
    dispatch(deleteThunk(cuenta));
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
            Plan de cuentas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión del Plan Único de Cuentas (PUC)
          </Typography>
        </Box>
        {canCreate('plan_de_cuentas') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nueva cuenta
          </Button>
        )}
      </Box>

      {/* Filters */}
      <PlanDeCuentasFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <PlanDeCuentasDataTable
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
        onEdit={canEdit('plan_de_cuentas') ? handleEdit : undefined}
        onDelete={canDelete('plan_de_cuentas') ? handleDelete : undefined}
      />

      {/* Create/Edit Dialog */}
      <PlanDeCuentasDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedCuenta={selectedCuenta}
        form={form}
        onFormChange={handleFormChange}
      />
    </Box>
  );
};

export default PlanDeCuentas;
