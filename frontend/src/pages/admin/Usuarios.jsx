import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, UserPlus, User, Mail, AtSign, ShieldCheck, Pencil, Power, Trash2, ChevronLeft, ChevronRight, Users, LogOut, KeyRound, Copy, Check, X,} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL;
const POR_PAGINA = 5;

const ROLES = ["Administrador", "Capturista"];

const FORM_INICIAL = {
  nombre_completo: "",
  correo: "",
  username: "",
  cargo: "",
  rol: "",
  activo: true,
};

// GENERA UNA CONTRASEÑA TEMPORAL SEGURA (mayúsculas, minúsculas, números y símbolo)
const generarContrasena = (longitud = 12) => {
  const mayusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const minusculas = "abcdefghijkmnpqrstuvwxyz";
  const numeros = "23456789";
  const simbolos = "!@#$%&*";
  const todos = mayusculas + minusculas + numeros + simbolos;

  let password =
    mayusculas[Math.floor(Math.random() * mayusculas.length)] +
    minusculas[Math.floor(Math.random() * minusculas.length)] +
    numeros[Math.floor(Math.random() * numeros.length)] +
    simbolos[Math.floor(Math.random() * simbolos.length)];

  for (let i = password.length; i < longitud; i++) {
    password += todos[Math.floor(Math.random() * todos.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [procesando, setProcesando] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  // MODO EDICIÓN: null = registrando nuevo, id_usuario = editando ese usuario
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);

  // MODAL DE CONTRASEÑA GENERADA (se muestra una sola vez tras registrar)
  const [contrasenaGenerada, setContrasenaGenerada] = useState(null);
  const [nombreNuevoUsuario, setNombreNuevoUsuario] = useState("");
  const [copiado, setCopiado] = useState(false);

  const obtenerUsuarios = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/usuarios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudieron obtener los usuarios.");

      const data = await response.json();
      const registros = Array.isArray(data) ? data : data.results || [];
      setUsuarios(registros);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los usuarios.");
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerUsuarios();
  }, []);
  const guardarUsuario = async () => {
    if (!form.nombre_completo || !form.correo || !form.username || !form.cargo || !form.rol) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    const editando = Boolean(usuarioEditandoId);

    try {
      setGuardando(true);
      setError("");

      const token = localStorage.getItem("token");

      let response;
      let passwordTemporal = null;

      if (editando) {
        response = await fetch(`${API_URL}/usuarios/${usuarioEditandoId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nombre_completo: form.nombre_completo,
            correo: form.correo,
            cargo: form.cargo,
            rol: form.rol,
            activo: form.activo,
          }),
        });
      } else {
        passwordTemporal = generarContrasena();
        response = await fetch(`${API_URL}/usuarios/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form, password: passwordTemporal }),
        });
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(editando ? "No se pudo actualizar el usuario." : "No se pudo registrar el usuario.");
      }

      const nombreGuardado = form.nombre_completo;

      setForm(FORM_INICIAL);
      setUsuarioEditandoId(null);
      setMostrarFormulario(false);
      await obtenerUsuarios();

      if (!editando) {
        setNombreNuevoUsuario(nombreGuardado);
        setContrasenaGenerada(passwordTemporal);
        setCopiado(false);
      }
    } catch (error) {
      console.error(error);
      setError(editando ? "No se pudo actualizar el usuario." : "No se pudo registrar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarFormulario = () => {
    setForm(FORM_INICIAL);
    setUsuarioEditandoId(null);
    setError("");
    setMostrarFormulario(false);
  };

  const copiarContrasena = async () => {
    try {
      await navigator.clipboard.writeText(contrasenaGenerada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const cerrarModalPassword = () => {
    setContrasenaGenerada(null);
    setNombreNuevoUsuario("");
    setCopiado(false);
  };

  const cambiarEstado = async (usuario) => {
    try {
      setProcesando(usuario.id_usuario);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/usuarios/${usuario.id_usuario}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activo: !usuario.activo }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo actualizar el estado del usuario.");

      await obtenerUsuarios();
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el estado del usuario.");
    } finally {
      setProcesando(null);
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (!window.confirm(`¿Eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      setProcesando(usuario.id_usuario);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/usuarios/${usuario.id_usuario}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo eliminar el usuario.");

      await obtenerUsuarios();
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar el usuario.");
    } finally {
      setProcesando(null);
    }
  };

  const editarUsuario = (usuario) => {
    setForm({
      nombre_completo: usuario.nombre || "",
      correo: usuario.correo || "",
      username: usuario.username || "",
      cargo: usuario.cargo || "",
      rol: usuario.rol || "",
      activo: usuario.activo,
    });
    setUsuarioEditandoId(usuario.id_usuario);
    setError("");
    setMostrarFormulario(true);
  };

  // NORMALIZAR CAMPOS (con fallbacks según variantes del backend)
  const usuariosNormalizados = usuarios.map((u) => ({
    id_usuario: u.id_usuario || u.id,
    nombre: u.nombre_completo || u.nombre || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "-",
    username: u.username || u.usuario || "-",
    correo: u.correo || u.email || "-",
    cargo: u.cargo || "",
    rol: u.rol || u.perfil || u.rol_asignado || "-",
    activo: u.activo !== undefined ? u.activo : u.estado === "Activo",
  }));

  // FILTRO POR BÚSQUEDA
  const usuariosFiltrados = usuariosNormalizados.filter((u) => {
    const texto = busqueda.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(texto) ||
      u.username.toLowerCase().includes(texto) ||
      u.correo.toLowerCase().includes(texto)
    );
  });

  // ESTADÍSTICAS
  const totalUsuarios = usuariosNormalizados.length;
  const activos = usuariosNormalizados.filter((u) => u.activo).length;
  const inactivos = usuariosNormalizados.filter((u) => !u.activo).length;

  // PAGINACIÓN
  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const usuariosPagina = usuariosFiltrados.slice(inicio, inicio + POR_PAGINA);

  const irPagina = (n) => {
    if (n < 1 || n > totalPaginas) return;
    setPagina(n);
  };

  const inicialesDe = (nombre) =>
    nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const badgeEstado = (activo) =>
    activo ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Activo
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactivo
      </span>
    );

  const badgeRol = (rol) => {
    const estilos = {
      Administrador: "bg-indigo-50 border-indigo-200 text-indigo-600",
      Revisor: "bg-blue-50 border-blue-200 text-blue-600",
      Capturista: "bg-cyan-50 border-cyan-200 text-cyan-600",
      Auditor: "bg-orange-50 border-orange-200 text-orange-600",
    };
    const clase = estilos[rol] || "bg-gray-50 border-gray-200 text-gray-600";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-medium ${clase}`}>
        {rol}
      </span>
    );
  };

  const editando = Boolean(usuarioEditandoId);

  return (
    <AdminLayout>
      {/* ENCABEZADO */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administración de Usuarios</h1>
          <p className="text-xs text-gray-400 mt-1">
            Gestione las cuentas institucionales, perfiles de acceso y estados de conexión del personal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (mostrarFormulario) {
              cancelarFormulario();
            } else {
              setForm(FORM_INICIAL);
              setUsuarioEditandoId(null);
              setMostrarFormulario(true);
            }
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <LogOut size={14} />
          {mostrarFormulario ? "Cerrar Registro" : "Nuevo Registro"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Registros</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{totalUsuarios}</p>
            <div className="grid grid-cols-3 gap-0.5 mt-2 w-fit">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-gray-300" />
              ))}
            </div>
          </div>
          <div className="w-1 h-10 rounded-full bg-gray-300" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Activos</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{activos}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-green-500" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Inactivos</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{inactivos}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-red-500" />
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO / EDICIÓN */}
      {mostrarFormulario && (
        <section className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              {editando ? <Pencil size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {editando ? "Editar Cuenta" : "Registro de Nueva Cuenta"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {editando
                  ? "Actualiza los datos del usuario. El nombre de usuario no se puede modificar."
                  : "Asigne credenciales y roles para nuevos colaboradores del sistema. La contraseña se genera automáticamente al registrar."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <User size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez García"
                  value={form.nombre_completo}
                  onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                  className="text-xs outline-none w-full text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Correo Institucional <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <Mail size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="email"
                  placeholder="usuario@smdif.gob.mx"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  className="text-xs outline-none w-full text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nombre de Usuario <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex items-center border border-gray-200 rounded-md px-3 py-2.5 ${
                  editando ? "bg-gray-100" : "bg-white"
                }`}
              >
                <AtSign size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ej. jperez_adm"
                  value={form.username}
                  disabled={editando}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="text-xs outline-none w-full text-gray-700 bg-transparent disabled:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Cargo <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <ShieldCheck size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ej. Auxiliar administrativo"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  className="text-xs outline-none w-full text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Rol Asignado <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <ShieldCheck size={14} className="text-gray-400 mr-2 shrink-0" />
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="text-xs outline-none w-full text-gray-700 bg-transparent"
                >
                  <option value="">Seleccione un perfil...</option>
                  {ROLES.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-2.5 bg-white">
              <div>
                <p className="text-xs font-semibold text-gray-600">Estado de Activación</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  La cuenta tendrá acceso inmediato al sistema si se marca como activa.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className={`text-[10px] font-bold ${form.activo ? "text-green-600" : "text-gray-400"}`}>
                  {form.activo ? "ACTIVO" : "INACTIVO"}
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, activo: !form.activo })}
                  className={`w-10 h-5 rounded-full transition relative ${
                    form.activo ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      form.activo ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={cancelarFormulario}
              className="px-4 py-2.5 rounded-md text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={guardarUsuario}
              className="px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50"
            >
              {guardando ? "Guardando..." : editando ? "Guardar Cambios" : "Registrar Usuario"}
            </button>
          </div>
        </section>
      )}

      {/* TABLA */}
      <section className="w-full h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* HEADER TABLA */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Cuentas Registradas</h2>
              <p className="text-xs text-gray-400 mt-0.5">Directorio de personal con acceso autorizado.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-white">
              <Search size={14} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nombre o usuario..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                className="text-xs outline-none w-52 text-gray-700"
              />
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition"
            >
              <Filter size={14} />
              Filtrar
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">Cargando usuarios...</p>
            </div>
          ) : usuariosPagina.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">No hay usuarios que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f8f8] border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Nombre Completo</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Usuario / Login</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Correo Institucional</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Rol / Perfil</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosPagina.map((usuario) => (
                  <tr key={usuario.id_usuario} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {inicialesDe(usuario.nombre)}
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">{usuario.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[11px] text-gray-500">{usuario.username}</td>
                    <td className="px-6 py-3 text-[11px] text-gray-600">{usuario.correo}</td>
                    <td className="px-6 py-3">{badgeRol(usuario.rol)}</td>
                    <td className="px-6 py-3">{badgeEstado(usuario.activo)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Editar"
                          onClick={() => editarUsuario(usuario)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          title={usuario.activo ? "Desactivar" : "Activar"}
                          disabled={procesando === usuario.id_usuario}
                          onClick={() => cambiarEstado(usuario)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-green-50 hover:text-green-500 flex items-center justify-center text-gray-500 transition disabled:opacity-50"
                        >
                          <Power size={13} />
                        </button>

                        <button
                          title="Eliminar"
                          disabled={procesando === usuario.id_usuario}
                          onClick={() => eliminarUsuario(usuario)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 transition disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINACIÓN */}
        <div className="h-[66px] flex items-center justify-between px-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Mostrando{" "}
            <b>
              {usuariosFiltrados.length > 0
                ? `${inicio + 1}-${Math.min(inicio + POR_PAGINA, usuariosFiltrados.length)}`
                : "0"}
            </b>{" "}
            de <b>{usuariosFiltrados.length}</b> registros
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => irPagina(pagina - 1)}
              disabled={pagina === 1}
              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => irPagina(n)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition ${
                  n === pagina ? "bg-blue-500 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => irPagina(pagina + 1)}
              disabled={pagina === totalPaginas}
              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: CONTRASEÑA GENERADA (se muestra una sola vez) */}
      {contrasenaGenerada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              type="button"
              onClick={cerrarModalPassword}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Usuario registrado</h2>
                <p className="text-xs text-gray-400 mt-0.5">{nombreNuevoUsuario}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Se generó una contraseña temporal para este usuario. Cópiala y compártela de forma segura, ya
              que no se volverá a mostrar.
            </p>

            <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2.5 bg-gray-50 mb-4">
              <span className="text-sm font-mono font-semibold text-gray-800 tracking-wide">
                {contrasenaGenerada}
              </span>
              <button
                type="button"
                onClick={copiarContrasena}
                title="Copiar contraseña"
                className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
              >
                {copiado ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="mb-5 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg px-3 py-2.5 text-[11px]">
              Por seguridad, recomienda al usuario cambiar esta contraseña la primera vez que inicie sesión.
            </div>

            <button
              type="button"
              onClick={cerrarModalPassword}
              className="w-full px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
            >
              Entendido, cerrar
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Usuarios;