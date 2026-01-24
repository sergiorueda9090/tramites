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
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  selectSidebarOpen,
  selectSidebarCollapsed,
  setSidebarOpen,
  toggleSidebarCollapsed,
} from '../../store/uiStore/uiStore';
import { ROUTES, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../utils/constants';

const menuItems = [
  {
    section: 'Principal',
    items: [
      { text: 'Dashboard', icon: DashboardIcon, path: ROUTES.DASHBOARD },
    ],
  },
  {
    section: 'Operaciones',
    items: [
      { text: 'Inspecciones', icon: AssignmentIcon, path: ROUTES.INSPECCIONES },
      { text: 'Vehículos', icon: DirectionsCarIcon, path: ROUTES.VEHICULOS },
      { text: 'Certificados', icon: VerifiedIcon, path: ROUTES.CERTIFICADOS },
    ],
  },
  {
    section: 'Administración',
    items: [
      { text: 'Usuarios', icon: PeopleIcon, path: ROUTES.USUARIOS },
      { text: 'Reportes', icon: BarChartIcon, path: ROUTES.REPORTES },
      { text: 'Configuración', icon: SettingsIcon, path: ROUTES.CONFIGURACION },
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

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
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
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" color="white" fontWeight="bold">
                M2A
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                Movilidad2A
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
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
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="white" fontWeight="bold">
              M2A
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        {menuItems.map((section) => (
          <Box key={section.section}>
            {(!sidebarCollapsed || isMobile) && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1.5,
                  display: 'block',
                  color: 'text.secondary',
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
                          borderRadius: 2,
                          mb: 0.5,
                          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                          bgcolor: active ? 'primary.main' : 'transparent',
                          color: active ? 'primary.contrastText' : 'text.primary',
                          '&:hover': {
                            bgcolor: active ? 'primary.dark' : 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: sidebarCollapsed && !isMobile ? 0 : 40,
                            color: active ? 'primary.contrastText' : 'text.secondary',
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

      <Divider />

      {/* Collapse Toggle */}
      {!isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={sidebarCollapsed ? 'Expandir' : 'Contraer'} placement="right">
            <IconButton onClick={handleToggleCollapse}>
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
