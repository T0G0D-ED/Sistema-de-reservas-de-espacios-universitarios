import { get, patch, post } from "./api";

export function listarReservas() {
  return get("/api/reservas");
}

export function crearReserva({ espacioId, fechaInicio, fechaFin, motivo }) {
  return post("/api/reservas", { espacioId, fechaInicio, fechaFin, motivo });
}

export function actualizarEstadoReserva(id, nuevoEstado, motivoRechazo) {
  return patch(`/api/reservas/${id}/estado`, { nuevoEstado, motivoRechazo });
}
