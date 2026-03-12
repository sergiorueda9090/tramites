import {
  setLoading,
  setClientesEncontrados,
  setClienteSeleccionado,
  setVehiculoValidado,
  setCotizacionGuardada,
  setError,
  setModoCliente,
} from './cotizadorSlice';
import AlertService from '../../services/alertService';

// Mock data de clientes
const MOCK_CLIENTES = [
  { id: 1, nombre: 'Carlos Andrés López', telefono: '3101234567', documento: '1098765432' },
  { id: 2, nombre: 'María Fernanda Gómez', telefono: '3209876543', documento: '1045678901' },
  { id: 3, nombre: 'Juan David Martínez', telefono: '3156789012', documento: '1023456789' },
  { id: 4, nombre: 'Ana María Rodríguez', telefono: '3187654321', documento: '1067890123' },
  { id: 5, nombre: 'Pedro Pablo Sánchez', telefono: '3142345678', documento: '1034567890' },
];

/**
 * Buscar clientes por nombre o teléfono (mock)
 */
export const buscarClientesThunk = (query) => {
  return async (dispatch) => {
    if (!query || query.trim().length < 2) {
      dispatch(setClientesEncontrados([]));
      return;
    }

    try {
      dispatch(setLoading(true));

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const queryLower = query.toLowerCase();
      const resultados = MOCK_CLIENTES.filter(
        (c) =>
          c.nombre.toLowerCase().includes(queryLower) ||
          c.telefono.includes(query) ||
          c.documento.includes(query)
      );

      dispatch(setClientesEncontrados(resultados));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      AlertService.error('Error', 'No se pudo buscar clientes');
    }
  };
};

/**
 * Crear un nuevo cliente (mock)
 */
export const crearClienteThunk = (datosCliente) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const nuevoCliente = {
        id: Date.now(),
        ...datosCliente,
      };

      dispatch(setClienteSeleccionado(nuevoCliente));
      dispatch(setModoCliente('seleccionado'));
      dispatch(setLoading(false));

      AlertService.success('Cliente creado', `Se creó el cliente ${nuevoCliente.nombre}`);
    } catch (error) {
      dispatch(setError(error.message));
      AlertService.error('Error', 'No se pudo crear el cliente');
    }
  };
};

/**
 * Validar datos del vehículo (mock)
 */
export const validarVehiculoThunk = (datos) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Simular delay de validación en RUNT
      await new Promise((resolve) => setTimeout(resolve, 1200));

      dispatch(setVehiculoValidado(true));
      dispatch(setLoading(false));

      AlertService.success('Vehículo validado', 'Los datos del vehículo fueron verificados correctamente');
    } catch (error) {
      dispatch(setError(error.message));
      AlertService.error('Error', 'No se pudo validar el vehículo');
    }
  };
};

/**
 * Guardar cotización (mock)
 */
export const guardarCotizacionThunk = (data) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Cotización guardada:', data);

      dispatch(setCotizacionGuardada(true));
      dispatch(setLoading(false));

      AlertService.success('Cotización guardada', 'La cotización se guardó correctamente');
    } catch (error) {
      dispatch(setError(error.message));
      AlertService.error('Error', 'No se pudo guardar la cotización');
    }
  };
};
