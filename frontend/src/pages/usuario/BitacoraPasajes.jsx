import { useEffect, useRef, useState, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, ChevronRight, Eye, Download, X, Printer } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import UsuarioLayout from "../../layouts/UsuarioLayout";
import TablaBitacoraPasajes from "../../components/usuario/TablaBitacoraPasajes";
import MensajeExito from "../../components/usuario/MensajeExito";

const API_URL = "http://127.0.0.1:8000/api";
const ORIGEN_FIJO = "SMDIF, Sanctorum de Lázaro Cárdenas";

// =========================================
// UTILIDADES DE FORMATO
// =========================================

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const fechaObj = new Date(fecha.includes ? (fecha.includes("T") ? fecha : fecha + "T00:00:00") : fecha);
  if (isNaN(fechaObj.getTime())) return fecha;
  return fechaObj.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Extrae un id "plano" ya sea que venga como número, string, u objeto {id: ...}
const extraerId = (valor) => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "object") return valor.id_lugar ?? valor.id_usuario ?? valor.id ?? null;
  return valor;
};

// DESTINO: revisa todas las variantes posibles del serializer de Django
// (igual patrón que usa OficioComision.jsx con "lugar"), y si no encuentra
// nombre anidado, intenta resolver por ID contra el mapa de lugares.
const resolverDestino = (b, lugaresPorId) => {
  const directo =
    b.lugar?.nombre ||
    b.lugar_info?.nombre ||
    b.destino?.nombre ||
    b.destino?.nombre_lugar ||
    b.id_destino?.nombre ||
    b.id_destino?.nombre_lugar ||
    b.lugar_destino ||
    b.nombre_lugar ||
    b.destino_nombre ||
    b.nombre_destino ||
    (typeof b.lugar === "string" ? b.lugar : null) ||
    (typeof b.destino === "string" ? b.destino : null);

  if (directo) return directo;

  const id = extraerId(b.id_destino) || extraerId(b.destino) || extraerId(b.lugar);
  if (id && lugaresPorId[id]) return lugaresPorId[id];

  return "-";
};

// ORIGEN: mismo patrón, con fallback al texto fijo
const resolverLugarOrigen = (b, lugaresPorId) => {
  const directo =
    b.origen?.nombre ||
    b.origen_info?.nombre ||
    b.id_origen?.nombre ||
    b.id_origen?.nombre_lugar ||
    b.lugar_origen ||
    (typeof b.origen === "string" ? b.origen : null);

  if (directo) return directo;

  const id = extraerId(b.id_origen) || extraerId(b.origen);
  if (id && lugaresPorId[id]) return lugaresPorId[id];

  return ORIGEN_FIJO;
};

// TIPO DE PASAJE: "Local" o "Foráneo"
const esPasajeLocal = (b) =>
  String(b.tipo_pasaje || "").trim().toLowerCase() === "local";

// NOMBRE DE QUIEN REALIZA EL GASTO
const resolverPersonaGasto = (b) =>
  b.persona_gasto || b.nombre_comisionado || b.comisionado || "___________________";

// NOMBRE Y CARGO DE UN AUTORIZADOR: busca en el mapa de administradores usando el id guardado
const resolverAutorizador = (valor, adminsPorId) => {
  if (!valor) return { nombre: "___________________", cargo: "___________________" };

  if (typeof valor === "object") {
    return {
      nombre: valor.nombre_completo || valor.nombre || "___________________",
      cargo: valor.cargo || valor.puesto || valor.cargo_autorizador || "___________________",
    };
  }

  const id = extraerId(valor);
  if (id && adminsPorId[id]) {
    const admin = adminsPorId[id];
    return {
      nombre: admin.nombre_completo || admin.nombre || "___________________",
      cargo: admin.cargo || admin.puesto || admin.cargo_autorizador || "___________________",
    };
  }

  return { nombre: "___________________", cargo: "___________________" };
};

// CONVERTIDOR NÚMERO A LETRAS (PESOS MEXICANOS)
const UNIDADES = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const DECENAS = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const ESPECIALES = {
  10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
  16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
  21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
  25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE",
};
const CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

function convertirGrupo(n) {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  let texto = "";
  const c = Math.floor(n / 100);
  const resto = n % 100;

  if (c > 0) texto += CENTENAS[c] + " ";

  if (ESPECIALES[resto]) {
    texto += ESPECIALES[resto];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (d > 0) {
      texto += DECENAS[d];
      if (u > 0) texto += " Y " + UNIDADES[u];
    } else if (u > 0) {
      texto += UNIDADES[u];
    }
  }
  return texto.trim();
}

