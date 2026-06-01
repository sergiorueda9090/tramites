import React from 'react';
import {
  Box, Paper, Typography, Stack, Skeleton, Chip,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const formatCOP = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(v || 0));

const TIPOS = [
  { key: 'activo',     label: 'Activos',      color: '#1976d2', bg: '#e3f2fd', icon: AccountBalanceWalletIcon },
  { key: 'pasivo',     label: 'Pasivos',      color: '#d32f2f', bg: '#ffebee', icon: CreditCardOffIcon },
  { key: 'patrimonio', label: 'Patrimonio',   color: '#7b1fa2', bg: '#f3e5f5', icon: AccountBalanceIcon },
  { key: 'ingreso',    label: 'Ingresos',     color: '#2e7d32', bg: '#e8f5e9', icon: TrendingUpIcon },
  { key: 'gasto',      label: 'Gastos',       color: '#ed6c02', bg: '#fff3e0', icon: TrendingDownIcon },
];

const StatsCards = ({ resumen, loading, totalSubCuentas }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {TIPOS.map((tipo) => {
        const data = resumen?.[tipo.key];
        const Icon = tipo.icon;
        return (
          <Paper
            key={tipo.key}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                borderColor: tipo.color,
              },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                {tipo.label.toUpperCase()}
              </Typography>
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: tipo.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon sx={{ color: tipo.color, fontSize: 20 }} />
              </Box>
            </Stack>
            {loading ? (
              <>
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="50%" height={20} />
              </>
            ) : (
              <>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: tipo.color, mb: 0.5, fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                  noWrap
                >
                  {formatCOP(data?.acumulado)}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`${data?.sub_cuentas_count || 0} cuentas`}
                    sx={{ height: 18, fontSize: 10, bgcolor: tipo.bg, color: tipo.color }}
                  />
                </Stack>
              </>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default StatsCards;
