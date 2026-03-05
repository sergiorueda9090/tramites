import React from 'react';
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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';



import {
  selectSidebarOpen,
  selectSidebarCollapsed,
  selectLayoutStyle,
  setSidebarOpen,
  toggleSidebarCollapsed,
} from '../../store/uiStore/uiStore';
import { ROUTES, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../utils/constants';
import usePermissions from '../../hooks/usePermissions';

const menuItems = [
  {
    section: 'Principal',
    items: [
      { text: 'Dashboard', icon: DashboardIcon, path: ROUTES.DASHBOARD, moduleCode: 'dashboard' },
    ],
  },
  {
    section: 'Operaciones',
    items: [
      { text: 'Clientes',               icon: AssignmentIcon,       path: ROUTES.CLIENTES,               moduleCode: 'clientes' },
      { text: 'Tarifario SOAT',         icon: ReceiptLongIcon,      path: ROUTES.TARIFARIO_SOAT,         moduleCode: 'tarifario_soat' },
      { text: 'Etiquetas',              icon: LocalOfferIcon,       path: ROUTES.ETIQUETAS,              moduleCode: 'etiquetas' },
      { text: 'Tarjetas',               icon: CreditCardIcon,       path: ROUTES.TARJETAS,               moduleCode: 'tarjetas' },
      { text: 'Recepción de Pagos',     icon: PointOfSaleIcon,      path: ROUTES.RECEPCION_PAGOS,        moduleCode: 'recepcion_pagos' },
      { text: 'Devoluciones',           icon: UndoIcon,             path: ROUTES.DEVOLUCIONES,           moduleCode: 'devoluciones' },
      { text: 'Cargos No Registrados',  icon: ReportProblemIcon,    path: ROUTES.CARGOS_NO_REGISTRADOS,  moduleCode: 'cargos_no_registrados' },
      { text: 'Ajuste de Saldo',        icon: BalanceIcon,          path: ROUTES.AJUSTE_SALDO,           moduleCode: 'ajuste_saldo' },
      { text: 'Gastos',                 icon: TrendingDownIcon ,    path: ROUTES.GASTOS,                 moduleCode: 'gastos' },
      { text: 'Inspecciones',           icon: AssignmentIcon,       path: ROUTES.INSPECCIONES,           moduleCode: 'inspecciones' },
      { text: 'Vehículos',              icon: DirectionsCarIcon,    path: ROUTES.VEHICULOS,              moduleCode: 'vehiculos' },
      { text: 'Certificados',           icon: VerifiedIcon,         path: ROUTES.CERTIFICADOS,           moduleCode: 'certificados' },
    ],
  },
  {
    section: 'Administración',
    items: [
      { text: 'Usuarios', icon: PeopleIcon, path: ROUTES.USUARIOS, moduleCode: 'usuarios' },
      { text: 'Reportes', icon: BarChartIcon, path: ROUTES.REPORTES, moduleCode: 'reportes' },
      { text: 'Configuración', icon: SettingsIcon, path: ROUTES.CONFIGURACION, moduleCode: 'configuracion' },
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

  // Filtrar secciones y items según permisos del usuario
  const filteredMenuItems = menuItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canView(item.moduleCode)),
    }))
    .filter((section) => section.items.length > 0);

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
    return location.pathname.startsWith(path);
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
    menuIcon: (active) =>
      isColored
        ? { color: active ? 'white' : 'rgba(255,255,255,0.7)' }
        : { color: active ? 'primary.contrastText' : 'text.secondary' },
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
                            ...styles.menuIcon(active),
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
