import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
function Dashboard() {
  const navigate = useNavigate();



  const verificarYRedirigir = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/perfil/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
        return;
      }

      if (!response.ok) throw new Error("No se pudo obtener el perfil.");

      const data = await response.json();

      // Normalizar roles
      const roles = (data.roles || []).map((r) =>
        (typeof r === "string" ? r : r.nombre || r.name || "").toLowerCase()
      );

      // Evaluación por rol o por nombre de usuario admin
      const esAdmin =
        roles.some((r) => r.includes("admin") || r.includes("administrador")) ||
        data.username === "admin";
      const esCapturista = roles.some((r) => r.includes("capturista"));

      if (esAdmin) {
        navigate("/admin/aprobaciones-oficios", { replace: true });
      } else if (esCapturista) {
        navigate("/usuario/oficio-comision", { replace: true });
      } else {
        // Opción por defecto si entra un usuario sin rol asignado
        navigate("/usuario/oficio-comision", { replace: true });
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    verificarYRedirigir();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Redirigiendo a tu panel...</p>
      </div>
    </div>
  );
}

export default Dashboard;