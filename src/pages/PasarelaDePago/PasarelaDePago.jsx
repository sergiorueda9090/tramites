import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import usePermissions from '../../hooks/usePermissions';
import useCellPresence from '../../hooks/useCellPresence';
import usePasarelaRealtime from '../../hooks/usePasarelaRealtime';

const PASARELA_VIEW_ID = 'pasarela_de_pago_list';

import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedPasarelas,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedPasarela,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectClientes,
  selectEtiquetas,
  selectTarifarios,
  selectHistoryData,
  selectHistoryPagination,
  selectOpenHistoryModal,
  selectSelectedHistoryPasarela,
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
} from '../../store/pasarelaDePagoStore/pasarelaDePagoStore';

import {
  listAllThunk,
  saveThunk,
  viewThunk,
  showThunk,
  getHistoryThunk,
  loadAuxDataThunk,
  devolverATramitesThunk,
} from '../../store/pasarelaDePagoStore/pasarelaDePagoThunks';

import {
  TramitesFilters,
  TramitesDataTable,
  TramiteDialog,
  HistoryDialog,
} from './Components';

const PasarelaDePago = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  // Presencia colaborativa por celda (estilo Google Sheets)
  const { focusCell, blurCell, getOccupant, getRowOccupants } = useCellPresence(PASARELA_VIEW_ID);

  // Eventos de tiempo real sobre el listado (entradas/salidas de registros)
  usePasarelaRealtime();

  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedPasarelas);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedPasarela = useSelector(selectSelectedPasarela);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const clientes = useSelector(selectClientes);
  const etiquetas = useSelector(selectEtiquetas);
  const tarifarios = useSelector(selectTarifarios);

  const historyData = useSelector(selectHistoryData);
  const historyPagination = useSelector(selectHistoryPagination);
  const openHistory = useSelector(selectOpenHistoryModal);
  const selectedHistoryPasarela = useSelector(selectSelectedHistoryPasarela);

  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
    };

    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.cliente) params.cliente = appliedFilters.cliente;
    if (appliedFilters.etiqueta) params.etiqueta = appliedFilters.etiqueta;
    if (appliedFilters.tramite_origen) params.tramite_origen = appliedFilters.tramite_origen;
    if (appliedFilters.tipo_tramite) params.tipo_tramite = appliedFilters.tipo_tramite;
    if (appliedFilters.grupo_soat) params.grupo_soat = appliedFilters.grupo_soat;
    if (appliedFilters.tarifa_codigo) params.tarifa_codigo = appliedFilters.tarifa_codigo;
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

  const fetchPasarelas = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchPasarelas();
  }, [fetchPasarelas]);

  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  const pageForComponent = page - 1;

  const handleSort = (field) => {
    dispatch(setSort({ field }));
  };

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

  const handleView = (pasarela) => {
    dispatch(viewThunk(pasarela));
  };

  const handleEdit = (pasarela) => {
    dispatch(showThunk(pasarela.id));
  };

  const handleDevolverATramites = (pasarela) => {
    dispatch(devolverATramitesThunk(pasarela));
  };

  const handleHistory = (pasarela) => {
    dispatch(openHistoryDialog(pasarela));
    dispatch(getHistoryThunk(pasarela.id, { page: 1 }));
  };

  const handleCloseHistory = () => {
    dispatch(closeHistoryDialog());
  };

  const handleHistoryPageChange = (newPage) => {
    dispatch(setHistoryPage(newPage + 1));
    dispatch(getHistoryThunk(selectedHistoryPasarela.id, { page: newPage + 1 }));
  };

  const handleHistoryPageSizeChange = (newPageSize) => {
    dispatch(setHistoryPageSize(newPageSize));
    dispatch(getHistoryThunk(selectedHistoryPasarela.id, { page: 1, page_size: newPageSize }));
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
            Pasarela de Pago
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de registros enviados desde Trámites
          </Typography>
        </Box>
        {canCreate('pasarela_de_pago') && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Nuevo registro
            </Button>
          </Box>
        )}
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
        onEdit={canEdit('pasarela_de_pago') ? handleEdit : undefined}
        onHistory={handleHistory}
        onDevolverATramites={canDelete('pasarela_de_pago') ? handleDevolverATramites : undefined}
        // Presencia colaborativa por celda
        getOccupant={getOccupant}
        getRowOccupants={getRowOccupants}
        onCellFocus={focusCell}
        onCellBlur={blurCell}
      />

      {/* Create/Edit Dialog */}
      <TramiteDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedTramite={selectedPasarela}
        form={form}
        clientes={clientes}
        etiquetas={etiquetas}
        tarifarios={tarifarios}
        onFormChange={handleFormChange}
      />

      {/* History Dialog */}
      <HistoryDialog
        open={openHistory}
        onClose={handleCloseHistory}
        tramite={selectedHistoryPasarela}
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

export default PasarelaDePago;
