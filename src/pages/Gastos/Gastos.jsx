import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedGastosRelaciones,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedGastoRelacion,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectGastos,
  selectTarjetas,
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
} from '../../store/gastosStore/gastosStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  loadAuxDataThunk,
} from '../../store/gastosStore/gastosThunks';

import {
  GastosFilters,
  GastosDataTable,
  GastoRelacionDialog,
} from './Components';

const Gastos = () => {
  const dispatch = useDispatch();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedGastosRelaciones);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedGastoRelacion = useSelector(selectSelectedGastoRelacion);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const gastos = useSelector(selectGastos);
  const tarjetas = useSelector(selectTarjetas);

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

    if (appliedFilters.gasto) {
      params.gasto = appliedFilters.gasto;
    }

    if (appliedFilters.tarjeta) {
      params.tarjeta = appliedFilters.tarjeta;
    }

    if (appliedFilters.fecha_desde) {
      params.fecha_start = appliedFilters.fecha_desde;
    }

    if (appliedFilters.fecha_hasta) {
      params.fecha_end = appliedFilters.fecha_hasta;
    }

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar gastos del backend
   */
  const fetchGastos = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar datos auxiliares al montar
  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

  // Cargar gastos al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  // Handlers de paginación
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  const pageForComponent = page - 1;

  // Handler de ordenamiento
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
  const handleView = (relacion) => {
    dispatch(viewThunk(relacion));
  };

  const handleEdit = (relacion) => {
    dispatch(showThunk(relacion.id));
  };

  const handleDelete = (relacion) => {
    dispatch(deleteThunk(relacion));
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
            Gastos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de gastos del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo gasto
        </Button>
      </Box>

      {/* Filters */}
      <GastosFilters
        filters={filters}
        activeFilters={activeFilters}
        gastos={gastos}
        tarjetas={tarjetas}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <GastosDataTable
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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Dialog */}
      <GastoRelacionDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedGastoRelacion={selectedGastoRelacion}
        form={form}
        onFormChange={handleFormChange}
        gastos={gastos}
        tarjetas={tarjetas}
      />
    </Box>
  );
};

export default Gastos;
