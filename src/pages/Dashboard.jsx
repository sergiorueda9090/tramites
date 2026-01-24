import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardHome from '../components/dashboard/DashboardHome';

const Dashboard = () => {
  const handleRefresh = () => {
    // TODO: Implement data refresh
    console.log('Refreshing dashboard data...');
  };

  const handleNewInspection = () => {
    // TODO: Navigate to new inspection form
    console.log('Creating new inspection...');
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Resumen general de Movilidad2A
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewInspection}
          >
            Nueva inspección
          </Button>
        </Box>
      </Box>

      {/* Dashboard Content */}
      <DashboardHome />
    </Box>
  );
};

export default Dashboard;
