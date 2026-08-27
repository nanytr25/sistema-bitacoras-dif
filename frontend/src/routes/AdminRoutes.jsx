import { Routes, Route } from "react-router-dom";

import Usuarios from "../pages/admin/Usuarios";
import AprobacionesOficios from "../pages/admin/AprobacionesOficios";
import EvidenciaReportes from "../pages/admin/EvidenciaReportes";
import ReportesPasaje from "../pages/admin/ReportesPasaje";
import Lugares from "../pages/admin/Lugares";
import Perfil from "../pages/Perfil";
import AdminLayout from "../layouts/AdminLayout";

import PrivateRoute from "./PrivateRoute";

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="usuarios"
        element={
          <PrivateRoute>
            <Usuarios />
          </PrivateRoute>
        }
      />

      <Route
        path="aprobaciones-oficios"
        element={
          <PrivateRoute>
            <AprobacionesOficios />
          </PrivateRoute>
        }
      />

      <Route
        path="evidencia-reportes"
        element={
          <PrivateRoute>
            <EvidenciaReportes />
          </PrivateRoute>
        }
      />

      <Route
        path="reportes-pasaje"
        element={
          <PrivateRoute>
            <ReportesPasaje />
          </PrivateRoute>
        }
      />

      <Route
        path="lugares"
        element={
          <PrivateRoute>
            <Lugares />
          </PrivateRoute>
        }
      />

      <Route
        path="perfil"
        element={
          <PrivateRoute>
            <Perfil Layout={AdminLayout} />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default AdminRoutes;