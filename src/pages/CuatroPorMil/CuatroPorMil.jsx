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
  selectStats,
  selectStatsLoading,
  selectSubCuentas,
  selectConfig,
  selectSavingConfig,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
} from '../../store/cuatroPorMilStore/cuatroPorMilStore';

import {
  listAllThunk,
  fetchStatsThunk,
  viewThunk,
  loadSubCuentasThunk,
  loadConfigThunk,
  saveConfigThunk,
} from '../../store/cuatroPorMilStore/cuatroPorMilThunks';

import {
  CuatroPorMilFilters,
  CuatroPorMilDataTable,
  CuatroPorMilStatsPanel,
  CuatroPorMilConfigPanel,
} from './Components';

const CuatroPorMil = () => {
  const dispatch = useDispatch();
  const { canEdit } = usePermissions();

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
  const stats           = useSelector(selectStats);
  const statsLoading    = useSelector(selectStatsLoading);
  const subCuentas      = useSelector(selectSubCuentas);
  const config          = useSelector(selectConfig);
  const savingConfig    = useSelector(selectSavingConfig);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };

    if (appliedFilters.search)      params.search      = appliedFilters.search;
    if (appliedFilters.modulo)      params.modulo      = appliedFilters.modulo;
    if (appliedFilters.tarjeta_id)  params.tarjeta_id  = appliedFilters.tarjeta_id;
    if (appliedFilters.fecha_desde) params.start_date  = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date    = appliedFilters.fecha_hasta;

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

  // Cargar sub-cuentas y configuración (panel de configuración).
  useEffect(() => {
    dispatch(loadSubCuentasThunk());
    dispatch(loadConfigThunk());
  }, [dispatch]);

  // Stats: dependen sólo de los filtros aplicados, no de paginación ni sort.
  // Fetch independiente y en paralelo con el listado.
  useEffect(() => {
    const params = {};
    if (appliedFilters.search)      params.search     = appliedFilters.search;
    if (appliedFilters.modulo)      params.modulo     = appliedFilters.modulo;
    if (appliedFilters.tarjeta_id)  params.tarjeta_id = appliedFilters.tarjeta_id;
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date   = appliedFilters.fecha_hasta;
    dispatch(fetchStatsThunk(params));
  }, [dispatch, appliedFilters]);

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

  // Vista de detalle (read-only)
  const handleView = (registro) => dispatch(viewThunk(registro));

  // Configuración
  const handleSaveConfig = (payload) => dispatch(saveConfigThunk(payload));

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
            Cuatro por mil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registro centralizado de los 4x1000 generados por los módulos financieros (consulta).
          </Typography>
        </Box>
      </Box>

      <CuatroPorMilConfigPanel
        config={config}
        subCuentas={subCuentas}
        saving={savingConfig}
        canEdit={canEdit('cuatro_por_mil')}
        onSave={handleSaveConfig}
      />

      <CuatroPorMilFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      <CuatroPorMilStatsPanel stats={stats} loading={statsLoading} />

      <CuatroPorMilDataTable
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
      />
    </Box>
  );
};

export default CuatroPorMil;
