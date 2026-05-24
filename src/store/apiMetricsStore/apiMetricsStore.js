import { createSlice } from '@reduxjs/toolkit';

// Capacidad maxima del array de metricas para evitar consumo excesivo de memoria.
// Las metricas mas viejas se descartan cuando se supera este limite.
const MAX_METRICS = 100;

const initialState = {
  metrics: [], // [{id, url, baseURL, method, status, duration_ms, timestamp, error}]
};

export const apiMetricsStore = createSlice({
  name: 'apiMetricsStore',
  initialState,
  reducers: {
    addMetric: (state, action) => {
      state.metrics.unshift(action.payload); // mas reciente al inicio
      if (state.metrics.length > MAX_METRICS) {
        state.metrics.length = MAX_METRICS;
      }
    },
    clearMetrics: (state) => {
      state.metrics = [];
    },
  },
});

export const { addMetric, clearMetrics } = apiMetricsStore.actions;

// Selectores
export const selectApiMetrics = (state) => state.apiMetricsStore.metrics;

export const selectApiMetricsResumen = (state) => {
  const arr = state.apiMetricsStore.metrics;
  if (arr.length === 0) {
    return { count: 0, avg: 0, min: 0, max: 0, errores: 0 };
  }
  const durations = arr.map((m) => m.duration_ms);
  const sum = durations.reduce((a, b) => a + b, 0);
  return {
    count: arr.length,
    avg: Math.round(sum / arr.length),
    min: Math.min(...durations),
    max: Math.max(...durations),
    errores: arr.filter((m) => m.error || (m.status >= 400 || m.status === 0)).length,
  };
};

export default apiMetricsStore.reducer;
