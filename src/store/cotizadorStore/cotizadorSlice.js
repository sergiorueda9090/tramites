import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Navegación
  activeStep: 0,

  // Step 1 - Cliente
  clienteQuery: '',
  clientesEncontrados: [],
  clienteSeleccionado: null,
  nuevoCliente: { nombre: '', telefono: '', documento: '' },
  modoCliente: 'buscar', // 'buscar' | 'nuevo' | 'seleccionado'

  // Step 2 - Tipo de trámite
  tipoTramite: 'SOAT',

  // Step 3 - Tipo de vehículo (solo SOAT)
  tipoVehiculo: null, // 'USADO' | 'CERO_KM'

  // Step 3b - Titular cotización (solo vehículo usado)
  titularCotizacion: null, // 'PROPIETARIO' | 'TERCERO'
  terceroTipoDocumento: 'C',
  terceroDocumento: '',

  // Step 4 - Método de consulta
  metodoConsulta: null, // 'PLACA_RUNT' | 'IA_FOTO_TARJETA' | 'IA_VIN_RUNT' | 'PLACA_FALABELLA' | 'MANUAL'
  consultaPlaca: '',
  consultaDocumento: '',
  tipoDocumento: 'C',
  consultaTelefono: '',
  imagenLista: false,

  // Step 4 - Datos manuales (solo método MANUAL)
  datosManual: {
    placa: '',
    clase: '',
    tipoServicio: '',
    cilindraje: '',
    modelo: '',
    marca: '',
    linea: '',
  },

  // Step 5 - Datos del vehículo
  datosVehiculo: {
    placa: '',
    vin: '',
    documento: '',
    claseRunt: '',
    servicio: '',
    marca: '',
    modelo: '',
    cilindraje: '',
    peso: '',
  },
  vehiculoValidado: false,

  // Step 6 - Cotización
  cotizacion: {
    tarifa: 0,
    comision: 0,
    total: 0,
  },

  // Step 7 - Grupo SOAT (selección manual)
  grupoClaseRunt: null,      // Clase RUNT seleccionada manualmente
  grupoSubcriterio: null,    // Subcriterio seleccionado (tipo servicio o clasificación)
  grupoSoat: null,           // 'MOTOS' | 'CARGA' | 'CAMPEROS' | 'FAMILIAR_5P' | 'INTERMUNICIPAL' | 'TAXI' | 'BUS_URBANO'
  grupoRequiereRevision: false,
  grupoMotivo: null,

  // Step 7 - Módulo tarifa (segunda parte del árbol)
  moduloPregunta1: null,     // Respuesta a la primera pregunta del módulo (cilindraje, modelo, toneladas, pasajeros)
  moduloPregunta2: null,     // Respuesta a la segunda pregunta del módulo (cilindraje después de modelo)
  tarifaCodigo: null,        // Código de tarifa resultante (100, 110, 211, 810, etc.)

  // UI States
  loading: false,
  error: null,
  cotizacionGuardada: false,
};

