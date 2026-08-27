import { CheckCircle, X } from "lucide-react";

function MensajeExito({ onClose }) {
  return (
    <div className="fixed top-8 right-7 z-50 w-[230px] bg-[#16a34a] text-white rounded-lg shadow-lg px-3 py-3 flex items-center justify-between">

      <div className="flex items-center gap-2">

        <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
          <CheckCircle size={12} />
        </div>

        <span className="text-[11px] font-semibold">
          Se guardó correctamente
        </span>

      </div>

      <button
        onClick={onClose}
        className="hover:opacity-70"
      >
        <X size={16} />
      </button>

    </div>
  );
}

export default MensajeExito;