import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatNumber, formatPercentage } from '../../utils/helpers';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => {
  const isPositive = trend === 'up';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 28 }} />
          </Box>
        </Box>
        {trendValue !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
            {isPositive ? (
              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
            )}
            <Chip
              label={`${isPositive ? '+' : ''}${trendValue}%`}
              size="small"
              sx={{
                bgcolor: isPositive ? 'success.light' : 'error.light',
                color: isPositive ? 'success.dark' : 'error.dark',
                fontWeight: 500,
                height: 24,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Inspecciones del día',
      value: formatNumber(stats?.inspeccionesHoy ?? 0),
      subtitle: 'Hoy',
      icon: CalendarTodayIcon,
      color: 'primary',
      trend: 'up',
      trendValue: 12,
    },
    {
      title: 'Inspecciones del mes',
      value: formatNumber(stats?.inspeccionesMes ?? 0),
      subtitle: 'Este mes',
      icon: DateRangeIcon,
      color: 'info',
      trend: 'up',
      trendValue: 8,
    },
    {
      title: 'Certificados por vencer',
      value: formatNumber(stats?.certificadosProximosVencer ?? 0),
      subtitle: 'Próximos 30 días',
      icon: WarningAmberIcon,
      color: 'warning',
      trend: 'down',
      trendValue: -5,
    },
    {
      title: 'Tasa de aprobación',
      value: formatPercentage(stats?.tasaAprobacion ?? 0),
      subtitle: 'Promedio mensual',
      icon: CheckCircleIcon,
      color: 'success',
      trend: 'up',
      trendValue: 2.5,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
