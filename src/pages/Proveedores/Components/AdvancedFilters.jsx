import React, { useState } from 'react';
import {
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const ProveedoresFilters = ({
  filters,
  activeFilters = [],
  subCuentas = [],
  onFilterChange,
  onApply,
  onClear,
  onClearFilter,
  expanded = false,
  showActiveFilters = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleFilterChange = (key, value) => {
    if (onFilterChange) onFilterChange(key, value);
  };

  const selectedSubCuenta = subCuentas.find((s) => String(s.id) === String(filters.sub_cuenta)) || null;

  const getFilterLabel = (key, value) => {
    if (key === 'search') return `Buscar: ${value}`;
    if (key === 'sub_cuenta') {
      const s = subCuentas.find((ss) => String(ss.id) === String(value));
      return `Sub-cuenta: ${s ? `${s.codigo} — ${s.nombre_sub_cuenta}` : value}`;
    }
    return `${key}: ${value}`;
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Buscar"
                value={filters.search ?? ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nombre o sub-cuenta..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Autocomplete
                size="small"
                options={subCuentas}
                value={selectedSubCuenta}
                onChange={(_, newValue) => handleFilterChange('sub_cuenta', newValue ? newValue.id : '')}
                getOptionLabel={(option) =>
                  option ? `${option.codigo} — ${option.nombre_sub_cuenta}` : ''
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Sub-cuenta" placeholder="Filtrar por sub-cuenta..." />
                )}
              />
            </Grid>
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

export default ProveedoresFilters;
