import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Image,
  Trash2,
} from "lucide-react";

function DetalleEvidencia({
  foto,
  oficios,
  onVolver,
  onDescargar,
  onEditar,
  onEliminar,
}) {
  const oficio = oficios.find(
    (item) =>
      String(item.id_oficio) ===
      String(foto.id_oficio)
  );

  return (
    <div className="mt-8">

      {/* VOLVER */}
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-2
                   text-blue-600 hover:text-blue-800
                   font-medium mb-6"
      >
        <ArrowLeft size={20} />
        Volver a fotografías
      </button>

      {/* ENCABEZADO */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Detalle de evidencia
        </h2>

        <p className="text-gray-500 mt-1">
          Información de la fotografía seleccionada
        </p>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* IMAGEN */}
        <div className="bg-gray-100 rounded-2xl
                        overflow-hidden border
                        border-gray-200">

          <img
            src={foto.archivo}
            alt={`Evidencia ${foto.id_evidencia}`}
            className="w-full max-h-[550px]
                       object-contain"
          />

        </div>

        {/* DATOS */}
        <div className="space-y-4">

          {/* ID */}
          <div className="bg-gray-50 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <Image
                size={21}
                className="text-blue-600 mt-1"
              />

              <div>
                <p className="text-sm text-gray-500">
                  ID de evidencia
                </p>

                <p className="font-semibold text-gray-800">
                  {foto.id_evidencia}
                </p>
              </div>

            </div>

          </div>

          {/* FECHA */}
          <div className="bg-gray-50 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <Calendar
                size={21}
                className="text-blue-600 mt-1"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Fecha de subida
                </p>

                <p className="font-semibold text-gray-800">
                  {foto.fecha_subida
                    ? new Date(
                        foto.fecha_subida
                      ).toLocaleString("es-MX")
                    : "Sin fecha"}
                </p>
              </div>

            </div>

          </div>

          {/* OFICIO */}
          <div className="bg-gray-50 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <FileText
                size={21}
                className="text-blue-600 mt-1"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Comisión asociada
                </p>

                <p className="font-semibold text-gray-800">
                  {oficio?.folio ||
                    `Oficio ${foto.id_oficio}`}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  ID oficio: {foto.id_oficio}
                </p>
              </div>

            </div>

          </div>

          {/* ARCHIVO */}
          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-sm text-gray-500">
              Archivo
            </p>

            <p className="font-semibold text-gray-800
                          break-all mt-1">
              {foto.archivo}
            </p>

          </div>

          {/* BOTONES */}
          <div className="flex flex-wrap gap-3 pt-3">

            <button
              type="button"
              onClick={() => onDescargar(foto)}
              className="flex items-center gap-2
                         bg-blue-600 hover:bg-blue-700
                         text-white px-5 py-3
                         rounded-xl font-semibold"
            >
              <Download size={18} />
              Descargar
            </button>

            <button
              type="button"
              onClick={onEditar}
              className="flex items-center gap-2
                         bg-gray-700 hover:bg-gray-800
                         text-white px-5 py-3
                         rounded-xl font-semibold"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() =>
                onEliminar(foto.id_evidencia)
              }
              className="flex items-center gap-2
                         bg-red-600 hover:bg-red-700
                         text-white px-5 py-3
                         rounded-xl font-semibold"
            >
              <Trash2 size={18} />
              Eliminar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DetalleEvidencia;