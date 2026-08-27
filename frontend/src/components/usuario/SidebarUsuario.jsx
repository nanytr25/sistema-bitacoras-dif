import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText, ClipboardList, Image, UserCircle, ChevronDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function SidebarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);

  const activo = (ruta) => location.pathname === ruta;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.replace("/");
  };


  const obtenerPerfil = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/perfil/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      setUsuario(data);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    }
  };
  useEffect(() => {
    obtenerPerfil();
  }, []);

  const menuItems = [
    { to: "/usuario/oficio-comision", label: "Oficio Comisión", icon: FileText },
    { to: "/usuario/bitacora-pasajes", label: "Bitácora pasajes", icon: ClipboardList },
    { to: "/usuario/evidencias", label: "Fotos", icon: Image },
  ];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* MENU — con scroll propio si crece, sin invadir footer */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-4 space-y-2">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition ${
              activo(to) ? "bg-[#edf4ff] text-[#3b82f6]" : "text-gray-600 hover:bg-gray-100"
            }`}style={{ marginTop: "30px" }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* SECCIÓN USUARIO (SIEMPRE AL FONDO, FUERA DEL SCROLL) */}
      <div className="shrink-0 p-4 border-t border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => navigate("/usuario/perfil")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-100 rounded-lg p-1.5 transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <UserCircle size={32} className="text-gray-400 shrink-0" />
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {usuario?.nombre || usuario?.username || "Usuario"}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {usuario?.email || usuario?.correo || ""}
              </p>
            </div>
          </div>
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default SidebarUsuario;