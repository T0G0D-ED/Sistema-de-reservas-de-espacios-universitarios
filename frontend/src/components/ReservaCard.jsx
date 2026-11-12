import { useState } from "react";

const etiquetasEstado = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};

function ReservaCard({ reserva, nombreUsuario, usuarioId, rolUsuario, onCancelar, onCambiarEstado }) {
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const fechaInicio = new Date(reserva.fecha_inicio);
  const fechaFin = new Date(reserva.fecha_fin);
  const fecha = fechaInicio.toLocaleDateString("es-CL");
  const horario = `${fechaInicio.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} - ${fechaFin.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`;
  const esGestor = rolUsuario === "ADMIN" || rolUsuario === "DOCENTE";
  const esPropietario = Number(reserva.usuario_id) === Number(usuarioId);
  const puedeCancelar = ["PENDIENTE", "APROBADA"].includes(reserva.estado)
    && (rolUsuario === "ADMIN" || esPropietario);
  const solicitante = esGestor ? reserva.usuario_nombre : nombreUsuario;

  async function rechazar(event) {
    event.preventDefault();
    if (!motivoRechazo.trim()) return;
    const actualizado = await onCambiarEstado(reserva.id, "RECHAZADA", motivoRechazo.trim());
    if (actualizado) {
      setMostrarRechazo(false);
      setMotivoRechazo("");
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex h-20 items-center justify-between bg-[#263762] px-5 text-white">
        <span className="text-lg font-semibold">{reserva.espacio_tipo}</span>
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {etiquetasEstado[reserva.estado] || reserva.estado}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-gray-900">{reserva.espacio_nombre}</h3>
        <p className="mb-3 text-xs font-medium text-blue-600">{reserva.edificio_nombre}</p>
        <div className="mb-4 flex-1 space-y-1 text-sm text-gray-600">
          <p><strong>Fecha:</strong> {fecha}</p>
          <p><strong>Horario:</strong> {horario}</p>
          <p><strong>Solicitante:</strong> {solicitante}</p>
          {esGestor && <p><strong>Correo:</strong> {reserva.usuario_email}</p>}
          <p><strong>Motivo:</strong> {reserva.motivo}</p>
          {reserva.motivo_rechazo && <p><strong>Motivo de rechazo:</strong> {reserva.motivo_rechazo}</p>}
        </div>
        {esGestor && reserva.estado === "PENDIENTE" && (
          <div className="mb-3 flex gap-2">
            <button type="button" onClick={() => onCambiarEstado(reserva.id, "APROBADA")} className="w-1/2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700">
              Aprobar
            </button>
            <button type="button" onClick={() => setMostrarRechazo((visible) => !visible)} className="w-1/2 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              Rechazar
            </button>
          </div>
        )}
        {mostrarRechazo && (
          <form onSubmit={rechazar} className="mb-3 space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Motivo del rechazo
              <input required value={motivoRechazo} onChange={(event) => setMotivoRechazo(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <button type="submit" disabled={!motivoRechazo.trim()} className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              Confirmar rechazo
            </button>
          </form>
        )}
        {puedeCancelar && (
          <button type="button" onClick={() => onCancelar(reserva.id)} className="w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">
            Cancelar reserva
          </button>
        )}
      </div>
    </article>
  );
}

export default ReservaCard;
