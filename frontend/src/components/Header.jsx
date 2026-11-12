import logoUnab from "../assets/logo-unab.png";

function Header({ vista, onCambiarVista, totalReservas, usuario, esGestor, onAbrirSesion, onCerrarSesion }) {
  const vistas = [
    { id: "espacios", etiqueta: "Salas" },
    { id: "edificios", etiqueta: "Edificios" },
    { id: "reservas", etiqueta: esGestor ? "Solicitudes" : "Mis reservas" },
    ...(usuario?.rol === "ADMIN" ? [{ id: "administracion", etiqueta: "Administración" }] : []),
    ...(usuario ? [{ id: "historial", etiqueta: "Historial" }] : []),
    ...(esGestor ? [{ id: "dashboard", etiqueta: "Utilización" }] : []),
  ];

  return (
    <header className="text-gray-600 bg-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between p-5">
        <button type="button" onClick={() => onCambiarVista("espacios")} className="mb-4 flex items-center text-gray-900 md:mb-0">
          <img src={logoUnab} alt="Logo UNAB" className="w-35 h-15 p-2" />
          <span className="ml-3 text-xl text-[#263762] font-semibold md:border-l md:border-gray-400 md:pl-4">ReservaUNAB</span>
        </button>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm md:ml-5 md:pl-5 md:text-base">
          {vistas.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onCambiarVista(item.id)}
              className={vista === item.id
                ? "flex items-center gap-1 border-b-2 border-[#263762] pb-1 font-semibold text-[#263762]"
                : "flex items-center gap-1 text-gray-500 hover:text-[#263762]"}
            >
              {item.etiqueta}
              {item.id === "reservas" && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-800">{totalReservas}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-3 flex items-center gap-3 md:ml-auto md:mt-0">
          {usuario && <span className="text-sm text-gray-600">{usuario.nombre}</span>}
          <button
            type="button"
            onClick={usuario ? onCerrarSesion : onAbrirSesion}
            className="px-4 py-2 bg-[#263762] text-white rounded-full font-light hover:bg-[#3B5597]"
          >
            {usuario ? "Cerrar sesión" : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;