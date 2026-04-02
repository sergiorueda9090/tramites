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
  selectPaginatedEndpoints,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedEndpoint,
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
} from '../../store/apiAppStore/apiAppStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/apiAppStore/apiAppThunks';

import {
  ApiAppFilters,
  ApiAppDataTable,
  EndpointDialog,
} from './Components';

const ApiApp = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedEndpoints);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedEndpoint = useSelector(selectSelectedEndpoint);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.metodo_http) params.metodo_http = appliedFilters.metodo_http;
    if (appliedFilters.activo) params.activo = appliedFilters.activo;
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date = appliedFilters.fecha_hasta;
    if (sortField) params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchEndpoints = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const handlePageChange = (newPage) => dispatch(setPage(newPage + 1));
  const handlePageSizeChange = (newPageSize) => dispatch(setPageSize(newPageSize));
  const pageForComponent = page - 1;
  const handleSort = (field) => dispatch(setSort({ field }));
  const handleFilterChange = (field, value) => dispatch(updateFilter({ field, value }));
  const handleApplyFilters = () => dispatch(applyFilters());
  const handleClearFilters = () => dispatch(clearFilters());
  const handleClearFilter = (field) => dispatch(clearFilter(field));
  const handleView = (ep) => dispatch(viewThunk(ep));
  const handleEdit = (ep) => dispatch(showThunk(ep.id));
  const handleDelete = (ep) => dispatch(deleteThunk(ep));
  const handleCreate = () => dispatch(openCreateModal());
  const handleCloseModal = () => dispatch(closeModal());
  const handleFormChange = (field, value) => dispatch(updateForm({ field, value }));
  const handleSave = () => dispatch(saveThunk(form));

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
            API Endpoints
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Catalogo de endpoints externos del sistema
          </Typography>
        </Box>
        {canCreate('api_app') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nuevo endpoint
          </Button>
        )}
      </Box>

      <ApiAppFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      <ApiAppDataTable
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
        onEdit={canEdit('api_app') ? handleEdit : undefined}
        onDelete={canDelete('api_app') ? handleDelete : undefined}
      />

      <EndpointDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedEndpoint={selectedEndpoint}
        form={form}
        onFormChange={handleFormChange}
      />
    </Box>
  );
};

export default ApiApp;
