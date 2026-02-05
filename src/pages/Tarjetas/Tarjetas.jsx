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
  selectPaginatedTarjetas,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedTarjeta,
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
} from '../../store/tarjetasStore/tarjetasStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/tarjetasStore/tarjetasThunks';

import {
  TarjetasFilters,
  TarjetasDataTable,
  TarjetaDialog,
} from './Components';

const Tarjetas = () => {
  const dispatch = useDispatch();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedTarjetas);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedTarjeta = useSelector(selectSelectedTarjeta);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);

  /**
   * Construye los parámetros de consulta para el backend
   */
  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
    };

    // Agregar búsqueda si existe
    if (appliedFilters.search) {
      params.search = appliedFilters.search;
    }

    // Agregar filtro de cuatro_por_mil si existe
    if (appliedFilters.cuatro_por_mil) {
      params.cuatro_por_mil = appliedFilters.cuatro_por_mil;
    }

    // Agregar ordenamiento si existe
    if (sortField) {
      // El backend usa formato: 'field' para asc, '-field' para desc
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar tarjetas del backend
   */
  const fetchTarjetas = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar tarjetas al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchTarjetas();
  }, [fetchTarjetas]);

  // Handlers de paginación
  // El componente Pagination usa base 0, pero el store/backend usa base 1
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1)); // Convertir de base 0 a base 1
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  // Convertir página de base 1 (store) a base 0 (componente)
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
  const handleView = (tarjeta) => {
    dispatch(viewThunk(tarjeta));
  };

  const handleEdit = (tarjeta) => {
    dispatch(showThunk(tarjeta.id));
  };

  const handleDelete = (tarjeta) => {
    dispatch(deleteThunk(tarjeta));
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
            Tarjetas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de tarjetas de pago del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nueva tarjeta
        </Button>
      </Box>

      {/* Filters */}
      <TarjetasFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <TarjetasDataTable
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
      <TarjetaDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedTarjeta={selectedTarjeta}
        form={form}
        onFormChange={handleFormChange}
      />
    </Box>
  );
};

export default Tarjetas;
