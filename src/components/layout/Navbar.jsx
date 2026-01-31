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
  AvatarGroup,
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
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
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
  selectLayoutStyle,
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

// Usuarios conectados simulados (esto vendría de un WebSocket o API en producción)
const connectedUsers = [
  { id: 1, name: 'María García', avatar: null, color: '#e91e63' },
  { id: 2, name: 'Carlos López', avatar: null, color: '#2196f3' },
  { id: 3, name: 'Ana Martínez', avatar: null, color: '#4caf50' },
  { id: 4, name: 'Pedro Sánchez', avatar: null, color: '#ff9800' },
  { id: 5, name: 'Laura Torres', avatar: null, color: '#9c27b0' },
];

const Navbar = ({ sidebarCollapsed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.authStore);
  const themeMode = useSelector(selectThemeMode);
  const layoutStyle = useSelector(selectLayoutStyle);
  const unreadCount = useSelector(selectUnreadNotificationsCount);

  const isColored = layoutStyle === 'colored';

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
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: isColored ? 'primary.main' : 'background.paper',
        color: isColored ? 'primary.contrastText' : 'text.primary',
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: isColored ? 'transparent' : 'divider',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
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
            separator={
              <NavigateNextIcon
                fontSize="small"
                sx={{ color: isColored ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}
              />
            }
            aria-label="breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const Icon = crumb.icon;

              return isLast ? (
                <Typography
                  key={crumb.path}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: isColored ? 'white' : 'text.primary',
                  }}
                >
                  {Icon && <Icon fontSize="small" />}
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.path}
                  underline="hover"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(crumb.path);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: isColored ? 'rgba(255,255,255,0.8)' : 'inherit',
                  }}
                >
                  {Icon && <Icon fontSize="small" />}
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Usuarios conectados */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 0,
              bgcolor: isColored ? 'rgba(255,255,255,0.1)' : 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
              <FiberManualRecordIcon
                sx={{
                  fontSize: 10,
                  color: 'success.main',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: isColored ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {connectedUsers.length} en línea
              </Typography>
            </Box>
            <AvatarGroup
              max={4}
              sx={{
                '& .MuiAvatar-root': {
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  borderRadius: 0,
                  border: '2px solid',
                  borderColor: isColored ? 'primary.main' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.15)',
                    zIndex: 10,
                  },
                },
              }}
            >
              {connectedUsers.map((connectedUser) => (
                <Tooltip
                  key={connectedUser.id}
                  title={
                    <Box sx={{ textAlign: 'center', py: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {connectedUser.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'success.light', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
                      >
                        <FiberManualRecordIcon sx={{ fontSize: 8 }} />
                        En línea
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="bottom"
                >
                  <Avatar
                    src={connectedUser.avatar}
                    sx={{ bgcolor: connectedUser.color }}
                  >
                    {getInitials(connectedUser.name)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: 'none', md: 'block' },
              borderColor: isColored ? 'rgba(255,255,255,0.2)' : 'divider',
            }}
          />

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
                  bgcolor: isColored ? 'rgba(255,255,255,0.2)' : 'primary.main',
                  color: isColored ? 'white' : 'primary.contrastText',
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  borderRadius: 0,
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
            sx: { minWidth: 200, mt: 1.5, borderRadius: 0 },
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
            sx: { minWidth: 300, maxHeight: 400, mt: 1.5, borderRadius: 0 },
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
