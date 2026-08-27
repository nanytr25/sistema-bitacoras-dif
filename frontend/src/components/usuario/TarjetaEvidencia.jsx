import {
  CalendarDays,
  MoreVertical,
  CheckCircle,
  Trash2,
} from "lucide-react";

function TarjetaEvidencia({
  foto,
  onEliminar,
}) {

  return (

    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-lg
        overflow-hidden
        shadow-sm
        hover:shadow-md
        transition
      "
    >

      {/* ================================= */}
      {/* IMAGEN */}
      {/* ================================= */}

      <div
        className="
          relative
          h-[130px]
          bg-gray-100
        "
      >

        <img
          src={foto.imagen}
          alt={foto.nombre}
          className="
            w-full
            h-full
            object-cover
          "
        />


        {/* ESTADO */}

        {foto.comprobada && (

          <div
            className="
              absolute
              top-2
              right-2
              bg-white/90
              rounded-full
              px-2
              py-1
              flex
              items-center
              gap-1
              shadow-sm
            "
          >

            <span
              className="
                text-[7px]
                text-gray-600
              "
            >
              Comprobada
            </span>

            <CheckCircle
              size={8}
              className="text-green-500"
            />

          </div>

        )}

      </div>


      {/* ================================= */}
      {/* INFORMACIÓN */}
      {/* ================================= */}

      <div className="p-2.5">

        <div
          className="
            flex
            items-start
            justify-between
            gap-2
          "
        >

          <p
            className="
              text-[9px]
              font-medium
              text-gray-700
              truncate
            "
            title={foto.nombre}
          >
            {foto.nombre}
          </p>


          {/* MENÚ */}

          <div className="relative group">

            <button
              className="
                text-gray-400
                hover:text-gray-600
              "
            >

              <MoreVertical size={13} />

            </button>


            {/* OPCIONES */}

            <div
              className="
                hidden
                group-hover:block
                absolute
                right-0
                top-4
                z-20
                bg-white
                border
                border-gray-200
                rounded-md
                shadow-md
                overflow-hidden
              "
            >

              <button
                onClick={() =>
                  onEliminar(
                    foto.id
                  )
                }
                className="
                  px-3
                  py-2
                  flex
                  items-center
                  gap-2
                  text-[8px]
                  text-red-500
                  hover:bg-red-50
                  whitespace-nowrap
                "
              >

                <Trash2 size={10} />

                Eliminar

              </button>

            </div>

          </div>

        </div>


        {/* FECHA */}

        <div
          className="
            flex
            items-center
            gap-1
            mt-2
            text-[8px]
            text-gray-400
          "
        >

          <CalendarDays size={10} />

          {foto.fecha}

        </div>

      </div>

    </div>

  );

}

export default TarjetaEvidencia;