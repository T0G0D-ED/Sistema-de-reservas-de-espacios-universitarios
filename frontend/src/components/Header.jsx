import logoUnab from "../assets/logo-unab.png";
import iconoLogin from "../assets/icono-login.png";

function Header({ vista, onCambiarVista, totalReservas }) {
  return (
    <header className="text-gray-600 bg-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between p-5">
        <button type="button" onClick={() => onCambiarVista("espacios")} className="flex items-center text-gray-900 mb-4 md:mb-0">
          <img src={logoUnab} alt="Logo UNAB" className="w-35 h-15 p-2" />
          <span className="ml-3 text-xl text-[#263762] font-semibold md:border-l md:border-gray-400 md:pl-4">ReservaUNAB</span>
        </button>
        <nav className="flex items-center text-base md:pl-5 md:ml-5 gap-5">
          <button type="button" onClick={() => onCambiarVista("espacios")} className={vista === "espacios" ? "text-[#263762] font-semibold border-b-2 border-[#263762] pb-1" : "text-gray-500 hover:text-[#263762]"}>Espacios</button>
          <button type="button" onClick={() => onCambiarVista("reservas")} className={vista === "reservas" ? "text-[#263762] font-semibold border-b-2 border-[#263762] pb-1 flex items-center gap-1" : "text-gray-500 flex items-center gap-1"}>Mis reservas <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full font-bold">{totalReservas}</span></button>
        </nav>
        <a href="https://portal2.unab.cl/ingresar-al-portal" className="px-4 py-2 bg-[#263762] text-white rounded-full md:ml-auto font-light hover:bg-[#3B5597]"><img src={iconoLogin} alt="Login" className="inline-block w-6 h-6 mr-1" /> ACCESO INTRANET</a>
      </div>
    </header>
  );
}

export default Header;