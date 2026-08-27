import {
  ArrowUpDown,
  Clock3,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";

function TablaBitacoraPasajes({
  bitacoras,
  seleccionadas,
  onToggleSeleccion,
  onToggleSeleccionarTodas,
}) {
  // =========================================
  // ESTADO
  // =========================================

  const obtenerEstado = (estado) => {
    switch (estado) {
      case "Pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 text-[11px] font-medium">
            <Clock3 size={12} />
            Pendiente
          </span>
        );

      case "Aprobado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-[11px] font-medium">
            <CheckCircle size={12} />
            Aprobado
          </span>
        );

      case "Observado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-medium">
            <Info size={12} />
            Observado
          </span>
        );

      case "Rechazado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-500 text-[11px] font-medium">
            <XCircle size={12} />
            Rechazado
          </span>
        );

      default:
        return null;
    }
  };

  const todasSeleccionadas =
    bitacoras.length > 0 && bitacoras.every((b) => seleccionadas.includes(b.id));

  return (
    <div className="px-4 overflow-x-auto" style={{ padding: "5mm",}}>
      <table className="w-full border-collapse">
        {/* ================================= */}
        {/* CABECERA */}
        {/* ================================= */}

        <thead>
          <tr className="h-[48px] bg-[#f8f8f8] border-b border-gray-200">
            {/* CHECKBOX SELECCIONAR TODAS */}
            <th className="w-10 px-4">
              <input
                type="checkbox"
                checked={todasSeleccionadas}
                onChange={() => onToggleSeleccionarTodas(bitacoras)}
                className="w-3.5 h-3.5 cursor-pointer accent-blue-500"
              />
            </th>

            {/* FECHA */}
            <th className="text-left px-4 text-[10px] font-semibold text-gray-700">
              <div className="flex items-center gap-1">
                Fecha
                <ArrowUpDown size={10} />
              </div>
            </th>

            {/* LUGAR */}
            <th className="text-left px-4 text-[10px] font-semibold text-gray-700">
              Lugar
            </th>

            {/* TOTAL */}
            <th className="text-left px-4 text-[10px] font-semibold text-gray-700">
              Total
            </th>

            {/* ESTADO */}
            <th className="text-left px-4 text-[10px] font-semibold text-gray-700">
              Estado
            </th>
          </tr>
        </thead>

        {/* ================================= */}
        {/* CUERPO */}
        {/* ================================= */}

        <tbody>
          {bitacoras.map((bitacora) => (
            <tr
              key={bitacora.id}
              className="h-[52px] border-b border-gray-200 hover:bg-gray-50 transition"
            >
              {/* CHECKBOX FILA */}
              <td className="px-4">
                <input
                  type="checkbox"
                  checked={seleccionadas.includes(bitacora.id)}
                  onChange={() => onToggleSeleccion(bitacora.id)}
                  className="w-3.5 h-3.5 cursor-pointer accent-blue-500"
                />
              </td>

              {/* FECHA */}
              <td className="px-4 text-[10px] text-gray-600">
                {bitacora.fecha}
              </td>

              {/* LUGAR */}
              <td className="px-4 text-[10px] font-medium text-gray-700">
                {bitacora.lugar}
              </td>

              {/* TOTAL */}
              <td className="px-4 text-[10px] font-semibold text-gray-700">
                {bitacora.total}
              </td>

              {/* ESTADO */}
              <td className="px-4">{obtenerEstado(bitacora.estado)}</td>
            </tr>
          ))}

          {/* SIN REGISTROS */}
          {bitacoras.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-10 text-xs text-gray-400">
                No hay registros de bitácoras.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaBitacoraPasajes;