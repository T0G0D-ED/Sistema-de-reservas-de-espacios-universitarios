import logoUnab from "../assets/logo-unab.png";

function Header({ vista, onCambiarVista, totalReservas, usuario, esGestor, onAbrirSesion, onCerrarSesion }) {
  const inicialUsuario = usuario?.nombre?.trim().charAt(0).toUpperCase() || "U";
  const vistas = [
    { id: "espacios", etiqueta: "Salas" },
    { id: "edificios", etiqueta: "Edificios" },
    { id: "reservas", etiqueta: esGestor ? "Solicitudes" : "Mis reservas" },
    ...(usuario?.rol === "ADMIN" ? [{ id: "administracion", etiqueta: "Administración" }] : []),
    ...(usuario ? [{ id: "historial", etiqueta: "Historial" }] : []),
    ...(esGestor && usuario?.rol !== "ADMIN" ? [{ id: "dashboard", etiqueta: "Utilización" }] : []),
  ];

  return (
    <header className="text-gray-600 bg-white">
      <div className="container mx-auto flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:gap-0">
        <button type="button" onClick={() => onCambiarVista("espacios")} className="mb-1 flex max-w-full items-center text-gray-900 md:mb-0">
          <img src={logoUnab} alt="Logo UNAB" className="h-12 w-24 object-contain p-1 sm:h-14 sm:w-32" />
          <span className="ml-2 truncate text-lg font-semibold text-[#263762] sm:text-xl md:border-l md:border-gray-400 md:pl-4">ReservaUNAB</span>
        </button>
        <nav aria-label="Navegación principal" className="flex w-full min-w-0 flex-nowrap items-center justify-start gap-4 overflow-x-auto px-1 pb-2 text-sm sm:gap-5 md:ml-5 md:w-auto md:flex-wrap md:justify-center md:overflow-visible md:pb-0 md:pl-5 md:text-base">
          {vistas.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onCambiarVista(item.id)}
              className={vista === item.id
                ? "flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap border-b-2 border-[#263762] pb-1 font-semibold text-[#263762]"
                : "flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap text-gray-500 hover:text-[#263762]"}
            >
              {item.etiqueta}
              {item.id === "reservas" && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-800">{totalReservas}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-1 flex max-w-full items-center justify-center gap-2 sm:gap-3 md:ml-auto md:mt-0">
          {usuario && (
            <div className="flex min-w-0 items-center gap-2 rounded-full bg-gray-50 py-1 pl-1 pr-2.5">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#263762]/10 text-sm font-semibold text-[#263762]">{inicialUsuario}</span>
              <span className="max-w-24 truncate text-sm font-medium text-gray-700 sm:max-w-32">{usuario.nombre}</span>
            </div>
          )}
          <button
            type="button"
            onClick={usuario ? onCerrarSesion : onAbrirSesion}
            className="min-h-10 whitespace-nowrap rounded-lg bg-[#263762] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3B5597] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#263762] sm:px-4"
          >
            {usuario ? "Cerrar sesión" : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;