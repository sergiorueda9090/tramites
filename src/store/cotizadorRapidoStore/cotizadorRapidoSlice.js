import { createSlice } from '@reduxjs/toolkit';

/**
 * Store del módulo "Cotizador Rápido".
 *
 * Flujo: el usuario escribe una placa → se consulta Previsora (precio principal)
 * y, en paralelo, se valida por VIN con la consulta normal del RUNT. Ambos
 * precios deben coincidir; si no, o si es un caso especial, la UI lo notifica.
 *
 * Namespace propio (`cotizadorRapidoStore`) para no colisionar con el cotizador
 * normal (`cotizadorStore`).
 */
const initialState = {
  placa: '',

  // Resultado de la cotización rápida
  resultado: null, // { placa, vin, previsoraPrecio, previsoraPrecioFmt, runtPrecio, coinciden, esCasoEspecial, previsoraRaw, runtRaw }

  loading: false,
  error: null,
};

export const cotizadorRapidoStore = createSlice({
  name: 'cotizadorRapidoStore',
  initialState,
  reducers: {
    setPlaca: (state, action) => {
      state.placa = action.payload;
    },
    setResultado: (state, action) => {
      state.resultado = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetCotizadorRapido: () => initialState,
  },
});

export const {
  setPlaca,
  setResultado,
  setLoading,
  setError,
  resetCotizadorRapido,
} = cotizadorRapidoStore.actions;

// Selectores (namespace propio)
export const selectPlaca = (state) => state.cotizadorRapidoStore.placa;
export const selectResultado = (state) => state.cotizadorRapidoStore.resultado;
export const selectLoading = (state) => state.cotizadorRapidoStore.loading;
export const selectError = (state) => state.cotizadorRapidoStore.error;

export default cotizadorRapidoStore.reducer;
