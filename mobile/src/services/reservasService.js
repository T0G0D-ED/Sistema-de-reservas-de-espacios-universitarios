import { get, patch, post } from "./api";

export function listarReservas() {
  return get("/api/reservas");
}

export async function listarDisponibilidad(espacioId, fechaInicio, fechaFin) {
  const params = new URLSearchParams({
    espacioId: String(espacioId),
    fechaInicio,
    fechaFin,
  });
  const data = await get(`/api/reservas/disponibilidad?${params.toString()}`);

  if (!Array.isArray(data)) {
    throw new Error("La API devolvió una disponibilidad no válida.");
  }

  return data;
}

export function crearReserva({ espacioId, fechaInicio, fechaFin, motivo }) {
  return post("/api/reservas", { espacioId, fechaInicio, fechaFin, motivo });
}

export function actualizarEstadoReserva(id, nuevoEstado, motivoRechazo) {
  return patch(`/api/reservas/${id}/estado`, { nuevoEstado, motivoRechazo });
}
