const etiquetasEvento = {
  CREADA: "Solicitud creada",
  APROBADA: "Solicitud aprobada",
  RECHAZADA: "Solicitud rechazada",
  CANCELADA: "Reserva cancelada",
};

function HistorialPage({
  reservas,
  reservaId,
  onSeleccionarReserva,
  eventos,
  cargando,
  error,
  onReintentar,
}) {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#263762]">Historial de reservas</h1>
        <p className="mt-1 text-gray-600">Consulta los eventos de auditoría registrados para una reserva.</p>
      </header>
      {reservas.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-600">No hay reservas para consultar.</p>
      ) : (
        <>
          <label className="mb-6 block max-w-2xl text-sm font-medium text-gray-700">
            Reserva
            <select
              value={reservaId}
              onChange={(event) => onSeleccionarReserva(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              {reservas.map((reserva) => (
                <option key={reserva.id} value={reserva.id}>
                  #{reserva.id} · {reserva.espacio_nombre} · {new Date(reserva.fecha_inicio).toLocaleString("es-CL")}
                </option>
              ))}
            </select>
          </label>
          {cargando ? (
            <p role="status" className="py-10 text-center text-gray-600">Cargando historial...</p>
          ) : error ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 py-8 text-center">
              <p className="text-red-700">{error}</p>
              <button type="button" onClick={onReintentar} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white">Reintentar</button>
            </div>
          ) : eventos.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-600">Esta reserva todavía no tiene eventos de auditoría.</p>
          ) : (
            <ol className="space-y-4">
              {eventos.map((evento) => (
                <li key={evento._id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-gray-900">{etiquetasEvento[evento.tipoEvento] || evento.tipoEvento}</h2>
                    <time className="text-sm text-gray-500">{new Date(evento.fecha).toLocaleString("es-CL")}</time>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Actor: {evento.actorEmail}</p>
                  {evento.metadata?.estadoAnterior && (
                    <p className="mt-1 text-sm text-gray-600">Estado anterior: {evento.metadata.estadoAnterior}</p>
                  )}
                  {evento.metadata?.motivoRechazo && (
                    <p className="mt-1 text-sm text-gray-600">Motivo: {evento.metadata.motivoRechazo}</p>
                  )}
                  {evento.metadata?.motivo && (
                    <p className="mt-1 text-sm text-gray-600">Motivo de reserva: {evento.metadata.motivo}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}

export default HistorialPage;
