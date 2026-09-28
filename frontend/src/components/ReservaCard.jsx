//esta es la tarjeta de cada RESERVA, recibe el objeto reserva y la funcion onCancelar como props
function ReservaCard({ reserva, onCancelar }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="h-20 flex items-center justify-between px-5 text-white" style={{ background: reserva.espacioCover }}><span className="text-3xl">{reserva.espacioIcon}</span><span className="text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-medium">Activa</span></div>
      <div className="p-5 flex flex-col flex-1"><h3 className="font-bold text-gray-900 text-lg">{reserva.espacioTitulo}</h3><p className="text-xs text-blue-600 font-medium mb-3">{reserva.espacioLugar}</p><div className="space-y-1 text-sm text-gray-600 mb-4 flex-1"><p><strong>Fecha:</strong> {reserva.fecha}</p><p><strong>Horario:</strong> {reserva.hora}</p><p><strong>Solicitante:</strong> {reserva.nombre}</p><p><strong>Motivo:</strong> {reserva.motivo}</p></div><button type="button" onClick={() => onCancelar(reserva.id)} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg border border-red-200 transition cursor-pointer">Cancelar reserva</button></div>
    </article>
  );
}

export default ReservaCard;