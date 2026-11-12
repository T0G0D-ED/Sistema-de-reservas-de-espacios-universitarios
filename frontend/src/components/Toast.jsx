function Toast({ mensaje }) {
  const estilos = {
    success: "bg-green-50 text-green-700",
    info: "bg-[#263762]/10 text-[#263762]",
    warning: "bg-amber-50 text-amber-800",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div role="alert" className={`fixed bottom-5 right-5 z-[60] max-w-sm p-4 rounded-lg text-sm shadow-md ${estilos[mensaje.tipo] || estilos.success}`}>
      {mensaje.texto}
    </div>
  );
}

export default Toast;