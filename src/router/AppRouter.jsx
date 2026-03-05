import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ProtectedModule from '../components/auth/ProtectedModule';
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
const TarifarioSoat   = lazy(() => import('../pages/TarifarioSoat'));

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
            <Route path="dashboard" element={<ProtectedModule moduleCode="dashboard"><Dashboard /></ProtectedModule>} />
            <Route path="inspecciones" element={<ProtectedModule moduleCode="inspecciones"><PlaceholderPage title="Inspecciones" /></ProtectedModule>} />
            <Route path="usuarios" element={<ProtectedModule moduleCode="usuarios"><Usuarios /></ProtectedModule>} />

            <Route path="clientes"        element={<ProtectedModule moduleCode="clientes"><Clientes /></ProtectedModule>} />
            <Route path="etiquetas"       element={<ProtectedModule moduleCode="etiquetas"><Etiquetas /></ProtectedModule>} />
            <Route path="tarjetas"        element={<ProtectedModule moduleCode="tarjetas"><Tarjetas /></ProtectedModule>} />
            <Route path="recepcion-pagos" element={<ProtectedModule moduleCode="recepcion_pagos"><RecepcionPagos /></ProtectedModule>} />
            <Route path="devoluciones"    element={<ProtectedModule moduleCode="devoluciones"><Devoluciones /></ProtectedModule>} />
            <Route path="cargos-no-registrados" element={<ProtectedModule moduleCode="cargos_no_registrados"><CargosNoRegistrados /></ProtectedModule>} />
            <Route path="ajuste-saldo"    element={<ProtectedModule moduleCode="ajuste_saldo"><AjusteSaldo /></ProtectedModule>} />
            <Route path="gastos"          element={<ProtectedModule moduleCode="gastos"><Gastos /></ProtectedModule>} />
            <Route path="tarifario-soat"  element={<ProtectedModule moduleCode="tarifario_soat"><TarifarioSoat /></ProtectedModule>} />

            <Route path="reportes" element={<ProtectedModule moduleCode="reportes"><PlaceholderPage title="Reportes" /></ProtectedModule>} />
            <Route path="configuracion" element={<ProtectedModule moduleCode="configuracion"><Configuraciones /></ProtectedModule>} />
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
