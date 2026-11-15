function Toast({ mensaje }) {
  const estilos = {
    success: "bg-green-50 text-green-700",
    info: "bg-[#263762]/10 text-[#263762]",
    warning: "bg-amber-50 text-amber-800",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div
      role={mensaje.tipo === "error" ? "alert" : "status"}
      aria-live={mensaje.tipo === "error" ? "assertive" : "polite"}
      className={`fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-sm rounded-lg p-4 text-sm shadow-md sm:inset-x-auto sm:bottom-5 sm:right-5 sm:mx-0 ${estilos[mensaje.tipo] || estilos.success}`}
    >
      {mensaje.texto}
    </div>
  );
}

export default Toast;