import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import OficioComision from "../pages/usuario/OficioComision";
import NuevoOficio from "../pages/usuario/NuevoOficio";
import BitacoraPasajes from "../pages/usuario/BitacoraPasajes";
import NuevoBitacoraPasajes from "../pages/usuario/NuevoBitacoraPasajes";
import Evidencias from "../pages/usuario/Evidencias";
import Perfil from "../pages/Perfil";

import AdminRoutes from "./AdminRoutes";
import PrivateRoute from "./PrivateRoute";

// ...dentro de tus <Routes>


function AppRoutes() {

  return (


    <Routes>

      {/* ========================= */}
      {/* LOGIN */}
      {/* ========================= */}

      <Route
        path="/"
        element={<Login />}
      />


      {/* ========================= */}
      {/* DASHBOARD */}
      {/* ========================= */}

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />


      {/* ========================= */}
      {/* CAPTURISTA */}
      {/* ========================= */}

      <Route
        path="/usuario/oficio-comision"
        element={
          <PrivateRoute>
            <OficioComision />
          </PrivateRoute>
        }
      />


      <Route
        path="/usuario/oficio-comision/nuevo"
        element={
          <PrivateRoute>
            <NuevoOficio />
          </PrivateRoute>
        }
      />

      <Route 
        path="/usuario/oficio-comision/editar/:id" 
        element={
          <PrivateRoute>
            <NuevoOficio />
          </PrivateRoute>
        } 
          
      />

      <Route
        path="/usuario/bitacora-pasajes"
        element={
          <PrivateRoute>
            <BitacoraPasajes />
          </PrivateRoute>
        }
      />

      <Route
        path="/usuario/bitacora-pasajes/nuevo"
        element={
          <PrivateRoute>
            <NuevoBitacoraPasajes />
          </PrivateRoute>
        }
      />

      <Route
        path="/usuario/evidencias"
        element={
          <PrivateRoute>
            <Evidencias />
          </PrivateRoute>
        }
      />


      <Route
        path="/usuario/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />


      {/* ========================= */}
      {/* ADMINISTRADOR */}
      {/* ========================= */}

      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <AdminRoutes />
          </PrivateRoute>
        }
      />


      {/* ========================= */}
      {/* RUTA DESCONOCIDA */}
      {/* ========================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>

  );

}


export default AppRoutes;