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
  selectPaginatedProveedores,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedProveedor,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectSubCuentas,
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
} from '../../store/proveedoresStore/proveedoresStore';

import {
  listAllThunk,
  loadSubCuentasThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/proveedoresStore/proveedoresThunks';

import {
  ProveedoresFilters,
  ProveedoresDataTable,
  ProveedorDialog,
} from './Components';

const Proveedores = () => {
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
  const paginatedData = useSelector(selectPaginatedProveedores);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedProveedor = useSelector(selectSelectedProveedor);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const subCuentas = useSelector(selectSubCuentas);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.sub_cuenta) params.sub_cuenta = appliedFilters.sub_cuenta;
    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }
    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchProveedores = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  // Cargar selects auxiliares al montar
  useEffect(() => {
    dispatch(loadSubCuentasThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Handlers de paginación (componente base 0, store/backend base 1)
  const handlePageChange = (newPage) => dispatch(setPage(newPage + 1));
  const handlePageSizeChange = (newPageSize) => dispatch(setPageSize(newPageSize));
  const pageForComponent = page - 1;

  const handleSort = (field) => dispatch(setSort({ field }));

  const handleFilterChange = (field, value) => dispatch(updateFilter({ field, value }));
  const handleApplyFilters = () => dispatch(applyFilters());
  const handleClearFilters = () => dispatch(clearFilters());
  const handleClearFilter = (field) => dispatch(clearFilter(field));

  // CRUD handlers
  const handleView = (proveedor) => dispatch(viewThunk(proveedor));
  const handleEdit = (proveedor) => dispatch(showThunk(proveedor.id));
  const handleDelete = (proveedor) => dispatch(deleteThunk(proveedor));
  const handleCreate = () => dispatch(openCreateModal());
  const handleCloseModal = () => dispatch(closeModal());
  const handleFormChange = (field, value) => dispatch(updateForm({ field, value }));
  const handleSave = () => dispatch(saveThunk(form));

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
            Proveedores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de proveedores y su sub-cuenta contable asociada
          </Typography>
        </Box>
        {canCreate('proveedores') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nuevo proveedor
          </Button>
        )}
      </Box>

      {/* Filters */}
      <ProveedoresFilters
        filters={filters}
        activeFilters={activeFilters}
        subCuentas={subCuentas}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <ProveedoresDataTable
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
        onEdit={canEdit('proveedores') ? handleEdit : undefined}
        onDelete={canDelete('proveedores') ? handleDelete : undefined}
      />

      {/* Create/Edit Dialog */}
      <ProveedorDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedProveedor={selectedProveedor}
        form={form}
        onFormChange={handleFormChange}
        subCuentas={subCuentas}
      />
    </Box>
  );
};

export default Proveedores;
