import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  X,
  ImageOff,
  Images,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

const API_URL = "http://127.0.0.1:8000/api";
const POR_PAGINA = 6;

function EvidenciaReportes() {
  const navigate = useNavigate();

  // OFICIOS
  const [oficios, setOficios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  // EVIDENCIAS DEL OFICIO SELECCIONADO
  const [oficioSeleccionado, setOficioSeleccionado] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [cargandoFotos, setCargandoFotos] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerOficios();
  }, []);

  // OBTENER OFICIOS
  const obtenerOficios = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/oficios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudieron obtener los oficios.");

      const data = await response.json();
      const registros = Array.isArray(data) ? data : data.results || [];
      setOficios(registros);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los oficios.");
      setOficios([]);
    } finally {
      setCargando(false);
    }
  };

  // OBTENER EVIDENCIAS DE UN OFICIO
  const obtenerFotos = async (idOficio) => {
    try {
      setCargandoFotos(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/evidencias/?id_oficio=${idOficio}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudieron obtener las evidencias.");

      const data = await response.json();
      const registros = Array.isArray(data) ? data : data.results || [];
      setFotos(registros);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las evidencias.");
      setFotos([]);
    } finally {
      setCargandoFotos(false);
    }
  };

  const verEvidencias = (oficio) => {
    setOficioSeleccionado(oficio);
    setFotoAmpliada(null);
    obtenerFotos(oficio.id_oficio);
  };

  const volverAlListado = () => {
    setOficioSeleccionado(null);
    setFotos([]);
    setFotoAmpliada(null);
  };

  // DESCARGAR
  const descargarFoto = (foto) => {
    const link = document.createElement("a");
    link.href = foto.archivo;
    link.download = `evidencia-${foto.id_evidencia}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NORMALIZAR CAMPOS (con fallbacks según variantes del backend)
  const oficiosNormalizados = oficios.map((oficio) => ({
    id_oficio: oficio.id_oficio || oficio.id,
    folio: oficio.folio || `OC-${oficio.id_oficio || oficio.id}`,
    fecha: oficio.fecha || oficio.fecha_emision || "-",
    lugar:
      oficio.lugar ||
      oficio.nombre_lugar ||
      oficio.destino?.nombre_lugar ||
      oficio.id_lugar?.nombre_lugar ||
      "-",
    solicitante:
      oficio.solicitante ||
      oficio.nombre_comisionado ||
      oficio.comisionado?.nombre ||
      "-",
    total_evidencias: oficio.total_evidencias ?? oficio.evidencias_count ?? null,
  }));

  // FILTRO POR BÚSQUEDA
  const oficiosFiltrados = oficiosNormalizados.filter((oficio) => {
    const texto = busqueda.toLowerCase();
    return (
      oficio.folio.toLowerCase().includes(texto) ||
      oficio.lugar.toLowerCase().includes(texto)
    );
  });

  // ESTADÍSTICAS
  const totalOficios = oficiosNormalizados.length;
  const conConteo = oficiosNormalizados.filter((o) => o.total_evidencias !== null);
  const totalImagenes = conConteo.reduce((acc, o) => acc + (o.total_evidencias || 0), 0);
  const conEvidencias = conConteo.filter((o) => (o.total_evidencias || 0) > 0).length;
  const sinEvidencias = conConteo.filter((o) => (o.total_evidencias || 0) === 0).length;

  // PAGINACIÓN
  const totalPaginas = Math.max(1, Math.ceil(oficiosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const oficiosPagina = oficiosFiltrados.slice(inicio, inicio + POR_PAGINA);

  const irPagina = (n) => {
    if (n < 1 || n > totalPaginas) return;
    setPagina(n);
  };

  // ===================== VISTA: GALERÍA DE EVIDENCIAS =====================
  if (oficioSeleccionado) {
    return (
      <AdminLayout>
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={volverAlListado}
            className="w-9 h-9 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Evidencias fotográficas</h1>
            <p className="text-sm text-gray-500 mt-1">
              Folio <b>{oficioSeleccionado.folio}</b> · {oficioSeleccionado.lugar}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
            {error}
          </div>
        )}

        <section className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Images size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Fotografías registradas</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {fotos.length} {fotos.length === 1 ? "fotografía" : "fotografías"} en este oficio
              </p>
            </div>
          </div>

          <div className="p-6">
            {cargandoFotos ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-gray-500">Cargando evidencias...</p>
              </div>
            ) : fotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ImageOff size={28} className="mb-2" />
                <p className="text-sm">Este oficio no tiene evidencias fotográficas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {fotos.map((foto) => (
                  <button
                    key={foto.id_evidencia}
                    type="button"
                    onClick={() => setFotoAmpliada(foto)}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={foto.archivo}
                      alt={`Evidencia ${foto.id_evidencia}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <Eye
                        size={18}
                        className="text-white opacity-0 group-hover:opacity-100 transition"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* LIGHTBOX */}
        {fotoAmpliada && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={() => setFotoAmpliada(null)}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">
                  Evidencia #{fotoAmpliada.id_evidencia}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => descargarFoto(fotoAmpliada)}
                    className="w-8 h-8 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                    title="Descargar"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoAmpliada(null)}
                    className="w-8 h-8 rounded-md border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 transition"
                    title="Cerrar"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
                <img
                  src={fotoAmpliada.archivo}
                  alt={`Evidencia ${fotoAmpliada.id_evidencia}`}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    );
  }

  // ===================== VISTA: LISTADO DE OFICIOS =====================
  return (
    <AdminLayout>
      {/* ENCABEZADO */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Evidencias por Reporte</h1>
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
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Oficios</p>
            <p className="text-2xl font-bold text-gray-800">{totalOficios}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-blue-500" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Con evidencias</p>
            <p className="text-2xl font-bold text-gray-800">{conEvidencias}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-green-500" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Sin evidencias</p>
            <p className="text-2xl font-bold text-gray-800">{sinEvidencias}</p>
          </div>
          <div className="w-1 h-10 rounded-full bg-cyan-400" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total fotografías</p>
            <p className="text-2xl font-bold text-gray-800">{totalImagenes}</p>
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
              <h2 className="text-base font-bold text-gray-800">Oficios de Comisión</h2>
              <p className="text-xs text-gray-400 mt-0.5">Consulta la evidencia fotográfica de cada oficio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-white">
              <Search size={14} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filtrar por lugar o folio..."
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
              <p className="text-sm text-gray-500">Cargando oficios...</p>
            </div>
          ) : oficiosPagina.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">No hay oficios que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f8f8] border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Folio</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Fecha</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Lugar de Comisión</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Solicitante</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Evidencias</th>
                  <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {oficiosPagina.map((oficio) => (
                  <tr key={oficio.id_oficio} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-[11px] text-gray-500">{oficio.folio}</td>
                    <td className="px-6 py-3 text-[11px] text-gray-600">{oficio.fecha}</td>
                    <td className="px-6 py-3 text-[11px] font-medium text-gray-700">{oficio.lugar}</td>
                    <td className="px-6 py-3 text-[11px] text-gray-600">{oficio.solicitante}</td>
                    <td className="px-6 py-3 text-[11px] text-gray-600">
                      {oficio.total_evidencias !== null ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-medium">
                          <Images size={12} /> {oficio.total_evidencias}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Ver evidencias"
                          onClick={() => verEvidencias(oficio)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                        >
                          <Eye size={13} />
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
              {oficiosFiltrados.length > 0 ? `${inicio + 1}-${Math.min(inicio + POR_PAGINA, oficiosFiltrados.length)}` : "0"}
            </b>{" "}
            de <b>{oficiosFiltrados.length}</b> registros
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

export default EvidenciaReportes;