function numeroALetras(numero) {
  const entero = Math.floor(Math.abs(numero));
  const centavos = Math.round((Math.abs(numero) - entero) * 100);

  if (entero === 0) return "CERO PESOS " + (centavos > 0 ? `CON ${String(centavos).padStart(2, "0")}/100 M.N.` : "00/100 M.N.");

  const millones = Math.floor(entero / 1000000);
  const miles = Math.floor((entero % 1000000) / 1000);
  const cientos = entero % 1000;

  let texto = "";

  if (millones > 0) {
    texto += millones === 1 ? "UN MILLÓN " : convertirGrupo(millones) + " MILLONES ";
  }
  if (miles > 0) {
    texto += miles === 1 ? "MIL " : convertirGrupo(miles) + " MIL ";
  }
  if (cientos > 0) {
    texto += convertirGrupo(cientos) + " ";
  }

  texto = texto.trim() + " PESOS";
  texto += centavos > 0 ? ` CON ${String(centavos).padStart(2, "0")}/100 M.N.` : " 00/100 M.N.";

  return texto;
}

// =========================================
// PLANTILLA DEL FORMATO (A4: 794px x 1123px)
// =========================================

const FormatoBitacoraPasajes = forwardRef(({ bitacoras, lugaresPorId, adminsPorId }, ref) => {
  if (!bitacoras || bitacoras.length === 0) return null;

  const primera = bitacoras[0];

  const nombreComisionado = resolverPersonaGasto(primera);

  // COMISIÓN: siempre fija como "CAPACITACIÓN"
  const comision = "CAPACITACIÓN";

  const areaUsuaria =
    primera.area_usuaria ||
    "Sistema Municipal para el Desarrollo Integral de la Familia (SMDIF)";

  const totalGeneral = bitacoras.reduce((acc, b) => acc + (Number(b.total) || 0), 0);

  return (
    <div
      ref={ref}
      className="bg-white relative flex flex-col text-gray-900 shrink-0"
      style={{
        width: "794px",
        minHeight: "1123px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
        padding: "15mm",
        fontSize: "11px",
      }}
    >
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
          <p className="text-[11px] leading-tight">RFC: MSL850301191</p>
          <p className="font-bold text-[13px] mt-1 underline">BITÁCORA DE PASAJES</p>
        </div>

        <img
          src="/img/logo-ayuntamiento.jpg"
          alt="Logo Sanctórum"
          className="h-16 object-contain"
          crossOrigin="anonymous"
        />
      </div>

      {/* DATOS GENERALES */}
      <div className="border border-gray-800 text-[11px] mb-2" style={{ marginTop: "30px" }}>
        <div className="px-2 py-1 border-b border-gray-800">
          <span className="font-bold">ÁREA USUARIA:</span> {areaUsuaria}
        </div>
        <div className="px-2 py-1 border-b border-gray-800">
          <span className="font-bold">NOMBRE DEL COMISIONADO:</span> {nombreComisionado}
        </div>
        <div className="px-2 py-1">
          <span className="font-bold">COMISIÓN:</span> {comision}
        </div>
      </div>

      {/* TABLA */}
      <table className="w-full border-collapse border border-gray-800 text-[10px]">
        <thead>
          <tr className="font-bold text-center">
            <th rowSpan={2} className="border border-gray-800 px-1 py-1 w-[9%]">FECHA</th>
            <th rowSpan={2} className="border border-gray-800 px-1 py-1 w-[26%]">LUGAR DE ORIGEN</th>
            <th rowSpan={2} className="border border-gray-800 px-1 py-1 w-[26%]">DESTINO</th>
            <th colSpan={2} className="border border-gray-800 px-1 py-1">PASAJE</th>
            <th rowSpan={2} className="border border-gray-800 px-1 py-1 w-[13%]">TOTAL</th>
          </tr>
          <tr className="font-bold text-center">
            <th className="border border-gray-800 px-1 py-1 w-[13%]">LOCAL</th>
            <th className="border border-gray-800 px-1 py-1 w-[13%]">FORÁNEO</th>
          </tr>
        </thead>
        <tbody>
          {bitacoras.map((b, i) => {
            const local = esPasajeLocal(b);
            return (
              <tr key={b.id_bitacora || b.id || i}>
                <td className="border border-gray-800 px-1 py-2 text-center align-middle">
                  {formatearFecha(b.fecha)}
                </td>
                <td className="border border-gray-800 px-1 py-2 text-center align-middle">
                  {resolverLugarOrigen(b, lugaresPorId)}
                </td>
                <td className="border border-gray-800 px-1 py-2 text-center align-middle">
                  {resolverDestino(b, lugaresPorId)}
                </td>
                <td className="border border-gray-800 px-1 py-2 text-center align-middle">
                  {local ? "X" : ""}
                </td>
                <td className="border border-gray-800 px-1 py-2 text-center align-middle">
                  {!local ? "X" : ""}
                </td>
                <td className="border border-gray-800 px-1 py-2 text-right align-middle">
                  ${Number(b.total || 0).toFixed(2)}
                </td>
              </tr>
            );
          })}

          {/* FILAS VACÍAS PARA COMPLETAR VISUALMENTE (estilo formato impreso) */}
          {Array.from({ length: Math.max(0, 3 - (bitacoras.length % 4)) }).map((_, i) => (
            <tr key={`vacia-${i}`}>
              <td className="border border-gray-800 px-1 py-2">&nbsp;</td>
              <td className="border border-gray-800 px-1 py-2">&nbsp;</td>
              <td className="border border-gray-800 px-1 py-2">&nbsp;</td>
              <td className="border border-gray-800 px-1 py-2">&nbsp;</td>
              <td className="border border-gray-800 px-1 py-2">&nbsp;</td>
              <td className="border border-gray-800 px-1 py-2">&nbsp;</td>
            </tr>
          ))}

          <tr>
            <td colSpan={5} className="border border-gray-800 px-2 py-1 text-right font-bold">
              BUENO POR:
            </td>
            <td className="border border-gray-800 px-2 py-1 text-right font-bold">
              ${totalGeneral.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* CANTIDAD CON LETRA */}
      <p className="text-[11px] font-bold mt-3" style={{ marginTop: "20px" }}>
        CANTIDAD CON LETRA: {numeroALetras(totalGeneral)}
      </p>

      {/* PERSONA QUE REALIZA EL GASTO */}
      <div className="mt-8 text-center text-[11px]" style={{ marginTop: "50px" }}>
        <p className="w-64 font-bold bg-gray-200 mb-1">PERSONA QUE REALIZA EL GASTO</p>
        <div className="w-64 border-t border-gray-800 mx-auto mb-1 " style={{ marginTop: "100px" }} />
        <p className="w-64 font-bold uppercase">{nombreComisionado}</p>
      </div>

      {/* AUTORIZA - dinámico según autoriza_1, autoriza_2, autoriza_3 de la bitácora */}
      <div className="mt-10 grid grid-cols-3 gap-4 text-center text-[10px]" style={{ marginTop: "30px" }}>
        {[primera.autoriza_1, primera.autoriza_2, primera.autoriza_3].map((autorizador, i) => {
          const { nombre, cargo } = resolverAutorizador(autorizador, adminsPorId);
          return (
            <div key={i}>
              <p className="font-bold bg-gray-200 py-1 mb-10">AUTORIZA</p>
              <div className="border-t border-gray-800 mb-1" style={{ marginTop: "100px" }} />
              <p className="font-bold uppercase">{nombre}</p>
              <p className="font-bold uppercase">{cargo}</p>
            </div>
          );
        })}
      </div>

      {/* DECLARACIÓN */}
      <p className="mt-10 text-[9px] italic leading-snug" style={{ marginTop: "500px" }}>
        DECLARO, BAJO PROTESTA DE DECIR VERDAD, QUE LOS DATOS CONTENIDOS EN ESTE INFORME SON
        VERÍDICOS Y MANIFIESTO TENER CONOCIMIENTO DE LAS SANCIONES QUE SE APLICARÁN EN CASO
        CONTRARIO.
      </p>
    </div>
  );
});

