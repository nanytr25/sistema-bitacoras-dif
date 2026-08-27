import { Camera, Calendar } from "lucide-react";

function ListaFotos({ fotos, onSeleccionar }) {
  return (
    <div className="mt-8">

      <div className="flex items-center gap-2 mb-5">
        <Camera
          size={22}
          className="text-blue-600"
        />

        <h2 className="text-xl font-bold text-gray-800">
          Fotografías del oficio
        </h2>
      </div>

      {fotos.length === 0 ? (

        <div className="text-center py-12 border border-gray-200 rounded-xl">

          <Camera
            size={45}
            className="mx-auto text-gray-300 mb-3"
          />

          <p className="text-gray-500">
            No existen fotografías para este oficio.
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {fotos.map((foto) => (

            <div
              key={foto.id_evidencia}
              onClick={() => {
                console.log("CLICK EN FOTO");
                console.log(foto);

                onSeleccionar(foto);
              }}
              className="bg-white border border-gray-200
                         rounded-xl overflow-hidden
                         shadow-sm cursor-pointer
                         hover:shadow-lg
                         hover:border-blue-500
                         transition duration-200"
            >

              <div className="aspect-video bg-gray-100">

                <img
                  src={foto.archivo}
                  alt={`Evidencia ${foto.id_evidencia}`}
                  className="w-full h-full object-cover
                             pointer-events-none"
                />

              </div>

              <div className="p-4">

                <p className="font-semibold text-gray-800">
                  Evidencia #{foto.id_evidencia}
                </p>

                <div className="flex items-center gap-2 mt-2 text-gray-500">

                  <Calendar size={16} />

                  <span className="text-sm">
                    {foto.fecha_subida
                      ? new Date(
                          foto.fecha_subida
                        ).toLocaleString("es-MX")
                      : "Sin fecha"}
                  </span>

                </div>

                <p className="text-xs text-blue-600 mt-3">
                  Clic para ver detalle
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default ListaFotos;