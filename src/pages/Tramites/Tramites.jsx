import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import usePermissions from '../../hooks/usePermissions';
import useCellPresence from '../../hooks/useCellPresence';
import useTramitesRealtime from '../../hooks/useTramitesRealtime';
import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedTramites,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedTramite,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectClientes,
  selectEtiquetas,
  selectTarifarios,
  selectHistoryData,
  selectHistoryPagination,
  selectOpenHistoryModal,
  selectSelectedHistoryTramite,
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
} from '../../store/tamitesStore/tamitesStore';
import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  getHistoryThunk,
  loadAuxDataThunk,
  enviarAPasarelaDesdeTramiteThunk,
} from '../../store/tamitesStore/tamitesThunks';
import {
  TramitesFilters,
  TramitesDataTable,
  TramiteDialog,
  HistoryDialog,
} from './Components';

const TRAMITES_VIEW_ID = 'tramites_list';

const Tramites = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  // Presencia colaborativa por celda (estilo Google Sheets)
  const { focusCell, blurCell, getOccupant, getRowOccupants } = useCellPresence(TRAMITES_VIEW_ID);

  // Eventos de tiempo real sobre el listado (ej: trámites eliminados al enviarse a pasarela)
  useTramitesRealtime();

  // Selectores
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const paginatedData = useSelector(selectPaginatedTramites);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedTramite = useSelector(selectSelectedTramite);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const clientes = useSelector(selectClientes);
  const etiquetas = useSelector(selectEtiquetas);
  const tarifarios = useSelector(selectTarifarios);

  // History selectors
  const historyData = useSelector(selectHistoryData);
  const historyPagination = useSelector(selectHistoryPagination);
  const openHistory = useSelector(selectOpenHistoryModal);
  const selectedHistoryTramite = useSelector(selectSelectedHistoryTramite);

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

  /**
   * Cargar trámites del backend
   */
  const fetchTramites = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar trámites y datos auxiliares al montar
  useEffect(() => {
    fetchTramites();
  }, [fetchTramites]);

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
  const handleView = (tramite) => {
    dispatch(viewThunk(tramite));
  };

  const handleEdit = (tramite) => {
    dispatch(showThunk(tramite.id));
  };

  const handleDelete = (tramite) => {
    dispatch(deleteThunk(tramite));
  };

  const handleHistory = (tramite) => {
    dispatch(openHistoryDialog(tramite));
    dispatch(getHistoryThunk(tramite.id, { page: 1 }));
  };

  const handleEnviarAPasarela = (tramite) => {
    dispatch(enviarAPasarelaDesdeTramiteThunk(tramite));
  };

  const handleCloseHistory = () => {
    dispatch(closeHistoryDialog());
  };

  const handleHistoryPageChange = (newPage) => {
    dispatch(setHistoryPage(newPage + 1));
    dispatch(getHistoryThunk(selectedHistoryTramite.id, { page: newPage + 1 }));
  };

  const handleHistoryPageSizeChange = (newPageSize) => {
    dispatch(setHistoryPageSize(newPageSize));
    dispatch(getHistoryThunk(selectedHistoryTramite.id, { page: 1, page_size: newPageSize }));
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
            Trámites
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de trámites SOAT del sistema
          </Typography>
        </Box>
        {canCreate('tramites') && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Nuevo trámite
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
        onEdit={canEdit('tramites') ? handleEdit : undefined}
        onHistory={handleHistory}
        onEnviarAPasarela={canCreate('pasarela_de_pago') ? handleEnviarAPasarela : undefined}
        onDelete={canDelete('tramites') ? handleDelete : undefined}
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
        selectedTramite={selectedTramite}
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
        tramite={selectedHistoryTramite}
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

export default Tramites;
