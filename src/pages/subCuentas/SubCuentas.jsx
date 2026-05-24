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
  selectPaginatedSubCuentas,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedSubCuenta,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectCuentas,
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
} from '../../store/subCuentasStore/subCuentasStore';

import {
  listAllThunk,
  loadCuentasThunk,
  saveThunk,
  viewThunk,
  showThunk,
} from '../../store/subCuentasStore/subCuentasThunks';

import {
  SubCuentasFilters,
  SubCuentasDataTable,
  SubCuentaDialog,
} from './Components';

const SubCuentas = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit } = usePermissions();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedSubCuentas);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedSubCuenta = useSelector(selectSelectedSubCuenta);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const cuentas = useSelector(selectCuentas);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };

    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.cuenta) params.cuenta = appliedFilters.cuenta;
    if (appliedFilters.tipo) params.tipo = appliedFilters.tipo;
    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchSubCuentas = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar Plan de cuentas (select del formulario) al montar
  useEffect(() => {
    dispatch(loadCuentasThunk());
  }, [dispatch]);

  // Cargar lista al montar y cuando cambian los params
  useEffect(() => {
    fetchSubCuentas();
  }, [fetchSubCuentas]);

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

  // CRUD handlers — edicion parcial: solo codigo, cuenta y nombre_sub_cuenta.
  // Los campos financieros (debito/credito/acumulado) son inmutables.
  // Eliminar sigue bloqueado en el backend (405).
  const handleView = (sub) => {
    dispatch(viewThunk(sub));
  };
  const handleEdit = (sub) => {
    dispatch(showThunk(sub.id));
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
            Sub-cuentas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de sub-cuentas vinculadas al Plan de cuentas
          </Typography>
        </Box>
        {canCreate('sub_cuentas') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nueva sub-cuenta
          </Button>
        )}
      </Box>

      {/* Filters */}
      <SubCuentasFilters
        filters={filters}
        activeFilters={activeFilters}
        cuentas={cuentas}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table — Ver + Editar (solo 3 campos); sin Eliminar (bloqueado en backend) */}
      <SubCuentasDataTable
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
        onEdit={canEdit('sub_cuentas') ? handleEdit : undefined}
      />

      {/* Create/Edit Dialog — en modo edit solo se permiten codigo, cuenta y nombre */}
      <SubCuentaDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedSubCuenta={selectedSubCuenta}
        form={form}
        onFormChange={handleFormChange}
        cuentas={cuentas}
      />
    </Box>
  );
};

export default SubCuentas;