export const cotizadorStore = createSlice({
  name: 'cotizadorStore',
  initialState,
  reducers: {
    // Navegación
    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
    },

    // Step 1 - Cliente
    setClienteQuery: (state, action) => {
      state.clienteQuery = action.payload;
    },
    setClientesEncontrados: (state, action) => {
      state.clientesEncontrados = action.payload;
    },
    setClienteSeleccionado: (state, action) => {
      state.clienteSeleccionado = action.payload;
      if (action.payload) {
        state.modoCliente = 'seleccionado';
      }
    },
    setNuevoCliente: (state, action) => {
      state.nuevoCliente = { ...state.nuevoCliente, ...action.payload };
    },
    setModoCliente: (state, action) => {
      state.modoCliente = action.payload;
      if (action.payload === 'buscar') {
        state.clienteSeleccionado = null;
      }
      if (action.payload === 'nuevo') {
        state.clienteSeleccionado = null;
        state.nuevoCliente = { nombre: '', telefono: '', documento: '' };
      }
    },

    // Step 2 - Tipo de trámite
    setTipoTramite: (state, action) => {
      state.tipoTramite = action.payload;
      // Resetear steps dependientes
      state.tipoVehiculo   = null;
      state.titularCotizacion = null;
      state.terceroTipoDocumento = 'C';
      state.terceroDocumento = '';
      state.metodoConsulta = null;
      state.datosVehiculo  = initialState.datosVehiculo;
      state.vehiculoValidado = false;
      state.grupoClaseRunt = null;
      state.grupoSubcriterio = null;
      state.grupoSoat = null;
      state.grupoRequiereRevision = false;
      state.grupoMotivo = null;
      state.moduloPregunta1 = null;
      state.moduloPregunta2 = null;
      state.tarifaCodigo = null;
    },

    // Step 3 - Tipo de vehículo
    setTipoVehiculo: (state, action) => {
      state.tipoVehiculo = action.payload;
      // Resetear titular y método de consulta al cambiar tipo
      state.titularCotizacion = null;
      state.terceroTipoDocumento = 'C';
      state.terceroDocumento = '';
      state.metodoConsulta = null;
    },

    // Step 3b - Titular cotización
    setTitularCotizacion: (state, action) => {
      state.titularCotizacion = action.payload;
      state.terceroTipoDocumento = 'C';
      state.terceroDocumento = '';
    },
    setTerceroTipoDocumento: (state, action) => {
      state.terceroTipoDocumento = action.payload;
    },
    setTerceroDocumento: (state, action) => {
      state.terceroDocumento = action.payload;
    },

    // Step 4 - Método de consulta
    setMetodoConsulta: (state, action) => {
      state.metodoConsulta = action.payload;
      // Resetear datos de consulta al cambiar método
      state.consultaPlaca = '';
      state.consultaDocumento = '';
      state.tipoDocumento = 'C';
      state.consultaTelefono = '';
      state.imagenLista = false;
      state.datosManual = initialState.datosManual;
    },
    setImagenLista: (state, action) => {
      state.imagenLista = action.payload;
    },
    setConsultaPlaca: (state, action) => {
      state.consultaPlaca = action.payload;
    },
    setConsultaDocumento: (state, action) => {
      state.consultaDocumento = action.payload;
    },
    setTipoDocumento: (state, action) => {
      state.tipoDocumento = action.payload;
    },
    setConsultaTelefono: (state, action) => {
      state.consultaTelefono = action.payload;
    },
    setDatosManual: (state, action) => {
      state.datosManual = { ...state.datosManual, ...action.payload };
    },


    // Step 5 - Datos del vehículo
    setDatosVehiculo: (state, action) => {
      state.datosVehiculo = { ...state.datosVehiculo, ...action.payload };
    },
    setVehiculoValidado: (state, action) => {
      state.vehiculoValidado = action.payload;
    },

    // Step 6 - Cotización
    setCotizacion: (state, action) => {
      state.cotizacion = { ...state.cotizacion, ...action.payload };
    },
    setCotizacionGuardada: (state, action) => {
      state.cotizacionGuardada = action.payload;
    },

    // Step 7 - Grupo SOAT (selección manual)
    setGrupoClaseRunt: (state, action) => {
      state.grupoClaseRunt = action.payload;
      // Resetear subcriterio, grupo y módulo al cambiar clase
      state.grupoSubcriterio = null;
      state.grupoSoat = null;
      state.grupoRequiereRevision = false;
      state.grupoMotivo = null;
      state.moduloPregunta1 = null;
      state.moduloPregunta2 = null;
      state.tarifaCodigo = null;
    },
    setGrupoSubcriterio: (state, action) => {
      state.grupoSubcriterio = action.payload;
      // Resetear módulo al cambiar subcriterio (el grupo cambia)
      state.moduloPregunta1 = null;
      state.moduloPregunta2 = null;
      state.tarifaCodigo = null;
    },
    setGrupoSoat: (state, action) => {
      const { grupo, requiereRevision, motivo } = action.payload;
      state.grupoSoat = grupo;
      state.grupoRequiereRevision = requiereRevision;
      state.grupoMotivo = motivo || null;
    },

    // Módulo tarifa
    setModuloPregunta1: (state, action) => {
      state.moduloPregunta1 = action.payload;
      // Resetear pregunta 2 y tarifa al cambiar pregunta 1
      state.moduloPregunta2 = null;
      state.tarifaCodigo = null;
    },
    setModuloPregunta2: (state, action) => {
      state.moduloPregunta2 = action.payload;
      state.tarifaCodigo = null;
    },
    setTarifaCodigo: (state, action) => {
      state.tarifaCodigo = action.payload;
    },

    // UI
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Reset completo
    resetCotizador: () => initialState,
  },
});

