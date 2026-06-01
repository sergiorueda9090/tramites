import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Accordion, AccordionSummary, AccordionDetails,
  Typography, TextField, Button, Chip, Grid, FormControl,
  InputLabel, Select, MenuItem, IconButton, Tooltip, Divider, InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const TIPO_OPTIONS = [
  { value: 'activo',     label: 'Activo' },
  { value: 'pasivo',     label: 'Pasivo' },
  { value: 'patrimonio', label: 'Patrimonio' },
  { value: 'ingreso',    label: 'Ingreso' },
  { value: 'gasto',      label: 'Gasto' },
];

const BalanceFilters = ({
  filters,
  activeFilters = [],
  onFilterChange,
  onApply,
  onClear,
  onClearFilter,
  expanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const filterConfig = useMemo(() => [
    {
      field: 'search',
      type: 'text',
      label: 'Buscar',
      placeholder: 'Codigo, nombre, cuenta PUC...',
      showSearchIcon: true,
      width: 6,
    },
    {
      field: 'tipo',
      type: 'select',
      label: 'Tipo de cuenta',
      options: TIPO_OPTIONS,
      width: 6,
    },
  ], []);

  const renderFilterField = (config) => {
    const value = filters[config.field] ?? '';
    if (config.type === 'text') {
      return (
        <TextField
          fullWidth size="small" label={config.label} value={value}
          placeholder={config.placeholder}
          onChange={(e) => onFilterChange(config.field, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onApply(); }}
          InputProps={{
            startAdornment: config.showSearchIcon ? (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ) : null,
          }}
        />
      );
    }
    if (config.type === 'select') {
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{config.label}</InputLabel>
          <Select
            value={value} label={config.label}
            onChange={(e) => onFilterChange(config.field, e.target.value)}
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {config.options.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null;
  };

  const getFilterLabel = (key, value) => {
    if (key === 'tipo') {
      const opt = TIPO_OPTIONS.find((o) => o.value === value);
      return `Tipo: ${opt?.label || value}`;
    }
    if (key === 'search') return `Buscar: ${value}`;
    return `${key}: ${value}`;
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={500}>Filtros</Typography>
            {activeFilters.length > 0 && (
              <Chip size="small" label={activeFilters.length} color="primary" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {filterConfig.map((cfg) => (
              <Grid item xs={12} sm={6} md={cfg.width} key={cfg.field}>
                {renderFilterField(cfg)}
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={onClear} startIcon={<ClearIcon />}>Limpiar</Button>
            <Button variant="contained" onClick={onApply} startIcon={<SearchIcon />}>Aplicar filtros</Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {activeFilters.length > 0 && (
        <Box sx={{ p: 2, pt: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Filtros activos:
          </Typography>
          {activeFilters.map(({ key, value }) => (
            <Chip
              key={key} label={getFilterLabel(key, value)} size="small"
              onDelete={() => onClearFilter && onClearFilter(key)}
              color="primary" variant="outlined"
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

export default BalanceFilters;
