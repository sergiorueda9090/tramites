import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import usePermissions from '../../hooks/usePermissions';

import {
  selectFilters,
  selectActiveFilters,
  selectAppliedFilters,
  selectPage,
  selectPageSize,
  selectSortField,
  selectSortOrder,
  selectPaginatedCorreos,
  selectFilteredTotalRows,
  selectOpenModal,
  selectSelectedCorreo,
  selectForm,
  selectLoading,
  setPage,
  setPageSize,
  setSort,
  updateFilter,
  applyFilters,
  clearFilters,
  clearFilter,
  openCreateModal,
  openEditModal,
  closeModal,
  updateForm,
} from '../../store/correosAleatoriosStore/correosAleatoriosStore';

import {
  listAllThunk,
  saveThunk,
  deleteThunk,
  viewThunk,
  bulkCreateThunk,
} from '../../store/correosAleatoriosStore/correosAleatoriosThunks';

import {
  CorreosFilters,
  CorreosDataTable,
  CorreoDialog,
  ExcelUploadDialog,
} from './Components';

const MODULO = 'correos_aleatorios';

const CorreosAleatorios = () => {
  const dispatch = useDispatch();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const filters        = useSelector(selectFilters);
  const activeFilters  = useSelector(selectActiveFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const page           = useSelector(selectPage);
  const pageSize       = useSelector(selectPageSize);
  const sortField      = useSelector(selectSortField);
  const sortOrder      = useSelector(selectSortOrder);
  const paginatedData  = useSelector(selectPaginatedCorreos);
  const totalRows      = useSelector(selectFilteredTotalRows);
  const openModal      = useSelector(selectOpenModal);
  const selectedCorreo = useSelector(selectSelectedCorreo);
  const form           = useSelector(selectForm);
  const loading        = useSelector(selectLoading);

  const [excelOpen, setExcelOpen] = useState(false);

  const buildQueryParams = useCallback(() => {
    const params = { page, page_size: pageSize };

    if (appliedFilters.search) params.search = appliedFilters.search;
    if (appliedFilters.activo !== '' && appliedFilters.activo !== null && appliedFilters.activo !== undefined) {
      params.activo = appliedFilters.activo;
    }
    if (appliedFilters.fecha_desde) params.start_date = appliedFilters.fecha_desde;
    if (appliedFilters.fecha_hasta) params.end_date   = appliedFilters.fecha_hasta;

    if (sortField) {
      params.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField;
    }

    return params;
  }, [page, pageSize, appliedFilters, sortField, sortOrder]);

  const fetchCorreos = useCallback(() => {
    dispatch(listAllThunk(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    fetchCorreos();
  }, [fetchCorreos]);

  // Paginación (componente base 0; store/backend base 1)
  const handlePageChange     = (newPage) => dispatch(setPage(newPage + 1));
  const handlePageSizeChange = (newSize) => dispatch(setPageSize(newSize));
  const pageForComponent     = page - 1;

  const handleSort = (field) => dispatch(setSort({ field }));

  // Filtros
  const handleFilterChange = (field, value) => dispatch(updateFilter({ field, value }));
  const handleApplyFilters = () => dispatch(applyFilters());
  const handleClearFilters = () => dispatch(clearFilters());
  const handleClearFilter  = (field) => dispatch(clearFilter(field));

  // CRUD
  const handleView   = (correo) => dispatch(viewThunk(correo));
  const handleEdit   = (correo) => dispatch(openEditModal(correo));
  const handleDelete = (correo) => dispatch(deleteThunk(correo));
  const handleCreate = () => dispatch(openCreateModal());

  const handleCloseModal = () => dispatch(closeModal());
  const handleFormChange = (field, value) => dispatch(updateForm({ field, value }));
  const handleSave       = () => dispatch(saveThunk(form));

  // Devuelve el resultado para que el diálogo Excel muestre errores por fila.
  const handleUploadExcel = (rows) => dispatch(bulkCreateThunk(rows));

  return (
    <Box>
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
            Correos Aleatorios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra el pool de correos: agrégalos manualmente o cárgalos desde un Excel.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setExcelOpen(true)}>
            Cargar Excel
          </Button>
          {canCreate(MODULO) && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Agregar correo
            </Button>
          )}
        </Stack>
      </Box>

      <CorreosFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClearFilter={handleClearFilter}
      />

      <CorreosDataTable
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
        onEdit={canEdit(MODULO) ? handleEdit : undefined}
        onDelete={canDelete(MODULO) ? handleDelete : undefined}
      />

      <CorreoDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedCorreo={selectedCorreo}
        form={form}
        onFormChange={handleFormChange}
      />

      <ExcelUploadDialog
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        onUpload={handleUploadExcel}
      />
    </Box>
  );
};

export default CorreosAleatorios;
