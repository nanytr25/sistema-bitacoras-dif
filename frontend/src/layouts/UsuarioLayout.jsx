import SidebarUsuario from "../components/usuario/SidebarUsuario";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UsuarioLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENEDOR CENTRAL (Sidebar + Main) */}
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <SidebarUsuario />

        {/* MAIN: Ocupa todo el espacio restante horizontal y verticalmente */}
        <main className="flex-1 flex flex-col p-6 min-w-0 overflow-hidden">
          {children}
        </main>

      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default UsuarioLayout;