import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Divider,
  ListItemIcon,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import {
  toggleSidebar,
  toggleThemeMode,
  selectThemeMode,
  selectUnreadNotificationsCount,
} from '../../store/uiStore/uiStore';
import { loginFail } from '../../store/authStore/authStore';
import { ROUTES, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

const routeLabels = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.INSPECCIONES]: 'Inspecciones',
  [ROUTES.VEHICULOS]: 'Vehículos',
  [ROUTES.CERTIFICADOS]: 'Certificados',
  [ROUTES.USUARIOS]: 'Usuarios',
  [ROUTES.REPORTES]: 'Reportes',
  [ROUTES.CONFIGURACION]: 'Configuración',
  [ROUTES.PROFILE]: 'Perfil',
};

const Navbar = ({ sidebarCollapsed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.authStore);
  const themeMode = useSelector(selectThemeMode);
  const unreadCount = useSelector(selectUnreadNotificationsCount);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);

  const handleToggleSidebar = () => dispatch(toggleSidebar());
  const handleToggleTheme = () => dispatch(toggleThemeMode());

  const handleLogout = () => {
    handleMenuClose();
    dispatch(loginFail());
    navigate(ROUTES.LOGIN);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(ROUTES.PROFILE);
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Inicio', path: ROUTES.DASHBOARD, icon: HomeIcon }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const drawerWidth = isMobile ? 0 : sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
      elevation={1}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={handleToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const Icon = crumb.icon;

              return isLast ? (
                <Typography
                  key={crumb.path}
                  color="text.primary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {Icon && <Icon fontSize="small" />}
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.path}
                  underline="hover"
                  color="inherit"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(crumb.path);
                  }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {Icon && <Icon fontSize="small" />}
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={themeMode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton color="inherit" onClick={handleToggleTheme}>
              {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Cuenta">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                }}
              >
                {user?.name_user ? getInitials(user.name_user) : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { minWidth: 200, mt: 1.5 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              {user?.name_user || 'Usuario'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            Mi perfil
          </MenuItem>
          <MenuItem onClick={() => navigate(ROUTES.CONFIGURACION)}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Configuración
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 3,
            sx: { minWidth: 300, maxHeight: 400, mt: 1.5 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              Notificaciones
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones nuevas
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
