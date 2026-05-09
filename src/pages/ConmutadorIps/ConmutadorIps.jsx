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
  selectPaginatedIps,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedIp,
  selectForm,
  selectLoading,
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
} from '../../store/conmutadorIpsStore/conmutadorIpsStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/conmutadorIpsStore/conmutadorIpsThunks';

import {
  ConmutadorIpsFilters,
  ConmutadorIpsDataTable,
  ConmutadorIpDialog,
} from './Components';

const ConmutadorIps = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const filters         = useSelector(selectFilters);
  const activeFilters   = useSelector(selectActiveFilters);
  const appliedFilters  = useSelector(selectAppliedFilters);
  const page            = useSelector(selectPage);
  const pageSize        = useSelector(selectPageSize);
  const sortField       = useSelector(selectSortField);
  const sortOrder       = useSelector(selectSortOrder);
  const paginatedData   = useSelector(selectPaginatedIps);
  const totalRows       = useSelector(selectFilteredTotalRows);
  const openModal       = useSelector(selectOpenModal);
  const selectedIp      = useSelector(selectSelectedIp);
  const form            = useSelector(selectForm);
  const loading         = useSelector(selectLoading);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };

    if (appliedFilters.search)      params.search     = appliedFilters.search;
    if (appliedFilters.protocolo)   params.protocolo  = appliedFilters.protocolo;
    if (appliedFilters.activo !== '' && appliedFilters.activo !== null && appliedFilters.activo !== undefined) {
      params.activo = appliedFilters.activo;
    }
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date   = appliedFilters.fecha_hasta;

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchIps = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchIps();
  }, [fetchIps]);

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
  const handleView   = (ip) => dispatch(viewThunk(ip));
  const handleEdit   = (ip) => dispatch(showThunk(ip.id));
  const handleDelete = (ip) => dispatch(deleteThunk(ip));
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
            Conmutador de IPs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de IPs disponibles para conmutación. Por ahora solo registro y mantenimiento.
          </Typography>
        </Box>
        {canCreate('computador_ips') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nueva IP
          </Button>
        )}
      </Box>

      <ConmutadorIpsFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      <ConmutadorIpsDataTable
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
        onEdit={canEdit('computador_ips') ? handleEdit : undefined}
        onDelete={canDelete('computador_ips') ? handleDelete : undefined}
      />

      <ConmutadorIpDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedIp={selectedIp}
        form={form}
        onFormChange={handleFormChange}
      />
    </Box>
  );
};

export default ConmutadorIps;
