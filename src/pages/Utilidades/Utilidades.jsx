import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import usePermissions from '../../hooks/usePermissions';

import {
  selectFilters,
  selectActiveFilters,
  selectAppliedFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedRegistros,
  selectFilteredTotalRows,
  selectLoading,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
} from '../../store/utilidadesStore/utilidadesStore';

import {
  listAllThunk,
  viewThunk,
  deleteThunk,
} from '../../store/utilidadesStore/utilidadesThunks';

import {
  UtilidadesFilters,
  UtilidadesDataTable,
} from './Components';

const Utilidades = () => {
  const dispatch = useDispatch();
  const { canDelete } = usePermissions();

  const filters         = useSelector(selectFilters);
  const activeFilters   = useSelector(selectActiveFilters);
  const appliedFilters  = useSelector(selectAppliedFilters);
  const page            = useSelector(selectPage);
  const pageSize        = useSelector(selectPageSize);
  const sortField       = useSelector(selectSortField);
  const sortOrder       = useSelector(selectSortOrder);
  const paginatedData   = useSelector(selectPaginatedRegistros);
  const totalRows       = useSelector(selectFilteredTotalRows);
  const loading         = useSelector(selectLoading);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };

    if (appliedFilters.search)      params.search     = appliedFilters.search;
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date   = appliedFilters.fecha_hasta;

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchRegistros = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

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

  // Acciones (read-only + soft-delete)
  const handleView   = (registro) => dispatch(viewThunk(registro));
  const handleDelete = (registro) => dispatch(deleteThunk(registro));

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
            Utilidades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registro de trámites finalizados — fecha, placa, comisión, cilindraje, modelo y N° chasis (consulta).
          </Typography>
        </Box>
      </Box>

      <UtilidadesFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      <UtilidadesDataTable
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
        onDelete={canDelete('utilidades') ? handleDelete : undefined}
      />
    </Box>
  );
};

export default Utilidades;
