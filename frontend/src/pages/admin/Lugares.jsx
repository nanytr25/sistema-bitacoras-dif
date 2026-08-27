import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, MapPin, CheckCircle2, Pencil, Trash2, ChevronLeft, ChevronRight, Building2,} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

const API_URL = "http://127.0.0.1:8000/api";
const POR_PAGINA = 5;

const CATEGORIAS = ["Oficina", "Sede", "Centro", "Módulo"];

const FORM_INICIAL = {
  nombre: "",
  ubicacion: "",
  categoria: "",
};

function Lugares() {
  const navigate = useNavigate();

  const [lugares, setLugares] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [procesando, setProcesando] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  const obtenerLugares = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/lugares/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudieron obtener los lugares.");

      const data = await response.json();
      const registros = Array.isArray(data) ? data : data.results || [];
      setLugares(registros);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los lugares.");
      setLugares([]);
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
    obtenerLugares();
  }, []);
  const registrarOEditarLugar = async () => {
    if (!form.nombre || !form.ubicacion || !form.categoria) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const token = localStorage.getItem("token");
      const url = editandoId
        ? `${API_URL}/lugares/${editandoId}/`
        : `${API_URL}/lugares/`;
      const method = editandoId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo procesar la solicitud.");

      cancelarFormulario();
      await obtenerLugares();
    } catch (error) {
      console.error(error);
      setError(
        editandoId
          ? "No se pudo actualizar el lugar."
          : "No se pudo registrar el lugar."
      );
    } finally {
      setGuardando(false);
    }
  };

  const cancelarFormulario = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const editarLugar = (lugar) => {
    setEditandoId(lugar.id_lugar);
    setForm({
      nombre: lugar.nombre,
      ubicacion: lugar.ubicacion,
      categoria: lugar.categoria !== "-" ? lugar.categoria : "",
    });
    setMostrarFormulario(true);
  };

  const eliminarLugar = async (lugar) => {
    if (!window.confirm(`¿Eliminar el lugar "${lugar.nombre}"?`)) return;

    try {
      setProcesando(lugar.id_lugar);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/lugares/${lugar.id_lugar}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo eliminar el lugar.");

      await obtenerLugares();
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar el lugar.");
    } finally {
      setProcesando(null);
    }
  };

  // NORMALIZAR CAMPOS
  const lugaresNormalizados = lugares.map((l) => ({
    id_lugar: l.id_lugar || l.id,
    nombre: l.nombre || l.nombre_lugar || "-",
    ubicacion: l.ubicacion || l.direccion || l.referencia || "-",
    categoria: l.categoria || l.tipo || "-",
    fecha_actualizacion: l.fecha_actualizacion || l.updated_at || null,
  }));

  // FILTRO POR BÚSQUEDA
  const lugaresFiltrados = lugaresNormalizados.filter((l) => {
    const texto = busqueda.toLowerCase();
    return (
      l.nombre.toLowerCase().includes(texto) ||
      l.ubicacion.toLowerCase().includes(texto)
    );
  });

  // ESTADÍSTICAS
  const totalLugares = lugaresNormalizados.length;
  const ahora = new Date();
  const actualizadosEsteMes = lugaresNormalizados.filter((l) => {
    if (!l.fecha_actualizacion) return false;
    const fecha = new Date(l.fecha_actualizacion);
    if (Number.isNaN(fecha.getTime())) return false;
    return (
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  }).length;

  // PAGINACIÓN
  const totalPaginas = Math.max(
    1,
    Math.ceil(lugaresFiltrados.length / POR_PAGINA)
  );
  const inicio = (pagina - 1) * POR_PAGINA;
  const lugaresPagina = lugaresFiltrados.slice(inicio, inicio + POR_PAGINA);

  const irPagina = (n) => {
    if (n < 1 || n > totalPaginas) return;
    setPagina(n);
  };

  const badgeCategoria = (categoria) => {
    const estilos = {
      Oficina: "bg-blue-50 border-blue-200 text-blue-600",
      Sede: "bg-indigo-50 border-indigo-200 text-indigo-600",
      Centro: "bg-cyan-50 border-cyan-200 text-cyan-600",
      Módulo: "bg-orange-50 border-orange-200 text-orange-600",
    };
    const clase =
      estilos[categoria] || "bg-gray-50 border-gray-200 text-gray-600";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-medium ${clase}`}
      >
        {categoria}
      </span>
    );
  };

  return (
    <AdminLayout>
      {/* ENCABEZADO */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestionar Lugares</h1>
          <p className="text-xs text-gray-400 mt-1">
            Administre las ubicaciones y destinos frecuentes para los reportes de comisión.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (mostrarFormulario) {
              cancelarFormulario();
            } else {
              setMostrarFormulario(true);
            }
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <LogOut size={14} />
          {mostrarFormulario ? "Cerrar Registro" : "Registrar Nuevo Lugar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Total de Lugares
            </p>
            <p className="text-2xl font-bold text-gray-800">{totalLugares}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Actualizados este Mes
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {actualizadosEsteMes}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO / EDICIÓN */}
      {mostrarFormulario && (
        <section className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {editandoId ? "Editar Lugar" : "Registro de Nuevo Lugar"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Capture la información del sitio o destino frecuente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nombre del Lugar <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <Building2 size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ej. SEDIF Tlaxcala"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="text-xs outline-none w-full text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <MapPin size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ej. Calle Morelos #5, Tlaxcala Centro"
                  value={form.ubicacion}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion: e.target.value })
                  }
                  className="text-xs outline-none w-full text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Categoría <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-2.5 bg-white">
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  className="text-xs outline-none w-full text-gray-700 bg-transparent"
                >
                  <option value="">Seleccione una categoría...</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
              onClick={registrarOEditarLugar}
              className="px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : editandoId
                ? "Guardar Cambios"
                : "Registrar Lugar"}
            </button>
          </div>
        </section>
      )}

      {/* TABLA DE LUGARES */}
      <section className="w-full h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Listado de Ubicaciones
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Catálogo de lugares disponibles para los oficios.
              </p>
            </div>
          </div>

          <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-white">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre o referencia..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              className="text-xs outline-none w-56 text-gray-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">Cargando lugares...</p>
            </div>
          ) : lugaresPagina.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">
                No hay lugares que coincidan con la búsqueda.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f8f8] border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">
                    Nombre del Lugar
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {lugaresPagina.map((lugar) => (
                  <tr
                    key={lugar.id_lugar}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-3">
                      <p className="text-[11px] font-medium text-gray-700">
                        {lugar.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ID: {lugar.id_lugar}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 italic">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        {lugar.ubicacion}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {badgeCategoria(lugar.categoria)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Editar"
                          onClick={() => editarLugar(lugar)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          title="Eliminar"
                          disabled={procesando === lugar.id_lugar}
                          onClick={() => eliminarLugar(lugar)}
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
              {lugaresFiltrados.length > 0
                ? `${inicio + 1}-${Math.min(
                    inicio + POR_PAGINA,
                    lugaresFiltrados.length
                  )}`
                : "0"}
            </b>{" "}
            de <b>{lugaresFiltrados.length}</b> registros
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
                  n === pagina
                    ? "bg-blue-500 text-white"
                    : "border border-gray-200 text-gray-500 hover:bg-gray-50"
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
    </AdminLayout>
  );
}

export default Lugares;