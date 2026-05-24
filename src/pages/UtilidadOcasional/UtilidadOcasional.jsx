import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import usePermissions from '../../hooks/usePermissions';

import {
  selectFilters,
  selectActiveFilters,
  selectAppliedFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedUtilidades,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedUtilidad,
  selectForm,
  selectLoading,
  selectTarjetas,
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
} from '../../store/utilidadOcasionalStore/utilidadOcasionalStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  loadAuxDataThunk,
} from '../../store/utilidadOcasionalStore/utilidadOcasionalThunks';

import {
  UtilidadOcasionalFilters,
  UtilidadOcasionalDataTable,
  UtilidadOcasionalDialog,
} from './Components';

const UtilidadOcasional = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const filters          = useSelector(selectFilters);
  const activeFilters    = useSelector(selectActiveFilters);
  const appliedFilters   = useSelector(selectAppliedFilters);
  const page             = useSelector(selectPage);
  const pageSize         = useSelector(selectPageSize);
  const sortField        = useSelector(selectSortField);
  const sortOrder        = useSelector(selectSortOrder);
  const paginatedData    = useSelector(selectPaginatedUtilidades);
  const totalRows        = useSelector(selectFilteredTotalRows);
  const openModal        = useSelector(selectOpenModal);
  const selectedUtilidad = useSelector(selectSelectedUtilidad);
  const form             = useSelector(selectForm);
  const loading          = useSelector(selectLoading);
  const tarjetas         = useSelector(selectTarjetas);
  const subCuentas       = useSelector(selectSubCuentas);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };

    if (appliedFilters.search)      params.search      = appliedFilters.search;
    if (appliedFilters.tarjeta)     params.tarjeta     = appliedFilters.tarjeta;
    if (appliedFilters.fecha_desde) params.fecha_start = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.fecha_end   = appliedFilters.fecha_hasta;

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchUtilidades = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  // Cargar tarjetas al montar (para el modal y filtros)
  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchUtilidades();
  }, [fetchUtilidades]);

  // Paginación (componente usa base 0; store/backend usa base 1)
  const handlePageChange     = (newPage) => dispatch(setPage(newPage + 1));
  const handlePageSizeChange = (newSize) => dispatch(setPageSize(newSize));
  const pageForComponent     = page - 1;

  const handleSort = (field) => dispatch(setSort({ field }));

  // Filtros
  const handleFilterChange = (field, value) => dispatch(updateFilter({ field, value }));
  const handleApplyFilters = () => dispatch(applyFilters());
  const handleClearFilters = () => dispatch(clearFilters());
  const handleClearFilter  = (field) => dispatch(clearFilter(field));

  // CRUD
  const handleView   = (utilidad) => dispatch(viewThunk(utilidad));
  const handleEdit   = (utilidad) => dispatch(showThunk(utilidad.id));
  const handleDelete = (utilidad) => dispatch(deleteThunk(utilidad));
  const handleCreate = () => dispatch(openCreateModal());

  const handleCloseModal = () => dispatch(closeModal());
  const handleFormChange = (field, value) => dispatch(updateForm({ field, value }));
  const handleSave       = () => dispatch(saveThunk(form));

  return (
    <Box>
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
            Utilidad ocasional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de utilidades ocasionales — el 4×1000 se aplica automáticamente si la tarjeta lo tiene activo.
          </Typography>
        </Box>
        {canCreate('utilidad_ocasional') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nueva utilidad
          </Button>
        )}
      </Box>

      <UtilidadOcasionalFilters
        filters={filters}
        activeFilters={activeFilters}
        tarjetas={tarjetas}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      <UtilidadOcasionalDataTable
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
        onEdit={canEdit('utilidad_ocasional') ? handleEdit : undefined}
        onDelete={canDelete('utilidad_ocasional') ? handleDelete : undefined}
      />

      <UtilidadOcasionalDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedUtilidad={selectedUtilidad}
        form={form}
        onFormChange={handleFormChange}
        tarjetas={tarjetas}
        subCuentas={subCuentas}
      />
    </Box>
  );
};

export default UtilidadOcasional;
