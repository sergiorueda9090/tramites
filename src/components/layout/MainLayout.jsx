import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { selectSidebarCollapsed } from '../../store/uiStore/uiStore';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../utils/constants';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);

  const drawerWidth = isMobile ? 0 : sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Navbar sidebarCollapsed={sidebarCollapsed} />
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />

        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: 'background.default',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
