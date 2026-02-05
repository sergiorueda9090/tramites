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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
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

// ============================================
// RecepcionPagosFilters Component
// ============================================
const RecepcionPagosFilters = ({
  filters,
  activeFilters = [],
  clientes = [],
  tarjetas = [],
  onFilterChange,
  onApply,
  onClear,
  onClearFilter,
  expanded = false,
  showActiveFilters = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  // Build filter config dynamically based on clientes/tarjetas data
  const filterConfig = useMemo(() => [
    {
      field: 'search',
      type: 'text',
      label: 'Buscar',
      placeholder: 'Cliente, tarjeta u observación...',
      showSearchIcon: true,
      width: 4,
    },
    {
      field: 'cliente',
      type: 'select',
      label: 'Cliente',
      options: clientes.map((c) => ({
        value: String(c.id),
        label: c.nombre,
      })),
      width: 4,
    },
    {
      field: 'tarjeta',
      type: 'select',
      label: 'Tarjeta',
      options: tarjetas.map((t) => ({
        value: String(t.id),
        label: `**** ${(t.numero || '').slice(-4)} - ${t.titular || ''}`,
      })),
      width: 4,
    },
    {
      field: 'fecha_range',
      type: 'dateRange',
      label: 'Fecha de recepción',
      startField: 'fecha_desde',
      endField: 'fecha_hasta',
      startLabel: 'Fecha desde',
      endLabel: 'Fecha hasta',
      width: 6,
    },
  ], [clientes, tarjetas]);

  const handleFilterChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
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
          <FormControl fullWidth size="small">
            <InputLabel>{config.label}</InputLabel>
            <Select
              value={value}
              label={config.label}
              onChange={(e) => handleFilterChange(config.field, e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {config.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label={config.endLabel || 'Hasta'}
                  value={filters[config.endField] ? dayjs(filters[config.endField]) : null}
                  onChange={(newValue) =>
                    handleFilterChange(config.endField, newValue?.format('YYYY-MM-DD') || '')
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
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

    if (config.type === 'select' && config.options) {
      const option = config.options.find((o) => o.value === value);
      if (option) {
        return `${config.label}: ${option.label}`;
      }
    }

    if (key === 'fecha_desde') return `Desde: ${value}`;
    if (key === 'fecha_hasta') return `Hasta: ${value}`;

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

export default RecepcionPagosFilters;
