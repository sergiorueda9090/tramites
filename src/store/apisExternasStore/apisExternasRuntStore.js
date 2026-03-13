import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Datos generales del vehículo
  placa: null,
  num_licencia: null,
  estado_automotor: null,
  tipo_servicio: null,
  clase: null,
  marca: null,
  linea: null,
  modelo: null,
  color: null,
  num_motor: null,
  num_chasis: null,
  vin: null,
  cilindraje: null,
  tipo_carroceria: null, 
  fecha_registro: null,
  gravamenes: null,
  organismo_transito: null,
  peso_bruto: null,
  numero_ejes: null,
  repotenciado: null,
  dias_matriculado: null,
  prendas: null,
  clasificacion: null,
  tipo_combustible: null,
  pasajeros_sentados: null,
  capacidad_carga: null,
  puertas: null,

  // SOAT
  soat: [],

  // Solicitudes
  solicitudes: [],

  // Revisión técnico mecánica
  rtms: {
    error: false,
    descripcionRespuesta: null,
    revisiones: [],
  },

  // Limitaciones de propiedad
  limitaciones_propiedad: [],

  // Garantías a favor de
  garantias_a_favor_de: [],

  // Garantías mobiliarias
  garantias_mobiliarias: [],

  // Tarjeta de operación
  tarjeta_operacion: {
    empresaAfiliadora: null,
    modalidadTransporte: null,
    modalidadServicio: null,
    radioAccion: null,
    fechaExpedicion: null,
    fechaInicio: null,
    fechaFin: null,
    estado: null,
    nroTarjetaOperacion: null,
  },

  // Datos técnicos
  datos_tecnicos: {
    capacidadCarga: null,
    pesoBrutoVehicular: null,
    noEjes: null,
    noLlantas: null,
    alto: null,
    ancho: null,
    largo: null,
    pasajerosTotal: null,
    pasajerosSentados: null,
    rodaje: null,
    peso: null,
  },

  // Responsabilidad civil
  responsabilidad_civil: [],

  // Revisión técnico ambiental
  revision_tecnico_ambiental: {
    error: false,
    descripcionRespuesta: null,
    revisiones: [],
  },

  // Datos de blindaje
  datos_blindaje: {
    blindado: null,
    nivelBlindaje: null,
    nivelBlindajeNumero: null,
    fechaBlindaje: null,
    fechaDesblindaje: null,
    numeroResolucion: null,
    tipoBlindajeNombre: null,
    fechaExpedicionCertificado: null,
    fechaExpedicionCertificadoFormatoWS: null,
    idDocumentoCertificadoBlindaje: null,
    autorizacion: null,
  },

  // Póliza caución
  poliza_caucion: {
    noPoliza: null,
    estadoPoliza: null,
    fechaExpedicion: null,
    fechaVigenciaPoliza: null,
    noCertificacion: null,
    estadoCertificado: null,
  },

  // Registro inicial
  registro_inicial: {
    noCertificado: null,
    fechaExpedicion: null,
    estadoCertificado: null,
    placaReposicion: null,
  },

  // Registro inicial INVC
  registro_inicial_invc: {
    noCertificado: null,
    fechaExpedicion: null,
    estadoCertificado: null,
    placaReposicion: null,
  },

  // Certificado DIJIN
  certificado_dijin: {
    noCertificado: null,
    fechaExpedicion: null,
    entidadCertificado: null,
    estadoCertificado: null,
  },

  // Certificado desintegración
  certificado_desintegracion: {
    noCertificado: null,
    estadoCertificado: null,
    fechaExpedicion: null,
    entidadDesintegradora: null,
  },

  // Normalización
  normalizacion: [],

  // Desintegración
  desintegracion: {
    placa: null,
    desintegrar: null,
  },

  // Permisos PCR
  permisos_pcr: [],

  // Datos de persona/conductor (del endpoint runt_vin)
  id_persona: null,
  tipo_documento_persona: null,
  numero_documento_persona: null,
  nombres: null,
  apellidos: null,
  fecha_inscripcion: null,
  estado_conductor: null,
  estado_persona: null,
  mostrar_solicitudes: null,
  no_inscrito: null,
  tiene_licencias: null,
  tiene_multas: null,
  nro_paz_y_salvo: null,

  // Estado de la consulta
  loading: false,
  error: null,
};