export const {
  setActiveStep,
  setClienteQuery,
  setClientesEncontrados,
  setClienteSeleccionado,
  setNuevoCliente,
  setModoCliente,
  setTipoTramite,
  setTipoVehiculo,
  setTitularCotizacion,
  setTerceroTipoDocumento,
  setTerceroDocumento,
  setMetodoConsulta,
  setConsultaPlaca,
  setConsultaDocumento,
  setTipoDocumento,
  setConsultaTelefono,
  setImagenLista,
  setDatosManual,
  setDatosVehiculo,
  setVehiculoValidado,
  setCotizacion,
  setCotizacionGuardada,
  setGrupoClaseRunt,
  setGrupoSubcriterio,
  setGrupoSoat,
  setModuloPregunta1,
  setModuloPregunta2,
  setTarifaCodigo,
  setLoading,
  setError,
  resetCotizador,
} = cotizadorStore.actions;

// Selectores
export const selectActiveStep = (state) => state.cotizadorStore.activeStep;
export const selectClienteQuery = (state) => state.cotizadorStore.clienteQuery;
export const selectClientesEncontrados = (state) => state.cotizadorStore.clientesEncontrados;
export const selectClienteSeleccionado = (state) => state.cotizadorStore.clienteSeleccionado;
export const selectNuevoCliente = (state) => state.cotizadorStore.nuevoCliente;
export const selectModoCliente = (state) => state.cotizadorStore.modoCliente;
export const selectTipoTramite = (state) => state.cotizadorStore.tipoTramite;
export const selectTipoVehiculo = (state) => state.cotizadorStore.tipoVehiculo;
export const selectTitularCotizacion = (state) => state.cotizadorStore.titularCotizacion;
export const selectTerceroTipoDocumento = (state) => state.cotizadorStore.terceroTipoDocumento;
export const selectTerceroDocumento = (state) => state.cotizadorStore.terceroDocumento;
export const selectMetodoConsulta = (state) => state.cotizadorStore.metodoConsulta;
export const selectConsultaPlaca = (state) => state.cotizadorStore.consultaPlaca;
export const selectConsultaDocumento = (state) => state.cotizadorStore.consultaDocumento;
export const selectTipoDocumento = (state) => state.cotizadorStore.tipoDocumento;
export const selectConsultaTelefono = (state) => state.cotizadorStore.consultaTelefono;
export const selectImagenLista = (state) => state.cotizadorStore.imagenLista;
export const selectDatosManual = (state) => state.cotizadorStore.datosManual;
export const selectDatosVehiculo = (state) => state.cotizadorStore.datosVehiculo;
export const selectVehiculoValidado = (state) => state.cotizadorStore.vehiculoValidado;
export const selectCotizacion = (state) => state.cotizadorStore.cotizacion;
export const selectCotizacionGuardada = (state) => state.cotizadorStore.cotizacionGuardada;
export const selectGrupoClaseRunt = (state) => state.cotizadorStore.grupoClaseRunt;
export const selectGrupoSubcriterio = (state) => state.cotizadorStore.grupoSubcriterio;
export const selectGrupoSoat = (state) => state.cotizadorStore.grupoSoat;
export const selectGrupoRequiereRevision = (state) => state.cotizadorStore.grupoRequiereRevision;
export const selectGrupoMotivo = (state) => state.cotizadorStore.grupoMotivo;
export const selectModuloPregunta1 = (state) => state.cotizadorStore.moduloPregunta1;
export const selectModuloPregunta2 = (state) => state.cotizadorStore.moduloPregunta2;
export const selectTarifaCodigo = (state) => state.cotizadorStore.tarifaCodigo;
export const selectLoading = (state) => state.cotizadorStore.loading;
export const selectError = (state) => state.cotizadorStore.error;

// Selector: ¿Es flujo SOAT? (requiere steps 3, 4, 5)
export const selectEsFlujoSoat = (state) => {
  const tipo = state.cotizadorStore.tipoTramite;
  return tipo === 'SOAT' || tipo === 'SOAT_ESPECIAL';
};

// Selector: steps dinámicos según tipo de trámite
export const selectSteps = (state) => {
  const esSoat = selectEsFlujoSoat(state);
  if (esSoat) {
    return [
      'Cliente',
      'Tipo de Trámite',
      'Tipo de Vehículo',
      'Método de Consulta',
      'Datos del Vehículo',
      'Cotización',
      'Grupo SOAT',
    ];
  }
  return ['Cliente', 'Tipo de Trámite', 'Cotización'];
};

// Selector: step real (mapeado al índice lógico)
export const selectStepCount = (state) => {
  return selectSteps(state).length;
};

export default cotizadorStore.reducer;
