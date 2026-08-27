import { FileText } from "lucide-react";

function SelectorOficio({
  oficios,
  oficioSeleccionado,
  setOficioSeleccionado,
}) {
  return (
    <div className="mb-8">

      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Folio del oficio
      </label>

      <div className="relative">

        <FileText
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <select
          value={oficioSeleccionado}
          onChange={(e) =>
            setOficioSeleccionado(e.target.value)
          }
          className="w-full pl-10 pr-4 py-3 border border-gray-300
                     rounded-xl bg-white text-gray-700
                     focus:outline-none focus:ring-2
                     focus:ring-blue-500"
        >

          <option value="">
            Selecciona un folio
          </option>

          {oficios.map((oficio) => (
            <option
              key={oficio.id_oficio}
              value={oficio.id_oficio}
            >
              {oficio.folio ||
                `Oficio ${oficio.id_oficio}`}
            </option>
          ))}

        </select>

      </div>

    </div>
  );
}

export default SelectorOficio;