import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';
import SessionManager from '../components/auth/SessionManager';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES } from '../utils/constants';

// Lazy load pages
const Dashboard       = lazy(() => import('../pages/Dashboard'));
const Usuarios        = lazy(() => import('../pages/Usuarios'));
const Clientes        = lazy(() => import('../pages/Clientes'));
const Etiquetas       = lazy(() => import('../pages/Etiquetas'));
const Login           = lazy(() => import('../pages/Login'));
const Configuraciones = lazy(() => import('../pages/Configuraciones/Configuraciones'));
const Tarjetas        = lazy(() => import('../pages/Tarjetas'));
const RecepcionPagos  = lazy(() => import('../pages/RecepcionPagos'));
const Devoluciones     = lazy(() => import('../pages/Devoluciones'));
const CargosNoRegistrados = lazy(() => import('../pages/CargosNoRegistrados'));
const AjusteSaldo     = lazy(() => import('../pages/AjusteSaldo'));
const Gastos          = lazy(() => import('../pages/Gastos'));

// Placeholder pages for routes that are not yet implemented
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: 24 }}>
    <h1>{title}</h1>
    <p>Esta página está en desarrollo.</p>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      {/* Gestor de sesión - verifica expiración del token */}
      <SessionManager />

      <Suspense fallback={<LoadingSpinner fullScreen message="Cargando..." />}>
        <Routes>
          {/* Public routes - Solo accesibles sin autenticación */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes - Requieren autenticación */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inspecciones" element={<PlaceholderPage title="Inspecciones" />} />
            <Route path="usuarios" element={<Usuarios />} />
            
            <Route path="clientes"        element={<Clientes />} />
            <Route path="etiquetas"       element={<Etiquetas />} />
            <Route path="tarjetas"        element={<Tarjetas />} />
            <Route path="recepcion-pagos" element={<RecepcionPagos />} />
            <Route path="devoluciones"    element={<Devoluciones />} />
            <Route path="cargos-no-registrados" element={<CargosNoRegistrados />} />
            <Route path="ajuste-saldo"    element={<AjusteSaldo />} />
            <Route path="gastos"          element={<Gastos />} />

            <Route path="reportes" element={<PlaceholderPage title="Reportes" />} />  
            <Route path="configuracion" element={<Configuraciones />} />
            <Route path="profile" element={<PlaceholderPage title="Mi Perfil" />} />
          </Route>

          {/* Catch all - Redirigir a dashboard o login según autenticación */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
