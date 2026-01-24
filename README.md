# Frontend CDA - Sistema de Gestión de Documentos y Certificados

Este es el frontend del sistema CDA (Certificate and Document Administration) construido con React 19, Redux Toolkit y Material-UI.

## Tabla de Contenidos

- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes](#componentes)
  - [Layout](#layout)
  - [Autenticación](#autenticación)
  - [Componentes Comunes](#componentes-comunes)
  - [Dashboard](#dashboard)
- [Páginas](#páginas)
- [Hooks Personalizados](#hooks-personalizados)
- [Servicios](#servicios)
- [Estado Global (Redux)](#estado-global-redux)
- [Tema y Estilos](#tema-y-estilos)
- [Utilidades](#utilidades)

---

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Construye la aplicación para producción |
| `npm test` | Ejecuta los tests |

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:8000
```

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── auth/           # Componentes de autenticación
│   ├── common/         # Componentes reutilizables
│   ├── dashboard/      # Componentes del dashboard
│   └── layout/         # Componentes de estructura
├── constants/          # Constantes globales
├── data/               # Datos mock para desarrollo
├── hooks/              # Hooks personalizados
├── pages/              # Páginas de la aplicación
├── router/             # Configuración de rutas
├── services/           # Servicios y API
├── store/              # Estado global Redux
├── theme/              # Configuración del tema MUI
├── utils/              # Funciones utilitarias
├── App.js              # Componente raíz
└── index.js            # Punto de entrada
```

---

## Componentes

### Layout

#### `MainLayout`

Layout principal que envuelve todas las páginas protegidas.

**Ubicación:** `src/components/layout/MainLayout.jsx`

**Uso:**
```jsx
import MainLayout from './components/layout/MainLayout';

// Se usa automáticamente en las rutas protegidas
<MainLayout>
  <MiPagina />
</MainLayout>
```

**Estructura:**
- Navbar fijo en la parte superior
- Sidebar colapsable en el lado izquierdo
- Área de contenido principal
- Footer en la parte inferior

---

#### `Navbar`

Barra de navegación superior con controles de usuario.

**Ubicación:** `src/components/layout/Navbar.jsx`

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `sidebarCollapsed` | `boolean` | Indica si el sidebar está colapsado |

**Características:**
- Breadcrumbs de navegación
- Toggle de tema claro/oscuro
- Campana de notificaciones con badge
- Menú de usuario (perfil, configuración, cerrar sesión)

---

#### `Sidebar`

Menú lateral de navegación colapsable.

**Ubicación:** `src/components/layout/Sidebar.jsx`

**Características:**
- Logo y branding
- Secciones de menú: Principal, Operaciones, Administración
- Iconos para cada elemento
- Resaltado del elemento activo
- Colapso/expansión en escritorio
- Drawer modal en móviles

**Elementos del menú:**
- Dashboard
- Inspecciones
- Vehículos
- Certificados
- Usuarios
- Reportes
- Configuración

---

#### `Footer`

Pie de página de la aplicación.

**Ubicación:** `src/components/layout/Footer.jsx`

---

### Autenticación

#### `ProtectedRoute`

Componente de protección de rutas que requieren autenticación.

**Ubicación:** `src/components/auth/ProtectedRoute.jsx`

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `children` | `ReactNode` | Contenido a renderizar si está autenticado |

**Uso:**
```jsx
import ProtectedRoute from './components/auth/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Comportamiento:**
- Verifica `isLogin` y `token` del estado Redux
- Redirige a `/login` si no está autenticado
- Preserva la URL original para redirigir después del login

---

#### `PublicRoute`

Componente para rutas públicas (login, registro).

**Ubicación:** `src/components/auth/PublicRoute.jsx`

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `children` | `ReactNode` | Contenido a renderizar si NO está autenticado |

**Comportamiento:**
- Redirige al dashboard si ya está autenticado

---

#### `SessionManager`

Componente invisible que monitorea la sesión del usuario.

**Ubicación:** `src/components/auth/SessionManager.jsx`

**Características:**
- Verifica validez del token cada 60 segundos
- Alerta cuando la sesión expira en menos de 5 minutos
- Cierra sesión automáticamente al expirar el token
- Se activa al cambiar de pestaña

---

### Componentes Comunes

#### `DataTable`

Tabla avanzada con ordenamiento, paginación y selección.

**Ubicación:** `src/components/common/DataTable.jsx`

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `columns` | `array` | requerido | Configuración de columnas |
| `data` | `array` | requerido | Datos de las filas |
| `loading` | `boolean` | `false` | Estado de carga |
| `page` | `number` | `0` | Página actual |
| `pageSize` | `number` | `10` | Filas por página |
| `totalRows` | `number` | `0` | Total de filas |
| `sortField` | `string` | `''` | Campo de ordenamiento |
| `sortOrder` | `'asc'` \| `'desc'` | `'asc'` | Dirección del orden |
| `selectedRows` | `array` | `[]` | IDs de filas seleccionadas |
| `selectable` | `boolean` | `false` | Habilitar selección |
| `onPageChange` | `function` | - | Callback al cambiar página |
| `onPageSizeChange` | `function` | - | Callback al cambiar tamaño |
| `onSort` | `function` | - | Callback al ordenar |
| `onSelectRow` | `function` | - | Callback al seleccionar fila |
| `onSelectAll` | `function` | - | Callback al seleccionar todas |
| `onView` | `function` | - | Callback para ver |
| `onEdit` | `function` | - | Callback para editar |
| `onDelete` | `function` | - | Callback para eliminar |
| `emptyMessage` | `string` | `'No hay datos'` | Mensaje cuando está vacío |
| `stickyHeader` | `boolean` | `false` | Header fijo |
| `maxHeight` | `string` | - | Altura máxima |
| `showActions` | `boolean` | `true` | Mostrar columna de acciones |

**Configuración de columnas:**
```jsx
const columns = [
  {
    field: 'nombre',
    headerName: 'Nombre',
    sortable: true,
    width: '200px'
  },
  {
    field: 'estado',
    headerName: 'Estado',
    type: 'chip', // Renderiza como Chip de MUI
    chipColors: {
      activo: 'success',
      inactivo: 'error'
    }
  },
  {
    field: 'fecha',
    headerName: 'Fecha',
    renderCell: (row) => formatDate(row.fecha) // Render personalizado
  },
  {
    field: 'verificado',
    headerName: 'Verificado',
    type: 'boolean' // Muestra check o X
  }
];
```

**Uso completo:**
```jsx
import DataTable from './components/common/DataTable';
import { useTable } from './hooks/useTable';

function MiComponente() {
  const {
    page,
    pageSize,
    sortField,
    sortOrder,
    selectedRows,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleSelectRow,
    handleSelectAll
  } = useTable();

  return (
    <DataTable
      columns={columns}
      data={usuarios}
      loading={loading}
      page={page}
      pageSize={pageSize}
      totalRows={usuarios.length}
      sortField={sortField}
      sortOrder={sortOrder}
      selectedRows={selectedRows}
      selectable
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSort={handleSort}
      onSelectRow={handleSelectRow}
      onSelectAll={() => handleSelectAll(usuarios)}
      onView={(row) => console.log('Ver:', row)}
      onEdit={(row) => console.log('Editar:', row)}
      onDelete={(row) => console.log('Eliminar:', row)}
    />
  );
}
```

---

#### `AdvancedFilters`

Panel de filtros avanzados con múltiples tipos de filtro.

**Ubicación:** `src/components/common/AdvancedFilters.jsx`

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `filters` | `object` | requerido | Valores actuales de filtros |
| `filterConfig` | `array` | requerido | Configuración de campos |
| `activeFilters` | `array` | `[]` | Filtros activos |
| `onFilterChange` | `function` | requerido | `(key, value) => void` |
| `onApply` | `function` | - | Callback al aplicar filtros |
| `onClear` | `function` | - | Callback al limpiar todo |
| `onClearFilter` | `function` | - | `(key) => void` Limpiar un filtro |
| `expanded` | `boolean` | `true` | Iniciar expandido |
| `showActiveFilters` | `boolean` | `true` | Mostrar chips de filtros activos |

**Tipos de filtro soportados:**
- `text` - Input de texto
- `select` - Dropdown
- `multiselect` - Autocomplete múltiple
- `autocomplete` - Autocomplete simple
- `date` - Selector de fecha
- `dateRange` - Rango de fechas

**Configuración de filtros:**
```jsx
const filterConfig = [
  {
    key: 'busqueda',
    label: 'Buscar',
    type: 'text',
    placeholder: 'Nombre o email...',
    icon: true // Muestra icono de búsqueda
  },
  {
    key: 'rol',
    label: 'Rol',
    type: 'select',
    options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'usuario', label: 'Usuario' }
    ]
  },
  {
    key: 'estado',
    label: 'Estado',
    type: 'multiselect',
    options: [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ]
  },
  {
    key: 'fechaCreacion',
    label: 'Fecha de Creación',
    type: 'dateRange'
  }
];
```

**Uso:**
```jsx
import AdvancedFilters from './components/common/AdvancedFilters';
import { useFilters } from './hooks/useFilters';

function MiComponente() {
  const {
    filters,
    activeFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    clearFilter
  } = useFilters({ busqueda: '', rol: '', estado: [] });

  return (
    <AdvancedFilters
      filters={filters}
      filterConfig={filterConfig}
      activeFilters={activeFilters}
      onFilterChange={updateFilter}
      onApply={applyFilters}
      onClear={clearFilters}
      onClearFilter={clearFilter}
    />
  );
}
```

---

#### `LoadingSpinner`

Indicador de carga flexible.

**Ubicación:** `src/components/common/LoadingSpinner.jsx`

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `size` | `number` | `40` | Tamaño del spinner |
| `message` | `string` | - | Texto de carga |
| `overlay` | `boolean` | `false` | Mostrar como overlay |
| `fullScreen` | `boolean` | `false` | Overlay pantalla completa |
| `color` | `string` | `'primary'` | Color del spinner |

**Uso:**
```jsx
import LoadingSpinner, { TableLoadingSkeleton } from './components/common/LoadingSpinner';

// Spinner básico
<LoadingSpinner />

// Con mensaje
<LoadingSpinner message="Cargando datos..." />

// Pantalla completa
<LoadingSpinner fullScreen message="Procesando..." />

// Skeleton para tablas
<TableLoadingSkeleton rows={5} columns={4} />
```

---

#### `AppBackdrop`

Overlay de carga global con animaciones.

**Ubicación:** `src/components/common/AppBackdrop.jsx`

**Características:**
- Se controla desde Redux (no recibe props)
- Logo animado de M2A
- Barra de progreso
- Efecto de blur en el fondo

**Control desde Redux:**
```jsx
import { setLoading } from './store/uiStore/uiStore';
import { useDispatch } from 'react-redux';

const dispatch = useDispatch();

// Mostrar
dispatch(setLoading({ isLoading: true, message: 'Procesando...' }));

// Ocultar
dispatch(setLoading({ isLoading: false }));
```

---

#### `ErrorBoundary`

Captura errores en componentes hijos.

**Ubicación:** `src/components/common/ErrorBoundary.jsx`

**Props:**
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `ReactNode` | requerido | Contenido a envolver |
| `fullPage` | `boolean` | `false` | Usar altura completa |

**Uso:**
```jsx
import ErrorBoundary from './components/common/ErrorBoundary';

<ErrorBoundary>
  <ComponenteQuePodeFallar />
</ErrorBoundary>
```

---

### Dashboard

#### `DashboardHome`

Contenido principal del dashboard con estadísticas y gráficos.

**Ubicación:** `src/components/dashboard/DashboardHome.jsx`

**Contenido:**
- Tarjetas de estadísticas
- Gráfico de líneas: Inspecciones mensuales
- Gráfico de pastel: Tasa de aprobación
- Gráfico de barras: Tipos de vehículos
- Lista de actividad reciente

---

#### `StatsCards`

Tarjetas de estadísticas del dashboard.

**Ubicación:** `src/components/dashboard/StatsCards.jsx`

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `stats` | `object` | Objeto con estadísticas |

**Estructura de stats:**
```jsx
const stats = {
  inspeccionesHoy: 25,
  inspeccionesMes: 450,
  certificadosProximosVencer: 12,
  tasaAprobacion: 85.5
};
```

---

## Páginas

### `Login`

Página de inicio de sesión.

**Ubicación:** `src/pages/Login.jsx`

**Características:**
- Inputs de email y contraseña
- Toggle de visibilidad de contraseña
- Validación de formulario
- Alertas de error
- Estado de carga
- Redirección después del login

---

### `Dashboard`

Página principal del dashboard.

**Ubicación:** `src/pages/Dashboard.jsx`

---

### `Usuarios`

Página de gestión de usuarios.

**Ubicación:** `src/pages/Usuarios.jsx`

**Características:**
- Filtros avanzados (búsqueda, rol, estado)
- Tabla de usuarios con paginación
- Selección de filas para exportar
- CRUD completo de usuarios
- Modal de detalles/edición

---

## Hooks Personalizados

### `useTable`

Hook para manejo de tablas con paginación, ordenamiento y selección.

**Ubicación:** `src/hooks/useTable.js`

**Opciones:**
```jsx
const options = {
  initialPage: 0,
  initialPageSize: 10,
  initialSortField: 'id',
  initialSortOrder: 'asc'
};
```

**Retorno:**
```jsx
const {
  // Estado
  page,
  pageSize,
  sortField,
  sortOrder,
  selectedRows,

  // Datos computados
  sortedData,
  paginatedData,
  totalPages,
  totalRows,

  // Handlers
  handlePageChange,
  handlePageSizeChange,
  handleSort,
  handleSelectRow,
  handleSelectAll,

  // Utilidades
  clearSelection,
  resetTable,

  // Setters directos
  setPage,
  setPageSize,
  setSortField,
  setSortOrder
} = useTable(data, options);
```

**Uso:**
```jsx
import { useTable } from './hooks/useTable';

function MiTabla({ data }) {
  const {
    paginatedData,
    page,
    pageSize,
    handlePageChange,
    handleSort
  } = useTable(data, { initialPageSize: 25 });

  return (
    <DataTable
      data={paginatedData}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onSort={handleSort}
    />
  );
}
```

---

### `useFilters`

Hook para manejo de filtros.

**Ubicación:** `src/hooks/useFilters.js`

**Retorno:**
```jsx
const {
  // Estado
  filters,
  appliedFilters,
  activeFilters,

  // Booleanos
  hasActiveFilters,
  hasUnappliedChanges,

  // Métodos
  updateFilter,
  updateMultipleFilters,
  applyFilters,
  clearFilters,
  clearFilter,
  resetFilters,
  filterData,

  // Setter directo
  setFilters
} = useFilters(initialFilters);
```

**Uso:**
```jsx
import { useFilters } from './hooks/useFilters';

function MiComponente() {
  const {
    filters,
    activeFilters,
    updateFilter,
    filterData
  } = useFilters({
    busqueda: '',
    estado: 'todos'
  });

  const filteredData = filterData(data, {
    busqueda: (item, value) =>
      item.nombre.toLowerCase().includes(value.toLowerCase()),
    estado: (item, value) =>
      value === 'todos' || item.estado === value
  });

  return (
    <AdvancedFilters
      filters={filters}
      onFilterChange={updateFilter}
    />
  );
}
```

---

### `useAlert`

Hook wrapper para el servicio de alertas.

**Ubicación:** `src/hooks/useAlert.js`

**Retorno:**
```jsx
const alert = useAlert();

// Alertas modales
alert.success('Título', 'Mensaje');
alert.error('Error', 'Algo salió mal');
alert.warning('Advertencia', 'Ten cuidado');
alert.info('Información', 'Dato importante');

// Confirmaciones
const resultado = await alert.confirm('Confirmar', '¿Estás seguro?');
if (resultado.isConfirmed) {
  // Usuario confirmó
}

// Confirmación de eliminación
const resultado = await alert.confirmDelete('usuario');

// Input
const resultado = await alert.input('Nuevo nombre', {
  inputPlaceholder: 'Ingresa el nombre'
});

// Loading
alert.loading('Procesando', 'Por favor espera...');
alert.close(); // Cerrar
```

---

### `useAuth`

Hook de autenticación.

**Ubicación:** `src/hooks/useAuth.js`

**Retorno:**
```jsx
const {
  user,
  isAuthenticated,
  isLoading,
  error,
  login,
  logout,
  clearError,
  hasPermission,
  hasRole
} = useAuth();

// Verificar permisos
if (hasPermission('usuarios.editar')) {
  // ...
}

// Verificar rol
if (hasRole(['admin', 'supervisor'])) {
  // ...
}
```

---

## Servicios

### `apiService`

Cliente HTTP basado en Axios con interceptores.

**Ubicación:** `src/services/api.js`

**Métodos:**
```jsx
import { apiService, isTokenValid, getTokenRemainingTime } from './services/api';

// Peticiones HTTP
const response = await apiService.get('/usuarios/', { page: 1 });
const response = await apiService.post('/usuarios/', { nombre: 'Juan' });
const response = await apiService.put('/usuarios/1/', { nombre: 'Juan' });
const response = await apiService.patch('/usuarios/1/', { activo: true });
const response = await apiService.delete('/usuarios/1/');

// Subida de archivos con progreso
const response = await apiService.upload('/archivos/', file, (progress) => {
  console.log(`${progress}% completado`);
});

// Utilidades de token
if (isTokenValid()) {
  const minutosRestantes = getTokenRemainingTime();
}
```

**Características:**
- Agrega automáticamente el token Bearer
- Maneja renovación de tokens en respuestas 401
- Muestra alertas en errores 403 y 500+
- Timeout de 30 segundos por defecto

---

### `alertService`

Servicio de alertas con SweetAlert2.

**Ubicación:** `src/services/alertService.js`

```jsx
import AlertService from './services/alertService';

// Modales
AlertService.success('Éxito', 'Operación completada');
AlertService.error('Error', 'Algo falló');
AlertService.warning('Advertencia', 'Revisa los datos');
AlertService.info('Info', 'Información importante');

// Confirmaciones
const result = await AlertService.confirm('Confirmar', '¿Continuar?');
const result = await AlertService.confirmDelete('registro');

// Input
const result = await AlertService.input('Título', {
  inputPlaceholder: 'Escribe aquí',
  inputValidator: (value) => !value && 'Campo requerido'
});

// Loading
AlertService.loading('Cargando', 'Espera un momento...');
AlertService.close();
```

---

### `authService`

Servicio de autenticación.

**Ubicación:** `src/services/authService.js`

```jsx
import AuthService from './services/authService';

// Login
const response = await AuthService.login(email, password);

// Logout
AuthService.logout();

// Refresh token
const response = await AuthService.refreshToken(refreshToken);

// Utilidades
const isAuth = AuthService.isAuthenticated();
const token = AuthService.getToken();
const user = AuthService.getUserFromToken();
const isExpired = AuthService.isTokenExpired();

// Guardar datos de auth
AuthService.saveAuthData({ token, refresh, user });
```

---

## Estado Global (Redux)

### Store

**Ubicación:** `src/store/store.js`

```jsx
import { useSelector, useDispatch } from 'react-redux';

// Selectores de auth
const isLogin = useSelector(state => state.authStore.isLogin);
const user = useSelector(state => state.authStore.infoUser);
const token = useSelector(state => state.authStore.token);

// Selectores de UI
const themeMode = useSelector(state => state.uiStore.themeMode);
const sidebarOpen = useSelector(state => state.uiStore.sidebarOpen);
const loading = useSelector(state => state.uiStore.loading);
```

### authStore

**Ubicación:** `src/store/authStore/authStore.js`

**Acciones:**
```jsx
import { loginSuccess, loginFail, setAuthenticated } from './store/authStore/authStore';

dispatch(loginSuccess({ user, token }));
dispatch(loginFail());
dispatch(setAuthenticated({ user, token, isLogin: true }));
```

### uiStore

**Ubicación:** `src/store/uiStore/uiStore.js`

**Estado:**
- `themeMode`: 'light' | 'dark'
- `sidebarOpen`: boolean
- `sidebarCollapsed`: boolean
- `notifications`: array
- `snackbar`: object
- `loading`: { isLoading, message }
- `breadcrumbs`: array

**Acciones:**
```jsx
import {
  toggleTheme,
  toggleSidebar,
  toggleSidebarCollapse,
  setLoading,
  showSnackbar,
  hideSnackbar,
  setBreadcrumbs
} from './store/uiStore/uiStore';

dispatch(toggleTheme());
dispatch(toggleSidebar());
dispatch(setLoading({ isLoading: true, message: 'Cargando...' }));
dispatch(showSnackbar({ message: 'Guardado', severity: 'success' }));
dispatch(setBreadcrumbs([{ label: 'Inicio', path: '/' }]));
```

---

## Tema y Estilos

**Ubicación:** `src/theme/theme.js`

### Crear tema

```jsx
import { createAppTheme, lightTheme, darkTheme } from './theme/theme';

// Tema personalizado
const theme = createAppTheme('dark');

// Temas predefinidos
<ThemeProvider theme={lightTheme}>
  <App />
</ThemeProvider>
```

### Colores principales

| Modo | Primary | Secondary |
|------|---------|-----------|
| Light | #1976d2 (azul) | #00897b (teal) |
| Dark | #90caf9 (azul claro) | #80cbc4 (teal claro) |

### Uso en componentes

```jsx
import { useTheme } from '@mui/material/styles';

function MiComponente() {
  const theme = useTheme();

  return (
    <Box sx={{
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default
    }}>
      Contenido
    </Box>
  );
}
```

---

## Utilidades

### Constantes

**Ubicación:** `src/utils/constants.js`

```jsx
import {
  API_BASE_URL,
  ROUTES,
  API_ENDPOINTS,
  VEHICLE_TYPES,
  INSPECTION_STATUS,
  USER_ROLES,
  SIDEBAR_WIDTH,
  PAGINATION_OPTIONS,
  DATE_FORMAT
} from './utils/constants';
```

### Helpers

**Ubicación:** `src/utils/helpers.js`

```jsx
import {
  // Fechas
  formatDate,
  formatDateTime,
  isToday,
  isThisMonth,
  getDaysUntil,
  sortByDate,

  // Formato
  formatCurrency,
  formatNumber,
  formatPercentage,
  truncateText,
  capitalizeFirst,
  getInitials,

  // Datos
  generateId,
  groupBy,
  parseQueryParams,
  buildQueryString,

  // Utilidades
  debounce,
  sleep,
  getRandomInt,
  downloadFile,
  getStatusColor
} from './utils/helpers';

// Ejemplos
formatDate(new Date()); // "24/01/2026"
formatCurrency(50000); // "$50.000"
getInitials('Juan Pérez'); // "JP"
truncateText('Texto muy largo...', 10); // "Texto m..."
```

---

## Datos Mock

**Ubicación:** `src/data/mockData.js`

Para desarrollo sin backend:

```jsx
import {
  inspections,
  users,
  technicians,
  dashboardStats,
  monthlyInspections,
  vehicleTypeStats,
  approvalStats,
  recentActivity,
  generateInspections
} from './data/mockData';

// Generar datos aleatorios
const nuevasInspecciones = generateInspections(100);
```

---

## Rutas de la Aplicación

| Ruta | Componente | Protegida | Descripción |
|------|------------|-----------|-------------|
| `/login` | Login | No | Inicio de sesión |
| `/` | - | Sí | Redirige a /dashboard |
| `/dashboard` | Dashboard | Sí | Panel principal |
| `/usuarios` | Usuarios | Sí | Gestión de usuarios |
| `/inspecciones` | - | Sí | Placeholder |
| `/vehiculos` | - | Sí | Placeholder |
| `/certificados` | - | Sí | Placeholder |
| `/reportes` | - | Sí | Placeholder |
| `/configuracion` | - | Sí | Placeholder |
| `/profile` | - | Sí | Placeholder |

---

## Licencia

Proyecto privado - Todos los derechos reservados.
