import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Divider,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

const CasosEspecialesFilters = ({
  filters,
  activeFilters = [],
  clientes = [],
  etiquetas = [],
  onFilterChange,
  onApply,
  onClear,
  onClearFilter,
  expanded = false,
  showActiveFilters = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const filterConfig = useMemo(
    () => [
      {
        field: 'search',
        type: 'text',
        label: 'Buscar',
        placeholder: 'Placa, titular, documento...',
        showSearchIcon: true,
        width: 6,
      },
      {
        field: 'cliente',
        type: 'select',
        label: 'Cliente',
        options: [{ value: '', label: 'Todos' }, ...clientes.map((c) => ({ value: c.id, label: c.nombre }))],
        width: 3,
      },
      {
        field: 'etiqueta',
        type: 'select',
        label: 'Etiqueta',
        options: [{ value: '', label: 'Todas' }, ...etiquetas.map((e) => ({ value: e.id, label: e.nombre }))],
        width: 3,
      },
      {
        field: 'caso_especial_estado',
        type: 'select',
        label: 'Estado caso',
        options: ESTADO_OPTIONS,
        width: 3,
      },
      {
        field: 'tramite_estado',
        type: 'select',
        label: 'Estado trámite',
        options: ESTADO_OPTIONS,
        width: 3,
      },
      {
        field: 'confirmacion_estado',
        type: 'select',
        label: 'Estado confirmación',
        options: ESTADO_OPTIONS,
        width: 3,
      },
      {
        field: 'cargar_pdf_estado',
        type: 'select',
        label: 'Estado PDF',
        options: ESTADO_OPTIONS,
        width: 3,
      },
      {
        field: 'fecha_range',
        type: 'dateRange',
        label: 'Fecha de creación',
        startField: 'fecha_desde',
        endField: 'fecha_hasta',
        startLabel: 'Fecha desde',
        endLabel: 'Fecha hasta',
        width: 6,
      },
    ],
    [clientes, etiquetas]
  );

  const handleFilterChange = (key, value) => {
    if (onFilterChange) onFilterChange(key, value);
  };

  const renderFilterField = (config) => {
    const value = filters[config.field] ?? '';

    switch (config.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            label={config.label}
            value={value}
            onChange={(e) => handleFilterChange(config.field, e.target.value)}
            placeholder={config.placeholder}
            InputProps={{
              startAdornment: config.showSearchIcon ? (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ) : null,
            }}
          />
        );

      case 'select':
        return (
          <TextField
            select
            fullWidth
            size="small"
            label={config.label}
            value={value}
            onChange={(e) => handleFilterChange(config.field, e.target.value)}
          >
            {config.options.map((opt) => (
              <MenuItem key={`${config.field}-${opt.value}`} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'dateRange':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <DatePicker
                  label={config.startLabel || 'Desde'}
                  value={filters[config.startField] ? dayjs(filters[config.startField]) : null}
                  onChange={(newValue) =>
                    handleFilterChange(config.startField, newValue?.format('YYYY-MM-DD') || '')
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label={config.endLabel || 'Hasta'}
                  value={filters[config.endField] ? dayjs(filters[config.endField]) : null}
                  onChange={(newValue) =>
                    handleFilterChange(config.endField, newValue?.format('YYYY-MM-DD') || '')
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

  const getFilterLabel = (key, value) => {
    const config = filterConfig.find(
      (f) => f.field === key || f.startField === key || f.endField === key
    );
    if (!config) return `${key}: ${value}`;

    if (key === 'fecha_desde') return `Desde: ${value}`;
    if (key === 'fecha_hasta') return `Hasta: ${value}`;

    if (config.type === 'select') {
      const opt = config.options.find((o) => String(o.value) === String(value));
      return `${config.label}: ${opt ? opt.label : value}`;
    }

    return `${config.label}: ${value}`;
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={500}>
              Filtros
            </Typography>
            {activeFilters.length > 0 && (
              <Chip size="small" label={activeFilters.length} color="primary" />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            {filterConfig.map((config) => (
              <Grid item xs={12} sm={6} md={config.width || 3} key={config.field || config.startField}>
                {renderFilterField(config)}
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={onClear} startIcon={<ClearIcon />}>
              Limpiar
            </Button>
            <Button variant="contained" onClick={onApply} startIcon={<SearchIcon />}>
              Aplicar filtros
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {showActiveFilters && activeFilters.length > 0 && (
        <Box sx={{ p: 2, pt: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Filtros activos:
          </Typography>
          {activeFilters.map(({ key, value }) => (
            <Chip
              key={key}
              label={getFilterLabel(key, value)}
              size="small"
              onDelete={() => onClearFilter && onClearFilter(key)}
              color="primary"
              variant="outlined"
            />
          ))}
          <Tooltip title="Limpiar todos los filtros">
            <IconButton size="small" onClick={onClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
};

export default CasosEspecialesFilters;
