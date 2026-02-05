import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

// ============================================
// Filter Configuration for Tarjetas
// ============================================
const filterConfig = [
  {
    field: 'search',
    type: 'text',
    label: 'Buscar',
    placeholder: 'Número, titular o descripción...',
    showSearchIcon: true,
    width: 6,
  },
  {
    field: 'cuatro_por_mil',
    type: 'select',
    label: '4x1000',
    options: [
      { value: '', label: 'Todos' },
      { value: '1', label: 'Activo' },
      { value: '0', label: 'Exento' },
    ],
    width: 6,
  },
];

// ============================================
// TarjetasFilters Component
// ============================================
const TarjetasFilters = ({
  filters,
  activeFilters = [],
  onFilterChange,
  onApply,
  onClear,
  onClearFilter,
  expanded = false,
  showActiveFilters = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

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
              {config.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  const getFilterLabel = (key, value) => {
    const config = filterConfig.find((f) => f.field === key);
    if (!config) return `${key}: ${value}`;

    // Para selects, buscar la etiqueta de la opción
    if (config.type === 'select' && config.options) {
      const option = config.options.find((o) => o.value === value);
      if (option) {
        return `${config.label}: ${option.label}`;
      }
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
              <Grid item xs={12} sm={6} md={config.width || 3} key={config.field}>
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

export { filterConfig };
export default TarjetasFilters;
