import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, LogIn } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (data.access) {
        localStorage.setItem("token", data.access);

        const perfilRes = await fetch(`${API_URL}/perfil/`, {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        });

        const perfil = await perfilRes.json();
        console.log("RESPUESTA DE PERFIL DE LA API:", perfil);

        // Convierte los roles a texto en minúsculas (soporta si vienen como strings o como objetos)
        const roles = (perfil.roles || []).map((r) =>
          (typeof r === "string" ? r : r.nombre || r.name || r.role || "").toLowerCase()
        );

        console.log("ROLES PROCESADOS:", roles);

        // Verifica si incluye variantes de administrador o capturista
        const esAdmin = roles.some((r) => r.includes("admin") || r.includes("administrador"));
        const esCapturista = roles.some((r) => r.includes("capturista"));

        if (esAdmin) {
          console.log("Redirigiendo a Aprobaciones (Admin)");
          navigate("/admin/aprobaciones-oficios");
        } else if (esCapturista) {
          console.log("Redirigiendo a Oficio Comisión (Capturista)");
          navigate("/usuario/oficio-comision");
        } else {
          console.log("Sin rol específico detectado, enviando a Dashboard por defecto");
          navigate("/dashboard");
        }
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-[#e0effe]">
      {/* Panel Izquierdo - Ilustrativo */}
      <div
        className="hidden lg:flex w-1/2 min-h-screen relative bg-cover bg-top items-center justify-center"
        style={{
          backgroundImage: "url('/img/sanct.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0099ff]/50 via-[#0099ff]/70 to-[#e0effe]" />

        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white">
          <div className="flex justify-center mt-4">
            <img
              src="/img/escudo.png"
              className="w-72 h-auto drop-shadow-md"
              alt="Escudo"
            />
          </div>

          <div className="flex flex-col items-center my-auto">
            <h1 className="text-3xl font-extrabold italic tracking-wider text-center drop-shadow">
              SISTEMA INTEGRAL DE
            </h1>
            <h2 className="text-3xl font-extrabold italic tracking-wider text-center drop-shadow mt-1">
              BITÁCORAS DIF
            </h2>
            <div className="w-56 h-[2px] bg-white/70 mt-4"></div>
          </div>

          <div className="mb-2">
            <p className="text-lg font-bold drop-shadow">
              Administración 2024 - 2027
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 z-10">
        <div className="bg-white w-full max-w-xl min-h-[650px] rounded-3xl shadow-2xl pt-10 px-10 pb-12 border border-cyan-50 flex flex-col items-center justify-start"style={{ padding: "10mm",}}>
          <div className="w-full flex justify-start mb-6">
            <img
              src="/img/logo-dif.png"
              className="h-15 object-contain"
              alt="SMDIF"
            />
          </div>

          <div className="flex justify-center my-2">
            <img
              src="/img/logo-ayuntamiento.jpg"
              className="h-30 object-contain"
              alt="Ayuntamiento"
            />
          </div>

          <h2 className="text-center text-3xl font-bold text-[#0e7490] mt-8 mb-6"style={{ marginTop: "20px" }}>
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            {/* Campo Usuario */}
            <div className="flex flex-col gap-1">
              <label className="text-[#0e7490] text-xl font-semibold text-left"style={{ marginTop: "20px" }}>
                Usuario
              </label>

              <div className="flex items-center border border-cyan-400 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-cyan-500 transition-all"style={{ marginTop: "10px" }}>
                <User size={16} className="text-cyan-600 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ingrese su usuario"
                  className="w-full outline-none text-lg text-gray-700 bg-transparent"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="flex flex-col gap-1"style={{ marginTop: "10px" }}>
              <label className="text-[#0e7490] text-xl font-semibold text-left">
                Contraseña
              </label>

              <div className="flex items-center border border-cyan-400 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-cyan-500 transition-all"style={{ marginTop: "10px" }}>
                <Lock size={16} className="text-cyan-600 mr-2 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full outline-none text-lg text-gray-700 bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Eye
                  size={16}
                  className="text-cyan-600 cursor-pointer shrink-0 hover:text-cyan-800"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>

            <div className="text-right pt-1">
              <a
                href="#"
                className="text-[#0e7490] text-base font-semibold hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Ingresar */}
            <div className="mt-6 w-full flex justify-center"style={{ marginTop: "30px" }}>
              <button
                type="submit"
                disabled={loading}
                className="w-64 px-6 py-3 bg-[#248da5] hover:bg-[#1a6e82] text-white rounded-xl flex justify-center items-center gap-2 font-bold text-sm tracking-wider transition shadow-md disabled:opacity-50"
              >
                <LogIn size={30} />
                {loading ? "CARGANDO..." : "INGRESAR"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6"style={{ marginTop: "30px" }}>
            <p className="text-sm text-gray-400">
              ¿No tienes una cuenta?
              <span className="text-cyan-600 cursor-pointer font-bold ml-1 hover:underline">
                Regístrate
              </span>
            </p>
          </div>

          <div className="mt-3 text-cyan-600">
            <Lock size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;