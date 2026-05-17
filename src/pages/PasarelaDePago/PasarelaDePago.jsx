import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import usePermissions from '../../hooks/usePermissions';
import useCellPresence from '../../hooks/useCellPresence';
import usePasarelaRealtime from '../../hooks/usePasarelaRealtime';
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
  enviarAFinalizadosDesdePasarelaThunk,
} from '../../store/pasarelaDePagoStore/pasarelaDePagoThunks';
import { listAllThunk as listAllTarjetasThunk } from '../../store/tarjetasStore/tarjetasThunks';
import { selectTarjetas } from '../../store/tarjetasStore/tarjetasStore';
import {
  TramitesFilters,
  TramitesDataTable,
  TramiteDialog,
  HistoryDialog,
  FinalizadosTimerDialog,
} from './Components';

const PASARELA_VIEW_ID = 'pasarela_de_pago_list';

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
  const tarjetas = useSelector(selectTarjetas);

  // Estado del modal de timer (3 min) previo al envío a Trámites Finalizados.
  const [finalizadosTimer, setFinalizadosTimer] = useState({ open: false, pasarela: null });
  const finalizadosTimerResolveRef = useRef(null);

  const esperarConfirmacionPagoFinalizados = useCallback((pasarela) => {
    return new Promise((resolve) => {
      finalizadosTimerResolveRef.current = resolve;
      setFinalizadosTimer({ open: true, pasarela });
    });
  }, []);

  const handleFinalizadosTimerResult = useCallback((result) => {
    setFinalizadosTimer({ open: false, pasarela: null });
    const resolver = finalizadosTimerResolveRef.current;
    finalizadosTimerResolveRef.current = null;
    resolver?.(result);
  }, []);

  const handleEnviarAFinalizados = (pasarela) => {
    dispatch(enviarAFinalizadosDesdePasarelaThunk(pasarela, {
      esperarConfirmacionPago: esperarConfirmacionPagoFinalizados,
    }));
  };

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

  // Cargar tarjetas para el select del modal de timer.
  useEffect(() => {
    if (canCreate('finalizados_tramites')) {
      dispatch(listAllTarjetasThunk());
    }
  }, [dispatch, canCreate]);

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
        onEnviarAFinalizados={canCreate('finalizados_tramites') ? handleEnviarAFinalizados : undefined}
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

      {/* Modal de timer (3 min) previo al envío a Trámites Finalizados */}
      <FinalizadosTimerDialog
        open={finalizadosTimer.open}
        pasarela={finalizadosTimer.pasarela}
        tarjetas={tarjetas}
        onResult={handleFinalizadosTimerResult}
      />
    </Box>
  );
};

export default PasarelaDePago;
