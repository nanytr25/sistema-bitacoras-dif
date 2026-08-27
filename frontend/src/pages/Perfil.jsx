import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, Mail, Briefcase, ShieldCheck, KeyRound, X, Eye, EyeOff } from "lucide-react";

import UsuarioLayout from "../layouts/UsuarioLayout";

const API_URL = "http://127.0.0.1:8000/api";

function Perfil({ Layout = UsuarioLayout }) {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // MODAL CAMBIAR CONTRASEÑA
  const [mostrarModal, setMostrarModal] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [mostrarPasswords, setMostrarPasswords] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [exitoPassword, setExitoPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/perfil/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo obtener el perfil.");

      const data = await response.json();
      setPerfil(data);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      setError("No se pudo cargar la información del perfil.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = () => {
    setPasswordActual("");
    setPasswordNueva("");
    setPasswordConfirmar("");
    setErrorPassword("");
    setExitoPassword("");
    setMostrarPasswords(false);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const cambiarPassword = async () => {
    setErrorPassword("");
    setExitoPassword("");

    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      setErrorPassword("Completa todos los campos.");
      return;
    }

    if (passwordNueva.length < 8) {
      setErrorPassword("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      setErrorPassword("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    try {
      setGuardandoPassword(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/perfil/cambiar-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          password_actual: passwordActual,
          password_nueva: passwordNueva,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "No se pudo actualizar la contraseña.");
      }

      setExitoPassword("Contraseña actualizada correctamente.");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmar("");
    } catch (error) {
      console.error(error);
      setErrorPassword(error.message || "No se pudo actualizar la contraseña.");
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (cargando) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Cargando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      <section className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="h-[76px] flex items-center justify-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">Mi Perfil</h1>
        </div>

        {/* CONTENIDO */}
        <div className="p-8 flex flex-col items-center">
          {/* FOTO */}
          <div className="w-28 h-28 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden mb-6">
            {perfil?.foto ? (
              <img src={perfil.foto} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={72} className="text-gray-300" />
            )}
          </div>

          {/* DATOS */}
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <UserCircle size={18} className="text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase">Nombre</p>
                <p className="text-sm text-gray-800 font-medium truncate">
                  {perfil?.nombre_completo || perfil?.username || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <Mail size={18} className="text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase">Correo</p>
                <p className="text-sm text-gray-800 font-medium truncate">
                  {perfil?.correo || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <Briefcase size={18} className="text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase">Cargo</p>
                <p className="text-sm text-gray-800 font-medium truncate">
                  {perfil?.cargo || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <ShieldCheck size={18} className="text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase">Rol</p>
                <p className="text-sm text-gray-800 font-medium truncate">
                  {perfil?.rol || "-"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirModal}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <KeyRound size={16} className="text-blue-500" />
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: CAMBIAR CONTRASEÑA */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              type="button"
              onClick={cerrarModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Cambiar Contraseña</h2>
                <p className="text-xs text-gray-400 mt-0.5">Actualiza tu contraseña de acceso.</p>
              </div>
            </div>

            {errorPassword && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-xs">
                {errorPassword}
              </div>
            )}

            {exitoPassword && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 rounded-lg px-3 py-2.5 text-xs">
                {exitoPassword}
              </div>
            )}

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña Actual</label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                  <input
                    type={mostrarPasswords ? "text" : "password"}
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    className="text-xs outline-none w-full text-gray-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nueva Contraseña</label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                  <input
                    type={mostrarPasswords ? "text" : "password"}
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    className="text-xs outline-none w-full text-gray-700"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmar Nueva Contraseña</label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                  <input
                    type={mostrarPasswords ? "text" : "password"}
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    className="text-xs outline-none w-full text-gray-700"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarPasswords((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-700 transition"
              >
                {mostrarPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                {mostrarPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2.5 rounded-md text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={guardandoPassword}
                onClick={cambiarPassword}
                className="px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50"
              >
                {guardandoPassword ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Perfil;