FormatoBitacoraPasajes.displayName = "FormatoBitacoraPasajes";

function BitacoraPasajes() {
  const navigate = useNavigate();
  const location = useLocation();

  const tablaContainerRef = useRef(null);
  const pdfVistaRef = useRef(null);
  const pdfDescargaRef = useRef(null);

  // =========================================
  // ESTADOS
  // =========================================

  const [bitacoras, setBitacoras] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(
    Boolean(location.state?.mensaje)
  );

  // SELECCIÓN PARA VISTA PREVIA / DESCARGA MASIVA
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [datosDescarga, setDatosDescarga] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // =========================================
  // OBTENER DATOS DESDE DJANGO
  // =========================================

  const obtenerBitacoras = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/bitacoras-pasajes/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudieron obtener las bitácoras.");
      }

      const data = await response.json();

      const registros = Array.isArray(data) ? data : data.results || [];

      console.log("BITACORA EJEMPLO:", registros[0]);

      setBitacoras(registros);
    } catch (error) {
      console.error("Error al obtener bitácoras:", error);
      setError("No se pudieron cargar las bitácoras.");
      setBitacoras([]);
    } finally {
      setCargando(false);
    }
  };

  // Trae la lista de lugares para poder resolver id_origen / id_destino → nombre
  const obtenerLugares = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${API_URL}/lugares/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!respuesta.ok) throw new Error("No se pudieron obtener los lugares.");

      const datos = await respuesta.json();
      const lista = Array.isArray(datos) ? datos : datos.results || [];
      setLugares(lista);
    } catch (err) {
      console.error("Error al obtener lugares:", err);
    }
  };

  // Trae la lista de administradores para poder resolver autoriza_1/2/3 → nombre y cargo
  const obtenerAdministradores = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${API_URL}/usuarios/?rol=Administrador`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!respuesta.ok) throw new Error("No se pudieron obtener los administradores.");

      const datos = await respuesta.json();
      const lista = Array.isArray(datos) ? datos : datos.results || [];
      setAdministradores(lista.filter((u) => u.rol === "Administrador"));
    } catch (err) {
      console.error("Error al obtener administradores:", err);
    }
  };
  useEffect(() => {
    obtenerBitacoras();
    obtenerLugares();
    obtenerAdministradores();
  }, []);
  // MAPAS id → datos
  const lugaresPorId = lugares.reduce((mapa, l) => {
    mapa[l.id_lugar] = l.nombre;
    return mapa;
  }, {});

  const adminsPorId = administradores.reduce((mapa, a) => {
    mapa[a.id_usuario] = a;
    return mapa;
  }, {});

  // =========================================
  // SCROLL DE TABLA
  // =========================================

  useEffect(() => {
    if (tablaContainerRef.current) {
      tablaContainerRef.current.scrollLeft = 0;
    }
  }, [bitacoras]);

  // =========================================
  // SELECCIÓN
  // =========================================

  const toggleSeleccion = (id) => {
    setSeleccionadas((actuales) =>
      actuales.includes(id) ? actuales.filter((s) => s !== id) : [...actuales, id]
    );
  };

  const toggleSeleccionarTodas = (listaVisible) => {
    const idsVisibles = listaVisible.map((b) => b.id);
    const todasYaSeleccionadas = idsVisibles.every((id) => seleccionadas.includes(id));

    if (todasYaSeleccionadas) {
      setSeleccionadas((actuales) => actuales.filter((id) => !idsVisibles.includes(id)));
    } else {
      setSeleccionadas((actuales) => [...new Set([...actuales, ...idsVisibles])]);
    }
  };

  const bitacorasSeleccionadas = bitacoras.filter((b) =>
    seleccionadas.includes(b.id_bitacora || b.id)
  );

  // =========================================
  // GENERACIÓN DE PDF
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

  const generarPDFDesdeNodo = async (nodo, nombreArchivo) => {
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
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save(nombreArchivo);
  };

  // =========================================
  // ACCIONES
  // =========================================

  const nuevaBitacora = () => {
    navigate("/usuario/bitacora-pasajes/nuevo");
  };

  const vistaPreviaSeleccionadas = () => {
    if (bitacorasSeleccionadas.length === 0) return;
    setMostrarVistaPrevia(true);
  };

  const cerrarVistaPrevia = () => setMostrarVistaPrevia(false);

  const descargarSeleccionadas = () => {
    if (bitacorasSeleccionadas.length === 0) return;
    setError("");
    setDatosDescarga(bitacorasSeleccionadas);
  };

  useEffect(() => {
    if (!datosDescarga) return;

    const ejecutarDescarga = async () => {
      try {
        setGenerandoPDF(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!pdfDescargaRef.current) {
          throw new Error("No se encontró el nodo del documento.");
        }

        const primera = datosDescarga[0];
        const nombre = primera.persona_gasto || primera.nombre_comisionado || "documento";

        await generarPDFDesdeNodo(pdfDescargaRef.current, `Bitacora_Pasajes_${nombre}.pdf`);
      } catch (err) {
        console.error("Error al descargar PDF:", err);
        setError("Error al descargar el archivo PDF.");
      } finally {
        setGenerandoPDF(false);
        setDatosDescarga(null);
      }
    };

    ejecutarDescarga();
  }, [datosDescarga]);

  const descargarDesdeVistaPrevia = () => {
    descargarSeleccionadas();
  };

  // =========================================
  // FORMATEAR FECHA Y PREPARAR DATOS PARA TABLA
  // =========================================

  const bitacorasTabla = bitacoras.map((bitacora) => ({
    ...bitacora,
    id: bitacora.id_bitacora || bitacora.id,
    fecha: formatearFecha(bitacora.fecha),
    lugar: resolverDestino(bitacora, lugaresPorId),
    total:
      bitacora.total !== null && bitacora.total !== undefined
        ? `$${Number(bitacora.total).toFixed(2)}`
        : "$0.00",
    estado: bitacora.estado || "Pendiente",
  }));

  // =========================================
  // RETURN
  // =========================================

  return (
    <UsuarioLayout>
      {/* MENSAJE */}
      {mostrarMensaje && (
        <MensajeExito onClose={() => setMostrarMensaje(false)} />
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
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

      {/* SECCIÓN PRINCIPAL */}
      <section className="w-full h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="h-[76px] shrink-0 grid grid-cols-3 items-center px-6 border-b border-gray-200">
          <div />

          <h1 className="text-lg font-bold text-gray-800 text-center">
            Bitácora de Pasajes
          </h1>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={nuevaBitacora}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-medium transition"
            >
              <Plus size={15} />
              Nuevo
            </button>
          </div>
        </div>

        {/* CONTENIDO Y TABLA */}
        <div
          ref={tablaContainerRef}
          className="flex-1 overflow-auto p-6 bg-white"
        >
          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">Cargando bitácoras...</p>
            </div>
          ) : bitacorasTabla.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-500">
                No hay bitácoras de pasajes registradas.
              </p>
            </div>
          ) : (
            <TablaBitacoraPasajes
              bitacoras={bitacorasTabla}
              seleccionadas={seleccionadas}
              onToggleSeleccion={toggleSeleccion}
              onToggleSeleccionarTodas={toggleSeleccionarTodas}
            />
          )}
        </div>

        {/* BARRA DE ACCIONES MASIVAS */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            {seleccionadas.length > 0
              ? `${seleccionadas.length} seleccionada${seleccionadas.length === 1 ? "" : "s"}`
              : "Selecciona registros para vista previa o descarga"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={seleccionadas.length === 0}
              onClick={vistaPreviaSeleccionadas}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Eye size={13} />
              Vista previa
            </button>

            <button
              type="button"
              disabled={seleccionadas.length === 0}
              onClick={descargarSeleccionadas}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Download size={13} />
              Descargar
            </button>
          </div>
        </div>

        {/* PAGINACIÓN */}
        <div className="h-[66px] shrink-0 flex items-center justify-between px-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Mostrando{" "}
            <b>
              {bitacorasTabla.length > 0
                ? `1-${bitacorasTabla.length}`
                : "0"}
            </b>{" "}
            de <b>{bitacorasTabla.length}</b> registros
          </p>

          <div className="flex items-center gap-2">
            {/* ANTERIOR */}
            <button
              type="button"
              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>

            {/* PÁGINA */}
            <button
              type="button"
              className="w-7 h-7 rounded-md bg-blue-500 text-white text-xs font-medium"
            >
              1
            </button>

            {/* SIGUIENTE */}
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
      {mostrarVistaPrevia && (
        <div
          onClick={cerrarVistaPrevia}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col relative"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
              <h3 className="text-sm font-semibold">Bitácora de Pasajes</h3>

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
                <FormatoBitacoraPasajes
                  ref={pdfVistaRef}
                  bitacoras={bitacorasSeleccionadas}
                  lugaresPorId={lugaresPorId}
                  adminsPorId={adminsPorId}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NODO OCULTO PARA CAPTURA PDF Y DESCARGA DIRECTA */}
      {datosDescarga && (
        <div className="fixed top-0 left-[-9999px] pointer-events-none">
          <FormatoBitacoraPasajes
            ref={pdfDescargaRef}
            bitacoras={datosDescarga}
            lugaresPorId={lugaresPorId}
            adminsPorId={adminsPorId}
          />
        </div>
      )}
    </UsuarioLayout>
  );
}

export default BitacoraPasajes;