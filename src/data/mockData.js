import { INSPECTION_STATUS, VEHICLE_TYPES, USER_ROLES } from '../utils/constants';
import dayjs from 'dayjs';

const generatePlate = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}-${numbers[Math.floor(Math.random() * 10)]}${numbers[Math.floor(Math.random() * 10)]}${numbers[Math.floor(Math.random() * 10)]}`;
};

const vehicleTypes = Object.values(VEHICLE_TYPES);
const statuses = Object.values(INSPECTION_STATUS);

export const technicians = [
  { id: 1, name: 'Carlos Rodríguez', email: 'carlos.rodriguez@cda.com' },
  { id: 2, name: 'María García', email: 'maria.garcia@cda.com' },
  { id: 3, name: 'Juan Martínez', email: 'juan.martinez@cda.com' },
  { id: 4, name: 'Ana López', email: 'ana.lopez@cda.com' },
  { id: 5, name: 'Pedro Sánchez', email: 'pedro.sanchez@cda.com' },
];

export const generateInspections = (count = 50) => {
  const inspections = [];
  const now = dayjs();

  for (let i = 1; i <= count; i++) {
    const date = now.subtract(Math.floor(Math.random() * 90), 'day');
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const technician = technicians[Math.floor(Math.random() * technicians.length)];

    inspections.push({
      id: i,
      consecutivo: `INS-${String(i).padStart(6, '0')}`,
      placa: generatePlate(),
      tipoVehiculo: vehicleType,
      propietario: `Cliente ${i}`,
      cedula: `${10000000 + Math.floor(Math.random() * 90000000)}`,
      telefono: `3${Math.floor(Math.random() * 100000000 + 100000000)}`,
      email: `cliente${i}@email.com`,
      fechaInspeccion: date.format('YYYY-MM-DD'),
      horaInspeccion: `${8 + Math.floor(Math.random() * 10)}:${Math.random() > 0.5 ? '00' : '30'}`,
      estado: status,
      tecnico: technician,
      resultado: status === INSPECTION_STATUS.APROBADO ? 'Aprobado' :
                 status === INSPECTION_STATUS.RECHAZADO ? 'Rechazado' : null,
      observaciones: status === INSPECTION_STATUS.RECHAZADO ?
        'Fallas en el sistema de frenos' : '',
      valor: vehicleType === VEHICLE_TYPES.MOTOCICLETA ? 80000 :
             vehicleType === VEHICLE_TYPES.CAMION || vehicleType === VEHICLE_TYPES.BUS ? 150000 : 120000,
      certificadoNumero: status === INSPECTION_STATUS.APROBADO ?
        `CERT-${String(i).padStart(8, '0')}` : null,
      fechaVencimiento: status === INSPECTION_STATUS.APROBADO ?
        date.add(1, 'year').format('YYYY-MM-DD') : null,
    });
  }

  return inspections.sort((a, b) => dayjs(b.fechaInspeccion).diff(dayjs(a.fechaInspeccion)));
};

export const inspections = generateInspections(50);

export const dashboardStats = {
  inspeccionesHoy: inspections.filter(i =>
    dayjs(i.fechaInspeccion).isSame(dayjs(), 'day')
  ).length || 12,
  inspeccionesMes: inspections.filter(i =>
    dayjs(i.fechaInspeccion).isSame(dayjs(), 'month')
  ).length || 145,
  certificadosProximosVencer: 23,
  tasaAprobacion: 87.5,
};

export const monthlyInspections = [
  { month: 'Ene', inspecciones: 120, aprobados: 105, rechazados: 15 },
  { month: 'Feb', inspecciones: 135, aprobados: 118, rechazados: 17 },
  { month: 'Mar', inspecciones: 142, aprobados: 125, rechazados: 17 },
  { month: 'Abr', inspecciones: 128, aprobados: 112, rechazados: 16 },
  { month: 'May', inspecciones: 156, aprobados: 138, rechazados: 18 },
  { month: 'Jun', inspecciones: 148, aprobados: 130, rechazados: 18 },
  { month: 'Jul', inspecciones: 163, aprobados: 145, rechazados: 18 },
  { month: 'Ago', inspecciones: 171, aprobados: 152, rechazados: 19 },
  { month: 'Sep', inspecciones: 158, aprobados: 140, rechazados: 18 },
  { month: 'Oct', inspecciones: 145, aprobados: 127, rechazados: 18 },
  { month: 'Nov', inspecciones: 152, aprobados: 134, rechazados: 18 },
  { month: 'Dic', inspecciones: 138, aprobados: 121, rechazados: 17 },
];

export const vehicleTypeStats = [
  { tipo: VEHICLE_TYPES.AUTOMOVIL, cantidad: 450 },
  { tipo: VEHICLE_TYPES.MOTOCICLETA, cantidad: 320 },
  { tipo: VEHICLE_TYPES.CAMIONETA, cantidad: 180 },
  { tipo: VEHICLE_TYPES.CAMION, cantidad: 120 },
  { tipo: VEHICLE_TYPES.BUS, cantidad: 85 },
  { tipo: VEHICLE_TYPES.TAXI, cantidad: 95 },
  { tipo: VEHICLE_TYPES.MICROBUS, cantidad: 45 },
];

export const approvalStats = [
  { name: 'Aprobados', value: 1205, color: '#4caf50' },
  { name: 'Rechazados', value: 171, color: '#f44336' },
];

export const users = [
  {
    id: 1,
    nombre: 'Admin Principal',
    email: 'admin@cda.com',
    rol: USER_ROLES.ADMIN,
    estado: true,
    fechaCreacion: '2023-01-15',
    ultimoAcceso: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@cda.com',
    rol: USER_ROLES.TECNICO,
    estado: true,
    fechaCreacion: '2023-03-20',
    ultimoAcceso: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 3,
    nombre: 'María García',
    email: 'maria.garcia@cda.com',
    rol: USER_ROLES.TECNICO,
    estado: true,
    fechaCreacion: '2023-04-10',
    ultimoAcceso: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 4,
    nombre: 'Juan Martínez',
    email: 'juan.martinez@cda.com',
    rol: USER_ROLES.RECEPCIONISTA,
    estado: true,
    fechaCreacion: '2023-05-05',
    ultimoAcceso: dayjs().format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 5,
    nombre: 'Ana López',
    email: 'ana.lopez@cda.com',
    rol: USER_ROLES.SUPERVISOR,
    estado: true,
    fechaCreacion: '2023-02-28',
    ultimoAcceso: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 6,
    nombre: 'Pedro Sánchez',
    email: 'pedro.sanchez@cda.com',
    rol: USER_ROLES.TECNICO,
    estado: false,
    fechaCreacion: '2023-06-15',
    ultimoAcceso: dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 7,
    nombre: 'Laura Díaz',
    email: 'laura.diaz@cda.com',
    rol: USER_ROLES.RECEPCIONISTA,
    estado: true,
    fechaCreacion: '2023-07-20',
    ultimoAcceso: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 8,
    nombre: 'Roberto Torres',
    email: 'roberto.torres@cda.com',
    rol: USER_ROLES.TECNICO,
    estado: true,
    fechaCreacion: '2023-08-01',
    ultimoAcceso: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm'),
  },
];

export const recentActivity = [
  {
    id: 1,
    tipo: 'inspeccion',
    descripcion: 'Nueva inspección registrada',
    detalle: 'Vehículo ABC-123',
    usuario: 'Juan Martínez',
    fecha: dayjs().subtract(10, 'minute').toISOString(),
  },
  {
    id: 2,
    tipo: 'certificado',
    descripcion: 'Certificado emitido',
    detalle: 'CERT-00000045',
    usuario: 'Carlos Rodríguez',
    fecha: dayjs().subtract(25, 'minute').toISOString(),
  },
  {
    id: 3,
    tipo: 'inspeccion',
    descripcion: 'Inspección completada',
    detalle: 'Vehículo XYZ-789 - Aprobado',
    usuario: 'María García',
    fecha: dayjs().subtract(45, 'minute').toISOString(),
  },
  {
    id: 4,
    tipo: 'usuario',
    descripcion: 'Nuevo usuario registrado',
    detalle: 'Roberto Torres',
    usuario: 'Admin Principal',
    fecha: dayjs().subtract(2, 'hour').toISOString(),
  },
  {
    id: 5,
    tipo: 'inspeccion',
    descripcion: 'Inspección rechazada',
    detalle: 'Vehículo DEF-456 - Fallas en frenos',
    usuario: 'Pedro Sánchez',
    fecha: dayjs().subtract(3, 'hour').toISOString(),
  },
];
