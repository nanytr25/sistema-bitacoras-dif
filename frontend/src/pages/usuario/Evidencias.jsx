import { useEffect, useState, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import UsuarioLayout from "../../layouts/UsuarioLayout";
import SelectorOficio from "../../components/usuario/SelectorOficio";
import SubirFotos from "../../components/usuario/SubirFotos";
import ListaFotos from "../../components/usuario/ListaFotos";
import DetalleEvidencia from "../../components/usuario/DetalleEvidencia";

const API_URL = "http://127.0.0.1:8000/api";

// =========================================
// UTILIDADES
// =========================================

// Agrupa un arreglo en sub-arreglos de tamaño "n" (arma las hojas de 2 fotos)
const agruparEnPaginas = (lista, n) => {
  const paginas = [];
  for (let i = 0; i < lista.length; i += n) {
    paginas.push(lista.slice(i, i + n));
  }
  return paginas;
};

// =========================================
// PLANTILLA: UNA HOJA CON 2 FOTOGRAFÍAS (A4: 794px x 1123px)
// =========================================

const HojaEvidencias = forwardRef(
  ({ fotosPagina, numeroPagina, totalPaginas, oficio }, ref) => {
    const folio = oficio?.folio || oficio?.numero_oficio || "-";
    const comisionado =
      oficio?.nombre_comisionado || oficio?.comisionado || "-";

    return (
      <div
        ref={ref}
        className="bg-white relative flex flex-col text-gray-900 shrink-0"
        style={{
          width: "794px",
          height: "1123px",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box",
          padding: "15mm",
          fontSize: "11px",
        }}
      >
        {/* HOJA MEMBRETADA DE FONDO — z-index negativo para que quede detrás de todo */}
        <img
          src="/img/fondosanc.jpg"
          alt="Fondo Membretado Sanctorum"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10"
          crossOrigin="anonymous"
        />

        {/* ENCABEZADO CON LOGOS */}
        <div className="flex items-start justify-between mb-2">
          <img
            src="/img/escudo.png"
            alt="Escudo Sanctorum"
            className="h-16 object-contain"
            crossOrigin="anonymous"
          />

          <div className="text-center flex-1 px-4">
            <p className="font-bold text-[12px] leading-tight">
              MUNICIPIO DE SANCTORUM DE LÁZARO CÁRDENAS, TLAX.
            </p>
            <p className="text-[11px] leading-tight">ADMINISTRACIÓN 2024-2027</p>
            <p className="font-bold text-[13px] mt-1 underline">
              EVIDENCIA FOTOGRÁFICA
            </p>
          </div>

          <img
            src="/img/logo-ayuntamiento.jpg"
            alt="Logo SMDIF"
            className="h-14 object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* DATOS DEL OFICIO */}
        <div className="border border-gray-800 text-[11px] mb-4" style={{ marginTop: "20px" }}>
          <div className="px-2 py-1 border-b border-gray-800">
            <span className="font-bold">FOLIO:</span> {folio}
          </div>
          <div className="px-2 py-1 border-b border-gray-800">
            <span className="font-bold">COMISIONADO:</span> {comisionado}
          </div>
        </div>

        {/* FOTOGRAFÍAS — 2 POR HOJA */}
        <div className="flex-1 flex flex-col gap-4 items-center justify-start">
          {fotosPagina.map((foto, i) => (
            <div
              key={foto.id_evidencia || i}
              className="w-full border border-gray-300 flex items-center justify-center bg-gray-50"
              style={{ height: "280px" }}
            >
              <img
                src={foto.archivo}
                alt={`Evidencia ${i + 1}`}
                crossOrigin="anonymous"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* PIE DE PÁGINA */}
        <div className="flex items-center justify-between text-[9px] mt-4 pt-2 border-t border-gray-400">
          <div>
            <p>Plaza de la Constitución No.1</p>
            <p>Tel: 7486884330</p>
          </div>

          <p>
            Página {numeroPagina} de {totalPaginas}
          </p>

          <div className="text-right">
            <p>Sanctórum de Lázaro Cárdenas C.P. 90230</p>
            <p>ayuntamiento24sanctorum27@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }
);

HojaEvidencias.displayName = "HojaEvidencias";

function Evidencias() {
  const navigate = useNavigate();

  const [oficios, setOficios] = useState([]);
  const [oficioSeleccionado, setOficioSeleccionado] = useState("");

  const [fotos, setFotos] = useState([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // REFS DE LAS HOJAS OCULTAS PARA GENERAR EL PDF
  const paginasRefs = useRef({});



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

      if (!response.ok) throw new Error("No se pudieron obtener los oficios");

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

  // OBTENER EVIDENCIAS
  const obtenerFotos = async (idOficio) => {
    try {
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

      if (!response.ok) throw new Error("No se pudieron obtener las evidencias");

      const data = await response.json();
      const registros = Array.isArray(data) ? data : data.results || [];
      setFotos(registros);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las evidencias.");
      setFotos([]);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerOficios();
  }, []);

  useEffect(() => {
    if (oficioSeleccionado) {
      obtenerFotos(oficioSeleccionado);
      setFotoSeleccionada(null);
    } else {
      setFotos([]);
      setFotoSeleccionada(null);
    }
  }, [oficioSeleccionado]);
  // SUBIR FOTO
  const subirFoto = async (archivo) => {
    if (!oficioSeleccionado) {
      setMensaje("Selecciona primero un folio.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("id_oficio", oficioSeleccionado);

      const response = await fetch(`${API_URL}/evidencias/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo subir la fotografía");

      setMensaje("Fotografía agregada correctamente.");
      await obtenerFotos(oficioSeleccionado);
    } catch (error) {
      console.error(error);
      setMensaje("Ocurrió un error al subir la fotografía.");
    }
  };

  // ELIMINAR
  const eliminarFoto = async (idEvidencia) => {
    const confirmar = window.confirm("¿Deseas eliminar esta evidencia?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/evidencias/${idEvidencia}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("No se pudo eliminar la evidencia");

      setFotoSeleccionada(null);
      setMensaje("Evidencia eliminada correctamente.");
      await obtenerFotos(oficioSeleccionado);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo eliminar la evidencia.");
    }
  };

  // DESCARGAR FOTO INDIVIDUAL
  const descargarFoto = (foto) => {
    const link = document.createElement("a");
    link.href = foto.archivo;
    link.download = `evidencia-${foto.id_evidencia}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EDITAR
  const editarFoto = () => {
    setMensaje("La edición solamente puede modificar los datos existentes de la evidencia.");
  };

  // =========================================
  // GENERACIÓN DE PDF (2 FOTOS POR HOJA)
  // =========================================

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

  const oficioActual = oficios.find(
    (o) => String(o.id_oficio || o.id) === String(oficioSeleccionado)
  );

  const paginasFotos = agruparEnPaginas(fotos, 2);

  const descargarPDF = async () => {
    if (fotos.length === 0) return;

    try {
      setGenerandoPDF(true);
      setError("");

      // Pequeña espera para asegurar que las hojas ocultas ya están montadas en el DOM
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < paginasFotos.length; i++) {
        const nodo = paginasRefs.current[i];
        if (!nodo) continue;

        await esperarImagenes(nodo);

        const canvas = await html2canvas(nodo, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 794,
        });

        const imgData = canvas.toDataURL("image/png");

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }

      const nombre =
        oficioActual?.nombre_comisionado || oficioActual?.comisionado || "evidencias";

      pdf.save(`Evidencias_${nombre}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      setError("Ocurrió un error al generar el PDF.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <UsuarioLayout>
      {/* ENCABEZADO */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fotografías</h1>
          <p className="text-sm text-gray-500 mt-1">Evidencia fotográfica de los oficios de comisión</p>
        </div>

        {oficioSeleccionado && fotos.length > 0 && (
          <button
            type="button"
            onClick={descargarPDF}
            disabled={generandoPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Download size={14} />
            {generandoPDF ? "Generando PDF..." : "Descargar PDF"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      {/* OVERLAY DE GENERACIÓN DE PDF */}
      {generandoPDF && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Generando PDF...
          </div>
        </div>
      )}

      {/* TARJETA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Cargando oficios...</p>
          </div>
        ) : (
          <>
            {/* SELECTOR */}
            <SelectorOficio
              oficios={oficios}
              oficioSeleccionado={oficioSeleccionado}
              setOficioSeleccionado={setOficioSeleccionado}
            />

            {/* SUBIR */}
            {oficioSeleccionado && <SubirFotos onSubirFoto={subirFoto} />}

            {/* MENSAJE */}
            {mensaje && (
              <div className="mt-5 mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                {mensaje}
              </div>
            )}

            {/* LISTA / DETALLE */}
            {oficioSeleccionado && !fotoSeleccionada && (
              <ListaFotos fotos={fotos} onSeleccionar={setFotoSeleccionada} />
            )}

            {fotoSeleccionada && (
              <DetalleEvidencia
                foto={fotoSeleccionada}
                oficios={oficios}
                onVolver={() => setFotoSeleccionada(null)}
                onDescargar={descargarFoto}
                onEditar={editarFoto}
                onEliminar={eliminarFoto}
              />
            )}
          </>
        )}
      </div>

      {/* NODOS OCULTOS PARA CAPTURA DEL PDF: UNA HOJA POR CADA 2 FOTOS */}
      {fotos.length > 0 && (
        <div className="fixed top-0 left-[-9999px] pointer-events-none">
          {paginasFotos.map((fotosPagina, i) => (
            <HojaEvidencias
              key={i}
              ref={(el) => (paginasRefs.current[i] = el)}
              fotosPagina={fotosPagina}
              numeroPagina={i + 1}
              totalPaginas={paginasFotos.length}
              oficio={oficioActual}
            />
          ))}
        </div>
      )}
    </UsuarioLayout>
  );
}

export default Evidencias;