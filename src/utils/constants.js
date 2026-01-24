export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  INSPECCIONES: '/inspecciones',
  VEHICULOS: '/vehiculos',
  CERTIFICADOS: '/certificados',
  USUARIOS: '/usuarios',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
  LOGIN: '/login',
  PROFILE: '/profile',
};

export const VEHICLE_TYPES = {
  AUTOMOVIL: 'Automóvil',
  MOTOCICLETA: 'Motocicleta',
  CAMIONETA: 'Camioneta',
  CAMION: 'Camión',
  BUS: 'Bus',
  MICROBUS: 'Microbús',
  TAXI: 'Taxi',
  TRACTOCAMION: 'Tractocamión',
  REMOLQUE: 'Remolque',
};

export const INSPECTION_STATUS = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  CANCELADO: 'cancelado',
};

export const INSPECTION_STATUS_LABELS = {
  [INSPECTION_STATUS.PENDIENTE]: 'Pendiente',
  [INSPECTION_STATUS.EN_PROCESO]: 'En Proceso',
  [INSPECTION_STATUS.APROBADO]: 'Aprobado',
  [INSPECTION_STATUS.RECHAZADO]: 'Rechazado',
  [INSPECTION_STATUS.CANCELADO]: 'Cancelado',
};

export const INSPECTION_STATUS_COLORS = {
  [INSPECTION_STATUS.PENDIENTE]: 'warning',
  [INSPECTION_STATUS.EN_PROCESO]: 'info',
  [INSPECTION_STATUS.APROBADO]: 'success',
  [INSPECTION_STATUS.RECHAZADO]: 'error',
  [INSPECTION_STATUS.CANCELADO]: 'default',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  TECNICO: 'tecnico',
  RECEPCIONISTA: 'recepcionista',
  SUPERVISOR: 'supervisor',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.TECNICO]: 'Técnico',
  [USER_ROLES.RECEPCIONISTA]: 'Recepcionista',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
};

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 60;

export const PAGINATION_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/',
    REFRESH: '/auth/refresh/',
    LOGOUT: '/auth/logout/',
  },
  USERS: '/users/',
  INSPECTIONS: '/inspecciones/',
  VEHICLES: '/vehiculos/',
  CERTIFICATES: '/certificados/',
  REPORTS: '/reportes/',
};
