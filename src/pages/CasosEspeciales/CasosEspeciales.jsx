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
  selectPaginatedCasosEspeciales,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedCaso,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectClientes,
  selectEtiquetas,
  selectHistoryData,
  selectHistoryPagination,
  selectOpenHistoryModal,
  selectSelectedHistoryCaso,
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
  openHistoryDialog,
  closeHistoryDialog,
  setHistoryPage,
  setHistoryPageSize,
} from '../../store/casosEspecialesStore/casosEspecialesStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  getHistoryThunk,
  loadAuxDataThunk,
} from '../../store/casosEspecialesStore/casosEspecialesThunks';

import {
  CasosEspecialesFilters,
  CasosEspecialesDataTable,
  CasoEspecialDialog,
  HistoryDialog,
} from './Components';

const CasosEspeciales = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedCasosEspeciales);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedCaso = useSelector(selectSelectedCaso);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const clientes = useSelector(selectClientes);
  const etiquetas = useSelector(selectEtiquetas);

  // History selectors
  const historyData = useSelector(selectHistoryData);
  const historyPagination = useSelector(selectHistoryPagination);
  const openHistory = useSelector(selectOpenHistoryModal);
  const selectedHistoryCaso = useSelector(selectSelectedHistoryCaso);

  /**
   * Construye los parámetros de consulta para el backend
   */
  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
    };

    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.cliente) params.cliente = appliedFilters.cliente;
    if (appliedFilters.etiqueta) params.etiqueta = appliedFilters.etiqueta;
    if (appliedFilters.caso_especial_estado) params.caso_especial_estado = appliedFilters.caso_especial_estado;
    if (appliedFilters.tramite_estado) params.tramite_estado = appliedFilters.tramite_estado;
    if (appliedFilters.confirmacion_estado) params.confirmacion_estado = appliedFilters.confirmacion_estado;
    if (appliedFilters.cargar_pdf_estado) params.cargar_pdf_estado = appliedFilters.cargar_pdf_estado;
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date = appliedFilters.fecha_hasta;

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar casos especiales del backend
   */
  const fetchCasos = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar casos y datos auxiliares al montar
  useEffect(() => {
    fetchCasos();
  }, [fetchCasos]);

  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

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
  const handleView = (caso) => {
    dispatch(viewThunk(caso));
  };

  const handleEdit = (caso) => {
    dispatch(showThunk(caso.id));
  };

  const handleDelete = (caso) => {
    dispatch(deleteThunk(caso));
  };

  const handleHistory = (caso) => {
    dispatch(openHistoryDialog(caso));
    dispatch(getHistoryThunk(caso.id, { page: 1 }));
  };

  const handleCloseHistory = () => {
    dispatch(closeHistoryDialog());
  };

  const handleHistoryPageChange = (newPage) => {
    dispatch(setHistoryPage(newPage + 1));
    dispatch(getHistoryThunk(selectedHistoryCaso.id, { page: newPage + 1 }));
  };

  const handleHistoryPageSizeChange = (newPageSize) => {
    dispatch(setHistoryPageSize(newPageSize));
    dispatch(getHistoryThunk(selectedHistoryCaso.id, { page: 1, page_size: newPageSize }));
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
            Casos Especiales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de casos especiales del sistema
          </Typography>
        </Box>
        {canCreate('casos_especiales') && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Nuevo caso especial
            </Button>
          </Box>
        )}
      </Box>

      {/* Filters */}
      <CasosEspecialesFilters
        filters={filters}
        activeFilters={activeFilters}
        clientes={clientes}
        etiquetas={etiquetas}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <CasosEspecialesDataTable
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
        onEdit={canEdit('casos_especiales') ? handleEdit : undefined}
        onHistory={handleHistory}
        onDelete={canDelete('casos_especiales') ? handleDelete : undefined}
      />

      {/* Create/Edit Dialog */}
      <CasoEspecialDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedCaso={selectedCaso}
        form={form}
        clientes={clientes}
        etiquetas={etiquetas}
        onFormChange={handleFormChange}
      />

      {/* History Dialog */}
      <HistoryDialog
        open={openHistory}
        onClose={handleCloseHistory}
        caso={selectedHistoryCaso}
        historyData={historyData}
        page={historyPagination.page - 1}
        pageSize={historyPagination.pageSize}
        totalRows={historyPagination.count}
        onPageChange={handleHistoryPageChange}
        onPageSizeChange={handleHistoryPageSizeChange}
      />
    </Box>
  );
};

export default CasosEspeciales;
