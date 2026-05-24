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
  selectPaginatedCategorias,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedCategoria,
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
} from '../../store/gastosCategoriaStore/gastosCategoriaStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  loadSubCuentasThunk,
} from '../../store/gastosCategoriaStore/gastosCategoriaThunks';

import {
  CategoriasFilters,
  CategoriasDataTable,
  CategoriaDialog,
} from './Components';

const GastosCategoria = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedCategorias);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedCategoria = useSelector(selectSelectedCategoria);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const subCuentas = useSelector(selectSubCuentas);

  useEffect(() => {
    dispatch(loadSubCuentasThunk());
  }, [dispatch]);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (sortField) params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetch = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Paginación
  const handlePageChange = (newPage) => dispatch(setPage(newPage + 1));
  const handlePageSizeChange = (newPageSize) => dispatch(setPageSize(newPageSize));
  const pageForComponent = page - 1;

  // Sort
  const handleSort = (field) => dispatch(setSort({ field }));

  // Filtros
  const handleFilterChange = (field, value) => dispatch(updateFilter({ field, value }));
  const handleApplyFilters = () => dispatch(applyFilters());
  const handleClearFilters = () => dispatch(clearFilters());
  const handleClearFilter = (field) => dispatch(clearFilter(field));

  // CRUD
  const handleView = (c) => dispatch(viewThunk(c));
  const handleEdit = (c) => dispatch(showThunk(c.id));
  const handleDelete = (c) => dispatch(deleteThunk(c));
  const handleCreate = () => dispatch(openCreateModal());
  const handleCloseModal = () => dispatch(closeModal());
  const handleFormChange = (field, value) => dispatch(updateForm({ field, value }));
  const handleSave = () => dispatch(saveThunk(form));

  return (
    <Box>
      {/* Header */}
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
            Categorías de gasto
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las categorías para clasificar los gastos del sistema.
          </Typography>
        </Box>
        {canCreate('gastos_categoria') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nueva categoría
          </Button>
        )}
      </Box>

      {/* Filtros */}
      <CategoriasFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Tabla */}
      <CategoriasDataTable
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
        onEdit={canEdit('gastos_categoria') ? handleEdit : undefined}
        onDelete={canDelete('gastos_categoria') ? handleDelete : undefined}
      />

      {/* Modal crear/editar */}
      <CategoriaDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedCategoria={selectedCategoria}
        form={form}
        onFormChange={handleFormChange}
        subCuentas={subCuentas}
      />
    </Box>
  );
};

export default GastosCategoria;
