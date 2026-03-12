import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  MobileStepper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import {
  selectActiveStep,
  selectSteps,
  selectEsFlujoSoat,
  selectClienteSeleccionado,
  selectModoCliente,
  selectNuevoCliente,
  selectTipoTramite,
  selectTipoVehiculo,
  selectMetodoConsulta,
  setActiveStep,
  resetCotizador,
} from '../../store/cotizadorStore/cotizadorSlice';
import { selectPlaca, resetStore as resetRuntStore } from '../../store/apisExternasStore/apisExternasRuntStore';

import Step1_Cliente from './steps/Step1_Cliente';
import Step2_TipoTramite from './steps/Step2_TipoTramite';
import Step3_TipoVehiculo from './steps/Step3_TipoVehiculo';
import Step4_MetodoConsulta from './steps/Step4_MetodoConsulta';
import Step5_DatosVehiculo from './steps/Step5_DatosVehiculo';
import Step6_Cotizacion from './steps/Step6_Cotizacion';

const CotizadorPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const activeStep = useSelector(selectActiveStep);
  const steps = useSelector(selectSteps);
  const esFlujoSoat = useSelector(selectEsFlujoSoat);
  const clienteSeleccionado = useSelector(selectClienteSeleccionado);
  const modoCliente = useSelector(selectModoCliente);
  const nuevoCliente = useSelector(selectNuevoCliente);
  const tipoTramite = useSelector(selectTipoTramite);
  const tipoVehiculo = useSelector(selectTipoVehiculo);
  const metodoConsulta = useSelector(selectMetodoConsulta);
  const runtPlaca = useSelector(selectPlaca);

  // Resetear todo al desmontar (cambio de módulo)
  useEffect(() => {
    return () => {
      dispatch(resetCotizador());
      dispatch(resetRuntStore());
    };
  }, [dispatch]);

  /**
   * Validar si el step actual permite avanzar
   */
  const canAdvance = useCallback(() => {
    if (esFlujoSoat) {
      switch (activeStep) {
        case 0: // Cliente
          if (modoCliente === 'seleccionado' && clienteSeleccionado) return true;
          if (modoCliente === 'nuevo' && nuevoCliente.nombre && nuevoCliente.telefono && nuevoCliente.documento) return true;
          return false;
        case 1: // Tipo trámite
          return !!tipoTramite;
        case 2: // Tipo vehículo
          return !!tipoVehiculo;
        case 3: // Método consulta
          return !!metodoConsulta;
        case 4: // Datos vehículo
          return !!runtPlaca;
        case 5: // Cotización
          return true;
        default:
          return false;
      }
    } else {
      switch (activeStep) {
        case 0: // Cliente
          if (modoCliente === 'seleccionado' && clienteSeleccionado) return true;
          if (modoCliente === 'nuevo' && nuevoCliente.nombre && nuevoCliente.telefono && nuevoCliente.documento) return true;
          return false;
        case 1: // Tipo trámite
          return !!tipoTramite;
        case 2: // Cotización
          return true;
        default:
          return false;
      }
    }
  }, [activeStep, esFlujoSoat, clienteSeleccionado, modoCliente, nuevoCliente, tipoTramite, tipoVehiculo, metodoConsulta, runtPlaca]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      dispatch(setActiveStep(activeStep + 1));
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      dispatch(setActiveStep(activeStep - 1));
    }
  };

  const handleReset = () => {
    dispatch(resetCotizador());
    dispatch(resetRuntStore());
  };

  /**
   * Renderizar el step actual
   */
  const renderStep = () => {
    if (esFlujoSoat) {
      switch (activeStep) {
        case 0: return <Step1_Cliente />;
        case 1: return <Step2_TipoTramite />;
        case 2: return <Step3_TipoVehiculo />;
        case 3: return <Step4_MetodoConsulta />;
        case 4: return <Step5_DatosVehiculo />;
        case 5: return <Step6_Cotizacion onReset={handleReset} />;
        default: return null;
      }
    } else {
      switch (activeStep) {
        case 0: return <Step1_Cliente />;
        case 1: return <Step2_TipoTramite />;
        case 2: return <Step6_Cotizacion onReset={handleReset} />;
        default: return null;
      }
    }
  };

  const isLastStep = activeStep === steps.length - 1;

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
            Cotizador
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Genera cotizaciones de trámites para tus clientes
          </Typography>
        </Box>
        <Button variant="outlined" onClick={handleReset}>
          Nueva cotización
        </Button>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        {isMobile ? (
          <MobileStepper
            variant="dots"
            steps={steps.length}
            position="static"
            activeStep={activeStep}
            sx={{ background: 'transparent', p: 0, mb: 1 }}
            nextButton={<Typography variant="caption" color="text.secondary">{steps[activeStep]}</Typography>}
            backButton={<Typography variant="caption" color="text.secondary">Paso {activeStep + 1}/{steps.length}</Typography>}
          />
        ) : (
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>

      {/* Step Content */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, minHeight: 300 }}>
        {renderStep()}
      </Paper>

      {/* Navigation Buttons */}
      {!isLastStep && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Anterior
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={!canAdvance()}
          >
            Siguiente
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CotizadorPage;
