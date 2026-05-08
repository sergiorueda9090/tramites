import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Skeleton,
  Avatar,
  Chip,
  Tooltip as MuiTooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { formatCurrency } from '../../../utils/helpers';

// ============================================
// KPI Card
// ============================================
const KpiCard = ({ icon: Icon, label, value, color = 'primary.main', loading }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color, width: 48, height: 48 }}>
          <Icon />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width="80%" height={32} />
          ) : (
            <Typography variant="h5" fontWeight={700} noWrap title={typeof value === 'string' ? value : undefined}>
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================
// Panel Card wrapper (header + loading + empty state)
// ============================================
const PanelCard = ({ title, subheader, height = 300, loading, isEmpty, children }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader
      title={title}
      subheader={subheader}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      subheaderTypographyProps={{ variant: 'caption' }}
    />
    <CardContent sx={{ pt: 0 }}>
      {loading ? (
        <Skeleton variant="rectangular" height={height} />
      ) : isEmpty ? (
        <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            Sin datos para los filtros actuales
          </Typography>
        </Box>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);

// ============================================
// StatsPanel — KPIs + Top tarjetas (sin gráficos)
// ============================================
const StatsPanel = ({ stats, loading }) => {
  const totales    = stats?.totales     || null;
  const porTarjeta = stats?.por_tarjeta || [];

  const formatNumber = (n) => new Intl.NumberFormat('es-CO').format(Number(n || 0));

  const kpis = useMemo(() => ([
    {
      label: 'Registros',
      value: totales ? formatNumber(totales.registros) : '0',
      icon: ReceiptLongIcon,
    },
    {
      label: 'Total 4x1000',
      value: totales ? formatCurrency(totales.valor_total) : formatCurrency(0),
      icon: PercentIcon,
    },
    {
      label: 'Total base',
      value: totales ? formatCurrency(totales.valor_base_total) : formatCurrency(0),
      icon: PaidIcon,
    },
    {
      label: 'Tarjetas distintas',
      value: totales ? formatNumber(totales.tarjetas_distintas) : '0',
      icon: CreditCardIcon,
    },
  ]), [totales]);

  return (
    <Box sx={{ mb: 3 }}>
      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kpis.map((k) => (
          <Grid item xs={12} sm={6} md={3} key={k.label}>
            <KpiCard {...k} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Top tarjetas */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PanelCard
            title="Top tarjetas"
            subheader="Mayor 4x1000 acumulado"
            loading={loading}
            isEmpty={porTarjeta.length === 0}
            height={260}
          >
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tarjeta</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Registros</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total 4x1000</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {porTarjeta.map((t) => (
                    <TableRow key={t.tarjeta_id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{t.titular || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            ····{t.numero_last4}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <MuiTooltip title="Cantidad de registros">
                          <Chip size="small" label={formatNumber(t.count)} />
                        </MuiTooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          {formatCurrency(t.valor)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </PanelCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsPanel;
