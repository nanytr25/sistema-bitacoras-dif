import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

function ModalEliminar({ oficio, onCancelar, onConfirmar }) {
  // Escuchar tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancelar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancelar]);

  // Si no hay oficio seleccionado (es null o undefined), NO se renderiza
  if (!oficio) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* CAPA DE FONDO OSCURO (Si hace clic aquí, también se cancela/cierra) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancelar}
      />

      {/* TARJETA MODAL */}
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 p-5 z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* BOTÓN "X" SUPERIOR (Ejecuta onCancelar) */}
        <button
          type="button"
          onClick={onCancelar}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition"
        >
          <X size={16} />
        </button>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-800">
              ¿Desea eliminar este oficio?
            </h3>

            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Esta acción no se puede deshacer. Se borrará permanentemente del sistema.
            </p>

            {oficio?.numeroOficio && (
              <span className="inline-block mt-2 font-semibold text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                Oficio: {oficio.numeroOficio}
              </span>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center justify-end gap-2 mt-5">
          {/* BOTÓN CANCELAR (Ejecuta onCancelar) */}
          <button
            type="button"
            onClick={onCancelar}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition"
          >
            Cancelar
          </button>

          {/* BOTÓN ELIMINAR */}
          <button
            type="button"
            onClick={() => onConfirmar(oficio)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEliminar;