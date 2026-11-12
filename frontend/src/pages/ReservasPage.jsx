import ReservaCard from "../components/ReservaCard";

function ReservasPage({ reservas, onCancelar }) {
  return <section><div className="mb-6"><h1 className="text-2xl font-bold text-[#263762]">Mis Reservas</h1><p className="text-gray-600 mt-1">Revisa el estado de tus solicitudes activas o cancela reservas registradas.</p></div>{reservas.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm"><span className="text-5xl block mb-3">📅</span><p className="text-gray-700 font-semibold text-lg">No tienes reservas registradas</p><p className="text-gray-500 text-sm mt-1">Selecciona un espacio disponible para realizar tu primera solicitud.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{reservas.map((reserva) => <ReservaCard key={reserva.id} reserva={reserva} onCancelar={onCancelar} />)}</div>}</section>;
}

export default ReservasPage;