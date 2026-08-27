import { useEffect, useRef, useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Printer,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import AdminLayout from "../../layouts/AdminLayout";

const API_URL = "http://127.0.0.1:8000/api";
const POR_PAGINA = 6;

const obtenerIdOficio = (oficio) => oficio?.id_oficio ?? oficio?.id;

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "___ de _________ de 2026";
  const fecha = new Date(fechaStr.includes("T") ? fechaStr : fechaStr + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

// PLANTILLA DEL OFICIO (idéntica a usuario/OficioComision.jsx, medidas A4: 794px x 1123px)
const FormatoOficio = forwardRef(({ oficio }, ref) => {
  if (!oficio) return null;

  const lugarDestino =
    oficio.lugar?.nombre ||
    oficio.lugar_info?.nombre ||
    oficio.lugar_destino ||
    oficio.nombre_lugar ||
    oficio.ubicacion ||
    (typeof oficio.lugar === "string" ? oficio.lugar : null) ||
    "___________________";

  const motivoActividad = oficio.motivo_comision || oficio.motivo || "___________________";

  return (
    <div
      ref={ref}
      className="bg-white p-[18mm] relative flex flex-col justify-between text-gray-900 overflow-hidden shrink-0"
      style={{
        width: "794px",
        height: "1123px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
        padding: "25mm",
      }}
    >
      <img
        src="/img/fondosanc.jpg"
        alt="Fondo Membretado Sanctorum"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        crossOrigin="anonymous"
      />

      <img
        src="/img/logo-ayuntamiento.jpg"
        alt="SMDIF Sanctórum"
        className="absolute h-30 object-contain z-10"
        style={{ top: "50px", right: "15mm" }}
        crossOrigin="anonymous"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="text-right text-[12px] space-y-1 mb-8 font-bold leading-tight" style={{ marginTop: "150px" }}>
          <p>
            <span className="font-extrabold">Dependencia:</span> Sistema Municipal DIF
          </p>
          <p>
            <span className="font-extrabold">Asunto:</span> OFICIO DE COMISIÓN
          </p>
          <p className="mt-3 font-normal text-gray-800" style={{ marginTop: "20px" }}>
            {oficio.lugar_expedicion || "Sanctorum de Lázaro Cárdenas, Tlax"}; a{" "}
            {formatearFecha(oficio.fecha_emision)}
          </p>
        </div>

        <div className="mb-8 text-[13px] font-bold leading-snug" style={{ marginTop: "20px" }}>
          <p className="uppercase">{oficio.funcionario_autorizador || "___________________"}</p>
          <p className="uppercase">{oficio.cargo_autorizador || "___________________"}</p>
          <p className="uppercase">{oficio.adscripcion || "___________________"}</p>
          <p className="mt-4" style={{ marginTop: "10px" }}>P R E S E N T E</p>
        </div>

        <div className="text-justify text-[13px] leading-relaxed space-y-4" style={{ marginTop: "40px" }}>
          <p>
            La que suscribe <span className="font-bold">{oficio.nombre_comisionado || "___________________"}</span>,{" "}
            <span className="font-bold">{oficio.cargo_comisionado || "___________________"}</span>, Sanctorum de
            Lázaro Cárdenas, Tlaxcala, para el buen desempeño de las funciones administrativas en el municipio por
            este medio le informo que el día{" "}
            <span className="font-bold">{formatearFecha(oficio.fecha_traslado)}</span>, me
            trasladé a <span className="font-bold">{lugarDestino}</span> a efecto de asistir a una mesa de trabajo para llevar acabo la entrega de{" "}
            <span className="font-bold">{motivoActividad}</span>.
          </p>
          <p style={{ marginTop: "20px" }}>Por la atención y apoyo al cumplimiento del presente, anticipo a usted mi consideración más distinguida.</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center" style={{ marginTop: "50px" }}>
        <p className="font-bold text-[13px] mb-12">A T E N T A M E N T E</p>
        <div className="text-center">
          <div className="w-56 border-t border-gray-800 mb-1" style={{ marginTop: "100px" }} />
          <p className="font-bold text-[13px] uppercase">{oficio.nombre_comisionado || "___________________"}</p>
          <p className="font-bold text-[11px] text-gray-700 uppercase">
            {oficio.cargo_comisionado || "___________________"}
          </p>
        </div>
      </div>

      <div className="relative z-10 pb-2 flex items-end justify-between text-[10px] text-gray-700 leading-tight" style={{ marginTop: "150px" }}>
        <div className="flex items-center gap-2">
          <img
            src="/img/QR.jpg"
            alt="Código QR"
            className="w-12 h-12 object-contain"
            crossOrigin="anonymous"
          />
          <div>
            <p className="font-bold text-gray-800">Plaza de la Constitución No.1</p>
            <p>Tel: 7486884330</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-gray-800">Sanctórum de Lázaro Cárdenas C.P. 90230</p>
          <p>ayuntamiento24sanctorum27@gmail.com</p>
        </div>
      </div>
    </div>
  );
});

FormatoOficio.displayName = "FormatoOficio";

function AprobacionesOficios() {
  const navigate = useNavigate();

  const pdfVistaRef = useRef(null);
  const pdfDescargaRef = useRef(null);

  const [oficios, setOficios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [procesando, setProcesando] = useState(null);

  const [oficioVista, setOficioVista] = useState(null);
  const [oficioDescarga, setOficioDescarga] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerOficios();
  }, []);

  useEffect(() => {
    const manejarTeclaEscape = (e) => {
      if (e.key === "Escape" && oficioVista) {
        cerrarVistaPrevia();
      }
    };
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [oficioVista]);

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

  const cambiarEstado = async (oficio, nuevoEstado) => {
    try {
      setProcesando(oficio.id_oficio);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/oficios/${oficio.id_oficio}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo actualizar el estado del oficio.");

      await obtenerOficios();
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el estado del oficio.");
    } finally {
      setProcesando(null);
    }
  };

  // VISUALIZAR: abre el modal con el oficio completo (busca el registro real, no el normalizado)
  const visualizarOficio = (oficioNormalizado) => {
    const original = oficios.find(
      (o) => (o.id_oficio || o.id) === oficioNormalizado.id_oficio
    );
    setOficioVista(original || oficioNormalizado);
  };

  const cerrarVistaPrevia = () => setOficioVista(null);

  const esperarImagenes = (nodo) => {
    const imagenes = Array.from(nodo.querySelectorAll("img"));
    return Promise.all(
      imagenes.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  };

  const generarPDFDesdeNodo = async (nodo, nombreArchivo) => {
    await esperarImagenes(nodo);

    const canvas = await html2canvas(nodo, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save(nombreArchivo);
  };

  // DESCARGAR: igual que visualizar, busca el oficio completo antes de generar el PDF
  const descargarOficio = (oficioNormalizado) => {
    setError("");
    const original = oficios.find(
      (o) => (o.id_oficio || o.id) === oficioNormalizado.id_oficio
    );
    setOficioDescarga(original || oficioNormalizado);
  };

  useEffect(() => {
    if (!oficioDescarga) return;

    const ejecutarDescarga = async () => {
      try {
        setGenerandoPDF(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!pdfDescargaRef.current) {
          throw new Error("No se encontró el nodo del documento.");
        }

        await generarPDFDesdeNodo(
          pdfDescargaRef.current,
          `Oficio_Comision_${oficioDescarga.nombre_comisionado || obtenerIdOficio(oficioDescarga) || "documento"}.pdf`
        );
      } catch (err) {
        console.error("Error al descargar PDF:", err);
        setError("Error al descargar el archivo PDF.");
      } finally {
        setGenerandoPDF(false);
        setOficioDescarga(null);
      }
    };

    ejecutarDescarga();
  }, [oficioDescarga]);

  const descargarDesdeVistaPrevia = () => {
    if (!oficioVista) return;
    descargarOficio(oficioVista);
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
    estado: oficio.estado || "Pendiente",
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
  const total = oficiosNormalizados.length;
  const pendientes = oficiosNormalizados.filter((o) => o.estado === "Pendiente").length;
  const aprobados = oficiosNormalizados.filter((o) => o.estado === "Aprobado").length;
  const rechazados = oficiosNormalizados.filter((o) => o.estado === "Rechazado").length;

  // PAGINACIÓN
  const totalPaginas = Math.max(1, Math.ceil(oficiosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const oficiosPagina = oficiosFiltrados.slice(inicio, inicio + POR_PAGINA);

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
        <h1 className="text-2xl font-bold text-gray-800">Revisión de Registros</h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      {generandoPDF && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Generando PDF...
          </div>
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
              <h2 className="text-base font-bold text-gray-800">Oficios de Comisión</h2>
              <p className="text-xs text-gray-400 mt-0.5">Listado detallado para validación administrativa</p>
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
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600">Estado</th>
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
                    <td className="px-6 py-3">{badgeEstado(oficio.estado)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Descargar"
                          onClick={() => descargarOficio(oficio)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                        >
                          <Download size={13} />
                        </button>

                        <button
                          title="Visualizar"
                          onClick={() => visualizarOficio(oficio)}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          title="Aprobar"
                          disabled={procesando === oficio.id_oficio}
                          onClick={() => cambiarEstado(oficio, "Aprobado")}
                          className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-green-50 hover:text-green-500 flex items-center justify-center text-gray-500 transition disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                        </button>

                        <button
                          title="Rechazar"
                          disabled={procesando === oficio.id_oficio}
                          onClick={() => cambiarEstado(oficio, "Rechazado")}
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

      {/* MODAL DE VISTA PREVIA */}
      {oficioVista && (
        <div
          onClick={cerrarVistaPrevia}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col relative"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
              <h3 className="text-sm font-semibold">Formato Oficial de Comisión</h3>

              <div className="flex items-center gap-3">
                <button
                  onClick={descargarDesdeVistaPrevia}
                  disabled={generandoPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-xs text-white hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  <Printer size={14} /> {generandoPDF ? "Generando..." : "Descargar PDF"}
                </button>

                <button
                  type="button"
                  onClick={cerrarVistaPrevia}
                  title="Cerrar vista previa"
                  className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 bg-gray-200 flex justify-center overflow-auto max-h-[80vh]">
              <div className="scale-[0.8] origin-top">
                <FormatoOficio ref={pdfVistaRef} oficio={oficioVista} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NODO OCULTO PARA CAPTURA PDF Y DESCARGA DIRECTA */}
      {oficioDescarga && (
        <div className="fixed top-0 left-[-9999px] pointer-events-none">
          <FormatoOficio ref={pdfDescargaRef} oficio={oficioDescarga} />
        </div>
      )}
    </AdminLayout>
  );
}

export default AprobacionesOficios;