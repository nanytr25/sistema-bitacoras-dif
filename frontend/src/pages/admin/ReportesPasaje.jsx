import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

const API_URL = "http://127.0.0.1:8000/api";
const POR_PAGINA = 6;

function ReportesPasaje() {
  const navigate = useNavigate();

  const [bitacoras, setBitacoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerBitacoras();
  }, []);

  const obtenerBitacoras = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/bitacoras-pasajes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudieron obtener los reportes.");

      const data = await response.json();
      const registros = Array.isArray(data) ? data : data.results || [];
      setBitacoras(registros);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las bitácoras de pasaje.");
      setBitacoras([]);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (item, nuevoEstado) => {
    try {
      setProcesando(item.id_bitacora);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/bitacoras-pasajes/${item.id_bitacora}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo actualizar el estado del registro.");

      await obtenerBitacoras();
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el estado de la bitácora.");
    } finally {
      setProcesando(null);
    }
  };

  // NORMALIZAR CAMPOS (usando los nombres reales del BitacoraPasajeSerializer)
  const bitacorasNormalizadas = bitacoras.map((b) => ({
    id_bitacora: b.id_bitacora || b.id,
    fecha: b.fecha || "-",
    solicitante: b.persona_gasto || "-",
    lugar: b.destino_nombre || "-",
    total:
      b.total !== null && b.total !== undefined ? `$${Number(b.total).toFixed(2)}` : "$0.00",
    estado: b.estado || "Pendiente",
  }));

  // FILTRO POR BÚSQUEDA
  const bitacorasFiltradas = bitacorasNormalizadas.filter((b) => {
    const texto = busqueda.toLowerCase();
    return (
      b.solicitante.toLowerCase().includes(texto) ||
      b.lugar.toLowerCase().includes(texto)
    );
  });

  // ESTADÍSTICAS
  const total = bitacorasNormalizadas.length;
  const pendientes = bitacorasNormalizadas.filter((b) => b.estado === "Pendiente").length;
  const aprobados = bitacorasNormalizadas.filter((b) => b.estado === "Aprobado").length;
  const rechazados = bitacorasNormalizadas.filter((b) => b.estado === "Rechazado").length;

  // PAGINACIÓN
  const totalPaginas = Math.max(1, Math.ceil(bitacorasFiltradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const bitacorasPagina = bitacorasFiltradas.slice(inicio, inicio + POR_PAGINA);

  const irPagina = (n) => {
    if (n < 1 || n > totalPaginas) return;
    setPagina(n);
  };

  const badgeEstado = (estado) => {
    switch (estado) {
      case "Aprobado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-[11px] font-medium">
            <CheckCircle2 size={12} /> Aprobado
          </span>
        );
      case "Rechazado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-500 text-[11px] font-medium">
            <XCircle size={12} /> Rechazado
          </span>
        );
      case "Observado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-medium">
            <AlertCircle size={12} /> Observado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 text-[11px] font-medium">
            <Clock3 size={12} /> Pendiente
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      {/* ENCABEZADO */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Revisión de Bitácoras de Pasaje</h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total</p>
            <p className="text-2xl font-bold text-gray-800">{total}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-blue-500" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Pendientes</p>
            <p className="text-2xl font-bold text-gray-800">{pendientes}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-cyan-400" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Aprobados</p>
            <p className="text-2xl font-bold text-gray-800">{aprobados}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-green-500" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Rechazados</p>
            <p className="text-2xl font-bold text-gray-800">{rechazados}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-red-500" />
        </div>
      </div>

      {/* TABLA */}
      <section className="w-full h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* HEADER TABLA */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Bitácoras de Pasaje</h2>
              <p className="text-xs text-gray-400 mt-0.5">Listado detallado para validación administrativa</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-white">
              <Search size={14} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filtrar por solicitante o lugar..."
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
              <p className="text-sm text-gray-500">Cargando bitácoras de pasaje...</p>
            </div>
          ) : bitacorasPagina.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">No hay bitácoras que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f8f8] border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Fecha</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Solicitante</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Lugar</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Total</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {bitacorasPagina.map((item) => (
                  <tr key={item.id_bitacora} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-[11px] text-gray-600">{item.fecha}</td>
                    <td className="px-6 py-3 text-[11px] font-medium text-gray-700">{item.solicitante}</td>
                    <td className="px-6 py-3 text-[11px] text-gray-600">{item.lugar}</td>
                    <td className="px-6 py-3 text-[11px] font-semibold text-gray-700">{item.total}</td>
                    <td className="px-6 py-3">{badgeEstado(item.estado)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Aprobar"
                          disabled={procesando === item.id_bitacora}
                          onClick={() => cambiarEstado(item, "Aprobado")}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-green-50 hover:text-green-500 flex items-center justify-center text-gray-500 transition disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                        </button>

                        <button
                          title="Rechazar"
                          disabled={procesando === item.id_bitacora}
                          onClick={() => cambiarEstado(item, "Rechazado")}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 transition disabled:opacity-50"
                        >
                          <XCircle size={13} />
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
              {bitacorasFiltradas.length > 0
                ? `${inicio + 1}-${Math.min(inicio + POR_PAGINA, bitacorasFiltradas.length)}`
                : "0"}
            </b>{" "}
            de <b>{bitacorasFiltradas.length}</b> registros
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
    </AdminLayout>
  );
}

export default ReportesPasaje;