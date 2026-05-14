import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import usePermissions from '../../hooks/usePermissions';

import {
  selectFilters,
  selectActiveFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedRegistros,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedRegistro,
  selectForm,
  selectLoading,
  selectAppliedFilters,
  selectClientes,
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
} from '../../store/baseDeDatosStore/baseDeDatosStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  showThunk,
  loadAuxDataThunk,
  exportExcelThunk,
  enviarATramitesDesdeBaseDeDatosThunk,
} from '../../store/baseDeDatosStore/baseDeDatosThunks';

import {
  BaseDeDatosFilters,
  BaseDeDatosDataTable,
  RegistroVehiculoDialog,
} from './Components';

const BaseDeDatos = () => {
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
  const paginatedData = useSelector(selectPaginatedRegistros);
  const totalRows = useSelector(selectFilteredTotalRows);
  const openModal = useSelector(selectOpenModal);
  const selectedRegistro = useSelector(selectSelectedRegistro);
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const clientes = useSelector(selectClientes);

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

    if (appliedFilters.tipo_tramite) {
      params.tipo_tramite = appliedFilters.tipo_tramite;
    }

    if (appliedFilters.tipo_vehiculo) {
      params.tipo_vehiculo = appliedFilters.tipo_vehiculo;
    }

    if (appliedFilters.tipo_documento) {
      params.tipo_documento = appliedFilters.tipo_documento;
    }

    if (appliedFilters.es_propietario) {
      params.es_propietario = appliedFilters.es_propietario;
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
   * Cargar registros del backend
   */
  const fetchRegistros = useCallback(() => {
    const params = buildQueryParams();
    dispatch(listAllThunk(params));
  }, [dispatch, buildQueryParams]);

  // Cargar datos auxiliares al montar
  useEffect(() => {
    dispatch(loadAuxDataThunk());
  }, [dispatch]);

  // Cargar registros al montar y cuando cambian los parámetros
  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

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
  const handleView = (registro) => {
    dispatch(viewThunk(registro));
  };

  const handleEdit = (registro) => {
    dispatch(showThunk(registro.id));
  };

  const handleDelete = (registro) => {
    dispatch(deleteThunk(registro));
  };

  const handleEnviarATramites = (registro) => {
    dispatch(enviarATramitesDesdeBaseDeDatosThunk(registro));
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

  const handleExportExcel = () => {
    const params = buildQueryParams();
    delete params.page;
    delete params.page_size;
    dispatch(exportExcelThunk(params));
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
            Base de Datos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registros de vehiculos cotizados y titulares
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
          >
            Exportar Excel
          </Button>
          {canCreate('base_de_datos') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Nuevo registro
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <BaseDeDatosFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      {/* Data Table */}
      <BaseDeDatosDataTable
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
        onEdit={canEdit('base_de_datos') ? handleEdit : undefined}
        onEnviarATramites={canCreate('tramites') ? handleEnviarATramites : undefined}
        onDelete={canDelete('base_de_datos') ? handleDelete : undefined}
      />

      {/* Create/Edit Dialog */}
      <RegistroVehiculoDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedRegistro={selectedRegistro}
        form={form}
        onFormChange={handleFormChange}
        clientes={clientes}
      />
    </Box>
  );
};

export default BaseDeDatos;
