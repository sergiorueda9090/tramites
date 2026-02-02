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
  selectPaginatedEtiquetas,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedEtiqueta,
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
} from '../../store/etiquetasStore/etiquetasStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
} from '../../store/etiquetasStore/etiquetasThunks';

import {
  EtiquetasFilters,
  EtiquetasDataTable,
  EtiquetaDialog,
} from './Components';

const Etiquetas = () => {
  const dispatch = useDispatch();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedEtiquetas);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedEtiqueta = useSelector(selectSelectedEtiqueta);
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

    // Agregar ordenamiento si existe
    if (sortField) {
      // El backend usa formato: 'field' para asc, '-field' para desc
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar etiquetas del backend
   */
  const fetchEtiquetas = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar etiquetas al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchEtiquetas();
  }, [fetchEtiquetas]);

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
  const handleView = (etiqueta) => {
    dispatch(viewThunk(etiqueta));
  };

  const handleEdit = (etiqueta) => {
    dispatch(showThunk(etiqueta.id));
  };

  const handleDelete = (etiqueta) => {
    dispatch(deleteThunk(etiqueta));
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
            Etiquetas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de etiquetas del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nueva etiqueta
        </Button>
      </Box>

      {/* Filters */}
      <EtiquetasFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <EtiquetasDataTable
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
      <EtiquetaDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedEtiqueta={selectedEtiqueta}
        form={form}
        onFormChange={handleFormChange}
      />
    </Box>
  );
};

export default Etiquetas;
