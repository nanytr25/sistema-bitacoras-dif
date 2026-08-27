import { useRef, useState } from "react";
import { Camera, MapPin, Upload } from "lucide-react";

function SubirFotos({ onSubirFoto }) {
  const inputRef = useRef(null);

  const [obteniendoUbicacion, setObteniendoUbicacion] =
    useState(false);

  const seleccionarFoto = async (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    setObteniendoUbicacion(true);

    // Obtener ubicación
    if (!navigator.geolocation) {
      setObteniendoUbicacion(false);

      onSubirFoto(archivo, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacion = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        };

        console.log("Ubicación:", ubicacion);

        setObteniendoUbicacion(false);

        onSubirFoto(archivo, ubicacion);
      },
      (error) => {
        console.error(
          "No se pudo obtener la ubicación:",
          error
        );

        setObteniendoUbicacion(false);

        // La fotografía se puede subir aunque
        // el usuario no permita la ubicación.
        onSubirFoto(archivo, null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    e.target.value = "";
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">

      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <Camera
            size={32}
            className="text-blue-600"
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800">
        Agregar fotografía
      </h2>

      <p className="text-sm text-gray-500 mt-1 mb-5">
        La fecha y hora se registrarán automáticamente.
      </p>

      {obteniendoUbicacion && (
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-4">
          <MapPin size={18} />

          Obteniendo ubicación...
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={seleccionarFoto}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={obteniendoUbicacion}
        className="inline-flex items-center gap-2 bg-blue-600
                   hover:bg-blue-700 text-white px-6 py-3
                   rounded-xl font-semibold transition
                   disabled:opacity-50"
      >
        <Upload size={20} />

        Seleccionar fotografía
      </button>

    </div>
  );
}

export default SubirFotos;