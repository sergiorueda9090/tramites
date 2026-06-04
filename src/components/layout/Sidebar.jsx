import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VerifiedIcon from '@mui/icons-material/Verified';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import UndoIcon from '@mui/icons-material/Undo';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BalanceIcon from '@mui/icons-material/Balance';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import PercentIcon from '@mui/icons-material/Percent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SavingsIcon from '@mui/icons-material/Savings';
import LanIcon from '@mui/icons-material/Lan';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



import {
  selectSidebarOpen,
  selectSidebarCollapsed,
  selectLayoutStyle,
  setSidebarOpen,
  toggleSidebarCollapsed,
} from '../../store/uiStore/uiStore';
import { ROUTES, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../utils/constants';
import usePermissions from '../../hooks/usePermissions';

// Cada item tiene un `color` (hex) asignado por funcionalidad. Se aplica al
// icono cuando el ítem NO está activo. Cuando está activo, se respeta el
// color de contraste del fondo seleccionado (blanco/contrastText).
//
// Convenciones de color (Material):
//   Core workflow:        azules y verdes intensos
//   Ingresos:             verdes
//   Egresos:              rojos
//   Riesgo / atención:    naranjas
//   Catálogos / maestros: púrpura, teal, rosa
//   Cálculo:              violeta
//   Infra / técnico:      púrpuras oscuros / azul-gris
//   Admin:                púrpura admin, azul, gris
const menuItems = [
  {
    section: 'Principal',
    items: [
      { text: 'Dashboard', icon: DashboardIcon, path: ROUTES.DASHBOARD, moduleCode: 'dashboard', color: '#1976d2' },
    ],
  },
  {
    section: 'Operaciones',
    items: [
      { text: 'Clientes',               icon: AssignmentIcon,         path: ROUTES.CLIENTES,               moduleCode: 'clientes',             color: '#9c27b0' },
      { text: 'Proveedores',            icon: LocalShippingIcon,      path: ROUTES.PROVEEDORES,            moduleCode: 'proveedores',          color: '#8e24aa' },
      { text: 'Tarifario SOAT',         icon: ReceiptLongIcon,        path: ROUTES.TARIFARIO_SOAT,         moduleCode: 'tarifario_soat',       color: '#00897b' },
      { text: 'Cotizador',              icon: CalculateIcon,          path: ROUTES.COTIZADOR,              moduleCode: 'cotizador',            color: '#7c4dff' },
      { text: 'Base de Datos',          icon: StorageIcon,            path: ROUTES.BASE_DE_DATOS,          moduleCode: 'base_de_datos',        color: '#607d8b' },
      { text: 'Casos Especiales',       icon: ReportProblemIcon,      path: ROUTES.CASOS_ESPECIALES,       moduleCode: 'casos_especiales',     color: '#ff9800' },
      { text: 'Trámites',               icon: AssignmentTurnedInIcon, path: ROUTES.TRAMITES,               moduleCode: 'tramites',             color: '#1976d2' },
      { text: 'Pasarela de Pago',       icon: PaymentIcon,            path: ROUTES.PASARELA_DE_PAGO,       moduleCode: 'pasarela_de_pago',     color: '#2e7d32' },
      { text: 'Trámites finalizados',   icon: TaskAltIcon,            path: ROUTES.TRAMITES_FINALIZADOS,   moduleCode: 'finalizados_tramites', color: '#43a047' },
      { text: 'API Endpoints',          icon: ApiIcon,                path: ROUTES.API_ENDPOINTS,          moduleCode: 'api_app',              color: '#5e35b1' },
      // { text: 'Etiquetas',              icon: LocalOfferIcon,         path: ROUTES.ETIQUETAS,              moduleCode: 'etiquetas',            color: '#e91e63' },
      { text: 'Tarjetas',               icon: CreditCardIcon,         path: ROUTES.TARJETAS,               moduleCode: 'tarjetas',             color: '#6a1b9a' },
      {
        text: 'Movimientos Financieros',
        icon: AccountBalanceWalletIcon,
        groupKey: 'movimientos_financieros',
        color: '#1565c0',
        children: [
          { text: 'Recepción de Pagos',    icon: PointOfSaleIcon,            path: ROUTES.RECEPCION_PAGOS,        moduleCode: 'recepcion_pagos',       color: '#00897b' },
          { text: 'Devoluciones',          icon: UndoIcon,                   path: ROUTES.DEVOLUCIONES,           moduleCode: 'devoluciones',          color: '#f44336' },
          { text: 'Cargos No Registrados', icon: ReportProblemIcon,          path: ROUTES.CARGOS_NO_REGISTRADOS,  moduleCode: 'cargos_no_registrados', color: '#d32f2f' },
          // { text: 'Ajuste de Saldo',       icon: BalanceIcon,                path: ROUTES.AJUSTE_SALDO,           moduleCode: 'ajuste_saldo',          color: '#0288d1' },
          { text: 'Gastos',                icon: TrendingDownIcon,           path: ROUTES.GASTOS,                 moduleCode: 'gastos',                color: '#c62828' },
          { text: 'Categorías de gastos',  icon: CategoryIcon,               path: ROUTES.GASTOS_CATEGORIA,       moduleCode: 'gastos_categoria',      color: '#ef5350' },
          { text: '4 x 1000',              icon: PercentIcon,                path: ROUTES.CUATRO_POR_MIL,         moduleCode: 'cuatro_por_mil',        color: '#fb8c00' },
          { text: 'Utilidades',            icon: MonetizationOnIcon,         path: ROUTES.UTILIDADES,             moduleCode: 'utilidades',            color: '#2e7d32' },
          { text: 'Utilidad ocasional',    icon: SavingsIcon,                path: ROUTES.UTILIDAD_OCASIONAL,     moduleCode: 'utilidad_ocasional',    color: '#66bb6a' },
          { text: 'Plan de cuentas',       icon: AccountTreeIcon,            path: ROUTES.PLAN_DE_CUENTAS,        moduleCode: 'plan_de_cuentas',       color: '#00695c' },
          { text: 'Sub-cuentas',           icon: SubdirectoryArrowRightIcon, path: ROUTES.SUB_CUENTAS,            moduleCode: 'sub_cuentas',           color: '#00897b' },
          { text: 'Dashboard contable',    icon: AssessmentIcon,             path: ROUTES.DASHBOARD_CONTABLE,     moduleCode: 'sub_cuentas',           color: '#1565c0' },
        ],
      },
      { text: 'Conmutador de IPs',      icon: LanIcon,                path: ROUTES.CONMUTADOR_IPS,         moduleCode: 'computador_ips',       color: '#455a64' },
      { text: 'Inspecciones',           icon: AssignmentIcon,         path: ROUTES.INSPECCIONES,           moduleCode: 'inspecciones',         color: '#fbc02d' },
      { text: 'Vehículos',              icon: DirectionsCarIcon,      path: ROUTES.VEHICULOS,              moduleCode: 'vehiculos',            color: '#1565c0' },
      { text: 'Certificados',           icon: VerifiedIcon,           path: ROUTES.CERTIFICADOS,           moduleCode: 'certificados',         color: '#388e3c' },
    ],
  },
  {
    section: 'Administración',
    items: [
      { text: 'Usuarios',      icon: PeopleIcon,   path: ROUTES.USUARIOS,      moduleCode: 'usuarios',      color: '#7b1fa2' },
      { text: 'Reportes',      icon: BarChartIcon, path: ROUTES.REPORTES,      moduleCode: 'reportes',      color: '#1976d2' },
      { text: 'Configuración', icon: SettingsIcon, path: ROUTES.CONFIGURACION, moduleCode: 'configuracion', color: '#455a64' },
    ],
  },
];

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const sidebarOpen = useSelector(selectSidebarOpen);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const layoutStyle = useSelector(selectLayoutStyle);
  const { canView } = usePermissions();

  // Filtrar secciones y items según permisos. Los items-grupo (con `children`)
  // conservan solo los hijos visibles y se eliminan si todos sus hijos quedan
  // fuera.
  const filteredMenuItems = menuItems
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (item.children) {
            const visibleChildren = item.children.filter((child) => canView(child.moduleCode));
            return visibleChildren.length > 0 ? { ...item, children: visibleChildren } : null;
          }
          return canView(item.moduleCode) ? item : null;
        })
        .filter(Boolean),
    }))
    .filter((section) => section.items.length > 0);

  // Auto-abrir un grupo si alguno de sus hijos está activo, para que la ruta
  // actual sea siempre visible al cargar el sidebar.
  const initialOpenGroups = () => {
    const open = {};
    filteredMenuItems.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && item.children.some((child) => location.pathname === child.path || location.pathname.startsWith(child.path + '/'))) {
          open[item.groupKey] = true;
        }
      });
    });
    return open;
  };
  const [openGroups, setOpenGroups] = useState(initialOpenGroups);

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const isColored = layoutStyle === 'colored';

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleToggleCollapse = () => {
    dispatch(toggleSidebarCollapsed());
  };

  const handleClose = () => {
    dispatch(setSidebarOpen(false));
  };

  const isActive = (path) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path || location.pathname === '/';
    }
    // Match exacto o subruta legitima (con "/"); evita que /tramites matchee
    // /tramites-finalizados o /gastos matchee /gastos-categoria.
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerWidth = sidebarCollapsed && !isMobile ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // Estilos según el layoutStyle
  const styles = {
    container: isColored
      ? {
          background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        }
      : {
          bgcolor: 'background.paper',
        },
    logo: isColored
      ? { bgcolor: 'rgba(255,255,255,0.2)' }
      : { bgcolor: 'primary.main' },
    logoText: isColored ? 'white' : 'white',
    title: isColored ? 'white' : 'text.primary',
    subtitle: isColored ? 'rgba(255,255,255,0.7)' : 'text.secondary',
    sectionTitle: isColored ? 'rgba(255,255,255,0.6)' : 'text.secondary',
    divider: isColored ? 'rgba(255,255,255,0.12)' : 'divider',
    menuItem: (active) =>
      isColored
        ? {
            bgcolor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            '&:hover': {
              bgcolor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
            },
          }
        : {
            bgcolor: active ? 'primary.main' : 'transparent',
            color: active ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              bgcolor: active ? 'primary.dark' : 'action.hover',
            },
          },
    // Cuando el item NO está activo aplicamos su color personalizado para
    // que se identifique visualmente la funcionalidad. Cuando está activo,
    // dejamos el color de contraste del fondo seleccionado (blanco en
    // modo colored, primary.contrastText en estándar) para que el icono
    // siga siendo legible sobre la pastilla activa.
    menuIcon: (active, customColor) => {
      if (active) {
        return isColored
          ? { color: 'white' }
          : { color: 'primary.contrastText' };
      }
      if (customColor) {
        return { color: customColor };
      }
      return isColored
        ? { color: 'rgba(255,255,255,0.7)' }
        : { color: 'text.secondary' };
    },
    collapseIcon: isColored ? { color: 'white' } : { color: 'text.primary' },
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...styles.container,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
          minHeight: 64,
        }}
      >
        {(!sidebarCollapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                ...styles.logo,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" color={styles.logoText} fontWeight="bold">
                M2A
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} noWrap color={styles.title}>
                Movilidad2A
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: styles.subtitle }}>
                Sistema de Gestión
              </Typography>
            </Box>
          </Box>
        )}
        {sidebarCollapsed && !isMobile && (
          <Box
            sx={{
              width: 40,
              height: 40,
              ...styles.logo,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color={styles.logoText} fontWeight="bold">
              M2A
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: styles.divider }} />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        {filteredMenuItems.map((section) => (
          <Box key={section.section}>
            {(!sidebarCollapsed || isMobile) && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1.5,
                  display: 'block',
                  color: styles.sectionTitle,
                  fontWeight: 600,
                }}
              >
                {section.section}
              </Typography>
            )}
            <List disablePadding>
              {section.items.map((item) => {
                const Icon = item.icon;

                // Item-grupo (contiene `children`): renderizar como botón
                // expandible con submenú. Cuando el sidebar está colapsado,
                // el click expande el sidebar y abre el grupo para que los
                // hijos sean visibles.
                if (item.children) {
                  const isOpen = !!openGroups[item.groupKey];
                  const groupActive = item.children.some((child) => isActive(child.path));
                  const collapsedView = sidebarCollapsed && !isMobile;

                  const handleGroupClick = () => {
                    if (collapsedView) {
                      dispatch(toggleSidebarCollapsed());
                      if (!isOpen) toggleGroup(item.groupKey);
                    } else {
                      toggleGroup(item.groupKey);
                    }
                  };

                  return (
                    <React.Fragment key={item.text}>
                      <ListItem disablePadding sx={{ px: 1 }}>
                        <Tooltip title={collapsedView ? item.text : ''} placement="right">
                          <ListItemButton
                            onClick={handleGroupClick}
                            sx={{
                              borderRadius: 0,
                              mb: 0.5,
                              justifyContent: collapsedView ? 'center' : 'flex-start',
                              ...styles.menuItem(groupActive),
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: collapsedView ? 0 : 40,
                                ...styles.menuIcon(groupActive, item.color),
                              }}
                            >
                              <Icon />
                            </ListItemIcon>
                            {!collapsedView && (
                              <>
                                <ListItemText
                                  primary={item.text}
                                  primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: groupActive ? 600 : 400,
                                  }}
                                />
                                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </>
                            )}
                          </ListItemButton>
                        </Tooltip>
                      </ListItem>
                      <Collapse in={!collapsedView && isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding>
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActive(child.path);
                            return (
                              <ListItem key={child.text} disablePadding sx={{ px: 1 }}>
                                <ListItemButton
                                  onClick={() => handleNavigation(child.path)}
                                  sx={{
                                    borderRadius: 0,
                                    mb: 0.5,
                                    pl: 4,
                                    ...styles.menuItem(childActive),
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 36, ...styles.menuIcon(childActive, child.color) }}>
                                    <ChildIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={child.text}
                                    primaryTypographyProps={{
                                      fontSize: '0.8125rem',
                                      fontWeight: childActive ? 600 : 400,
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  );
                }

                const active = isActive(item.path);

                return (
                  <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                    <Tooltip
                      title={sidebarCollapsed && !isMobile ? item.text : ''}
                      placement="right"
                    >
                      <ListItemButton
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                          borderRadius: 0,
                          mb: 0.5,
                          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                          ...styles.menuItem(active),
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: sidebarCollapsed && !isMobile ? 0 : 40,
                            ...styles.menuIcon(active, item.color),
                          }}
                        >
                          <Icon />
                        </ListItemIcon>
                        {(!sidebarCollapsed || isMobile) && (
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: active ? 600 : 400,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: styles.divider }} />

      {/* Collapse Toggle */}
      {!isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={sidebarCollapsed ? 'Expandir' : 'Contraer'} placement="right">
            <IconButton onClick={handleToggleCollapse} sx={styles.collapseIcon}>
              {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: SIDEBAR_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
