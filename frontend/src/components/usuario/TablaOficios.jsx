import {
  Eye,
  Pencil,
  Trash2,
  Download,
  ArrowUpDown,
  Clock3,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";

function TablaOficios({
  oficios,
  onVisualizar,
  onEditar,
  onEliminar,
  onDescargar,
}) {

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

  return (
    /* Marco con borde gris y esquinas redondeadas que delimita la tabla dentro del espacio blanco */
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white" style={{ padding: "5mm",}}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="h-[48px] bg-[#f8f8f8] border-b border-gray-200">
            <th className="text-left px-3 text-[10px] font-semibold text-gray-700">
              <div className="flex items-center gap-1">
                Folio
                <ArrowUpDown size={10} />
              </div>
            </th>

            <th className="text-left px-3 text-[10px] font-semibold text-gray-700">
              Fecha
            </th>

            <th className="text-left px-3 text-[10px] font-semibold text-gray-700">
              Solicitante
            </th>

            <th className="text-left px-3 text-[10px] font-semibold text-gray-700">
              Motivo del Traslado
            </th>

            <th className="text-left px-3 text-[10px] font-semibold text-gray-700">
              Estado
            </th>

            <th className="text-center px-3 text-[10px] font-semibold text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {oficios.map((oficio) => (
            <tr
              key={oficio.id}
              className="h-[52px] border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
            >
              <td className="px-3 text-[10px] text-gray-500">
                {oficio.folio}
              </td>

              <td className="px-3 text-[10px] text-gray-600">
                {oficio.fecha}
              </td>

              <td className="px-3 text-[10px] font-semibold text-gray-700">
                {oficio.solicitante}
              </td>

              <td className="px-3 text-[10px] text-gray-500 italic">
                "{oficio.motivo}"
              </td>

              <td className="px-3">
                {obtenerEstado(oficio.estado)}
              </td>

              <td className="px-3">
                <div className="flex items-center justify-center gap-2">
                  {/* VER */}
                  <button
                    type="button"
                    title="Visualizar"
                    onClick={() => onVisualizar(oficio)}
                    className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                  >
                    <Eye size={13} />
                  </button>

                  {/* EDITAR */}
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => onEditar(oficio)}
                    className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center text-gray-500 transition"
                  >
                    <Pencil size={13} />
                  </button>

                  {/* ELIMINAR */}
                  <button
                    type="button"
                    title="Eliminar"
                    onClick={() => onEliminar(oficio)}
                    className="w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 transition"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* DESCARGAR */}
                  <button
                    type="button"
                    title="Descargar"
                    onClick={() => onDescargar(oficio)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-blue-500 transition"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaOficios;