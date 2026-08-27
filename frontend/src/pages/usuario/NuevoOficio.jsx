import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FileText, Save } from "lucide-react";

import UsuarioLayout from "../../layouts/UsuarioLayout";

function NuevoOficio() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const modoEdicion = Boolean(id);

  // Recibir posibles datos del estado (folio, contexto global, etc.)
  const datosIniciales = location.state || {};

  const [formulario, setFormulario] = useState({
    fecha_emision: new Date().toISOString().split("T")[0],
    lugar_expedicion: "Sanctorum de Lázaro Cárdenas, Tlax.",
    funcionario_autorizador: "",
    cargo_autorizador: "",
    adscripcion: "",
    fecha_traslado: "",
    motivo_comision: "",
    nombre_comisionado: "",
    cargo_comisionado: "",
    id_lugar: "",
    nombre_lugar: "",
  });

  const [lugares, setLugares] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cambiarCampo = (campo, valor) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  };

  const inicializar = async () => {
    try {
      setCargando(true);
      setError("");

      const [listaLugares] = await Promise.all([
        obtenerLugares(),
        obtenerAdministradores(),
      ]);

      if (modoEdicion) {
        const oficio = await obtenerOficio();
        if (!oficio) return;

        const lugarDelOficio = listaLugares.find(
          (l) => String(l.id_lugar) === String(oficio.id_lugar ?? oficio.lugar?.id_lugar)
        );

        setFormulario({
          fecha_emision: oficio.fecha_emision || "",
          lugar_expedicion: oficio.lugar_expedicion || "Sanctorum de Lázaro Cárdenas, Tlax.",
          funcionario_autorizador: oficio.funcionario_autorizador || "",
          cargo_autorizador: oficio.cargo_autorizador || "",
          adscripcion: oficio.adscripcion || "",
          fecha_traslado: oficio.fecha_traslado || "",
          motivo_comision: oficio.motivo_comision || "",
          nombre_comisionado: oficio.nombre_comisionado || "",
          cargo_comisionado: oficio.cargo_comisionado || "",
          id_lugar: oficio.id_lugar ?? oficio.lugar?.id_lugar ?? "",
          nombre_lugar: lugarDelOficio ? lugarDelOficio.nombre : "",
        });
      } else {
        await obtenerPerfil();
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del formulario.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerLugares = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/lugares/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return [];
      }

      if (!response.ok) throw new Error("Error al obtener lugares");

      const data = await response.json();
      const lista = Array.isArray(data) ? data : data.results || [];
      setLugares(lista);
      return lista;
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los lugares.");
      setLugares([]);
      return [];
    }
  };

  const obtenerAdministradores = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/administradores/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return [];
      }

      if (!response.ok) throw new Error("Error al obtener administradores");

      const data = await response.json();
      const lista = Array.isArray(data) ? data : data.results || [];
      setAdministradores(lista);
      return lista;
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los administradores.");
      setAdministradores([]);
      return [];
    }
  };

  const obtenerPerfil = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/perfil/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("Error al obtener perfil");

      const data = await response.json();
      setFormulario((prev) => ({
        ...prev,
        nombre_comisionado: data.nombre_completo || data.username || "",
        cargo_comisionado: data.cargo || "",
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el perfil del usuario.");
    }
  };

  const obtenerOficio = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/api/oficios/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return null;
      }

      if (!response.ok) throw new Error("No se pudo obtener el oficio.");

      return await response.json();
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el oficio seleccionado.");
      return null;
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    inicializar();
  }, [id]);
  const seleccionarAdministrador = (idAdmin) => {
    const admin = administradores.find((a) => String(a.id) === String(idAdmin));
    if (admin) {
      setFormulario((prev) => ({
        ...prev,
        funcionario_autorizador: admin.nombre || admin.username || "",
        cargo_autorizador: admin.cargo || "",
      }));
    } else {
      setFormulario((prev) => ({
        ...prev,
        funcionario_autorizador: "",
        cargo_autorizador: "",
      }));
    }
  };

  const seleccionarLugar = (idLugar) => {
    const lugar = lugares.find((l) => String(l.id_lugar) === String(idLugar));
    setFormulario((prev) => ({
      ...prev,
      id_lugar: idLugar,
      nombre_lugar: lugar ? lugar.nombre : "",
    }));
  };

  const guardarOficio = async (e) => {
    e.preventDefault();
    if (guardando) return;

    if (!formulario.fecha_emision || !formulario.funcionario_autorizador || !formulario.id_lugar) {
      setError("Por favor completa los campos requeridos.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const payload = {
        ...formulario,
        id_lugar: Number(formulario.id_lugar),
      };

      const url = modoEdicion
        ? `http://127.0.0.1:8000/api/oficios/${id}/`
        : "http://127.0.0.1:8000/api/oficios/";

      const response = await fetch(url, {
        method: modoEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        const errorRespuesta = await response.json().catch(() => null);
        console.error("Detalle de respuesta del Backend:", errorRespuesta);

        throw new Error(
          typeof errorRespuesta === "object"
            ? JSON.stringify(errorRespuesta)
            : `No se pudo ${modoEdicion ? "actualizar" : "guardar"} el oficio`
        );
      }

      navigate("/usuario/oficio-comision", {
        state: {
          mensaje: modoEdicion
            ? "Oficio actualizado correctamente."
            : "Oficio guardado correctamente.",
        },
      });
    } catch (err) {
      console.error(err);
      setError(`Error del servidor: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <UsuarioLayout>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold">X</button>
        </div>
      )}

      <section className="flex-1 flex flex-col w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden my-6">
        <div className="h-[76px] flex items-center justify-between px-7 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={19} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-gray-800">
                {modoEdicion
                  ? "Editar Oficio de Comisión"
                  : `Nuevo Oficio de Comisión ${datosIniciales.siguienteFolio ? `(${datosIniciales.siguienteFolio})` : ""}`}
              </h1>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={guardarOficio}>
            <div className="p-7 space-y-7">
              {/* 1. ENCABEZADO */}
              <div>
                <h2 className="text-[13px] font-bold text-gray-700 mb-4">1. Encabezado del Trámite</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Fecha de Emisión</label>
                    <input
                      type="date"
                      value={formulario.fecha_emision}
                      onChange={(e) => cambiarCampo("fecha_emision", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Lugar de Expedición</label>
                    <input
                      type="text"
                      readOnly
                      value={formulario.lugar_expedicion}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 bg-gray-50 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. DESTINATARIO */}
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-[13px] font-bold text-gray-700 mb-4">2. Datos del Destinatario</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Funcionario Autorizador</label>
                    <select
                      value={
                        administradores.find(
                          (a) => (a.nombre || a.username) === formulario.funcionario_autorizador
                        )?.id || ""
                      }
                      onChange={(e) => seleccionarAdministrador(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-400"
                    >
                      <option value="">Seleccionar administrador</option>
                      {administradores.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.nombre || admin.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Cargo</label>
                    <input
                      type="text"
                      readOnly
                      value={formulario.cargo_autorizador}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 bg-gray-50 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Adscripción</label>
                    <input
                      type="text"
                      value={formulario.adscripcion}
                      onChange={(e) => cambiarCampo("adscripcion", e.target.value)}
                      placeholder="Ej. Presidencia Municipal"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* 3. COMISIÓN */}
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-[13px] font-bold text-gray-700 mb-4">3. Datos de la Comisión</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Fecha del Traslado</label>
                    <input
                      type="date"
                      value={formulario.fecha_traslado}
                      onChange={(e) => cambiarCampo("fecha_traslado", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Lugar de Destino</label>
                    <select
                      value={formulario.id_lugar}
                      onChange={(e) => seleccionarLugar(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-400"
                    >
                      <option value="">Seleccionar lugar de destino</option>
                      {lugares.map((lugar) => (
                        <option key={lugar.id_lugar} value={lugar.id_lugar}>
                          {lugar.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Motivo de la Comisión</label>
                    <textarea
                      rows="3"
                      value={formulario.motivo_comision}
                      onChange={(e) => cambiarCampo("motivo_comision", e.target.value)}
                      placeholder="Escriba el objetivo o motivo de la comisión..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 outline-none resize-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* 4. COMISIONADO */}
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-[13px] font-bold text-gray-700 mb-4">4. Datos del Comisionado</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Nombre</label>
                    <input
                      type="text"
                      readOnly
                      value={formulario.nombre_comisionado}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 bg-gray-50 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">Cargo</label>
                    <input
                      type="text"
                      readOnly
                      value={formulario.cargo_comisionado}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 bg-gray-50 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex items-center justify-end gap-3 px-7 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/usuario/oficio-comision")}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Save size={15} /> {guardando ? "Guardando..." : modoEdicion ? "Guardar Cambios" : "Guardar Oficio"}
              </button>
            </div>
          </form>
        )}
      </section>
    </UsuarioLayout>
  );
}

export default NuevoOficio;