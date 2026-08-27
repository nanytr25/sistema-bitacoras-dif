import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Trash2,
  FileText,
  MapPin,
} from "lucide-react";

import UsuarioLayout from "../../layouts/UsuarioLayout";

const API_URL = "http://127.0.0.1:8000/api";
const ORIGEN_FIJO = "SMDIF, Sanctorum de Lázaro Cárdenas";

function NuevoBitacoraPasajes() {
  const navigate = useNavigate();

  // ESTADOS
  const [areaUsuaria] = useState("Sistema Municipal para el Desarrollo Integral de la Familia");
  const [comisionado, setComisionado] = useState("");
  const [fecha, setFecha] = useState("");
  const [destinos, setDestinos] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [origen] = useState(ORIGEN_FIJO);
  const [origenId, setOrigenId] = useState("");
  const [autorizadores, setAutorizadores] = useState({
    autoriza_1: "",
    autoriza_2: "",
    autoriza_3: "",
  });
  const [viajes, setViajes] = useState([]);

  // INICIALIZAR FECHA Y PRIMER VIAJE (independiente de los fetches)
  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
    setViajes([
      { id: Date.now(), fecha: hoy, destino: "", tipo: "Foráneo", total: 0 },
    ]);
  }, []);


  const obtenerPerfil = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${API_URL}/perfil/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respuesta.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!respuesta.ok) throw new Error("No se pudo obtener el usuario actual.");

      const perfil = await respuesta.json();
      setComisionado(perfil.nombre_completo || perfil.username || "");
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      setError("No se pudo cargar el perfil del usuario.");
    }
  };

  const obtenerLugares = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${API_URL}/lugares/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respuesta.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!respuesta.ok) throw new Error("No se pudieron obtener los lugares.");

      const datos = await respuesta.json();
      const lista = Array.isArray(datos) ? datos : datos.results || [];
      setDestinos(lista);

      // BUSCA EL LUGAR REGISTRADO QUE COINCIDE CON EL ORIGEN FIJO
      const lugarOrigen = lista.find(
        (l) => (l.nombre || "").trim().toLowerCase() === ORIGEN_FIJO.trim().toLowerCase()
      );

      if (lugarOrigen) {
        setOrigenId(lugarOrigen.id_lugar);
      } else {
        setError(
          `No se encontró "${ORIGEN_FIJO}" en la lista de Lugares. Regístralo en Lugares para poder usarlo como origen.`
        );
      }
    } catch (err) {
      console.error("Error al obtener lugares:", err);
      setError("No se pudieron cargar los lugares.");
      setDestinos([]);
    }
  };

  const obtenerAdministradores = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${API_URL}/usuarios/?rol=Administrador`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respuesta.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!respuesta.ok) throw new Error("No se pudieron obtener los administradores.");

      const datos = await respuesta.json();
      const lista = Array.isArray(datos) ? datos : datos.results || [];
      setAdministradores(lista.filter((u) => u.rol === "Administrador"));
    } catch (err) {
      console.error("Error al obtener administradores:", err);
      setError("No se pudieron cargar los administradores.");
      setAdministradores([]);
    }
  };
  // CARGAR DATOS DESDE DJANGO (cada fetch independiente, uno no bloquea a los otros)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    obtenerPerfil();
    obtenerLugares();
    obtenerAdministradores();
  }, []);

  // AGREGAR VIAJE
  const agregarViaje = () => {
    setViajes((actuales) => [
      ...actuales,
      { id: Date.now(), fecha, destino: "", tipo: "Foráneo", total: 0 },
    ]);
  };

  // ELIMINAR VIAJE
  const eliminarViaje = (id) => {
    if (viajes.length === 1) {
      alert("Debe existir al menos un viaje.");
      return;
    }
    setViajes((actuales) => actuales.filter((viaje) => viaje.id !== id));
  };

  // ACTUALIZAR VIAJE
  const actualizarViaje = (id, campo, valor) => {
    setViajes((actuales) =>
      actuales.map((viaje) =>
        viaje.id !== id ? viaje : { ...viaje, [campo]: campo === "total" ? Number(valor) : valor }
      )
    );
  };

  // ACTUALIZAR AUTORIZADOR
  const actualizarAutorizador = (campo, valor) => {
    setAutorizadores((actuales) => ({ ...actuales, [campo]: valor }));
  };

  // TOTAL
  const totalComision = viajes.reduce((total, viaje) => total + Number(viaje.total || 0), 0);

  // CANTIDAD CON LETRA
  const cantidadConLetra = (numero) => {
    if (numero === 0) return "CERO PESOS 00/100 M.N.";
    return `${numero.toLocaleString("es-MX")} PESOS 00/100 M.N.`;
  };

  // GENERAR BITÁCORA
  const generarBitacora = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    if (!comisionado) {
      alert("No se encontró el usuario actual.");
      return;
    }

    if (!origenId) {
      alert(`No se pudo determinar el lugar de origen ("${ORIGEN_FIJO}"). Verifica que esté registrado en Lugares.`);
      return;
    }

    if (viajes.length === 0) {
      alert("Debe agregar por lo menos un viaje.");
      return;
    }

    const viajeIncompleto = viajes.find(
      (viaje) => !viaje.fecha || !viaje.destino || Number(viaje.total) <= 0
    );

    if (viajeIncompleto) {
      alert("Complete todos los datos de los viajes.");
      return;
    }

    if (!autorizadores.autoriza_1 || !autorizadores.autoriza_2 || !autorizadores.autoriza_3) {
      alert("Debe seleccionar los tres autorizadores.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      for (const viaje of viajes) {
        const datos = {
          fecha: viaje.fecha,
          tipo_pasaje: viaje.tipo,
          total: viaje.total,
          persona_gasto: comisionado,
          autoriza_1: autorizadores.autoriza_1,
          autoriza_2: autorizadores.autoriza_2,
          autoriza_3: autorizadores.autoriza_3,
          descripcion: `Comisión del ${origen} hacia ${viaje.destino}`,
          estado: "Pendiente",
          id_origen: origenId,
          id_destino: viaje.destino,
        };

        const respuesta = await fetch(`${API_URL}/bitacoras-pasajes/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(datos),
        });

        if (respuesta.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (!respuesta.ok) {
          const detalle = await respuesta.text();
          console.error("Respuesta Django:", detalle);
          throw new Error("No se pudo guardar uno de los viajes.");
        }
      }

      navigate("/usuario/bitacora-pasajes", {
        state: { mensaje: "La bitácora se guardó correctamente." },
      });
    } catch (error) {
      console.error("Error guardando bitácora:", error);
      setError(error.message || "Ocurrió un error al guardar la bitácora.");
    } finally {
      setGuardando(false);
    }
  };

  // CARGANDO
  if (cargando) {
    return (
      <UsuarioLayout>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Cargando información...</p>
          </div>
        </div>
      </UsuarioLayout>
    );
  }

  return (
    <UsuarioLayout>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
          {error}
        </div>
      )}

      <section className="flex-1 flex flex-col w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* ENCABEZADO */}
        <div className="h-[65px] flex items-center px-6 border-b border-gray-200">
          <div className="flex-1 flex justify-center">
            <h1 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Nueva Bitácora de Pasajes
            </h1>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div className="m-4 border border-gray-200 rounded-lg p-4">
          <h2 className="text-[12px] font-bold text-gray-800 mb-4">Reporte de Comisión y Pasajes</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] text-gray-500 mb-1">Área Usuaria</label>
              <div className="min-h-[38px] bg-[#f5f5ff] border border-indigo-100 rounded-md px-3 py-2 text-[10px] text-gray-700">
                {areaUsuaria}
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-gray-500 mb-1">Nombre del Comisionado</label>
              <div className="h-[38px] bg-[#f5f5ff] border border-indigo-100 rounded-md px-3 flex items-center text-[10px] text-gray-700">
                {comisionado}
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-gray-500 mb-1">Fecha</label>
              <div className="flex items-center border border-gray-200 rounded-md h-[38px] px-3">
                <CalendarDays size={13} className="text-gray-500 mr-2" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setViajes((actuales) =>
                      actuales.map((viaje) => ({ ...viaje, fecha: viaje.fecha || e.target.value }))
                    );
                  }}
                  className="w-full text-[10px] text-gray-700 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE VIAJES */}
        <div className="mx-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f8ff] border-b border-gray-200">
                  <th className="px-3 py-3 text-left text-[9px] text-blue-500">Fecha</th>
                  <th className="px-3 py-3 text-left text-[9px] text-blue-500">Lugar de Origen</th>
                  <th className="px-3 py-3 text-left text-[9px] text-blue-500">Destino</th>
                  <th className="px-3 py-3 text-center text-[9px] text-blue-500">Tipo de Pasaje</th>
                  <th className="px-3 py-3 text-left text-[9px] text-blue-500">Total ($)</th>
                  <th className="px-3 py-3 text-center text-[9px] text-blue-500">Acción</th>
                </tr>
              </thead>

              <tbody>
                {viajes.map((viaje) => (
                  <tr key={viaje.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      <div className="flex items-center border border-gray-200 rounded-md h-[30px] px-2">
                        <CalendarDays size={11} className="text-gray-500 mr-1" />
                        <input
                          type="date"
                          value={viaje.fecha}
                          onChange={(e) => actualizarViaje(viaje.id, "fecha", e.target.value)}
                          className="w-full text-[9px] outline-none"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center h-[30px] px-2 bg-gray-50 border border-gray-200 rounded-md text-[9px] text-gray-600">
                        <MapPin size={11} className="text-gray-400 mr-1 shrink-0" />
                        <span className="truncate">{origen}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <select
                        value={viaje.destino}
                        onChange={(e) => actualizarViaje(viaje.id, "destino", e.target.value)}
                        className="w-full h-[30px] border border-gray-200 rounded-md px-2 text-[9px] text-gray-700 outline-none bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                      >
                        <option value="">Seleccionar destino</option>
                        {destinos.map((lugar) => (
                          <option key={lugar.id_lugar} value={lugar.id_lugar}>
                            {lugar.nombre}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 text-[9px]">
                          <input
                            type="radio"
                            name={`tipo-${viaje.id}`}
                            checked={viaje.tipo === "Local"}
                            onChange={() => actualizarViaje(viaje.id, "tipo", "Local")}
                          />
                          Local
                        </label>
                        <label className="flex items-center gap-1 text-[9px]">
                          <input
                            type="radio"
                            name={`tipo-${viaje.id}`}
                            checked={viaje.tipo === "Foráneo"}
                            onChange={() => actualizarViaje(viaje.id, "tipo", "Foráneo")}
                          />
                          Foráneo
                        </label>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center border border-gray-200 rounded-md h-[30px]">
                        <span className="px-2 text-[9px] text-gray-500 border-r border-gray-200">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={viaje.total}
                          onChange={(e) => actualizarViaje(viaje.id, "total", e.target.value)}
                          className="w-full px-2 text-[9px] outline-none"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => eliminarViaje(viaje.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center py-3">
            <button
              type="button"
              onClick={agregarViaje}
              className="border border-cyan-300 text-cyan-500 hover:bg-cyan-50 px-4 py-2 rounded-md text-[10px] flex items-center gap-2"
            >
              <Plus size={13} />
              Agregar nuevo viaje
            </button>
          </div>
        </div>

        {/* TOTAL */}
        <div className="mx-4 mt-4 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="w-[55%]">
            <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-2">
              Cantidad con letra
            </label>
            <div className="border border-gray-200 rounded-md p-3 text-[10px] italic text-gray-600">
              {cantidadConLetra(totalComision)}
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase">Bueno por</p>
            <p className="text-[22px] font-bold text-indigo-500">
              ${totalComision.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[8px] text-gray-400">Monto Total de Comisión</p>
          </div>
        </div>

        {/* AUTORIZACIONES */}
        <div className="mx-4 mt-4 border border-red-100 rounded-lg p-4">
          <div className="mb-5">
            <label className="block text-[9px] text-gray-500 uppercase mb-2">
              Persona que realiza el gasto
            </label>
            <div className="w-[300px] min-h-[32px] bg-[#f5f5ff] border border-indigo-100 rounded-md px-3 py-2 text-[10px] text-gray-700">
              {comisionado}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((numero) => {
              const campo = `autoriza_${numero}`;
              return (
                <div key={numero}>
                  <label className="block text-[9px] text-gray-500 uppercase mb-2">
                    Autoriza {numero}
                  </label>
                  <select
                    value={autorizadores[campo]}
                    onChange={(e) => actualizarAutorizador(campo, e.target.value)}
                    className="w-full h-[32px] border border-gray-200 rounded-md px-2 text-[10px] text-gray-700 outline-none bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                  >
                    <option value="">Seleccionar administrador</option>
                    {administradores.map((administrador) => (
                      <option key={administrador.id_usuario} value={administrador.id_usuario}>
                        {administrador.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/usuario/bitacora-pasajes")}
            className="px-6 py-2 rounded-md border border-gray-200 bg-white text-blue-500 text-[10px] shadow-sm hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => console.log("Vista previa:", { viajes, autorizadores, totalComision })}
            className="px-6 py-2 rounded-md bg-white text-blue-500 text-[10px] shadow-sm border border-gray-100 hover:bg-blue-50"
          >
            Vista previa PDF
          </button>

          <button
            type="button"
            disabled={guardando}
            onClick={generarBitacora}
            className="px-6 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white text-[10px] shadow-sm"
          >
            {guardando ? "Guardando..." : "Generar Bitácora"}
          </button>
        </div>
      </section>
    </UsuarioLayout>
  );
}

export default NuevoBitacoraPasajes;