export const apisExternasRuntStore = createSlice({
  name: 'apisExternasRuntStore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setVehiculo: (state, action) => {
      const data = action.payload;
      // Datos generales
      state.placa = data.placa;
      state.num_licencia = data.num_licencia;
      state.estado_automotor = data.estado_automotor;
      state.tipo_servicio = data.tipo_servicio;
      state.clase = data.clase;
      state.marca = data.marca;
      state.linea = data.linea;
      state.modelo = data.modelo;
      state.color = data.color;
      state.num_motor = data.num_motor;
      state.num_chasis = data.num_chasis;
      state.vin = data.vin;
      state.cilindraje = data.cilindraje;
      state.tipo_carroceria = data.tipo_carroceria;
      state.fecha_registro = data.fecha_registro;
      state.gravamenes = data.gravamenes;
      state.organismo_transito = data.organismo_transito;
      state.peso_bruto = data.peso_bruto;
      state.numero_ejes = data.numero_ejes;
      state.repotenciado = data.repotenciado;
      state.dias_matriculado = data.dias_matriculado;
      state.prendas = data.prendas;
      state.clasificacion = data.clasificacion;
      state.tipo_combustible = data.tipo_combustible;
      state.pasajeros_sentados = data.pasajeros_sentados;
      state.capacidad_carga = data.capacidad_carga;
      state.puertas = data.puertas;
      // Secciones
      state.soat = data.soat || [];
      state.solicitudes = data.solicitudes || [];
      state.rtms = data.rtms || initialState.rtms;
      state.limitaciones_propiedad = data['limitaciones-propiedad'] || [];
      state.garantias_a_favor_de = data['garantias-a-favor-de'] || [];
      state.garantias_mobiliarias = data['garantias-mobiliarias'] || [];
      state.tarjeta_operacion = data['tarjeta-operacion'] || initialState.tarjeta_operacion;
      state.datos_tecnicos = data['datos-tecnicos'] || initialState.datos_tecnicos;
      state.responsabilidad_civil = data['responsabilidad-civil'] || [];
      state.revision_tecnico_ambiental = data['revision-tecnico-ambiental'] || initialState.revision_tecnico_ambiental;
      state.datos_blindaje = data['datos-blindaje'] || initialState.datos_blindaje;
      state.poliza_caucion = data['poliza-caucion'] || initialState.poliza_caucion;
      state.registro_inicial = data['registro-inicial'] || initialState.registro_inicial;
      state.registro_inicial_invc = data['registro-inicial-invc'] || initialState.registro_inicial_invc;
      state.certificado_dijin = data['certificado-dijin'] || initialState.certificado_dijin;
      state.certificado_desintegracion = data['certificado-desintegracion'] || initialState.certificado_desintegracion;
      state.normalizacion = data.normalizacion || [];
      state.desintegracion = data.desintegracion || initialState.desintegracion;
      state.permisos_pcr = data['permisos-pcr'] || [];
      // Estado
      state.loading = false;
      state.error = null;
    },
    setVinExtraido: (state, action) => {
      state.vin = action.payload;
    },
    setPersona: (state, action) => {
      const data = action.payload;
      state.id_persona = data.id_persona;
      state.tipo_documento_persona = data.tipo_documento;
      state.numero_documento_persona = data.numero_documento;
      state.nombres = data.nombres;
      state.apellidos = data.apellidos;
      state.fecha_inscripcion = data.fecha_inscripcion;
      state.estado_conductor = data.estado_conductor;
      state.estado_persona = data.estado_persona;
      state.mostrar_solicitudes = data.mostrar_solicitudes;
      state.no_inscrito = data.no_inscrito;
      state.tiene_licencias = data.tiene_licencias;
      state.tiene_multas = data.tiene_multas;
      state.nro_paz_y_salvo = data.nro_paz_y_salvo;
    },
    clearVehiculo: () => initialState,
    resetStore: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setVehiculo,
  setVinExtraido,
  setPersona,
  clearVehiculo,
  resetStore,
} = apisExternasRuntStore.actions;

// Selectores - Estado de consulta
export const selectLoading = (state) => state.apisExternasRuntStore.loading;
export const selectError = (state) => state.apisExternasRuntStore.error;

