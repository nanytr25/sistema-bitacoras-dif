function Navbar() {
  return (
    <header className="h-[86px] bg-white border-b border-gray-200 grid grid-cols-3 items-center px-6">
      {/* LOGO DIF — arriba a la izquierda */}
      <div className="flex items-center">
        <img src="/img/logo-dif.png" alt="SMDIF" className="h-12 object-contain" />
      </div>

      {/* LOGO AYUNTAMIENTO — centrado */}
      <div className="flex items-center justify-center">
        <img src="/img/logo-ayuntamiento.jpg" alt="SMDIF Sanctórum" className="h-[65px] object-contain" />
      </div>

      {/* ESPACIO DERECHO (vacío, para balancear el grid) */}
      <div />
    </header>
  );
}

export default Navbar;