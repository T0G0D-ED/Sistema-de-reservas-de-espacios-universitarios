function Toast({ mensaje }) {
  return <div role="alert" className={`fixed bottom-5 right-5 z-[60] max-w-sm p-4 rounded-lg text-sm shadow-md ${mensaje.tipo === "info" ? "bg-[#263762]/10 text-[#263762]" : "bg-green-50 text-green-700"}`}>{mensaje.texto}</div>;
}

export default Toast;