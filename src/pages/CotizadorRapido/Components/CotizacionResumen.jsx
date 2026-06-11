import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Divider,
  InputAdornment,
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';

const CotizacionResumen = ({ cotizacion, onTarifaChange, onComisionChange, formatCurrency }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PaymentsIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Cotización
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          <TextField
            label="Tarifa SOAT"
            type="number"
            value={cotizacion.tarifa || ''}
            onChange={onTarifaChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            fullWidth
          />

          <TextField
            label="Comisión Movilidad 2A"
            type="number"
            value={cotizacion.comision || ''}
            onChange={onComisionChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            fullWidth
          />

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Total a cobrar:
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {formatCurrency(cotizacion.total)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CotizacionResumen;
