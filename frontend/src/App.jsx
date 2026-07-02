import { useState, useEffect } from "react";
import Login from "./Login";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [perfil, setPerfil] = useState(null);

  // 🔹 Obtener perfil
  const getPerfil = async (authToken) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/perfil/", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        console.log("Error HTTP:", res.status);
        return;
      }

      const data = await res.json();
      setPerfil(data);

    } catch (error) {
      console.log("Error perfil:", error);
    }
  };

  // 🔹 cargar perfil cuando hay token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      getPerfil(savedToken);
    }
  }, [token]);

  // 🔹 login no existe
  if (!token) {
    return <Login setToken={setToken} setPerfil={setPerfil} />;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Sistema de Bitácoras DIF</h1>

      <p>Usuario autenticado ✔</p>

      {/* PERFIL */}
      {perfil && (
        <div>
          <p><b>Usuario:</b> {perfil.username}</p>
          <p><b>Rol:</b> {perfil.roles?.join(", ")}</p>
        </div>
      )}

      {/* ADMIN */}
      {perfil?.roles?.includes("Admin") && (
        <div style={{ background: "#eee", padding: "10px" }}>
          <h3>Panel Admin</h3>
        </div>
      )}

      {/* CAPTURISTA */}
      {perfil?.roles?.includes("Capturista") && (
        <div style={{ background: "#f5f5f5", padding: "10px" }}>
          <h3>Panel Capturista</h3>
        </div>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("token");
          setToken(null);
          setPerfil(null);
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;