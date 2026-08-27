import { useEffect, useRef, useState, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, ChevronRight, X, Printer } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import UsuarioLayout from "../../layouts/UsuarioLayout";
import TablaOficios from "../../components/usuario/TablaOficios";
import MensajeExito from "../../components/usuario/MensajeExito";
import ModalEliminar from "../../components/usuario/ModalEliminar";

const obtenerIdOficio = (oficio) => oficio?.id_oficio ?? oficio?.id;
const API_URL = import.meta.env.VITE_API_URL;
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "___ de _________ de 2026";
  const fecha = new Date(fechaStr.includes("T") ? fechaStr : fechaStr + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

// PLANTILLA DEL OFICIO CON SOPORTE DE CORTE EXACTO PARA PDF (Medidas A4: 794px x 1123px)
const FormatoOficio = forwardRef(({ oficio }, ref) => {
  if (!oficio) return null;

  // Resolución del nombre del lugar contemplando el serializador de Django
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
      {/* IMAGEN DE FONDO / HOJA MEMBRETADA */}
      <img
        src="/img/fondosanc.jpg"
        alt="Fondo Membretado Sanctorum"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        crossOrigin="anonymous"
      />

      {/* LOGO SMDIF */}
      <img
        src="/img/logo-ayuntamiento.jpg"
        alt="SMDIF Sanctórum"
        className="absolute h-30 object-contain z-10"
        style={{ top: "50px", right: "15mm" }}
        crossOrigin="anonymous"
      />

      {/* SECCIÓN SUPERIOR */}
      <div className="relative z-10 flex-1 flex flex-col">

        {/* DATOS DEL OFICIO */}
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

        {/* DESTINATARIO */}
        <div className="mb-8 text-[13px] font-bold leading-snug"style={{ marginTop: "20px" }}>
          <p className="uppercase">{oficio.funcionario_autorizador || "___________________"}</p>
          <p className="uppercase">{oficio.cargo_autorizador || "___________________"}</p>
          <p className="uppercase">{oficio.adscripcion || "___________________"}</p>
          <p className="mt-4" style={{ marginTop: "10px" }}>P R E S E N T E</p>
        </div>

        {/* CUERPO DEL TEXTO */}
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

      {/* ATENTAMENTE Y FIRMA */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ marginTop: "50px" }}>
        <p className="font-bold text-[13px] mb-12">A T E N T A M E N T E</p>
        <div className="text-center">
          {/* LÍNEA PARA LA FIRMA */}
          <div className="w-56 border-t border-gray-800 mb-1" style={{ marginTop: "100px" }} />
          <p className="font-bold text-[13px] uppercase">{oficio.nombre_comisionado || "___________________"}</p>
          <p className="font-bold text-[11px] text-gray-700 uppercase">
            {oficio.cargo_comisionado || "___________________"}
          </p>
        </div>
      </div>

      {/* PIE DE PÁGINA */}
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

function OficioComision() {
  const navigate = useNavigate();
  const location = useLocation();

  const tablaContainerRef = useRef(null);
  const pdfVistaRef = useRef(null);
  const pdfDescargaRef = useRef(null);

  const [oficios, setOficios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [oficioSeleccionado, setOficioSeleccionado] = useState(null);
  const [mostrarMensaje, setMostrarMensaje] = useState(Boolean(location.state?.mensaje));

  const [oficioVista, setOficioVista] = useState(null);
  const [oficioDescarga, setOficioDescarga] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const obtenerOficios = async () => {
    try {
      setCargando(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}oficios/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
    } catch (err) {
      console.error("Error al obtener oficios:", err);
      setError("No se pudieron cargar los oficios.");
      setOficios([]);
    } finally {
      setCargando(false);
    }
  };

  const oficiosNormalizados = oficios.map((o) => ({
    ...o,
    id: obtenerIdOficio(o),
    folio: o.folio || `OC-${obtenerIdOficio(o)}`,
    fecha: o.fecha || o.fecha_traslado || o.fecha_emision || "-",
    solicitante: o.solicitante || o.nombre_comisionado || "-",
    motivo: o.motivo || o.motivo_comision || "-",
    estado: o.estado || "Pendiente",
  }));

  const visualizarOficio = (oficio) => setOficioVista(oficio);
  const cerrarVistaPrevia = () => setOficioVista(null);

  const editarOficio = (oficio) => {
    const id = obtenerIdOficio(oficio);
    if (!id) {
      setError("No se pudo abrir la edición: identificador no válido.");
      return;
    }
    navigate(`/usuario/oficio-comision/editar/${id}`);
  };

  const eliminarOficio = (oficio) => setOficioSeleccionado(oficio);
  const cancelarEliminar = () => setOficioSeleccionado(null);
  useEffect(() => {
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
  const confirmarEliminar = async () => {
    if (!oficioSeleccionado) return;
    const id = obtenerIdOficio(oficioSeleccionado);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/oficios/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("No se pudo eliminar el oficio.");

      setOficioSeleccionado(null);
      setMostrarMensaje(true);
      await obtenerOficios();
    } catch (err) {
      console.error("Error al eliminar oficio:", err);
      setError("No se pudo eliminar el oficio.");
      setOficioSeleccionado(null);
    }
  };

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

  // Descarga directa (desde la tabla) usando un nodo oculto sin transform.
  const descargarOficio = (oficio) => {
    setError("");
    setOficioDescarga(oficio);
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

  // La vista previa reutiliza el mismo mecanismo que la descarga
  // directa (nodo oculto sin "scale"), en vez de capturar el nodo
  // escalado (scale-[0.8]) que html2canvas no maneja bien.
  const descargarDesdeVistaPrevia = () => {
    if (!oficioVista) return;
    descargarOficio(oficioVista);
  };

  const nuevoOficio = () => navigate("/usuario/oficio-comision/nuevo");

  return (
    <UsuarioLayout>
      {mostrarMensaje && <MensajeExito onClose={() => setMostrarMensaje(false)} />}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold">X</button>
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

      {oficioSeleccionado && (
        <ModalEliminar
          oficio={oficioSeleccionado}
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}

      <section className="w-full h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="h-[76px] shrink-0 grid grid-cols-3 items-center px-6 border-b border-gray-200">
          <div />
          <h1 className="text-lg font-bold text-gray-800 text-center">Oficio Comisión</h1>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={nuevoOficio}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-medium transition"
            >
              <Plus size={15} />
              Nuevo
            </button>
          </div>
        </div>

        <div ref={tablaContainerRef} className="flex-1 overflow-auto p-6 bg-white">
          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">Cargando oficios...</p>
            </div>
          ) : oficios.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">No hay oficios de comisión registrados.</p>
            </div>
          ) : (
            <TablaOficios
              oficios={oficiosNormalizados}
              onVisualizar={visualizarOficio}
              onEditar={editarOficio}
              onEliminar={eliminarOficio}
              onDescargar={descargarOficio}
            />
          )}
        </div>

        <div className="h-[66px] shrink-0 flex items-center justify-between px-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Mostrando <b>{oficios.length > 0 ? `1-${oficios.length}` : "0"}</b> de{" "}
            <b>{oficios.length}</b> registros
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>

            <button type="button" className="w-7 h-7 rounded-md bg-blue-500 text-white text-xs font-medium">
              1
            </button>

            <button
              type="button"
              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
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

      {/* NODO OCULTO PARA CAPTURA PDF Y DESCARGA DIRECTA (usado también por la vista previa) */}
      {oficioDescarga && (
        <div className="fixed top-0 left-[-9999px] pointer-events-none">
          <FormatoOficio ref={pdfDescargaRef} oficio={oficioDescarga} />
        </div>
      )}
    </UsuarioLayout>
  );
}

export default OficioComision;