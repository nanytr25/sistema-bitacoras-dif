import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/")
      .then(res => res.json())
      .then(data => setMensaje(data.mensaje))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Sistema de Bitácoras DIF</h1>
      <h2>{mensaje}</h2>
    </div>
  );
}

export default App;