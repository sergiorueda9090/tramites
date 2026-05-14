import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import usePermissions from '../../hooks/usePermissions';
import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedFinalizados,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedFinalizado,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectClientes,
  selectEtiquetas,
  selectTarjetas,
  selectHistoryData,
  selectHistoryPagination,
  selectOpenHistoryModal,
  selectSelectedHistoryFinalizado,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  closeModal,
  updateForm,
  openHistoryDialog,
  closeHistoryDialog,
  setHistoryPage,
  setHistoryPageSize,
  openPdfsManager,
} from '../../store/finalizadosTamitesStore/finalizadosTamitesStore';
import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  getHistoryThunk,
  loadAuxDataThunk,
} from '../../store/finalizadosTamitesStore/finalizadosTamitesThunks';
import {
  TramitesFilters,
  TramitesDataTable,
  TramiteDialog,
  HistoryDialog,
  PdfsManagerDialog,
} from './Components';
import useFinalizadosRealtime from '../../hooks/useFinalizadosRealtime';

const TramitesFinalizados = () => {
  const dispatch = useDispatch();
  const { canEdit, canDelete } = usePermissions();

  // Eventos de tiempo real (entradas nuevas desde Pasarela)
  useFinalizadosRealtime();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedFinalizados);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedFinalizado = useSelector(selectSelectedFinalizado);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const clientes = useSelector(selectClientes);
  const etiquetas = useSelector(selectEtiquetas);
  const tarjetas = useSelector(selectTarjetas);

  // History
  const historyData = useSelector(selectHistoryData);
  const historyPagination = useSelector(selectHistoryPagination);
  const openHistory = useSelector(selectOpenHistoryModal);
  const selectedHistory = useSelector(selectSelectedHistoryFinalizado);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };
    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.cliente) params.cliente = appliedFilters.cliente;
    if (appliedFilters.etiqueta) params.etiqueta = appliedFilters.etiqueta;
    if (appliedFilters.pasarela) params.pasarela = appliedFilters.pasarela;
    if (appliedFilters.tarjeta) params.tarjeta = appliedFilters.tarjeta;
    if (appliedFilters.tipo_tramite) params.tipo_tramite = appliedFilters.tipo_tramite;
    if (appliedFilters.grupo_soat) params.grupo_soat = appliedFilters.grupo_soat;
    if (appliedFilters.tarifa_codigo) params.tarifa_codigo = appliedFilters.tarifa_codigo;
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date = appliedFilters.fecha_hasta;
    if (appliedFilters.pago_confirmado_desde) params.pago_confirmado_desde = appliedFilters.pago_confirmado_desde;
    if (appliedFilters.pago_confirmado_hasta) params.pago_confirmado_hasta = appliedFilters.pago_confirmado_hasta;
    if (sortField) params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchFinalizados = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchFinalizados();
  }, [fetchFinalizados]);

  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

  // Paginación
  const handlePageChange = (newPage) => dispatch(setPage(newPage + 1));
  const handlePageSizeChange = (newPageSize) => dispatch(setPageSize(newPageSize));
  const pageForComponent = page - 1;

  // Sort
  const handleSort = (field) => dispatch(setSort({ field }));

  // Filtros
  const handleFilterChange = (field, value) => dispatch(updateFilter({ field, value }));
  const handleApplyFilters = () => dispatch(applyFilters());
  const handleClearFilters = () => dispatch(clearFilters());
  const handleClearFilter = (field) => dispatch(clearFilter(field));

  // CRUD
  const handleView = (finalizado) => dispatch(viewThunk(finalizado));
  const handleEdit = (finalizado) => dispatch(showThunk(finalizado.id));
  const handleDelete = (finalizado) => dispatch(deleteThunk(finalizado));

  // History
  const handleHistory = (finalizado) => {
    dispatch(openHistoryDialog(finalizado));
    dispatch(getHistoryThunk(finalizado.id, { page: 1 }));
  };
  const handleCloseHistory = () => dispatch(closeHistoryDialog());
  const handleHistoryPageChange = (newPage) => {
    dispatch(setHistoryPage(newPage + 1));
    dispatch(getHistoryThunk(selectedHistory.id, { page: newPage + 1 }));
  };
  const handleHistoryPageSizeChange = (newPageSize) => {
    dispatch(setHistoryPageSize(newPageSize));
    dispatch(getHistoryThunk(selectedHistory.id, { page: 1, page_size: newPageSize }));
  };

  // Modal de edición
  const handleCloseModal = () => dispatch(closeModal());
  const handleFormChange = (field, value) => dispatch(updateForm({ field, value }));
  const handleSave = () => dispatch(saveThunk(form));

  // PDFs manager
  const handleOpenPdfs = (finalizado) => dispatch(openPdfsManager(finalizado));

  return (
    <Box>
      {/* Header */}
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
            Trámites finalizados
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Trámites con pago confirmado en pasarela. Snapshot histórico de cierres.
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <TramitesFilters
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
      <TramitesDataTable
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
        onEdit={canEdit('finalizados_tramites') ? handleEdit : undefined}
        onOpenPdfs={handleOpenPdfs}
        onHistory={handleHistory}
        onDelete={canDelete('finalizados_tramites') ? handleDelete : undefined}
      />

      {/* Edit Dialog (sólo edición de campos permitidos) */}
      <TramiteDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedTramite={selectedFinalizado}
        form={form}
        clientes={clientes}
        etiquetas={etiquetas}
        tarjetas={tarjetas}
        onFormChange={handleFormChange}
      />

      {/* PDFs Manager */}
      <PdfsManagerDialog />

      {/* History */}
      <HistoryDialog
        open={openHistory}
        onClose={handleCloseHistory}
        tramite={selectedHistory}
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

export default TramitesFinalizados;
