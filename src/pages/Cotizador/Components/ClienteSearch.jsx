import React from 'react';
import {
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ClienteSearch = ({ value, onChange, loading, placeholder }) => {
  return (
    <TextField
      fullWidth
      label="Buscar por nombre, teléfono o documento"
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Ej: Carlos López o 3101234567'}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: loading ? (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        ) : null,
      }}
    />
  );
};

export default ClienteSearch;
