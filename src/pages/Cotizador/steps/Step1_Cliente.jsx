import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import StarIcon from '@mui/icons-material/Star';

import {
  selectClienteQuery,
  selectClienteSeleccionado,
  selectModoCliente,
  selectLoading,
  setClienteQuery,
  setClienteSeleccionado,
  setModoCliente,
} from '../../../store/cotizadorStore/cotizadorSlice';

import {
  selectClientes,
  selectTopClientes,
  selectTopLoading,
  selectOpenModal,
  selectSelectedCliente,
  selectForm,
  openCreateModal,
  closeModal,
  updateForm,
  addPrecio,
  updatePrecio,
  removePrecio,
} from '../../../store/clientesStore/clientesStore';
import { listAllThunk as get_search_clients, listTopClientesThunk, saveThunk } from '../../../store/clientesStore/clientesThunks';

import { ClienteDialog } from '../../Clientes/Components';

const Step1_Cliente = ({ onAutoAdvance }) => {
  const dispatch = useDispatch();

  const clientesEncontrados = useSelector(selectClientes);
  const topClientes         = useSelector(selectTopClientes);
  const topLoading          = useSelector(selectTopLoading);

  const clienteQuery        = useSelector(selectClienteQuery);
  const clienteSeleccionado = useSelector(selectClienteSeleccionado);
  const modoCliente         = useSelector(selectModoCliente);
  const loading             = useSelector(selectLoading);

  useEffect(() => {
    dispatch(listTopClientesThunk(10));
  }, [dispatch]);

  // ClienteDialog state from clientesStore
  const openModal       = useSelector(selectOpenModal);
  const selectedCliente = useSelector(selectSelectedCliente);
  const form            = useSelector(selectForm);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    dispatch(setClienteQuery(value));
    if (value.length >= 3) {
      dispatch(get_search_clients({ 'search': value }));
    }
  }, [dispatch]);

  const handleSelectCliente = (cliente) => {
    dispatch(setClienteSeleccionado(cliente));
    dispatch(setModoCliente('seleccionado'));
    if (onAutoAdvance) setTimeout(onAutoAdvance, 300);
  };

  const handleClearCliente = () => {
    dispatch(setModoCliente('buscar'));
    dispatch(setClienteQuery(''));
    dispatch(setClienteSeleccionado(null));
  };

  // ClienteDialog handlers
  const handleOpenModal = () => {
    dispatch(openCreateModal());
    // Pre-llenar el formulario con lo que el usuario buscó
    if (clienteQuery.trim()) {
      const query = clienteQuery.trim();
      const isPhone = /^\d+$/.test(query);
      if (isPhone) {
        dispatch(updateForm({ field: 'telefono', value: query }));
      } else {
        dispatch(updateForm({ field: 'nombre', value: query }));
      }
    }
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleFormChange = (field, value) => {
    dispatch(updateForm({ field, value }));
  };

  const handleAddPrecio = (precioData) => {
    dispatch(addPrecio(precioData));
  };

  const handleUpdatePrecio = (index, data) => {
    dispatch(updatePrecio({ index, data }));
  };

  const handleRemovePrecio = (index) => {
    dispatch(removePrecio(index));
  };

  const handleSave = async () => {
    const result = await dispatch(saveThunk(form));
    if (result) {
      dispatch(setClienteSeleccionado(result));
      dispatch(setModoCliente('seleccionado'));
      if (onAutoAdvance) setTimeout(onAutoAdvance, 300);
    }
  };

  // Cliente ya seleccionado
  if (modoCliente === 'seleccionado' && clienteSeleccionado) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Cliente seleccionado
        </Typography>
        <Card variant="outlined" sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
              <CheckCircleIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{clienteSeleccionado.nombre}</Typography>
              <Typography variant="body2" color="text.secondary">
                <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                {clienteSeleccionado.telefono}
              </Typography>
              {clienteSeleccionado.documento && (
                <Typography variant="body2" color="text.secondary">
                  <BadgeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  {clienteSeleccionado.documento}
                </Typography>
              )}
            </Box>
            <IconButton onClick={handleClearCliente} color="error" size="small">
              <ClearIcon />
            </IconButton>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Buscar o crear cliente
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Busca un cliente existente por nombre, teléfono o documento, o crea uno nuevo.
      </Typography>

      {/* Barra de búsqueda + botón nuevo */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Buscar por nombre, teléfono o documento"
          value={clienteQuery}
          onChange={handleSearch}
          placeholder="Ej: Carlos López o 3101234567"
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
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenModal}
          sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
        >
          Nuevo
        </Button>
      </Box>

      {/* Clientes frecuentes (solo cuando no hay busqueda activa) */}
      {clienteQuery.length < 3 && (topClientes.length > 0 || topLoading) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Clientes frecuentes
            </Typography>
            {topLoading && <CircularProgress size={14} />}
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {topClientes.map((cliente) => (
              <Chip
                key={cliente.id}
                avatar={
                  <Avatar sx={{ bgcolor: cliente.color || 'primary.main' }}>
                    <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />
                  </Avatar>
                }
                label={`${cliente.nombre}${cliente.consultas ? ` · ${cliente.consultas}` : ''}`}
                onClick={() => handleSelectCliente(cliente)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Resultados */}
      {clientesEncontrados.length > 0 && (
        <List sx={{ mt: 2 }}>
          {clientesEncontrados.map((cliente) => (
            <React.Fragment key={cliente.id}>
              <ListItem
                button
                onClick={() => handleSelectCliente(cliente)}
                sx={{
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={cliente.nombre}
                  secondary={`Tel: ${cliente.telefono}`}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {clienteQuery.length >= 3 && !loading && clientesEncontrados.length === 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No se encontraron clientes
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenModal}
          >
            Crear nuevo cliente
          </Button>
        </Box>
      )}

      {/* Modal de crear cliente */}
      <ClienteDialog
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedCliente={selectedCliente}
        form={form}
        onFormChange={handleFormChange}
        onAddPrecio={handleAddPrecio}
        onUpdatePrecio={handleUpdatePrecio}
        onRemovePrecio={handleRemovePrecio}
      />
    </Box>
  );
};

export default Step1_Cliente;
