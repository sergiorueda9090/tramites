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
const GastosCategoria = lazy(() => import('../pages/GastosCategoria'));
const TarifarioSoat   = lazy(() => import('../pages/TarifarioSoat'));
const Cotizador       = lazy(() => import('../pages/Cotizador'));
const BaseDeDatos     = lazy(() => import('../pages/BaseDeDatos'));
const CasosEspeciales = lazy(() => import('../pages/CasosEspeciales'));
const Tramites        = lazy(() => import('../pages/Tramites'));
const TramitesFinalizados = lazy(() => import('../pages/FinalizadosTramites'));
const PasarelaDePago  = lazy(() => import('../pages/PasarelaDePago'));
const ApiApp          = lazy(() => import('../pages/ApiApp'));
const CuatroPorMil    = lazy(() => import('../pages/CuatroPorMil'));
const Utilidades      = lazy(() => import('../pages/Utilidades'));
const UtilidadOcasional = lazy(() => import('../pages/UtilidadOcasional'));
const ConmutadorIps   = lazy(() => import('../pages/ConmutadorIps'));
const PlanDeCuentas   = lazy(() => import('../pages/PlanDeCuotas'));
const SubCuentas      = lazy(() => import('../pages/subCuentas'));
const Proveedores     = lazy(() => import('../pages/Proveedores'));

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
            <Route path="gastos-categoria" element={<ProtectedModule moduleCode="gastos_categoria"><GastosCategoria /></ProtectedModule>} />
            <Route path="tarifario-soat"  element={<ProtectedModule moduleCode="tarifario_soat"><TarifarioSoat /></ProtectedModule>} />
            <Route path="cotizador"      element={<ProtectedModule moduleCode="cotizador"><Cotizador /></ProtectedModule>} />
            <Route path="base-de-datos"  element={<ProtectedModule moduleCode="base_de_datos"><BaseDeDatos /></ProtectedModule>} />
            <Route path="casos-especiales" element={<ProtectedModule moduleCode="casos_especiales"><CasosEspeciales /></ProtectedModule>} />
            <Route path="tramites" element={<ProtectedModule moduleCode="tramites"><Tramites /></ProtectedModule>} />
            <Route path="tramites-finalizados" element={<ProtectedModule moduleCode="finalizados_tramites"><TramitesFinalizados /></ProtectedModule>} />
            <Route path="pasarela-de-pago" element={<ProtectedModule moduleCode="pasarela_de_pago"><PasarelaDePago /></ProtectedModule>} />
            <Route path="api-endpoints" element={<ProtectedModule moduleCode="api_app"><ApiApp /></ProtectedModule>} />
            <Route path="cuatro-por-mil" element={<ProtectedModule moduleCode="cuatro_por_mil"><CuatroPorMil /></ProtectedModule>} />
            <Route path="utilidades"     element={<ProtectedModule moduleCode="utilidades"><Utilidades /></ProtectedModule>} />
            <Route path="utilidad-ocasional" element={<ProtectedModule moduleCode="utilidad_ocasional"><UtilidadOcasional /></ProtectedModule>} />
            <Route path="conmutador-ips" element={<ProtectedModule moduleCode="computador_ips"><ConmutadorIps /></ProtectedModule>} />
            <Route path="plan-de-cuentas" element={<ProtectedModule moduleCode="plan_de_cuentas"><PlanDeCuentas /></ProtectedModule>} />
            <Route path="sub-cuentas" element={<ProtectedModule moduleCode="sub_cuentas"><SubCuentas /></ProtectedModule>} />
            <Route path="proveedores" element={<ProtectedModule moduleCode="proveedores"><Proveedores /></ProtectedModule>} />

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