// Selectores - Datos generales del vehículo
export const selectPlaca = (state) => state.apisExternasRuntStore.placa;
export const selectNumLicencia = (state) => state.apisExternasRuntStore.num_licencia;
export const selectEstadoAutomotor = (state) => state.apisExternasRuntStore.estado_automotor;
export const selectTipoServicio = (state) => state.apisExternasRuntStore.tipo_servicio;
export const selectClase = (state) => state.apisExternasRuntStore.clase;
export const selectMarca = (state) => state.apisExternasRuntStore.marca;
export const selectLinea = (state) => state.apisExternasRuntStore.linea;
export const selectModelo = (state) => state.apisExternasRuntStore.modelo;
export const selectColor = (state) => state.apisExternasRuntStore.color;
export const selectNumMotor = (state) => state.apisExternasRuntStore.num_motor;
export const selectNumChasis = (state) => state.apisExternasRuntStore.num_chasis;
export const selectVin = (state) => state.apisExternasRuntStore.vin;
export const selectCilindraje = (state) => state.apisExternasRuntStore.cilindraje;  
export const selectTipoCarroceria = (state) => state.apisExternasRuntStore.tipo_carroceria;
export const selectFechaRegistro = (state) => state.apisExternasRuntStore.fecha_registro;
export const selectGravamenes = (state) => state.apisExternasRuntStore.gravamenes;
export const selectOrganismoTransito = (state) => state.apisExternasRuntStore.organismo_transito;
export const selectPesoBruto = (state) => state.apisExternasRuntStore.peso_bruto;
export const selectNumeroEjes = (state) => state.apisExternasRuntStore.numero_ejes;
export const selectRepotenciado = (state) => state.apisExternasRuntStore.repotenciado;
export const selectDiasMatriculado = (state) => state.apisExternasRuntStore.dias_matriculado;
export const selectPrendas = (state) => state.apisExternasRuntStore.prendas;
export const selectClasificacion = (state) => state.apisExternasRuntStore.clasificacion;
export const selectTipoCombustible = (state) => state.apisExternasRuntStore.tipo_combustible;
export const selectPasajerosSentados = (state) => state.apisExternasRuntStore.pasajeros_sentados;
export const selectCapacidadCarga = (state) => state.apisExternasRuntStore.capacidad_carga;
export const selectPuertas = (state) => state.apisExternasRuntStore.puertas;

// Selectores - Secciones
export const selectSoat = (state) => state.apisExternasRuntStore.soat;
export const selectSolicitudes = (state) => state.apisExternasRuntStore.solicitudes;
export const selectRtms = (state) => state.apisExternasRuntStore.rtms;
export const selectLimitacionesPropiedad = (state) => state.apisExternasRuntStore.limitaciones_propiedad;
export const selectGarantiasAFavorDe = (state) => state.apisExternasRuntStore.garantias_a_favor_de;
export const selectGarantiasMobiliarias = (state) => state.apisExternasRuntStore.garantias_mobiliarias;
export const selectTarjetaOperacion = (state) => state.apisExternasRuntStore.tarjeta_operacion;
export const selectDatosTecnicos = (state) => state.apisExternasRuntStore.datos_tecnicos;
export const selectResponsabilidadCivil = (state) => state.apisExternasRuntStore.responsabilidad_civil;
export const selectRevisionTecnicoAmbiental = (state) => state.apisExternasRuntStore.revision_tecnico_ambiental;
export const selectDatosBlindaje = (state) => state.apisExternasRuntStore.datos_blindaje;
export const selectPolizaCaucion = (state) => state.apisExternasRuntStore.poliza_caucion;
export const selectRegistroInicial = (state) => state.apisExternasRuntStore.registro_inicial;
export const selectRegistroInicialInvc = (state) => state.apisExternasRuntStore.registro_inicial_invc;
export const selectCertificadoDijin = (state) => state.apisExternasRuntStore.certificado_dijin;
export const selectCertificadoDesintegracion = (state) => state.apisExternasRuntStore.certificado_desintegracion;
export const selectNormalizacion = (state) => state.apisExternasRuntStore.normalizacion;
export const selectDesintegracion = (state) => state.apisExternasRuntStore.desintegracion;
export const selectPermisosPcr = (state) => state.apisExternasRuntStore.permisos_pcr;

// Selectores - Datos de persona/conductor
export const selectIdPersona = (state) => state.apisExternasRuntStore.id_persona;
export const selectTipoDocumentoPersona = (state) => state.apisExternasRuntStore.tipo_documento_persona;
export const selectNumeroDocumentoPersona = (state) => state.apisExternasRuntStore.numero_documento_persona;
export const selectNombres = (state) => state.apisExternasRuntStore.nombres;
export const selectApellidos = (state) => state.apisExternasRuntStore.apellidos;
export const selectFechaInscripcion = (state) => state.apisExternasRuntStore.fecha_inscripcion;
export const selectEstadoConductor = (state) => state.apisExternasRuntStore.estado_conductor;
export const selectEstadoPersona = (state) => state.apisExternasRuntStore.estado_persona;
export const selectMostrarSolicitudes = (state) => state.apisExternasRuntStore.mostrar_solicitudes;
export const selectNoInscrito = (state) => state.apisExternasRuntStore.no_inscrito;
export const selectTieneLicencias = (state) => state.apisExternasRuntStore.tiene_licencias;
export const selectTieneMultas = (state) => state.apisExternasRuntStore.tiene_multas;
export const selectNroPazYSalvo = (state) => state.apisExternasRuntStore.nro_paz_y_salvo;

export default apisExternasRuntStore.reducer;
