import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Pagination, TextField, MenuItem, Stack, Button, Tooltip, IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssessmentIcon from '@mui/icons-material/Assessment';

import StatsCards         from './Components/StatsCards';
import BalanceFilters     from './Components/BalanceFilters';
import BalanceTable       from './Components/BalanceTable';
import MovimientosDrawer  from './Components/MovimientosDrawer';
import AsientoDialog      from './Components/AsientoDialog';

import {
  selectBalance,
  selectLoadingBalance,
  selectBalancePagination,
  selectBalanceFilters,
  selectAppliedBalanceFilters,
  selectResumen,
  selectLoadingResumen,
  selectTotalSubCuentas,
  setBalancePage,
  setBalancePageSize,
  updateBalanceFilter,
  applyBalanceFilters,
  clearBalanceFilters,
  openMovimientosDrawer,
} from '../../store/dashboardContableStore/dashboardContableStore';
import {
  loadBalanceThunk,
  loadResumenThunk,
} from '../../store/dashboardContableStore/dashboardContableThunks';

const DashboardContable = () => {
  const dispatch = useDispatch();
  const balance        = useSelector(selectBalance);
  const loading        = useSelector(selectLoadingBalance);
  const pagination     = useSelector(selectBalancePagination);
  const filters        = useSelector(selectBalanceFilters);
  const appliedFilters = useSelector(selectAppliedBalanceFilters);
  const resumen        = useSelector(selectResumen);
  const loadingResumen = useSelector(selectLoadingResumen);
  const totalSubCuentas = useSelector(selectTotalSubCuentas);

  useEffect(() => {
    dispatch(loadResumenThunk());
    dispatch(loadBalanceThunk({ page: 1 }));
  }, [dispatch]);

  const activeFilters = Object.entries(appliedFilters)
    .filter(([_, v]) => v !== '')
    .map(([key, value]) => ({ key, value }));

  const handleFilterChange = (field, value) => {
    dispatch(updateBalanceFilter({ field, value }));
  };
  const handleApply = () => {
    dispatch(applyBalanceFilters());
    dispatch(loadBalanceThunk({ page: 1 }));
  };
  const handleClear = () => {
    dispatch(clearBalanceFilters());
    dispatch(loadBalanceThunk({ page: 1 }));
  };
  const handleClearFilter = (key) => {
    dispatch(updateBalanceFilter({ field: key, value: '' }));
    dispatch(applyBalanceFilters());
    dispatch(loadBalanceThunk({ page: 1 }));
  };
  const handlePage = (_e, page) => {
    dispatch(setBalancePage(page));
    dispatch(loadBalanceThunk({ page }));
  };
  const handlePageSize = (e) => {
    const newSize = Number(e.target.value);
    dispatch(setBalancePageSize(newSize));
    dispatch(loadBalanceThunk({ page: 1, page_size: newSize }));
  };
  const handleRefresh = () => {
    dispatch(loadResumenThunk());
    dispatch(loadBalanceThunk());
  };
  const handleOpenMovimientos = (row) => {
    dispatch(openMovimientosDrawer(row));
  };

  const totalPages = Math.max(1, Math.ceil((pagination.count || 0) / pagination.pageSize));

  return (
    <Box>
      {/* Page Header — mismo patron que los demas modulos */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: 'primary.main', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <AssessmentIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
              Dashboard contable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalSubCuentas} sub-cuentas activas · saldo calculado en vivo desde el libro mayor
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refrescar todo">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || loadingResumen}
          >
            Refrescar
          </Button>
        </Tooltip>
      </Box>

      {/* KPIs por tipo de cuenta */}
      <StatsCards
        resumen={resumen}
        loading={loadingResumen}
        totalSubCuentas={totalSubCuentas}
      />

      {/* Filtros */}
      <BalanceFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApply}
        onClear={handleClear}
        onClearFilter={handleClearFilter}
      />

      {/* Tabla de balance */}
      <BalanceTable
        rows={balance}
        loading={loading}
        onOpenMovimientos={handleOpenMovimientos}
      />

      {/* Paginacion */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          Mostrando {balance.length} de {pagination.count} sub-cuentas
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select size="small" label="Por pagina"
            value={pagination.pageSize}
            onChange={handlePageSize}
            sx={{ width: 110 }}
          >
            {[10, 25, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </TextField>
          <Pagination
            count={totalPages}
            page={pagination.page}
            onChange={handlePage}
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Stack>
      </Stack>

      <MovimientosDrawer />
      <AsientoDialog />
    </Box>
  );
};

export default DashboardContable;
