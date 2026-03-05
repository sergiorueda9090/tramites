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
  selectPaginatedTarifarios,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedTarifario,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectHistoryData,
  selectHistoryPagination,
  selectOpenHistoryModal,
  selectSelectedHistoryTarifario,
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
} from '../../store/tarifarioSoatStore/tarifarioSoatStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  getHistoryThunk,
} from '../../store/tarifarioSoatStore/tarifarioSoatThunks';

import {
  TarifarioSoatFilters,
  TarifarioSoatDataTable,
  TarifarioSoatDialog,
  HistoryDialog,
} from './Components';

const TarifarioSoat = () => {
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
  const paginatedData = useSelector(selectPaginatedTarifarios);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedTarifario = useSelector(selectSelectedTarifario);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);

  // History selectors
  const historyData = useSelector(selectHistoryData);
  const historyPagination = useSelector(selectHistoryPagination);
  const openHistory = useSelector(selectOpenHistoryModal);
  const selectedHistoryTarifario = useSelector(selectSelectedHistoryTarifario);

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

    if (appliedFilters.fecha_desde) {
      params.start_date = appliedFilters.fecha_desde;
    }

    if (appliedFilters.fecha_hasta) {
      params.end_date = appliedFilters.fecha_hasta;
    }

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  /**
   * Cargar tarifarios del backend
   */
  const fetchTarifarios = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar tarifarios al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchTarifarios();
  }, [fetchTarifarios]);

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
  const handleView = (tarifario) => {
    dispatch(viewThunk(tarifario));
  };

  const handleEdit = (tarifario) => {
    dispatch(showThunk(tarifario.id));
  };

  const handleDelete = (tarifario) => {
    dispatch(deleteThunk(tarifario));
  };

  const handleHistory = (tarifario) => {
    dispatch(openHistoryDialog(tarifario));
    dispatch(getHistoryThunk(tarifario.id, { page: 1 }));
  };

  const handleCloseHistory = () => {
    dispatch(closeHistoryDialog());
  };

  const handleHistoryPageChange = (newPage) => {
    dispatch(setHistoryPage(newPage + 1));
    dispatch(getHistoryThunk(selectedHistoryTarifario.id, { page: newPage + 1 }));
  };

  const handleHistoryPageSizeChange = (newPageSize) => {
    dispatch(setHistoryPageSize(newPageSize));
    dispatch(getHistoryThunk(selectedHistoryTarifario.id, { page: 1, page_size: newPageSize }));
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
            Tarifario SOAT
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de tarifarios SOAT del sistema
          </Typography>
        </Box>
        {canCreate('tarifario_soat') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nuevo tarifario
          </Button>
        )}
      </Box>

      {/* Filters */}
      <TarifarioSoatFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <TarifarioSoatDataTable
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
        onEdit={canEdit('tarifario_soat') ? handleEdit : undefined}
        onHistory={handleHistory}
        onDelete={canDelete('tarifario_soat') ? handleDelete : undefined}
      />

      {/* Create/Edit Dialog */}
      <TarifarioSoatDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedTarifario={selectedTarifario}
        form={form}
        onFormChange={handleFormChange}
      />

      {/* History Dialog */}
      <HistoryDialog
        open={openHistory}
        onClose={handleCloseHistory}
        tarifario={selectedHistoryTarifario}
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

export default TarifarioSoat;
