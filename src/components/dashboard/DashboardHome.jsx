import React from 'react';
import { Box, Grid, Card, CardContent, CardHeader, Typography, Chip, Avatar } from '@mui/material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import StatsCards from './StatsCards';
import {
  dashboardStats,
  monthlyInspections,
  vehicleTypeStats,
  approvalStats,
  recentActivity,
} from '../../data/mockData';
import { formatDateTime } from '../../utils/helpers';

const DashboardHome = () => {
  return (
    <Box>
      {/* Stats Cards */}
      <StatsCards stats={dashboardStats} />

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Monthly Inspections Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Inspecciones por mes"
              subheader="Comparativa anual de inspecciones realizadas"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyInspections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="inspecciones"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Total"
                    dot={{ fill: '#1976d2' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aprobados"
                    stroke="#4caf50"
                    strokeWidth={2}
                    name="Aprobados"
                    dot={{ fill: '#4caf50' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rechazados"
                    stroke="#f44336"
                    strokeWidth={2}
                    name="Rechazados"
                    dot={{ fill: '#f44336' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval Rate Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Tasa de aprobación"
              subheader="Distribución de resultados"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={approvalStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {approvalStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Cantidad']} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                {approvalStats.map((stat) => (
                  <Box key={stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: stat.color,
                      }}
                    />
                    <Typography variant="body2">
                      {stat.name}: {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle Types Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Tipos de vehículos"
              subheader="Distribución por tipo de vehículo inspeccionado"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicleTypeStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tipo" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#00897b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Actividad reciente"
              subheader="Últimas acciones realizadas en el sistema"
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 1.5,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor:
                          activity.tipo === 'inspeccion'
                            ? 'primary.light'
                            : activity.tipo === 'certificado'
                            ? 'success.light'
                            : 'info.light',
                        color:
                          activity.tipo === 'inspeccion'
                            ? 'primary.main'
                            : activity.tipo === 'certificado'
                            ? 'success.main'
                            : 'info.main',
                        fontSize: '0.875rem',
                      }}
                    >
                      {activity.usuario.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {activity.descripcion}
                        </Typography>
                        <Chip
                          label={activity.tipo}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.detalle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.usuario} • {formatDateTime(activity.fecha)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
