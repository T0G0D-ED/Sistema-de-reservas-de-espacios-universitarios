import ReservaCard from "../components/ReservaCard";

function ReservasPage({
  reservas,
  cargando,
  error,
  esGestor,
  nombreUsuario,
  usuarioId,
  rolUsuario,
  onCancelar,
  onCambiarEstado,
  onReintentar,
}) {
  if (cargando) {
    return <p role="status" className="py-16 text-center text-gray-600">Cargando solicitudes...</p>;
  }

  if (error) {
    return (
      <section role="alert" className="py-10 text-center bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={onReintentar} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reintentar</button>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#263762]">{esGestor ? "Solicitudes de reserva" : "Mis reservas"}</h1>
        <p className="mt-1 text-gray-600">
          {esGestor
            ? "Revisa las solicitudes y administra su estado."
            : "Revisa el estado de tus solicitudes activas o cancela reservas registradas."}
        </p>
      </header>
      {reservas.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <span className="mb-3 block text-5xl">📅</span>
          <p className="text-lg font-semibold text-gray-700">{esGestor ? "No hay solicitudes registradas" : "No tienes reservas registradas"}</p>
          <p className="mt-1 text-sm text-gray-500">Las solicitudes creadas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              nombreUsuario={nombreUsuario}
              usuarioId={usuarioId}
              rolUsuario={rolUsuario}
              onCancelar={onCancelar}
              onCambiarEstado={onCambiarEstado}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ReservasPage;
