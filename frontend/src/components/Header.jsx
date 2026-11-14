import logoUnab from "../assets/logo-unab.png";

function Header({ vista, onCambiarVista, totalReservas, usuario, esGestor, onAbrirSesion, onCerrarSesion }) {
  const inicialUsuario = usuario?.nombre?.trim().charAt(0).toUpperCase() || "U";
  const vistas = [
    { id: "espacios", etiqueta: "Salas" },
    { id: "edificios", etiqueta: "Edificios" },
    { id: "reservas", etiqueta: esGestor ? "Solicitudes" : "Mis reservas" },
    ...(usuario?.rol === "ADMIN" ? [{ id: "administracion", etiqueta: "Administración" }] : []),
    ...(usuario ? [{ id: "historial", etiqueta: "Historial" }] : []),
    ...(esGestor ? [{ id: "dashboard", etiqueta: "Utilización" }] : []),
  ];

  return (
    <header className="border-b border-gray-200 bg-white text-gray-600 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center gap-x-5 gap-y-3 px-3 py-3 sm:px-5 lg:flex-nowrap lg:gap-6">
        <button type="button" onClick={() => onCambiarVista("espacios")} className="order-1 flex min-w-0 flex-1 items-center gap-2 text-left lg:flex-none">
          <img src={logoUnab} alt="Logo UNAB" className="h-10 w-16 shrink-0 object-contain sm:h-12 sm:w-20" />
          <span className="truncate border-l border-gray-200 pl-2 text-[17px] font-semibold tracking-tight text-[#263762] sm:pl-3 sm:text-lg">ReservaUNAB</span>
        </button>
        <nav aria-label="Navegación principal" className="order-3 flex w-full min-w-0 items-center gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1 lg:order-2 lg:w-auto lg:flex-1 lg:justify-center lg:overflow-visible">
          {vistas.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onCambiarVista(item.id)}
              aria-current={vista === item.id ? "page" : undefined}
              className={vista === item.id
                ? "flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-white px-3 text-sm font-semibold text-[#263762] shadow-sm ring-1 ring-gray-200 transition-colors"
                : "flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-[#263762]"}
            >
              {item.etiqueta}
              {item.id === "reservas" && (
                <span className="min-w-5 rounded-full bg-[#263762]/10 px-1.5 py-0.5 text-center text-xs font-semibold text-[#263762]">{totalReservas}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="order-2 ml-auto flex max-w-full items-center gap-2 lg:order-3">
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